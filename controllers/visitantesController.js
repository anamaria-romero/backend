const db = require('../models/db');

exports.registrarEntrada = (req, res) => {
  const { documento, nombre, dependencia, funcionario, fecha, horaEntrada, documentoVigilante } = req.body;

  const verificarEntradaActiva = `
    SELECT * FROM visitantes
    WHERE documento = ? AND horaSalida IS NULL
  `;

  db.query(verificarEntradaActiva, [documento], (err, resultados) => {
    if (err) {
      console.error("Error al verificar entrada activa:", err);
      return res.status(500).json({ error: 'Error al verificar entrada activa' });
    }

    if (resultados.length > 0) {
      return res.status(400).json({ mensaje: 'Este visitante ya tiene una entrada sin registrar salida.' });
    }

    const queryInsertar = `
      INSERT INTO visitantes (documento, nombre, dependencia, funcionario, fecha, horaEntrada, documentoVigilante)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(queryInsertar, [documento, nombre, dependencia, funcionario, fecha, horaEntrada, documentoVigilante], (err) => {
      if (err) {
        console.error("Error al registrar entrada:", err);
        return res.status(500).json({ error: 'Error al registrar entrada' });
      }

      res.json({ mensaje: 'Entrada registrada correctamente' });
    });
  });
};

exports.registrarSalida = (req, res) => {
  const { documento, fechaSalida, horaSalida } = req.body;

  const query = `
    UPDATE visitantes
    SET horaSalida = ?
    WHERE documento = ? AND fecha = ? AND horaSalida IS NULL
  `;

  db.query(query, [horaSalida, documento, fechaSalida], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al registrar salida' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Visitante no encontrado o ya salió' });

    res.json({ mensaje: 'Salida registrada correctamente.' });
  });
};

exports.obtenerVisitantesActivos = (req, res) => {
  const query = `
    SELECT * FROM visitantes 
    WHERE horaSalida IS NULL
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener visitantes activos' });
    res.json(results);
  });
};

exports.reportePorFecha = (req, res) => {
  const { fecha } = req.query;

  const query = `
    SELECT v.*, vi.nombre AS nombreVigilante
    FROM visitantes v
    LEFT JOIN vigilante vi ON v.documentoVigilante = vi.documento
    WHERE v.fecha = ?
  `;

  db.query(query, [fecha], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al generar el reporte' });
    res.json(results);
  });
};

exports.buscarPorDocumento = (req, res) => {
  const { documento } = req.params;

  const query = `
    SELECT nombre, dependencia, funcionario
    FROM visitantes
    WHERE documento = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(query, [documento], (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).json({ mensaje: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensaje: "Visitante no encontrado" });
    }

    res.json(results[0]);
  });
};