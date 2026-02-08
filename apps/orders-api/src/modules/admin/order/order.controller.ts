import { Controller, Get, Post, Body, Patch, Param, Query, Headers } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';

@Controller('admin/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create-order')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get('find-all')
  findAll(@Query() filterOrderDto: FilterOrderDto) {
    return this.orderService.findAll(filterOrderDto);
  }

  @Get('find-one/:id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Post(':id/confirm')
  confirm(
    @Param('id') id: string,
    @Headers('x-idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new Error('X-Idempotency-Key header es requerido');
    }
    return this.orderService.confirm(+id, idempotencyKey);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.orderService.cancel(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }
}
