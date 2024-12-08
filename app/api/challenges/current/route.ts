import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Challenge from '@/app/models/Challenge';

interface IUser {
    _id: string;
    username: string;
}

export async function GET() {
    console.log("=== Début de la récupération du défi actuel ===");
    try {
        await connectDB();
        console.log("MongoDB connecté");

        // Attendre que la connexion soit complètement établie
        await new Promise(resolve => setTimeout(resolve, 100));

        const challenge = await Challenge.findOne({ status: 'active' })
            .populate('assignedTo', 'username')
            .exec();

        const result = challenge?.toObject();
        console.log("Défi trouvé:", result);

        if (!result) {
            return NextResponse.json({
                success: true,
                challenge: null
            });
        }

        return NextResponse.json({
            success: true,
            challenge: result
        });

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