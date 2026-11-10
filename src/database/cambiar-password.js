import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { conectarDB, cerrarDB } from "../config/database.js";
import { Usuario, Sesion } from "../models/index.js";

const terminal = createInterface({ input: stdin, output: stdout });
try {
  const email = (await terminal.question("Correo de la cuenta: ")).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error("Ingresá un correo válido.");
  }
  console.log("La nueva contraseña será visible en esta terminal local. No la compartas en el chat.");
  const password = await terminal.question("Nueva contraseña (8 a 256 caracteres): ");
  const confirmacion = await terminal.question("Repetí la nueva contraseña: ");
  if (password.length < 8 || password.length > 256) {
    throw new Error("La contraseña debe tener entre 8 y 256 caracteres.");
  }
  if (password !== confirmacion) throw new Error("Las contraseñas no coinciden. No se cambió la cuenta.");

  await conectarDB();
  const usuario = await Usuario.findOne({ email });
  if (!usuario) throw new Error("No existe una cuenta con ese correo en la base configurada.");
  // save() aplica el hash scrypt definido en el modelo, sin alterar nombre ni rol.
  usuario.password = password;
  await usuario.save();
  await Sesion.deleteMany({ usuario: usuario._id });
  console.log("Contraseña actualizada y sesiones anteriores cerradas. Ya podés ingresar con tu correo y la nueva contraseña.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  terminal.close();
  await cerrarDB();
}
