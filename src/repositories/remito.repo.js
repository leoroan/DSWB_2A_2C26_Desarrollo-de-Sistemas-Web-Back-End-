import { modelos, siguienteId } from "../database/models/index.js";
import { limpio } from "../config/database.js";
import Remito from "../models/Remito.js";

/**
 * Repositorio de remitos (MongoDB).
 * Reemplaza data/remitos.json conservando la misma interfaz. Las relaciones
 * (pedido, cliente, entrega) se resuelven igual que antes, consultando las
 * colecciones correspondientes para hidratar las vistas.
 */
const RemitoModel = modelos.Remito;
const PedidoModel = modelos.Pedido;
const ClienteModel = modelos.Cliente;

/** Convierte un documento plano de Mongo en instancia de Remito, resolviendo
 * el contexto de la cadena (cliente, pedido) para las vistas. */
function mapearARemito(doc, pedidos, clientes) {
  const remito = new Remito(
    doc.id,
    doc.pedidoId,
    doc.fechaEmision,
    doc.fechaVencimiento,
    doc.montoTotal,
    doc.estado,
    doc.firmadoPor,
    doc.observaciones,
    doc.penalizacionAplicada,
  );

  // Resolución de la cadena logística: Remito → Pedido → Cliente
  const pedido = pedidos.find((p) => p.id === doc.pedidoId) || null;
  remito.pedido = pedido;

  const cliente = pedido
    ? clientes.find((c) => String(c.id) === String(pedido.clienteId))
    : null;
  remito.cliente = cliente ? cliente.nombre : null;

  return remito;
}

/** Lee los pedidos y clientes para resolver relaciones y formularios. */
async function leerContexto() {
  const [pedidos, clientes] = await Promise.all([
    PedidoModel.find().lean(),
    ClienteModel.find().lean(),
  ]);
  return { pedidos: pedidos.map(limpio), clientes: clientes.map(limpio) };
}

/**
 * @returns {Promise<Array<Remito>>} Todos los remitos almacenados.
 */
async function obtenerTodas() {
  const [docs, { pedidos, clientes }] = await Promise.all([
    RemitoModel.find().lean(),
    leerContexto(),
  ]);
  return docs.map((r) => mapearARemito(limpio(r), pedidos, clientes));
}

/**
 * @param {number} id
 * @returns {Promise<Remito|null>} El remito con ese id o null si no existe.
 */
async function obtenerPorId(id) {
  const doc = await RemitoModel.findOne({ id }).lean();
  if (!doc) return null;
  const { pedidos, clientes } = await leerContexto();
  return mapearARemito(limpio(doc), pedidos, clientes);
}

/**
 * Agrega un remito nuevo. El id se genera automáticamente (autoincremental).
 * @param {Object} datos
 * @returns {Promise<Remito>} El remito recién creado.
 */
async function crear(datos) {
  const nuevo = { ...datos, id: await siguienteId("remitos") };
  await RemitoModel.create(nuevo);

  const { pedidos, clientes } = await leerContexto();
  return mapearARemito(limpio(nuevo), pedidos, clientes);
}

/**
 * Modifica los datos de un remito existente manteniendo su id.
 * @param {number} id
 * @param {Object} cambios
 * @returns {Promise<Remito|null>} El remito actualizado o null si no existe.
 */
async function actualizar(id, cambios) {
  const doc = await RemitoModel.findOneAndUpdate(
    { id },
    { $set: { ...cambios, id } },
    { new: true },
  ).lean();
  if (!doc) return null;

  const { pedidos, clientes } = await leerContexto();
  return mapearARemito(limpio(doc), pedidos, clientes);
}

/**
 * Elimina un remito.
 * @param {number} id
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
async function eliminar(id) {
  const res = await RemitoModel.deleteOne({ id });
  return res.deletedCount > 0;
}

/**
 * Lee los pedidos y clientes para formularios.
 * @returns {Promise<{pedidos: Array, clientes: Array}>}
 */
async function obtenerPedidos() {
  return leerContexto();
}

export default { obtenerTodas, obtenerPorId, crear, actualizar, eliminar, obtenerPedidos };
