import { modelos, siguienteId } from "../database/models/index.js";
import { limpio } from "../config/database.js";
import Vehiculo from "../models/Vehiculo.js";

/**
 * Repositorio de vehículos (MongoDB). Reemplaza data/vehiculos.json
 * conservando la misma interfaz.
 */
const VehiculoModel = modelos.Vehiculo;

function mapearAVehiculo(doc) {
  const d = limpio(doc);
  return new Vehiculo(
    d.id,
    d.patente,
    d.tipo,
    d.capacidad,
    d.temperaturaMin,
    d.temperaturaMax,
    d.estado,
    d.choferAsignadoId,
    d.ultimaActualizacionTelemetria,
  );
}

async function obtenerTodos() {
  const docs = await VehiculoModel.find().lean();
  return docs.map(mapearAVehiculo);
}

async function obtenerPorId(id) {
  const docs = await VehiculoModel.find().lean();
  return docs.map(mapearAVehiculo).find((v) => String(v.id) === String(id)) || null;
}

async function crear(datos) {
  const nuevo = { ...datos, id: await siguienteId("vehiculos") };
  await VehiculoModel.create(nuevo);
  return mapearAVehiculo(nuevo);
}

async function actualizar(id, cambios) {
  const doc = await VehiculoModel.findOneAndUpdate(
    { id },
    { $set: { ...cambios, id } },
    { new: true },
  ).lean();
  return doc ? mapearAVehiculo(doc) : null;
}

export default { obtenerTodos, obtenerPorId, crear, actualizar };
