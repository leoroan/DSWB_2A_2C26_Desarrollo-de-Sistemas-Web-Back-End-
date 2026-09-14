const {
  leerJsonObjeto,
  escribirArchivoJson,
} = require("../utils/persistencia");
const Remito = require("../models/Remito");

/**
 * Repositorio de remitos.
 * Capa de acceso a datos: los remitos viven dentro de la estructura
 * integral de FreshRoute.json (cadena: Cliente → Pedido → Ruta → Paradas
 * → Chofer/Vehículo → Telemetría → Entrega → Remito).
 */
const ARCHIVO = "FreshRoute.json";

/** Estructura por defecto de FreshRoute (por si falta alguna colección). */
function estructuraBase() {
  return {
    clientes: [],
    pedidos: [],
    rutas: [],
    choferes: [],
    vehiculos: [],
    telemetrias: [],
    entregas: [],
    remitos: [],
  };
}

/** Lee FreshRoute.json completo, garantizando la estructura base. */
async function leerFreshRoute() {
  const datos = await leerJsonObjeto(ARCHIVO);
  return { ...estructuraBase(), ...datos };
}

/** Guarda FreshRoute.json completo. */
async function guardarFreshRoute(datos) {
  await escribirArchivoJson(ARCHIVO, datos);
}

/**
 * Convierte un objeto crudo del JSON en una instancia de Remito.
 * Además resuelve el "contexto" de la cadena (cliente, pedido, entrega)
 * y lo adjunta como propiedades extra para las vistas.
 */
function mapearARemito(datos, freshRoute) {
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
  const pedido = freshRoute.pedidos.find((p) => p.id === datos.pedidoId);
  remito.pedido = pedido || null;

  const cliente = pedido
    ? freshRoute.clientes.find((c) => c.id === pedido.clienteId)
    : null;
  remito.cliente = cliente ? cliente.nombre : null;

  // Remito → Entrega (si existe)
  remito.entrega =
    freshRoute.entregas.find((e) => e.pedidoId === datos.pedidoId) || null;

  return remito;
}

/**
 * @returns {Promise<Array<Remito>>} Todos los remitos almacenados.
 */
async function obtenerTodas() {
  const freshRoute = await leerFreshRoute();
  return freshRoute.remitos.map((r) => mapearARemito(r, freshRoute));
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
  const freshRoute = await leerFreshRoute();
  const siguienteId = freshRoute.remitos.length
    ? Math.max(...freshRoute.remitos.map((r) => r.id)) + 1
    : 1;

  const nuevo = mapearARemito({ id: siguienteId, ...datos }, freshRoute);
  freshRoute.remitos.push({
    id: nuevo.id,
    pedidoId: nuevo.pedidoId,
    fechaEmision: nuevo.fechaEmision,
    fechaVencimiento: nuevo.fechaVencimiento,
    montoTotal: nuevo.montoTotal,
    estado: nuevo.estado,
    firmadoPor: nuevo.firmadoPor,
    observaciones: nuevo.observaciones,
    penalizacionAplicada: nuevo.penalizacionAplicada,
  });

  // Persistimos en el archivo: el cambio sobrevive al reinicio del servidor.
  await guardarFreshRoute(freshRoute);
  return nuevo;
}

/**
 * Modifica los datos de un remito existente manteniendo su id.
 * @param {number} id
 * @param {Object} cambios
 * @returns {Promise<Remito|null>} El remito actualizado o null si no existe.
 */
async function actualizar(id, cambios) {
  const freshRoute = await leerFreshRoute();
  const indice = freshRoute.remitos.findIndex((r) => r.id === id);
  if (indice === -1) return null;

  const actualizado = mapearARemito(
    { ...freshRoute.remitos[indice], ...cambios, id },
    freshRoute,
  );

  // Guardamos solo los campos propios del remito (sin el contexto adjuntado)
  freshRoute.remitos[indice] = {
    id,
    pedidoId: actualizado.pedidoId,
    fechaEmision: actualizado.fechaEmision,
    fechaVencimiento: actualizado.fechaVencimiento,
    montoTotal: actualizado.montoTotal,
    estado: actualizado.estado,
    firmadoPor: actualizado.firmadoPor,
    observaciones: actualizado.observaciones,
    penalizacionAplicada: actualizado.penalizacionAplicada,
  };
  await guardarFreshRoute(freshRoute);
  return actualizado;
}

/**
 * Elimina un remito de la estructura almacenada.
 * @param {number} id
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
async function eliminar(id) {
  const freshRoute = await leerFreshRoute();
  const indice = freshRoute.remitos.findIndex((r) => r.id === id);
  if (indice === -1) return false;

  freshRoute.remitos.splice(indice, 1);
  await guardarFreshRoute(freshRoute);
  return true;
}

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
