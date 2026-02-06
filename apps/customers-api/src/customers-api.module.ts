import { Module } from '@nestjs/common';
import { CustomersController } from './customers-api.controller';
import { CustomersService } from './customers-api.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
