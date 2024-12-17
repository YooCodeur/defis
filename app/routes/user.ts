import express from 'express';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    const { firstName, lastName, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ firstName, lastName, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la création de l\'utilisateur:', err);
        res.status(400).json({ message: 'Erreur lors de la création de l\'utilisateur' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { firstName, password } = req.body;

    try {
        const user = await User.findOne({ firstName });
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur non trouvé' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect' });
        }

        res.status(200).json({ message: 'Connexion réussie' });
    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
});

export default router; 