const express = require("express");
const router = express.Router();
const pool = require("../models/db"); 

router.post("/registrar", async (req, res) => {
  const { documento, nombre, genero } = req.body;

  try {
    const sql = `INSERT INTO vigilante (documento, nombre, genero) VALUES (?, ?, ?)`;
    await pool.query(sql, [documento, nombre, genero]);
    res.status(201).json({ mensaje: "Vigilante registrado correctamente" });
  } catch (err) {
    console.error("Error al registrar vigilante:", err);
    res.status(500).json({ error: "Error al registrar vigilante" });
  }
});

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM vigilante`);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener vigilantes:", err);
    res.status(500).json({ error: "Error al obtener vigilantes" });
  }
});

router.delete("/:documento", async (req, res) => {
  const documento = req.params.documento;
  try {
    const sql = "DELETE FROM vigilante WHERE documento = ?";
    await pool.query(sql, [documento]);
    res.json({ mensaje: "Vigilante eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar vigilante:", err);
    res.status(500).json({ error: "Error al eliminar el vigilante" });
  }
});

module.exports = router;