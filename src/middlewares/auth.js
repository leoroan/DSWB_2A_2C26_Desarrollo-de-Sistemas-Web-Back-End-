import { createHash } from "node:crypto";
import { Sesion } from "../database/models/auth.js";
import config from "../config/env.js";

export const cookieOptions = {
  httpOnly: true, sameSite: "strict", secure: config.nodeEnv === "production", path: "/",
};
export const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export async function cargarUsuario(req, res, next) {
  try {
    const token = (req.headers.cookie || "").split(";")
      .map((parte) => parte.trim()).find((parte) => parte.startsWith("freshroute_session="))
      ?.slice("freshroute_session=".length);
    if (token && /^[a-f0-9]{64}$/.test(token)) {
      const sesion = await Sesion.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } })
        .populate("usuario");
      if (sesion?.usuario) {
        req.usuario = sesion.usuario;
        req.sesion = sesion;
      }
    }
    res.locals.usuario = req.usuario;
    next();
  } catch (err) { next(err); }
}

export function requerirLogin(req, res, next) {
  res.set("Cache-Control", "no-store");
  if (!req.usuario) return res.redirect("/login");
  next();
}
