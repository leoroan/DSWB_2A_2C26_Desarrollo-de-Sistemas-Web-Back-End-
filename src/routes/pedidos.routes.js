const router = require("express").Router();
const pedidoController = require("../controllers/pedidos.controller");
const { validarId, validarCuerpo } = require("../middlewares/validarPedido");

router.param("id", validarId);
router.param("itemId", validarId);
router.get("/", pedidoController.listar);
router.post("/", validarCuerpo, pedidoController.crear);
router.get("/:id", pedidoController.detalle);
router.put("/:id", validarCuerpo, pedidoController.actualizar);
router.delete("/:id", pedidoController.eliminar);
router.get("/:id/items", pedidoController.listarItems);
router.post("/:id/items", validarCuerpo, pedidoController.guardarItem);
router.put("/:id/items/:itemId", validarCuerpo, pedidoController.guardarItem);
router.delete("/:id/items/:itemId", pedidoController.eliminarItem);
router.patch("/:id/ruta", validarCuerpo, pedidoController.asignarRuta);

module.exports = router;
