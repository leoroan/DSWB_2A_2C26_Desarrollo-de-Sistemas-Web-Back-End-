class Pedido {
  static estados = ["pendiente", "confirmado", "en_preparacion", "en_reparto", "entregado", "cancelado"];

  constructor({
    id,
    clienteId,
    fechaPedido = new Date().toISOString().slice(0, 10),
    estado = "pendiente",
    fechaEntregaSolicitada,
    observaciones = "",
  } = {}) {
    Object.assign(this, { id, clienteId, fechaPedido, estado, fechaEntregaSolicitada, observaciones });
  }
}

export default Pedido;

