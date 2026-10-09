import express from "express";
import * as productoController from "../controllers/productos.controller.js";
import { validarId, validarCuerpo } from "../middlewares/validarPedido.js";

const router = express.Router();

router.param("id", validarId);
router.get("/", productoController.listar);
router.post("/", validarCuerpo, productoController.crear);
router.get("/:id", productoController.detalle);
router.put("/:id", validarCuerpo, productoController.actualizar);
router.delete("/:id", productoController.eliminar);

export default router;
