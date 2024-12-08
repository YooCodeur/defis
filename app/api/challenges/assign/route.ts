import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Challenge from '@/app/models/Challenge';
import User from '@/app/models/User';
import mongoose from 'mongoose';

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

        // Sélectionner un utilisateur au hasard
        const randomIndex = Math.floor(Math.random() * users.length);
        const selectedUser = users[randomIndex];

        // Mettre à jour le défi avec l'utilisateur assigné
        challenge.assignedTo = selectedUser._id;
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