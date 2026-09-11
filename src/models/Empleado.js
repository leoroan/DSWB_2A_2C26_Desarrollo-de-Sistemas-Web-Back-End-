const Persona = require("./Persona");

class Empleado extends Persona {
  constructor(id, nombre, apellido, edad, email, fechaAlta, estado) {
    super(id, nombre, apellido, edad, email);

    this.fechaAlta = fechaAlta;
    this.estado = estado;
  }

  cambiarEstado(nuevoEstado) {
    this.estado = nuevoEstado;
  }

  obtenerInformacion() {
    return `${this.nombre} ${this.apellido} - Estado: ${this.estado}`;
  }
}

module.exports = Empleado;
