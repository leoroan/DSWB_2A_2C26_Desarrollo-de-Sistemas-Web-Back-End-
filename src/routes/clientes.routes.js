const express = require("express");
const clientesController = require("../controllers/clientes.controller");

const router = express.Router();

router.get("/", clientesController.obtenerTodos);
router.get("/:id", clientesController.obtenerPorId);
router.post("/", clientesController.crear);
router.put("/:id", clientesController.actualizar);
router.delete("/:id", clientesController.eliminar);

module.exports = router;