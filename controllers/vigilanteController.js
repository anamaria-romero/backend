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
  try {
    const { usuario, contrasena } = req.body;
    const [result] = await pool.query(
      'SELECT * FROM vigilante WHERE usuario = ? AND contrasena = ?',
      [usuario, contrasena]
    );
    if (result.length === 0) return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    res.json({ mensaje: "Login exitoso", vigilante: result[0] });
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
    const { documento } = req.params;
    const [resultado] = await pool.query('DELETE FROM vigilante WHERE documento = ?', [documento]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Vigilante no encontrado" });
    }
    res.json({ mensaje: "Vigilante eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar vigilante:", error);
    res.status(500).json({ error: "Error al eliminar vigilante", detalle: error.message });
  }
};

const actualizarVigilante = async (req, res) => {
  try {
    const { documento } = req.params;
    const { nombre, genero, usuario, contrasena } = req.body;
    const [result] = await pool.query(
      'UPDATE vigilante SET nombre = ?, genero = ?, usuario = ?, contrasena = ? WHERE documento = ?',
      [nombre, genero, usuario, contrasena, documento]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Vigilante no encontrado" });
    }
    const [[updated]] = await pool.query('SELECT * FROM vigilante WHERE documento = ?', [documento]);
    res.json({ mensaje: "Vigilante actualizado correctamente", updatedVigilante: updated });
  } catch (error) {
    console.error("Error al actualizar vigilante:", error);
    res.status(500).json({ error: "Error al actualizar vigilante", detalle: error.message });
  }
};

module.exports = {
  registrarVigilante,
  loginVigilante,
  obtenerVigilantes,
  eliminarVigilante,
  actualizarVigilante
};