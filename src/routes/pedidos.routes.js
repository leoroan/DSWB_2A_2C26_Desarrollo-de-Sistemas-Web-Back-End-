const router = require('express').Router();
const c = require('../controllers/pedidos.controller');
const { validarId, validarCuerpo } = require('../middlewares/validarPedido');

router.param('id', validarId);
router.param('itemId', validarId);
router.get('/', c.listar);
router.post('/', validarCuerpo, c.crear);
router.get('/:id', c.detalle);
router.put('/:id', validarCuerpo, c.actualizar);
router.delete('/:id', c.eliminar);
router.get('/:id/items', c.listarItems);
router.post('/:id/items', validarCuerpo, c.guardarItem);
router.put('/:id/items/:itemId', validarCuerpo, c.guardarItem);
router.delete('/:id/items/:itemId', c.eliminarItem);
router.patch('/:id/ruta', validarCuerpo, c.asignarRuta);

module.exports = router;
