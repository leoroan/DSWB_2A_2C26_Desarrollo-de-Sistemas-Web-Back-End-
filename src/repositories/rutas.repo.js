import { modelos, siguienteId } from "../models/index.js";
import { limpio } from "../config/database.js";
import { exigir } from "../utils/validaciones.js";
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

/**
 * Crea una ruta simple (código único, chofer válido, fechas texto).
 * El id se autoincrementa con la secuencia "rutas".
 */
async function crear(datos) {
  exigir(datos && typeof datos === "object", "Se requieren los datos de la ruta");
  exigir(typeof datos.codigo === "string" && datos.codigo.trim().length > 0, "El código es obligatorio");
  const docs = await RutaModel.find().lean();
  exigir(!docs.some((r) => r.codigo === datos.codigo.trim()), "El código de ruta ya existe", 409);
  const ruta = new Ruta(
    await siguienteId("rutas"),
    datos.codigo.trim(),
    datos.planificadorId ?? null,
    datos.choferId ?? null,
    datos.estado ?? "planificada",
    datos.fechaPlanificacion ?? new Date().toISOString(),
    datos.fechaEjecucion ?? null,
    datos.observaciones ?? "",
    datos.vehiculoPatente ?? null,
  );
  await RutaModel.create({ ...ruta });
  return ruta;
}

export default { obtenerTodas, obtenerPorId, crear };
