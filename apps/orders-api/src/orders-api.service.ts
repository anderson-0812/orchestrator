import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
