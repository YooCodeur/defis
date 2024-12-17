import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Challenge from '@/app/models/Challenge';
import User from '@/app/models/User';
import { selectNextUser } from '@/app/lib/userSelection';

export async function POST(request: Request) {
    try {
        await connectDB();
        
        const { challengeId, userId, accept } = await request.json();

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json(
                { success: false, message: 'Défi non trouvé' },
                { status: 404 }
            );
        }

        if (!accept) {
            // Retirer 5 points à l'utilisateur qui refuse le défi
            console.log('Retrait des points pour refus du défi');
            await User.findByIdAndUpdate(userId, {
                $inc: { points: -5 }
            });

            const newUser = await selectNextUser(userId);
            if (!newUser) {
                return NextResponse.json(
                    { success: false, message: 'Pas d\'autres utilisateurs disponibles' },
                    { status: 400 }
                );
            }

            challenge.assignedTo = newUser._id;
            challenge.status = 'pending_acceptance';
            await challenge.save();

            return NextResponse.json({
                success: true,
                message: 'Défi refusé et réassigné',
                newAssignee: {
                    id: newUser._id,
                    username: newUser.username
                },
                pointsUpdated: true
            });
        }

        // Accepter le défi
        challenge.status = 'active';
        await challenge.save();

        return NextResponse.json({
            success: true,
            message: 'Défi accepté'
        });

    } catch (error) {
        console.error('Erreur lors de la réponse au défi:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de la réponse au défi' },
            { status: 500 }
        );
    }
} 