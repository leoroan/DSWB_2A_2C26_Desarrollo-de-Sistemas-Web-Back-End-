const { exigir, idValido } = require('../utils/validaciones');

function validarId(req, res, next, valor, nombre) {
  exigir(/^\d+$/.test(valor) && idValido(Number(valor)), `${nombre} debe ser un entero positivo`);
  next();
}

function validarCuerpo(req, res, next) {
  exigir(req.body && typeof req.body === 'object' && !Array.isArray(req.body), 'Se requiere un objeto JSON');
  next();
}

module.exports = { validarId, validarCuerpo };
