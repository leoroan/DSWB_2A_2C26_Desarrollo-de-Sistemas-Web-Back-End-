import { hashToken } from "../middlewares/auth.js";
import { Sesion } from "../models/index.js";

const COOKIE_SESION = "freshroute_session";

/**
 * Middleware de autenticación para Socket.IO.
 *
 * Reutiliza el mismo mecanismo de sesión que Express (cookie httpOnly
 * `freshroute_session`). NO confía en ningún identificador de usuario que
 * envíe el cliente: el usuario se resuelve únicamente a partir de la cookie
 * firmada por el servidor durante el handshake.
 */
async function autenticarConexion(socket, next) {
  try {
    const cookie = socket.handshake.headers.cookie || "";
    const token = cookie
      .split(";")
      .map((parte) => parte.trim())
      .find((parte) => parte.startsWith(`${COOKIE_SESION}=`))
      ?.slice(`${COOKIE_SESION}=`.length);

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return next(new Error("Autenticación requerida: sesión inválida"));
    }

    const sesion = await Sesion.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    }).populate("usuario");

    if (!sesion?.usuario) {
      return next(new Error("Autenticación requerida: sesión expirada"));
    }

    socket.usuario = sesion.usuario;
    socket.sesion = sesion;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Registra los eventos del chatbot (FreshBot) sobre la instancia de Socket.IO.
 * @param {import("socket.io").Server} io
 */
export function inicializarSocketsChatbot(io) {
  io.use(autenticarConexion);

  io.on("connection", (socket) => {
    console.log(
      `[Socket.IO] Cliente conectado: ${socket.usuario.nombre} (${socket.id})`,
    );

    // Evento de prueba del chatbot (sin Gemini, sin persistencia).
    socket.on("chat:message", (data) => {
      const respuesta = {
        tipo: "prueba",
        texto:
          "Mensaje de prueba desde FreshBot (servidor). Infraestructura de Socket.IO lista.",
        destinatario: socket.usuario.nombre,
        recibidoEn: new Date().toISOString(),
      };
      socket.emit("chat:complete", respuesta);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
    });
  });
}
