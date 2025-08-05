const pool = require('../models/db');

exports.obtenerAdministradores = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM administrador');
    res.json(results);
  } catch (err) {
    console.error("Error al obtener administradores:", err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.registrarAdministrador = async (req, res) => {
  const { documento, nombre, usuario, contrasena } = req.body;

  if (!documento || !nombre || !usuario || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO administrador (documento, nombre, usuario, contrasena) VALUES (?, ?, ?, ?)',
      [documento, nombre, usuario, contrasena]
    );
    res.status(201).json({ mensaje: 'Administrador registrado correctamente' });
  } catch (err) {
    console.error("Error al registrar administrador:", err);
    res.status(500).json({ error: 'Error al registrar' });
  }
};

exports.loginAdministrador = async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const [results] = await pool.query(
      'SELECT * FROM administrador WHERE usuario = ? AND contrasena = ?',
      [usuario, contrasena]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.status(200).json({ mensaje: 'Inicio de sesión exitoso', admin: results[0] });
  } catch (err) {
    console.error("Error en login de administrador:", err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};