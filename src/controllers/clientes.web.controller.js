const clientesService = require("../services/clientes.service");

// Muestra el listado de clientes en Pug
async function mostrarListado(req, res, next) {
    try {
        const clientes = await clientesService.obtenerTodos();

        res.render("clientes/index", {
            titulo: "Clientes",
            clientes
        });
    } catch (error) {
        next(error);
    }
}

// Muestra el formulario para crear un cliente
function mostrarFormularioNuevo(req, res) {
    res.render("clientes/form", {
        titulo: "Nuevo cliente",
        cliente: null,
        modoEdicion: false
    });
}

// Procesa la creación de un cliente
async function crear(req, res, next) {
    try {
        await clientesService.crear(req.body);

        res.redirect("/clientes");
    } catch (error) {
        next(error);
    }
}

// Muestra el formulario para editar un cliente
async function mostrarFormularioEdicion(req, res, next) {
    try {
        const cliente = await clientesService.obtenerPorId(req.params.id);

        if (!cliente) {
            return res.status(404).send("Cliente no encontrado");
        }

        res.render("clientes/form", {
            titulo: "Editar cliente",
            cliente,
            modoEdicion: true
        });
    } catch (error) {
        next(error);
    }
}

// Procesa la modificación de un cliente
async function actualizar(req, res, next) {
    try {
        const cliente = await clientesService.actualizar(
            req.params.id,
            req.body
        );

        if (!cliente) {
            return res.status(404).send("Cliente no encontrado");
        }

        res.redirect("/clientes");
    } catch (error) {
        next(error);
    }
}

module.exports = {
    mostrarListado,
    mostrarFormularioNuevo,
    crear,
    mostrarFormularioEdicion,
    actualizar
};