class Parada {
  constructor(
    id,
    rutaId,
    clienteId,
    direccion,
    orden,
    estado,
    latitud,
    longitud,
    fechaProgramada,
    fechaReal,
    observaciones,
    motivoRechazo,
    temperaturaAlMomento,
  ) {
    this.id = id;
    this.rutaId = rutaId;
    this.clienteId = clienteId;
    this.direccion = direccion;
    this.orden = orden;
    this.estado = estado;
    this.latitud = latitud ?? null;
    this.longitud = longitud ?? null;
    this.fechaProgramada = fechaProgramada;
    this.fechaReal = fechaReal || null;
    this.observaciones = observaciones || "";
    this.motivoRechazo = motivoRechazo || null;
    this.temperaturaAlMomento = temperaturaAlMomento ?? null;
  }

  fueEntregada() {
    return this.estado === "entregada";
  }
}

module.exports = Parada;