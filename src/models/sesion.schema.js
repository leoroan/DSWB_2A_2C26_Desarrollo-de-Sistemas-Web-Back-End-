import { Schema } from "mongoose";

/**
 * Esquema Sesion (colección "sesiones").
 * Guarda el hash del token de cookie + referencia al Usuario y expiración
 * (índice TTL: Mongo borra el documento al vencer).
 */
const sesionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { collection: "sesiones" },
);

export default sesionSchema;
