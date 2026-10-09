import fs from "node:fs";
import path from "node:path";
import { conectarDB, cerrarDB, mongoose } from "../config/database.js";
import { modelos } from "./models/index.js";

/**
 * Script de migración (seed): carga los datos de los JSON originales
 * (src/data/*.json) en las colecciones de MongoDB, conservando los ids de
 * negocio, las relaciones y el mismo contenido, para que la aplicación tenga
 * exactamente el mismo comportamiento y visualización que con los JSON.
 *
 * Uso:  node src/database/seed.js            (carga sin borrar)
 *       node src/database/seed.js --reset    (borra las colecciones antes)
 */

const DATA_DIR = path.join(import.meta.dirname, "..", "data");

/** Lee y parsea un JSON de datos (misma lectura que hacía la app). */
function leerJson(nombre) {
  const ruta = path.join(DATA_DIR, nombre);
  const contenido = fs.readFileSync(ruta, "utf-8");
  return JSON.parse(contenido);
}

/**
 * Lee un JSON y devuelve SU ARRAY DE REGISTROS.
 * Los datos de `src/data/*.json` vienen envolviendo el array dentro de una
 * clave `value` (p. ej. { value: [..] }) para conservar el esquema original.
 * Si el archivo ya es un array, lo devuelve directamente; si no tiene `value`,
 * devuelve un array vacío (evitando que la migración falle por datos faltantes).
 */
function leerArray(nombre) {
  const datos = leerJson(nombre);
  if (Array.isArray(datos)) return datos;
  if (datos && Array.isArray(datos.value)) return datos.value;
  return [];
}

/** Mayor id numérico de una lista (0 si está vacía). */
function maxId(lista) {
  return lista.reduce((max, e) => Math.max(max, Number(e.id) || 0), 0);
}

async function migrar({ reset }) {
  await conectarDB();
  const db = mongoose.connection.name;
  console.log(`[seed] Migrando datos a la base "${db}"...`);

  if (reset) {
    const colecciones = [
      "clientes",
      "choferes",
      "vehiculos",
      "rutas",
      "paradas",
      "pedidos",
      "itempedidos",
      "productos",
      "remitos",
      "telemetria",
      "rutacatalogos",
      "asignaciones",
      "contadores",
    ];
    for (const col of colecciones) {
      await mongoose.connection.db.collection(col).deleteMany({});
    }
    console.log("[seed] Colecciones vaciadas (--reset).");
  }

  // --- Entidades independientes (arrays planos) ---
  const clientes = leerArray("clientes.json");
  const vehiculos = leerArray("vehiculos.json");
  const rutas = leerArray("rutas.json");
  const paradas = leerArray("paradas.json");
  const remitos = leerArray("remitos.json");
  const telemetria = leerArray("telemetria.json");

  if (clientes.length)
    await modelos.Cliente.insertMany(clientes, { ordered: false });
  if (vehiculos.length)
    await modelos.Vehiculo.insertMany(vehiculos, { ordered: false });
  if (rutas.length) await modelos.Ruta.insertMany(rutas, { ordered: false });
  if (paradas.length)
    await modelos.Parada.insertMany(paradas, { ordered: false });
  if (remitos.length)
    await modelos.Remito.insertMany(remitos, { ordered: false });
  if (telemetria.length)
    await modelos.RegistroTelemetria.insertMany(telemetria, { ordered: false });

  // --- pedidos.json: objeto con secciones + secuencias ---
  const pedidosDb = leerJson("pedidos.json");
  const pedidos = pedidosDb.pedidos || [];
  const items = pedidosDb.items || [];
  const productos = pedidosDb.productos || [];
  const rutasCatalogo = (pedidosDb.rutas || []).map((r) => ({
    _id: r.id,
    nombre: r.nombre,
  }));
  const asignaciones = pedidosDb.asignaciones || [];
  const secuencias = pedidosDb.secuencias || {};

  if (pedidos.length)
    await modelos.Pedido.insertMany(pedidos, { ordered: false });
  if (items.length)
    await modelos.ItemPedido.insertMany(items, { ordered: false });
  if (productos.length)
    await modelos.Producto.insertMany(productos, { ordered: false });
  if (rutasCatalogo.length)
    await modelos.RutaCatalogo.insertMany(rutasCatalogo, { ordered: false });
  if (asignaciones.length)
    await modelos.Asignacion.insertMany(asignaciones, { ordered: false });

  // --- Contadores: continuar las secuencias donde quedaron ---
  const contadores = [
    ["pedidos", secuencias.pedidos ?? maxId(pedidos)],
    ["items", secuencias.items ?? maxId(items)],
    ["productos", secuencias.productos ?? maxId(productos)],
    ["remitos", maxId(remitos)],
    ["vehiculos", maxId(vehiculos)],
    ["telemetria", maxId(telemetria)],
    ["choferes", 0],
  ];
  for (const [nombre, valor] of contadores) {
    await modelos.Contador.updateOne(
      { _id: nombre },
      { $max: { valor } },
      { upsert: true },
    );
  }

  const resumen = {
    clientes: clientes.length,
    vehiculos: vehiculos.length,
    rutas: rutas.length,
    paradas: paradas.length,
    remitos: remitos.length,
    telemetria: telemetria.length,
    pedidos: pedidos.length,
    items: items.length,
    productos: productos.length,
    rutasCatalogo: rutasCatalogo.length,
    asignaciones: asignaciones.length,
  };
  console.log("[seed] Migración completada:", resumen);

  await cerrarDB();
}

// mongoose ya fue importado al inicio del archivo.

migrar({ reset: process.argv.includes("--reset") }).catch(async (err) => {
  console.error("[seed] Error durante la migración:", err.message);
  await cerrarDB();
  process.exit(1);
});
