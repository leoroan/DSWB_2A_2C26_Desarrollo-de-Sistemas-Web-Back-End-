const { leerJson, escribirJson } = require("../utils/persistencia");
const Persona = require("../models/Persona");

/**
 * Repositorio de personas.
 * Capa de acceso a datos: hoy simula la base de datos con personas.json.
 * Todos los objetos crudos del JSON se hidratan como instancias de la
 * clase Persona antes de devolverse. En una clase futura, este mismo
 * archivo puede cambiarse por una conexión a MongoDB sin que controllers
 * ni routes tengan que modificarse.
 */

/** Convierte un objeto crudo del JSON en una instancia de Persona. */
function mapearAPersona(datos) {
  return new Persona(datos.id, datos.nombre, datos.apellido, datos.edad, datos.email);
}

/** @returns {Promise<Array<Persona>>} Todas las personas almacenadas. */
async function obtenerTodas() {
  const personas = await leerJson();
  return personas.map(mapearAPersona);
}

/**
 * @param {number} id
 * @returns {Promise<Persona|null>} La persona con ese id o null si no existe.
 */
async function obtenerPorId(id) {
  const personas = await obtenerTodas();
  return personas.find((p) => p.id === id) || null;
}

/**
 * Agrega una persona nueva. El id se genera automáticamente (autoincremental).
 * @param {Object} datos
 * @returns {Promise<Persona>} La persona recién creada.
 */
async function crear(datos) {
  const personas = await leerJson();
  const siguienteId = personas.length
    ? Math.max(...personas.map((p) => p.id)) + 1
    : 1;

  const nueva = mapearAPersona({ id: siguienteId, ...datos });
  personas.push(nueva);

  // Persistimos en el archivo: el cambio sobrevive al reinicio del servidor.
  await escribirJson(personas);
  return nueva;
}

/**
 * Modifica los datos de una persona existente manteniendo su id.
 * @param {number} id
 * @param {Object} cambios
 * @returns {Promise<Persona|null>} La persona actualizada o null si no existe.
 */
async function actualizar(id, cambios) {
  const personas = await leerJson();
  const indice = personas.findIndex((p) => p.id === id);
  if (indice === -1) return null;

  const actualizada = mapearAPersona({ ...personas[indice], ...cambios, id });
  personas[indice] = actualizada;
  await escribirJson(personas);
  return actualizada;
}

/**
 * Elimina una persona de la estructura almacenada.
 * @param {number} id
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
async function eliminar(id) {
  const personas = await leerJson();
  const indice = personas.findIndex((p) => p.id === id);
  if (indice === -1) return false;

  personas.splice(indice, 1);
  await escribirJson(personas);
  return true;
}

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };

/**
 * Elimina una persona de la estructura almacenada.
 * @param {number} id
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
async function eliminar(id) {
  const personas = await leerJson();
  const indice = personas.findIndex((p) => p.id === id);
  if (indice === -1) return false;

  personas.splice(indice, 1);
  await escribirJson(personas);
  return true;
}

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };