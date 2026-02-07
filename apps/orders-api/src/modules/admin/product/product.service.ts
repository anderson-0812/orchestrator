import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ILike, MoreThan, Repository } from 'typeorm';
import { FilterProductDto } from './dto/filter-product.dto';
import { ErrorCode } from 'libs/common/globs/generals/error-codes';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      if (!createProductDto.sku) {
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'Debe proporcionar un SKU o codigo  del producto ',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const productExists = await this.productRepository.findOne({ where: { sku: createProductDto.sku } });
      if (productExists) {
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'El producto ya existe con ese codigo',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const product = this.productRepository.create(createProductDto);
      const productCreated = await this.productRepository.save(product);
      return { errorCode: ErrorCode.NONE, data: productCreated, message: 'Producto creado' };

    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al crear el producto',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(filterProductDto: FilterProductDto) {
    try {
      const { limit = 20, cursor, search = '', isActive = null } = filterProductDto;

      let searchWhere = search
        ? [
          { sku: ILike(`%${search}%`) },
          { name: ILike(`%${search}%`) },
        ]
        : [{}];

      if (isActive !== undefined && isActive !== null) {
        searchWhere = searchWhere.map((condition) => ({
          ...condition,
          isActive: isActive,
        }));
      }

      const where = cursor
        ? searchWhere.map((condition) => ({
          ...condition,
          id: MoreThan(cursor),
        }))
        : searchWhere;

      console.log(where);
      const products = await this.productRepository.find({
        where,
        take: Number(limit) + 1, // +1 para saber si hay siguiente pagina 
        order: { id: 'ASC' },
      });

      const hasNext = products.length > Number(limit); // valido si hay siguiente pagina 
      const data = hasNext ? products.slice(0, Number(limit)) : products; // devuelvo solo los que el limit pedia 

      return {
        errorCode: ErrorCode.NONE,
        data,
        message: 'Productos encontrados',
        meta: {
          limit,
          cursor: cursor ?? null,
          nextCursor: hasNext ? data[data.length - 1].id : null,
          hasNext,
        },
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al buscar los productos',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllTotal(filterProductDto: FilterProductDto) {
    try {
      const { search = '', isActive = null } = filterProductDto;

      let where = search
        ? [
          { sku: ILike(`%${search}%`) },
          { name: ILike(`%${search}%`) },
        ]
        : {};

      if (isActive !== undefined && isActive !== null) {
        where = Array.isArray(where) ? where.map((w) => ({ ...w, isActive: isActive })) : { ...where, isActive: isActive };
      }

      const products = await this.productRepository.count({
        where: where,
      });
      return { errorCode: ErrorCode.NONE, data: products, message: 'Total de productos' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al buscar los productos',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findProductByParameters(filterProductDto: FilterProductDto) {
    try {
      const where: any = {};

      if (filterProductDto.search) {
        where.name = ILike(`%${filterProductDto.search}%`);
      }

      if (filterProductDto.isActive !== undefined && filterProductDto.isActive !== null) {
        where.isActive = filterProductDto.isActive;
      }

      const products = await this.productRepository.find({ where });

      return { errorCode: ErrorCode.NONE, data: products, message: 'Producto encontrado' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al buscar el producto',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      return { errorCode: ErrorCode.NONE, data: product, message: 'Producto encontrado' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al buscar el producto',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.update(id, updateProductDto);
      return { errorCode: ErrorCode.NONE, data: product.affected, message: 'Producto actualizado' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al actualizar el producto',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logicDelete(id: number) {
    try {
      const product = await this.productRepository.update(id, { isActive: false });
      return { errorCode: ErrorCode.NONE, data: product.affected, message: 'Producto eliminado' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al eliminar el producto',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
