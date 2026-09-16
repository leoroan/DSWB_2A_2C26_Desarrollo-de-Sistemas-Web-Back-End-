const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboard.controller");
<<<<<<< HEAD
const rutasController = require("../controllers/rutas.controller");
=======
const remitosController = require("../controllers/remitos.controller");
>>>>>>> main

// Dashboard principal — página de entrada
router.get("/", controller.mostrarDashboard);

// Documentación
router.get("/documentacion", controller.mostrarDocumentacion);
router.get("/rutas", rutasController.mostrarListado);
router.get("/rutas/:id", rutasController.mostrarDetalle);

// Remitos — vistas web (Pug)
router.get("/remitos", remitosController.indexWeb);
router.get("/remitos/nuevo", remitosController.nuevoWeb); // antes de /:id
router.post("/remitos", remitosController.crearWeb);
router.get("/remitos/:id", remitosController.detailWeb);

module.exports = router;
