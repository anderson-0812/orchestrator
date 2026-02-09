# 🔄 Lambda Orchestrator

Orquestador serverless para el flujo completo de creación y confirmación de órdenes. Coordina las llamadas entre Customers API y Orders API.

## 🎯 Propósito

El Lambda Orchestrator simplifica el proceso de crear y confirmar una orden en un solo endpoint, manejando:

- ✅ Validación de cliente (vía Customers API)
- ✅ Creación de orden (vía Orders API)
- ✅ Confirmación automática con idempotencia
- ✅ Manejo centralizado de errores
- ✅ Logging detallado para debugging

## 🏗️ Arquitectura

```
Cliente
  │
  └─► POST /orchestrator/create-and-confirm-order
       │
       ├─► Customers API: Validar cliente
       │
       ├─► Orders API: Crear orden
       │
       └─► Orders API: Confirmar orden
            │
            └─► Respuesta con orden confirmada
```

## 🚀 Inicio Rápido

### Requisitos

- Node.js >= 22.0.0
- Customers API corriendo en puerto 3001
- Orders API corriendo en puerto 3002

### Instalación

```bash
cd apps/lambda-orchestrator
npm install
```

### Configuración

Crear `.env` en `apps/lambda-orchestrator/`:

```env
CUSTOMERS_API_BASE=http://localhost:3001
ORDERS_API_BASE=http://localhost:3002
SERVICE_TOKEN=internal-service-token
```

### Ejecución Local

```bash
cd apps/lambda-orchestrator
npm run dev
```

El servicio estará disponible en `http://localhost:3010`

## 📖 API Endpoint

### Crear y Confirmar Orden

#### POST `/orchestrator/create-and-confirm-order`

Ejecuta el flujo completo: validar cliente → crear orden → confirmar orden.

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
  ],
  "idempotency_key": "unique-key-12345",
  "correlation_id": "req-67890"
}
```

**Campos**:
- `customer_id` (requerido): ID del cliente
- `items` (requerido): Array de productos y cantidades
- `idempotency_key` (requerido): Clave única para idempotencia
- `correlation_id` (requerido): ID de correlación para tracking

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:3010/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 1, "qty": 2},
      {"product_id": 2, "qty": 1}
    ],
    "idempotency_key": "order-2026-02-09-001",
    "correlation_id": "req-abc-123"
  }'
```

**Respuesta Exitosa (200)**:
```json
{
  "errorCode": 0,
  "message": "Orden creada y confirmada exitosamente",
  "data": {
    "order": {
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
            "priceCents": 129900
          }
        }
      ]
    },
    "confirmationDetails": {
      "confirmedAt": "2026-02-09T01:57:42.000Z",
      "idempotencyKey": "order-2026-02-09-001"
    }
  }
}
```

**Errores Posibles**:

```json
// 400 - Datos inválidos
{
  "errorCode": 400,
  "message": "Falta el campo requerido: customer_id",
  "data": null
}

// 500 - Error de integración
{
  "errorCode": 500,
  "message": "Validación de cliente falló: Cliente no encontrado",
  "data": null
}
```

## 🔄 Flujo Detallado

### Paso 1: Validación de Cliente

```javascript
// Llama a: GET /admin/customers/internal/customers/{customerId}
const customer = await httpClient.getCustomer(customer_id);
```

Si el cliente no existe o está inactivo, el flujo se detiene aquí.

### Paso 2: Creación de Orden

```javascript
// Llama a: POST /admin/orders/create-order
const order = await httpClient.createOrder(customer_id, items);
```

Crea la orden, verifica stock y lo descuenta automáticamente.

### Paso 3: Confirmación de Orden

```javascript
// Llama a: POST /admin/orders/{orderId}/confirm
const confirmedOrder = await httpClient.confirmOrder(
  order.id,
  idempotency_key
);
```

Confirma la orden usando la clave idempotente proporcionada.

## 🧪 Ejemplos de Testing

### Caso 1: Orden Simple

```bash
curl -X POST http://localhost:3010/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 1}],
    "idempotency_key": "test-001",
    "correlation_id": "test-corr-001"
  }'
```

### Caso 2: Orden Múltiple

```bash
curl -X POST http://localhost:3010/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 1, "qty": 2},
      {"product_id": 2, "qty": 1},
      {"product_id": 3, "qty": 5}
    ],
    "idempotency_key": "test-002",
    "correlation_id": "test-corr-002"
  }'
```

### Caso 3: Testing de Idempotencia

```bash
# Primera llamada
curl -X POST http://localhost:3010/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 1}],
    "idempotency_key": "same-key-123",
    "correlation_id": "req-001"
  }'

# Segunda llamada con MISMA clave idempotente
# Debería retornar la misma respuesta sin crear nueva orden
curl -X POST http://localhost:3010/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 1}],
    "idempotency_key": "same-key-123",
    "correlation_id": "req-002"
  }'
```

## 📊 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 0 | Éxito |
| 400 | Datos de entrada inválidos |
| 404 | Cliente o producto no encontrado |
| 500 | Error de servidor o integración |

## 🔍 Debugging

El orchestrator incluye logging detallado. Para ver los logs:

```bash
# En la terminal donde corre el orchestrator verás:
# ✅ Logs de validación de cliente
# ✅ Logs de creación de orden
# ✅ Logs de confirmación
# ❌ Logs de errores con detalles
```

Ejemplo de logs:

```
=== DEBUG CREAR ORDEN ===
URL: http://localhost:3002/admin/orders/create-order
Payload: {
  "customer_id": 1,
  "items": [{"product_id": 1, "qty": 2}]
}
========================
Respuesta exitosa: { errorCode: 0, message: "Orden creada exitosamente" }
```

## 🚀 Despliegue a AWS Lambda

### Configuración

Actualizar `serverless.yml` con tus credenciales AWS y región.

### Deployment

```bash
# Desplegar a AWS
npm run deploy

# Ver logs en AWS
npm run logs

# Remover deployment
npm run remove
```

### Variables de Entorno en AWS

Asegurarse de configurar en AWS Lambda Console:

- `CUSTOMERS_API_BASE`: URL de Customers API en producción
- `ORDERS_API_BASE`: URL de Orders API en producción
- `SERVICE_TOKEN`: Token de autenticación interna

## 📚 Estructura de Archivos

```
lambda-orchestrator/
├── src/
│   ├── handler.js           # Handler principal de Lambda
│   ├── utils/
│   │   └── httpClient.js    # Cliente HTTP para APIs
│   └── constants/
│       └── errorCodes.js    # Códigos de error
├── serverless.yml           # Configuración Serverless
├── package.json
└── README.md
```

## 💡 Buenas Prácticas

1. **Claves Idempotentes Únicas**: Usar UUID o timestamps para evitar duplicados
2. **Correlation IDs**: Mantener el mismo ID a través de toda la cadena de llamadas
3. **Manejo de Errores**: Revisar siempre el `errorCode` en la respuesta
4. **Timeouts**: El timeout está configurado a 30s, suficiente para el flujo completo

## 🔗 Integración con Frontend

```javascript
// Ejemplo JavaScript/TypeScript
async function crearYConfirmarOrden(carritoItems) {
  const response = await fetch('http://localhost:3010/orchestrator/create-and-confirm-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_id: usuarioActual.id,
      items: carritoItems.map(item => ({
        product_id: item.productId,
        qty: item.cantidad
      })),
      idempotency_key: `order-${Date.now()}-${Math.random()}`,
      correlation_id: `req-${sessionId}-${Date.now()}`
    })
  });
  
  return await response.json();
}
```

## 📚 Documentación Adicional

- [Documentación Principal](../../README.md)
- [Orders API README](../orders-api/README.md)
- [Customers API README](../customers-api/README.md)

---

**Puerto local**: 3010  
**Framework**: Serverless Framework + Node.js  
**Timeout**: 30 segundos
