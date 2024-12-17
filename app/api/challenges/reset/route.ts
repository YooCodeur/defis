import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Challenge from '@/app/models/Challenge';

export async function POST(request: Request) {
    try {
        const { challengeId } = await request.json();

        if (!challengeId) {
            return NextResponse.json({ 
                success: false, 
                message: 'ID du défi manquant' 
            }, { status: 400 });
        }

        await connectDB();

        // Vérifier si le défi existe
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json({ 
                success: false, 
                message: 'Défi non trouvé' 
            }, { status: 404 });
        }

        // Vérifier si le défi est en attente de validation
        if (challenge.status !== 'pending_validation') {
            return NextResponse.json({ 
                success: false, 
                message: 'Le défi ne peut être réinitialisé que s\'il est en attente de validation' 
            }, { status: 400 });
        }

        // Réinitialiser le défi
        const updatedChallenge = await Challenge.findByIdAndUpdate(
            challengeId,
            {
                $set: {
                    status: 'active',
                    submission: null,
                    votes: []
                }
            },
            { new: true }
        ).lean();

        return NextResponse.json({ 
            success: true, 
            message: 'Défi réinitialisé',
            challenge: updatedChallenge
        });

    } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Erreur lors de la réinitialisation',
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
} 