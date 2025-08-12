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
        const filename = `reporte_visitantes_${moment().format('YYYYMMDD_HHmmss')}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(18).fillColor('#0b5cff').text('Reporte de Visitantes', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#333').text(`Rango: ${moment(fechaInicio).format('DD-MM-YYYY')} a ${moment(fechaFin).format('DD-MM-YYYY')}`, { align: 'center' });
        doc.moveDown();

        rows.forEach(r => {
            const fechaForm = r.fecha ? moment(r.fecha).format('DD-MM-YYYY') : '';
            const line = `ID: ${r.id}  |  Nombre: ${r.nombre}  |  Documento: ${r.documento}  |  Fecha: ${fechaForm}  |  Entrada: ${r.hora_entrada || '-'}  |  Salida: ${r.hora_salida || '-'}`;
            doc.fontSize(10).fillColor('#000').text(line, { lineGap: 4 });
            doc.moveDown(0.2);
        });

        doc.end();
    } catch (error) {
        console.error('Error al generar PDF:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};