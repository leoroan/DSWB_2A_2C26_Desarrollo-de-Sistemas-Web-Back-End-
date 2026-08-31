/**
 * Middleware de manejo centralizado de errores.
 */
function errorHandler(err, req, res, next) {
  console.error("[ERROR INTERNO]:", err.message || err);
  
  const status = err.status || 500;
  const mensaje = err.message || "Ha ocurrido un error inesperado en el servidor.";
  
  // Si la petición es API JSON, responde JSON
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(status).json({
      error: true,
      status,
      message: mensaje
    });
  }
  
  // De lo contrario, renderiza la vista de error
  res.status(status).render("error", {
    titulo: "Error en FreshRoute B2B",
    mensaje
  });
}

module.exports = errorHandler;