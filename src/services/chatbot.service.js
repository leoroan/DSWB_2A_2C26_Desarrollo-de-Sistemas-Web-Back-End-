import { GoogleGenAI } from "@google/genai";
import config from "../config/env.js";
import { DECLARACIONES_FUNCIONES, ejecutarFuncion } from "./chatbot/functions.js";

const { apiKey: apiKeyConfig, model: modeloConfig } = config.gemini;

/**
 * System prompt de FreshBot.
 * Contiene información pública de FreshRoute B2B e instrucciones para usar
 * las funciones de consulta de solo lectura cuando el usuario pregunte por
 * datos operativos reales (pedidos, clientes, productos).
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
4. Tenés acceso a funciones de consulta de solo lectura sobre pedidos, clientes
   y productos. Cuando el usuario pregunte por datos concretos (estado de un
   pedido, pedidos de un cliente, productos activos, precios, cantidad de
   clientes activos, etc.), usá la función correspondiente en lugar de
   responder de memoria.
5. No permitas consultas arbitrarias ni escrituras en la base de datos.
   Solo ejecutá las funciones disponibles y devolvé los resultados al usuario
   de forma clara y resumida.
6. Si una función devuelve error o no encuentra registros, informalo al
   usuario sin exponer detalles internos.`.trim();

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
 * Genera una respuesta de Gemini con Function Calling y streaming.
 * Cuando Gemini solicita una consulta, el backend la ejecuta de solo lectura
 * y devuelve el resultado para que Gemini complete su respuesta.
 *
 * @param {string} mensajeUsuario Texto escrito por el usuario.
 * @param {function(string)} onFragmento Callback invocado con cada fragmento de texto.
 * @param {Array} [historial] Historial de mensajes de la conversación (sin persistencia).
 * @returns {Promise<{ok: boolean, texto?: string, error?: string}>}
 */
async function generarRespuesta(mensajeUsuario, onFragmento, historial = []) {
  if (!mensajeUsuario || !String(mensajeUsuario).trim()) {
    return { ok: false, error: "El mensaje no puede estar vacío." };
  }

  const ia = obtenerCliente();
  const contenidos = [];

  // Historial previo (turnos de usuario y modelo)
  for (const turno of historial) {
    if (turno.rol === "usuario") {
      contenidos.push({ role: "user", parts: [{ text: turno.texto }] });
    } else if (turno.rol === "modelo") {
      contenidos.push({ role: "model", parts: [{ text: turno.texto }] });
    }
  }

  // Mensaje actual del usuario
  contenidos.push({ role: "user", parts: [{ text: String(mensajeUsuario).trim() }] });

  let textoCompleto = "";
  const maxRondas = 5;

  try {
    for (let ronda = 0; ronda < maxRondas; ronda++) {
      const stream = await ia.models.generateContentStream({
        model: modeloConfig || "gemini-2.5-flash",
        contents: contenidos,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
          tools: [{ functionDeclarations: DECLARACIONES_FUNCIONES }],
        },
      });

      let funcionLlamada = null;

      for await (const parte of stream) {
        // Extraer el primer part del contenido del candidato (estructura de Gemini SDK).
        const part = parte.candidates?.[0]?.content?.parts?.[0] || {};

        // Al detectar un function call, detenemos la lectura del stream
        // inmediatamente: el modelo está pidiendo ejecutar una consulta,
        // no devolviendo texto final.
        // Nota: el thoughtSignature está en `part`, no dentro de `part.functionCall`,
        // y Gemini lo exige al devolver el functionCall en la siguiente ronda.
        if (part.functionCall) {
          funcionLlamada = part.functionCall;
          funcionLlamada.thoughtSignature = part.thoughtSignature;
          break;
        }
        const fragmento = part.text || "";
        if (fragmento) {
          textoCompleto += fragmento;
          if (typeof onFragmento === "function") {
            onFragmento(fragmento);
          }
        }
      }

      // Si no hubo function call, el modelo devolvió texto final: terminamos.
      if (!funcionLlamada) break;

      // Registrar el function call del modelo en el historial de contenidos.
      // Gemini exige el thoughtSignature en las partes de functionCall.
      const modelPart = { functionCall: funcionLlamada };
      if (funcionLlamada.thoughtSignature) {
        modelPart.thoughtSignature = funcionLlamada.thoughtSignature;
      }
      contenidos.push({ role: "model", parts: [modelPart] });

      // Ejecutar la función de consulta de solo lectura.
      let resultadoFuncion;
      try {
        const args =
          typeof funcionLlamada.args === "string"
            ? JSON.parse(funcionLlamada.args)
            : funcionLlamada.args || {};
        resultadoFuncion = await ejecutarFuncion(funcionLlamada.name, args);
      } catch (err) {
        resultadoFuncion = { ok: false, error: err.message };
      }

      // Enviar el resultado de la función de vuelta a Gemini para que
      // genere la respuesta final en texto.
      contenidos.push({
        role: "user",
        parts: [{ functionResponse: { name: funcionLlamada.name, response: resultadoFuncion } }],
      });
    }

    if (!textoCompleto.trim()) {
      return { ok: false, error: "Gemini devolvió una respuesta vacía." };
    }

    return { ok: true, texto: textoCompleto.trim() };
  } catch (err) {
    return { ok: false, error: clasificarError(err) };
  }
}

export default { generarRespuesta };
