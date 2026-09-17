// Ejecutar con node docs/generar-coleccion.js para regenerar la colección.
const fs = require('node:fs');
const path = require('node:path');
const item = (name, method, url, body, status, variable) => ({
  name,
  request: {
    method,
    header: [{ key: 'Content-Type', value: 'application/json' }],
    url: '{{baseUrl}}' + url,
    ...(body ? { body: { mode: 'raw', raw: JSON.stringify(body, null, 2), options: { raw: { language: 'json' } } } } : {}),
  },
  event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
    `pm.test('HTTP ${status}', () => pm.response.to.have.status(${status}));`,
    ...(variable ? [`if (pm.response.code === ${status}) pm.collectionVariables.set('${variable}', pm.response.json().id);`] : []),
  ] } }],
});
const collection = {
  info: { name: 'FreshRoute - Pedidos', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  variable: [{ key: 'baseUrl', value: 'http://localhost:3000' }, { key: 'pedidoId', value: '' }, { key: 'productoId', value: '' }, { key: 'itemId', value: '' }],
  item: [
    item('01 Clientes disponibles', 'GET', '/api/personas', null, 200),
    item('02 Crear producto', 'POST', '/api/productos', { nombre: 'Vianda de prueba', categoria: 'Viandas', precio: 6500 }, 201, 'productoId'),
    item('03 Crear pedido (cliente 1)', 'POST', '/api/pedidos', { clienteId: 1, fechaPedido: '2026-09-12', fechaEntregaSolicitada: '2026-09-14', observaciones: 'Entregar en recepción' }, 201, 'pedidoId'),
    item('04 Agregar ítem', 'POST', '/api/pedidos/{{pedidoId}}/items', { productoId: '{{productoId}}', cantidad: 5, observaciones: 'Sin sal' }, 201, 'itemId'),
    item('05 Consultar rutas', 'GET', '/api/rutas', null, 200),
    item('06 Asignar ruta', 'PATCH', '/api/pedidos/{{pedidoId}}/ruta', { rutaId: 1 }, 200),
    item('07 Detalle completo - capturar evidencia', 'GET', '/api/pedidos/{{pedidoId}}', null, 200),
    item('08 Cambiar estado', 'PUT', '/api/pedidos/{{pedidoId}}', { estado: 'confirmado' }, 200),
    item('09 Rechazar cantidad inválida', 'PUT', '/api/pedidos/{{pedidoId}}/items/{{itemId}}', { cantidad: 0 }, 400),
    item('10 Listar pedidos', 'GET', '/api/pedidos', null, 200),
    item('11 Eliminar pedido de prueba', 'DELETE', '/api/pedidos/{{pedidoId}}', null, 204),
    item('12 Eliminar producto de prueba', 'DELETE', '/api/productos/{{productoId}}', null, 204),
  ],
};
// Las variables numéricas deben enviarse como números JSON, sin comillas.
collection.item[3].request.body.raw = collection.item[3].request.body.raw.replace('"{{productoId}}"', '{{productoId}}');
fs.writeFileSync(path.join(__dirname, 'FreshRoute.postman_collection.json'), JSON.stringify(collection, null, 2));
