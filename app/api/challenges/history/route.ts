import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Challenge from '@/app/models/Challenge';

export async function GET() {
    try {
        await connectDB();

        const recentChallenges = await Challenge.find({
            status: 'completed',
            'submission.video.url': { $exists: true }
        })
        .sort({ completedAt: -1 })
        .limit(5)
        .populate('assignedTo', 'username')
        .populate('createdBy', 'username')
        .lean();

        return NextResponse.json({
            success: true,
            challenges: recentChallenges.map(challenge => ({
                title: challenge.title,
                description: challenge.description,
                completedBy: challenge.assignedTo?.username,
                createdBy: challenge.createdBy?.username,
                completedAt: challenge.completedAt,
                videoUrl: challenge.submission?.video?.url
            }))
        });
    } catch (error) {
        console.error('Erreur récupération historique:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de la récupération de l\'historique' },
            { status: 500 }
        );
    }
} 