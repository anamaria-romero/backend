const express = require("express");
const cors = require("cors");
const pool = require('./models/db'); 
require("dotenv").config();

const visitanteRoutes = require("./routes/visitanteRoutes");
const vigilanteRoutes = require("./routes/vigilanteRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/visitantes", visitanteRoutes);
app.use("/api/vigilantes", vigilanteRoutes);

app.get("/api/test-db", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT 1");
    res.send("Conexión exitosa a la base de datos");
  } catch (err) {
    console.error("Error de conexión:", err);
    res.status(500).send("Error de conexión a la base de datos");
  }
});

app.get("/", (req, res) => {
  res.send("API corriendo correctamente");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


