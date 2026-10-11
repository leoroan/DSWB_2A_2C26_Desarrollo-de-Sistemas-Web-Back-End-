import { modelos, siguienteId } from "../database/models/index.js";
import { limpio } from "../config/database.js";
import Pedido from "../models/Pedido.js";
import ItemPedido from "../models/ItemPedido.js";
import Producto from "../models/Producto.js";
import clientesRepo from "./clientes.repo.js";
import { exigir } from "../utils/validaciones.js";

/**
 * Repositorio de pedidos (MongoDB).
 * Conserva la misma interfaz que la versión basada en data/pedidos.json.
 * Antes todo vivía en un único objeto con secciones (pedidos, items,
 * productos, rutas de catálogo y asignaciones); ahora cada sección es una
 * colección independiente de MongoDB. Las validaciones y la forma de los
 * datos devueltos son idénticas, por lo que controladores y vistas no cambian.
 */
const PedidoModel = modelos.Pedido;
const ItemModel = modelos.ItemPedido;
const ProductoModel = modelos.Producto;
const RutaCatalogoModel = modelos.RutaCatalogo;
const AsignacionModel = modelos.Asignacion;

/** @throws {Error} 404 si no existe la entidad. */
function exigirEncontrado(lista, id, nombre) {
  const entidad = lista.find((e) => e.id === id);
  exigir(entidad, `${nombre} no encontrado`, 404);
  return entidad;
}

/**
 * Homogeneiza el id de cliente al entero que usa Pedido: el módulo de clientes
 * los genera con Date.now() (string), así que se normalizan para compararlos.
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

/** @returns {Promise<Array>} Todos los pedidos como documentos planos. */
async function leerPedidosCrudos() {
  return PedidoModel.find().lean();
}

/** @returns {Promise<Array>} Todos los ítems como documentos planos. */
async function leerItemsCrudos() {
  return ItemModel.find().lean();
}

/** @returns {Promise<Array>} Todos los productos como documentos planos. */
async function leerProductosCrudos() {
  return ProductoModel.find().lean();
}

// ============================================================================
// PEDIDOS
// ============================================================================

/**
 * @returns {Promise<Array<Pedido>>} Pedidos con su cliente (null si ya no existe).
 */
async function obtenerTodas() {
  const pedidos = await leerPedidosCrudos();
  const clientes = await clientesRepo.obtenerTodas();
  const clienteDe = (id) =>
    clientes.find((c) => String(c.id) === String(id)) || null;

  return pedidos.map((pedido) =>
    mapearAPedido(limpio(pedido), clienteDe(pedido.clienteId)),
  );
}

/**
 * @param {number} id
 * @returns {Promise<Object|null>} Pedido con cliente, ítems (con producto) y
 * ruta asignada; null si no existe.
 */
async function obtenerPorId(id) {
  const datos = await PedidoModel.findOne({ id }).lean();
  if (!datos) return null;

  const cliente = await clientesRepo.obtenerPorId(datos.clienteId);
  const asignacion = await AsignacionModel.findOne({ pedidoId: id }).lean();
  const items = (await leerItemsCrudos()).filter((i) => i.pedidoId === id);
  const productos = await leerProductosCrudos();

  let ruta = null;
  if (asignacion) {
    const rutaDoc = await RutaCatalogoModel.findById(asignacion.rutaId).lean();
    ruta = rutaDoc ? { id: rutaDoc._id, nombre: rutaDoc.nombre } : null;
  }

  return {
    ...mapearAPedido(limpio(datos), cliente),
    items: items.map((i) => mapearAItem(limpio(i), productos)),
    ruta,
  };
}

/**
 * Crea un pedido nuevo; el id lo asigna el repositorio.
 * @param {Object} datos
 * @returns {Promise<Pedido>} El pedido creado.
 */
async function crear(datos) {
  const clienteId = normalizarClienteId(datos.clienteId);
  exigir(
    await clientesRepo.obtenerPorId(clienteId),
    "El cliente indicado no existe",
    404,
  );

  const pedido = new Pedido({
    ...datos,
    clienteId,
    id: await siguienteId("pedidos"),
  });
  await PedidoModel.create({ ...pedido });
  return pedido;
}

/**
 * Actualiza los campos enviados, conservando los omitidos.
 * @param {number} id
 * @param {Object} datos
 * @returns {Promise<Pedido|null>} El pedido actualizado o null si no existe.
 */
async function actualizar(id, datos) {
  const anterior = await PedidoModel.findOne({ id }).lean();
  if (!anterior) return null;

  const clienteId = normalizarClienteId(
    datos.clienteId === undefined ? anterior.clienteId : datos.clienteId,
  );
  exigir(
    await clientesRepo.obtenerPorId(clienteId),
    "El cliente indicado no existe",
    404,
  );

  const pedido = new Pedido({ ...limpio(anterior), ...datos, clienteId, id });
  await PedidoModel.updateOne({ id }, { $set: { ...pedido } });
  return pedido;
}

/**
 * Elimina un pedido junto con sus ítems y su asignación de ruta.
 * @param {number} id
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
async function eliminar(id) {
  const res = await PedidoModel.deleteOne({ id });
  if (res.deletedCount === 0) return false;

  await Promise.all([
    ItemModel.deleteMany({ pedidoId: id }),
    AsignacionModel.deleteMany({ pedidoId: id }),
  ]);
  return true;
}

// ============================================================================
// ÍTEMS DE PEDIDO
// ============================================================================

/** @throws {Error} 404 si el producto no existe, 409 si está inactivo. */
function exigirProductoActivo(productos, productoId) {
  const producto = exigirEncontrado(productos, productoId, "Producto");
  exigir(producto.estado === "activo", "El producto está inactivo", 409);
  return producto;
}

/**
 * @param {number} pedidoId
 * @returns {Promise<Array<ItemPedido>>} Ítems del pedido, con su producto.
 */
async function obtenerItems(pedidoId) {
  const pedido = await PedidoModel.findOne({ id: pedidoId }).lean();
  exigirEncontrado(pedido ? [pedido] : [], pedidoId, "Pedido");

  const items = (await leerItemsCrudos()).filter((i) => i.pedidoId === pedidoId);
  const productos = await leerProductosCrudos();
  return items.map((i) => mapearAItem(limpio(i), productos));
}

/**
 * Agrega un ítem a un pedido; solo admite productos activos.
 * @param {number} pedidoId
 * @param {Object} datos
 * @returns {Promise<ItemPedido>} El ítem creado.
 */
async function crearItem(pedidoId, datos) {
  const pedido = await PedidoModel.findOne({ id: pedidoId }).lean();
  exigirEncontrado(pedido ? [pedido] : [], pedidoId, "Pedido");

  const productos = await leerProductosCrudos();
  const item = new ItemPedido({
    ...datos,
    pedidoId,
    id: await siguienteId("items"),
  });
  exigirProductoActivo(productos, item.productoId);

  await ItemModel.create({ ...item });
  return item;
}

/**
 * Actualiza los campos enviados de un ítem del pedido.
 * @param {number} pedidoId
 * @param {number} itemId
 * @param {Object} datos
 * @returns {Promise<ItemPedido>} El ítem actualizado.
 */
async function actualizarItem(pedidoId, itemId, datos) {
  const pedido = await PedidoModel.findOne({ id: pedidoId }).lean();
  exigirEncontrado(pedido ? [pedido] : [], pedidoId, "Pedido");

  const anteriores = (await leerItemsCrudos()).filter(
    (i) => i.pedidoId === pedidoId,
  );
  const anterior = exigirEncontrado(anteriores, itemId, "Ítem");

  const productos = await leerProductosCrudos();
  const item = new ItemPedido({
    ...limpio(anterior),
    ...datos,
    pedidoId,
    id: itemId,
  });
  exigirProductoActivo(productos, item.productoId);

  await ItemModel.updateOne({ id: itemId }, { $set: { ...item } });
  return item;
}

/**
 * @param {number} pedidoId
 * @param {number} itemId
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
async function eliminarItem(pedidoId, itemId) {
  const pedido = await PedidoModel.findOne({ id: pedidoId }).lean();
  exigirEncontrado(pedido ? [pedido] : [], pedidoId, "Pedido");

  const res = await ItemModel.deleteOne({ id: itemId, pedidoId });
  return res.deletedCount > 0;
}


// ============================================================================
// PRODUCTOS
// ============================================================================

/** @returns {Promise<Array<Producto>>} Todos los productos almacenados. */
async function obtenerProductos() {
  const productos = await leerProductosCrudos();
  return productos.map((p) => mapearAProducto(limpio(p)));
}

/**
 * @param {number} id
 * @returns {Promise<Producto|null>} El producto con ese id o null si no existe.
 */
async function obtenerProductoPorId(id) {
  const datos = await ProductoModel.findOne({ id }).lean();
  return datos ? mapearAProducto(limpio(datos)) : null;
}

/**
 * @param {Object} datos
 * @returns {Promise<Producto>} El producto creado.
 */
async function crearProducto(datos) {
  const producto = new Producto({ ...datos, id: await siguienteId("productos") });
  await ProductoModel.create({ ...producto });
  return producto;
}

/**
 * @param {number} id
 * @param {Object} datos
 * @returns {Promise<Producto|null>} El producto actualizado o null si no existe.
 */
async function actualizarProducto(id, datos) {
  const anterior = await ProductoModel.findOne({ id }).lean();
  if (!anterior) return null;

  const producto = new Producto({ ...limpio(anterior), ...datos, id });
  await ProductoModel.updateOne({ id }, { $set: { ...producto } });
  return producto;
}

/**
 * Elimina un producto sin ítems asociados.
 * @param {number} id
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 * @throws {Error} 409 si el producto está asociado a un pedido.
 */
async function eliminarProducto(id) {
  const producto = await ProductoModel.findOne({ id }).lean();
  if (!producto) return false;

  const asociado = await ItemModel.exists({ productoId: id });
  exigir(
    !asociado,
    "El producto está asociado a un pedido; puede desactivarlo",
    409,
  );

  await ProductoModel.deleteOne({ id });
  return true;
}

// ============================================================================
// RUTAS Y ASIGNACIONES
// ============================================================================

/** @returns {Promise<Array>} Catálogo de rutas disponible para asignar pedidos. */
async function obtenerRutas() {
  const docs = await RutaCatalogoModel.find().lean();
  return docs.map((r) => ({ id: r._id, nombre: r.nombre }));
}

/**
 * Asigna una ruta a un pedido, o la quita enviando rutaId null.
 * @param {number} pedidoId
 * @param {number|null} rutaId
 * @returns {Promise<{pedidoId: number, rutaId: number|null}>} La asignación guardada.
 */
async function asignarRuta(pedidoId, rutaId) {
  const pedido = await PedidoModel.findOne({ id: pedidoId }).lean();
  exigirEncontrado(pedido ? [pedido] : [], pedidoId, "Pedido");
  if (rutaId !== null) {
    const ruta = await RutaCatalogoModel.findById(rutaId).lean();
    exigirEncontrado(ruta ? [{ id: ruta._id }] : [], rutaId, "Ruta");
  }

  await AsignacionModel.deleteMany({ pedidoId });
  if (rutaId !== null) await AsignacionModel.create({ pedidoId, rutaId });
  return { pedidoId, rutaId };
}

export default {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerItems,
  crearItem,
  actualizarItem,
  eliminarItem,
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerRutas,
  asignarRuta,
};

