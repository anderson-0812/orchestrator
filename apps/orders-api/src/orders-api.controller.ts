import { Controller, Get } from '@nestjs/common';
import { OrdersService } from './orders-api.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getHello(): string {
    return this.ordersService.getHello();
  }
}
