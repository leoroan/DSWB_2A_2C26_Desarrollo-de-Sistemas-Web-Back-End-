import { modelos, siguienteId } from "../database/models/index.js";
import { limpio } from "../config/database.js";
import Chofer from "../models/Chofer.js";

/**
 * Repositorio de choferes (MongoDB).
 * La versión con JSON leía data/personas.json; ahora se usa la colección
 * "choferes", conservando la misma interfaz.
 */
const ChoferModel = modelos.Chofer;

function mapearAChofer(doc) {
  const d = limpio(doc);
  return new Chofer(
    d.id,
    d.nombre,
    d.apellido,
    d.edad,
    d.email,
    d.fechaAlta,
    d.estado,
    d.licencia,
    d.vehiculoId,
  );
}

async function obtenerTodos() {
  const docs = await ChoferModel.find().lean();
  return docs.map(mapearAChofer);
}

async function obtenerPorId(id) {
  const docs = await ChoferModel.find().lean();
  return docs.map(mapearAChofer).find((c) => c.id === id) || null;
}

async function crear(datos) {
  const nuevo = { ...datos, id: await siguienteId("choferes") };
  await ChoferModel.create(nuevo);
  return mapearAChofer(nuevo);
}

async function actualizar(id, cambios) {
  const doc = await ChoferModel.findOneAndUpdate(
    { id },
    { $set: { ...cambios, id } },
    { new: true },
  ).lean();
  return doc ? mapearAChofer(doc) : null;
}

export default { obtenerTodos, obtenerPorId, crear, actualizar };
