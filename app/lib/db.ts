import mongoose from 'mongoose';

interface MongooseCache {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
}

declare global {
    var mongoose: MongooseCache;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Veuillez définir l\'URI MongoDB dans les variables d\'environnement');
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB(): Promise<mongoose.Connection> {
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
            cached.promise = mongoose.connect(MONGODB_URI!, opts).then(mongoose => mongoose.connection);
            const conn = await cached.promise;
            cached.conn = conn;
            return conn;
        } catch (error) {
            cached.promise = null;
            cached.conn = null;
            throw error;
        }
    }

    try {
        const conn = await cached.promise;
        cached.conn = conn;
        return conn;
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