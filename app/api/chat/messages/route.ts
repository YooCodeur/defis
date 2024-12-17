import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import Message from '@/app/models/Message';
import User from '@/app/models/User';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectDB();

        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('userId', 'username');

        return NextResponse.json({
            success: true,
            messages: messages.map(msg => ({
                _id: msg._id,
                userId: msg.userId._id,
                username: msg.userId.username,
                content: msg.content,
                createdAt: msg.createdAt
            })).reverse()
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de la récupération des messages' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        
        const data = await request.json();
        const { userId, content } = data;

        if (!userId || !content) {
            return NextResponse.json(
                { success: false, message: 'Données manquantes' },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        const message = new Message({
            userId: new mongoose.Types.ObjectId(userId),
            content,
            createdAt: new Date()
        });

        await message.save();

        return NextResponse.json({
            success: true,
            message: {
                _id: message._id,
                userId: user._id,
                username: user.username,
                content: message.content,
                createdAt: message.createdAt
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de l\'envoi du message' },
            { status: 500 }
        );
    }
} 