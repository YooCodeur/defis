import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../../lib/db';
import User from '../../../models/User';

export async function GET() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('auth_token');

        if (!token) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        await connectDB();

        const user = await User.findById(decoded.userId)
            .select('_id username firstName lastName points completedChallenges');

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                points: user.points,
                completedChallenges: user.completedChallenges.length
            }
        });

    } catch (error) {
        console.error('Erreur de vérification du token:', error);
        return NextResponse.json(
            { error: 'Non authentifié' },
            { status: 401 }
        );
    }
} 