import Empleado from "./Empleado.js";

class Chofer extends Empleado {
  constructor(id, nombre, apellido, edad, email, fechaAlta, estado, licencia, vehiculoId) {
    super(id, nombre, apellido, edad, email, fechaAlta, estado);
    
    this.licencia = licencia;
    this.vehiculoId = vehiculoId;
  }

  // Demostramos comportamiento POO
  asignarVehiculo(nuevoVehiculoId) {
    this.vehiculoId = nuevoVehiculoId;
  }

  // Demostramos Polimorfismo
  obtenerInformacion() {
    return `${super.obtenerInformacion()} | Licencia: ${this.licencia} | Vehículo asignado: ${this.vehiculoId || 'Ninguno'}`;
  }
}

export default Chofer;