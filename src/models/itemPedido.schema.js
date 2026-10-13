import { Schema } from "mongoose";

/**
 * Modelo Ítem de Pedido (colección "itempedidos").
 * Reemplaza data/pedidos.json (sección "items"). Id numérico autoincremental.
 *
 * Relaciones:
 *  - ItemPedido.pedidoId → Pedido.id.
 *  - ItemPedido.productoId → Producto.id.
 */
const itemPedidoSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    pedidoId: { type: Number, required: true, index: true },
    productoId: { type: Number, required: true, index: true },
    cantidad: { type: Number, required: true },
    observaciones: { type: String, default: "" },
  },
  { collection: "itempedidos", versionKey: false },
);

export default itemPedidoSchema;
