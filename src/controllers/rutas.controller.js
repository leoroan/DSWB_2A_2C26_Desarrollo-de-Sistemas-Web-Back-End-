import rutasService from "../services/rutas.service.js";
import rutasRepo from "../repositories/rutas.repo.js";
import choferesRepo from "../repositories/choferes.repo.js";
import vehiculosRepo from "../repositories/vehiculos.repo.js";

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

export default { listar, detalle, mostrarListado, mostrarDetalle, nuevoWeb, crearWeb };

/** GET /rutas/nueva → formulario simple (mismo estilo cards). */
async function nuevoWeb(req, res) {
  const [choferes, vehiculos] = await Promise.all([
    choferesRepo.obtenerTodos(),
    vehiculosRepo.obtenerTodos(),
  ]);
  res.render("rutas/nuevo", {
    titulo: "Nueva ruta",
    choferes: choferes.filter((c) => String(c.estado ?? "").toLowerCase() === "disponible"),
    vehiculos,
    form: {},
    errores: [],
  });
}

/** POST /rutas → alta simple y redirige al listado. */
async function crearWeb(req, res) {
  const renderNuevo = async (errores) => {
    const [choferes, vehiculos] = await Promise.all([
      choferesRepo.obtenerTodos(),
      vehiculosRepo.obtenerTodos(),
    ]);
    res.status(400).render("rutas/nuevo", {
      titulo: "Nueva ruta",
      choferes: choferes.filter((c) => String(c.estado ?? "").toLowerCase() === "disponible"),
      vehiculos,
      form: req.body ?? {},
      errores,
    });
  };
  if (!req.body?.codigo) return renderNuevo(["El código es obligatorio"]);
  if (!req.body?.choferId) return renderNuevo(["El chofer es obligatorio"]);
  try {
    await rutasRepo.crear({
      codigo: req.body.codigo,
      choferId: Number(req.body.choferId),
      vehiculoPatente: req.body.vehiculoPatente || null,
      fechaPlanificacion: req.body.fechaPlanificacion || new Date().toISOString(),
      observaciones: req.body.observaciones ?? "",
      estado: "planificada",
    });
    res.redirect(303, "/rutas");
  } catch (error) {
    return renderNuevo([error.message || "No se pudo crear la ruta"]);
  }
}
