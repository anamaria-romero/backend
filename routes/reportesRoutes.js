const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/', reportesController.obtenerReportes);
router.get('/excel', reportesController.descargarExcel);
router.get('/pdf', reportesController.descargarPDF);

module.exports = router;