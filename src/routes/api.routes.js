const express = require("express");
const router = express.Router();
const personasRouter = require("./personas.routes");

// CRUD de personas (persistencia en src/data/personas.json)
router.use("/personas", personasRouter);
router.use("/pedidos", require("./pedidos.routes"));
router.use("/productos", require("./productos.routes"));
router.get("/rutas", async (req, res) => {
  res.json((await require("../repositories/pedidos.repo").leer()).rutas);
});

module.exports = router;
