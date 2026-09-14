// Recibe la petición HTTP y la delega al Service
const clientesService = require("../services/clientes.service");

async function obtenerTodos(req, res, next) {
    try {
        const clientes = await clientesService.obtenerTodos();

        res.json(clientes);
    } catch (error) {
        next(error);
    }
}

async function obtenerPorId(req, res, next) {
    try {
        const cliente = await clientesService.obtenerPorId(req.params.id);

        if (!cliente) {
            // status 404: si el Service devuelve undefined
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        res.json(cliente);
    } catch (error) {
        next(error);
    }
}

async function crear(req, res, next) {
    try {
        const cliente = await clientesService.crear(req.body);
        //status 201: crear+mos un recurso
        res.status(201).json(cliente);
    } catch (error) {
        next(error);
    }
}

async function actualizar(req, res, next) {
    try {
        const cliente = await clientesService.actualizar(
            req.params.id,
            req.body
        );

        if (!cliente) {
            //status 404: puede que el cliente no exista
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        res.json(cliente);
    } catch (error) {
        next(error);
    }
}

async function eliminar(req, res, next) {
    try {
        const eliminado = await clientesService.eliminar(req.params.id);

        if (!eliminado) {
            //status 404: si el service devuelve false
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }
        // status 204: el servidor procesó con éxito la solicitud del cliente pero no necesita devolver ningún contenido.
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
};