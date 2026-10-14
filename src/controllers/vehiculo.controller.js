import vehiculoService from "../services/vehiculos.service.js";
import choferesRepo from "../repositories/choferes.repo.js";
import { idValido } from "../utils/validaciones.js";

/**
 * Controlador de vehículos (vistas web Pug).
 * Ruta web: GET /vehiculos
 */
async function renderIndex(req, res) {
  try {
    const vehiculos = await vehiculoService.listarVehiculos();
    const choferes = await choferesRepo.obtenerTodos();

    // Leemos la query string para mostrar los mensajes de éxito/error
    // llegados por redirección tras la asignación.
    const query = new URLSearchParams(req.url.split("?")[1] || "");
    const mensaje = query.get("msj");
    const error = query.get("error");

    res.render("vehiculos/index", {
      titulo: "Flota de Vehículos",
      vehiculos,
      vehiculosDisponibles: vehiculos.filter((v) => v.estado === "Disponible"),
      choferesDisponibles: choferes.filter((c) => !c.vehiculoId),
      mensaje,
      error,
    });
  } catch (error) {
    console.error("Error en vehiculos.controller:", error);
    res.status(500).send("Hubo un error al cargar la flota de vehículos.");
  }
}

/**
 * POST /vehiculos/asignar-chofer → asigna un chofer a un vehículo.
 */
async function asignarChoferWeb(req, res) {
  try {
    const { vehiculoId, choferId } = req.body ?? {};
    const vehiculoIdNum = Number(vehiculoId);
    const choferIdNum = Number(choferId);

    if (!idValido(vehiculoIdNum)) {
      return res.redirect("/vehiculos?error=1&msj=Seleccione un vehículo para asignar.");
    }
    if (!idValido(choferIdNum)) {
      return res.redirect("/vehiculos?error=1&msj=Seleccione un chofer para asignar.");
    }

    await vehiculoService.asignarChoferAVehiculo(vehiculoIdNum, choferIdNum);
    return res.redirect(303, "/vehiculos?msj=1");
  } catch (error) {
    const mensaje = String(error.message || "No se pudo asignar el chofer.").replace(/["]/g, "&quot;");
    return res.redirect(`/vehiculos?error=1&msj=${encodeURIComponent(mensaje)}`);
  }
}


/**
 * POST /vehiculos/:id/quitar-chofer → quita el chofer asignado de un vehículo.
 */
async function quitarChoferWeb(req, res) {
  try {
    const vehiculoId = Number(req.params.id);

    if (!idValido(vehiculoId)) {
      return res.redirect("/vehiculos?error=1&msj=Seleccione un vehículo correctamente.");
    }

    await vehiculoService.quitarChoferDelVehiculo(vehiculoId);
    return res.redirect(303, "/vehiculos?msj=1");
  } catch (error) {
    const mensaje = String(error.message || "No se pudo quitar el chofer.").replace(/["]/g, "&quot;");
    return res.redirect(`/vehiculos?error=1&msj=${encodeURIComponent(mensaje)}`);
  }
}

export default { renderIndex, asignarChoferWeb, quitarChoferWeb };
