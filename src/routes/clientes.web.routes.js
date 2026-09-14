const express = require("express");

const clientesWebController = require("../controllers/clientes.web.controller");

const router = express.Router();

router.get("/", clientesWebController.mostrarListado);

router.get("/nuevo", clientesWebController.mostrarFormularioNuevo);

router.post("/", clientesWebController.crear);

router.get("/:id/editar", clientesWebController.mostrarFormularioEdicion);

router.post("/:id/editar", clientesWebController.actualizar);

module.exports = router;