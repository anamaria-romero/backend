const express = require("express");
const router = express.Router();
const vigilanteController = require("../controllers/vigilanteController");

router.post("/registrar", vigilanteController.registrarVigilante);
router.get("/", vigilanteController.obtenerVigilantes);
router.delete("/:documento", vigilanteController.eliminarVigilante);

module.exports = router;
