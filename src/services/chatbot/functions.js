import { modelos } from "../../models/index.js";
import { limpio } from "../../config/database.js";

const PedidoModel = modelos.Pedido;
const ClienteModel = modelos.Cliente;
const ProductoModel = modelos.Producto;
const ItemModel = modelos.ItemPedido;
const RutaModel = modelos.Ruta;
const RutaCatalogoModel = modelos.RutaCatalogo;
const AsignacionModel = modelos.Asignacion;

const ESTADOS_PEDIDO = [
  "pendiente",
  "confirmado",
  "en_preparacion",
  "en_reparto",
  "entregado",
  "cancelado",
];

function normalizarIdCliente(valor) {
  return valor;
}

function filtroClienteId(id) {
  if (id === undefined || id === null) return {};
  const s = String(id);
  return { $or: [{ clienteId: id }, { clienteId: s }] };
}

function serializarPedido(doc) {
  const d = limpio(doc);
  return {
    id: d.id,
    clienteId: d.clienteId,
    fechaPedido: d.fechaPedido,
    estado: d.estado,
    fechaEntregaSolicitada: d.fechaEntregaSolicitada,
    observaciones: d.observaciones,
  };
}

function serializarProducto(doc) {
  const d = limpio(doc);
  return {
    id: d.id,
    nombre: d.nombre,
    categoria: d.categoria,
    precio: d.precio,
    estado: d.estado,
  };
}

function serializarCliente(doc) {
  const d = limpio(doc);
  return {
    id: d.id,
    nombre: d.nombre,
    apellido: d.apellido,
    edad: d.edad,
    email: d.email,
    telefono: d.telefono,
    domicilioDeEntrega: d.domicilioDeEntrega,
    tipo: d.tipo,
    estado: d.estado,
    fechaAlta: d.fechaAlta,
  };
}

export const DECLARACIONES_FUNCIONES = [
  {
    name: "contarPedidosPorEstado",
    description:
      "Cuenta cuántos pedidos hay en cada estado (pendiente, confirmado, en_preparacion, en_reparto, entregado, cancelado).",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "obtenerDetallePedido",
    description:
      "Devuelve el detalle completo de un pedido por su ID: cabecera, cliente, ítems con productos y asignación de ruta si existe.",
    parameters: {
      type: "object",
      properties: {
        pedidoId: { type: "integer", description: "ID numérico del pedido." },
      },
      required: ["pedidoId"],
    },
  },
  {
    name: "listarPedidosPorCliente",
    description:
      "Lista los pedidos de un cliente identificados por su ID de negocio. Opcionalmente se puede filtrar por estado.",
    parameters: {
      type: "object",
      properties: {
        clienteId: {
          type: "string",
          description:
            "ID de negocio del cliente (String, generalmente Date.now()).",
        },
        estado: {
          type: "string",
          enum: ESTADOS_PEDIDO,
          description: "Estado opcional para filtrar los pedidos del cliente.",
        },
      },
      required: ["clienteId"],
    },
  },
  {
    name: "contarClientesPorEstado",
    description: "Cuenta cuántos clientes están Activos e Inactivos.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "buscarClientes",
    description:
      "Busca clientes cuyo nombre o apellido contengan el término indicado (búsqueda insensible a mayúsculas).",
    parameters: {
      type: "object",
      properties: {
        termino: {
          type: "string",
          description: "Texto a buscar en nombre o apellido del cliente.",
        },
      },
      required: ["termino"],
    },
  },
  {
    name: "obtenerDatosCliente",
    description:
      "Devuelve los datos básicos de un cliente por su ID de negocio.",
    parameters: {
      type: "object",
      properties: {
        clienteId: {
          type: "string",
          description: "ID de negocio del cliente.",
        },
      },
      required: ["clienteId"],
    },
  },
  {
    name: "listarProductosActivos",
    description:
      "Lista todos los productos con estado 'activo' (sin información de stock; solo nombre, categoría y precio).",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "buscarProductos",
    description:
      "Busca productos por nombre o categoría. Opcionalmente se puede filtrar por categoría exacta.",
    parameters: {
      type: "object",
      properties: {
        termino: {
          type: "string",
          description: "Texto a buscar en nombre o categoría.",
        },
        categoria: {
          type: "string",
          description: "Categoría exacta para filtrar (opcional).",
        },
      },
      required: [],
    },
  },
  {
    name: "obtenerPrecioProducto",
    description:
      "Devuelve el precio y datos básicos de un producto por su ID numérico.",
    parameters: {
      type: "object",
      properties: {
        productoId: {
          type: "integer",
          description: "ID numérico del producto.",
        },
      },
      required: ["productoId"],
    },
  },
];

// ============================================================================
// EJECUTOR DE FUNCIONES (solo lectura)
// ============================================================================

export async function ejecutarFuncion(nombre, argumentos = {}) {
  switch (nombre) {
    case "contarPedidosPorEstado":
      return await contarPedidosPorEstado();
    case "obtenerDetallePedido":
      return await obtenerDetallePedido(argumentos.pedidoId);
    case "listarPedidosPorCliente":
      return await listarPedidosPorCliente(
        argumentos.clienteId,
        argumentos.estado,
      );
    case "contarClientesPorEstado":
      return await contarClientesPorEstado();
    case "buscarClientes":
      return await buscarClientes(argumentos.termino);
    case "obtenerDatosCliente":
      return await obtenerDatosCliente(argumentos.clienteId);
    case "listarProductosActivos":
      return await listarProductosActivos();
    case "buscarProductos":
      return await buscarProductos(argumentos.termino, argumentos.categoria);
    case "obtenerPrecioProducto":
      return await obtenerPrecioProducto(argumentos.productoId);
    default:
      throw new Error(`Función de consulta no reconocida: ${nombre}`);
  }
}

async function contarPedidosPorEstado() {
  const porEstado = await PedidoModel.aggregate([
    { $group: { _id: "$estado", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).exec();
  const total = await PedidoModel.countDocuments().exec();
  return {
    ok: true,
    total,
    porEstado: porEstado.map((e) => ({ estado: e._id, count: e.count })),
  };
}

async function obtenerDetallePedido(pedidoId) {
  if (pedidoId === undefined || pedidoId === null)
    throw new Error("Se requiere el ID del pedido.");
  const pedidoDoc = await PedidoModel.findOne({ id: pedidoId }).lean();
  if (!pedidoDoc)
    return { ok: false, error: `No existe el pedido con ID ${pedidoId}.` };
  const pedido = serializarPedido(pedidoDoc);
  let cliente = null;
  const clienteDoc = await ClienteModel.findOne({
    $or: [{ id: pedido.clienteId }, { id: String(pedido.clienteId) }],
  }).lean();
  if (clienteDoc) cliente = serializarCliente(clienteDoc);
  const itemsDocs = await ItemModel.find({ pedidoId }).lean();
  const productosDocs = await ProductoModel.find().lean();
  const productosMap = new Map();
  for (const p of productosDocs) productosMap.set(p.id, serializarProducto(p));
  const items = itemsDocs.map((i) => {
    const d = limpio(i);
    const producto = productosMap.get(d.productoId) || null;
    return {
      id: d.id,
      productoId: d.productoId,
      cantidad: d.cantidad,
      observaciones: d.observaciones,
      producto,
    };
  });
  let asignacion = null;
  const asignacionDoc = await AsignacionModel.findOne({ pedidoId }).lean();
  if (asignacionDoc) {
    const d = limpio(asignacionDoc);
    let ruta = null;
    const rutaCatalogo = await RutaCatalogoModel.findById(d.rutaId).lean();
    if (rutaCatalogo) {
      const rutaReal = await RutaModel.findOne({ id: rutaCatalogo._id }).lean();
      if (rutaReal) {
        const rd = limpio(rutaReal);
        ruta = {
          id: rd.id,
          codigo: rd.codigo,
          estado: rd.estado,
          choferId: rd.choferId,
          vehiculoPatente: rd.vehiculoPatente,
        };
      } else {
        ruta = { id: rutaCatalogo._id, nombre: rutaCatalogo.nombre };
      }
    }
    asignacion = { rutaId: d.rutaId, ruta };
  }
  return { ok: true, pedido: { ...pedido, cliente, items, asignacion } };
}

async function listarPedidosPorCliente(clienteId, estado) {
  if (clienteId === undefined || clienteId === null)
    throw new Error("Se requiere el ID del cliente.");
  const filtro = filtroClienteId(clienteId);
  if (estado) filtro.estado = estado;
  const docs = await PedidoModel.find(filtro).sort({ fechaPedido: -1 }).lean();
  return {
    ok: true,
    clienteId,
    total: docs.length,
    pedidos: docs.map(serializarPedido),
  };
}

async function contarClientesPorEstado() {
  const porEstado = await ClienteModel.aggregate([
    { $group: { _id: "$estado", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).exec();
  const total = await ClienteModel.countDocuments().exec();
  return {
    ok: true,
    total,
    porEstado: porEstado.map((e) => ({ estado: e._id, count: e.count })),
  };
}

async function buscarClientes(termino) {
  if (!termino || typeof termino !== "string")
    throw new Error("Se requiere un término de búsqueda.");
  const regex = new RegExp(String(termino), "i");
  const docs = await ClienteModel.find({
    $or: [{ nombre: regex }, { apellido: regex }],
  }).lean();
  return {
    ok: true,
    termino,
    total: docs.length,
    clientes: docs.map(serializarCliente),
  };
}

async function obtenerDatosCliente(clienteId) {
  if (clienteId === undefined || clienteId === null)
    throw new Error("Se requiere el ID del cliente.");
  const doc = await ClienteModel.findOne({
    $or: [{ id: clienteId }, { id: String(clienteId) }],
  }).lean();
  if (!doc)
    return { ok: false, error: `No existe el cliente con ID ${clienteId}.` };
  return { ok: true, cliente: serializarCliente(doc) };
}

async function listarProductosActivos() {
  const docs = await ProductoModel.find({ estado: "activo" })
    .sort({ nombre: 1 })
    .lean();
  return {
    ok: true,
    total: docs.length,
    productos: docs.map(serializarProducto),
    nota: "El modelo Producto no dispone de campo de stock; solo se indica si está activo o inactivo.",
  };
}

async function buscarProductos(termino, categoria) {
  const filtro = {};
  if (categoria) filtro.categoria = categoria;
  if (termino && typeof termino === "string") {
    const regex = new RegExp(String(termino), "i");
    filtro.$or = [{ nombre: regex }, { categoria: regex }];
  }
  const docs = await ProductoModel.find(filtro).sort({ nombre: 1 }).lean();
  return {
    ok: true,
    termino,
    categoria,
    total: docs.length,
    productos: docs.map(serializarProducto),
  };
}

async function obtenerPrecioProducto(productoId) {
  if (productoId === undefined || productoId === null)
    throw new Error("Se requiere el ID del producto.");
  const doc = await ProductoModel.findOne({ id: productoId }).lean();
  if (!doc)
    return { ok: false, error: `No existe el producto con ID ${productoId}.` };
  return { ok: true, producto: serializarProducto(doc) };
}
