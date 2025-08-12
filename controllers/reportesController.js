const pool = require('../models/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment');
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
         id,
         nombre,
         documento,
         fecha,
         horaEntrada AS hora_entrada,
         horaSalida AS hora_salida
       FROM visitantes
       WHERE DATE(fecha) BETWEEN ? AND ?
       ORDER BY fecha DESC, horaEntrada DESC`,
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
         id,
         nombre,
         documento,
         fecha,
         horaEntrada AS hora_entrada,
         horaSalida AS hora_salida
       FROM visitantes
       WHERE DATE(fecha) BETWEEN ? AND ?
       ORDER BY fecha DESC, horaEntrada DESC`,
      [fechaInicio, fechaFin]
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte Visitantes');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Documento', key: 'documento', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Hora Entrada', key: 'hora_entrada', width: 15 },
      { header: 'Hora Salida', key: 'hora_salida', width: 15 },
    ];

    rows.forEach(r => {
      sheet.addRow({
        id: r.id,
        nombre: r.nombre,
        documento: r.documento,
        fecha: r.fecha ? moment(r.fecha).format('DD-MM-YYYY') : '',
        hora_entrada: r.hora_entrada || '',
        hora_salida: r.hora_salida || ''
      });
    });

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
         id,
         nombre,
         documento,
         fecha,
         horaEntrada AS hora_entrada,
         horaSalida AS hora_salida
       FROM visitantes
       WHERE DATE(fecha) BETWEEN ? AND ?
       ORDER BY fecha DESC, horaEntrada DESC`,
      [fechaInicio, fechaFin]
    );

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const filename = `reporte_${moment().format('YYYY-MM-DD')}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    const margin = 40;
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const usableWidth = pageWidth - margin * 2;
    const colWidths = [40, 160, 100, 70, 70, 70]; 
    const rowHeight = 20;
    const headerHeight = 60;
    const tableTop = margin + headerHeight;
    const footerHeight = 30;

    const logoPath = path.join(__dirname, '../assets/logo.png');
    const hasLogo = fs.existsSync(logoPath);

    function drawHeader() {
      const titleY = margin;
      if (hasLogo) {
        try {
          doc.image(logoPath, margin, titleY, { width: 60 });
        } catch (err) {
          console.error('Error al cargar logo en PDF:', err);
        }
      }
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#0b5ed7')
        .text('Reporte de Visitantes', hasLogo ? margin + 70 : margin, titleY + 10, {
          width: usableWidth - (hasLogo ? 70 : 0),
          align: 'center'
        });
      doc.moveTo(margin, margin + 45).lineTo(margin + usableWidth, margin + 45).lineWidth(0.5).strokeColor('#e0e0e0').stroke();
    }

    function drawTableHeader(y) {
      doc.fillColor('white');
      doc.rect(margin, y, usableWidth, rowHeight).fill('#333');
      let x = margin;
      const headers = ["ID", "Nombre", "Documento", "Fecha", "Entrada", "Salida"];
      doc.font('Helvetica-Bold').fontSize(10).fillColor('white');
      for (let i = 0; i < headers.length; i++) {
        doc.text(headers[i], x + 5, y + 5, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      }
      doc.fillColor('black'); 
      return y + rowHeight;
    }

    function drawFooter(pageNum) {
      const footerText = `Generado el: ${moment().format('DD-MM-YYYY HH:mm')} • Página ${pageNum}`;
      doc.font('Helvetica').fontSize(9).fillColor('gray')
        .text(footerText, margin, pageHeight - margin + 5, {
          width: usableWidth,
          align: 'center'
        });
    }

    let currentPage = 1;
    drawHeader();
    let y = drawTableHeader(tableTop);

    for (let i = 0; i < rows.length; i++) {
      const v = rows[i];

      if (y + rowHeight > pageHeight - margin - footerHeight) {
        drawFooter(currentPage);
        doc.addPage();
        currentPage++;
        drawHeader();
        y = drawTableHeader(tableTop);
      }

      const fillColor = i % 2 === 0 ? '#f8f8f8' : '#ffffff';
      doc.rect(margin, y, usableWidth, rowHeight).fill(fillColor);
      doc.fillColor('black').font('Helvetica').fontSize(10);

      let x = margin;
      doc.text(String(v.id), x + 5, y + 5, { width: colWidths[0], align: 'left' }); x += colWidths[0];
      doc.text(v.nombre || '', x + 5, y + 5, { width: colWidths[1], align: 'left' }); x += colWidths[1];
      doc.text(v.documento || '', x + 5, y + 5, { width: colWidths[2], align: 'left' }); x += colWidths[2];
      doc.text(v.fecha ? moment(v.fecha).format('DD-MM-YYYY') : '', x + 5, y + 5, { width: colWidths[3], align: 'left' }); x += colWidths[3];
      doc.text(v.hora_entrada || '', x + 5, y + 5, { width: colWidths[4], align: 'left' }); x += colWidths[4];
      doc.text(v.hora_salida || '', x + 5, y + 5, { width: colWidths[5], align: 'left' });

      y += rowHeight;
    }

    drawFooter(currentPage);

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
