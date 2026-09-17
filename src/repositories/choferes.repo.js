const { leerJson, escribirJson } = require("../utils/persistencia");
const Chofer = require("../models/Chofer");

const ARCHIVO = "choferes";

function mapearAChofer(datos) {
  return new Chofer(
    datos.id, datos.nombre, datos.apellido, datos.edad, datos.email,
    datos.fechaAlta, datos.estado, datos.licencia, datos.vehiculoId
  );
}

async function obtenerTodos() {
  const choferes = await leerJson(ARCHIVO);
  return choferes.map(mapearAChofer);
}

async function obtenerPorId(id) {
  const choferes = await obtenerTodos();
  return choferes.find((c) => c.id === id) || null;
}

async function crear(datos) {
  const choferes = await leerJson(ARCHIVO);
  const siguienteId = choferes.length
    ? Math.max(...choferes.map((c) => c.id)) + 1
    : 1;

  const nuevo = mapearAChofer({ id: siguienteId, ...datos });
  choferes.push(nuevo);
  await escribirJson(ARCHIVO, choferes);
  return nuevo;
}

async function actualizar(id, cambios) {
  const choferes = await leerJson(ARCHIVO);
  const indice = choferes.findIndex((c) => c.id === id);
  if (indice === -1) return null;

  const actualizado = mapearAChofer({ ...choferes[indice], ...cambios, id });
  choferes[indice] = actualizado;
  await escribirJson(ARCHIVO, choferes);
  return actualizado;
}

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar };