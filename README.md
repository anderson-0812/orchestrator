# COMANDOS PARA GENERAR (MONOREPO DESDE CERO)

> Ejecutar todo en la raíz del repo (misma carpeta donde quedará el proyecto).

## Instalar Nest CLI (si ya etsa esto podemos omitirlo)
npm i -g @nestjs/cli

## Crear proyecto Nest en la carpeta actual
nest new .

## Generar apps (microservicios) y librería compartida
nest g app customers-api
nest g app orders-api
nest g app lambda-orchestrator
nest g lib common

## Eliminar el src raíz (ya no se usa en monorepo)
rm -rf src


# ESTRUCTURA DEL PROYECTO

apps/
  customers-api/   → microservicio 1
  lambda-orchestrator/     → orquestador (“lambda”)
  orders-api/      → microservicio 2

libs/
  common/      → código compartido


# SCRIPTS PARA ARRANCAR (recomendado en package.json)

"start:customers": "nest start customers-api --watch"
"start:orders": "nest start orders-api --watch"
"start:orchestrator": "nest start lambda-orchestrator --watch"


# COMANDOS PARA EJECUTAR

npm run start:customers
npm run start:orders
npm run start:orchestrator


# paqueets a instalar para als valdiacioens de dtos type orm y etidades y la libreria para usar mysql
npm install @nestjs/typeorm typeorm reflect-metadata
npm install class-validator class-transformer
npm install @nestjs/mapped-types
npm install mysql2


# para generar un modulo completo en un microservicio
cd apps/customers-api
nest g resource src/modules/admin/customers


# configurar el appmodule de cada microservicio para que tenga la configuracion de typeorm y las entidades

import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
  imports: [TypeOrmModule.forFeature([Customer])],

})
export class CustomersModule { }

# configurar la conexion a la base en el appmodule principal

import { Module } from '@nestjs/common';
import { CustomersApiModule } from './customers-api.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), 'apps/customers-api/.env'),
    }),
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
    CustomersApiModule,
  ],
})
export class AppModule { }