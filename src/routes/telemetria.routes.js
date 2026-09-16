const express = require("express");
const router = express.Router();
const telemetriaController = require("../controllers/telemetria.controller");

// Ruta GET con parámetro de ID
router.get("/:id", telemetriaController.renderDetail);

module.exports = router;