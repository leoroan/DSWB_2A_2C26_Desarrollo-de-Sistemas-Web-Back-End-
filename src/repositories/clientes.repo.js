const Cliente = require("../models/Cliente");
const {
    leerArchivoJson,
    escribirArchivoJson
} = require("../utils/apersistencia");

const ARCHIVO = "clientes.json";

async function obtenerTodas() {
    const datos = await leerArchivoJson(ARCHIVO);

    return datos.map(cliente => new Cliente(
        cliente.id,
        cliente.nombre,
        cliente.tipo,
        cliente.email,
        cliente.telefono,
        cliente.domicilioDeEntrega,
        cliente.estado,
        cliente.fechaAlta
    ));
}

async function obtenerPorId(id) {
    const clientes = await obtenerTodas();

    return clientes.find(cliente => cliente.id === id);
}

async function crear(cliente) {
    const datos = await leerArchivoJson(ARCHIVO);

    datos.push(cliente);

    await escribirArchivoJson(ARCHIVO, datos);

    return cliente;
}

async function actualizar(id, datosActualizados) {
    const datos = await leerArchivoJson(ARCHIVO);

    const indice = datos.findIndex(cliente => cliente.id === id);

    if (indice === -1) {
        return null;
    }

    datos[indice] = {
        ...datos[indice],
        ...datosActualizados,
        id
    };

    await escribirArchivoJson(ARCHIVO, datos);

    return datos[indice];
}

async function eliminar(id) {
    const datos = await leerArchivoJson(ARCHIVO);

    const indice = datos.findIndex(cliente => cliente.id === id);

    if (indice === -1) {
        return false;
    }

    datos.splice(indice, 1);

    await escribirArchivoJson(ARCHIVO, datos);

    return true;
}

module.exports = {
    obtenerTodas,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
};