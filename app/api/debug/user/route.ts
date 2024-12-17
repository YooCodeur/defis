import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import User from '@/app/models/User';

export async function GET() {
    try {
        console.log('=== Début du débogage utilisateur ===');
        await connectDB();
        console.log('MongoDB connecté');

        const username = 'leron04';
        console.log('Recherche de l\'utilisateur:', username);

        // Recherche insensible à la casse
        const users = await User.find({
            $or: [
                { username: username },
                { username: username.toLowerCase() },
                { username: username.toUpperCase() }
            ]
        });

        console.log('Utilisateurs trouvés:', users.map(u => ({
            id: u._id,
            username: u.username,
            hasPassword: !!u.password,
            points: u.points,
            completedChallenges: u.completedChallenges?.length || 0
        })));

        return NextResponse.json({
            success: true,
            users: users.map(u => ({
                id: u._id,
                username: u.username,
                hasPassword: !!u.password,
                points: u.points,
                completedChallenges: u.completedChallenges?.length || 0
            }))
        });

    } catch (error) {
        console.error('=== Erreur détaillée lors du débogage ===');
        console.error('Type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('Message:', error instanceof Error ? error.message : String(error));
        console.error('Stack:', error instanceof Error ? error.stack : '');
        
        return NextResponse.json(
            { success: false, message: 'Erreur lors du débogage' },
            { status: 500 }
        );
    }
} 