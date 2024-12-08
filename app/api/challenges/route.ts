import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/db';
import Challenge from '../../models/Challenge';

export async function GET() {
    try {
        await connectDB();
        const challenges = await Challenge.find().sort({ createdAt: -1 });
        return NextResponse.json(challenges);
    } catch (error) {
        console.error('Erreur lors de la récupération des défis:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des défis' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { title, description, creator } = await request.json();
        await connectDB();

        const challenge = await Challenge.create({
            title,
            description,
            creator
        });

        return NextResponse.json(challenge, { status: 201 });
    } catch (error) {
        console.error('Erreur lors de la création du défi:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création du défi' },
            { status: 500 }
        );
    }
} 