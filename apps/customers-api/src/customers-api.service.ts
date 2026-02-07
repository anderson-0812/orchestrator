import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomersApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
