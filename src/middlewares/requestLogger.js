/**
 * Middleware para registrar todas las peticiones entrantes.
 */
function requestLogger(req, res, next) {
  const inicio = Date.now();
  const fecha = new Date().toISOString();
  
  res.on("finish", () => {
    const duracion = Date.now() - inicio;
    console.log(`[${fecha}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duracion}ms)`);
  });
  
  next();
}

module.exports = requestLogger;