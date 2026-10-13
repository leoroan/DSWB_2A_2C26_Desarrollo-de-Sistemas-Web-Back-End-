import { exigir, idValido } from "../../utils/validaciones.js";

/** Valida y normaliza los datos de un ItemPedido. */
export function validarItemPedido(datos) {
  exigir(datos && typeof datos === "object", "Se requiere un objeto con los datos del ítem");
  exigir(idValido(datos.pedidoId), "pedidoId debe ser un entero positivo");
  exigir(idValido(datos.productoId), "productoId debe ser un entero positivo");
  exigir(idValido(datos.cantidad), "cantidad debe ser un entero positivo");
  exigir(typeof (datos.observaciones ?? "") === "string", "observaciones debe ser texto");
  return {
    id: datos.id,
    pedidoId: datos.pedidoId,
    productoId: datos.productoId,
    cantidad: datos.cantidad,
    observaciones: datos.observaciones ?? "",
  };
}
