import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/db';
import User from '../../models/User';
import bcrypt from 'bcrypt';

interface MongoError extends Error {
    code?: number;
}

export async function POST(request: Request) {
    try {
        console.log('=== Début de l\'inscription ===');
        
        const body = await request.json();
        console.log('Données reçues:', { ...body, password: '[MASQUÉ]' });
        
        const { username, firstName, lastName, password } = body;

        // Validation des champs
        if (!username || !firstName || !lastName || !password) {
            console.log('Validation échouée: champs manquants');
            return NextResponse.json(
                { error: 'Tous les champs sont requis' },
                { status: 400 }
            );
        }

        // Validation du format du nom d'utilisateur
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            console.log('Validation échouée: format du nom d\'utilisateur invalide');
            return NextResponse.json(
                { error: 'Le nom d\'utilisateur ne peut contenir que des lettres, des chiffres et des underscores' },
                { status: 400 }
            );
        }

        console.log('Tentative de connexion à MongoDB...');
        await connectDB();
        console.log('Connexion MongoDB établie');

        // Vérification si le nom d'utilisateur existe déjà
        console.log('Vérification du nom d\'utilisateur:', username.toLowerCase());
        const existingUser = await User.findOne({ 
            username: username.toLowerCase() 
        });

        if (existingUser) {
            console.log('Nom d\'utilisateur déjà utilisé');
            return NextResponse.json(
                { error: 'Ce nom d\'utilisateur est déjà utilisé' },
                { status: 400 }
            );
        }

        // Hashage du mot de passe
        console.log('Hashage du mot de passe...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Mot de passe hashé avec succès');

        // Création de l'utilisateur
        console.log('Création de l\'utilisateur...');
        const user = await User.create({
            username: username.toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            password: hashedPassword
        });

        console.log('Utilisateur créé avec succès:', user._id);

        return NextResponse.json(
            { 
                message: 'Inscription réussie',
                user: {
                    id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            },
            { status: 201 }
        );

    } catch (error: Error | MongoError | unknown) {
        console.error('=== Erreur lors de l\'inscription ===');
        
        if (error instanceof Error) {
            console.error('Type:', error.name);
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
            
            const mongoError = error as MongoError;
            if (mongoError.code === 11000) {
                return NextResponse.json(
                    { error: 'Ce nom d\'utilisateur est déjà utilisé' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { 
                    error: 'Une erreur est survenue lors de l\'inscription',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Une erreur inconnue est survenue' },
            { status: 500 }
        );
    }
} 