/**
 * Controlador de Autenticación simulada contra la base de datos.
 */
import { mongoose } from "../config/database.js";

function mostrarLogin(req, res) {
  const dbConectada = mongoose.connection.readyState === 1;
  const dbName = mongoose.connection.name || "freshroute";

  res.render("login", {
    titulo: "Iniciar Sesión - FreshRoute B2B",
    dbConectada,
    dbName,
    error: req.query.error || null,
  });
}

function procesarLogin(req, res) {
  const { email, password, usuario, rol } = req.body;
  // Permite ingresar con cualquier usuario y clave ingresados
  const loginUser = (usuario || email || "Operador FreshRoute").trim();
  const rolUser = rol || "Planificador de Rutas";
  res.redirect(`/?login=ok&user=${encodeURIComponent(loginUser)}&rol=${encodeURIComponent(rolUser)}`);
}

function cerrarSesion(req, res) {
  res.redirect("/login");
}

export default {
  mostrarLogin,
  procesarLogin,
  cerrarSesion,
};
