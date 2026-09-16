class Vehiculo {
  constructor(id, patente, tipo, capacidad, temperaturaMin, temperaturaMax, estado, choferAsignadoId, ultimaActualizacionTelemetria) {
    this.id = id;
    this.patente = patente;
    this.tipo = tipo;
    this.capacidad = capacidad;
    this.temperaturaMin = temperaturaMin;
    this.temperaturaMax = temperaturaMax;
    this.estado = estado; // ej: 'Disponible', 'En Ruta', 'Mantenimiento'
    this.choferAsignadoId = choferAsignadoId;
    this.ultimaActualizacionTelemetria = ultimaActualizacionTelemetria;
  }

  // Comportamiento POO
  asignarChofer(choferId) {
    this.choferAsignadoId = choferId;
    this.estado = 'Asignado';
  }

  actualizarTelemetria(fechaActualizacion) {
    this.ultimaActualizacionTelemetria = fechaActualizacion;
  }
}

module.exports = Vehiculo;