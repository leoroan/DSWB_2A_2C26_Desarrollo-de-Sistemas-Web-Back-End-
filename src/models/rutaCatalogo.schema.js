import { Schema } from "mongoose";

/**
 * Modelo RutaCatálogo (colección "rutacatalogos").
 * Reemplaza data/pedidos.json (sección "rutas"): el catálogo de rutas
 * disponibles para asignar a un pedido. Se identifica con _id = id de negocio
 * numérico, igual que en el JSON.
 */
const rutaCatalogoSchema = new Schema(
  {
    _id: { type: Number, required: true },
    nombre: { type: String, required: true },
  },
  { collection: "rutacatalogos", versionKey: false },
);

export default rutaCatalogoSchema;
