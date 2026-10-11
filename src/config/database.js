import mongoose from "mongoose";
import config from "./env.js";

/**
 * Conexión única y reutilizable a MongoDB mediante Mongoose.
 * Expone conectarDB() (idempotente) y helpers para conocer el estado.
 */

// Evita el doble registro de modelos al recargar en caliente.
mongoose.set("strictQuery", true);

let conectando = null;

/**
 * Abre (o reutiliza) la conexión a MongoDB.
 * @returns {Promise<typeof mongoose>}
 */
function conectarDB() {
  // 0 = desconectado, 1 = conectado, 2 = conectando, 3 = desconectando.
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);

  if (!conectando) {
    conectando = mongoose
      .connect(config.mongo.uri, {
        dbName: config.mongo.dbName,
        serverSelectionTimeoutMS: config.mongo.serverSelectionTimeoutMS,
      })
      .then(() => mongoose)
      .catch((err) => {
        // Permitir reintentar si la conexión falla.
        conectando = null;
        throw err;
      });
  }

  return conectando;
}

/**
 * Cierra la conexión activa (útil para tests o seed).
 * @returns {Promise<void>}
 */
async function cerrarDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  conectando = null;
}

// Logs útiles del ciclo de vida de la conexión.
mongoose.connection.on("connected", () => {
  console.log(
    `[MongoDB] Conectado a "${mongoose.connection.name}" correctamente.`,
  );
});
mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] Error de conexión:", err.message);
});
mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Desconectado.");
});

/**
 * Limpia un documento obtenido con .lean(): elimina el _id técnico de Mongo
 * para que el objeto conserve EXACTAMENTE los mismos campos que tenían los
 * JSON originales (no se exponen _id ni __v a las vistas ni a la API).
 * @param {Object} doc
 * @returns {Object}
 */
function limpio(doc) {
  if (!doc) return doc;
  const { _id, ...resto } = doc;
  return resto;
}

/** Igual que limpio() pero para un array de documentos. */
function limpios(docs) {
  return docs.map(limpio);
}

export { conectarDB, cerrarDB, mongoose, limpio, limpios };

