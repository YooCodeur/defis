import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import cloudinary from '@/app/lib/cloudinary';
import Challenge from '@/app/models/Challenge';
import { Readable } from 'stream';

interface CloudinaryResponse {
    secure_url: string;
    url: string;
    public_id: string;
}

export async function POST(request: Request) {
    try {
        console.log('=== Début de la soumission du média ===');
        
        // Vérifier la configuration Cloudinary
        const config = cloudinary.config();
        console.log('Configuration Cloudinary actuelle:', {
            cloudName: config.cloud_name,
            apiKey: config.api_key,
            hasSecret: !!config.api_secret,
            secretLength: config.api_secret?.length
        });
        
        const formData = await request.formData();
        const media = formData.get('media') as File;
        const mediaType = formData.get('mediaType') as string;
        const challengeId = formData.get('challengeId') as string;
        const userId = formData.get('userId') as string;

        console.log('Données reçues:', {
            mediaPresent: !!media,
            mediaType,
            challengeId,
            userId,
            mediaSize: media?.size
        });

        if (!media || !challengeId || !userId || !mediaType) {
            return NextResponse.json({ success: false, message: 'Données manquantes' }, { status: 400 });
        }

        // Convertir le fichier en buffer
        console.log('Conversion du fichier en buffer...');
        const bytes = await media.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log('Buffer créé, taille:', buffer.length);

        // Upload vers Cloudinary
        console.log('Début de l\'upload vers Cloudinary...');
        
        const uploadResponse: CloudinaryResponse = await new Promise((resolve, reject) => {
            console.log('Création du stream d\'upload...');
            
            const timestamp = Math.floor(Date.now() / 1000);
            const params = {
                folder: 'challenges',
                timestamp: timestamp
            };

            if (!config.api_secret) {
                throw new Error('API Secret non configuré pour Cloudinary');
            }

            const signature = cloudinary.utils.api_sign_request(
                params,
                config.api_secret
            );

            console.log('Paramètres de signature:', {
                params,
                signature
            });

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    ...params,
                    signature,
                    api_key: config.api_key
                },
                (error, result) => {
                    if (error) {
                        console.error('Erreur Cloudinary détaillée:', {
                            message: error.message,
                            name: error.name,
                            http_code: error.http_code,
                            stack: error.stack
                        });
                        reject(error);
                    } else {
                        console.log('Upload réussi! Détails:', result);
                        resolve(result as CloudinaryResponse);
                    }
                }
            );

            console.log('Création du stream de buffer...');
            const bufferStream = Readable.from(buffer);
            console.log('Début du pipe vers Cloudinary...');
            bufferStream.pipe(uploadStream);
            
            uploadStream.on('error', (error) => {
                console.error('Erreur dans le stream d\'upload:', error);
            });
            
            bufferStream.on('error', (error) => {
                console.error('Erreur dans le stream de buffer:', error);
            });
            
            uploadStream.on('end', () => {
                console.log('Stream d\'upload terminé');
            });
        });

        // Connexion à la base de données
        console.log('Connexion à MongoDB...');
        await connectDB();

        // Mise à jour du challenge
        console.log('Recherche du challenge:', challengeId);
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

        console.log('Challenge mis à jour avec succès');

        return NextResponse.json({ 
            success: true, 
            message: 'Média envoyé avec succès',
            challenge: updatedChallenge
        });

    } catch (error) {
        console.error('=== Erreur détaillée lors de l\'upload ===');
        console.error('Type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('Message:', error instanceof Error ? error.message : String(error));
        console.error('Stack:', error instanceof Error ? error.stack : '');
        
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