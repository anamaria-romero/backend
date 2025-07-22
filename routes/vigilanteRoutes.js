const express = require("express");
const router = express.Router();
const db = require("../models/db");

router.post("/registrar", (req, res) => {
  const { documento, nombre, genero } = req.body;

  const sql = `INSERT INTO vigilante (documento, nombre, genero) VALUES (?, ?, ?)`;

  db.query(sql, [documento, nombre, genero], (err, result) => {
    if (err) {
      console.error("Error al registrar:", err);
      return res.status(500).json({ error: "Error al registrar vigilante" });
    }
    res.status(201).json({ mensaje: "Vigilante registrado correctamente" });
  });
});

router.get("/", (req, res) => {
  const sql = `SELECT * FROM vigilante`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener vigilantes:", err);
      return res.status(500).json({ error: "Error al obtener vigilantes" });
    }
    res.json(results);
  });
});


router.delete("/:documento", (req, res) => {
  const documento = req.params.documento;
  const query = "DELETE FROM vigilante WHERE documento = ?";
  db.query(query, [documento], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al eliminar vigilante" });
    res.json({ mensaje: "Vigilante eliminado correctamente" });
  });
});

module.exports = router;