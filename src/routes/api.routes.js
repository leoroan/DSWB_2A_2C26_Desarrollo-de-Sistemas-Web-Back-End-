const express = require("express");
const router = express.Router();
const personasRouter = require("./personas.routes");
const rutasRouter = require("./rutas.routes");

// CRUD de personas (persistencia en src/data/personas.json)
router.use("/personas", personasRouter);
router.use("/rutas", rutasRouter);

module.exports = router;