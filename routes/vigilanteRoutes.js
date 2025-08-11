const express = require("express");
const router = express.Router();
const vigilanteController = require("../controllers/vigilanteController");

router.post("/registrar", vigilanteController.registrarVigilante);
router.post("/login", vigilanteController.loginVigilante);
router.get("/", vigilanteController.obtenerVigilantes);
router.delete("/:documento", vigilanteController.eliminarVigilante);
router.put("/:documento", vigilanteController.actualizarVigilante); 

module.exports = router;
