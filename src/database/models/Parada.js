import { Schema } from "mongoose";

/**
 * Modelo Parada (colección "paradas"). Reemplaza data/paradas.json.
 *
 * Relaciones:
 *  - Parada.rutaId → Ruta.id.
 *  - Parada.clienteId → Cliente.id (id de negocio string).
 * Las fechas se guardan como String para conservar el formato original.
 */
const paradaSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    rutaId: { type: Number, required: true, index: true },
    // Mixed: el id de cliente puede venir como String (Date.now) o Number.
    clienteId: { type: Schema.Types.Mixed, default: null },
    direccion: { type: String, default: null },
    orden: { type: Number, default: null },
    estado: { type: String, default: null },
    latitud: { type: Number, default: null },
    longitud: { type: Number, default: null },
    fechaProgramada: { type: String, default: null },
    fechaReal: { type: String, default: null },
    observaciones: { type: String, default: "" },
    motivoRechazo: { type: String, default: null },
    temperaturaAlMomento: { type: Number, default: null },
  },
  { collection: "paradas", versionKey: false },
);

export default paradaSchema;
