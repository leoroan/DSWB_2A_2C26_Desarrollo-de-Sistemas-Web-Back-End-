const vehiculoService = require("../services/vehiculos.service");
const telemetriaRepo = require("../repositories/telemetria.repo"); 

async function renderDetail(req, res) {
  try {
    // ID del vehiculo
    const vehiculoId = req.params.id; 

    // Datos del vehiculo e historial
    const vehiculo = await vehiculoService.obtenerDetalleVehiculo(parseInt(vehiculoId));
    const historial = await telemetriaRepo.obtenerPorVehiculo(vehiculoId);

    if (!vehiculo) {
      return res.status(404).send("Vehículo no encontrado");
    }

    // Renderizado de la vista
    res.render("telemetria/detail", { vehiculo, historial });
  } catch (error) {
    console.error("Error en telemetria.controller:", error);
    res.status(500).send("Hubo un error al cargar la telemetría.");
  }
}

module.exports = { renderDetail };