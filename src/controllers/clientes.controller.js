const clientesService = require("../services/clientes.service");

// ============================================================================
// RUTAS WEB — Vistas Pug
// ============================================================================

/** GET /clientes → listado (index.pug). */
async function indexWeb(req, res, next) {
  try {
    const clientes = await clientesService.obtenerTodos();
    res.render("clientes/index", {
      titulo: "Clientes",
      clientes,
    });
  } catch (error) {
    next(error);
  }
}

/** GET /clientes/nuevo → formulario de creación. */
function nuevoWeb(req, res) {
  res.render("clientes/form", {
    titulo: "Nuevo cliente",
    cliente: null,
    modoEdicion: false,
  });
}

/** POST /clientes → procesar formulario de creación (web). */
async function crearWeb(req, res, next) {
  try {
    await clientesService.crear(req.body);
    res.redirect("/clientes");
  } catch (error) {
    next(error);
  }
}

/** GET /clientes/:id/editar → formulario de edición. */
async function edicionWeb(req, res, next) {
  try {
    const cliente = await clientesService.obtenerPorId(req.params.id);
    if (!cliente) {
      return res.status(404).send("Cliente no encontrado");
    }
    res.render("clientes/form", {
      titulo: "Editar cliente",
      cliente,
      modoEdicion: true,
    });
  } catch (error) {
    next(error);
  }
}

/** POST /clientes/:id/editar → procesar modificación (web). */
async function actualizarWeb(req, res, next) {
  try {
    const cliente = await clientesService.actualizar(req.params.id, req.body);
    if (!cliente) {
      return res.status(404).send("Cliente no encontrado");
    }
    res.redirect("/clientes");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// RUTAS API — JSON (CRUD)
// ============================================================================

/** GET /api/clientes → todos. */
async function obtenerTodos(req, res, next) {
  try {
    const clientes = await clientesService.obtenerTodos();
    res.json(clientes);
  } catch (error) {
    next(error);
  }
}

/** GET /api/clientes/:id → uno. */
async function obtenerPorId(req, res, next) {
  try {
    const cliente = await clientesService.obtenerPorId(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
}

/** POST /api/clientes → crear. */
async function crear(req, res, next) {
  try {
    const cliente = await clientesService.crear(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
}

/** PUT /api/clientes/:id → actualizar. */
async function actualizar(req, res, next) {
  try {
    const cliente = await clientesService.actualizar(req.params.id, req.body);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/clientes/:id → eliminar. */
async function eliminar(req, res, next) {
  try {
    const eliminado = await clientesService.eliminar(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  // Web
  indexWeb,
  nuevoWeb,
  crearWeb,
  edicionWeb,
  actualizarWeb,
  // API
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
