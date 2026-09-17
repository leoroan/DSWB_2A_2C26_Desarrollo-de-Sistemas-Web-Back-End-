const repo = require("../repositories/pedidos.repo");

// ============================================================================
// RUTAS API — JSON
// ============================================================================

/** GET /api/productos → todos. */
exports.listar = async (req, res) => res.json(await repo.obtenerProductos());

/** GET /api/productos/:id → uno. */
exports.detalle = async (req, res) => {
  const producto = await repo.obtenerProductoPorId(Number(req.params.id));
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(producto);
};

/** POST /api/productos → crear. */
exports.crear = async (req, res) =>
  res.status(201).json(await repo.crearProducto(req.body));

/** PUT /api/productos/:id → actualizar los campos enviados. */
exports.actualizar = async (req, res) => {
  const producto = await repo.actualizarProducto(
    Number(req.params.id),
    req.body,
  );
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(producto);
};

/** DELETE /api/productos/:id → eliminar (409 si está asociado a un pedido). */
exports.eliminar = async (req, res) => {
  const eliminado = await repo.eliminarProducto(Number(req.params.id));
  if (!eliminado) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.status(204).send();
};
