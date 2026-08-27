const express = require("express");
const personasRouter = require("./src/routes/personas.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Hola Lean!");
});

// Api Personas
app.use("/api/personas", personasRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
