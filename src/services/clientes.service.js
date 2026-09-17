// lógica de aplicación/negocio: genera el ID, decide la fecha de alta y valida los campos
const clientesRepo = require("../repositories/clientes.repo");

// Valores permitidos para validar los datos recibidos por la API
const TIPOS_CLIENTE = ["Restaurante", "Comedor"];
const ESTADOS_CLIENTE = ["Activo", "Inactivo"];

// Acá armamos los datos del cliente antes de mandarlos a guardar
async function obtenerTodos() {
    return await clientesRepo.obtenerTodas();
}

async function obtenerPorId(id) {
    return await clientesRepo.obtenerPorId(id);
}

async function crear(datos) {
    //primero comprobamos que exista y que sea una cadena apropiada
    if (typeof datos.nombre !== "string" ||
        !datos.nombre.trim()) {
        throw new Error("El nombre del cliente es obligatorio");
    }

    if (!datos.tipo) {
        throw new Error("El tipo de cliente es obligatorio");
    }

    if (!TIPOS_CLIENTE.includes(datos.tipo)) {
        throw new Error("El tipo de cliente no es válido");
    }

    if (typeof datos.email !== "string" || !datos.email.trim()) {
        throw new Error("El email del cliente es obligatorio");
    }

    if (typeof datos.telefono !== "string" || !datos.telefono.trim()) {
        throw new Error("El teléfono del cliente es obligatorio");
    }

    if (typeof datos.domicilioDeEntrega !== "string" || !datos.domicilioDeEntrega.trim()) {
        throw new Error("El domicilio de entrega es obligatorio");
    }

    // se valida y ademas apliquemos al dato que finalmente guardamos
    const cliente = {
        id: Date.now().toString(),
        nombre: datos.nombre.trim(),
        tipo: datos.tipo,
        email: datos.email.trim(),
        telefono: datos.telefono.trim(),
        domicilioDeEntrega: datos.domicilioDeEntrega.trim(),
        estado: "Activo",
        fechaAlta: new Date().toISOString()
    };

    // El repositorio se ocupa de guardar el cliente en el JSON
    return await clientesRepo.crear(cliente);
}

async function actualizar(id, datos) {
    //En el POST el sistema determina el estado inicial
    //En el PUT se puede modificar el estado, siempre que sea válido
    const clienteExistente = await clientesRepo.obtenerPorId(id);

    if (!clienteExistente) {
        return null;
    }

    if (datos.nombre !== undefined) {
        if (typeof datos.nombre !== "string" || !datos.nombre.trim()) {
            throw new Error("El nombre del cliente no puede estar vacío");
        }

        datos.nombre = datos.nombre.trim();
    }

    if (datos.tipo !== undefined &&
        !TIPOS_CLIENTE.includes(datos.tipo)
    ) {
        throw new Error("El tipo de cliente no es válido");
    }

    if (datos.email !== undefined) {
        if (typeof datos.email !== "string" || !datos.email.trim()) {
            throw new Error("El email del cliente no puede estar vacío");
        }

        datos.email = datos.email.trim();
    }

    if (datos.telefono !== undefined) {
        if (typeof datos.telefono !== "string" || !datos.telefono.trim()) {
            throw new Error("El teléfono del cliente no puede estar vacío");
        }

        datos.telefono = datos.telefono.trim();
    }

    if (datos.domicilioDeEntrega !== undefined) {
        if (
            typeof datos.domicilioDeEntrega !== "string" ||
            !datos.domicilioDeEntrega.trim()
        ) {
            throw new Error("El domicilio de entrega no puede estar vacío");
        }

        datos.domicilioDeEntrega = datos.domicilioDeEntrega.trim();
    }

    if (
        datos.estado !== undefined &&
        !ESTADOS_CLIENTE.includes(datos.estado)
    ) {
        throw new Error("El estado del cliente no es válido");
    }

    return await clientesRepo.actualizar(id, datos);
}

async function eliminar(id) {
    const clienteExistente = await clientesRepo.obtenerPorId(id);

    // Verificamos que el cliente exista antes de intentar eliminar
    if (!clienteExistente) {
        return null;
    }

    return await clientesRepo.eliminar(id);
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
};