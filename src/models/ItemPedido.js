const { exigir, idValido } = require("../utils/validaciones");

class ItemPedido {
  constructor({ id, pedidoId, productoId, cantidad, observaciones = "" }) {
    exigir(idValido(pedidoId), "pedidoId debe ser un entero positivo");
    exigir(idValido(productoId), "productoId debe ser un entero positivo");
    exigir(idValido(cantidad), "cantidad debe ser un entero positivo");
    exigir(typeof observaciones === "string", "observaciones debe ser texto");
    Object.assign(this, { id, pedidoId, productoId, cantidad, observaciones });
  }
}

module.exports = ItemPedido;
