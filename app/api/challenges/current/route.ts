import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Challenge from '@/app/models/Challenge';
import mongoose from 'mongoose';

interface IUser {
    _id: string;
    username: string;
}

export async function GET() {
    console.log("=== Début de la récupération du défi actuel ===");
    try {
        await connectDB();
        console.log("MongoDB connecté");

        // Chercher le défi actif ou en attente de validation
        const challenge = await Challenge.findOne({
            status: { $in: ['active', 'pending_validation', 'pending_acceptance'] }
        })
        .populate({
            path: 'assignedTo',
            select: 'username _id',
            model: 'User'
        })
        .populate({
            path: 'createdBy',
            select: 'username _id',
            model: 'User'
        })
        .populate({
            path: 'votes.userId',
            select: 'username _id',
            model: 'User'
        })
        .lean();

        console.log("Défi trouvé (brut):", JSON.stringify(challenge, null, 2));

        if (!challenge) {
            console.log("Aucun défi actif trouvé");
            return NextResponse.json({
                success: true,
                challenge: null
            });
        }

        // Créer une copie sûre du défi
        let formattedChallenge = JSON.parse(JSON.stringify(challenge));

        try {
            // Vérifier et formater les informations de l'utilisateur assigné
            if (formattedChallenge.assignedTo) {
                console.log("Utilisateur assigné (avant formatage):", formattedChallenge.assignedTo);
                if (typeof formattedChallenge.assignedTo === 'string') {
                    console.error("L'utilisateur assigné est une chaîne:", formattedChallenge.assignedTo);
                    formattedChallenge.assignedTo = {
                        _id: formattedChallenge.assignedTo,
                        username: 'Utilisateur inconnu'
                    };
                } else {
                    formattedChallenge.assignedTo = {
                        _id: formattedChallenge.assignedTo._id.toString(),
                        username: formattedChallenge.assignedTo.username || 'Utilisateur inconnu'
                    };
                }
                console.log("Utilisateur assigné (après formatage):", formattedChallenge.assignedTo);
            }

            // Vérifier et formater les informations du créateur
            if (formattedChallenge.createdBy) {
                console.log("Créateur (avant formatage):", formattedChallenge.createdBy);
                if (typeof formattedChallenge.createdBy === 'string') {
                    console.error("Le créateur est une chaîne:", formattedChallenge.createdBy);
                    formattedChallenge.createdBy = {
                        _id: formattedChallenge.createdBy,
                        username: 'Utilisateur inconnu'
                    };
                } else {
                    formattedChallenge.createdBy = {
                        _id: formattedChallenge.createdBy._id.toString(),
                        username: formattedChallenge.createdBy.username || 'Utilisateur inconnu'
                    };
                }
                console.log("Créateur (après formatage):", formattedChallenge.createdBy);
            }

            // Si le défi a une soumission, formater les données du média
            if (formattedChallenge.submission) {
                console.log("Soumission trouvée:", formattedChallenge.submission);
                
                if (formattedChallenge.submission.media) {
                    const mediaUrl = formattedChallenge.submission.media.secure_url || 
                                   formattedChallenge.submission.media.url;
                    console.log("URL du média:", mediaUrl);
                    
                    formattedChallenge.submission = {
                        ...formattedChallenge.submission,
                        media: {
                            url: mediaUrl
                        }
                    };

                    if (formattedChallenge.submission.submittedBy) {
                        formattedChallenge.submission.submittedBy = 
                            formattedChallenge.submission.submittedBy.toString();
                    }
                }
                
                console.log("Soumission formatée:", formattedChallenge.submission);
            }

            // Formater les votes pour le front-end
            if (formattedChallenge.votes && Array.isArray(formattedChallenge.votes)) {
                console.log("Votes avant formatage:", formattedChallenge.votes);
                formattedChallenge.votes = formattedChallenge.votes.map(vote => {
                    try {
                        // Vérifier si userId est un objet peuplé ou juste un ID
                        const userId = typeof vote.userId === 'object' && vote.userId !== null
                            ? {
                                _id: vote.userId._id.toString(),
                                username: vote.userId.username || 'Utilisateur inconnu'
                            }
                            : { 
                                _id: vote.userId.toString(), 
                                username: 'Utilisateur inconnu'
                            };

                        return {
                            userId: userId._id,
                            username: userId.username,
                            vote: vote.vote
                        };
                    } catch (err) {
                        console.error("Erreur lors du formatage d'un vote:", err);
                        return null;
                    }
                }).filter(vote => vote !== null);
                console.log("Votes formatés:", formattedChallenge.votes);
            } else {
                formattedChallenge.votes = [];
                console.log("Aucun vote trouvé, initialisation d'un tableau vide");
            }

            console.log("Défi final formaté:", JSON.stringify(formattedChallenge, null, 2));

            return NextResponse.json({
                success: true,
                challenge: formattedChallenge
            });

        } catch (formatError) {
            console.error("Erreur lors du formatage des données:", formatError);
            return NextResponse.json(
                { 
                    success: false, 
                    message: 'Erreur lors du formatage des données du défi',
                    debug: formatError instanceof Error ? formatError.message : String(formatError)
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("=== Erreur détaillée dans current ===");
        console.error("Type:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("Message:", error instanceof Error ? error.message : String(error));
        console.error("Stack:", error instanceof Error ? error.stack : '');

        return NextResponse.json(
            { 
                success: false, 
                message: 'Erreur lors de la récupération du défi',
                debug: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
} 