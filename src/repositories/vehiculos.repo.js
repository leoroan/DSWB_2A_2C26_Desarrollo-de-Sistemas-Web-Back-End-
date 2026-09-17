const { leerJson, escribirJson } = require("../utils/persistencia");
const Vehiculo = require("../models/Vehiculo");

const ARCHIVO = "vehiculos"; 

function mapearAVehiculo(datos) {
  return new Vehiculo(
    datos.id, datos.patente, datos.tipo, datos.capacidad,
    datos.temperaturaMin, datos.temperaturaMax, datos.estado,
    datos.choferAsignadoId, datos.ultimaActualizacionTelemetria
  );
}

async function obtenerTodos() {
  const vehiculos = await leerJson(ARCHIVO);
  return vehiculos.map(mapearAVehiculo);
}

async function obtenerPorId(id) {
  const vehiculos = await obtenerTodos();
  return vehiculos.find((v) => v.id === id) || null;
}

async function crear(datos) {
  const vehiculos = await leerJson(ARCHIVO);
  const siguienteId = vehiculos.length
    ? Math.max(...vehiculos.map((v) => v.id)) + 1
    : 1;

  const nuevo = mapearAVehiculo({ id: siguienteId, ...datos });
  vehiculos.push(nuevo);
  await escribirJson(ARCHIVO, vehiculos);
  return nuevo;
}

async function actualizar(id, cambios) {
  const vehiculos = await leerJson(ARCHIVO);
  const indice = vehiculos.findIndex((v) => v.id === id);
  if (indice === -1) return null;

  const actualizado = mapearAVehiculo({ ...vehiculos[indice], ...cambios, id });
  vehiculos[indice] = actualizado;
  await escribirJson(ARCHIVO, vehiculos);
  return actualizado;
}

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar };