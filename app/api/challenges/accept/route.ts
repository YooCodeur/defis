import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Challenge from '@/app/models/Challenge';

export async function POST(request: Request) {
    try {
        await connectDB();
        
        const data = await request.json();
        const { challengeId, userId } = data;

        // Vérifier que l'utilisateur est bien celui assigné au défi
        const challenge = await Challenge.findOne({
            _id: challengeId,
            assignedTo: userId,
            status: 'pending_acceptance'
        });

        if (!challenge) {
            return NextResponse.json(
                { success: false, message: 'Défi non trouvé ou non autorisé' },
                { status: 404 }
            );
        }

        // Mettre à jour le statut du défi
        challenge.status = 'active';
        await challenge.save();

        return NextResponse.json({
            success: true,
            message: 'Défi accepté avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de l\'acceptation du défi:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de l\'acceptation du défi' },
            { status: 500 }
        );
    }
} 