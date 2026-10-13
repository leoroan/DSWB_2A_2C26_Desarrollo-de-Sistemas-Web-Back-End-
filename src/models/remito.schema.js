import { Schema } from "mongoose";

/**
 * Modelo Remito (colección "remitos"). Reemplaza data/remitos.json.
 *
 * Relación: Remito.pedidoId → Pedido.id.
 * Las fechas se guardan como String con formato YYYY-MM-DD (como el JSON).
 */
const remitoSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    pedidoId: { type: Number, required: true, index: true },
    fechaEmision: { type: String, required: true },
    fechaVencimiento: { type: String, required: true },
    montoTotal: { type: Number, required: true, default: 0 },
    estado: { type: String, required: true },
    firmadoPor: { type: String, default: null },
    observaciones: { type: String, default: null },
    penalizacionAplicada: { type: Number, default: 0 },
  },
  { collection: "remitos", versionKey: false },
);

export default remitoSchema;
