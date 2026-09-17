const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboard.controller");
const remitosController = require("../controllers/remitos.controller");
const clientesController = require("../controllers/clientes.controller");

// Dashboard principal — página de entrada
router.get("/", controller.mostrarDashboard);

// Documentación
router.get("/documentacion", controller.mostrarDocumentacion);

// Remitos — vistas web (Pug)
router.get("/remitos", remitosController.indexWeb);
router.get("/remitos/nuevo", remitosController.nuevoWeb); // antes de /:id
router.post("/remitos", remitosController.crearWeb);
router.get("/remitos/:id", remitosController.detailWeb);

// Clientes — vistas web (Pug)
router.get("/clientes", clientesController.indexWeb);
router.get("/clientes/nuevo", clientesController.nuevoWeb);
router.post("/clientes", clientesController.crearWeb);
router.get("/clientes/:id/editar", clientesController.edicionWeb);
router.post("/clientes/:id/editar", clientesController.actualizarWeb);

module.exports = router;
