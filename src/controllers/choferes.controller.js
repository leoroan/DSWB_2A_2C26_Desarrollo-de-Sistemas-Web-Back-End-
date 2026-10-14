import choferesRepo from "../repositories/choferes.repo.js";
import vehiculosRepo from "../repositories/vehiculos.repo.js";
import vehiculoService from "../services/vehiculos.service.js";
import { idValido } from "../utils/validaciones.js";

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
    const vehiculosDisponibles = vehiculos.filter((v) => v.estado === "Disponible");
    res.render("choferes/nuevo", {
      titulo: "Registrar Nuevo Chófer",
      vehiculosDisponibles,
    });
  } catch (error) {
    next(error);
  }
}

async function crearWeb(req, res, next) {
  try {
    const { nombre, apellido, edad, email, licencia, estado, vehiculoId } = req.body;

    const choferCreado = await choferesRepo.crear({
      nombre,
      apellido: apellido || null,
      edad: edad ? Number(edad) : null,
      email: email || null,
      licencia: licencia || "B2",
      estado: estado || "Disponible",
      vehiculoId: vehiculoId ? Number(vehiculoId) : null,
      fechaAlta: new Date().toISOString().split("T")[0],
    });

    // Si se eligió un vehículo, asignarlo obligatoriamente a un vehículo
    // disponible. El servicio ya valida estado y libera al chofer anterior.
    if (vehiculoId) {
      const vehiculoIdNum = Number(vehiculoId);
      if (!idValido(vehiculoIdNum)) {
        throw new Error("Seleccione un vehículo válido.");
      }
      await vehiculoService.asignarChoferAVehiculo(vehiculoIdNum, choferCreado.id);
    }

    res.redirect("/choferes?creado=1");
  } catch (error) {
    const vehiculos = await vehiculoService.listarVehiculos();
    const vehiculosDisponibles = vehiculos.filter((v) => v.estado === "Disponible");
    return res.status(400).render("choferes/nuevo", {
      titulo: "Registrar Nuevo Chófer",
      vehiculosDisponibles,
      error: error.message || "No se pudo registrar el chófer.",
    });
  }
}

export default {
  indexWeb,
  nuevoWeb,
  crearWeb,
};
