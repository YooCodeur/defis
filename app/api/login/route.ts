import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        await connectDB();
        
        const data = await request.json();
        const { username, password } = data;

        const user = await User.findOne({ username });
        
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Utilisateur non trouvé' },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Mot de passe incorrect' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de la connexion' },
            { status: 500 }
        );
    }
} 