const pool = require('../models/db'); 
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment-timezone'); 
const fs = require('fs');
const path = require('path');

exports.obtenerReportes = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Debes enviar fechaInicio y fechaFin' });
    }

    const [rows] = await pool.query(
      `SELECT
         v.id,
         v.nombre,
         v.documento,
         v.telefono,
         DATE_FORMAT(v.fecha, '%Y-%m-%d') AS fecha,
         v.horaEntrada AS hora_entrada,
         v.horaSalida AS hora_salida,
         vg.nombre AS nombreVigilante
       FROM visitantes v
       LEFT JOIN vigilante vg ON v.documentoVigilante = vg.documento
       WHERE DATE(v.fecha) BETWEEN ? AND ?
       ORDER BY v.fecha DESC, v.horaEntrada DESC`,
      [fechaInicio, fechaFin]
    );

    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.descargarExcel = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Debes enviar fechaInicio y fechaFin' });
    }

    const [rows] = await pool.query(
      `SELECT
         v.id,
         v.nombre,
         v.documento,
         v.telefono,
         DATE_FORMAT(v.fecha, '%Y-%m-%d') AS fecha,
         v.horaEntrada AS hora_entrada,
         v.horaSalida AS hora_salida,
         vg.nombre AS nombreVigilante
       FROM visitantes v
       LEFT JOIN vigilante vg ON v.documentoVigilante = vg.documento
       WHERE DATE(v.fecha) BETWEEN ? AND ?
       ORDER BY v.fecha DESC, v.horaEntrada DESC`,
      [fechaInicio, fechaFin]
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte Visitantes');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Documento', key: 'documento', width: 20 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Hora Entrada', key: 'hora_entrada', width: 15 },
      { header: 'Hora Salida', key: 'hora_salida', width: 15 },
      { header: 'Vigilante', key: 'nombreVigilante', width: 25 },
    ];

    rows.forEach(r => sheet.addRow(r));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reportes_visitantes.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al generar Excel:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.descargarPDF = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Debes enviar fechaInicio y fechaFin' });
    }

    const [rows] = await pool.query(
      `SELECT
         v.id,
         v.nombre,
         v.documento,
         v.telefono,
         DATE_FORMAT(v.fecha, '%Y-%m-%d') AS fecha,
         v.horaEntrada AS hora_entrada,
         v.horaSalida AS hora_salida,
         vg.nombre AS nombreVigilante
       FROM visitantes v
       LEFT JOIN vigilante vg ON v.documentoVigilante = vg.documento
       WHERE DATE(v.fecha) BETWEEN ? AND ?
       ORDER BY v.fecha DESC, v.horaEntrada DESC`,
      [fechaInicio, fechaFin]
    );

    const totalVisitantes = rows.length;
    const fechaGeneracion = moment().tz('America/Bogota').format('DD-MM-YYYY HH:mm');

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const filename = `reporte_${moment().tz('America/Bogota').format('YYYY-MM-DD')}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    const margin = 40;
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const usableWidth = pageWidth - margin * 2;
    const colWidths = [30, 90, 70, 70, 50, 50, 50, 90];
    const rowHeight = 20;
    const headerHeight = 100; 
    const tableTop = margin + headerHeight;

    const logoPath = path.join(__dirname, '../assets/logo.png');
    const hasLogo = fs.existsSync(logoPath);

    function drawHeader() {
      let titleY = margin;
      
      if (hasLogo) {
        try {
          doc.image(logoPath, margin, titleY, { width: 60 });
        } catch (err) {
          console.error('Error al cargar logo en PDF:', err);
        }
      }

      doc.font('Helvetica-Bold').fontSize(16).fillColor('#0b5ed7')
        .text('Reporte de Visitantes', margin, titleY, {
          width: usableWidth,
          align: 'center'
        });

      doc.font('Helvetica').fontSize(10).fillColor('black')
        .text(`Fecha de generación: ${fechaGeneracion}`, margin, titleY + 50, { align: 'left' })
        .text(`Total de visitantes: ${totalVisitantes}`, margin, titleY + 65, { align: 'left' });

      doc.moveTo(margin, margin + 85)
        .lineTo(margin + usableWidth, margin + 85)
        .lineWidth(0.5).strokeColor('#e0e0e0').stroke();
    }

    function drawTableHeader(y) {
      doc.fillColor('white');
      doc.rect(margin, y, usableWidth, rowHeight).fill('#333');
      let x = margin;
      const headers = ["ID", "Nombre", "Documento", "Teléfono", "Fecha", "Entrada", "Salida", "Vigilante"];
      doc.font('Helvetica-Bold').fontSize(8).fillColor('white');
      for (let i = 0; i < headers.length; i++) {
        doc.text(headers[i], x + 2, y + 5, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      }
      doc.fillColor('black'); 
      return y + rowHeight;
    }

    let y = tableTop;
    drawHeader();
    y = drawTableHeader(y);

    for (let i = 0; i < rows.length; i++) {
      const v = rows[i];

      if (y + rowHeight > pageHeight - margin) {
        doc.addPage();
        drawHeader();
        y = drawTableHeader(tableTop);
      }

      const fillColor = i % 2 === 0 ? '#f8f8f8' : '#ffffff';
      doc.rect(margin, y, usableWidth, rowHeight).fill(fillColor);
      doc.fillColor('black').font('Helvetica').fontSize(8);

      let x = margin;
      doc.text(String(v.id), x + 2, y + 5, { width: colWidths[0], align: 'left' }); x += colWidths[0];
      doc.text(v.nombre || '', x + 2, y + 5, { width: colWidths[1], align: 'left' }); x += colWidths[1];
      doc.text(v.documento || '', x + 2, y + 5, { width: colWidths[2], align: 'left' }); x += colWidths[2];
      doc.text(v.telefono || '', x + 2, y + 5, { width: colWidths[3], align: 'left' }); x += colWidths[3];
      doc.text(v.fecha || '', x + 2, y + 5, { width: colWidths[4], align: 'left' }); x += colWidths[4];
      doc.text(v.hora_entrada || '', x + 2, y + 5, { width: colWidths[5], align: 'left' }); x += colWidths[5];
      doc.text(v.hora_salida || '', x + 2, y + 5, { width: colWidths[6], align: 'left' }); x += colWidths[6];
      doc.text(v.nombreVigilante || '', x + 2, y + 5, { width: colWidths[7], align: 'left' });

      y += rowHeight;
    }

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};