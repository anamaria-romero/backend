const pool = require('../models/db');

const registrarVigilante = async (req, res) => {
  try {
    const { documento, nombre, genero, usuario, contrasena } = req.body;

    const [result] = await pool.query(
      'INSERT INTO vigilante (documento, nombre, genero, usuario, contrasena) VALUES (?, ?, ?, ?, ?)',
      [documento, nombre, genero, usuario, contrasena]
    );

res.status(201).json({ mensaje: "Vigilante registrado correctamente", resultado: result });

  } catch (error) {
    console.error("Error al registrar vigilante:", error);
    res.status(500).json({ error: "Error al registrar vigilante", detalle: error.message });
  }
};

const loginVigilante = async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const [result] = await pool.query(
      'SELECT * FROM vigilante WHERE usuario = ? AND contrasena = ?',
      [usuario, contrasena]
    );

    if (result.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const vigilante = result[0];
    res.json({ mensaje: "Login exitoso", vigilante });
  } catch (error) {
    console.error("Error en login de vigilante:", error);
    res.status(500).json({ error: "Error en el login", detalle: error.message });
  }
};

const obtenerVigilantes = async (req, res) => {
  try {
    const [vigilantes] = await pool.query('SELECT * FROM vigilante');
    res.json(vigilantes);
  } catch (error) {
    console.error("Error al obtener vigilantes:", error);
    res.status(500).json({ error: "Error al obtener vigilantes", detalle: error.message });
  }
};

const eliminarVigilante = async (req, res) => {
  try {
    const documento = req.params.documento;
    const [resultado] = await pool.query('DELETE FROM vigilante WHERE documento = ?', [documento]);
    res.json({ mensaje: "Vigilante eliminado correctamente", resultado });
  } catch (error) {
    console.error("Error al eliminar vigilante:", error);
    res.status(500).json({ error: "Error al eliminar vigilante", detalle: error.message });
  }
};

module.exports = {
  registrarVigilante,
  obtenerVigilantes,
  eliminarVigilante,
  loginVigilante
};
