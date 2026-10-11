import clientesRepo from "../repositories/clientes.repo.js";
import pedidosRepo from "../repositories/pedidos.repo.js";
import rutasRepo from "../repositories/rutas.repo.js";
import choferesRepo from "../repositories/choferes.repo.js";
import remitosRepo from "../repositories/remito.repo.js";
import vehiculosRepo from "../repositories/vehiculos.repo.js";
import { mongoose } from "../config/database.js";

function mostrarDocumentacion(req, res) {
  res.render("documentacion", {
    titulo: "FreshRoute B2B - Documentación Académica",
  });
}

async function mostrarDashboard(req, res) {
  let stats = {
    clientes: 0,
    pedidos: 0,
    pedidosEnViaje: 0,
    rutas: 0,
    choferes: 0,
    remitos: 0,
    vehiculos: 0,
  };

  try {
    const [clientes, pedidos, rutas, choferes, remitos, vehiculos] =
      await Promise.allSettled([
        clientesRepo.obtenerTodas(),
        pedidosRepo.obtenerTodas(),
        rutasRepo.obtenerTodas(),
        choferesRepo.obtenerTodos(),
        remitosRepo.obtenerTodas(),
        vehiculosRepo.obtenerTodos(),
      ]);

    const listaPedidos = pedidos.status === "fulfilled" ? pedidos.value : [];
    const enViaje = listaPedidos.filter(
      (p) =>
        p.estado &&
        (p.estado.toLowerCase().includes("viaje") ||
          p.estado.toLowerCase().includes("camino") ||
          p.estado.toLowerCase().includes("transito") ||
          p.estado.toLowerCase().includes("asignado")),
    ).length;

    stats = {
      clientes: clientes.status === "fulfilled" ? clientes.value.length : 0,
      pedidos: listaPedidos.length,
      pedidosEnViaje: enViaje > 0 ? enViaje : listaPedidos.length,
      rutas: rutas.status === "fulfilled" ? rutas.value.length : 0,
      choferes: choferes.status === "fulfilled" ? choferes.value.length : 0,
      remitos: remitos.status === "fulfilled" ? remitos.value.length : 0,
      vehiculos: vehiculos.status === "fulfilled" ? vehiculos.value.length : 0,
    };
  } catch (err) {
    console.error("Error al obtener estadísticas del dashboard:", err.message);
  }

  const dbConectada = mongoose.connection.readyState === 1;
  const dbName = mongoose.connection.name || "freshroute";
  const loginExitoso = req.query.login === "ok" || !req.query.logout;
  const usuario = req.query.user || "Operador Logístico";
  const rol = req.query.rol || "Planificador de Rutas";

  res.render("dashboard", {
    titulo: "FreshRoute B2B - Panel Operativo",
    stats,
    dbConectada,
    dbName,
    loginExitoso,
    usuario,
    rol,
  });
}

export default {
  mostrarDashboard,
  mostrarDocumentacion,
};
