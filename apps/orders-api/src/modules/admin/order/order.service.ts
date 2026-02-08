import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, MoreThan, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { Order } from './entities/order.entity';
import { OrderProduct } from '../order-product/entities/order-product.entity';
import { Product } from '../product/entities/product.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { ErrorCode } from 'libs/common/globs/generals/error-codes';
import { StatusOrder } from 'libs/common/globs/generals/status-order';
import axios from 'axios';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyKeyRepository: Repository<IdempotencyKey>,
    private readonly dataSource: DataSource,
  ) { }

  //  FLUHJO =>  Crear orden - valida cliente, verifica stock, crea orden y descuenta stock
  async create(createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar cliente en Customers API
      const customersApiUrl = process.env.CUSTOMERS_API_BASE || 'http://localhost:3001';
      const serviceToken = process.env.SERVICE_TOKEN || 'internal-service-token';

      let customer;
      try {
        const customerResponse = await axios.get(
          `${customersApiUrl}/internal/customers/${createOrderDto.customer_id}`,
          {
            headers: { Authorization: `Bearer ${serviceToken}` },
          }
        );
        customer = customerResponse.data.data;

        if (!customer) {
          throw new HttpException(
            {
              errorCode: ErrorCode.ERROR_SERVER,
              message: 'Cliente no encontrado',
              data: null,
            },
            HttpStatus.NOT_FOUND,
          );
        }
      } catch (error) {
        console.error('Error validando cliente:', error);
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'Error al validar el cliente',
            data: error?.message ?? error,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Verificar stock y obtener productos
      const productsData: Array<{
        product: Product;
        qty: number;
        unitPriceCents: number;
        subtotalCents: number;
      }> = [];
      let totalCents = 0;

      for (const item of createOrderDto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.product_id },
        });

        if (!product) {
          throw new HttpException(
            {
              errorCode: ErrorCode.ERROR_SERVER,
              message: `Producto con ID ${item.product_id} no encontrado`,
              data: null,
            },
            HttpStatus.NOT_FOUND,
          );
        }

        if (product.stock < item.qty) {
          throw new HttpException(
            {
              errorCode: ErrorCode.ERROR_SERVER,
              message: `Stock insuficiente para producto ${product.name}. Stock disponible: ${product.stock}`,
              data: null,
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        const subtotalCents = product.priceCents * item.qty;
        totalCents += subtotalCents;

        productsData.push({
          product,
          qty: item.qty,
          unitPriceCents: product.priceCents,
          subtotalCents,
        });
      }

      // 3. Crear orden
      const nroOrder = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const order = queryRunner.manager.create(Order, {
        customerId: createOrderDto.customer_id,
        totalCents,
        status: StatusOrder.CREATED,
        // SUMO AL CANTIDADE TOTAL DE PRODUCTOS
        cantProducts: createOrderDto.items.reduce((sum, item) => sum + item.qty, 0),
        nroOrder,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // 4. Crear order_items y descontar stock
      const orderItems: OrderProduct[] = [];
      for (const data of productsData) {
        const orderProduct = queryRunner.manager.create(OrderProduct, {
          orderId: savedOrder.id,
          productId: data.product.id,
          qty: data.qty,
          unitPriceCents: data.unitPriceCents,
          subtotalCents: data.subtotalCents,
        });

        const savedOrderProduct = await queryRunner.manager.save(orderProduct);
        orderItems.push(savedOrderProduct);

        // Descontar stock
        await queryRunner.manager.update(
          Product,
          { id: data.product.id },
          { stock: data.product.stock - data.qty }
        );
      }

      await queryRunner.commitTransaction();

      // Retornar orden con items
      const orderWithItems = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['orderProducts', 'orderProducts.product'],
      });

      return {
        errorCode: ErrorCode.NONE,
        data: orderWithItems,
        message: 'Orden creada exitosamente',
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creando orden:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al crear la orden',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  //  FLUJO => Confirmar orden con idempotencia
  async confirm(orderId: number, idempotencyKey: string) {
    try {
      // 1. Verificar idempotencia
      const existingKey = await this.idempotencyKeyRepository.findOne({
        where: { key: idempotencyKey },
      });

      if (existingKey) {
        // Retornar la respuesta guardada
        return JSON.parse(existingKey.responseBody);
      }

      // 2. Validar que la orden exista y esté en CREATED
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['orderProducts', 'orderProducts.product'],
      });

      if (!order) {
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'Orden no encontrada',
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (order.status !== StatusOrder.CREATED) {
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: `La orden ya está en estado ${StatusOrder[order.status]}`,
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Cambiar estado a CONFIRMED
      await this.orderRepository.update(
        { id: orderId },
        { status: StatusOrder.CONFIRMED }
      );

      // Obtener orden actualizada
      const confirmedOrder = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['orderProducts', 'orderProducts.product'],
      });

      const response = {
        errorCode: ErrorCode.NONE,
        data: confirmedOrder,
        message: 'Orden confirmada exitosamente',
      };

      // 4. Guardar en idempotency_keys
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expira en 24 horas

      const idempotencyRecord = this.idempotencyKeyRepository.create({
        key: idempotencyKey,
        targetType: 'order_confirm',
        targetId: orderId,
        status: 'completed',
        responseBody: JSON.stringify(response),
        expiresAt,
        isActive: 1,
      });

      await this.idempotencyKeyRepository.save(idempotencyRecord);

      return response;

    } catch (error) {
      console.error('Error confirmando orden:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al confirmar la orden',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //  FLUJO => Cancelar orden - restaura stock según reglas
  async cancel(orderId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ['orderProducts'],
      });

      if (!order) {
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'Orden no encontrada',
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (order.status === StatusOrder.CANCELED) {
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'La orden ya está cancelada',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validar reglas de cancelación
      if (order.status === StatusOrder.CONFIRMED) {
        const now = new Date();
        const createdAt = new Date(order.createdAt);
        const minutesDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60);

        if (minutesDiff > 10) {
          throw new HttpException(
            {
              errorCode: ErrorCode.ERROR_SERVER,
              message: 'No se puede cancelar una orden confirmada después de 10 minutos',
              data: null,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Restaurar stock
      for (const item of order.orderProducts) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (product) {
          await queryRunner.manager.update(
            Product,
            { id: item.productId },
            { stock: product.stock + item.qty }
          );
        }
      }

      // Cambiar estado a CANCELED
      await queryRunner.manager.update(
        Order,
        { id: orderId },
        { status: StatusOrder.CANCELED }
      );

      await queryRunner.commitTransaction();

      const canceledOrder = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['orderProducts', 'orderProducts.product'],
      });

      return {
        errorCode: ErrorCode.NONE,
        data: canceledOrder,
        message: 'Orden cancelada exitosamente',
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error cancelando orden:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al cancelar la orden',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  //  FLUJO => Obtener una orden por ID con items
  async findOne(id: number) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['orderProducts', 'orderProducts.product'],
      });

      if (!order) {
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'Orden no encontrada',
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        errorCode: ErrorCode.NONE,
        data: order,
        message: 'Orden encontrada',
      };
    } catch (error) {
      console.error('Error buscando orden:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al buscar la orden',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //  FLUJO => Listar órdenes con filtros y paginación
  async findAll(filterOrderDto: FilterOrderDto) {
    try {
      const { limit = 20, cursor, status, from, to } = filterOrderDto;

      const where: any = {};

      if (status !== undefined && status !== null) {
        where.status = status;
      }

      if (from && to) {
        where.createdAt = Between(new Date(from), new Date(to));
      } else if (from) {
        where.createdAt = MoreThan(new Date(from));
      }

      if (cursor) {
        where.id = MoreThan(cursor);
      }

      const orders = await this.orderRepository.find({
        where,
        relations: ['orderProducts', 'orderProducts.product'],
        take: Number(limit) + 1,
        order: { id: 'ASC' },
      });

      const hasNext = orders.length > Number(limit);
      const data = hasNext ? orders.slice(0, Number(limit)) : orders;

      return {
        errorCode: ErrorCode.NONE,
        data,
        message: 'Órdenes encontradas',
        meta: {
          limit,
          cursor: cursor ?? null,
          nextCursor: hasNext ? data[data.length - 1].id : null,
          hasNext,
        },
      };
    } catch (error) {
      console.error('Error listando órdenes:', error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al listar las órdenes',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    try {
      const order = await this.orderRepository.update(id, updateOrderDto);
      return { errorCode: ErrorCode.NONE, data: order.affected, message: 'Orden actualizada' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al actualizar la orden',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
