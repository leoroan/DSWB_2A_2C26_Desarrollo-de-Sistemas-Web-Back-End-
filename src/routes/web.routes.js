const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboard.controller");

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

module.exports = router;
