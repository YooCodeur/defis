import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import Challenge from '../../../models/Challenge';
import User from '../../../models/User';

export async function POST(request: Request) {
    try {
        await connectDB();
        const userId = request.headers.get('user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Utilisateur non authentifié' },
                { status: 401 }
            );
        }

        const { challengeId, content } = await request.json();

        if (!challengeId || !content) {
            return NextResponse.json(
                { error: 'Le contenu de la solution est requis' },
                { status: 400 }
            );
        }

        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return NextResponse.json(
                { error: 'Défi non trouvé' },
                { status: 404 }
            );
        }

        if (challenge.status !== 'active') {
            return NextResponse.json(
                { error: 'Ce défi n\'est plus actif' },
                { status: 400 }
            );
        }

        // Mettre à jour le défi avec la soumission
        const totalUsers = await User.countDocuments();
        const requiredVotes = Math.ceil(totalUsers / 2); // Majorité simple

        challenge.submission = {
            content,
            submittedAt: new Date(),
            submittedBy: userId
        };
        challenge.status = 'pending_validation';
        challenge.totalUsers = totalUsers;
        challenge.requiredVotes = requiredVotes;

        await challenge.save();

        return NextResponse.json({
            message: 'Solution soumise avec succès',
            challenge: {
                id: challenge._id,
                status: challenge.status,
                requiredVotes
            }
        });

    } catch (error: any) {
        console.error('Erreur lors de la soumission:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la soumission de la solution' },
            { status: 500 }
        );
    }
} 