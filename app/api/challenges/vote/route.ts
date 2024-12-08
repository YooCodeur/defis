import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Challenge from '@/app/models/Challenge';
import User from '@/app/models/User';
import { selectNextUser } from '@/app/lib/userSelection';

export async function POST(request: Request) {
    try {
        await connectDB();
        
        const { challengeId, userId, vote } = await request.json();

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json(
                { success: false, message: 'Défi non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier si l'utilisateur n'a pas déjà voté
        if (challenge.votes.some(v => v.user.toString() === userId)) {
            return NextResponse.json(
                { success: false, message: 'Vous avez déjà voté' },
                { status: 400 }
            );
        }

        // Ajouter le vote
        challenge.votes.push({
            user: userId,
            vote,
            votedAt: new Date()
        });

        // Calculer les votes
        const totalUsers = await User.countDocuments();
        const requiredVotes = Math.ceil(totalUsers / 2); // Majorité requise
        const totalVotes = challenge.votes.length;
        const approveVotes = challenge.votes.filter(v => v.vote === 'approve').length;

        // Si on a atteint le nombre de votes requis
        if (totalVotes >= requiredVotes) {
            // Si majorité de votes positifs
            if (approveVotes > requiredVotes / 2) {
                challenge.status = 'completed';
                challenge.completedAt = new Date();
                challenge.completedBy = challenge.assignedTo;

                // Donner 5 points à l'utilisateur qui a réussi le défi
                await User.findByIdAndUpdate(challenge.assignedTo, {
                    $inc: { points: 5 }
                });

                await challenge.save();

                return NextResponse.json({
                    success: true,
                    message: 'Défi validé ! L\'utilisateur gagne 5 points.',
                    stats: {
                        approveVotes,
                        totalVotes,
                        requiredVotes
                    }
                });
            } else {
                // Dans le cas où le défi n'est pas validé
                if (totalVotes >= requiredVotes && approveVotes <= requiredVotes / 2) {
                    const newUser = await selectNextUser(challenge.assignedTo.toString());
                    if (newUser) {
                        challenge.assignedTo = newUser._id;
                        challenge.status = 'pending_acceptance';
                        challenge.votes = [];
                        challenge.submission = null;
                    }
                    await challenge.save();
                }

                return NextResponse.json({
                    success: true,
                    message: 'Défi non validé et réassigné à un autre utilisateur',
                    stats: {
                        approveVotes,
                        totalVotes,
                        requiredVotes
                    }
                });
            }
        }

        // Si pas encore assez de votes
        await challenge.save();

        const remainingVotes = requiredVotes - totalVotes;
        return NextResponse.json({
            success: true,
            message: `Vote enregistré. Encore ${remainingVotes} votes nécessaires pour la validation.`,
            stats: {
                approveVotes,
                totalVotes,
                requiredVotes,
                remainingVotes
            }
        });

    } catch (error) {
        console.error('Erreur lors du vote:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors du vote' },
            { status: 500 }
        );
    }
} 