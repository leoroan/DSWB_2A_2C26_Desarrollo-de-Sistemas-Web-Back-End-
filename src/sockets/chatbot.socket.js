import { hashToken } from "../middlewares/auth.js";
import { Sesion } from "../models/index.js";
import chatbotService from "../services/chatbot.service.js";

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

    // Evento de mensajes del chatbot (FreshBot) con respuesta por streaming de Gemini.
    // El usuario no envía su id: el servidor lo resuelve por la sesión ya autenticada.
    socket.on("chat:message", async (data) => {
      const textoEntrante = data && data.texto ? String(data.texto).trim() : "";

      if (!textoEntrante) {
        socket.emit("chat:error", {
          codigo: "mensaje_vacio",
          mensaje: "Escribí un mensaje antes de enviar.",
        });
        return;
      }

      // Evita solapar varios flujos de respuesta en la misma conexión.
      if (socket.chatStreaming) {
        socket.emit("chat:error", {
          codigo: "ya_procesando",
          mensaje: "FreshBot aún está respondiendo al mensaje anterior. Esperá un momento.",
        });
        return;
      }

      socket.chatStreaming = true;
      let textoCompleto = "";

      try {
        const resultado = await chatbotService.generarRespuesta(
          textoEntrante,
          (fragmento) => {
            textoCompleto += fragmento;
            socket.emit("chat:fragment", {
              texto: fragmento,
              parcial: true,
            });
          },
        );

        if (resultado.ok) {
          socket.emit("chat:complete", {
            tipo: "gemini",
            texto: resultado.texto,
            destinatario: socket.usuario.nombre,
            recibidoEn: new Date().toISOString(),
          });
        } else {
          socket.emit("chat:error", {
            codigo: "gemini_error",
            mensaje: resultado.error,
          });
        }
      } catch (err) {
        console.error("[FreshBot] Error inesperado:", err);
        socket.emit("chat:error", {
          codigo: "error_interno",
          mensaje: "Ocurrió un error inesperado al procesar tu mensaje.",
        });
      } finally {
        socket.chatStreaming = false;
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
    });
  });
}
