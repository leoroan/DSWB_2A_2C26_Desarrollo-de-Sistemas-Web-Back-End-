const express = require("express");
const router = express.Router();
const remitosRouter = require("./remitos.routes");
const clientesRouter = require("./clientes.routes");
const rutasRouter = require("./rutas.routes");

// Catálogo de rutas que usa el módulo de pedidos (data/pedidos.json)
router.get("/rutas", async (req, res) => {
  res.json(await require("../repositories/pedidos.repo").obtenerRutas());
});

// CRUD de pedidos, ítems, productos y asignación de ruta
router.use("/pedidos", require("./pedidos.routes"));
router.use("/productos", require("./productos.routes"));

// CRUD de remitos + acciones de la clase Remito
router.use("/remitos", remitosRouter);

// CRUD de clientes
router.use("/clientes", clientesRouter);

// Rutas planificadas
router.use("/rutas", rutasRouter);

module.exports = router;
