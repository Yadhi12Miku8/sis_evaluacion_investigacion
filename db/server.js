// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/auth');
const jefeRoutes = require('./routes/jefe');
const adminRoutes = require('./routes/admin');
const publicoRoutes = require('./routes/publico');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/jefe', jefeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/publico', publicoRoutes);

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));