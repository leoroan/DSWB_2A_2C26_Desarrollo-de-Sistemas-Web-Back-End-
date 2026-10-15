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

/** GET /productos → tabla web simple (mismo estilo cards). */
export async function indexWeb(req, res) {
  res.render("productos/index", {
    titulo: "Productos",
    productos: await repo.obtenerProductos(),
  });
}

/** GET /productos/nuevo y /productos/:id/editar → mismo form. */
export async function nuevoWeb(req, res) {
  res.render("productos/nuevo", { titulo: "Nuevo producto", form: {}, errores: [] });
}

export async function editarWeb(req, res) {
  const producto = await repo.obtenerProductoPorId(Number(req.params.id));
  if (!producto) {
    return res.status(404).render("error", { titulo: "Producto no encontrado", mensaje: "El producto solicitado no existe." });
  }
  res.render("productos/nuevo", {
    titulo: `Editar producto #${producto.id}`,
    producto,
    form: { nombre: producto.nombre, categoria: producto.categoria, precio: producto.precio, estado: producto.estado },
    modoEdicion: true,
    errores: [],
  });
}

/** POST /productos y /productos/:id/editar → alta/edición web. */
export async function crearWeb(req, res) {
  try {
    await repo.crearProducto({
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      precio: Number(req.body.precio),
      estado: req.body.estado || "activo",
    });
    res.redirect(303, "/productos");
  } catch (error) {
    res.status(400).render("productos/nuevo", {
      titulo: "Nuevo producto",
      form: req.body ?? {},
      errores: [error.message || "No se pudo crear el producto"],
    });
  }
}

export async function actualizarWeb(req, res) {
  const id = Number(req.params.id);
  try {
    await repo.actualizarProducto(id, {
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      precio: Number(req.body.precio),
      estado: req.body.estado,
    });
    res.redirect(303, "/productos");
  } catch (error) {
    const producto = await repo.obtenerProductoPorId(id);
    res.status(400).render("productos/nuevo", {
      titulo: `Editar producto #${id}`,
      producto,
      form: req.body ?? {},
      modoEdicion: true,
      errores: [error.message || "No se pudo actualizar el producto"],
    });
  }
}

export async function eliminar(req, res) {
  const eliminado = await repo.eliminarProducto(Number(req.params.id));
  if (!eliminado) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.status(204).send();
};
