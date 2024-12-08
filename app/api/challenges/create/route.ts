import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Challenge from '@/app/models/Challenge';
import User from '@/app/models/User';
import mongoose from 'mongoose';

export async function POST(request: Request) {
    try {
        console.log('=== Début de la création du défi ===');
        await connectDB();
        console.log('MongoDB connecté');

        const data = await request.json();
        const { title, description, userId } = data;
        console.log('Données reçues:', { title, description, userId });

        // Validation des données
        if (!title || !description || !userId) {
            console.log('Données manquantes:', { title, description, userId });
            return NextResponse.json(
                { success: false, message: 'Données manquantes' },
                { status: 400 }
            );
        }

        // Trouver tous les utilisateurs sauf le créateur
        console.log('Recherche des autres utilisateurs...');
        const otherUsers = await User.find({
            _id: { $ne: userId }
        }).lean();
        console.log('Autres utilisateurs trouvés:', otherUsers.length);

        if (otherUsers.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Pas d\'autres utilisateurs disponibles' },
                { status: 400 }
            );
        }

        // Sélectionner un utilisateur au hasard
        const randomIndex = Math.floor(Math.random() * otherUsers.length);
        const selectedUser = otherUsers[randomIndex];
        console.log('Utilisateur sélectionné:', selectedUser.username);

        // Créer le défi
        console.log('Création du défi...');
        const challengeData = {
            title,
            description,
            createdBy: new mongoose.Types.ObjectId(userId),
            status: 'pending_acceptance',
            assignedTo: selectedUser._id,
            completedBy: null,
            votes: [],
            submission: null,
            completedAt: null,
            totalUsers: otherUsers.length,
            requiredVotes: Math.ceil(otherUsers.length / 2)
        };
        console.log('Données du défi:', challengeData);

        const challenge = await Challenge.create(challengeData);
        console.log('Défi créé avec succès:', challenge._id);

        return NextResponse.json({ 
            success: true, 
            challenge,
            assignedTo: {
                id: selectedUser._id,
                username: selectedUser.username
            }
        });

    } catch (error) {
        console.error('=== Erreur lors de la création du défi ===');
        console.error('Type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('Message:', error instanceof Error ? error.message : String(error));
        console.error('Stack:', error instanceof Error ? error.stack : '');
        
        return NextResponse.json(
            { 
                success: false, 
                message: 'Erreur lors de la création du défi',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
} 