const router = require('express').Router();
const c = require('../controllers/productos.controller');
const { validarId, validarCuerpo } = require('../middlewares/validarPedido');

router.param('id', validarId);
router.get('/', c.listar);
router.post('/', validarCuerpo, c.crear);
router.get('/:id', c.detalle);
router.put('/:id', validarCuerpo, c.actualizar);
router.delete('/:id', c.eliminar);

module.exports = router;
