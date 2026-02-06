import { Injectable } from '@nestjs/common';

@Injectable()
export class OrchestService {
  getHello(): string {
    return 'Hello World!';
  }
}
