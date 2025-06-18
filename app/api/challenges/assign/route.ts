import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Challenge from '@/app/models/Challenge';
import getUser from '@/app/models/User';

export async function POST(request: Request) {
    try {
        await connectDB();
        
        const { challengeId } = await request.json();
        const User = getUser;  // Obtenir le modèle User

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

        // Trouver le cycle actuel maximum
        const maxCycle = Math.max(...users.map(user => user.currentCycle));

        // Filtrer les utilisateurs éligibles (ceux qui n'ont pas encore eu de défi dans le cycle actuel)
        let eligibleUsers = users.filter(user => 
            user.currentCycle < maxCycle || 
            !user.lastCycleChallengeDate
        );

        // Si tous les utilisateurs ont déjà eu un défi dans ce cycle, on commence un nouveau cycle
        if (eligibleUsers.length === 0) {
            eligibleUsers = users;
            // On incrémentera le cycle pour l'utilisateur sélectionné
        }

        // Parmi les utilisateurs éligibles, sélectionner celui qui n'a pas eu de défi depuis le plus longtemps
        let selectedUser = eligibleUsers[0];
        for (const user of eligibleUsers) {
            if (!selectedUser.lastChallengeAssignedAt || 
                (user.lastChallengeAssignedAt && 
                 user.lastChallengeAssignedAt < selectedUser.lastChallengeAssignedAt)) {
                selectedUser = user;
            }
        }

        // Mettre à jour l'utilisateur sélectionné
        const newCycle = eligibleUsers.length === users.length ? maxCycle + 1 : maxCycle;
        await User.findByIdAndUpdate(selectedUser._id, {
            $set: {
                lastChallengeAssignedAt: new Date(),
                lastCycleChallengeDate: new Date(),
                currentCycle: newCycle
            }
        });

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