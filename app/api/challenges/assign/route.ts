import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Challenge from '@/app/models/Challenge';
import User from '@/app/models/User';
import ChallengeAssignmentHistory from '@/app/models/ChallengeAssignmentHistory';

export async function POST(request: Request) {
    try {
        await connectDB();
        
        const { challengeId } = await request.json();

        // Récupérer le défi
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json(
                { success: false, message: 'Défi non trouvé' },
                { status: 404 }
            );
        }

        // Récupérer tous les utilisateurs sauf le créateur du défi
        const users = await User.find({
            _id: { $ne: challenge.createdBy }
        });

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Aucun utilisateur disponible' },
                { status: 400 }
            );
        }

        // Récupérer ou créer l'historique d'attribution pour chaque utilisateur
        const histories = await Promise.all(users.map(async (user) => {
            const history = await ChallengeAssignmentHistory.findOne({ userId: user._id });
            if (!history) {
                return ChallengeAssignmentHistory.create({
                    userId: user._id,
                    lastAssignedAt: null,
                    assignmentCount: 0
                });
            }
            return history;
        }));

        // Trouver les utilisateurs avec le moins de défis assignés
        const minAssignments = Math.min(...histories.map(h => h.assignmentCount));
        const eligibleUsers = users.filter((user, index) => 
            histories[index].assignmentCount === minAssignments
        );

        // Parmi les utilisateurs éligibles, sélectionner celui qui n'a pas eu de défi depuis le plus longtemps
        let selectedUser = eligibleUsers[0];
        let selectedHistory = histories.find(h => h.userId.toString() === selectedUser._id.toString());

        for (const user of eligibleUsers) {
            const history = histories.find(h => h.userId.toString() === user._id.toString());
            if (!selectedHistory.lastAssignedAt || 
                (history.lastAssignedAt && history.lastAssignedAt < selectedHistory.lastAssignedAt)) {
                selectedUser = user;
                selectedHistory = history;
            }
        }

        // Mettre à jour l'historique de l'utilisateur sélectionné
        await ChallengeAssignmentHistory.findOneAndUpdate(
            { userId: selectedUser._id },
            {
                $inc: { assignmentCount: 1 },
                $set: { lastAssignedAt: new Date() }
            }
        );

        // Mettre à jour le défi avec l'utilisateur assigné
        challenge.assignedTo = selectedUser._id;
        challenge.status = 'pending_acceptance';
        await challenge.save();

        return NextResponse.json({
            success: true,
            assignedUser: {
                id: selectedUser._id,
                username: selectedUser.username
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'attribution du défi:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de l\'attribution du défi' },
            { status: 500 }
        );
    }
} 