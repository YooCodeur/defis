import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Challenge from '@/app/models/Challenge';
import cloudinary from '@/app/lib/cloudinary';

export async function POST(request: Request) {
    try {
        await connectDB();

        const formData = await request.formData();
        const video = formData.get('video') as File;
        const challengeId = formData.get('challengeId');
        const userId = formData.get('userId');

        if (!video || !challengeId || !userId) {
            return NextResponse.json(
                { success: false, message: 'Données manquantes' },
                { status: 400 }
            );
        }

        // Upload vers Cloudinary
        const bytes = await video.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video',
                    folder: 'challenge-videos',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // Mettre à jour le défi
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json(
                { success: false, message: 'Défi non trouvé' },
                { status: 404 }
            );
        }

        challenge.status = 'pending_validation';
        challenge.submission = {
            video: {
                url: uploadResponse.secure_url,
                publicId: uploadResponse.public_id
            },
            submittedAt: new Date(),
            submittedBy: userId
        };

        await challenge.save();

        return NextResponse.json({
            success: true,
            message: 'Vidéo soumise avec succès',
            challenge: {
                ...challenge.toObject(),
                status: 'pending_validation'
            }
        });

    } catch (error) {
        console.error('Erreur lors de la soumission de la vidéo:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de la soumission de la vidéo' },
            { status: 500 }
        );
    }
} 