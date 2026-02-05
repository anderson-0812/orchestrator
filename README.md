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
