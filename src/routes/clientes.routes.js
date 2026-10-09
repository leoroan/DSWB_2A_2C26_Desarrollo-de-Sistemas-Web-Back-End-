import express from "express";
import controller from "../controllers/clientes.controller.js";

const router = express.Router();

router.get("/", controller.obtenerTodos);
router.get("/:id", controller.obtenerPorId);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.delete("/:id", controller.eliminar);

export default router;
