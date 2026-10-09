import express from "express";
import controller from "../controllers/rutas.controller.js";

const router = express.Router();

router.get("/", controller.listar);
router.get("/:id", controller.detalle);

export default router;