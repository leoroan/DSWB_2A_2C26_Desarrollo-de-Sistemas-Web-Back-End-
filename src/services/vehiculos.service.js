import vehiculoRepo from "../repositories/vehiculos.repo.js";
import choferesRepo from "../repositories/choferes.repo.js";

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

  const chofer = await choferesRepo.obtenerPorId(choferId);
  if (!chofer) {
    throw new Error("Chofer no encontrado");
  }

  // El vehículo solo puede recibir un chofer si está disponible.
  if (vehiculo.estado !== "Disponible") {
    throw new Error(
      `No se puede asignar el chofer: el vehículo ${vehiculo.patente} no está disponible (estado actual: ${vehiculo.estado}).`
    );
  }

  // El chofer solo puede asignarse si no tiene otro vehículo ocupado.
  if (chofer.vehiculoId && chofer.vehiculoId !== vehiculoId) {
    throw new Error(
      `El chofer ${chofer.nombre} ${chofer.apellido || ""} ya está asignado al vehículo ${chofer.vehiculoId}.`
    );
  }

  // Guarda el chofer que tenía asignado el vehículo antes de cambiar.
  const choferAnteriorId = vehiculo.choferAsignadoId;

  // Asigna el nuevo chofer al vehículo.
  await vehiculoRepo.actualizar(vehiculoId, {
    choferAsignadoId: choferId,
    estado: "Asignado",
  });

  // Si cambiaba de chofer, libera al anterior.
  if (choferAnteriorId && choferAnteriorId !== choferId) {
    const choferAnterior = await choferesRepo.obtenerPorId(choferAnteriorId);
    if (choferAnterior) {
      await choferesRepo.actualizar(choferAnteriorId, {
        vehiculoId: null,
        estado: "Disponible",
      });
    }
  }

  // Vincula al nuevo chofer con el vehículo.
  await choferesRepo.actualizar(choferId, {
    vehiculoId,
  });

  return obtenerDetalleVehiculo(vehiculoId);
}

async function quitarChoferDelVehiculo(vehiculoId) {
  const vehiculo = await vehiculoRepo.obtenerPorId(vehiculoId);
  if (!vehiculo) {
    throw new Error("Vehículo no encontrado");
  }

  if (!vehiculo.choferAsignadoId) {
    throw new Error("Este vehículo no tiene un chofer asignado.");
  }

  // Solo se puede quitar el chofer cuando el vehículo está en estado 'Asignado'.
  if (vehiculo.estado !== "Asignado") {
    throw new Error(
      `No se puede quitar el chofer: el vehículo ${vehiculo.patente} no está en estado 'Asignado' (estado actual: ${vehiculo.estado}).`
    );
  }

  const chofer = await choferesRepo.obtenerPorId(vehiculo.choferAsignadoId);
  if (!chofer) {
    throw new Error("Chofer asignado no encontrado.");
  }

  // El vehículo vuelve a estar disponible sin chofer asignado.
  await vehiculoRepo.actualizar(vehiculoId, {
    choferAsignadoId: null,
    estado: "Disponible",
  });

  // El chofer deja de tener vehículo asignado.
  await choferesRepo.actualizar(chofer.id, {
    vehiculoId: null,
    estado: "Disponible",
  });

  return obtenerDetalleVehiculo(vehiculoId);
}

export default {
  listarVehiculos,
  obtenerDetalleVehiculo,
  registrarVehiculo,
  asignarChoferAVehiculo,
  quitarChoferDelVehiculo,
};