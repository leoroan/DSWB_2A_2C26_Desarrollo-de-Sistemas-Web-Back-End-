import { Schema } from "mongoose";

/**
 * Modelo Producto (colección "productos").
 * Reemplaza data/pedidos.json (sección "productos"). Id numérico autoincremental.
 *
 * Relaciones:
 *  - ItemPedido.productoId → Producto.id.
 */
const productoSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    nombre: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, default: 0 },
    estado: { type: String, enum: ["activo", "inactivo"], default: "activo" },
  },
  { collection: "productos", versionKey: false },
);

export default productoSchema;
