import { randomBytes, scrypt as derive, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(derive);
export const esHash = (value) => typeof value === "string" && /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(value);

export async function hashPassword(password) {
  if (typeof password !== "string" || password.length < 8 || password.length > 256) {
    throw new Error("La contraseña debe tener entre 8 y 256 caracteres.");
  }
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verificarPassword(password, hash) {
  if (!esHash(hash) || typeof password !== "string" || password.length > 256) return false;
  const [, salt, stored] = hash.split("$");
  const key = await scrypt(password, salt, 64);
  return timingSafeEqual(key, Buffer.from(stored, "hex"));
}
