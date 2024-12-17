import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { v2 as cloudinary } from 'cloudinary';
import Challenge from '@/app/models/Challenge';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const media = formData.get('media') as File;
        const mediaType = formData.get('mediaType') as string;
        const challengeId = formData.get('challengeId') as string;
        const userId = formData.get('userId') as string;

        if (!media || !challengeId || !userId || !mediaType) {
            return NextResponse.json({ success: false, message: 'Données manquantes' }, { status: 400 });
        }

        // Convertir le fichier en buffer
        const bytes = await media.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload vers Cloudinary
        const uploadResponse: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: mediaType === 'video' ? 'video' : 'image',
                    folder: 'challenges'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            const bufferStream = require('stream').Readable.from(buffer);
            bufferStream.pipe(uploadStream);
        });

        console.log('Réponse Cloudinary:', uploadResponse);

        if (!uploadResponse || !uploadResponse.secure_url) {
            throw new Error('Échec de l\'upload vers Cloudinary');
        }

        // Connexion à la base de données
        await connectDB();

        // Mise à jour du challenge
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json({ success: false, message: 'Challenge non trouvé' }, { status: 404 });
        }

        const submissionData = {
            mediaType: mediaType,
            media: {
                url: uploadResponse.url,
                secure_url: uploadResponse.secure_url,
                publicId: uploadResponse.public_id
            },
            submittedAt: new Date(),
            submittedBy: userId
        };

        console.log('Données de soumission à sauvegarder:', submissionData);

        // Mise à jour directe avec la nouvelle structure
        const updatedChallenge = await Challenge.findByIdAndUpdate(
            challengeId,
            {
                $set: {
                    submission: submissionData,
                    status: 'pending_validation'
                }
            },
            { new: true }
        ).lean();

        console.log('Challenge mis à jour:', updatedChallenge);

        return NextResponse.json({ 
            success: true, 
            message: 'Média envoyé avec succès',
            challenge: updatedChallenge
        });

    } catch (error) {
        console.error('Erreur détaillée lors de l\'upload:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Erreur lors de l\'envoi du média',
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
} 