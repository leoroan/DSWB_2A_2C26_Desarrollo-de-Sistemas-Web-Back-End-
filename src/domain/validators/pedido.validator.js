import { exigir, idValido, fechaValida } from "../../utils/validaciones.js";
import Pedido from "../entities/Pedido.js";

/** Valida y normaliza los datos para crear/actualizar un Pedido. */
export function validarPedido(datos) {
  exigir(datos && typeof datos === "object", "Se requiere un objeto con los datos del pedido");
  exigir(idValido(datos.clienteId), "clienteId debe ser un entero positivo");
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
