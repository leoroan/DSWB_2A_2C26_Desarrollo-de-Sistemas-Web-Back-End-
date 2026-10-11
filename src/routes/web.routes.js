import express from "express";
import controller from "../controllers/dashboard.controller.js";
import remitosController from "../controllers/remitos.controller.js";
import clientesController from "../controllers/clientes.controller.js";
import rutasController from "../controllers/rutas.controller.js";
import vehiculosController from "../controllers/vehiculo.controller.js";
import telemetriaController from "../controllers/telemetria.controller.js";
import * as pedidos from "../controllers/pedidos.controller.js";
import { validarId, validarCuerpo } from "../middlewares/validarPedido.js";
import authController from "../controllers/auth.controller.js";
import choferesController from "../controllers/choferes.controller.js";

const router = express.Router();

// Dashboard principal — página de entrada
router.get("/", controller.mostrarDashboard);

// Documentación
router.get("/documentacion", controller.mostrarDocumentacion);

router.param("id", validarId);
router.get("/pedidos", pedidos.indexWeb);
router.get("/pedidos/:id", pedidos.detailWeb);
router.post("/pedidos/:id/ruta", validarCuerpo, pedidos.asignarRutaWeb);

// Rutas planificadas — vistas web (Pug)
router.get("/rutas", rutasController.mostrarListado);
router.get("/rutas/:id", rutasController.mostrarDetalle);

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

// Flota — vehículos (vistas web Pug)
router.get("/vehiculos", vehiculosController.renderIndex);

// Telemetría — detalle por vehículo (vistas web Pug)
router.get("/telemetria/:id", telemetriaController.renderDetail);

// Choferes — vistas web (Pug)
router.get("/choferes", choferesController.indexWeb);
router.get("/choferes/nuevo", choferesController.nuevoWeb);
router.post("/choferes", choferesController.crearWeb);

// Login simulado BBDD
router.get("/login", authController.mostrarLogin);
router.post("/login", authController.procesarLogin);
router.get("/logout", authController.cerrarSesion);

export default router;
