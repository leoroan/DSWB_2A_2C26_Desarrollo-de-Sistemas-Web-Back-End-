import express from "express";
import { randomBytes } from "node:crypto";
import { Usuario, Sesion } from "../models/index.js";
import { cookieOptions, hashToken } from "../middlewares/auth.js";

const router = express.Router();
const duracion = 8 * 60 * 60 * 1000;

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

router.post("/login", async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";
    if (!email || email.length > 254 || !password || password.length > 256) {
      return res.status(400).render("login", {
        email,
        error: "Ingresá un correo y una contraseña válidos.",
      });
    }
    const usuario = await Usuario.findOne({ email }).select("+password");
    if (!usuario || usuario.password !== password) {
      return res
        .status(401)
        .render("login", { email, error: "Correo o contraseña incorrectos." });
    }
    const token = randomBytes(32).toString("hex");
    await Sesion.create({
      tokenHash: hashToken(token),
      usuario: usuario._id,
      expiresAt: new Date(Date.now() + duracion),
    });
    if (req.sesion) await req.sesion.deleteOne();
    res.cookie("freshroute_session", token, {
      ...cookieOptions,
      maxAge: duracion,
    });
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    if (req.sesion) await req.sesion.deleteOne();
    res.clearCookie("freshroute_session", cookieOptions);
    res.redirect("/login");
  } catch (err) {
    next(err);
  }
});
export default router;
