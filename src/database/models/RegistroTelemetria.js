import { Schema } from "mongoose";

/**
 * Modelo Registro de Telemetría (colección "telemetria").
 * Reemplaza data/telemetria.json.
 *
 * Relación: RegistroTelemetria.vehiculoId → Vehiculo.id.
 * El timestamp se guarda como String (ISO) para conservar el formato original.
 */
const registroTelemetriaSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    vehiculoId: { type: Number, required: true, index: true },
    timestamp: { type: String, default: null },
    latitud: { type: Number, default: null },
    longitud: { type: Number, default: null },
    temperatura: { type: Number, default: null },
    velocidad: { type: Number, default: null },
    estadoMotor: { type: String, default: null },
  },
  { collection: "telemetria", versionKey: false },
);

export default registroTelemetriaSchema;
