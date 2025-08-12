const pool = require('../models/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment');

exports.obtenerReportes = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Debes enviar fechaInicio y fechaFin' });
    }

    const [rows] = await pool.query(
      'SELECT id, nombre, documento, fecha, hora_entrada, hora_salida FROM visitantes WHERE fecha BETWEEN ? AND ?',
      [fechaInicio, fechaFin]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.descargarExcel = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const [rows] = await pool.query(
      'SELECT id, nombre, documento, fecha, hora_entrada, hora_salida FROM visitantes WHERE fecha BETWEEN ? AND ?',
      [fechaInicio, fechaFin]
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte Visitantes');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Documento', key: 'documento', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Hora Entrada', key: 'hora_entrada', width: 15 },
      { header: 'Hora Salida', key: 'hora_salida', width: 15 },
    ];

    rows.forEach(row => sheet.addRow(row));

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=reportes.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al generar Excel:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.descargarPDF = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const [rows] = await pool.query(
      'SELECT id, nombre, documento, fecha, hora_entrada, hora_salida FROM visitantes WHERE fecha BETWEEN ? AND ?',
      [fechaInicio, fechaFin]
    );

    const doc = new PDFDocument();
    let filename = `reporte_${moment().format('YYYY-MM-DD')}.pdf`;
    filename = encodeURIComponent(filename);

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(18).text('Reporte de Visitantes', { align: 'center' });
    doc.moveDown();

    rows.forEach(v => {
      doc.fontSize(12).text(
        `ID: ${v.id} - Nombre: ${v.nombre} - Documento: ${v.documento} - Fecha: ${moment(v.fecha).format('DD-MM-YYYY')} - Entrada: ${v.hora_entrada} - Salida: ${v.hora_salida}`
      );
    });

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};