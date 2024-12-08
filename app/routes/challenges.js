const express = require('express');
const Challenge = require('../models/Challenge');
const router = express.Router();

// Route pour récupérer tous les défis
router.get('/', async (req, res) => {
    try {
        const challenges = await Challenge.find();
        res.status(200).json(challenges);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des défis' });
    }
});

module.exports = router; 