const express = require("express");
const controller = require("../controllers/rutas.controller");

const router = express.Router();

router.get("/", controller.listar);
router.get("/:id", controller.detalle);

module.exports = router;