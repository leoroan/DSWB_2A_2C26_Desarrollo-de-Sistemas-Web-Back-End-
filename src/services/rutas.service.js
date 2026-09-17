const rutasRepo = require("../repositories/rutas.repo");
const paradasRepo = require("../repositories/paradas.repo");

async function listarRutas() {
  const rutas = await rutasRepo.obtenerTodas();
  return Promise.all(
    rutas.map(async (ruta) => {
      const paradas = await paradasRepo.obtenerPorRutaId(ruta.id);
      return { ...ruta, cantidadParadas: paradas.length };
    }),
  );
}

async function obtenerDetalle(id) {
  const ruta = await rutasRepo.obtenerPorId(id);
  if (!ruta) return null;

  const paradas = await paradasRepo.obtenerPorRutaId(id);
  return { ...ruta, paradas, cantidadParadas: paradas.length };
}

module.exports = { listarRutas, obtenerDetalle };