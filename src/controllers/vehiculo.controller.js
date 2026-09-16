const vehiculoService = require("../services/vehiculos.service");

async function renderIndex(req, res) {
  try {
    // Pedida de datos
    const vehiculos = await vehiculoService.listarVehiculos();
    
    // Renderizado de la vista de Pug 
    res.render("vehiculos/index", { vehiculos });
  } catch (error) {
    console.error("Error en vehiculos.controller:", error);
    res.status(500).send("Hubo un error al cargar la flota de vehículos.");
  }
}

module.exports = { renderIndex };