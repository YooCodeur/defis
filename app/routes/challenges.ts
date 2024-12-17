import express from 'express';
import { Challenge } from '../models/Challenge';
import { Request, Response } from 'express';

const router = express.Router();

// Route pour récupérer tous les défis
router.get('/', async (req: Request, res: Response) => {
    try {
        const challenges = await Challenge.find();
        res.status(200).json(challenges);
    } catch (err) {
        console.error('Erreur lors de la récupération des défis:', err);
        res.status(500).json({ message: 'Erreur lors de la récupération des défis' });
    }
});

export default router; 