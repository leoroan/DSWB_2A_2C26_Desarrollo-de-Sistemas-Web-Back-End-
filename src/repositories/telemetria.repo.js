const { leerJson, escribirJson } = require("../utils/persistencia");
const RegistroTelemetria = require("../models/RegistroTelemetria");

const ARCHIVO = "telemetria"; 

function mapearATelemetria(datos) {
  return new RegistroTelemetria(
    datos.id, datos.vehiculoId, datos.timestamp, datos.latitud,
    datos.longitud, datos.temperatura, datos.velocidad, datos.estadoMotor
  );
}

async function obtenerTodos() {
  const registros = await leerJson(ARCHIVO);
  return registros.map(mapearATelemetria);
}

async function crear(datos) {
  const registros = await leerJson(ARCHIVO);
  const siguienteId = registros.length
    ? Math.max(...registros.map((r) => r.id)) + 1
    : 1;

  // fecha y hora actual automáticamente
  datos.timestamp = new Date().toISOString();

  const nuevo = mapearATelemetria({ id: siguienteId, ...datos });
  registros.push(nuevo);
  await escribirJson(ARCHIVO, registros);
  return nuevo;
}

// método extra para la vista de detalle
async function obtenerPorVehiculo(vehiculoId) {
  const registros = await obtenerTodos();
  return registros.filter(r => r.vehiculoId === parseInt(vehiculoId));
}

module.exports = { obtenerTodos, crear, obtenerPorVehiculo };