class Pedido {
  static estados = ["pendiente", "confirmado", "en_preparacion", "en_reparto", "entregado", "cancelado"];

  /**
   * Matriz de transiciones permitidas (D1 autorizada).
   * - Flujo hacia adelante, sin retrocesos.
   * - Se puede cancelar desde pendiente/confirmado/en_preparacion.
   * - Una vez enviado (en_reparto) o entregado ya NO se puede cancelar.
   * - entregado y cancelado son terminales.
   * - Repetir el mismo estado es idempotente (se permite).
   */
  static transiciones = {
    pendiente: ["pendiente", "confirmado", "cancelado"],
    confirmado: ["confirmado", "en_preparacion", "cancelado"],
    en_preparacion: ["en_preparacion", "en_reparto", "cancelado"],
    en_reparto: ["en_reparto", "entregado"],
    entregado: ["entregado"],
    cancelado: ["cancelado"],
  };

  /** @returns {boolean} true si se puede pasar de `desde` a `hacia`. */
  static puedeTransitar(desde, hacia) {
    if (!Pedido.estados.includes(desde) || !Pedido.estados.includes(hacia)) return false;
    if (desde === hacia) return true;
    return (Pedido.transiciones[desde] || []).includes(hacia);
  }

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

