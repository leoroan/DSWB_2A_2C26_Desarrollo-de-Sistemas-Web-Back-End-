const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboard.controller");

// Documentación
router.get("/documentacion", controller.mostrarDocumentacion);

module.exports = router;
