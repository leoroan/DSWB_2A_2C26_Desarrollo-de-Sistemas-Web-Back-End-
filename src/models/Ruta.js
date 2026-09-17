class Ruta {
  constructor(
    id,
    codigo,
    planificadorId,
    choferId,
    estado,
    fechaPlanificacion,
    fechaEjecucion,
    observaciones,
    vehiculoPatente,
  ) {
    this.id = id;
    this.codigo = codigo;
    this.planificadorId = planificadorId;
    this.choferId = choferId;
    this.estado = estado;
    this.fechaPlanificacion = fechaPlanificacion;
    this.fechaEjecucion = fechaEjecucion || null;
    this.observaciones = observaciones || "";
    this.vehiculoPatente = vehiculoPatente || null;
  }

  estaEnCurso() {
    return this.estado === "en curso";
  }

  cambiarEstado(nuevoEstado) {
    this.estado = nuevoEstado;
  }
}

module.exports = Ruta;