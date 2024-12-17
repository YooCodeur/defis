import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../../lib/db';
import User from '../../../models/User';

interface DecodedToken {
    userId: string;
    username: string;
}

interface IUser {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    points: number;
    completedChallenges: Array<{
        challengeId: string;
        completedAt: Date;
    }>;
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        await connectDB();

        const user = (await User.findById(decoded.userId)
            .select('_id username firstName lastName points completedChallenges')
            .lean()) as unknown as IUser;

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