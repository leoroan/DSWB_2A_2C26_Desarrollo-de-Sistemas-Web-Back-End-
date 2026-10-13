import { test } from "node:test";
import assert from "node:assert/strict";

// Mock mínimo de Mongoose: evita conectar a Mongo y valida solo las reglas.
function doc(data) {
  return { ...data, lean: async () => ({ ...data }) };
}
function query(result) {
  return { lean: async () => result };
}
function makeModel({ findOneResult = null, findResult = [], count = 1, exists = null } = {}) {
  return {
    find: () => query(findResult.map((d) => ({ ...d }))),
    findOne: () => query(findOneResult ? { ...findOneResult } : null),
    findById: () => query(findOneResult ? { ...findOneResult } : null),
    countDocuments: async () => count,
    exists: async () => exists,
    create: async () => ({}),
    updateOne: async () => ({}),
    deleteMany: async () => ({}),
    deleteOne: async () => ({ deletedCount: 1 }),
  };
}

const pedidoBase = {
  id: 1,
  clienteId: "1787145000000",
  fechaPedido: "2026-09-16",
  estado: "pendiente",
  fechaEntregaSolicitada: "2026-09-18",
  observaciones: "",
};

// Mocks de modelos/colecciones antes de importar el repo.
const { modelos } = await import("../src/models/index.js");
const clienteActivo = { id: "1787145000000", estado: "Activo" };
modelos.Pedido = makeModel({ findOneResult: pedidoBase, findResult: [pedidoBase], count: 1 });
modelos.ItemPedido = makeModel({ findResult: [{ id: 1, pedidoId: 1, productoId: 1, cantidad: 2 }] });
modelos.Producto = makeModel({ findResult: [{ id: 1, estado: "activo" }] });
modelos.RutaCatalogo = makeModel({ findOneResult: { _id: 4, nombre: "Ruta Norte PM" }, findResult: [] });
modelos.Ruta = makeModel({ findOneResult: { id: 4, choferId: 13 } });
modelos.Chofer = makeModel({ findOneResult: { id: 13, estado: "Disponible" } });
modelos.Asignacion = makeModel();

const clientesRepo = (await import("../src/repositories/clientes.repo.js")).default;
clientesRepo.obtenerPorId = async () => clienteActivo;
clientesRepo.obtenerTodas = async () => [clienteActivo];

const { validarCreacionPedido, validarFiltrosPedidos } = await import(
  "../src/domain/validators/pedido.validator.js"
);
const Pedido = (await import("../src/domain/entities/Pedido.js")).default;
const repo = (await import("../src/repositories/pedidos.repo.js")).default;

test("D1: matriz sin retrocesos y sin cancelar una vez enviado", () => {
  assert.equal(Pedido.puedeTransitar("entregado", "pendiente"), false);
  assert.equal(Pedido.puedeTransitar("cancelado", "pendiente"), false);
  assert.equal(Pedido.puedeTransitar("en_reparto", "cancelado"), false);
  assert.equal(Pedido.puedeTransitar("en_preparacion", "cancelado"), true);
  assert.equal(Pedido.puedeTransitar("pendiente", "confirmado"), true);
});

test("D2+D3: crear exige pendiente y al menos un producto", () => {
  assert.throws(
    () => validarCreacionPedido({ clienteId: "1", fechaPedido: "2026-09-16", fechaEntregaSolicitada: "2026-09-18", items: [] }),
    /al menos un producto/,
  );
  assert.throws(
    () => validarCreacionPedido({ clienteId: "1", fechaPedido: "2026-09-16", fechaEntregaSolicitada: "2026-09-18", estado: "entregado", items: [{ productoId: 1, cantidad: 1 }] }),
    /pendiente/,
  );
  const ok = validarCreacionPedido({ clienteId: "1", fechaPedido: "2026-09-16", fechaEntregaSolicitada: "2026-09-18", items: [{ productoId: 1, cantidad: 1 }] });
  assert.equal(ok.estado, "pendiente");
});

test("D6: filtros simples por cliente y estado", () => {
  assert.deepEqual(validarFiltrosPedidos({ estado: "confirmado", clienteId: "1787145000000" }), { estado: "confirmado", clienteId: 1787145000000 });
  assert.throws(() => validarFiltrosPedidos({ estado: "invalido" }), /inválido/);
});

test("D5: asignar bloquea cancelado/entregado antes de tocar chofer", async () => {
  const originalFindOne = modelos.Pedido.findOne;
  modelos.Pedido.findOne = () => query({ ...pedidoBase, estado: "cancelado" });
  await assert.rejects(() => repo.asignarRuta(1, 4), /cancelado no puede ser asignado/);
  modelos.Pedido.findOne = () => query({ ...pedidoBase, estado: "entregado" });
  await assert.rejects(() => repo.asignarRuta(1, 4), /entregado no puede volver/);
  modelos.Pedido.findOne = originalFindOne;
});
