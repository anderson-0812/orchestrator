#  Orchestrator - Sistema de Gestión de Pedidos B2B

Sistema distribuido de microservicios para gestión de clientes, órdenes y productos con arquitectura basada en NestJS y orquestación mediante AWS Lambda.

##  Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [APIs Disponibles](#apis-disponibles)
- [Documentación](#documentación)
- [Testing](#testing)

## Descripción

El **Orchestrator** es un sistema de microservicios diseñado para gestionar el flujo completo de creación y confirmación de órdenes. Consta de tres componentes principales:

1. **Customers API** - Gestión de clientes y validación
2. **Orders API** - Manejo de órdenes, productos y stock
3. **Lambda Orchestrator** - Orquestación del flujo de creación y confirmación de órdenes

### Características Principales

-  **Arquitectura de Microservicios** - Cada servicio es independiente y escalable
-  **Validación Robusta** - Validación de datos con class-validator
-  **Gestión de Stock** - Control automático de inventario con transacciones
-  **Idempotencia** - Sistema de claves idempotentes para operaciones críticas
-  **Paginación Cursor-based** - Paginación eficiente para grandes volúmenes
-  **CORS Habilitado** - Listo para integraciones frontend
-  **Health Checks** - Endpoints de monitoreo para cada servicio

## 🏗️ Arquitectura

```
┌─────────────────────┐
│ Lambda Orchestrator │ ← Puerto 3010
│   (Serverless)      │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌────────┐
│Customer│   │ Orders │
│  API   │   │  API   │
│ :3001  │   │ :3002  │
└───┬────┘   └───┬────┘
    │            │
    └─────┬──────┘
          ▼
    ┌──────────┐
    │  MySQL   │
    │ Database │
    └──────────┘
```

## Requisitos Previos

- **Node.js** >= 22.0.0
- **npm** >= 8.0.0
- **MySQL** >= 8.0
- **Nest CLI** (opcional pero recomendado)

```bash
npm install -g @nestjs/cli
```

## Instalación

1. **Clonar el repositorio**:
```bash
git clone <repository-url>
cd orchestrator
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Instalar dependencias adicionales**:
```bash
# TypeORM y validaciones
npm install @nestjs/typeorm typeorm reflect-metadata
npm install class-validator class-transformer
npm install @nestjs/mapped-types

# Base de datos y HTTP
npm install mysql2 axios

# Lambda Orchestrator (solo si no está instalado)
cd apps/lambda-orchestrator
npm install
cd ../..
```

## Configuración

### Base de Datos

Crear una base de datos MySQL:

```sql
CREATE DATABASE orchestrator;
USE orchestrator;
```

### Variables de Entorno

Cada servicio necesita su archivo `.env`:

#### `apps/customers-api/.env`
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=orchestrator
SYNCHRONIZE=TRUE
SERVICE_TOKEN=internal-service-token
```

#### `apps/orders-api/.env`
```env
PORT=3002
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=orchestrator
SYNCHRONIZE=TRUE
SERVICE_TOKEN=internal-service-token
CUSTOMERS_API_BASE=http://localhost:3001
```

#### `apps/lambda-orchestrator/.env`
```env
CUSTOMERS_API_BASE=http://localhost:3001
ORDERS_API_BASE=http://localhost:3002
SERVICE_TOKEN=internal-service-token
```

> ⚠️ **IMPORTANTE**: En producción, cambiar `SYNCHRONIZE=FALSE` y usar migraciones.

## 🚀 Ejecución

### Desarrollo Local

**Opción 1: Ejecutar todos los servicios (recomendado)**

```bash
# Terminal 1 - Customers API
npm run start:customers

# Terminal 2 - Orders API
npm run start:orders

# Terminal 3 - Lambda Orchestrator
cd apps/lambda-orchestrator
npm run dev
```

**Opción 2: Scripts individuales**

```bash
# Solo Customers API
npm run start:customers

# Solo Orders API
npm run start:orders

# Solo Orchestrator
npm run start:orchestrator
```

### Verificar que los servicios están corriendo

```bash
# Health check Customers API
curl http://localhost:3001

# Health check Orders API
curl http://localhost:3002/health

# Orchestrator
curl http://localhost:3010
```

## Estructura del Proyecto

```
orchestrator/
├── apps/
│   ├── customers-api/          # API de gestión de clientes
│   │   ├── src/
│   │   │   ├── modules/admin/customers/   # Módulo de clientes
│   │   │   ├── customers-api.module.ts
│   │   │   └── main.ts
│   │   ├── openapi.yaml        # Documentación OpenAPI
│   │   └── README.md
│   │
│   ├── orders-api/             # API de gestión de órdenes
│   │   ├── src/
│   │   │   ├── modules/admin/
│   │   │   │   ├── order/      # Módulo de órdenes
│   │   │   │   ├── product/    # Módulo de productos
│   │   │   │   └── order-product/  # Relación orden-producto
│   │   │   ├── orders-api.module.ts
│   │   │   └── main.ts
│   │   ├── openapi.yaml
│   │   └── README.md
│   │
│   └── lambda-orchestrator/    # Orquestador Lambda
│       ├── src/
│       │   ├── handler.js      # Handler principal
│       │   └── utils/httpClient.js  # Cliente HTTP
│       ├── serverless.yml
│       └── README.md
│
├── libs/
│   └── common/                 # Código compartido
│       └── globs/generals/
│
├── nest-cli.json              # Configuración Nest CLI
├── package.json
└── README.md
```

## APIs Disponibles

### Customers API (Puerto 3001)

- `POST /admin/customers/create-customer` - Crear cliente
- `GET /admin/customers/find-all` - Listar clientes
- `GET /admin/customers/find-one/:id` - Obtener cliente
- `GET /admin/customers/internal/customers/:id` - Endpoint interno

[Ver documentación completa](./apps/customers-api/README.md) | [OpenAPI Spec](./apps/customers-api/openapi.yaml)

### Orders API (Puerto 3002)

- `GET /health` - Health check
- `POST /admin/orders/create-order` - Crear orden
- `POST /admin/orders/:id/confirm` - Confirmar orden
- `POST /admin/orders/:id/cancel` - Cancelar orden  
- `GET /admin/orders/find-all` - Listar órdenes
- `GET /admin/orders/find-one/:id` - Obtener orden

 [Ver documentación completa](./apps/orders-api/README.md) | [OpenAPI Spec](./apps/orders-api/openapi.yaml)

### Lambda Orchestrator (Puerto 3010)

- `POST /orchestrator/create-and-confirm-order` - Flujo completo

📄 [Ver documentación completa](./apps/lambda-orchestrator/README.md)

## Documentación

- **OpenAPI/Swagger**: Cada API tiene su especificación OpenAPI en formato YAML
- **Postman**: Importar los archivos `openapi.yaml` directamente en Postman
- **READMEs**: Cada servicio tiene documentación detallada con ejemplos

## Testing

### Ejemplo Completo: Crear y Confirmar Orden

**1. Crear un cliente**:
```bash
curl -X POST http://localhost:3001/admin/customers/create-customer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corporation",
    "email": "ops@acme.com",
    "phone": "+1234567890"
  }'
```

**2. Usar el orchestrator** (recomendado):
```bash
curl -X POST http://localhost:3010/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 1, "qty": 2},
      {"product_id": 2, "qty": 1}
    ],
    "idempotency_key": "unique-key-123",
    "correlation_id": "req-456"
  }'
```

**3. O crear orden manualmente**:
```bash
# Crear orden
curl -X POST http://localhost:3002/admin/orders/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 2}]
  }'

# Confirmar orden (usar el ID de la respuesta anterior)
curl -X POST http://localhost:3002/admin/orders/101/confirm \
  -H "X-Idempotency-Key: unique-key-789"
```

## Solución de Problemas

### Los servicios no inician

1. Verificar que MySQL está corriendo
2. Verificar las credenciales en archivos `.env`
3. Verificar que los puertos 3001, 3002, 3010 estén disponibles

### Error 404 en Orders API

1. Verificar que el servicio está corriendo: `curl http://localhost:3002/health`
2. Reiniciar el servicio si es necesario
3. Verificar logs en la terminal

### Error de validación de cliente

Asegurarse de que:
- Customers API está corriendo en puerto 3001
- El `SERVICE_TOKEN` coincide en todos los servicios
- El `customer_id` existe en la base de datos
