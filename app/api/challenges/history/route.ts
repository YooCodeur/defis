import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Challenge from '@/app/models/Challenge';

export async function GET() {
    try {
        console.log('=== Début de la récupération de l\'historique ===');
        await connectDB();
        console.log('MongoDB connecté');

        // Récupérer tous les défis avec leurs soumissions, triés par date de création
        const challenges = await Challenge.find({
            $or: [
                { status: 'completed' },
                { status: 'rejected' },
                { 
                    status: 'pending_validation',
                    'submission': { $exists: true }
                }
            ]
        })
        .populate('createdBy', 'username')
        .populate('assignedTo', 'username')
        .sort({ createdAt: -1 });

        console.log(`${challenges.length} défis trouvés`);

        return NextResponse.json({
            success: true,
            challenges: challenges.map(challenge => ({
                _id: challenge._id,
                title: challenge.title,
                description: challenge.description,
                createdBy: challenge.createdBy,
                assignedTo: challenge.assignedTo,
                status: challenge.status,
                completedAt: challenge.completedAt,
                submission: challenge.submission,
                createdAt: challenge.createdAt
            }))
        });

    } catch (error) {
        console.error('=== Erreur lors de la récupération de l\'historique ===');
        console.error('Type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('Message:', error instanceof Error ? error.message : String(error));
        console.error('Stack:', error instanceof Error ? error.stack : '');
        
        return NextResponse.json(
            { 
                success: false, 
                message: 'Erreur lors de la récupération de l\'historique',
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
} 