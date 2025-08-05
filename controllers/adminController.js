const db = require('../models/db');

exports.obtenerAdministradores = (req, res) => {
  db.query('SELECT * FROM administrador', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });
    res.json(results);
  });
};

exports.registrarAdministrador = (req, res) => {
  const { documento, nombre, usuario, contrasena } = req.body;

  if (!documento || !nombre || !usuario || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  db.query('INSERT INTO administrador (documento, nombre, usuario, contrasena) VALUES (?, ?, ?, ?)',
    [documento, nombre, usuario, contrasena],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al registrar' });
      res.status(201).json({ mensaje: 'Administrador registrado correctamente' });
    });
};

exports.loginAdministrador = (req, res) => {
  const { usuario, contrasena } = req.body;

  db.query('SELECT * FROM administrador WHERE usuario = ? AND contrasena = ?', [usuario, contrasena], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.status(200).json({ mensaje: 'Inicio de sesión exitoso', admin: results[0] });
  });
};
