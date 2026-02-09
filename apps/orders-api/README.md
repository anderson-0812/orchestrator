# 📦 Orders API

API REST para gestión de órdenes, productos y control de stock con soporte para idempotencia y paginación cursor-based.

## 🎯 Características

- ✅ Creación de órdenes con validación de clientes
- ✅ Gestión de stock automática con transacciones
- ✅ Confirmación idempotente de órdenes
- ✅ Sistema de cancelación con reglas de negocio
- ✅ Paginación eficiente tipo cursor
- ✅ Validación robusta con ValidationPipe
- ✅ CORS habilitado

## 🚀 Inicio Rápido

### Requisitos

- Node.js >= 22.0.0
- MySQL >= 8.0
- Customers API corriendo en puerto 3001

### Instalación

```bash
# Desde la raíz del proyecto
npm install

# Configurar .env
cp apps/orders-api/.env.example apps/orders-api/.env
# Editar con tus credenciales
```

### Configuración

Crear `apps/orders-api/.env`:

```env
PORT=3002
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_NAME=orchestrator
SYNCHRONIZE=TRUE
SERVICE_TOKEN=internal-service-token
CUSTOMERS_API_BASE=http://localhost:3001
```

### Ejecución

```bash
# Desde la raíz del proyecto
npm run start:orders

# El servicio estará disponible en http://localhost:3002
```

## 📖 API Endpoints

### Health Check

#### GET `/health`

Verifica que el servicio está corriendo.

**Ejemplo cURL**:
```bash
curl http://localhost:3002/health
```

**Respuesta**:
```json
{
  "status": "OK",
  "message": "Orders API is running",
  "timestamp": "2026-02-09T01:55:19.854Z"
}
```

---

### Crear Orden

#### POST `/admin/orders/create-order`

Crea una nueva orden validando el cliente, verificando stock y descontando inventario.

**Flujo**:
1. ✅ Valida que el cliente existe (llamada a Customers API)
2. ✅ Verifica stock disponible para cada producto
3. ✅ Crea la orden y sus items
4. ✅ Descuenta stock automáticamente
5. ✅ Todo en una transacción (rollback automático si falla)

**Request Body**:
```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "qty": 2
    },
    {
      "product_id": 2,
      "qty": 1
    }
  ]
}
```

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:3002/admin/orders/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 1, "qty": 2},
      {"product_id": 2, "qty": 1}
    ]
  }'
```

**Respuesta Exitosa (201)**:
```json
{
  "errorCode": 0,
  "message": "Orden creada exitosamente",
  "data": {
    "id": 101,
    "customerId": 1,
    "status": 1,
    "totalCents": 389700,
    "cantProducts": 3,
    "nroOrder": "ORD-7437692854",
    "createdAt": "2026-02-09T01:57:41.000Z",
    "orderProducts": [
      {
        "id": 1,
        "orderId": 101,
        "productId": 1,
        "qty": 2,
        "unitPriceCents": 129900,
        "subtotalCents": 259800,
        "product": {
          "id": 1,
          "sku": "PROD-001",
          "name": "Producto 1",
          "priceCents": 129900,
          "stock": 48
        }
      }
    ]
  }
}
```

**Errores Posibles**:
- `404` - Cliente o producto no encontrado
- `400` - Stock insuficiente
- `400` - Datos inválidos

---

### Confirmar Orden

#### POST `/admin/orders/{id}/confirm`

Confirma una orden creada previamente. **Implementa idempotencia** mediante el header `X-Idempotency-Key`.

**Headers**:
- `X-Idempotency-Key` (requerido): Clave única para evitar duplicados

**Reglas**:
- Solo órdenes con estado `CREATED` (1) pueden ser confirmadas
- La misma clave idempotente siempre retorna la misma respuesta
- Las claves expiran después de 24 horas

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:3002/admin/orders/101/confirm \
  -H "X-Idempotency-Key: unique-confirmation-key-123"
```

**Respuesta (200)**:
```json
{
  "errorCode": 0,
  "message": "Orden confirmada exitosamente",
  "data": {
    "id": 101,
    "status": 2,
    "customerId": 1,
    "totalCents": 389700,
    "nroOrder": "ORD-7437692854"
  }
}
```

---

### Cancelar Orden

#### POST `/admin/orders/{id}/cancel`

Cancela una orden y restaura el stock de productos.

**Reglas de Cancelación**:
- ✅ Órdenes `CREATED`: Se pueden cancelar siempre
- ⏰ Órdenes `CONFIRMED`: Solo dentro de los primeros 10 minutos
- ❌ Órdenes `CANCELED`: No se pueden volver a cancelar

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:3002/admin/orders/101/cancel
```

**Respuesta (200)**:
```json
{
  "errorCode": 0,
  "message": "Orden cancelada exitosamente",
  "data": {
    "id": 101,
    "status": 3,
    "customerId": 1,
    "totalCents": 389700
  }
}
```

---

### Listar Órdenes

#### GET `/admin/orders/find-all`

Lista órdenes con paginación cursor-based y filtros opcionales.

**Query Parameters**:
- `status` (opcional): Filtrar por estado (1=CREATED, 2=CONFIRMED, 3=CANCELED)
- `from` (opcional): Fecha desde (YYYY-MM-DD)
- `to` (opcional): Fecha hasta (YYYY-MM-DD)
- `limit` (opcional, default=20): Cantidad de resultados
- `cursor` (opcional): ID para continuar paginación

**Ejemplos cURL**:

```bash
# Listar primeras 20 órdenes
curl http://localhost:3002/admin/orders/find-all

# Filtrar solo confirmadas
curl "http://localhost:3002/admin/orders/find-all?status=2"

# Paginación (siguiente página)
curl "http://localhost:3002/admin/orders/find-all?cursor=120&limit=20"

# Rango de fechas
curl "http://localhost:3002/admin/orders/find-all?from=2026-02-01&to=2026-02-09"
```

**Respuesta (200)**:
```json
{
  "errorCode": 0,
  "message": "Órdenes encontradas",
  "data": [
    {
      "id": 101,
      "customerId": 1,
      "status": 2,
      "totalCents": 389700,
      "nroOrder": "ORD-7437692854",
      "createdAt": "2026-02-09T01:57:41.000Z"
    }
  ],
  "meta": {
    "limit": 20,
    "cursor": null,
    "nextCursor": 115,
    "hasNext": true
  }
}
```

---

### Obtener Orden por ID

#### GET `/admin/orders/find-one/{id}`

Obtiene el detalle completo de una orden específica.

**Ejemplo cURL**:
```bash
curl http://localhost:3002/admin/orders/find-one/101
```

**Respuesta (200)**:
```json
{
  "errorCode": 0,
  "message": "Orden encontrada",
  "data": {
    "id": 101,
    "customerId": 1,
    "status": 2,
    "totalCents": 389700,
    "cantProducts": 3,
    "nroOrder": "ORD-7437692854",
    "createdAt": "2026-02-09T01:57:41.000Z",
    "orderProducts": [
      {
        "id": 1,
        "qty": 2,
        "unitPriceCents": 129900,
        "subtotalCents": 259800,
        "product": {
          "id": 1,
          "name": "Producto 1",
          "sku": "PROD-001",
          "priceCents": 129900,
          "stock": 48
        }
      }
    ]
  }
}
```

---

## 📊 Estados de Orden

| Código | Estado      | Descripción                        |
|--------|-------------|------------------------------------|
| 1      | `CREATED`   | Orden creada, stock descontado     |
| 2      | `CONFIRMED` | Orden confirmada por el cliente    |
| 3      | `CANCELED`  | Orden cancelada, stock restaurado  |

## 🧪 Colección Postman

Puedes importar el archivo `openapi.yaml` directamente en Postman para tener todos los endpoints configurados.

1. Abrir Postman
2. Importar → Seleccionar `apps/orders-api/openapi.yaml`
3. Configurar Environment con:
   - `baseUrl`: http://localhost:3002

## 🔍 Solución de Problemas

### Error: "Cliente no encontrado"

- Verificar que Customers API está corriendo en puerto 3001
- Verificar que el `customer_id` existe en la base de datos
- Verificar que el `SERVICE_TOKEN` coincide en ambas APIs

### Error: "Stock insuficiente"

- Revisar la tabla `products` para ver stock disponible:
  ```sql
  SELECT id, name, stock FROM products;
  ```

### Error 404 en todos los endpoints

- Reiniciar el servicio: `npm run start:orders`
- Verificar que no hay procesos zombie en puerto 3002

## 📚 Documentación Adicional

- [OpenAPI Specification](./openapi.yaml)
- [Documentación Principal](../../README.md)
- [Customers API README](../customers-api/README.md)

---

**Puerto por defecto**: 3002  
**Base de datos**: orchestrator  
**Framework**: NestJS + TypeORM
