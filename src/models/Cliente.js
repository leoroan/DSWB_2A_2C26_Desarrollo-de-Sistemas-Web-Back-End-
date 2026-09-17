class Cliente {
    constructor(
        id,
        nombre,
        tipo,
        email,
        telefono,
        domicilioDeEntrega,
        estado,
        fechaAlta
    ) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.email = email;
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
            tipo: this.tipo,
            email: this.email,
            telefono: this.telefono,
            domicilioDeEntrega: this.domicilioDeEntrega,
            estado: this.estado,
            fechaAlta: this.fechaAlta
        };
    }
}

module.exports = Cliente;