import { exigir, idValido } from "../utils/validaciones.js";

class ItemPedido {
  constructor({ id, pedidoId, productoId, cantidad, observaciones = "" }) {
    exigir(idValido(pedidoId), "pedidoId debe ser un entero positivo");
    exigir(idValido(productoId), "productoId debe ser un entero positivo");
    exigir(idValido(cantidad), "cantidad debe ser un entero positivo");
    exigir(typeof observaciones === "string", "observaciones debe ser texto");
    Object.assign(this, { id, pedidoId, productoId, cantidad, observaciones });
  }
}

export default ItemPedido;
