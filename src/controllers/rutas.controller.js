const rutasService = require("../services/rutas.service");

async function listar(req, res) {
  const rutas = await rutasService.listarRutas();
  res.json(rutas);
}

async function detalle(req, res) {
  const id = Number(req.params.id);
  const ruta = await rutasService.obtenerDetalle(id);

  if (!ruta) {
    return res.status(404).json({ message: "Ruta no encontrada" });
  }

  res.json(ruta);
}

async function mostrarListado(req, res) {
  const rutas = await rutasService.listarRutas();
  res.render("rutas/index", { titulo: "Rutas planificadas", rutas });
}

async function mostrarDetalle(req, res) {
  const id = Number(req.params.id);
  const ruta = await rutasService.obtenerDetalle(id);

  if (!ruta) {
    return res.status(404).render("error", {
      titulo: "Ruta no encontrada",
      mensaje: "La ruta solicitada no existe.",
    });
  }

  res.render("rutas/detail", { titulo: `Detalle de ${ruta.codigo}`, ruta });
}

module.exports = { listar, detalle, mostrarListado, mostrarDetalle };