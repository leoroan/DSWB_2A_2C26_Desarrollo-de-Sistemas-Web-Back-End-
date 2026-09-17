const fs = require('node:fs/promises');
const path = require('node:path');
const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');
const Producto = require('../models/Producto');
const personas = require('./personas.repo');
const { exigir } = require('../utils/validaciones');

// Un archivo permite guardar pedido, ítems y asignación en una sola escritura.
class PedidosRepository {
  constructor(archivo = path.join(__dirname, '../data/pedidos.json')) {
    this.archivo = archivo;
    this.cola = Promise.resolve();
  }

  async leer() {
    return JSON.parse(await fs.readFile(this.archivo, 'utf8'));
  }

  modificar(operacion) {
    // Serializa las modificaciones dentro de este proceso para evitar perder cambios.
    const resultado = this.cola.then(async () => {
      const db = await this.leer();
      const valor = await operacion(db);
      await fs.writeFile(`${this.archivo}.tmp`, JSON.stringify(db, null, 2), 'utf8');
      await fs.rename(`${this.archivo}.tmp`, this.archivo);
      return valor;
    });
    this.cola = resultado.catch(() => {});
    return resultado;
  }

  buscar(lista, id, nombre) {
    const entidad = lista.find(e => e.id === id);
    exigir(entidad, `${nombre} no encontrado`, 404);
    return entidad;
  }

  siguienteId(db, entidad) {
    return ++db.secuencias[entidad];
  }

  async listar() {
    const db = await this.leer();
    const clientes = await personas.obtenerTodas();
    return db.pedidos.map(p => ({ ...p, cliente: clientes.find(c => c.id === p.clienteId) || null }));
  }

  async detalle(id) {
    const db = await this.leer();
    const pedido = this.buscar(db.pedidos, id, 'Pedido');
    const asignacion = db.asignaciones.find(a => a.pedidoId === id);
    return {
      ...pedido,
      cliente: await personas.obtenerPorId(pedido.clienteId),
      items: db.items.filter(i => i.pedidoId === id).map(i => ({ ...i,
        producto: db.productos.find(p => p.id === i.productoId) })),
      ruta: asignacion ? db.rutas.find(r => r.id === asignacion.rutaId) : null,
    };
  }

  guardarPedido(id, datos) {
    return this.modificar(async db => {
      const anterior = id ? this.buscar(db.pedidos, id, 'Pedido') : {};
      const pedido = new Pedido({ ...anterior, ...datos, id: id || this.siguienteId(db, 'pedidos') });
      exigir(await personas.obtenerPorId(pedido.clienteId), 'El cliente indicado no existe');
      if (id) db.pedidos[db.pedidos.indexOf(anterior)] = pedido;
      else db.pedidos.push(pedido);
      return pedido;
    });
  }

  eliminarPedido(id) {
    return this.modificar(db => {
      this.buscar(db.pedidos, id, 'Pedido');
      db.pedidos = db.pedidos.filter(p => p.id !== id);
      db.items = db.items.filter(i => i.pedidoId !== id);
      db.asignaciones = db.asignaciones.filter(a => a.pedidoId !== id);
    });
  }

  guardarProducto(id, datos) {
    return this.modificar(db => {
      const anterior = id ? this.buscar(db.productos, id, 'Producto') : {};
      const producto = new Producto({ ...anterior, ...datos, id: id || this.siguienteId(db, 'productos') });
      if (id) db.productos[db.productos.indexOf(anterior)] = producto;
      else db.productos.push(producto);
      return producto;
    });
  }

  eliminarProducto(id) {
    return this.modificar(db => {
      this.buscar(db.productos, id, 'Producto');
      exigir(!db.items.some(i => i.productoId === id), 'El producto está asociado a un pedido; puede desactivarlo', 409);
      db.productos = db.productos.filter(p => p.id !== id);
    });
  }

  guardarItem(pedidoId, id, datos) {
    return this.modificar(db => {
      this.buscar(db.pedidos, pedidoId, 'Pedido');
      const anterior = id ? this.buscar(db.items.filter(i => i.pedidoId === pedidoId), id, 'Ítem') : {};
      const item = new ItemPedido({ ...anterior, ...datos, pedidoId, id: id || this.siguienteId(db, 'items') });
      const producto = this.buscar(db.productos, item.productoId, 'Producto');
      exigir(producto.estado === 'activo', 'El producto está inactivo', 409);
      if (id) db.items[db.items.indexOf(anterior)] = item;
      else db.items.push(item);
      return item;
    });
  }

  eliminarItem(pedidoId, id) {
    return this.modificar(db => {
      this.buscar(db.pedidos, pedidoId, 'Pedido');
      const item = this.buscar(db.items.filter(i => i.pedidoId === pedidoId), id, 'Ítem');
      db.items.splice(db.items.indexOf(item), 1);
    });
  }

  asignarRuta(pedidoId, rutaId) {
    return this.modificar(db => {
      this.buscar(db.pedidos, pedidoId, 'Pedido');
      if (rutaId !== null) this.buscar(db.rutas, rutaId, 'Ruta');
      db.asignaciones = db.asignaciones.filter(a => a.pedidoId !== pedidoId);
      if (rutaId !== null) db.asignaciones.push({ pedidoId, rutaId });
      return { pedidoId, rutaId };
    });
  }
}

module.exports = new PedidosRepository();
module.exports.PedidosRepository = PedidosRepository;
