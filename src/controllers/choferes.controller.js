import choferesRepo from "../repositories/choferes.repo.js";
import vehiculosRepo from "../repositories/vehiculos.repo.js";

async function indexWeb(req, res, next) {
  try {
    const choferes = await choferesRepo.obtenerTodos();
    const vehiculos = await vehiculosRepo.obtenerTodos();
    const vehiculosPorId = new Map(vehiculos.map((v) => [v.id, v]));

    res.render("choferes/index", {
      titulo: "Gestión de Choferes",
      choferes,
      vehiculosPorId,
      creado: req.query.creado === "1",
    });
  } catch (error) {
    next(error);
  }
}

async function nuevoWeb(req, res, next) {
  try {
    const vehiculos = await vehiculosRepo.obtenerTodos();
    res.render("choferes/nuevo", {
      titulo: "Registrar Nuevo Chófer",
      vehiculos,
    });
  } catch (error) {
    next(error);
  }
}

async function crearWeb(req, res, next) {
  try {
    const { nombre, apellido, edad, email, licencia, estado, vehiculoId } = req.body;
    await choferesRepo.crear({
      nombre,
      apellido: apellido || null,
      edad: edad ? Number(edad) : null,
      email: email || null,
      licencia: licencia || "B2",
      estado: estado || "Disponible",
      vehiculoId: vehiculoId ? Number(vehiculoId) : null,
      fechaAlta: new Date().toISOString().split("T")[0],
    });

    res.redirect("/choferes?creado=1");
  } catch (error) {
    next(error);
  }
}

export default {
  indexWeb,
  nuevoWeb,
  crearWeb,
};
