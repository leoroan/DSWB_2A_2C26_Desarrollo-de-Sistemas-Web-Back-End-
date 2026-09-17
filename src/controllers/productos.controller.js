const repo = require('../repositories/pedidos.repo');

exports.listar = async (req, res) => res.json((await repo.leer()).productos);
exports.detalle = async (req, res) => res.json(repo.buscar((await repo.leer()).productos, Number(req.params.id), 'Producto'));
exports.crear = async (req, res) => res.status(201).json(await repo.guardarProducto(null, req.body));
exports.actualizar = async (req, res) => res.json(await repo.guardarProducto(Number(req.params.id), req.body));
exports.eliminar = async (req, res) => {
  await repo.eliminarProducto(Number(req.params.id));
  res.status(204).send();
};
