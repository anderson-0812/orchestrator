import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomerDto } from './dto/filter-customer.dto';

@Controller('admin/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('create-customer')
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get('find-all')
  findAll() {
    return this.customersService.findAll();
  }

  @Patch('find-customer-by-parameters')
  findCustomerByParameters(@Body() filterCustomerDto: FilterCustomerDto) {
    return this.customersService.findCustomerByParameters(filterCustomerDto);
  }

  @Get('find-one/:id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(+id, updateCustomerDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(+id);
  }
}
