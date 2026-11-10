import express from "express";
import { Usuario, Sesion } from "../models/index.js";
import { cookieOptions, hashToken } from "../middlewares/auth.js";
import { verificarPassword } from "../utils/password.js";
import { crearJWT, duracionSegundos } from "../utils/jwt.js";

const router = express.Router();
const duracion = duracionSegundos * 1000;

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  // Los formularios se envían desde la misma aplicación.
  if (
    req.method === "POST" &&
    req.headers.origin &&
    req.headers.origin !== `${req.protocol}://${req.get("host")}`
  ) {
    return res.sendStatus(403);
  }
  next();
});
router.get("/login", (req, res) => {
  if (req.usuario) return res.redirect("/");
  res.render("login", { titulo: "Iniciar sesión | FreshRoute", email: "" });
});

router.post(["/login", "/api/auth/login"], async (req, res, next) => {
  try {
    const esAPI = req.path === "/api/auth/login";
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || email.length > 254 || !password || password.length > 256) {
      if (esAPI) return res.status(400).json({ error: true, message: "Ingresá un correo y una contraseña válidos." });
      return res.status(400).render("login", {
        email,
        error: "Ingresá un correo y una contraseña válidos.",
      });
    }
    const usuario = await Usuario.findOne({ email }).select("+password");
    if (!usuario || !(await verificarPassword(password, usuario.password))) {
      if (esAPI) return res.status(401).json({ error: true, message: "Correo o contraseña incorrectos." });
      return res
        .status(401)
        .render("login", { email, error: "Correo o contraseña incorrectos." });
    }
    const token = crearJWT(usuario);
    await Sesion.create({
      tokenHash: hashToken(token),
      usuario: usuario._id,
      expiresAt: new Date(Date.now() + duracion),
    });
    if (req.sesion) await req.sesion.deleteOne();
    if (esAPI) return res.json({
      access_token: token, token_type: "Bearer", expires_in: duracionSegundos,
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol || "operador" },
    });
    res.cookie("freshroute_session", token, {
      ...cookieOptions,
      maxAge: duracion,
    });
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

router.post(["/logout", "/api/auth/logout"], async (req, res, next) => {
  try {
    if (req.path === "/api/auth/logout" && !req.usuario) {
      return res.status(401).json({ error: true, message: "Debés iniciar sesión." });
    }
    if (req.sesion) await req.sesion.deleteOne();
    res.clearCookie("freshroute_session", cookieOptions);
    if (req.path === "/api/auth/logout") return res.status(204).end();
    res.redirect("/login");
  } catch (err) {
    next(err);
  }
});
export default router;
