import { conectarDB, cerrarDB } from "../config/database.js";
import { Usuario, Sesion } from "../models/index.js";
import { esHash } from "../utils/password.js";

try {
  await conectarDB();
  let cantidad = 0;
  for await (const usuario of Usuario.find().select("+password").cursor()) {
    if (esHash(usuario.password)) continue;
    usuario.markModified("password");
    await usuario.save();
    cantidad++;
  }
  await Sesion.deleteMany({});
  console.log(`Contraseñas migradas: ${cantidad}. Sesiones revocadas. Los roles existentes se conservan; usuarios sin rol usan operador.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await cerrarDB();
}
