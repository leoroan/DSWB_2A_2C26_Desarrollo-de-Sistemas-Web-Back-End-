import { modelos } from "../models/index.js";
import { limpio } from "../config/database.js";
import Ruta from "../domain/entities/Ruta.js";

/**
 * Repositorio de rutas (MongoDB). Reemplaza data/rutas.json conservando la
 * misma interfaz. Los paradas se resuelven en el servicio, igual que antes.
 */
const RutaModel = modelos.Ruta;

function mapearARuta(doc) {
  const d = limpio(doc);
  return new Ruta(
    d.id,
    d.codigo,
    d.planificadorId,
    d.choferId,
    d.estado,
    d.fechaPlanificacion,
    d.fechaEjecucion,
    d.observaciones,
    d.vehiculoPatente,
  );
}

async function obtenerTodas() {
  const docs = await RutaModel.find().lean();
  return docs.map(mapearARuta);
}

async function obtenerPorId(id) {
  const doc = await RutaModel.findOne({ id }).lean();
  return doc ? mapearARuta(doc) : null;
}

export default { obtenerTodas, obtenerPorId };
