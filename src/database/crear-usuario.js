import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { conectarDB, cerrarDB } from "../config/database.js";
import { Usuario } from "../models/index.js";

const terminal = createInterface({ input: stdin, output: stdout });
try {
  const nombre = (await terminal.question("Nombre: ")).trim();
  const email = (await terminal.question("Correo: ")).trim().toLowerCase();
  console.log("La contraseña será visible en esta terminal local.");
  const password = await terminal.question("Contraseña (mínimo 8 caracteres): ");
  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 8 || password.length > 256) {
    throw new Error("Revisá el nombre, el correo y la contraseña (entre 8 y 256 caracteres).");
  }
  await conectarDB();
  await Usuario.init();
  await Usuario.create({ nombre, email, password });
  console.log("Usuario creado. Ya podés iniciar sesión en /login.");
} catch (err) {
  console.error(err.code === 11000 ? "Ese correo ya tiene un usuario." : err.message);
  process.exitCode = 1;
} finally {
  terminal.close();
  await cerrarDB();
}
