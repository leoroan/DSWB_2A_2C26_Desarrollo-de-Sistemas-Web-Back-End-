const {
  leerJsonObjeto,
  escribirArchivoJson,
} = require("../utils/persistencia");
const Pedido = require("../models/Pedido");
const ItemPedido = require("../models/ItemPedido");
const Producto = require("../models/Producto");
const clientesRepo = require("./clientes.repo");
const { exigir } = require("../utils/validaciones");

/**
 * Repositorio de pedidos.
 * Pedidos, ítems, productos, catálogo de rutas y asignaciones comparten
 * data/pedidos.json (objeto con secciones + secuencias), por eso se lee con
 * leerJsonObjeto() y se escribe con escribirArchivoJson().
 * Los clientes se resuelven con clientes.repo (Cliente extiende de Persona).
 */
const ARCHIVO = "pedidos.json";

/** Secciones mínimas del archivo, para tolerar un JSON incompleto o inexistente. */
const BASE = {
  secuencias: { pedidos: 0, items: 0, productos: 0 },
  pedidos: [],
  items: [],
  productos: [],
  rutas: [],
  asignaciones: [],
};

// Las escrituras se encadenan porque todas las secciones comparten el archivo.
let cola = Promise.resolve();

/**
 * @returns {Promise<Object>} El archivo completo, con todas sus secciones.
 */
async function leer() {
  const datos = await leerJsonObjeto(ARCHIVO);

  return {
    secuencias: { ...BASE.secuencias, ...(datos.secuencias || {}) },
    pedidos: datos.pedidos || [],
    items: datos.items || [],
    productos: datos.productos || [],
    rutas: datos.rutas || [],
    asignaciones: datos.asignaciones || [],
  };
}

/**
 * Lee, aplica la operación y guarda el archivo, sin superponer escrituras.
 * @param {(db: Object) => any} operacion
 * @returns {Promise<any>} El valor que devuelva la operación.
 */
function modificar(operacion) {
  const resultado = cola.then(async () => {
    const db = await leer();
    const valor = await operacion(db);
    await escribirArchivoJson(ARCHIVO, db);
    return valor;
  });
  cola = resultado.catch(() => {});
  return resultado;
}

/**
 * Busca una entidad por id dentro de una sección.
 * @throws {Error} 404 si no existe.
 */
function exigirEncontrado(lista, id, nombre) {
  const entidad = lista.find((e) => e.id === id);
  exigir(entidad, `${nombre} no encontrado`, 404);
  return entidad;
}

/** @returns {number} El próximo id de una sección. */
function siguienteId(db, seccion) {
  db.secuencias[seccion] += 1;
  return db.secuencias[seccion];
}

/**
 * Homogeneiza el id de cliente al entero que usa Pedido: el módulo de clientes
 * los genera con Date.now() (string), así que se normalizan para poder
 * compararlos y validarlos.
 */
function normalizarClienteId(valor) {
  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : valor;
}

/** Convierte un pedido almacenado en instancia de Pedido, con su cliente resuelto. */
function mapearAPedido(datos, cliente = null) {
  return Object.assign(new Pedido(datos), { cliente: cliente || null });
}

/** Convierte un ítem almacenado en instancia de ItemPedido, con su producto. */
function mapearAItem(datos, productos) {
  const item = new ItemPedido(datos);
  const producto = productos.find((p) => p.id === item.productoId) || null;
  return Object.assign(item, { producto });
}

/** Convierte un producto almacenado en instancia de Producto. */
function mapearAProducto(datos) {
  return new Producto(datos);
}

// ============================================================================
// PEDIDOS
// ============================================================================

/**
 * @returns {Promise<Array<Pedido>>} Pedidos con su cliente (null si ya no existe).
 */
async function obtenerTodas() {
  const db = await leer();
  const clientes = await clientesRepo.obtenerTodas();
  const clienteDe = (id) =>
    clientes.find((c) => String(c.id) === String(id)) || null;

  return db.pedidos.map((pedido) =>
    mapearAPedido(pedido, clienteDe(pedido.clienteId)),
  );
}

/**
 * @param {number} id
 * @returns {Promise<Object|null>} Pedido con cliente, ítems (con producto) y
 * ruta asignada; null si no existe.
 */
async function obtenerPorId(id) {
  const db = await leer();
  const datos = db.pedidos.find((p) => p.id === id);
  if (!datos) return null;

  const cliente = await clientesRepo.obtenerPorId(datos.clienteId);
  const asignacion = db.asignaciones.find((a) => a.pedidoId === id);

  return {
    ...mapearAPedido(datos, cliente),
    items: db.items
      .filter((i) => i.pedidoId === id)
      .map((i) => mapearAItem(i, db.productos)),
    ruta: asignacion
      ? db.rutas.find((r) => r.id === asignacion.rutaId) || null
      : null,
  };
}

/**
 * Crea un pedido nuevo; el id lo asigna el repositorio.
 * @param {Object} datos
 * @returns {Promise<Pedido>} El pedido creado.
 */
function crear(datos) {
  return modificar(async (db) => {
    const clienteId = normalizarClienteId(datos.clienteId);
    exigir(
      await clientesRepo.obtenerPorId(clienteId),
      "El cliente indicado no existe",
      404,
    );

    const pedido = new Pedido({
      ...datos,
      clienteId,
      id: siguienteId(db, "pedidos"),
    });
    db.pedidos.push(pedido);
    return pedido;
  });
}

/**
 * Actualiza los campos enviados, conservando los omitidos.
 * @param {number} id
 * @param {Object} datos
 * @returns {Promise<Pedido|null>} El pedido actualizado o null si no existe.
 */
function actualizar(id, datos) {
  return modificar(async (db) => {
    const anterior = db.pedidos.find((p) => p.id === id);
    if (!anterior) return null;

    const clienteId = normalizarClienteId(
      datos.clienteId === undefined ? anterior.clienteId : datos.clienteId,
    );
    exigir(
      await clientesRepo.obtenerPorId(clienteId),
      "El cliente indicado no existe",
      404,
    );

    const pedido = new Pedido({ ...anterior, ...datos, clienteId, id });
    db.pedidos[db.pedidos.indexOf(anterior)] = pedido;
    return pedido;
  });
}

/**
 * Elimina un pedido junto con sus ítems y su asignación de ruta.
 * @param {number} id
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
function eliminar(id) {
  return modificar((db) => {
    if (!db.pedidos.some((p) => p.id === id)) return false;

    db.pedidos = db.pedidos.filter((p) => p.id !== id);
    db.items = db.items.filter((i) => i.pedidoId !== id);
    db.asignaciones = db.asignaciones.filter((a) => a.pedidoId !== id);
    return true;
  });
}

// ============================================================================
// ÍTEMS DE PEDIDO
// ============================================================================

/** @throws {Error} 404 si el producto no existe, 409 si está inactivo. */
function exigirProductoActivo(db, productoId) {
  const producto = exigirEncontrado(db.productos, productoId, "Producto");
  exigir(producto.estado === "activo", "El producto está inactivo", 409);
  return producto;
}

/**
 * @param {number} pedidoId
 * @returns {Promise<Array<ItemPedido>>} Ítems del pedido, con su producto.
 */
async function obtenerItems(pedidoId) {
  const db = await leer();
  exigirEncontrado(db.pedidos, pedidoId, "Pedido");

  return db.items
    .filter((i) => i.pedidoId === pedidoId)
    .map((i) => mapearAItem(i, db.productos));
}

/**
 * Agrega un ítem a un pedido; solo admite productos activos.
 * @param {number} pedidoId
 * @param {Object} datos
 * @returns {Promise<ItemPedido>} El ítem creado.
 */
function crearItem(pedidoId, datos) {
  return modificar((db) => {
    exigirEncontrado(db.pedidos, pedidoId, "Pedido");

    const item = new ItemPedido({
      ...datos,
      pedidoId,
      id: siguienteId(db, "items"),
    });
    exigirProductoActivo(db, item.productoId);
    db.items.push(item);
    return item;
  });
}

/**
 * Actualiza los campos enviados de un ítem del pedido.
 * @param {number} pedidoId
 * @param {number} itemId
 * @param {Object} datos
 * @returns {Promise<ItemPedido>} El ítem actualizado.
 */
function actualizarItem(pedidoId, itemId, datos) {
  return modificar((db) => {
    exigirEncontrado(db.pedidos, pedidoId, "Pedido");
    const anterior = exigirEncontrado(
      db.items.filter((i) => i.pedidoId === pedidoId),
      itemId,
      "Ítem",
    );

    const item = new ItemPedido({ ...anterior, ...datos, pedidoId, id: itemId });
    exigirProductoActivo(db, item.productoId);
    db.items[db.items.indexOf(anterior)] = item;
    return item;
  });
}

/**
 * @param {number} pedidoId
 * @param {number} itemId
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
function eliminarItem(pedidoId, itemId) {
  return modificar((db) => {
    exigirEncontrado(db.pedidos, pedidoId, "Pedido");
    const item = db.items.find((i) => i.pedidoId === pedidoId && i.id === itemId);
    if (!item) return false;

    db.items.splice(db.items.indexOf(item), 1);
    return true;
  });
}

// ============================================================================
// PRODUCTOS
// ============================================================================

/** @returns {Promise<Array<Producto>>} Todos los productos almacenados. */
async function obtenerProductos() {
  const db = await leer();
  return db.productos.map(mapearAProducto);
}

/**
 * @param {number} id
 * @returns {Promise<Producto|null>} El producto con ese id o null si no existe.
 */
async function obtenerProductoPorId(id) {
  const db = await leer();
  const datos = db.productos.find((p) => p.id === id);
  return datos ? mapearAProducto(datos) : null;
}

/**
 * @param {Object} datos
 * @returns {Promise<Producto>} El producto creado.
 */
function crearProducto(datos) {
  return modificar((db) => {
    const producto = new Producto({ ...datos, id: siguienteId(db, "productos") });
    db.productos.push(producto);
    return producto;
  });
}

/**
 * @param {number} id
 * @param {Object} datos
 * @returns {Promise<Producto|null>} El producto actualizado o null si no existe.
 */
function actualizarProducto(id, datos) {
  return modificar((db) => {
    const anterior = db.productos.find((p) => p.id === id);
    if (!anterior) return null;

    const producto = new Producto({ ...anterior, ...datos, id });
    db.productos[db.productos.indexOf(anterior)] = producto;
    return producto;
  });
}

/**
 * Elimina un producto sin ítems asociados.
 * @param {number} id
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 * @throws {Error} 409 si el producto está asociado a un pedido.
 */
function eliminarProducto(id) {
  return modificar((db) => {
    const indice = db.productos.findIndex((p) => p.id === id);
    if (indice === -1) return false;

    exigir(
      !db.items.some((i) => i.productoId === id),
      "El producto está asociado a un pedido; puede desactivarlo",
      409,
    );
    db.productos.splice(indice, 1);
    return true;
  });
}

// ============================================================================
// RUTAS Y ASIGNACIONES
// ============================================================================

/** @returns {Promise<Array>} Catálogo de rutas disponible para asignar pedidos. */
async function obtenerRutas() {
  const db = await leer();
  return db.rutas;
}

/**
 * Asigna una ruta a un pedido, o la quita enviando rutaId null.
 * @param {number} pedidoId
 * @param {number|null} rutaId
 * @returns {Promise<{pedidoId: number, rutaId: number|null}>} La asignación guardada.
 */
function asignarRuta(pedidoId, rutaId) {
  return modificar((db) => {
    exigirEncontrado(db.pedidos, pedidoId, "Pedido");
    if (rutaId !== null) exigirEncontrado(db.rutas, rutaId, "Ruta");

    db.asignaciones = db.asignaciones.filter((a) => a.pedidoId !== pedidoId);
    if (rutaId !== null) db.asignaciones.push({ pedidoId, rutaId });
    return { pedidoId, rutaId };
  });
}

module.exports = {
  leer,
  // Pedidos
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  // Ítems
  obtenerItems,
  crearItem,
  actualizarItem,
  eliminarItem,
  // Productos
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  // Rutas y asignaciones
  obtenerRutas,
  asignarRuta,
};
