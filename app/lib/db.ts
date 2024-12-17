import mongoose from 'mongoose';

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

declare global {
    let mongoose: MongooseCache;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Veuillez définir l\'URI MongoDB dans les variables d\'environnement');
}

const cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 60000,
            socketTimeoutMS: 60000,
            family: 4,
            ssl: true,
            tls: true
        };

        try {
            cached.promise = mongoose.connect(MONGODB_URI!, opts);
            const instance = await cached.promise;
            cached.conn = instance;
            return instance;
        } catch (error) {
            cached.promise = null;
            cached.conn = null;
            throw error;
        }
    }

    try {
        const instance = await cached.promise;
        cached.conn = instance;
        return instance;
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