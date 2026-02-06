import { Module } from '@nestjs/common';
import { CustomersController } from './customers-api.controller';
import { CustomersService } from './customers-api.service';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from './modules/admin/customers/customers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path'; // para monorepo
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: '.env',// para un solos ervicio
      envFilePath: join(process.cwd(), 'apps/customers-api/.env'), // para monorepo
    }),

    // DB
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      autoLoadEntities: true,
      synchronize: process.env.SYNCHRONIZE === 'TRUE',
    }),
    CustomersModule,],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersApiModule {}
