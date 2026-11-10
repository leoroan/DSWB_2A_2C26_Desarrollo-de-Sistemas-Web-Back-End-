import { createHash } from "node:crypto";
import { Sesion } from "../models/index.js";
import config from "../config/env.js";
import jwt from "jsonwebtoken";
import { verificarJWT } from "../utils/jwt.js";

export const cookieOptions = {
  httpOnly: true, sameSite: "strict", secure: config.nodeEnv === "production", path: "/",
};
export const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export async function cargarUsuario(req, res, next) {
  try {
    const authorization = req.headers.authorization;
    const token = authorization !== undefined
      ? (/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(authorization)?.[1])
      : (req.headers.cookie || "").split(";")
        .map((parte) => parte.trim()).find((parte) => parte.startsWith("freshroute_session="))
        ?.slice("freshroute_session=".length);
    if (token) {
      let claims;
      try { claims = verificarJWT(token); }
      catch (error) {
        if (!(error instanceof jwt.JsonWebTokenError)) throw error;
      }
      if (claims) {
        const sesion = await Sesion.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } })
          .populate("usuario");
        if (sesion?.usuario && String(sesion.usuario._id) === claims.sub) {
          req.usuario = sesion.usuario;
          req.sesion = sesion;
        }
      }
    }
    res.locals.usuario = req.usuario;
    next();
  } catch (err) { next(err); }
}

export function requerirLogin(req, res, next) {
  res.set("Cache-Control", "no-store");
  if (!req.usuario) {
    if (req.originalUrl === "/api" || req.originalUrl.startsWith("/api/")) {
      return res.status(401).json({ error: true, message: "Debés iniciar sesión." });
    }
    return res.redirect("/login");
  }
  next();
}

export function autorizarOperacion(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.headers.origin && req.headers.origin !== `${req.protocol}://${req.get("host")}`) {
    return res.sendStatus(403);
  }
  if (req.usuario?.rol === "admin") return next();
  if (req.originalUrl === "/api" || req.originalUrl.startsWith("/api/")) {
    return res.status(403).json({ error: true, message: "Se requiere el rol admin para modificar datos." });
  }
  return res.status(403).render("error", { mensaje: "Tu rol permite consultar. Se requiere admin para modificar datos." });
}
