// Lógica de aplicación/negocio: genera el ID, decide la fecha de alta y valida los campos.
import clientesRepo from "../repositories/clientes.repo.js";
import { validarCliente, normalizarCliente } from "../domain/validators/cliente.validator.js";

// Acá armamos los datos del cliente antes de mandarlos a guardar
async function obtenerTodos() {
    return await clientesRepo.obtenerTodas();
}

async function obtenerPorId(id) {
    return await clientesRepo.obtenerPorId(id);
}

async function crear(datos) {
    validarCliente(datos);
    const normalizado = normalizarCliente(datos);
    // se valida y ademas aplicamos al dato que finalmente guardamos
    const cliente = {
        id: Date.now().toString(),
        nombre: normalizado.nombre,
        tipo: normalizado.tipo,
        email: normalizado.email,
        telefono: normalizado.telefono,
        domicilioDeEntrega: normalizado.domicilioDeEntrega,
        estado: "Activo",
        fechaAlta: new Date().toISOString()
    };

    // El repositorio se ocupa de guardar el cliente en MongoDB
    return await clientesRepo.crear(cliente);
}

async function actualizar(id, datos) {
    //En el POST el sistema determina el estado inicial
    //En el PUT se puede modificar el estado, siempre que sea válido
    const clienteExistente = await clientesRepo.obtenerPorId(id);

    if (!clienteExistente) {
        return null;
    }

    validarCliente(datos, { parcial: true });

    return await clientesRepo.actualizar(id, normalizarCliente(datos));
}

async function eliminar(id) {
    const clienteExistente = await clientesRepo.obtenerPorId(id);

    // Verificamos que el cliente exista antes de intentar eliminar
    if (!clienteExistente) {
        return null;
    }

    return await clientesRepo.eliminar(id);
}

export default { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };