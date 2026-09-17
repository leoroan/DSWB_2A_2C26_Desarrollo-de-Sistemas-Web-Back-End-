const {
  leerArchivoJson,
} = require("../utils/persistencia");
const Ruta = require("../models/Ruta");

const ARCHIVO_RUTAS = "rutas.json";

function mapearARuta(datos) {
  return new Ruta(
    datos.id,
    datos.codigo,
    datos.planificadorId,
    datos.choferId,
    datos.estado,
    datos.fechaPlanificacion,
    datos.fechaEjecucion,
    datos.observaciones,
    datos.vehiculoPatente,
  );
}

async function obtenerTodas() {
  const rutas = await leerArchivoJson(ARCHIVO_RUTAS);
  return rutas.map(mapearARuta);
}

async function obtenerPorId(id) {
  const rutas = await obtenerTodas();
  return rutas.find((ruta) => ruta.id === id) || null;
}

module.exports = { obtenerTodas, obtenerPorId };