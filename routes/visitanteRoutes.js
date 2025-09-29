const express = require('express');
const router = express.Router();
const visitanteController = require('../controllers/visitantesController.js');

router.post('/entrada', visitanteController.registrarEntrada);
router.post('/salida', visitanteController.registrarSalida);
router.get('/activos', visitanteController.obtenerVisitantesActivos);
router.get('/reporte', visitanteController.reportePorFecha);
router.get('/buscar/:documento', visitanteController.buscarPorDocumento); 
router.get('/', visitanteController.obtenerTodos);
router.put('/:id', visitanteController.actualizarVisitante);
router.get("/entrada/validar/:documento", visitanteController.validarEntrada);

module.exports = router;
