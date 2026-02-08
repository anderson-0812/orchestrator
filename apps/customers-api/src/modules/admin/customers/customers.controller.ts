import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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
  findAll(@Query() filterCustomerDto: FilterCustomerDto) {
    return this.customersService.findAll(filterCustomerDto);
  }

  @Get('find-all-total')
  findAllTotal(@Query() filterCustomerDto: FilterCustomerDto) {
    return this.customersService.findAllTotal(filterCustomerDto);
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

  @Patch('logic-delete/:id')
  logicDelete(@Param('id') id: string) {
    return this.customersService.logicDelete(+id);
  }

  // Endpoint interno para validación desde Orders API
  @Get('internal/customers/:id')
  findOneInternal(@Param('id') id: string) {
    // NOTA: AUN no valido el SERVICE_TOKEN del header
    return this.customersService.findOne(+id);
  }

}
