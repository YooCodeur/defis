import { v2 as cloudinary } from 'cloudinary';

console.log('=== Initialisation de Cloudinary ===');

// Configuration directe de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Vérifier la configuration
const config = cloudinary.config();
console.log('Configuration Cloudinary:', {
    cloudName: config.cloud_name,
    apiKey: config.api_key,
    hasSecret: !!config.api_secret,
    secretLength: config.api_secret?.length
});

// Tester la configuration
try {
    console.log('Test de la configuration Cloudinary...');
    const testParams = {
        folder: 'challenges',
        timestamp: Math.floor(Date.now() / 1000)
    };
    if (!config.api_secret) {
        throw new Error('API Secret non configuré pour Cloudinary');
    }
    const testSignature = cloudinary.utils.api_sign_request(testParams, config.api_secret);
    console.log('Test de signature réussi:', {
        params: testParams,
        signatureLength: testSignature.length
    });
} catch (error) {
    console.error('Erreur lors du test de configuration:', error);
}

export default cloudinary; 