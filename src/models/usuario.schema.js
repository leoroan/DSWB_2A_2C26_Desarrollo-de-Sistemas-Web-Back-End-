import { Schema } from "mongoose";
import { hashPassword } from "../utils/password.js";

/**
 * Esquema Usuario (colección "usuarios").
 * Autenticación con contraseña scrypt y JWT revocable.
 */
const usuarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    rol: { type: String, enum: ["admin", "operador"], default: "operador" },
  },
  { collection: "usuarios", timestamps: true },
);

usuarioSchema.pre("save", async function () {
  if (this.isModified("password")) this.password = await hashPassword(this.password);
});
usuarioSchema.pre("insertMany", async function (docs) {
  for (const doc of docs) doc.password = await hashPassword(doc.password);
});
// Las actualizaciones de contraseña deben pasar por save() para aplicar el hash.
for (const operation of ["updateOne", "updateMany", "findOneAndUpdate", "replaceOne", "findOneAndReplace"]) {
  usuarioSchema.pre(operation, function () {
    const update = this.getUpdate();
    if (Array.isArray(update) || this.getOptions().upsert || update?.password !== undefined ||
        Object.values(update || {}).some(value => value && typeof value === "object" && "password" in value) ||
        ["replaceOne", "findOneAndReplace"].includes(this.op)) {
      throw new Error("Para cambiar contraseñas, usá el documento Usuario y save().");
    }
  });
}

export default usuarioSchema;
