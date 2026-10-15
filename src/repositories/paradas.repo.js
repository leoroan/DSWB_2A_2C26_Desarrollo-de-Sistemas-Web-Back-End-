import { modelos } from "../models/index.js";
import { limpio } from "../config/database.js";
import Parada from "../domain/entities/Parada.js";

/**
 * Repositorio de paradas (MongoDB). Reemplaza data/paradas.json conservando
 * la misma interfaz. Se consultan por rutaId y se ordenan por "orden".
 */
const ParadaModel = modelos.Parada;

function mapearAParada(doc) {
  const d = limpio(doc);
  return new Parada(
    d.id,
    d.rutaId,
    d.clienteId,
    d.direccion,
    d.orden,
    d.estado,
    d.latitud,
    d.longitud,
    d.fechaProgramada,
    d.fechaReal,
    d.observaciones,
    d.motivoRechazo,
    d.temperaturaAlMomento,
  );
}

async function obtenerPorRutaId(rutaId) {
  const docs = await ParadaModel.find({ rutaId }).sort({ orden: 1 }).lean();
  return docs.map(mapearAParada);
}

export default { obtenerPorRutaId };
