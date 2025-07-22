const db = require('../models/db');

exports.registrarVigilante = (req, res) => {
  const { documento, nombre, genero } = req.body;

  const query = `INSERT INTO vigilante (documento, nombre, genero) VALUES (?, ?, ?)`;

  db.query(query, [documento, nombre, genero], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al registrar vigilante' });
    res.status(201).json({ mensaje: 'Vigilante registrado correctamente' });
  });
};

exports.obtenerVigilantes = (req, res) => {
  const query = `SELECT * FROM vigilante`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener vigilantes' });
    res.json(results);
  });
};

