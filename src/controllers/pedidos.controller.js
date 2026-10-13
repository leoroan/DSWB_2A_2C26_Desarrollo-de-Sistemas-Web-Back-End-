import repo from "../repositories/pedidos.repo.js";
import Pedido from "../domain/entities/Pedido.js";
import { exigir, idValido } from "../utils/validaciones.js";
import { validarFiltrosPedidos } from "../domain/validators/pedido.validator.js";

// ============================================================================
// RUTAS API — JSON
// ============================================================================

/** GET /api/pedidos → todos, con su cliente. Acepta filtros ?clienteId=&estado= (D6). */
export const listar = async (req, res) => {
  const filtros = validarFiltrosPedidos(req.query ?? {});
  return res.json(await repo.obtenerTodas(filtros));
};

/** GET /api/pedidos/:id → detalle con cliente, ítems y ruta. */
export const detalle = async (req, res) => {
  const pedido = await repo.obtenerPorId(Number(req.params.id));
  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  res.json(pedido);
};

/** POST /api/pedidos → crear. */
export const crear = async (req, res) =>
  res.status(201).json(await repo.crear(req.body));

/** PUT /api/pedidos/:id → actualizar los campos enviados. */
export const actualizar = async (req, res) => {
  const pedido = await repo.actualizar(Number(req.params.id), req.body);
  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  res.json(pedido);
};

/** DELETE /api/pedidos/:id → eliminar pedido, ítems y asignación. */
export const eliminar = async (req, res) => {
  const eliminado = await repo.eliminar(Number(req.params.id));
  if (!eliminado) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  res.status(204).send();
};

/** GET /api/pedidos/:id/items → ítems del pedido. */
export const listarItems = async (req, res) =>
  res.json(await repo.obtenerItems(Number(req.params.id)));

/** POST y PUT /api/pedidos/:id/items(/:itemId) → alta o modificación de ítem. */
export const guardarItem = async (req, res) => {
  const pedidoId = Number(req.params.id);
  const itemId = Number(req.params.itemId) || null;
  const item = itemId
    ? await repo.actualizarItem(pedidoId, itemId, req.body)
    : await repo.crearItem(pedidoId, req.body);
  res.status(itemId ? 200 : 201).json(item);
};

/** DELETE /api/pedidos/:id/items/:itemId → eliminar ítem. */
export const eliminarItem = async (req, res) => {
  await repo.eliminarItem(Number(req.params.id), Number(req.params.itemId));
  res.status(204).send();
};

/** PATCH /api/pedidos/:id/ruta → asignar ruta o quitarla con rutaId null. */
export const asignarRuta = async (req, res) => {
  exigir(
    req.body.rutaId === null || idValido(req.body.rutaId),
    "rutaId debe ser un entero positivo o null",
  );
  res.json(await repo.asignarRuta(Number(req.params.id), req.body.rutaId));
};

// ============================================================================
// RUTAS WEB — Vistas Pug
// ============================================================================

/** GET /pedidos → listado. Acepta filtros ?clienteId=&estado= (D6, sin cambiar estilos). */
export const indexWeb = async (req, res) => {
  const filtros = validarFiltrosPedidos(req.query ?? {});
  const pedidos = await repo.obtenerTodas(filtros);
  res.render("pedidos/index", {
    titulo: "Pedidos",
    pedidos,
    filtros,
    estados: Pedido.estados,
  });
};

/** GET /pedidos/nuevo → formulario paso 1 (cabecera). */
export const nuevoWeb = async (req, res) => {
  const clientesRepo = (await import("../repositories/clientes.repo.js")).default;
  const clientes = await clientesRepo.obtenerTodas();
  res.render("pedidos/nuevo", {
    titulo: "Nuevo pedido",
    clientes,
    productos: await repo.obtenerProductos(),
    form: {},
    errores: [],
  });
};

/** POST /pedidos → crear cabecera en pendiente y seguir al detalle a cargar ítems. */
export const crearWeb = async (req, res) => {
  const clientesRepo = (await import("../repositories/clientes.repo.js")).default;
  const renderNuevo = async (errores) => {
    res.status(400).render("pedidos/nuevo", {
      titulo: "Nuevo pedido",
      clientes: await clientesRepo.obtenerTodas(),
      productos: await repo.obtenerProductos(),
      form: req.body ?? {},
      errores,
    });
  };
  const errores = [];
  if (!req.body?.clienteId) errores.push("El cliente es obligatorio");
  if (!req.body?.fechaEntregaSolicitada) errores.push("La fecha de entrega es obligatoria");
  if (!req.body?.productoId) errores.push("El producto es obligatorio: todo pedido lleva al menos uno");
  if (!req.body?.cantidad) errores.push("La cantidad es obligatoria");
  if (errores.length > 0) return renderNuevo(errores);
  try {
    const creado = await repo.crearCabecera({
      clienteId: req.body.clienteId,
      fechaPedido: req.body.fechaPedido || undefined,
      fechaEntregaSolicitada: req.body.fechaEntregaSolicitada,
      observaciones: req.body.observaciones ?? "",
    });
    await repo.crearItem(
      creado.id,
      {
        productoId: Number(req.body.productoId),
        cantidad: Number(req.body.cantidad),
        observaciones: req.body.observacionItem ?? "",
      },
      { permitirPrimerItem: true },
    );
    res.redirect(303, `/pedidos/${creado.id}`);
  } catch (error) {
    return renderNuevo([error.message || "No se pudo crear el pedido"]);
  }
};

/** GET /pedidos/:id/editar → reutiliza nuevo.pug en modo edición (solo fechas + obs). */
export const editarWeb = async (req, res) => {
  const pedido = await repo.obtenerPorId(Number(req.params.id));
  if (!pedido) {
    return res.status(404).render("error", {
      titulo: "Pedido no encontrado",
      mensaje: "El pedido solicitado no existe.",
    });
  }
  if (pedido.estado === "cancelado" || pedido.estado === "entregado" || pedido.estado === "en_reparto") {
    return res.status(409).render("error", {
      titulo: "Pedido no editable",
      mensaje: `Un pedido ${pedido.estado} no se puede editar.`,
    });
  }
  const clientesRepo = (await import("../repositories/clientes.repo.js")).default;
  res.render("pedidos/nuevo", {
    titulo: `Editar pedido #${pedido.id}`,
    clientes: await clientesRepo.obtenerTodas(),
    productos: await repo.obtenerProductos(),
    pedido,
    form: {
      clienteId: pedido.clienteId,
      fechaPedido: pedido.fechaPedido,
      fechaEntregaSolicitada: pedido.fechaEntregaSolicitada,
      observaciones: pedido.observaciones,
    },
    modoEdicion: true,
    errores: [],
  });
};

/** POST /pedidos/:id/editar → guarda fechas + observaciones (respeta matriz D1). */
export const actualizarWeb = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await repo.actualizar(id, {
      fechaPedido: req.body.fechaPedido || undefined,
      fechaEntregaSolicitada: req.body.fechaEntregaSolicitada || undefined,
      observaciones: req.body.observaciones ?? "",
    });
    res.redirect(303, `/pedidos/${id}`);
  } catch (error) {
    const pedido = await repo.obtenerPorId(id);
    const clientesRepo = (await import("../repositories/clientes.repo.js")).default;
    res.status(error.status || 400).render("pedidos/nuevo", {
      titulo: `Editar pedido #${id}`,
      clientes: await clientesRepo.obtenerTodas(),
      productos: await repo.obtenerProductos(),
      pedido,
      form: req.body ?? {},
      modoEdicion: true,
      errores: [error.message || "No se pudo actualizar el pedido"],
    });
  }
};

/** GET /pedidos/:id → detalle con formulario de asignación de ruta. */
export const detailWeb = async (req, res) => {
  const pedido = await repo.obtenerPorId(Number(req.params.id));
  if (!pedido) {
    return res.status(404).render("error", {
      titulo: "Pedido no encontrado",
      mensaje: "El pedido solicitado no existe.",
    });
  }
  const itemEditar = req.query.editarItem ? (pedido.items || []).find((i) => String(i.id) === String(req.query.editarItem)) : null;
  res.render("pedidos/detail", {
    titulo: `Pedido #${req.params.id}`,
    pedido,
    rutas: await repo.obtenerRutas(),
    productos: await repo.obtenerProductos(),
    itemEditar: itemEditar || null,
  });
};

/** POST /pedidos/:id/ruta → guardar la asignación desde el formulario. */
export const asignarRutaWeb = async (req, res) => {
  const rutaId = req.body.rutaId === "" ? null : Number(req.body.rutaId);
  exigir(rutaId === null || idValido(rutaId), "Seleccione una ruta válida");
  await repo.asignarRuta(Number(req.params.id), rutaId);
  res.redirect(303, `/pedidos/${req.params.id}`);
};

/** POST /pedidos/:id/items → agregar ítem desde el detalle (paso 2). */
export const agregarItemWeb = async (req, res) => {
  await repo.crearItem(Number(req.params.id), {
    productoId: Number(req.body.productoId),
    cantidad: Number(req.body.cantidad),
    observaciones: req.body.observaciones ?? "",
  });
  res.redirect(303, `/pedidos/${req.params.id}`);
};

/** POST /pedidos/:id/items/:itemId/eliminar → quitar ítem sin dejar vacío. */
export const eliminarItemWeb = async (req, res) => {
  await repo.eliminarItem(Number(req.params.id), Number(req.params.itemId));
  res.redirect(303, `/pedidos/${req.params.id}`);
};

/** POST /pedidos/:id/items/:itemId → guardar cambios del ítem (producto/cantidad/obs). */
export const actualizarItemWeb = async (req, res) => {
  await repo.actualizarItem(Number(req.params.id), Number(req.params.itemId), {
    productoId: Number(req.body.productoId),
    cantidad: Number(req.body.cantidad),
    observaciones: req.body.observaciones ?? "",
  });
  res.redirect(303, `/pedidos/${req.params.id}`);
};
