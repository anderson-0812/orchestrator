# 👥 Customers API

API REST para gestión de clientes con soporte para búsqueda, paginación y endpoint interno para validación desde otros servicios.

## 🎯 Características

- ✅ CRUD completo de clientes
- ✅ Búsqueda por nombre o email
- ✅ Soft delete (eliminación lógica)
- ✅ Paginación cursor-based
- ✅ Endpoint interno con autenticación por token
- ✅ Validación robusta de datos

## 🚀 Inicio Rápido

### Requisitos

- Node.js >= 22.0.0
- MySQL >= 8.0

### Instalación y Configuración

```bash
# Instalar dependencias (desde la raíz)
npm install

# Configurar variables de entorno
# Crear apps/customers-api/.env con:
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_NAME=orchestrator
SYNCHRONIZE=TRUE
SERVICE_TOKEN=internal-service-token
```

### Ejecución

```bash
npm run start:customers
# API disponible en http://localhost:3001
```

## 📖 API Endpoints

### Crear Cliente

#### POST `/admin/customers/create-customer`

Registra un nuevo cliente en el sistema.

**Request Body**:
```json
{
  "name": "ACME Corporation",
  "email": "ops@acme.com",
  "phone": "+1234567890"
}
```

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:3001/admin/customers/create-customer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corporation",
    "email": "ops@acme.com",
    "phone": "+1234567890"
  }'
```

**Respuesta (201)**:
```json
{
  "errorCode": 0,
  "message": "Cliente creado exitosamente",
  "data": {
    "id": 1,
    "name": "ACME Corporation",
    "email": "ops@acme.com",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2026-02-09T02:00:00.000Z"
  }
}
```

---

### Listar Clientes

#### GET `/admin/customers/find-all`

Lista clientes con búsqueda y paginación.

**Query Parameters**:
- `search` (opcional): Buscar por nombre o email
- `limit` (opcional, default=20): Cantidad de resultados
- `cursor` (opcional): ID para continuar paginación

**Ejemplos cURL**:

```bash
# Listar todos
curl http://localhost:3001/admin/customers/find-all

# Buscar por nombre/email
curl "http://localhost:3001/admin/customers/find-all?search=ACME"

# Con paginación
curl "http://localhost:3001/admin/customers/find-all?limit=10&cursor=5"
```

**Respuesta (200)**:
```json
{
  "errorCode": 0,
  "message": "Clientes encontrados",
  "data": [
    {
      "id": 1,
      "name": "ACME Corporation",
      "email": "ops@acme.com",
      "phone": "+1234567890",
      "isActive": true,
      "createdAt": "2026-02-09T02:00:00.000Z"
    }
  ],
  "meta": {
    "limit": 20,
    "cursor": null,
    "nextCursor": 15,
    "hasNext": true
  }
}
```

---

### Obtener Cliente por ID

#### GET `/admin/customers/find-one/{id}`

Obtiene el detalle de un cliente específico.

**Ejemplo cURL**:
```bash
curl http://localhost:3001/admin/customers/find-one/1
```

**Respuesta (200)**:
```json
{
  "errorCode": 0,
  "message": "Cliente encontrado",
  "data": {
    "id": 1,
    "name": "ACME Corporation",
    "email": "ops@acme.com",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2026-02-09T02:00:00.000Z"
  }
}
```

---

### Actualizar Cliente

#### PATCH `/admin/customers/update/{id}`

Actualiza los datos de un cliente existente.

**Request Body** (todos los campos opcionales):
```json
{
  "name": "ACME Corp Updated",
  "email": "new-ops@acme.com",
  "phone": "+9876543210"
}
```

**Ejemplo cURL**:
```bash
curl -X PATCH http://localhost:3001/admin/customers/update/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corp Updated",
    "phone": "+9876543210"
  }'
```

**Respuesta (200)**:
```json
{
  "errorCode": 0,
  "message": "Cliente actualizado exitosamente",
  "data": {
    "id": 1,
    "name": "ACME Corp Updated",
    "email": "ops@acme.com",
    "phone": "+9876543210",
    "isActive": true
  }
}
```

---

### Eliminar Cliente (Soft Delete)

#### PATCH `/admin/customers/logic-delete/{id}`

Desactiva un cliente sin eliminarlo físicamente.

**Ejemplo cURL**:
```bash
curl -X PATCH http://localhost:3001/admin/customers/logic-delete/1
```

**Respuesta (200)**:
```json
{
  "errorCode": 0,
  "message": "Cliente eliminado exitosamente",
  "data": {
    "id": 1,
    "name": "ACME Corporation",
    "email": "ops@acme.com",
    "isActive": false
  }
}
```

---

### Endpoint Interno - Validar Cliente

#### GET `/admin/customers/internal/customers/{id}`

**⚠️ Endpoint de uso interno** - Utilizado por Orders API para validar clientes.

**Headers Requeridos**:
- `Authorization`: `Bearer {SERVICE_TOKEN}`

**Ejemplo cURL**:
```bash
curl http://localhost:3001/admin/customers/internal/customers/1 \
  -H "Authorization: Bearer internal-service-token"
```

**Respuesta (200)**:
```json
{
  "errorCode": 0,
  "message": "Cliente encontrado",
  "data": {
    "id": 1,
    "name": "ACME Corporation",
    "email": "ops@acme.com",
    "phone": "+1234567890",
    "isActive": true
  }
}
```

**Nota**: Este endpoint es llamado automáticamente por Orders API al crear una orden.

---

## 🧪 Colección Postman

Importar `openapi.yaml` en Postman:

1. Abrir Postman
2. Importar → Seleccionar `apps/customers-api/openapi.yaml`
3. Configurar Environment:
   - `baseUrl`: http://localhost:3001
   - `serviceToken`: internal-service-token

## 🔍 Campos de Cliente

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `name` | string | Nombre del cliente | ✅ |
| `email` | string | Email único | ✅ |
| `phone` | string | Teléfono de contacto | ✅ |
| `isActive` | boolean | Estado del cliente | Auto |
| `createdAt` | datetime | Fecha de creación | Auto |

## 💡 Casos de Uso

### Validar Cliente desde Orders API

Cuando Orders API crea una orden, automáticamente:

1. Llama a `GET /admin/customers/internal/customers/{id}`
2. Verifica que el cliente existe y está activo
3. Si todo está bien, continúa con la creación de la orden

### Buscar Clientes

```bash
# Buscar por email
curl "http://localhost:3001/admin/customers/find-all?search=acme.com"

# Buscar por nombre
curl "http://localhost:3001/admin/customers/find-all?search=Corporation"
```

### Reactivar Cliente Eliminado

```bash
# 1. Primero verificar estado
curl http://localhost:3001/admin/customers/find-one/1

# 2. Si isActive es false, actualizar manualmente en BD:
# UPDATE customers SET isActive = true WHERE id = 1;
```

## 🛡️ Validaciones

- **Email**: Debe ser formato válido y único
- **Name**: No puede estar vacío
- **Phone**: No puede estar vacío
- **Duplicados**: No se permiten emails duplicados

## 📚 Documentación Adicional

- [OpenAPI Specification](./openapi.yaml)
- [Documentación Principal](../../README.md)
- [Orders API README](../orders-api/README.md)

---

**Puerto por defecto**: 3001  
**Base de datos**: orchestrator  
**Framework**: NestJS + TypeORM
