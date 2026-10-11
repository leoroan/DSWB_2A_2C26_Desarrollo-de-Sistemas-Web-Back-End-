import repo from "../repositories/pedidos.repo.js";

// ============================================================================
// RUTAS API — JSON
// ============================================================================

export async function listar(req, res) {
  return res.json(await repo.obtenerProductos());
}

export async function detalle(req, res) {
  const producto = await repo.obtenerProductoPorId(Number(req.params.id));
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(producto);
};

export async function crear(req, res) {
  res.status(201).json(await repo.crearProducto(req.body));
}

export async function actualizar(req, res) {
  const producto = await repo.actualizarProducto(
    Number(req.params.id),
    req.body,
  );
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(producto);
};

export async function eliminar(req, res) {
  const eliminado = await repo.eliminarProducto(Number(req.params.id));
  if (!eliminado) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.status(204).send();
};
