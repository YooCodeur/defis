import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Challenge from '@/app/models/Challenge';
import User from '@/app/models/User';
import mongoose from 'mongoose';

export async function POST(request: Request) {
    try {
        console.log('=== Début de l\'ajout du commentaire ===');
        await connectDB();
        
        const data = await request.json();
        const { challengeId, userId, content } = data;

        if (!challengeId || !userId || !content) {
            return NextResponse.json(
                { success: false, message: 'Données manquantes' },
                { status: 400 }
            );
        }

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json(
                { success: false, message: 'Défi non trouvé' },
                { status: 404 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Ajouter le commentaire
        const comment = {
            userId: new mongoose.Types.ObjectId(userId),
            username: user.username,
            content,
            createdAt: new Date()
        };

        if (!challenge.comments) {
            challenge.comments = [];
        }

        challenge.comments.push(comment);
        await challenge.save();

        return NextResponse.json({
            success: true,
            message: 'Commentaire ajouté avec succès',
            comment
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de l\'ajout du commentaire' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const challengeId = searchParams.get('challengeId');

        if (!challengeId) {
            return NextResponse.json(
                { success: false, message: 'ID du défi manquant' },
                { status: 400 }
            );
        }

        const challenge = await Challenge.findById(challengeId)
            .select('comments')
            .populate('comments.userId', 'username');

        if (!challenge) {
            return NextResponse.json(
                { success: false, message: 'Défi non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            comments: challenge.comments || []
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de la récupération des commentaires' },
            { status: 500 }
        );
    }
} 