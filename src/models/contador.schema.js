import { Schema } from "mongoose";

/**
 * Modelo Contador (colección "contadores").
 * Reemplaza data/pedidos.json (sección "secuencias"): mantiene los valores
 * autoincrementales de las entidades que antes se generaban con una secuencia
 * compartida (pedidos, items, productos). _id es el nombre de la secuencia.
 */
const contadorSchema = new Schema(
  {
    _id: { type: String, required: true },
    valor: { type: Number, required: true, default: 0 },
  },
  { collection: "contadores", versionKey: false },
);

export default contadorSchema;
