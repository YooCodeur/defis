const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const challengeRoutes = require('./routes/challenges'); // Importez la route des défis

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes); // Utilisez la route des défis

// ... autres configurations et démarrage du serveur 