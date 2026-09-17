const {
  leerArchivoJson,
  escribirArchivoJson,
} = require("../utils/persistencia");
const Remito = require("../models/Remito");

/**
 * Repositorio de remitos.
 * Cada modelo tiene su propio archivo JSON independiente en data/.
 * Los remitos viven en data/remitos.json (array plano).
 * Para resolver relaciones (pedido, cliente, entrega) se leen los
 * archivos correspondientes: pedidos.json, clientes.json, entregas.json.
 */
const ARCHIVO = "remitos.json";

/**
 * Lee los pedidos y clientes para formularios.
 * Resuelve desde sus archivos independientes (si existen).
 * @returns {Promise<{pedidos: Array, clientes: Array}>}
 */
async function obtenerPedidos() {
  const pedidos = await leerArchivoJson("pedidos.json");
  const clientes = await leerArchivoJson("clientes.json");
  return { pedidos, clientes };
}

/** Convierte un objeto crudo del JSON en una instancia de Remito,
 * resolviendo el contexto de la cadena (cliente, pedido, entrega)
 * para las vistas. */
function mapearARemito(datos, pedidos, clientes, entregas) {
  const remito = new Remito(
    datos.id,
    datos.pedidoId,
    datos.fechaEmision,
    datos.fechaVencimiento,
    datos.montoTotal,
    datos.estado,
    datos.firmadoPor,
    datos.observaciones,
    datos.penalizacionAplicada,
  );

  // Resolución de la cadena logística: Remito → Pedido → Cliente
  const pedido = pedidos.find((p) => p.id === datos.pedidoId);
  remito.pedido = pedido || null;

  const cliente = pedido
    ? clientes.find((c) => c.id === pedido.clienteId)
    : null;
  remito.cliente = cliente ? cliente.nombre : null;

  // Remito → Entrega (si existe)
  remito.entrega =
    entregas.find((e) => e.pedidoId === datos.pedidoId) || null;

  return remito;
}

/**
 * @returns {Promise<Array<Remito>>} Todos los remitos almacenados.
 */
async function obtenerTodas() {
  const remitos = await leerArchivoJson(ARCHIVO);
  const [pedidos, clientes, entregas] = await Promise.all([
    leerArchivoJson("pedidos.json"),
    leerArchivoJson("clientes.json"),
    leerArchivoJson("entregas.json"),
  ]);
  return remitos.map((r) => mapearARemito(r, pedidos, clientes, entregas));
}

/**
 * @param {number} id
 * @returns {Promise<Remito|null>} El remito con ese id o null si no existe.
 */
async function obtenerPorId(id) {
  const remitos = await obtenerTodas();
  return remitos.find((r) => r.id === id) || null;
}

/**
 * Agrega un remito nuevo. El id se genera automáticamente (autoincremental).
 * @param {Object} datos
 * @returns {Promise<Remito>} El remito recién creado.
 */
async function crear(datos) {
  const remitos = await leerArchivoJson(ARCHIVO);
  const siguienteId = remitos.length
    ? Math.max(...remitos.map((r) => r.id)) + 1
    : 1;

  const nuevoObjeto = {
    id: siguienteId,
    pedidoId: datos.pedidoId,
    fechaEmision: datos.fechaEmision,
    fechaVencimiento: datos.fechaVencimiento,
    montoTotal: datos.montoTotal,
    estado: datos.estado,
    firmadoPor: datos.firmadoPor,
    observaciones: datos.observaciones,
    penalizacionAplicada: datos.penalizacionAplicada,
  };

  remitos.push(nuevoObjeto);
  await escribirArchivoJson(ARCHIVO, remitos);

  // Hidratar para devolver la instancia completa con contexto
  const [pedidos, clientes, entregas] = await Promise.all([
    leerArchivoJson("pedidos.json"),
    leerArchivoJson("clientes.json"),
    leerArchivoJson("entregas.json"),
  ]);
  return mapearARemito(nuevoObjeto, pedidos, clientes, entregas);
}

/**
 * Modifica los datos de un remito existente manteniendo su id.
 * @param {number} id
 * @param {Object} cambios
 * @returns {Promise<Remito|null>} El remito actualizado o null si no existe.
 */
async function actualizar(id, cambios) {
  const remitos = await leerArchivoJson(ARCHIVO);
  const indice = remitos.findIndex((r) => r.id === id);
  if (indice === -1) return null;

  remitos[indice] = {
    ...remitos[indice],
    ...cambios,
    id,
  };

  await escribirArchivoJson(ARCHIVO, remitos);

  // Leer contexto para devolver instancia hidratada
  const [pedidos, clientes, entregas] = await Promise.all([
    leerArchivoJson("pedidos.json"),
    leerArchivoJson("clientes.json"),
    leerArchivoJson("entregas.json"),
  ]);
  return mapearARemito(remitos[indice], pedidos, clientes, entregas);
}

/**
 * Elimina un remito del archivo independiente.
 * @param {number} id
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
async function eliminar(id) {
  const remitos = await leerArchivoJson(ARCHIVO);
  const indice = remitos.findIndex((r) => r.id === id);
  if (indice === -1) return false;

  remitos.splice(indice, 1);
  await escribirArchivoJson(ARCHIVO, remitos);
  return true;
}

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPedidos,
};
