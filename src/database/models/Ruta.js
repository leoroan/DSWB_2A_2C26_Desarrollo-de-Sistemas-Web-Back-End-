import { Schema } from "mongoose";

/**
 * Modelo Ruta (colección "rutas"). Reemplaza data/rutas.json.
 *
 * Relaciones:
 *  - Ruta.choferId → Chofer.id.
 *  - Ruta.planificadorId → Empleado/Planificador (id de negocio).
 *  - Ruta.vehiculoPatente → Vehiculo.patente.
 *  - Parada.rutaId → Ruta.id (una ruta tiene muchas paradas).
 * Las fechas se guardan como String para conservar el formato original.
 */
const rutaSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    codigo: { type: String, required: true, index: true },
    planificadorId: { type: Number, default: null },
    choferId: { type: Number, default: null },
    estado: { type: String, default: null },
    fechaPlanificacion: { type: String, default: null },
    fechaEjecucion: { type: String, default: null },
    observaciones: { type: String, default: "" },
    vehiculoPatente: { type: String, default: null },
  },
  { collection: "rutas", versionKey: false },
);

export default rutaSchema;
