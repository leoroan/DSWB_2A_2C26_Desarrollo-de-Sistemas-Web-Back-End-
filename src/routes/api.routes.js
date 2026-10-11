import express from "express";
import remitosRouter from "./remitos.routes.js";
import clientesRouter from "./clientes.routes.js";
import rutasRouter from "./rutas.routes.js";
import pedidosRepo from "../repositories/pedidos.repo.js";
import pedidosRouter from "./pedidos.routes.js";
import productosRouter from "./productos.routes.js";

const router = express.Router();

// Catálogo de rutas que usa el módulo de pedidos (data/pedidos.json)
router.get("/rutas", async (req, res) => {
  res.json(await pedidosRepo.obtenerRutas());
});

// CRUD de pedidos, ítems, productos y asignación de ruta
router.use("/pedidos", pedidosRouter);
router.use("/productos", productosRouter);

// CRUD de remitos + acciones de la clase Remito
router.use("/remitos", remitosRouter);

// CRUD de clientes
router.use("/clientes", clientesRouter);

// Rutas planificadas
router.use("/rutas", rutasRouter);

export default router;
