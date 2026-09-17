class RegistroTelemetria {
  constructor(id, vehiculoId, timestamp, latitud, longitud, temperatura, velocidad, estadoMotor) {
    this.id = id;
    this.vehiculoId = vehiculoId;
    this.timestamp = timestamp;
    this.latitud = latitud;
    this.longitud = longitud;
    this.temperatura = temperatura;
    this.velocidad = velocidad;
    this.estadoMotor = estadoMotor; // ej: 'Encendido', 'Apagado'
  }

  // Comportamiento POO: validación interna
  esAlertaDeTemperatura(tempMinima, tempMaxima) {
    return this.temperatura < tempMinima || this.temperatura > tempMaxima;
  }
}

module.exports = RegistroTelemetria;