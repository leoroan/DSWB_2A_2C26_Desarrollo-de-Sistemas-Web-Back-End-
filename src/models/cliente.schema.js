import { Schema } from "mongoose";

/**
 * Modelo Cliente (colección "clientes").
 * Reemplaza data/clientes.json.
 *
 * Relación: un Cliente tiene muchos Pedidos (Pedido.clienteId → Cliente.id).
 * Nota de compatibilidad: el id de negocio es un String (Date.now()), igual
 * que en el JSON original. Las fechas se guardan como String para conservar
 * el formato exacto que consumen las vistas y la API.
 */
const clienteSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    nombre: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ["Restaurante", "Comedor"], required: true },
    email: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    domicilioDeEntrega: { type: String, required: true, trim: true },
    estado: { type: String, enum: ["Activo", "Inactivo"], default: "Activo" },
    fechaAlta: { type: String },
    apellido: { type: String, default: null },
    edad: { type: Number, default: null },
  },
  { collection: "clientes", versionKey: false },
);

export default clienteSchema;
