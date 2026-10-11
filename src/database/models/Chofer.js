import { Schema } from "mongoose";

/**
 * Modelo Chofer (colección "choferes"). Reemplaza data/personas.json.
 *
 * Relaciones:
 *  - Chofer.vehiculoId → Vehiculo.id (opcional).
 *  - Ruta.choferId → Chofer.id.
 */
const choferSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    nombre: { type: String, required: true },
    apellido: { type: String, default: null },
    edad: { type: Number, default: null },
    email: { type: String, default: null },
    fechaAlta: { type: String, default: null },
    estado: { type: String, default: null },
    licencia: { type: String, default: null },
    vehiculoId: { type: Number, default: null },
  },
  { collection: "choferes", versionKey: false },
);

export default choferSchema;
