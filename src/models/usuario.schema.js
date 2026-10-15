import { Schema } from "mongoose";

/**
 * Esquema Usuario (colección "usuarios").
 * Autenticación de la app (login con cookie firmada por token hasheado).
 */
const usuarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Texto plano según los requisitos de esta entrega académica.
    password: { type: String, required: true, select: false },
  },
  { collection: "usuarios", timestamps: true },
);

export default usuarioSchema;
