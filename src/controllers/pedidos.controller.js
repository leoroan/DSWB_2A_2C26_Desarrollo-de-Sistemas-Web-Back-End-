const repo = require('../repositories/pedidos.repo');
const { exigir, idValido } = require('../utils/validaciones');

exports.listar = async (req, res) => res.json(await repo.listar());
exports.detalle = async (req, res) => res.json(await repo.detalle(Number(req.params.id)));
exports.crear = async (req, res) => res.status(201).json(await repo.guardarPedido(null, req.body));
exports.actualizar = async (req, res) => res.json(await repo.guardarPedido(Number(req.params.id), req.body));
exports.eliminar = async (req, res) => {
  await repo.eliminarPedido(Number(req.params.id));
  res.status(204).send();
};
exports.listarItems = async (req, res) => res.json((await repo.detalle(Number(req.params.id))).items);
exports.guardarItem = async (req, res) => res.status(req.params.itemId ? 200 : 201)
  .json(await repo.guardarItem(Number(req.params.id), Number(req.params.itemId) || null, req.body));
exports.eliminarItem = async (req, res) => {
  await repo.eliminarItem(Number(req.params.id), Number(req.params.itemId));
  res.status(204).send();
};
exports.asignarRuta = async (req, res) => {
  exigir(req.body.rutaId === null || idValido(req.body.rutaId), 'rutaId debe ser un entero positivo o null');
  res.json(await repo.asignarRuta(Number(req.params.id), req.body.rutaId));
};
exports.indexWeb = async (req, res) => res.render('pedidos/index', { titulo: 'Pedidos', pedidos: await repo.listar() });
exports.detailWeb = async (req, res) => res.render('pedidos/detail', {
  titulo: `Pedido #${req.params.id}`, pedido: await repo.detalle(Number(req.params.id)), rutas: (await repo.leer()).rutas,
});
exports.asignarRutaWeb = async (req, res) => {
  const rutaId = req.body.rutaId === '' ? null : Number(req.body.rutaId);
  exigir(rutaId === null || idValido(rutaId), 'Seleccione una ruta válida');
  await repo.asignarRuta(Number(req.params.id), rutaId);
  res.redirect(303, `/pedidos/${req.params.id}`);
};
