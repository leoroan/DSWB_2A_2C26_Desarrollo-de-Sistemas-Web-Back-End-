import { exigir, idValido } from "../utils/validaciones.js";

function validarId(req, res, next, valor, nombre) {
  exigir(/^\d+$/.test(valor) && idValido(Number(valor)), `${nombre} debe ser un entero positivo`);
  next();
}

function validarCuerpo(req, res, next) {
  exigir(req.body && typeof req.body === 'object' && !Array.isArray(req.body), 'Se requiere un objeto JSON');
  next();
}

export { validarId, validarCuerpo };
