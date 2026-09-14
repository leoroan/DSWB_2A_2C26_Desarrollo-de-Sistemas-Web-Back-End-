const express = require("express");
const router = express.Router();
const personasRouter = require("./personas.routes");
const remitosRouter = require("./remitos.routes");

// CRUD de personas (persistencia en src/data/personas.json)
router.use("/personas", personasRouter);

// CRUD de remitos + acciones de la clase Remito
router.use("/remitos", remitosRouter);

module.exports = router;