const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const app = require('../index');
const repo = require('../src/repositories/pedidos.repo');

test('Flujo HTTP de pedidos, productos, ítems, rutas y vistas con JSON aislado', async () => {
  const directorio = await fs.mkdtemp(path.join(os.tmpdir(), 'freshroute-test-'));
  const original = repo.archivo;
  repo.archivo = path.join(directorio, 'pedidos.json');
  await fs.copyFile(original, repo.archivo);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(method, url, body, status = 200) {
    const response = await fetch(base + url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    assert.equal(response.status, status, `${method} ${url}: ${text}`);
    return text && response.headers.get('content-type').includes('application/json') ? JSON.parse(text) : text;
  }
  try {
    assert.match(await request('GET', '/pedidos'), /Pedidos/);
    await request('GET', '/api/personas');
    await request('GET', '/api/pedidos/abc', undefined, 400);
    await request('GET', '/pedidos/999999', undefined, 404);
    await request('POST', '/api/pedidos', {}, 400);
    const datos = { clienteId: 1, fechaPedido: '2026-09-12', fechaEntregaSolicitada: '2026-09-14', observaciones: '<script>alert(1)</script>' };
    await request('POST', '/api/pedidos', { ...datos, fechaPedido: '2026-02-30' }, 400);
    await request('POST', '/api/pedidos', { ...datos, clienteId: 999999 }, 400);
    const pedido = await request('POST', '/api/pedidos', datos, 201);
    const otro = await request('POST', '/api/pedidos', datos, 201);
    const producto = await request('POST', '/api/productos', { nombre: 'Prueba', categoria: 'Viandas', precio: 100 }, 201);
    await request('POST', `/api/pedidos/${pedido.id}/items`, { productoId: producto.id, cantidad: 0 }, 400);
    const item = await request('POST', `/api/pedidos/${pedido.id}/items`, { productoId: producto.id, cantidad: 3 }, 201);
    await request('DELETE', `/api/productos/${producto.id}`, undefined, 409);
    await request('PUT', `/api/pedidos/${otro.id}/items/${item.id}`, { cantidad: 8 }, 404);
    await request('PUT', `/api/pedidos/${pedido.id}/items/${item.id}`, { cantidad: 4 });
    await request('PUT', `/api/pedidos/${pedido.id}`, { estado: 'confirmado' });
    await request('PATCH', `/api/pedidos/${pedido.id}/ruta`, { rutaId: 999999 }, 404);
    await request('PATCH', `/api/pedidos/${pedido.id}/ruta`, { rutaId: 1 });
    const detalle = await request('GET', `/api/pedidos/${pedido.id}`);
    assert.equal(detalle.items[0].cantidad, 4);
    assert.equal(detalle.cliente.id, 1);
    assert.equal(detalle.ruta.id, 1);
    assert.equal(detalle.estado, 'confirmado');
    const html = await request('GET', `/pedidos/${pedido.id}`);
    assert.match(html, /Ruta Centro/);
    assert.match(html, /&lt;script&gt;/);
    const form = await fetch(`${base}/pedidos/${pedido.id}/ruta`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'rutaId=2', redirect: 'manual',
    });
    assert.equal(form.status, 303);
    assert.equal((await request('GET', `/api/pedidos/${pedido.id}`)).ruta.id, 2);
    const concurrentes = await Promise.all(Array.from({ length: 5 }, () => request('POST', '/api/pedidos', datos, 201)));
    assert.equal(new Set(concurrentes.map(p => p.id)).size, 5);
    const persistido = JSON.parse(await fs.readFile(repo.archivo, 'utf8'));
    assert.ok(persistido.items.some(i => i.id === item.id));
    await request('DELETE', `/api/pedidos/${pedido.id}`, undefined, 204);
    const final = await repo.leer();
    assert.ok(!final.items.some(i => i.pedidoId === pedido.id));
    assert.ok(!final.asignaciones.some(a => a.pedidoId === pedido.id));
    await request('DELETE', `/api/productos/${producto.id}`, undefined, 204);
    await request('GET', `/api/pedidos/${pedido.id}`, undefined, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
    repo.archivo = original;
    await fs.rm(directorio, { recursive: true, force: true });
  }
});
