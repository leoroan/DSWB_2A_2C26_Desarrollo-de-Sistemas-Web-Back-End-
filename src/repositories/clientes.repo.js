import { modelos } from "../database/models/index.js";
import { limpio } from "../config/database.js";
import Cliente from "../models/Cliente.js";

/**
 * Repositorio de clientes (MongoDB).
 * Reemplaza la lectura/escritura de data/clientes.json conservando la misma
 * interfaz y la misma forma de los datos, para no alterar el comportamiento
 * de la API ni de las vistas.
 */
const ClienteModel = modelos.Cliente;

/** Convierte un documento plano de Mongo en una instancia de la clase Cliente. */
function mapearACliente(doc) {
  return new Cliente(
    doc.id,
    doc.nombre,
    doc.tipo,
    doc.email,
    doc.telefono,
    doc.domicilioDeEntrega,
    doc.estado,
    doc.fechaAlta,
    doc.apellido,
    doc.edad,
  );
}

async function obtenerTodas() {
  const docs = await ClienteModel.find().lean();
  return docs.map(mapearACliente);
}

async function obtenerPorId(id) {
  // Se compara por String para tolerar que el id llegue como número o string,
  // igual que hacía la versión con JSON.
  const docs = await ClienteModel.find().lean();
  return docs
    .map(mapearACliente)
    .find((cliente) => String(cliente.id) === String(id));
}

async function crear(cliente) {
  await ClienteModel.create(cliente);
  // Se devuelve el mismo objeto recibido (idempotente con la versión JSON),
  // de modo que la respuesta de la API no cambie.
  return cliente;
}

async function actualizar(id, datosActualizados) {
  const doc = await ClienteModel.findOneAndUpdate(
    { id: String(id) },
    { $set: { ...datosActualizados, id: String(id) } },
    { new: true },
  ).lean();

  return doc ? limpio(doc) : null;
}

async function eliminar(id) {
  const res = await ClienteModel.deleteOne({ id: String(id) });
  return res.deletedCount > 0;
}

export default { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
