const repo = require("../repositories/remito.repo");
const Remito = require("../models/Remito");

/**
 * Controlador de remitos.
 * Combina rutas web (vistas Pug) + API REST (JSON).
 */

/**
 * Helper: reconstruye una instancia de Remito a partir de datos crudos,
 * para poder usar los métodos de la clase (firmar, estaVencido, etc.).
 */
function hidratarRemito(datos) {
  return new Remito(
    datos.id,
    datos.pedidoId,
    datos.fechaEmision,
    datos.fechaVencimiento,
    datos.montoTotal,
    datos.estado,
    datos.firmadoPor,
    datos.observaciones,
    datos.penalizacionAplicada,
  );
}

// ============================================================================
// RUTAS WEB — Vistas Pug
// ============================================================================

/** GET /remitos → lista de remitos (index.pug). */
async function indexWeb(req, res) {
  const remitos = await repo.obtenerTodas();
  res.render("remitos/index", { titulo: "Remitos", remitos });
}

/** GET /remitos/:id → detalle del remito (detail.pug). */
async function detailWeb(req, res) {
  const id = Number(req.params.id);
  const remito = await repo.obtenerPorId(id);

  if (!remito) {
    return res.status(404).json({ message: "Remito no encontrado" });
  }

  res.render("remitos/detail", {
    titulo: `Remito #${remito.id}`,
    remito: hidratarRemito(remito),
  });
}

// ============================================================================
// RUTAS API — JSON (CRUD completo)
// ============================================================================

/** GET /api/remitos → lista todos los remitos. */
async function listar(req, res) {
  const remitos = await repo.obtenerTodas();
  res.json(remitos);
}

/** GET /api/remitos/:id → devuelve un remito por id. */
async function detalle(req, res) {
  const id = Number(req.params.id);
  const remito = await repo.obtenerPorId(id);

  if (!remito) {
    return res.status(404).json({ message: "Remito no encontrado" });
  }
  res.json(remito);
}

/** POST /api/remitos → crea un remito y lo persiste. */
async function crear(req, res) {
  const {
    pedidoId,
    fechaEmision,
    fechaVencimiento,
    montoTotal,
    estado,
    firmadoPor,
    observaciones,
  } = req.body;

  // Validaciones básicas de campos obligatorios
  const errores = [];
  if (!pedidoId) errores.push("El campo 'pedidoId' es obligatorio");
  if (!fechaEmision) errores.push("El campo 'fechaEmision' es obligatorio");
  if (!fechaVencimiento)
    errores.push("El campo 'fechaVencimiento' es obligatorio");
  if (montoTotal === undefined || montoTotal === null)
    errores.push("El campo 'montoTotal' es obligatorio");
  if (!estado) errores.push("El campo 'estado' es obligatorio");

  if (errores.length > 0) {
    return res.status(400).json({ message: "Datos inválidos", errores });
  }

  const nuevo = await repo.crear({
    pedidoId,
    fechaEmision,
    fechaVencimiento,
    montoTotal: Number(montoTotal),
    estado,
    firmadoPor: firmadoPor || null,
    observaciones: observaciones || null,
    penalizacionAplicada: 0,
  });

  res.status(201).json(nuevo);
}

/** PUT /api/remitos/:id → modifica un remito en la persistencia. */
async function actualizar(req, res) {
  const id = Number(req.params.id);
  const {
    pedidoId,
    fechaEmision,
    fechaVencimiento,
    montoTotal,
    estado,
    firmadoPor,
    observaciones,
    penalizacionAplicada,
  } = req.body;

  // Solo actualizamos los campos que llegaron en el body
  const cambios = {};
  if (pedidoId !== undefined) cambios.pedidoId = pedidoId;
  if (fechaEmision !== undefined) cambios.fechaEmision = fechaEmision;
  if (fechaVencimiento !== undefined)
    cambios.fechaVencimiento = fechaVencimiento;
  if (montoTotal !== undefined) cambios.montoTotal = Number(montoTotal);
  if (estado !== undefined) cambios.estado = estado;
  if (firmadoPor !== undefined) cambios.firmadoPor = firmadoPor;
  if (observaciones !== undefined) cambios.observaciones = observaciones;
  if (penalizacionAplicada !== undefined)
    cambios.penalizacionAplicada = Number(penalizacionAplicada);

  const actualizado = await repo.actualizar(id, cambios);

  if (!actualizado) {
    return res.status(404).json({ message: "Remito no encontrado" });
  }
  res.json(actualizado);
}

/** DELETE /api/remitos/:id → elimina un remito de la estructura. */
async function eliminar(req, res) {
  const id = Number(req.params.id);
  const eliminado = await repo.eliminar(id);

  if (!eliminado) {
    return res.status(404).json({ message: "Remito no encontrado" });
  }
  res.status(204).send();
}

// ============================================================================
// ACCIONES ESPECÍFICAS — métodos de la clase Remito
// ============================================================================

/** POST /api/remitos/:id/firmar → firma el remito (método firmar de la clase). */
async function firmar(req, res) {
  const id = Number(req.params.id);
  const { nombreFirmante } = req.body;

  if (!nombreFirmante) {
    return res
      .status(400)
      .json({ message: "El campo 'nombreFirmante' es obligatorio" });
  }

  const remito = await repo.obtenerPorId(id);
  if (!remito) {
    return res.status(404).json({ message: "Remito no encontrado" });
  }

  const instancia = hidratarRemito(remito);
  instancia.firmar(nombreFirmante);

  const actualizado = await repo.actualizar(id, {
    firmadoPor: instancia.firmadoPor,
    estado: instancia.estado,
  });
  res.json(actualizado);
}

/** POST /api/remitos/:id/observaciones → agrega una observación. */
async function agregarObservacion(req, res) {
  const id = Number(req.params.id);
  const { observacion } = req.body;

  if (!observacion || typeof observacion !== "string" || !observacion.trim()) {
    return res
      .status(400)
      .json({ message: "El campo 'observacion' es obligatorio" });
  }

  const remito = await repo.obtenerPorId(id);
  if (!remito) {
    return res.status(404).json({ message: "Remito no encontrado" });
  }

  const instancia = hidratarRemito(remito);
  instancia.agregarObservacion(observacion.trim());

  const actualizado = await repo.actualizar(id, {
    observaciones: instancia.observaciones,
  });
  res.json(actualizado);
}

/** POST /api/remitos/:id/penalizacion → aplica una penalización. */
async function aplicarPenalizacion(req, res) {
  const id = Number(req.params.id);
  const { monto } = req.body;

  const montoNumerico = Number(monto);
  if (Number.isNaN(montoNumerico)) {
    return res
      .status(400)
      .json({ message: "El campo 'monto' debe ser un número válido" });
  }

  const remito = await repo.obtenerPorId(id);
  if (!remito) {
    return res.status(404).json({ message: "Remito no encontrado" });
  }

  const instancia = hidratarRemito(remito);
  try {
    instancia.aplicarPenalizacion(montoNumerico);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const actualizado = await repo.actualizar(id, {
    penalizacionAplicada: instancia.penalizacionAplicada,
    montoTotal: instancia.montoTotal,
  });
  res.json(actualizado);
}

/** PUT /api/remitos/:id/estado → cambia el estado del remito. */
async function cambiarEstado(req, res) {
  const id = Number(req.params.id);
  const { nuevoEstado } = req.body;

  if (!nuevoEstado) {
    return res
      .status(400)
      .json({ message: "El campo 'nuevoEstado' es obligatorio" });
  }

  const remito = await repo.obtenerPorId(id);
  if (!remito) {
    return res.status(404).json({ message: "Remito no encontrado" });
  }

  const instancia = hidratarRemito(remito);
  instancia.cambiarEstado(nuevoEstado);

  const actualizado = await repo.actualizar(id, {
    estado: instancia.estado,
  });
  res.json(actualizado);
}

module.exports = {
  indexWeb,
  detailWeb,
  listar,
  detalle,
  crear,
  actualizar,
  eliminar,
  firmar,
  agregarObservacion,
  aplicarPenalizacion,
  cambiarEstado,
};
