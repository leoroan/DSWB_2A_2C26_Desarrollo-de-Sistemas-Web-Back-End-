import "dotenv/config";

/**
 * Configuración central de la aplicación, leída desde variables de entorno.
 * El archivo `.env` (ver `.env.example`) define estos valores.
 */
const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongo: {
    // URI de conexión a MongoDB (local o MongoDB Atlas).
    // Ejemplo Atlas: mongodb+srv://<user>:<pass>@<cluster>.mongodb.net
    uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
    // Nombre de la base de datos dentro del clúster.
    dbName: process.env.MONGODB_DB || "freshroute",
    // Tiempo máximo de espera para encontrar un servidor (ms).
    serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS) || 10000,
  },
};

export default config;
