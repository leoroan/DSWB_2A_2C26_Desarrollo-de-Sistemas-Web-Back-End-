const vehiculoService = require("../services/vehiculos.service");
const telemetriaRepo = require("../repositories/telemetria.repo");

/**
 * Controlador de telemetría (vistas web Pug).
 * Ruta web: GET /telemetria/:id
 * El parámetro :id llega ya validado por el middleware validarId de web.routes.
 */
async function renderDetail(req, res) {
  try {
    // ID del vehiculo
    const vehiculoId = req.params.id;

    // Datos del vehiculo e historial
    const vehiculo = await vehiculoService.obtenerDetalleVehiculo(vehiculoId);
    const historial = await telemetriaRepo.obtenerPorVehiculo(vehiculoId);

    if (!vehiculo) {
      return res.status(404).render("error", {
        titulo: "Vehículo no encontrado",
        mensaje: `No existe un vehículo con el id ${vehiculoId}.`,
      });
    }

    // Renderizado de la vista
    res.render("telemetria/detail", {
      titulo: `Telemetría ${vehiculo.patente}`,
      vehiculo,
      historial,
    });
  } catch (error) {
    console.error("Error en telemetria.controller:", error);
    res.status(500).send("Hubo un error al cargar la telemetría.");
  }
}

module.exports = { renderDetail };
