const router = require("express").Router();
const productoController = require("../controllers/productos.controller");
const { validarId, validarCuerpo } = require("../middlewares/validarPedido");

router.param("id", validarId);
router.get("/", productoController.listar);
router.post("/", validarCuerpo, productoController.crear);
router.get("/:id", productoController.detalle);
router.put("/:id", validarCuerpo, productoController.actualizar);
router.delete("/:id", productoController.eliminar);

module.exports = router;
