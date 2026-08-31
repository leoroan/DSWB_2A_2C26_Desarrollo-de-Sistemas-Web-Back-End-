const express = require("express");
const path = require("node:path"); // Importar path para manejar rutas de archivos
const requestLogger = require("./src/middlewares/requestLogger");
const errorHandler = require("./src/middlewares/errorHandler");
const webRoutes = require("./src/routes/web.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del motor de plantillas Pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src", "views"));

// Middlewares globales
app.use(express.json()); // Para parsear el body de requests JSON
app.use(express.urlencoded({ extended: true })); // Para parsear el body de forms HTML
app.use(requestLogger); // Nuestro logger de requests

// Rutas web (manejo de vistas y formularios)
app.use("/", webRoutes);

// Middleware de manejo centralizado de errores
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor FreshRoute B2B corriendo en http://localhost:${PORT}`);
  console.log(`Accede al Dashboard de Oficina en: http://localhost:${PORT}/`);
  console.log(
    `Accede al Simulador de Chofer en: http://localhost:${PORT}/simulador`,
  );
  console.log(
    `Accede a la Documentación Académica en: http://localhost:${PORT}/documentacion`,
  );
  console.log(
    `Los Endpoints de la API REST comienzan en: http://localhost:${PORT}/api`,
  );
});
