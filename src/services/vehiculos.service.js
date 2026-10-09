import vehiculoRepo from "../repositories/vehiculos.repo.js";

async function listarVehiculos() {
  return await vehiculoRepo.obtenerTodos();
}

async function obtenerDetalleVehiculo(id) {
  return await vehiculoRepo.obtenerPorId(id);
}

async function registrarVehiculo(datos) {
  return await vehiculoRepo.crear(datos);
}

async function asignarChoferAVehiculo(vehiculoId, choferId) {
  const vehiculo = await vehiculoRepo.obtenerPorId(vehiculoId);
  if (!vehiculo) {
    throw new Error("Vehículo no encontrado");
  }
  
  
  vehiculo.asignarChofer(choferId);
  
  
  return await vehiculoRepo.actualizar(vehiculoId, vehiculo);
}

export default { listarVehiculos, obtenerDetalleVehiculo, registrarVehiculo, asignarChoferAVehiculo };