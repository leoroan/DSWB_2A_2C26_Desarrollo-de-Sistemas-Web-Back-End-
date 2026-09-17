const { leerArchivoJson } = require("../utils/persistencia");
const Parada = require("../models/Parada");

const ARCHIVO_PARADAS = "paradas.json";

function mapearAParada(datos) {
  return new Parada(
    datos.id,
    datos.rutaId,
    datos.clienteId,
    datos.direccion,
    datos.orden,
    datos.estado,
    datos.latitud,
    datos.longitud,
    datos.fechaProgramada,
    datos.fechaReal,
    datos.observaciones,
    datos.motivoRechazo,
    datos.temperaturaAlMomento,
  );
}

async function obtenerPorRutaId(rutaId) {
  const paradas = await leerArchivoJson(ARCHIVO_PARADAS);
  return paradas
    .filter((parada) => parada.rutaId === rutaId)
    .sort((a, b) => a.orden - b.orden)
    .map(mapearAParada);
}

module.exports = { obtenerPorRutaId };