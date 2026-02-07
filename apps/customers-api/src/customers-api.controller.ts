import { Controller, Get } from '@nestjs/common';
import { CustomersApiService } from './customers-api.service';

@Controller()
export class CustomersApiController {
  constructor(private readonly customersApiService: CustomersApiService) {}

  @Get()
  getHello(): string {
    return this.customersApiService.getHello();
  }
}
