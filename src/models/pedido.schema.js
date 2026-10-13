import { Schema } from "mongoose";

/**
 * Modelo Pedido (colección "pedidos"). Reemplaza data/pedidos.json (sección
 * "pedidos"). El id es numérico autoincremental (ver colección "contadores").
 *
 * Relaciones:
 *  - Pedido.clienteId → Cliente.id (id de negocio string; se guarda tal cual).
 *  - ItemPedido.pedidoId → Pedido.id.
 *  - Asignacion.pedidoId → Pedido.id.
 * Las fechas se guardan como String con formato YYYY-MM-DD (como el JSON).
 */
const pedidoSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    // Mixed: hoy el clienteId de negocio puede ser String grande (Date.now).
    clienteId: { type: Schema.Types.Mixed, required: true },
    fechaPedido: { type: String, required: true },
    estado: { type: String, default: "pendiente" },
    fechaEntregaSolicitada: { type: String, required: true },
    observaciones: { type: String, default: "" },
  },
  { collection: "pedidos", versionKey: false },
);

export default pedidoSchema;
