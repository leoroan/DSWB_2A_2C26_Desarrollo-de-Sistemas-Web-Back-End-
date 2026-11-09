import { GoogleGenAI } from "@google/genai";
import config from "../config/env.js";

const { apiKey: apiKeyConfig, model: modeloConfig } = config.gemini;

/**
 * System prompt de FreshBot.
 * Contiene únicamente información pública de FreshRoute B2B. No incluye datos
 * operativos privados, credenciales ni acceso a la base de datos.
 */
const SYSTEM_PROMPT = `Eres FreshBot, el asistente virtual de FreshRoute B2B.

Sobre FreshRoute B2B:
- Es una empresa de logística gastronómica (distribución B2B).
- Distribuye viandas corporativas e insumos gastronómicos refrigerados.
- Atiende a más de 120 restaurantes y comedores empresariales.
- Cuenta con 40 empleados: 25 choferes/repartidores, 8 operadores de depósito,
  4 planificadores de rutas y 3 administrativos.
- Sus áreas principales son reparto, depósito, planificación de rutas y administración.

Reglas de comportamiento:
1. Respondí siempre en español, con tono profesional, cercano y natural.
2. Podés conversar libremente sobre la empresa, sus servicios, sus áreas y su equipo.
   No te limites a respuestas rígidas ni a un menú fijo de opciones.
3. No inventes información operativa que no esté disponible (precios, pedidos
   específicos, rutas del día, estados de entrega, nombres de clientes, etc.).
   Si te preguntan algo que no sabés, decilo claramente y ofrecé ayuda en lo que
   sí podés informar.
4. No accedas a bases de datos ni sistemas internos: respondé solo con la
   información de este prompt y conocimiento general.
5. Si el usuario consulta datos operativos concretos (un pedido, una ruta, un
   remito), indicá que esas consultas requieren acceso al sistema de FreshRoute
   y que por ahora no podés atenderlas.`.trim();

let clienteIA = null;

function obtenerCliente() {
  if (!clienteIA) {
    if (!apiKeyConfig) {
      throw new Error("Falta la variable de entorno GEMINI_API_KEY en el servidor.");
    }
    clienteIA = new GoogleGenAI({ apiKey: apiKeyConfig });
  }
  return clienteIA;
}

/**
 * Clasifica los errores de la API de Gemini en mensajes amigables para el
 * frontend, sin exponer detalles internos ni la API Key.
 * @param {Error} err
 * @returns {string}
 */
function clasificarError(err) {
  const mensaje = err && err.message ? err.message : String(err);
  const estado = err && err.status != null ? err.status : null;

  if (!apiKeyConfig) {
    return "El chatbot no está configurado (falta la API Key de Gemini).";
  }
  if (estado === 401 || /api.?key|credencial/i.test(mensaje)) {
    return "La API Key de Gemini no es válida.";
  }
  if (estado === 429 || /cuota|quota|rate.?limit/i.test(mensaje)) {
    return "Se superó la cuota de uso de Gemini. Intentalo de nuevo más tarde.";
  }
  if (estado && estado >= 500) {
    return "El servicio de Gemini está temporalmente fuera de línea. Intentalo de nuevo.";
  }
  return `No se pudo obtener respuesta de Gemini: ${mensaje}.`;
}

/**
 * Genera una respuesta de Gemini por streaming y avisa cada fragmento por
 * callback.
 * @param {string} mensajeUsuario Texto escrito por el usuario.
 * @param {function(string)} onFragmento Callback invocado con cada fragmento de texto.
 * @returns {Promise<{ok: boolean, texto?: string, error?: string}>}
 */
async function generarRespuesta(mensajeUsuario, onFragmento) {
  if (!mensajeUsuario || !String(mensajeUsuario).trim()) {
    return { ok: false, error: "El mensaje no puede estar vacío." };
  }

  const ia = obtenerCliente();
  let textoCompleto = "";
  let recibioContenido = false;

  try {
    const stream = await ia.models.generateContentStream({
      model: modeloConfig || "gemini-2.5-flash",
      contents: String(mensajeUsuario).trim(),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    for await (const parte of stream) {
      const fragmento = parte.text || "";
      if (fragmento) {
        recibioContenido = true;
        textoCompleto += fragmento;
        if (typeof onFragmento === "function") {
          onFragmento(fragmento);
        }
      }
    }

    if (!recibioContenido || !textoCompleto.trim()) {
      return { ok: false, error: "Gemini devolvió una respuesta vacía." };
    }

    return { ok: true, texto: textoCompleto.trim() };
  } catch (err) {
    return { ok: false, error: clasificarError(err) };
  }
}

export default { generarRespuesta };
