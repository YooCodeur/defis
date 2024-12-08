import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Challenge from '@/app/models/Challenge';

export async function GET(request: Request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'ID utilisateur requis' },
                { status: 400 }
            );
        }

        const challenges = await Challenge.find({
            assignedTo: userId,
            status: 'active'
        });

        return NextResponse.json({
            success: true,
            challenges
        });

    } catch (error) {
        console.error('Erreur:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de la récupération des défis' },
            { status: 500 }
        );
    }
} 