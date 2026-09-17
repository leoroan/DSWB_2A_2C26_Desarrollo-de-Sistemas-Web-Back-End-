const express = require("express");
const router = express.Router();
const remitosRouter = require("./remitos.routes");

// CRUD de personas (persistencia en src/data/personas.json)
router.use("/personas", personasRouter);
router.use("/pedidos", require("./pedidos.routes"));
router.use("/productos", require("./productos.routes"));
router.get("/rutas", async (req, res) => {
  res.json((await require("../repositories/pedidos.repo").leer()).rutas);
});
const clientesRouter = require("./clientes.routes");
const rutasRouter = require("./rutas.routes");

// CRUD de remitos + acciones de la clase Remito
router.use("/remitos", remitosRouter);

// CRUD de clientes
router.use("/clientes", clientesRouter);

// Rutas planificadas
router.use("/rutas", rutasRouter);

module.exports = router;
