import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "node:child_process";

console.log("====================================================");
console.log("  Iniciando MongoDB Local en memoria...");
console.log("====================================================");

try {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: "freshroute",
    },
  });

  console.log(" Base de datos MongoDB Local lista en puerto 27017");
  console.log(" URI: mongodb://127.0.0.1:27017/freshroute\n");
  console.log(" Cargando datos iniciales (seed)...");

  // Ejecutar el seed automáticamente (con --reset para evitar duplicados si ya existían)
  const seedProcess = spawn("node", ["src/database/seed.js", "--reset"], {
    stdio: "inherit",
  });

  seedProcess.on("close", (code) => {
    if (code === 0) {
      console.log("\n Datos cargados con éxito.");
      console.log(" Ahora tu servidor 'npm run dev' ya puede conectarse.");
      console.log(" NOTA: Mantené esta ventana abierta mientras uses la app.");
      console.log("   (Para detener la base de datos presioná Ctrl + C)\n");
    } else {
      console.error("\n Advertencia: El seed terminó con código", code);
    }
  });

  process.on("SIGINT", async () => {
    console.log("\n Deteniendo MongoDB Local...");
    await mongod.stop();
    process.exit(0);
  });
} catch (err) {
  console.error(" Error al iniciar MongoDB Local:", err.message);
  process.exit(1);
}
