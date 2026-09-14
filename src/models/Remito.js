class Remito {
  constructor(
    id,
    pedidoId,
    fechaEmision,
    fechaVencimiento,
    montoTotal,
    estado,
    firmadoPor,
    observaciones,
    penalizacionAplicada,
  ) {
    this.id = id;
    this.pedidoId = pedidoId;
    this.fechaEmision = fechaEmision;
    this.fechaVencimiento = fechaVencimiento;
    this.montoTotal = montoTotal;
    this.estado = estado;
    this.firmadoPor = firmadoPor;
    this.observaciones = observaciones;
    this.penalizacionAplicada = penalizacionAplicada;
  }

  cambiarEstado(nuevoEstado) {
    this.estado = nuevoEstado;
  }

  firmar(nombreFirmante) {
    this.firmadoPor = nombreFirmante;
    this.cambiarEstado("firmado");
  }

  agregarObservacion(observacion) {
    this.observaciones = this.observaciones
      ? `${this.observaciones}. ${observacion}`
      : observacion;
  }

  aplicarPenalizacion(monto) {
    if (monto < 0) {
      throw new Error("La penalización no puede ser negativa");
    }

    this.penalizacionAplicada = monto;
    this.montoTotal += monto;
  }

  estaVencido(fechaActual = new Date()) {
    return new Date(fechaActual) > new Date(this.fechaVencimiento);
  }

  esValido() {
    return Boolean(
      this.pedidoId &&
      this.fechaEmision &&
      this.fechaVencimiento &&
      this.montoTotal >= 0 &&
      this.estado &&
      !this.estaVencido(),
    );
  }

  obtenerDatos() {
    return {
      id: this.id,
      pedidoId: this.pedidoId,
      fechaEmision: this.fechaEmision,
      fechaVencimiento: this.fechaVencimiento,
      montoTotal: this.montoTotal,
      estado: this.estado,
      firmadoPor: this.firmadoPor,
      observaciones: this.observaciones,
      penalizacionAplicada: this.penalizacionAplicada,
    };
  }

  obtenerInformacion() {
    return `Remito del pedido ${this.pedidoId} - Estado: ${this.estado}`;
  }
}

module.exports = Remito;
