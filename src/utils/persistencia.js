const fs = require("node:fs/promises");
const path = require("node:path");

// Ruta al archivo de personas original (compatibilidad)
const rutaArchivo = path.join(__dirname, "..", "data", "personas.json");

async function leerJson() {
  try {
    const contenido = await fs.readFile(rutaArchivo, "utf-8");
    const datos = JSON.parse(contenido);
    return Array.isArray(datos) ? datos : [];
  } catch {
    return []; // Si el archivo aún no existe o está vacío: se devuelve array vacío.
  }
}

async function escribirJson(datos) {
  await fs.writeFile(rutaArchivo, JSON.stringify(datos, null, 2), "utf-8");
}

// NUEVAS FUNCIONES GENÉRICAS PARA "FreshRoute B2B" (JSON DB)
async function leerArchivoJson(nombreArchivo) {
  const ruta = path.join(__dirname, "..", "data", nombreArchivo);
  try {
    const contenido = await fs.readFile(ruta, "utf-8");
    const datos = JSON.parse(contenido);
    return Array.isArray(datos) ? datos : [];
  } catch {
    return []; // Si no existe o tiene error, retorna arreglo vacío
  }
}

async function escribirArchivoJson(nombreArchivo, datos) {
  const ruta = path.join(__dirname, "..", "data", nombreArchivo);
  // Aseguramos que el directorio data exista
  const dir = path.dirname(ruta);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // Si ya existe u otro error, se ignora
  }
  await fs.writeFile(ruta, JSON.stringify(datos, null, 2), "utf-8");
}

module.exports = {
  leerJson,
  escribirJson,
  rutaArchivo,
  leerArchivoJson,
  escribirArchivoJson
};
