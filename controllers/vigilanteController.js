const pool = require('../models/db');

const registrarVigilante = async (req, res) => {
  try {
    const { documento, nombre, apellido } = req.body;
    const [resultado] = await pool.query(
      'INSERT INTO vigilantes (documento, nombre, apellido) VALUES (?, ?, ?)',
      [documento, nombre, apellido]
    );
    res.status(201).json({ mensaje: "Vigilante registrado correctamente", resultado });
  } catch (error) {
    console.error("Error al registrar vigilante:", error); 
    res.status(500).json({ error: "Error al registrar vigilante", detalle: error.message });
  }
};

const obtenerVigilantes = async (req, res) => {
  try {
    const [vigilantes] = await pool.query('SELECT * FROM vigilantes');
    res.json(vigilantes);
  } catch (error) {
    console.error("Error al obtener vigilantes:", error);
    res.status(500).json({ error: "Error al obtener vigilantes", detalle: error.message });
  }
};

const eliminarVigilante = async (req, res) => {
  try {
    const documento = req.params.documento;
    const [resultado] = await pool.query('DELETE FROM vigilantes WHERE documento = ?', [documento]);
    res.json({ mensaje: "Vigilante eliminado correctamente", resultado });
  } catch (error) {
    console.error("Error al eliminar vigilante:", error);
    res.status(500).json({ error: "Error al eliminar vigilante", detalle: error.message });
  }
};

module.exports = {
  registrarVigilante,
  obtenerVigilantes,
  eliminarVigilante
};
