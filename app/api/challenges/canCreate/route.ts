// app/api/challenges/canCreate/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Challenge from '@/app/models/Challenge';
import mongoose from 'mongoose';

interface IUser {
    _id: mongoose.Types.ObjectId;
    username: string;
}

interface IChallenge {
    _id: mongoose.Types.ObjectId;
    title: string;
    status: string;
    assignedTo?: mongoose.Types.ObjectId;
    completedBy?: mongoose.Types.ObjectId;
}

interface ActiveChallenge {
    _id: string;
    title: string;
    description: string;
    status: string;
    assignedTo: string;
    submission?: {
        video: {
            url: string;
            publicId: string;
        };
        submittedAt: Date;
        submittedBy: string;
    };
    votes: Array<{
        user: string;
        vote: 'approve' | 'reject';
        votedAt: Date;
    }>;
    requiredVotes: number;
}

interface CompletedChallenge {
    _id: string;
    assignedTo: string;
    status: string;
}

export async function GET(request: Request) {
    try {
        await connectDB();
        const userId = request.headers.get('user-id');

        if (!userId) {
            return NextResponse.json({ 
                canCreate: false,
                message: "Utilisateur non authentifié"
            });
        }

        // Vérifier s'il existe un défi actif
        const activeChallenge = await Challenge.findOne({
            status: { $in: ['active', 'pending_acceptance', 'pending_validation'] }
        })
        .populate('assignedTo', 'username')
        .lean() as unknown as ActiveChallenge;

        if (activeChallenge) {
            const assignedUser = await mongoose.models.User.findById(activeChallenge.assignedTo);
            console.log('Informations complètes du défi:', {
                challenge: activeChallenge,
                submission: activeChallenge.submission,
                votes: activeChallenge.votes
            });

            return NextResponse.json({ 
                canCreate: false,
                message: 'Un défi est déjà en cours',
                currentChallenge: {
                    _id: activeChallenge._id,
                    title: activeChallenge.title,
                    description: activeChallenge.description,
                    status: activeChallenge.status,
                    assignedTo: activeChallenge.assignedTo,
                    assignedToUsername: assignedUser?.username || 'Inconnu',
                    submission: activeChallenge.submission,
                    votes: activeChallenge.votes,
                    requiredVotes: activeChallenge.requiredVotes
                }
            });
        }

        // Vérifier si c'est yoco908989 ou le dernier gagnant
        const user = await mongoose.models.User.findById(userId);
        const isYoco = user?.username === 'yoco908989';

        // S'il n'y a pas de défi complété et que c'est yoco908989
        const lastCompletedChallenge = await Challenge.findOne({ 
            status: 'completed' 
        })
        .sort({ completedAt: -1 })
        .lean() as unknown as CompletedChallenge;

        if (!lastCompletedChallenge && isYoco) {
            return NextResponse.json({ 
                canCreate: true,
                message: "Vous pouvez créer le premier défi"
            });
        }

        // Sinon, vérifier si c'est le dernier gagnant
        const isWinner = lastCompletedChallenge?.assignedTo?.toString() === userId;

        return NextResponse.json({ 
            canCreate: isWinner,
            message: isWinner 
                ? "Vous pouvez créer un nouveau défi" 
                : "Seul le gagnant du dernier défi peut en proposer un nouveau"
        });

    } catch (error) {
        console.error("=== Erreur détaillée dans canCreate ===");
        console.error(error);
        return NextResponse.json(
            { success: false, canCreate: false, message: 'Erreur lors de la vérification' },
            { status: 500 }
        );
    }
}