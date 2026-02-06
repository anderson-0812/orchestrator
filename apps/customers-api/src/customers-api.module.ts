import { Module } from '@nestjs/common';
import { CustomersController } from './customers-api.controller';
import { CustomersService } from './customers-api.service';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from './modules/admin/customers/customers.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CustomersModule,],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersApiModule {}
