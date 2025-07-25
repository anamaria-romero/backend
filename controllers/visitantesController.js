const pool = require('../models/db');

exports.registrarEntrada = async (req, res) => {
  const { documento, nombre, dependencia, funcionario, fecha, horaEntrada, documentoVigilante } = req.body;

  try {
    const [resultados] = await pool.query(
      `SELECT * FROM visitantes WHERE documento = ? AND horaSalida IS NULL`,
      [documento]
    );

    if (resultados.length > 0) {
      return res.status(400).json({ mensaje: 'Este visitante ya tiene una entrada sin registrar salida.' });
    }

    await pool.query(
      `INSERT INTO visitantes (documento, nombre, dependencia, funcionario, fecha, horaEntrada, documentoVigilante)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [documento, nombre, dependencia, funcionario, fecha, horaEntrada, documentoVigilante]
    );

    res.json({ mensaje: 'Entrada registrada correctamente' });
  } catch (err) {
    console.error("Error al registrar entrada:", err);
    res.status(500).json({ error: 'Error al registrar entrada' });
  }
};

exports.registrarSalida = async (req, res) => {
  const { documento, fechaSalida, horaSalida } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE visitantes SET horaSalida = ? WHERE documento = ? AND horaSalida IS NULL`,
      [horaSalida, documento]
    );


    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Visitante no encontrado o ya salió' });
    }

    res.json({ mensaje: 'Salida registrada correctamente.' });
  } catch (err) {
    console.error("Error al registrar la salida:", err);
    res.status(500).json({ error: 'Error al registrar salida' });
  }
};

exports.obtenerVisitantesActivos = async (req, res) => {
  try {
    const [results] = await pool.query(`SELECT * FROM visitantes WHERE horaSalida IS NULL`);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener visitantes activos:", err);
    res.status(500).json({ error: 'Error al obtener visitantes activos' });
  }
};

exports.reportePorFecha = async (req, res) => {
  const { fecha } = req.query;

  try {
    const [results] = await pool.query(`
      SELECT v.*, vi.nombre AS nombreVigilante
      FROM visitantes v
      LEFT JOIN vigilante vi ON v.documentoVigilante = vi.documento
      WHERE v.fecha = ?
    `, [fecha]);

    res.json(results);
  } catch (err) {
    console.error("Error al generar el reporte:", err);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
};

exports.buscarPorDocumento = async (req, res) => {
  const { documento } = req.params;

  try {
    const [results] = await pool.query(`
      SELECT nombre, dependencia, funcionario
      FROM visitantes
      WHERE documento = ?
      ORDER BY id DESC
      LIMIT 1
    `, [documento]);

    if (results.length === 0) {
      return res.status(404).json({ mensaje: "Visitante no encontrado" });
    }

    res.json(results[0]);
  } catch (err) {
    console.error("Error en la consulta:", err);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};