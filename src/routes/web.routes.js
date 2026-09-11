const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboard.controller");

// Dashboard principal — página de entrada
router.get("/", controller.mostrarDashboard);

// Documentación
router.get("/documentacion", controller.mostrarDocumentacion);

module.exports = router;
