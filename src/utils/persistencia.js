const fs = require("node:fs/promises");
const path = require("node:path");

// Ruta al archivo que simula nuestra base de datos actuañl.
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

/**
 * Escribe un array completo en personas.json (persistencia en disco).
 */
async function escribirJson(datos) {
  await fs.writeFile(rutaArchivo, JSON.stringify(datos, null, 2), "utf-8");
}

module.exports = { leerJson, escribirJson, rutaArchivo };
