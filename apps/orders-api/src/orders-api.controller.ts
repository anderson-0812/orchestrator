import { Controller, Get } from '@nestjs/common';
import { OrdersApiService } from './orders-api.service';

@Controller()
export class OrdersApiController {
  constructor(private readonly ordersApiService: OrdersApiService) {}

  @Get()
  getHello(): string {
    return this.ordersApiService.getHello();
  }

  @Get('health')
  health() {
    return {
      status: 'OK',
      message: 'Orders API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
