import { modelos, siguienteId } from "../models/index.js";
import { limpio } from "../config/database.js";
import RegistroTelemetria from "../domain/entities/RegistroTelemetria.js";

/**
 * Repositorio de telemetría (MongoDB). Reemplaza data/telemetria.json
 * conservando la misma interfaz.
 */
const TelemetriaModel = modelos.RegistroTelemetria;

function mapearATelemetria(doc) {
  const d = limpio(doc);
  return new RegistroTelemetria(
    d.id,
    d.vehiculoId,
    d.timestamp,
    d.latitud,
    d.longitud,
    d.temperatura,
    d.velocidad,
    d.estadoMotor,
  );
}

async function obtenerTodos() {
  const docs = await TelemetriaModel.find().lean();
  return docs.map(mapearATelemetria);
}

async function crear(datos) {
  // fecha y hora actual automáticamente
  datos.timestamp = new Date().toISOString();

  const nuevo = { ...datos, id: await siguienteId("telemetria") };
  await TelemetriaModel.create(nuevo);
  return mapearATelemetria(nuevo);
}

/** Método extra para la vista de detalle. */
async function obtenerPorVehiculo(vehiculoId) {
  const docs = await TelemetriaModel.find().lean();
  return docs
    .map(mapearATelemetria)
    .filter((r) => String(r.vehiculoId) === String(vehiculoId));
}

export default { obtenerTodos, crear, obtenerPorVehiculo };
