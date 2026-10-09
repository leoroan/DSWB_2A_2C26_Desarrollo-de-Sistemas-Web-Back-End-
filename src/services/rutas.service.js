import rutasRepo from "../repositories/rutas.repo.js";
import paradasRepo from "../repositories/paradas.repo.js";

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

export default { listarRutas, obtenerDetalle };