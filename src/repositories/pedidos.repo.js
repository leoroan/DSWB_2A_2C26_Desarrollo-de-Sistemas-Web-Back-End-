import { modelos, siguienteId } from "../models/index.js";
import { limpio } from "../config/database.js";
import Pedido from "../domain/entities/Pedido.js";
import ItemPedido from "../domain/entities/ItemPedido.js";
import Producto from "../domain/entities/Producto.js";
import clientesRepo from "./clientes.repo.js";
import { exigir } from "../utils/validaciones.js";
import { validarPedido, validarCreacionPedido } from "../domain/validators/pedido.validator.js";
import { validarItemPedido } from "../domain/validators/itemPedido.validator.js";
import { validarProducto } from "../domain/validators/producto.validator.js";

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
const RutaModel = modelos.Ruta;
const ChoferModel = modelos.Chofer;
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
 * @param {Object} [filtros] Filtros simples { clienteId, estado } (D6).
 * @returns {Promise<Array<Pedido>>} Pedidos con su cliente (null si ya no existe).
 */
async function obtenerTodas(filtros = {}) {
  const query = {};
  if (filtros.clienteId !== undefined) {
    // clienteId se guarda tal cual (string Date.now() o número); se comparan ambas formas.
    query.$or = [{ clienteId: filtros.clienteId }, { clienteId: String(filtros.clienteId) }];
    if (typeof filtros.clienteId === "number") {
      query.$or.push({ clienteId: String(filtros.clienteId) });
    }
  }
  if (filtros.estado !== undefined) query.estado = filtros.estado;
  const tieneFiltroCliente = query.$or !== undefined;
  if (tieneFiltroCliente && query.estado !== undefined) {
    const or = query.$or;
    delete query.$or;
    query.$and = [{ $or: or }, { estado: query.estado }];
    delete query.estado;
  }
  const pedidos = await PedidoModel.find(tieneFiltroCliente || filtros.estado !== undefined ? query : {}).lean();
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
 * Crea la cabecera web en estado pendiente (paso 1 del alta en 2 pasos).
 * El pedido queda vacío hasta agregar el primer producto en el detalle.
 * @param {Object} datos
 * @returns {Promise<Pedido>} El pedido creado.
 * @throws {Error} 404 si el cliente no existe, 409 si está inactivo.
 */
async function crearCabecera(datos) {
  const validado = validarPedido({
    clienteId: datos.clienteId,
    fechaPedido: datos.fechaPedido,
    fechaEntregaSolicitada: datos.fechaEntregaSolicitada,
    observaciones: datos.observaciones ?? "",
    estado: "pendiente",
  });
  const clienteId = normalizarClienteId(validado.clienteId);
  const cliente = await clientesRepo.obtenerPorId(clienteId);
  exigir(cliente, "El cliente indicado no existe", 404);
  exigir(
    String(cliente.estado ?? "Activo").toLowerCase() === "activo",
    "No se puede crear un pedido para un cliente inactivo",
    409,
  );

  const pedido = new Pedido({ ...validado, clienteId, id: await siguienteId("pedidos") });
  await PedidoModel.create({ ...pedido });
  return pedido;
}

/**
 * Crea un pedido nuevo en estado pendiente con al menos un producto (D2 + D3).
 * @param {Object} datos
 * @returns {Promise<Object>} El pedido creado con sus ítems.
 * @throws {Error} 404 si el cliente no existe, 409 si está inactivo o el producto no está activo.
 */
async function crear(datos) {
  const validado = validarCreacionPedido(datos);
  const clienteId = normalizarClienteId(validado.clienteId);
  const cliente = await clientesRepo.obtenerPorId(clienteId);
  exigir(cliente, "El cliente indicado no existe", 404);
  exigir(
    String(cliente.estado ?? "Activo").toLowerCase() === "activo",
    "No se puede crear un pedido para un cliente inactivo",
    409,
  );

  const productos = await leerProductosCrudos();
  for (const item of validado.items) {
    exigirProductoActivo(productos, item.productoId);
  }

  const pedido = new Pedido({ ...validado, clienteId, id: await siguienteId("pedidos") });
  await PedidoModel.create({ ...pedido });
  const itemsCreados = [];
  for (const itemData of validado.items) {
    const item = new ItemPedido({
      ...itemData,
      pedidoId: pedido.id,
      id: await siguienteId("items"),
    });
    await ItemModel.create({ ...item });
    itemsCreados.push(item);
  }
  return { ...pedido, items: itemsCreados };
}

/**
 * Actualiza los campos enviados, conservando los omitidos.
 * Valida la matriz de transiciones (D1): sin retrocesos, sin reabrir
 * terminales y sin cancelar una vez enviado. No permite vaciar el pedido
 * vía PUT (los ítems se gestionan por sus endpoints).
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
  const cliente = await clientesRepo.obtenerPorId(clienteId);
  exigir(cliente, "El cliente indicado no existe", 404);

  const estadoAnterior = anterior.estado ?? "pendiente";
  const estadoNuevo = datos.estado === undefined ? estadoAnterior : datos.estado;
  exigir(
    Pedido.puedeTransitar(estadoAnterior, estadoNuevo),
    `Transición de estado no permitida de ${estadoAnterior} a ${estadoNuevo}`,
    409,
  );
  // Un cliente inactivo no puede confirmar ni avanzar el pedido (D8).
  if (estadoNuevo !== estadoAnterior && estadoNuevo !== "pendiente" && estadoNuevo !== "cancelado") {
    exigir(
      String(cliente.estado ?? "Activo").toLowerCase() === "activo",
      "No se puede confirmar ni avanzar un pedido de un cliente inactivo",
      409,
    );
  }
  // Cancelar exige que el pedido tenga al menos un producto (no se cancela vacío).
  if (estadoNuevo === "cancelado" && estadoAnterior !== "cancelado") {
    const cantidad = await ItemModel.countDocuments({ pedidoId: id });
    exigir(cantidad > 0, "No se puede cancelar un pedido sin productos", 409);
  }

  const pedido = new Pedido(
    validarPedido({ ...limpio(anterior), ...datos, clienteId, estado: estadoNuevo, id }),
  );
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
 * No se agregan ítems a pedidos cancelados o entregados (terminales).
 * @param {number} pedidoId
 * @param {Object} datos
 * @returns {Promise<ItemPedido>} El ítem creado.
 */
async function crearItem(pedidoId, datos, { permitirPrimerItem = false } = {}) {
  const pedido = await PedidoModel.findOne({ id: pedidoId }).lean();
  exigirEncontrado(pedido ? [pedido] : [], pedidoId, "Pedido");
  const estado = pedido.estado;
  if (!permitirPrimerItem) {
    // Regla: un pedido solo acepta nuevos productos si está en preparación.
    exigir(
      estado === "en_preparacion",
      "Un pedido solo puede agregar nuevos productos cuando está en preparación",
      409,
    );
  } else {
    // Alta en 2 pasos: solo el primer ítem, y no en estados terminales.
    exigir(
      estado !== "cancelado" && estado !== "entregado",
      `No se pueden agregar productos a un pedido ${estado}`,
      409,
    );
    const existentes = await ItemModel.countDocuments({ pedidoId });
    exigir(existentes === 0, "El pedido ya tiene productos; use el detalle para agregar más", 409);
  }

  const productos = await leerProductosCrudos();
  const item = new ItemPedido(
    validarItemPedido({ ...datos, pedidoId, id: await siguienteId("items") }),
  );
  exigirProductoActivo(productos, item.productoId);

  await ItemModel.create({ ...item });
  return item;
}

/**
 * Actualiza los campos enviados de un ítem del pedido.
 * No se modifican ítems de pedidos cancelados o entregados (terminales).
 * @param {number} pedidoId
 * @param {number} itemId
 * @param {Object} datos
 * @returns {Promise<ItemPedido>} El ítem actualizado.
 */
async function actualizarItem(pedidoId, itemId, datos) {
  const pedido = await PedidoModel.findOne({ id: pedidoId }).lean();
  exigirEncontrado(pedido ? [pedido] : [], pedidoId, "Pedido");
  exigir(
    pedido.estado === "en_preparacion",
    "Los productos de un pedido solo se pueden modificar cuando está en preparación",
    409,
  );

  const anteriores = (await leerItemsCrudos()).filter(
    (i) => i.pedidoId === pedidoId,
  );
  const anterior = exigirEncontrado(anteriores, itemId, "Ítem");

  const productos = await leerProductosCrudos();
  const item = new ItemPedido(
    validarItemPedido({ ...limpio(anterior), ...datos, pedidoId, id: itemId }),
  );
  exigirProductoActivo(productos, item.productoId);

  await ItemModel.updateOne({ id: itemId }, { $set: { ...item } });
  return item;
}

/**
 * Elimina un ítem sin dejar el pedido vacío (D3): cada pedido mantiene
 * al menos un producto. Tampoco se tocan ítems de pedidos terminales.
 * @param {number} pedidoId
 * @param {number} itemId
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
async function eliminarItem(pedidoId, itemId) {
  const pedido = await PedidoModel.findOne({ id: pedidoId }).lean();
  exigirEncontrado(pedido ? [pedido] : [], pedidoId, "Pedido");
  exigir(
    pedido.estado === "en_preparacion",
    "Los productos de un pedido solo se pueden quitar cuando está en preparación",
    409,
  );
  const cantidad = await ItemModel.countDocuments({ pedidoId });
  exigir(cantidad > 1, "El pedido debe mantener al menos un producto", 409);

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
  const producto = new Producto(
    validarProducto({ ...datos, id: await siguienteId("productos") }),
  );
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

  const producto = new Producto(
    validarProducto({ ...limpio(anterior), ...datos, id }),
  );
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
  const catalogo = docs.map((r) => ({ id: r._id, nombre: r.nombre }));
  // Si el catálogo aún no fue enriquecido con rutas reales, se exponen igual
  // para no romper el formulario; la validación de chofer corre al asignar.
  return catalogo;
}

/**
 * Resuelve una ruta del catálogo a su ruta real (D4 opción 1).
 * Convención: el catálogo se enriquece con rutas reales usando el mismo id
 * numérico que la colección "rutas" (seed/mock). Si no hay ruta real con ese
 * id, se usa el catálogo tal cual por compatibilidad.
 */
async function resolverRutaReal(rutaCatalogoId) {
  const real = await RutaModel.findOne({ id: rutaCatalogoId }).lean();
  return real || null;
}

/**
 * Asigna una ruta a un pedido, o la quita enviando rutaId null (D4 + D5).
 * - Bloquea asignar si el pedido está cancelado o entregado.
 * - Bloquea asignar un pedido de cliente inactivo o sin productos.
 * - Usa la ruta real (mismo id) para validar que su chofer esté Disponible.
 * @param {number} pedidoId
 * @param {number|null} rutaId
 * @returns {Promise<{pedidoId: number, rutaId: number|null}>} La asignación guardada.
 */
async function asignarRuta(pedidoId, rutaId) {
  const pedido = await PedidoModel.findOne({ id: pedidoId }).lean();
  exigirEncontrado(pedido ? [pedido] : [], pedidoId, "Pedido");
  if (rutaId !== null) {
    exigir(
      pedido.estado !== "cancelado",
      "Un pedido cancelado no puede ser asignado para su entrega",
      409,
    );
    exigir(
      pedido.estado !== "entregado",
      "Un pedido entregado no puede volver a asignarse para su entrega",
      409,
    );
    const ruta = await RutaCatalogoModel.findById(rutaId).lean();
    exigirEncontrado(ruta ? [{ id: ruta._id }] : [], rutaId, "Ruta");
    const cliente = await clientesRepo.obtenerPorId(pedido.clienteId);
    exigir(
      cliente && String(cliente.estado ?? "Activo").toLowerCase() === "activo",
      "No se puede asignar ruta a un pedido de un cliente inactivo",
      409,
    );
    const cantidad = await ItemModel.countDocuments({ pedidoId });
    exigir(cantidad > 0, "No se puede asignar ruta a un pedido sin productos", 409);
    // Chofer disponible: se resuelve desde la ruta real con el mismo id.
    const rutaReal = await resolverRutaReal(Number(rutaId));
    if (rutaReal?.choferId !== undefined && rutaReal?.choferId !== null) {
      const chofer = await ChoferModel.findOne({ id: rutaReal.choferId }).lean();
      exigir(chofer, "La ruta no tiene un chofer válido asignado", 409);
      exigir(
        String(chofer.estado ?? "").toLowerCase() === "disponible",
        "Solo un chofer disponible puede recibir un pedido para entregar",
        409,
      );
    }
  }

  await AsignacionModel.deleteMany({ pedidoId });
  if (rutaId !== null) await AsignacionModel.create({ pedidoId, rutaId });
  return { pedidoId, rutaId };
}

export default {
  obtenerTodas,
  obtenerPorId,
  crear,
  crearCabecera,
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

