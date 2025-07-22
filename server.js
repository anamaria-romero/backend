const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const visitanteRoutes = require('./routes/visitanteRoutes');
const vigilanteRoutes = require('./routes/vigilanteRoutes');

const app = express();
const PORT = 3001;

app.use(cors());              
app.use(bodyParser.json());  


app.use('/api/visitantes', visitanteRoutes);
app.use('/api/vigilantes', vigilanteRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


