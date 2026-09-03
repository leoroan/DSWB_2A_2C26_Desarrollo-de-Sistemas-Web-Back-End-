const { leerJson, escribirJson } = require("../utils/persistencia");

/**
 * Repositorio de personas.
 * Capa de acceso a datos: hoy simula la base de datos con personas.json.
 * En una clase futura, este mismo archivo puede cambiarse por una conexión
 * a MongoDB sin que controllers ni routes tengan que modificarse.
 */

/** @returns {Promise<Array>} Todas las personas almacenadas. */
async function obtenerTodas() {
  return leerJson();
}

/**
 * @param {number} id
 * @returns {Promise<Object|null>} La persona con ese id o null si no existe.
 */
async function obtenerPorId(id) {
  const personas = await leerJson();
  return personas.find((p) => p.id === id) || null;
}

/**
 * Agrega una persona nueva. El id se genera automáticamente (autoincremental).
 * @param {Object} datos
 * @returns {Promise<Object>} La persona recién creada.
 */
async function crear(datos) {
  const personas = await leerJson();
  const siguienteId = personas.length
    ? Math.max(...personas.map((p) => p.id)) + 1
    : 1;

  const nueva = { id: siguienteId, ...datos };
  personas.push(nueva);

  // Persistimos en el archivo: el cambio sobrevive al reinicio del servidor.
  await escribirJson(personas);
  return nueva;
}

/**
 * Modifica los datos de una persona existente manteniendo su id.
 * @param {number} id
 * @param {Object} cambios
 * @returns {Promise<Object|null>} La persona actualizada o null si no existe.
 */
async function actualizar(id, cambios) {
  const personas = await leerJson();
  const indice = personas.findIndex((p) => p.id === id);
  if (indice === -1) return null;

  personas[indice] = { ...personas[indice], ...cambios, id };
  await escribirJson(personas);
  return personas[indice];
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