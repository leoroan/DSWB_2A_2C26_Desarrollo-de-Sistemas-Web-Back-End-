const express = require("express");
const router = express.Router();
const remitosRouter = require("./remitos.routes");
const clientesRouter = require("./clientes.routes");
const rutasRouter = require("./rutas.routes");

// CRUD de remitos + acciones de la clase Remito
router.use("/remitos", remitosRouter);

// CRUD de clientes
router.use("/clientes", clientesRouter);

// Rutas planificadas
router.use("/rutas", rutasRouter);

module.exports = router;
