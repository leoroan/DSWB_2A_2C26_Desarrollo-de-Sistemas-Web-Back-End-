import express from "express";
import controller from "../controllers/dashboard.controller.js";
import remitosController from "../controllers/remitos.controller.js";
import clientesController from "../controllers/clientes.controller.js";
import rutasController from "../controllers/rutas.controller.js";
import vehiculosController from "../controllers/vehiculo.controller.js";
import telemetriaController from "../controllers/telemetria.controller.js";
import * as pedidos from "../controllers/pedidos.controller.js";
import * as productos from "../controllers/productos.controller.js";
import { validarId, validarCuerpo } from "../middlewares/validarPedido.js";
import choferesController from "../controllers/choferes.controller.js";

const router = express.Router();

// Dashboard principal — página de entrada
router.get("/", controller.mostrarDashboard);

// Documentación
router.get("/documentacion", controller.mostrarDocumentacion);

router.param("id", validarId);
router.get("/pedidos", pedidos.indexWeb);
router.get("/pedidos/nuevo", pedidos.nuevoWeb); // antes de /:id
router.post("/pedidos", validarCuerpo, pedidos.crearWeb);
router.get("/pedidos/:id/editar", pedidos.editarWeb);
router.post("/pedidos/:id/editar", validarCuerpo, pedidos.actualizarWeb);
router.get("/pedidos/:id", pedidos.detailWeb);
router.post("/pedidos/:id/ruta", validarCuerpo, pedidos.asignarRutaWeb);
router.post("/pedidos/:id/items", validarCuerpo, pedidos.agregarItemWeb);
router.post("/pedidos/:id/items/:itemId", validarCuerpo, pedidos.actualizarItemWeb);
router.post("/pedidos/:id/items/:itemId/eliminar", pedidos.eliminarItemWeb);

// Rutas planificadas — vistas web (Pug)
router.get("/rutas/nueva", rutasController.nuevoWeb);
router.post("/rutas", validarCuerpo, rutasController.crearWeb);
router.get("/rutas", rutasController.mostrarListado);
router.get("/rutas/:id", rutasController.mostrarDetalle);

// Productos — vistas web (Pug)
router.get("/productos", productos.indexWeb);
router.get("/productos/nuevo", productos.nuevoWeb);
router.post("/productos", validarCuerpo, productos.crearWeb);
router.get("/productos/:id/editar", productos.editarWeb);
router.post("/productos/:id/editar", validarCuerpo, productos.actualizarWeb);

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
// Asignación de choferes — vistas web (Pug)
router.post("/vehiculos/asignar-chofer", vehiculosController.asignarChoferWeb);
// Quitar chofer del vehículo — vistas web (Pug)
router.post("/vehiculos/:id/quitar-chofer", vehiculosController.quitarChoferWeb);

// Telemetría — detalle por vehículo (vistas web Pug)
router.get("/telemetria/:id", telemetriaController.renderDetail);

// Choferes — vistas web (Pug)
router.get("/choferes", choferesController.indexWeb);
router.get("/choferes/nuevo", choferesController.nuevoWeb);
router.post("/choferes", choferesController.crearWeb);

export default router;
