const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.js');

router.get('/', adminController.obtenerAdministradores);
router.post('/', adminController.registrarAdministrador);
router.post('/login', adminController.loginAdministrador);

module.exports = router;
