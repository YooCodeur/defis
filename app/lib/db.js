import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Veuillez définir l\'URI MongoDB dans les variables d\'environnement');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) {
        console.log('Utilisation de la connexion MongoDB existante');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            ssl: true,
            tls: true
        };

        console.log('Création d\'une nouvelle connexion MongoDB...');
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('MongoDB connecté avec succès');
            return mongoose;
        }).catch((error) => {
            console.error('Erreur de connexion MongoDB:', error);
            cached.promise = null;
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
}

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB déconnecté');
    cached.conn = null;
    cached.promise = null;
});

process.on('SIGINT', async () => {
    if (mongoose.connection.readyState === 1) {
        try {
            await mongoose.connection.close();
            console.log('Connexion MongoDB fermée');
            process.exit(0);
        } catch (err) {
            console.error('Erreur lors de la fermeture de la connexion:', err);
            process.exit(1);
        }
    }
}); 