import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { ILike, MoreThan, Repository } from 'typeorm';
import { FilterCustomerDto } from './dto/filter-customer.dto';
import { ErrorCode } from 'libs/common/globs/generals/error-codes';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) { }

  async create(createCustomerDto: CreateCustomerDto) {
    try {

      if(!createCustomerDto.identityCard){
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'Debe proporcionar un número de identificación',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if(!createCustomerDto.email){
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'Debe proporcionar un correo electrónico',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if(!createCustomerDto.phone){
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'Debe proporcionar un número de teléfono',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const customerExists = await this.customerRepository.findOne({ where: { identityCard: createCustomerDto.identityCard } });
      if (customerExists) {
        throw new HttpException(
          {
            errorCode: ErrorCode.ERROR_SERVER,
            message: 'El cliente ya existe',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const customer = this.customerRepository.create(createCustomerDto);
      const customerCreated = await this.customerRepository.save(customer);
      return { errorCode: ErrorCode.NONE, data: customerCreated, message: 'Clientes creado' };

    } catch (error) {

      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al crear el cliente',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(filterCustomerDto: FilterCustomerDto) {
    try {
      const { limit = 20, cursor, search = '', isActive=null } = filterCustomerDto;

      let searchWhere = search
        ? [
          { identityCard: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
          { phone: ILike(`%${search}%`) },
          { firstName: ILike(`%${search}%`) },
          { lastName: ILike(`%${search}%`) },
        ]
        : [{}];

      if (isActive !== undefined && isActive !== null) {
        searchWhere = [...searchWhere, { isActive: isActive }];
      }

      const where = cursor
        ? searchWhere.map((condition) => ({
          ...condition,
          id: MoreThan(cursor),
        }))
        : searchWhere;

      console.log(where);
      const customers = await this.customerRepository.find({
        where,
        take: Number(limit) + 1, // +1 para saber si hay siguiente pagina 
        order: { id: 'ASC' },
      });

      const hasNext = customers.length > Number(limit); // valido si hay siguiente pagina 
      const data = hasNext ? customers.slice(0, Number(limit)) : customers; // devuelvo solo los que el limit pedia 

      return {
        errorCode: ErrorCode.NONE,
        data,
        message: 'Clientes encontrados',
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
          message: 'Error al buscar los clientes',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllTotal(filterCustomerDto: FilterCustomerDto) {
    try {
      const { search = '', isActive=null } = filterCustomerDto;

      let where = search
        ? [
          { identityCard: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
          { phone: ILike(`%${search}%`) },
          { firstName: ILike(`%${search}%`) },
          { lastName: ILike(`%${search}%`) },
        ]
        : {};

      if (isActive !== undefined && isActive !== null) {
        where = Array.isArray(where) ? [...where, { isActive: isActive }] : { ...where, isActive: isActive };
      }

      const customers = await this.customerRepository.count({
        where: where,
      });
      return { errorCode: ErrorCode.NONE, data: customers, message: 'Clientes encontrados' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al buscar los clientes',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findCustomerByParameters(filterCustomerDto: FilterCustomerDto) {
    try {
      const where: any = {};

      if (filterCustomerDto.identityCard) where.identityCard = filterCustomerDto.identityCard;
      if (filterCustomerDto.email) where.email = filterCustomerDto.email;
      if (filterCustomerDto.phone) where.phone = filterCustomerDto.phone;

      if (filterCustomerDto.firstName) where.firstName = ILike(`%${filterCustomerDto.firstName}%`);
      if (filterCustomerDto.lastName) where.lastName = ILike(`%${filterCustomerDto.lastName}%`);
      if (filterCustomerDto.isActive !== undefined && filterCustomerDto.isActive !== null) where.isActive = filterCustomerDto.isActive;


      const customers = await this.customerRepository.find({ where });

      return { errorCode: ErrorCode.NONE, data: customers, message: 'Cliente encontrado' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al buscar el cliente',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const customer = await this.customerRepository.findOne({ where: { id } });
      return { errorCode: ErrorCode.NONE, data: customer, message: 'Cliente encontrado' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al buscar el cliente',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    try {
      const customer = await this.customerRepository.update(id, updateCustomerDto);
      return { errorCode: ErrorCode.NONE, data: customer.affected, message: 'Cliente actualizado' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al actualizar el cliente',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logicDelete(id: number) {
    try {
      const customer = await this.customerRepository.update(id, { isActive: false });
      return { errorCode: ErrorCode.NONE, data: customer.affected, message: 'Cliente eliminado' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorCode.ERROR_SERVER,
          message: 'Error al eliminar el cliente',
          data: error?.message ?? error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
