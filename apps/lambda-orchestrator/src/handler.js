const HttpClient = require('./utils/httpClient');
const { ErrorCode } = require('./constants/errorCodes');

/**
 * Lambda handler para orquestar creación y confirmación de órdenes
 * 
 * Flujo:
 * 1. Validar cliente en Customers API
 * 2. Crear orden en Orders API
 * 3. Confirmar orden con idempotencia
 * 4. Retornar JSON consolidado
 */
exports.createAndConfirmOrder = async (event) => {
  console.log('Evento recibido:', JSON.stringify(event, null, 2));

  try {
    // 1. Parsear body
    const body = JSON.parse(event.body || '{}');
    const { customer_id, items, idempotency_key, correlation_id } = body;

    // Validar campos requeridos
    if (!customer_id) {
      return {
        statusCode: ErrorCode.ERROR_VALIDATION,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'customer_id es requerido'
        })
      };
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: ErrorCode.ERROR_VALIDATION,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'items debe ser un array no vacío'
        })
      };
    }

    if (!idempotency_key) {
      return {
        statusCode: ErrorCode.ERROR_VALIDATION,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'idempotency_key es requerido'
        })
      };
    }

    const httpClient = new HttpClient();

    // 2. Validar cliente en Customers API
    console.log(`Validando cliente ${customer_id}...`);
    const customer = await httpClient.getCustomer(customer_id);

    if (!customer) {
      return {
        statusCode: ErrorCode.ERROR_VALIDATION,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Cliente no encontrado'
        })
      };
    }

    console.log(`Cliente validado: ${customer.firstName} ${customer.lastName}`);

    // 3. Crear orden en Orders API
    console.log(`Creando orden para el cliente ${customer_id}...`);
    const order = await httpClient.createOrder(customer_id, items);
    console.log(`Orden creada con ID: ${order.id}`);

    // 4. Confirmar orden con idempotencia
    console.log(`Confirmando orden ${order.id} con key: ${idempotency_key}...`);
    const confirmedOrder = await httpClient.confirmOrder(order.id, idempotency_key);
    console.log(`Orden confirmada exitosamente`);

    // 5. Retornar JSON consolidado
    const response = {
      success: true,
      correlationId: correlation_id || `corr-${Date.now()}`,
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        },
        order: {
          id: confirmedOrder.id,
          status: confirmedOrder.status,
          total_cents: confirmedOrder.totalCents,
          nroOrder: confirmedOrder.nroOrder,
          items: confirmedOrder.orderProducts?.map(item => ({
            product_id: item.productId,
            qty: item.qty,
            unit_price_cents: item.unitPriceCents,
            subtotal_cents: item.subtotalCents,
            product: {
              id: item.product?.id,
              sku: item.product?.sku,
              name: item.product?.name
            }
          })) || []
        }
      }
    };

    return {
      statusCode: ErrorCode.CREATED,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error in orchestration:', error);

    return {
      statusCode: ErrorCode.ERROR_SERVER,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
