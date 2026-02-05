import { Controller, Get } from '@nestjs/common';
import { OrchestService } from './orchest.service';

@Controller()
export class OrchestController {
  constructor(private readonly orchestService: OrchestService) {}

  @Get()
  getHello(): string {
    return this.orchestService.getHello();
  }
}
