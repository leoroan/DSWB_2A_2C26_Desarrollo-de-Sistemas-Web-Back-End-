const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboard.controller");
const remitosController = require("../controllers/remitos.controller");

// Dashboard principal — página de entrada
router.get("/", controller.mostrarDashboard);

// Documentación
router.get("/documentacion", controller.mostrarDocumentacion);

const pedidos = require('../controllers/pedidos.controller');
const { validarId, validarCuerpo } = require('../middlewares/validarPedido');
router.param('id', validarId);
router.get('/pedidos', pedidos.indexWeb);
router.get('/pedidos/:id', pedidos.detailWeb);
router.post('/pedidos/:id/ruta', validarCuerpo, pedidos.asignarRutaWeb);
// Remitos — vistas web (Pug)
router.get("/remitos", remitosController.indexWeb);
router.get("/remitos/nuevo", remitosController.nuevoWeb); // antes de /:id
router.post("/remitos", remitosController.crearWeb);
router.get("/remitos/:id", remitosController.detailWeb);

module.exports = router;
