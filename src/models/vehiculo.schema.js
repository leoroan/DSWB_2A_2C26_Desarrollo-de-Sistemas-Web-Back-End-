import { Schema } from "mongoose";

/**
 * Modelo Vehículo (colección "vehiculos"). Reemplaza data/vehiculos.json.
 *
 * Relaciones:
 *  - Vehículo.choferAsignadoId → Chofer.id (opcional).
 *  - RegistroTelemetria.vehiculoId → Vehículo.id (un vehículo, muchos registros).
 * Las fechas se guardan como String para conservar el formato original.
 */
const vehiculoSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    patente: { type: String, required: true, trim: true },
    tipo: { type: String, required: true },
    capacidad: { type: Number, required: true },
    temperaturaMin: { type: Number, default: null },
    temperaturaMax: { type: Number, default: null },
    estado: { type: String, default: "Disponible" },
    choferAsignadoId: { type: Number, default: null },
    ultimaActualizacionTelemetria: { type: String, default: null },
  },
  { collection: "vehiculos", versionKey: false },
);

export default vehiculoSchema;
