import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        console.log('=== Début de la tentative de connexion ===');
        await connectDB();
        console.log('MongoDB connecté');
        
        const data = await request.json();
        const { username, password } = data;
        console.log('Tentative de connexion pour:', username);

        // Recherche de l'utilisateur
        console.log('Recherche de l\'utilisateur dans la base de données...');
        const user = await User.findOne({ username: username.toLowerCase() });
        
        if (!user) {
            console.log('Utilisateur non trouvé:', username);
            return NextResponse.json(
                { success: false, message: 'Utilisateur non trouvé' },
                { status: 401 }
            );
        }

        console.log('Utilisateur trouvé:', {
            id: user._id,
            username: user.username,
            hasPassword: !!user.password
        });

        // Vérification du mot de passe
        console.log('Vérification du mot de passe...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Résultat de la vérification du mot de passe:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('Mot de passe incorrect pour:', username);
            return NextResponse.json(
                { success: false, message: 'Mot de passe incorrect' },
                { status: 401 }
            );
        }

        console.log('Connexion réussie pour:', username);
        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                points: user.points,
                completedChallenges: user.completedChallenges?.length || 0
            }
        });

    } catch (error) {
        console.error('=== Erreur détaillée lors de la connexion ===');
        console.error('Type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('Message:', error instanceof Error ? error.message : String(error));
        console.error('Stack:', error instanceof Error ? error.stack : '');
        
        return NextResponse.json(
            { success: false, message: 'Erreur lors de la connexion' },
            { status: 500 }
        );
    }
} 