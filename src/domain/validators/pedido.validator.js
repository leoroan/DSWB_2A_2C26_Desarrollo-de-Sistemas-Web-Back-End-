import { exigir, idValido, fechaValida } from "../../utils/validaciones.js";
import Pedido from "../entities/Pedido.js";

/** Acepta id numérico o string numérico (clientes usan Date.now() string). */
function clienteIdValido(valor) {
  if (idValido(valor)) return true;
  if (typeof valor === "string" && /^\d+$/.test(valor.trim())) {
    const n = Number(valor.trim());
    return Number.isSafeInteger(n) && n > 0;
  }
  return false;
}

/** Normaliza clienteId string numérico a número para validar/consultar. */
export function normalizarClienteIdInput(valor) {
  if (typeof valor === "string" && /^\d+$/.test(valor.trim())) {
    const n = Number(valor.trim());
    if (Number.isSafeInteger(n) && n > 0) return n;
  }
  return valor;
}

/**
 * Valida y normaliza los datos para crear un Pedido (D2 + D3 autorizados).
 * - La creación es siempre en estado "pendiente".
 * - Exige `items` con al menos un producto: sin productos no es un pedido.
 * - Cada ítem exige productoId entero positivo y cantidad entera positiva.
 */
export function validarCreacionPedido(datos) {
  exigir(datos && typeof datos === "object", "Se requiere un objeto con los datos del pedido");
  exigir(clienteIdValido(datos.clienteId), "clienteId debe ser un entero positivo");
  const fechaPedido = datos.fechaPedido ?? new Date().toISOString().slice(0, 10);
  exigir(fechaValida(fechaPedido), "fechaPedido debe ser una fecha válida YYYY-MM-DD");
  exigir(fechaValida(datos.fechaEntregaSolicitada), "fechaEntregaSolicitada debe ser una fecha válida YYYY-MM-DD");
  exigir(datos.fechaEntregaSolicitada >= fechaPedido, "La entrega no puede ser anterior al pedido");
  exigir(
    datos.estado === undefined || datos.estado === "pendiente",
    "Un pedido nuevo siempre se crea en estado pendiente",
  );
  exigir(Array.isArray(datos.items) && datos.items.length > 0, "El pedido debe contener al menos un producto");
  for (const item of datos.items) {
    exigir(item && typeof item === "object", "Cada ítem debe ser un objeto válido");
    exigir(idValido(item.productoId), "productoId debe ser un entero positivo");
    exigir(idValido(item.cantidad), "cantidad debe ser un entero positivo");
    exigir(typeof (item.observaciones ?? "") === "string", "observaciones del ítem debe ser texto");
  }
  exigir(typeof (datos.observaciones ?? "") === "string", "observaciones debe ser texto");
  return {
    id: datos.id,
    clienteId: normalizarClienteIdInput(datos.clienteId),
    fechaPedido,
    estado: "pendiente",
    fechaEntregaSolicitada: datos.fechaEntregaSolicitada,
    observaciones: datos.observaciones ?? "",
    items: datos.items.map((item) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
      observaciones: item.observaciones ?? "",
    })),
  };
}

/**
 * Filtros simples del listado (D6 autorizado, sin complejizar).
 * Valida estado permitido y normaliza clienteId. No toca estilos.
 */
export function validarFiltrosPedidos(query = {}) {
  const filtros = {};
  if (query.estado !== undefined && query.estado !== "" && query.estado !== null) {
    exigir(Pedido.estados.includes(query.estado), "Estado de pedido inválido para el filtro");
    filtros.estado = query.estado;
  }
  if (query.clienteId !== undefined && query.clienteId !== "" && query.clienteId !== null) {
    const clienteId = normalizarClienteIdInput(query.clienteId);
    exigir(clienteIdValido(clienteId), "clienteId debe ser un entero positivo");
    filtros.clienteId = clienteId;
  }
  return filtros;
}

/** Valida y normaliza los datos para crear/actualizar un Pedido. */
export function validarPedido(datos) {
  exigir(datos && typeof datos === "object", "Se requiere un objeto con los datos del pedido");
  exigir(clienteIdValido(datos.clienteId), "clienteId debe ser un entero positivo");
  const fechaPedido = datos.fechaPedido ?? new Date().toISOString().slice(0, 10);
  exigir(fechaValida(fechaPedido), "fechaPedido debe ser una fecha válida YYYY-MM-DD");
  exigir(fechaValida(datos.fechaEntregaSolicitada), "fechaEntregaSolicitada debe ser una fecha válida YYYY-MM-DD");
  exigir(datos.fechaEntregaSolicitada >= fechaPedido, "La entrega no puede ser anterior al pedido");
  exigir(Pedido.estados.includes(datos.estado ?? "pendiente"), "Estado de pedido inválido");
  exigir(typeof (datos.observaciones ?? "") === "string", "observaciones debe ser texto");
  return {
    id: datos.id,
    clienteId: datos.clienteId,
    fechaPedido,
    estado: datos.estado ?? "pendiente",
    fechaEntregaSolicitada: datos.fechaEntregaSolicitada,
    observaciones: datos.observaciones ?? "",
  };
}
