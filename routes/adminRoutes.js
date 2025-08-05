const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController.js');

router.get('/', AdminController.obtenerAdministradores);
router.post('/', AdminController.registrarAdministrador);
router.post('/login', AdminController.loginAdministrador);

module.exports = router;
