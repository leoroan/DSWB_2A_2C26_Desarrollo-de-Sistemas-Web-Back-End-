const Persona = require("./Persona");

class Cliente extends Persona {
    constructor(
        id,
        nombre,
        tipo,
        email,
        telefono,
        domicilioDeEntrega,
        estado,
        fechaAlta,
        apellido = null,
        edad = null
    ) {
        super(id, nombre, apellido, edad, email);

        this.tipo = tipo;
        this.telefono = telefono;
        this.domicilioDeEntrega = domicilioDeEntrega;
        this.estado = estado;
        this.fechaAlta = fechaAlta;
    }

    cambiarEstado(nuevoEstado) {
        this.estado = nuevoEstado;
    }

    obtenerInformacion() {
        return {
            id: this.id,
            nombre: this.nombre,
            apellido: this.apellido,
            edad: this.edad,
            email: this.email,
            tipo: this.tipo,
            telefono: this.telefono,
            domicilioDeEntrega: this.domicilioDeEntrega,
            estado: this.estado,
            fechaAlta: this.fechaAlta
        };
    }
}

module.exports = Cliente;