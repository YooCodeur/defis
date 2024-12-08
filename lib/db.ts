import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defis';

if (!MONGODB_URI) {
    throw new Error('Veuillez définir l\'URI MongoDB dans les variables d\'environnement');
}

export async function connectDB() {
    try {
        const { connection } = await mongoose.connect(MONGODB_URI);

        if (connection.readyState === 1) {
            console.log('Connecté à MongoDB');
            return;
        }
    } catch (error) {
        console.error('Erreur de connexion à MongoDB:', error);
        throw error;
    }
} 