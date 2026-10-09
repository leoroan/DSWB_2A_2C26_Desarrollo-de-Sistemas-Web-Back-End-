import { mongoose } from "../../config/database.js";
import Asignacion from "./Asignacion.js";
import Chofer from "./Chofer.js";
import Cliente from "./Cliente.js";
import Contador from "./Contador.js";
import ItemPedido from "./ItemPedido.js";
import Parada from "./Parada.js";
import Pedido from "./Pedido.js";
import Producto from "./Producto.js";
import RegistroTelemetria from "./RegistroTelemetria.js";
import Remito from "./Remito.js";
import Ruta from "./Ruta.js";
import RutaCatalogo from "./RutaCatalogo.js";
import Vehiculo from "./Vehiculo.js";

/**
 * Registro central de modelos Mongoose de "FreshRoute B2B".
 * Cada modelo apunta a una colección de MongoDB y conserva la misma forma de
 * datos que tenían los archivos JSON originales (mismos campos y tipos), de
 * modo que la capa de dominio (clases POO), controladores y vistas Pug
 * funcionen sin cambios.
 */
const modelos = {
  Cliente: mongoose.model("Cliente", Cliente),
  Chofer: mongoose.model("Chofer", Chofer),
  Vehiculo: mongoose.model("Vehiculo", Vehiculo),
  Ruta: mongoose.model("Ruta", Ruta),
  Parada: mongoose.model("Parada", Parada),
  Pedido: mongoose.model("Pedido", Pedido),
  ItemPedido: mongoose.model("ItemPedido", ItemPedido),
  Producto: mongoose.model("Producto", Producto),
  Remito: mongoose.model("Remito", Remito),
  RegistroTelemetria: mongoose.model("RegistroTelemetria", RegistroTelemetria),
  RutaCatalogo: mongoose.model("RutaCatalogo", RutaCatalogo),
  Asignacion: mongoose.model("Asignacion", Asignacion),
  Contador: mongoose.model("Contador", Contador),
};

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

export { modelos, siguienteId };
