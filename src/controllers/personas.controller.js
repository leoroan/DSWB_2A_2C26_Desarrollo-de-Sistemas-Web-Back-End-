const repo = require("../repositories/personas.repo");

/**
 * Controlador de personas.
 */

/** GET /api/personas → lista todas las personas. */
async function listar(req, res) {
  const personas = await repo.obtenerTodas();
  res.json(personas);
}

/** GET /api/personas/:id → devuelve una persona por id. */
async function detalle(req, res) {
  const id = Number(req.params.id);
  const persona = await repo.obtenerPorId(id);

  if (!persona) {
    return res.status(404).json({ message: "Persona no encontrada" });
  }
  res.json(persona);
}

/** POST /api/personas → crea una persona y la persiste. */
async function crear(req, res) {
  const { nombre, apellido, edad, email } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ message: "El campo 'nombre' es obligatorio" });
  }

  const nueva = await repo.crear({ nombre, apellido, edad, email });
  res.status(201).json(nueva);
}

/** PUT /api/personas/:id → modifica una persona en la persistencia. */
async function actualizar(req, res) {
  const id = Number(req.params.id);
  const { nombre, apellido, edad, email } = req.body;

  const actualizada = await repo.actualizar(id, {
    nombre,
    apellido,
    edad,
    email,
  });
  if (!actualizada) {
    return res.status(404).json({ message: "Persona no encontrada" });
  }
  res.json(actualizada);
}

/** DELETE /api/personas/:id → elimina una persona de la estructura. */
async function eliminar(req, res) {
  const id = Number(req.params.id);
  const eliminada = await repo.eliminar(id);

  if (!eliminada) {
    return res.status(404).json({ message: "Persona no encontrada" });
  }
  res.status(204).send();
}

module.exports = { listar, detalle, crear, actualizar, eliminar };
