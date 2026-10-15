import { mongoose } from "../config/database.js";
import asignacionSchema from "./asignacion.schema.js";
import choferSchema from "./chofer.schema.js";
import clienteSchema from "./cliente.schema.js";
import contadorSchema from "./contador.schema.js";
import itemPedidoSchema from "./itemPedido.schema.js";
import paradaSchema from "./parada.schema.js";
import pedidoSchema from "./pedido.schema.js";
import productoSchema from "./producto.schema.js";
import registroTelemetriaSchema from "./registroTelemetria.schema.js";
import remitoSchema from "./remito.schema.js";
import rutaSchema from "./ruta.schema.js";
import rutaCatalogoSchema from "./rutaCatalogo.schema.js";
import vehiculoSchema from "./vehiculo.schema.js";
import usuarioSchema from "./usuario.schema.js";
import sesionSchema from "./sesion.schema.js";

/**
 * Registro central de modelos Mongoose de "FreshRoute B2B" (única capa "models").
 * Cada `*.schema.js` define SOLO el esquema de persistencia (BDD/Mongo);
 * acá se compilan los modelos una única vez.
 * La lógica de negocio vive en `src/domain/entities/` y las validaciones de
 * dominio en `src/domain/validators/`; los `repositories/` traducen entre
 * documentos Mongo y esas clases, para que controladores y vistas Pug
 * funcionen sin cambios.
 */
function compilar(nombre, esquema) {
  return mongoose.models[nombre] ?? mongoose.model(nombre, esquema);
}

const modelos = {
  Cliente: compilar("Cliente", clienteSchema),
  Chofer: compilar("Chofer", choferSchema),
  Vehiculo: compilar("Vehiculo", vehiculoSchema),
  Ruta: compilar("Ruta", rutaSchema),
  Parada: compilar("Parada", paradaSchema),
  Pedido: compilar("Pedido", pedidoSchema),
  ItemPedido: compilar("ItemPedido", itemPedidoSchema),
  Producto: compilar("Producto", productoSchema),
  Remito: compilar("Remito", remitoSchema),
  RegistroTelemetria: compilar("RegistroTelemetria", registroTelemetriaSchema),
  RutaCatalogo: compilar("RutaCatalogo", rutaCatalogoSchema),
  Asignacion: compilar("Asignacion", asignacionSchema),
  Contador: compilar("Contador", contadorSchema),
  Usuario: compilar("Usuario", usuarioSchema),
  Sesion: compilar("Sesion", sesionSchema),
};

const Usuario = modelos.Usuario;
const Sesion = modelos.Sesion;

/**
 * Devuelve el próximo valor de una secuencia autoincremental y lo persiste de
 * forma atómica (equivalente a las "secuencias" del JSON de pedidos).
 * @param {keyof typeof modelos | string} nombre Nombre de la secuencia.
 * @returns {Promise<number>}
 */
async function siguienteId(nombre) {
  const doc = await modelos.Contador.findByIdAndUpdate(
    nombre,
    { $inc: { valor: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return doc.valor;
}

export { modelos, siguienteId, Usuario, Sesion };

