import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { FilterCustomerDto } from './dto/filter-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) { }

  create(createCustomerDto: CreateCustomerDto) {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  findAll() {
    return this.customerRepository.find();
  }

  findCustomerByParameters(filterCustomerDto: FilterCustomerDto) {
    return this.customerRepository.find({ where: filterCustomerDto });
  }

  findOne(id: number) {
    return this.customerRepository.findOne({ where: { id } });
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.customerRepository.update(id, updateCustomerDto);
  }

  remove(id: number) {
    return this.customerRepository.delete(id);
  }
}
