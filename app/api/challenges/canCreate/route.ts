// app/api/challenges/canCreate/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Challenge from '@/app/models/Challenge';
import User from '@/app/models/User';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: 'ID utilisateur manquant' 
            });
        }

        await connectDB();

        // Récupérer l'utilisateur
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: 'Utilisateur non trouvé' 
            });
        }

        // yoco908989 peut toujours créer des défis
        if (user.username === 'yoco908989') {
            return NextResponse.json({
                success: true,
                canCreate: true,
                message: 'Vous pouvez créer un défi à tout moment'
            });
        }

        // Pour les autres utilisateurs, vérifier s'il y a un défi en cours
        const activeChallenge = await Challenge.findOne({
            status: { $in: ['active', 'pending_acceptance', 'pending_validation'] }
        });

        // Vérifier si l'utilisateur est le dernier gagnant
        const lastCompletedChallenge = await Challenge.findOne({ status: 'completed' })
            .sort({ completedAt: -1 })
            .populate('assignedTo');

        const canCreate = !activeChallenge && 
            lastCompletedChallenge?.assignedTo?._id.toString() === userId;

        return NextResponse.json({
            success: true,
            canCreate,
            currentChallenge: activeChallenge,
            message: canCreate ? 'Vous pouvez créer un défi' : 'Vous ne pouvez pas créer de défi pour le moment'
        });

    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Erreur lors de la vérification',
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}