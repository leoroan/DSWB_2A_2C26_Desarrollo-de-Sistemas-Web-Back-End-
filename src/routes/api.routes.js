const express = require("express");
const router = express.Router();
const personasRouter = require("./personas.routes");

// CRUD de personas (persistencia en src/data/personas.json)
router.use("/personas", personasRouter);

module.exports = router;