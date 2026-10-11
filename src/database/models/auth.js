import mongoose from "mongoose";

export const Usuario = mongoose.model("Usuario", new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Texto plano según los requisitos de esta entrega académica.
  password: { type: String, required: true, select: false },
}, { collection: "usuarios", timestamps: true }));

export const Sesion = mongoose.model("Sesion", new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { collection: "sesiones" }));
