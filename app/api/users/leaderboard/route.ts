import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import User from '../../../models/User';

interface CompletedChallenge {
    challengeId: string;
    completedAt: Date;
}

interface IUser {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    points: number;
    completedChallenges: CompletedChallenge[];
}

export async function GET() {
    try {
        await connectDB();

        const users = (await User.find({})
            .select('username firstName lastName points completedChallenges')
            .sort({ points: -1 })
            .limit(50)
            .lean()) as unknown as IUser[];

        return NextResponse.json({
            users: users.map(user => ({
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                points: user.points,
                challengesCompleted: user.completedChallenges.length
            }))
        });

    } catch (error: Error | unknown) {
        console.error('Erreur lors de la récupération du classement:', error);
        return NextResponse.json(
            { 
                error: 'Erreur lors de la récupération du classement',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
} 