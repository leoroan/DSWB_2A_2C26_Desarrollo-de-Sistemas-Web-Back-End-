const { exigir, idValido, fechaValida } = require('../utils/validaciones');

class Pedido {
  static estados = ['pendiente', 'confirmado', 'en_preparacion', 'en_reparto', 'entregado', 'cancelado'];

  constructor({ id, clienteId, fechaPedido = new Date().toISOString().slice(0, 10),
    estado = 'pendiente', fechaEntregaSolicitada, observaciones = '' }) {
    exigir(idValido(clienteId), 'clienteId debe ser un entero positivo');
    exigir(fechaValida(fechaPedido), 'fechaPedido debe ser una fecha válida YYYY-MM-DD');
    exigir(fechaValida(fechaEntregaSolicitada), 'fechaEntregaSolicitada debe ser una fecha válida YYYY-MM-DD');
    exigir(fechaEntregaSolicitada >= fechaPedido, 'La entrega no puede ser anterior al pedido');
    exigir(Pedido.estados.includes(estado), 'Estado de pedido inválido');
    exigir(typeof observaciones === 'string', 'observaciones debe ser texto');
    Object.assign(this, { id, clienteId, fechaPedido, estado, fechaEntregaSolicitada, observaciones });
  }
}

module.exports = Pedido;
