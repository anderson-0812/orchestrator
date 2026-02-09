const axios = require('axios');

// Cliente HTTP para comunicación con las APIs
class HttpClient {
  constructor() {
    this.customersApiBase = process.env.CUSTOMERS_API_BASE || 'http://localhost:3001';
    this.ordersApiBase = process.env.ORDERS_API_BASE || 'http://localhost:3002';
    this.serviceToken = process.env.SERVICE_TOKEN || 'internal-service-token';
  }

  // Obtener cliente por ID desde Customers API
  async getCustomer(customerId) {
    try {
      const response = await axios.get(
        `${this.customersApiBase}/admin/customers/internal/customers/${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.serviceToken}`
          }
        }
      );
      console.log('Customer data >>>>>>>>>>>>>>>>>>>>>>> :', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo cliente:', error.response?.data || error.message);
      throw new Error(`Validación de cliente falló: ${error.response?.data?.message || error.message}`);
    }
  }

  // Crear orden en Orders API
  async createOrder(customer_id, items) {
    try {
      const url = `${this.ordersApiBase}/admin/orders/create-order`;
      const payload = { customer_id, items };
      
      console.log('=== DEBUG CREAR ORDEN ===');
      console.log('URL:', url);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('========================');
      
      console.log('URL: >>>>>>>>>>>>>>>>>> : ', url);
      const response = await axios.post(url, payload);
      console.log('Respuesta exitosa:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creando orden:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('URL intentada:', error.config?.url);
      throw new Error(`Creación de orden falló: ${error.response?.data?.message || error.message}`);
    }
  }

  // Confirmar orden en Orders API con idempotencia
  async confirmOrder(orderId, idempotencyKey) {
    try {
      const response = await axios.post(
        `${this.ordersApiBase}/admin/orders/${orderId}/confirm`,
        {},
        {
          headers: {
            'X-Idempotency-Key': idempotencyKey
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error confirmando orden:', error.response?.data || error.message);
      throw new Error(`Confirmación de orden falló: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = HttpClient;
