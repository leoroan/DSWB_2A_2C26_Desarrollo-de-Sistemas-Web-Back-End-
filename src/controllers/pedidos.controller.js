const repo = require("../repositories/pedidos.repo");
const { exigir, idValido } = require("../utils/validaciones");

// ============================================================================
// RUTAS API — JSON
// ============================================================================

/** GET /api/pedidos → todos, con su cliente. */
exports.listar = async (req, res) => res.json(await repo.obtenerTodas());

/** GET /api/pedidos/:id → detalle con cliente, ítems y ruta. */
exports.detalle = async (req, res) => {
  const pedido = await repo.obtenerPorId(Number(req.params.id));
  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  res.json(pedido);
};

/** POST /api/pedidos → crear. */
exports.crear = async (req, res) =>
  res.status(201).json(await repo.crear(req.body));

/** PUT /api/pedidos/:id → actualizar los campos enviados. */
exports.actualizar = async (req, res) => {
  const pedido = await repo.actualizar(Number(req.params.id), req.body);
  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  res.json(pedido);
};

/** DELETE /api/pedidos/:id → eliminar pedido, ítems y asignación. */
exports.eliminar = async (req, res) => {
  const eliminado = await repo.eliminar(Number(req.params.id));
  if (!eliminado) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  res.status(204).send();
};

/** GET /api/pedidos/:id/items → ítems del pedido. */
exports.listarItems = async (req, res) =>
  res.json(await repo.obtenerItems(Number(req.params.id)));

/** POST y PUT /api/pedidos/:id/items(/:itemId) → alta o modificación de ítem. */
exports.guardarItem = async (req, res) => {
  const pedidoId = Number(req.params.id);
  const itemId = Number(req.params.itemId) || null;
  const item = itemId
    ? await repo.actualizarItem(pedidoId, itemId, req.body)
    : await repo.crearItem(pedidoId, req.body);
  res.status(itemId ? 200 : 201).json(item);
};

/** DELETE /api/pedidos/:id/items/:itemId → eliminar ítem. */
exports.eliminarItem = async (req, res) => {
  await repo.eliminarItem(Number(req.params.id), Number(req.params.itemId));
  res.status(204).send();
};

/** PATCH /api/pedidos/:id/ruta → asignar ruta o quitarla con rutaId null. */
exports.asignarRuta = async (req, res) => {
  exigir(
    req.body.rutaId === null || idValido(req.body.rutaId),
    "rutaId debe ser un entero positivo o null",
  );
  res.json(await repo.asignarRuta(Number(req.params.id), req.body.rutaId));
};

// ============================================================================
// RUTAS WEB — Vistas Pug
// ============================================================================

/** GET /pedidos → listado. */
exports.indexWeb = async (req, res) =>
  res.render("pedidos/index", {
    titulo: "Pedidos",
    pedidos: await repo.obtenerTodas(),
  });

/** GET /pedidos/:id → detalle con formulario de asignación de ruta. */
exports.detailWeb = async (req, res) => {
  const pedido = await repo.obtenerPorId(Number(req.params.id));
  if (!pedido) {
    return res.status(404).render("error", {
      titulo: "Pedido no encontrado",
      mensaje: "El pedido solicitado no existe.",
    });
  }
  res.render("pedidos/detail", {
    titulo: `Pedido #${req.params.id}`,
    pedido,
    rutas: await repo.obtenerRutas(),
  });
};

/** POST /pedidos/:id/ruta → guardar la asignación desde el formulario. */
exports.asignarRutaWeb = async (req, res) => {
  const rutaId = req.body.rutaId === "" ? null : Number(req.body.rutaId);
  exigir(rutaId === null || idValido(rutaId), "Seleccione una ruta válida");
  await repo.asignarRuta(Number(req.params.id), rutaId);
  res.redirect(303, `/pedidos/${req.params.id}`);
};
