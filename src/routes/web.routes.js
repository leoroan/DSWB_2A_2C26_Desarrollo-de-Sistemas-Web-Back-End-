const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboard.controller");
const remitosController = require("../controllers/remitos.controller");

// Dashboard principal — página de entrada
router.get("/", controller.mostrarDashboard);

// Documentación
router.get("/documentacion", controller.mostrarDocumentacion);

// Remitos — vistas web (Pug)
router.get("/remitos", remitosController.indexWeb);
router.get("/remitos/:id", remitosController.detailWeb);

module.exports = router;
