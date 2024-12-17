import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Challenge from '@/app/models/Challenge';
import User from '@/app/models/User';
import mongoose from 'mongoose';

interface Vote {
    userId: mongoose.Types.ObjectId;
    vote: 'approve' | 'reject';
    votedAt: Date;
}

export async function POST(request: Request) {
    try {
        console.log('=== Début du traitement du vote ===');
        await connectDB();
        console.log('MongoDB connecté');
        
        const data = await request.json();
        const { challengeId, userId, vote } = data;
        console.log('Données reçues:', { challengeId, userId, vote });

        if (!challengeId || !userId || !vote) {
            console.log('Données manquantes:', { challengeId, userId, vote });
            return NextResponse.json(
                { success: false, message: 'Données manquantes' },
                { status: 400 }
            );
        }

        // Trouver le défi
        console.log('Recherche du défi:', challengeId);
        const challenge = await Challenge.findOne({
            _id: challengeId,
            status: 'pending_validation'
        });

        if (!challenge) {
            console.log('Défi non trouvé ou non en attente de validation');
            const lastCompletedChallenge = await Challenge.findOne({ status: 'completed' })
                .sort({ completedAt: -1 })
                .populate('assignedTo', 'username');

            if (lastCompletedChallenge) {
                return NextResponse.json(
                    { 
                        success: false, 
                        message: `En attente du prochain défi qui doit être créé par ${lastCompletedChallenge.assignedTo.username}`,
                        nextCreator: lastCompletedChallenge.assignedTo
                    },
                    { status: 200 }
                );
            }

            return NextResponse.json(
                { success: false, message: 'Aucun défi en cours' },
                { status: 404 }
            );
        }

        console.log('Défi trouvé:', {
            id: challenge._id,
            status: challenge.status,
            createdBy: challenge.createdBy,
            assignedTo: challenge.assignedTo,
            votes: challenge.votes
        });

        // Nettoyer les votes invalides
        challenge.votes = challenge.votes.filter((v: Vote) => v && v.userId);
        console.log('Votes après nettoyage:', challenge.votes);

        // Vérifier si l'utilisateur est l'assigné
        const assignedToId = challenge.assignedTo.toString();
        console.log('Vérification des IDs:', {
            userId,
            assignedToId
        });

        if (assignedToId === userId) {
            console.log('Tentative de vote par l\'utilisateur assigné');
            return NextResponse.json(
                { success: false, message: 'Vous ne pouvez pas voter sur votre propre réalisation' },
                { status: 403 }
            );
        }

        // Vérifier si l'utilisateur a déjà voté
        console.log('Vérification des votes existants');
        const existingVote = challenge.votes.find((v: Vote) => v.userId.toString() === userId);

        if (existingVote) {
            console.log('Vote existant trouvé:', existingVote);
            return NextResponse.json(
                { success: false, message: 'Vous avez déjà voté pour ce défi' },
                { status: 400 }
            );
        }

        // Ajouter le vote
        console.log('Ajout du nouveau vote');
        const newVote = {
            userId: new mongoose.Types.ObjectId(userId),
            vote,
            votedAt: new Date()
        };
        challenge.votes.push(newVote);
        console.log('Nouveau vote ajouté:', newVote);

        // Vérifier si le défi est validé ou rejeté
        const approveVotes = challenge.votes.filter((v: Vote) => v.vote === 'approve').length;
        const rejectVotes = challenge.votes.filter((v: Vote) => v.vote === 'reject').length;
        console.log('Comptage des votes:', { approveVotes, rejectVotes, required: challenge.requiredVotes });

        let statusChanged = false;
        let pointsUpdated = false;

        if (approveVotes >= challenge.requiredVotes) {
            console.log('Défi validé');
            challenge.status = 'completed';
            challenge.completedAt = new Date();
            challenge.completedBy = challenge.assignedTo;
            statusChanged = true;

            // Ajouter des points à l'utilisateur qui a complété le défi
            console.log('Attribution des points pour défi complété');
            await User.findByIdAndUpdate(challenge.assignedTo, {
                $inc: { points: 5 },
                $push: {
                    completedChallenges: {
                        challenge: challenge._id,
                        completedAt: new Date()
                    }
                }
            });

            pointsUpdated = true;

        } else if (rejectVotes > (challenge.totalUsers - challenge.requiredVotes)) {
            console.log('Défi rejeté');
            challenge.status = 'rejected';
            statusChanged = true;

            // Retirer des points à l'utilisateur qui a échoué le défi
            console.log('Retrait des points pour défi échoué');
            await User.findByIdAndUpdate(challenge.assignedTo, {
                $inc: { points: -5 }
            });

            pointsUpdated = true;
        }

        console.log('Sauvegarde des modifications...');
        await challenge.save();
        console.log('Modifications sauvegardées avec succès');

        return NextResponse.json({
            success: true,
            message: 'Vote enregistré avec succès',
            status: challenge.status,
            statusChanged,
            pointsUpdated
        });

    } catch (error) {
        console.error('=== Erreur détaillée lors du vote ===');
        console.error('Type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('Message:', error instanceof Error ? error.message : String(error));
        console.error('Stack:', error instanceof Error ? error.stack : '');
        
        return NextResponse.json(
            { 
                success: false, 
                message: 'Erreur lors du vote',
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
} 