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

        const [rows] = await pool.query(
            'SELECT id, nombre, documento, fecha, hora_entrada, hora_salida FROM visitantes WHERE fecha BETWEEN ? AND ?',
            [fechaInicio, fechaFin]
        );

        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        let filename = `reporte_${moment().format('YYYY-MM-DD')}.pdf`;
        filename = encodeURIComponent(filename);

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Título
        doc.fontSize(18).text('Reporte de Visitantes', { align: 'center' });
        doc.moveDown(1);

        // Encabezados de tabla
        const tableTop = 100;
        const colWidths = [40, 100, 100, 80, 80, 80];
        const headers = ["ID", "Nombre", "Documento", "Fecha", "Entrada", "Salida"];

        doc.fontSize(12).fillColor('white');
        doc.rect(30, tableTop, colWidths.reduce((a,b) => a+b), 20).fill('#333');

        let x = 30;
        headers.forEach((header, i) => {
            doc.fillColor('white').text(header, x + 5, tableTop + 5, { width: colWidths[i], align: 'left' });
            x += colWidths[i];
        });

        // Filas de datos
        let y = tableTop + 20;
        doc.fontSize(10).fillColor('black');

        rows.forEach((v, rowIndex) => {
            x = 30;

            const fillColor = rowIndex % 2 === 0 ? '#f2f2f2' : '#ffffff';
            doc.rect(30, y, colWidths.reduce((a,b) => a+b), 20).fill(fillColor);

            doc.fillColor('black').text(v.id, x + 5, y + 5, { width: colWidths[0] }); x += colWidths[0];
            doc.text(v.nombre, x + 5, y + 5, { width: colWidths[1] }); x += colWidths[1];
            doc.text(v.documento, x + 5, y + 5, { width: colWidths[2] }); x += colWidths[2];
            doc.text(moment(v.fecha).format('DD-MM-YYYY'), x + 5, y + 5, { width: colWidths[3] }); x += colWidths[3];
            doc.text(v.hora_entrada, x + 5, y + 5, { width: colWidths[4] }); x += colWidths[4];
            doc.text(v.hora_salida || '', x + 5, y + 5, { width: colWidths[5] });

            y += 20;
        });

        doc.end();
    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};