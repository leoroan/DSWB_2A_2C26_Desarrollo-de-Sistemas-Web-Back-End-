const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboard.controller");
const rutasController = require("../controllers/rutas.controller");

// Dashboard principal — página de entrada
router.get("/", controller.mostrarDashboard);

// Documentación
router.get("/documentacion", controller.mostrarDocumentacion);
router.get("/rutas", rutasController.mostrarListado);
router.get("/rutas/:id", rutasController.mostrarDetalle);

module.exports = router;
