import express from "express";
import path from "node:path";
import { pathToFileURL } from "node:url";
import requestLogger from "./src/middlewares/requestLogger.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import webRoutes from "./src/routes/web.routes.js";
import apiRoutes from "./src/routes/api.routes.js";
import { conectarDB, cerrarDB } from "./src/config/database.js";
import authRoutes from "./src/routes/auth.routes.js";
import { cargarUsuario, requerirLogin } from "./src/middlewares/auth.js";
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del motor de plantillas Pug
app.set("view engine", "pug");
app.set("views", path.join(import.meta.dirname, "src", "views"));

// Middlewares globales
app.use(express.json()); // Para parsear el body de requests JSON
app.use(express.urlencoded({ extended: true })); // Para parsear el body de forms HTML
app.use(requestLogger); // Nuestro logger de requests

// Rutas web
// Incluye dashboard, pedidos, remitos, clientes, rutas, vehículos y telemetría.
app.use("/", cargarUsuario, authRoutes);
app.use("/", (req, res, next) => {
  if (req.path === "/api" || req.path.startsWith("/api/")) return next();
  requerirLogin(req, res, next);
}, webRoutes);

// Rutas de API REST (para Postman, integraciones, etc.)
app.use("/api", apiRoutes);

// Manejador 404 — captura cualquier ruta que no coincida
app.use((req, res, next) => {
  const err = new Error(
    `Recurso no encontrado: ${req.method} ${req.originalUrl}`,
  );
  err.status = 404;
  next(err);
});

// Middleware de manejo centralizado de errores
app.use(errorHandler);

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  // Conecta a MongoDB antes de levantar el servidor. Si falla, se informa el
  // error y se detiene el proceso (la app depende de la base de datos).
  conectarDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Servidor FreshRoute B2B corriendo en http://localhost:${PORT}`,
        );
        console.log(
          `Accede a la Documentación en: http://localhost:${PORT}/documentacion`,
        );
        console.log(
          `Los Endpoints de la API REST comienzan en: http://localhost:${PORT}/api`,
        );
      });
    })
    .catch((err) => {
      console.error(
        "[MongoDB] No se pudo iniciar la aplicación por un error de conexión:",
        err.message,
      );
      process.exit(1);
    });

  // Cierre ordenado.
  const apagar = async (signal) => {
    console.log(`\nRecibida señal ${signal}. Cerrando servidor...`);
    await cerrarDB();
    process.exit(0);
  };
  process.on("SIGINT", () => apagar("SIGINT"));
  process.on("SIGTERM", () => apagar("SIGTERM"));
}

export default app;
