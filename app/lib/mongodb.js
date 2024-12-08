import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!mongoose.connection.readyState) {
    mongoose.set('bufferCommands', true);
}

export async function connectDB() {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('Utilisation de la connexion MongoDB existante');
            return mongoose.connection;
        }

        console.log('Création d\'une nouvelle connexion MongoDB...');
        await mongoose.connect(MONGODB_URI);

        // Attendre que la connexion soit prête
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log('MongoDB connecté avec succès');
        return mongoose.connection;
    } catch (error) {
        console.error('Erreur de connexion MongoDB:', error);
        throw error;
    }
}

// S'assurer que la connexion est fermée lors de l'arrêt de l'application
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Connexion MongoDB fermée');
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la fermeture de la connexion:', err);
        process.exit(1);
    }
}); 