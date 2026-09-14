const express = require("express");
const router = express.Router();
const controller = require("../controllers/remitos.controller");

// CRUD
router.get("/", controller.listar);
router.get("/:id", controller.detalle);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.delete("/:id", controller.eliminar);

// Acciones - métodos de la clase Remito
router.post("/:id/firmar", controller.firmar);
router.post("/:id/observaciones", controller.agregarObservacion);
router.post("/:id/penalizacion", controller.aplicarPenalizacion);
router.put("/:id/estado", controller.cambiarEstado);

module.exports = router;
