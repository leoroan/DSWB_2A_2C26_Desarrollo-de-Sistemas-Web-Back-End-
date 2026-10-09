import { Schema } from "mongoose";

/**
 * Modelo Asignación (colección "asignaciones").
 * Reemplaza data/pedidos.json (sección "asignaciones"): vincula un pedido con
 * una ruta del catálogo. Un pedido tiene como máximo una asignación.
 *
 * Relaciones:
 *  - Asignacion.pedidoId → Pedido.id.
 *  - Asignacion.rutaId → RutaCatalogo.id.
 */
const asignacionSchema = new Schema(
  {
    pedidoId: { type: Number, required: true, index: true },
    rutaId: { type: Number, required: true },
  },
  { collection: "asignaciones", versionKey: false },
);

export default asignacionSchema;
