const express = require("express");
const router = express.Router();
const personasRouter = require("./personas.routes");
const remitosRouter = require("./remitos.routes");

// CRUD de personas (persistencia en src/data/personas.json)
router.use("/personas", personasRouter);
router.use("/pedidos", require("./pedidos.routes"));
router.use("/productos", require("./productos.routes"));
router.get("/rutas", async (req, res) => {
  res.json((await require("../repositories/pedidos.repo").leer()).rutas);
});

// CRUD de remitos + acciones de la clase Remito
router.use("/remitos", remitosRouter);

module.exports = router;
