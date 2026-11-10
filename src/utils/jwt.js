import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import config from "../config/env.js";

export const duracionSegundos = 8 * 60 * 60;
const issuer = "freshroute";
const audience = "freshroute-web-api";

export function validarSecretoJWT() {
  if (typeof config.jwtSecret !== "string" || Buffer.byteLength(config.jwtSecret) < 32) {
    throw new Error("Configurá JWT_SECRET con un secreto aleatorio de al menos 32 bytes en .env.");
  }
  return config.jwtSecret;
}

export function crearJWT(usuario) {
  return jwt.sign({}, validarSecretoJWT(), {
    algorithm: "HS256", subject: String(usuario._id), jwtid: randomUUID(),
    issuer, audience, expiresIn: duracionSegundos,
  });
}

export function verificarJWT(token) {
  const claims = jwt.verify(token, validarSecretoJWT(), { algorithms: ["HS256"], issuer, audience });
  if (typeof claims.sub !== "string" || typeof claims.jti !== "string" || !Number.isInteger(claims.exp)) {
    throw new jwt.JsonWebTokenError("Claims JWT inválidos.");
  }
  return claims;
}
