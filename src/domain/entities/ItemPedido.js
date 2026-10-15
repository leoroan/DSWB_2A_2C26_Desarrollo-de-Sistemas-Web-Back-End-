class ItemPedido {
  constructor({ id, pedidoId, productoId, cantidad, observaciones = "" } = {}) {
    Object.assign(this, { id, pedidoId, productoId, cantidad, observaciones });
  }
}

export default ItemPedido;

