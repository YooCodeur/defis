import { NextResponse } from 'next/server';

export async function POST() {
    // Supprimer le cookie d'authentification en utilisant la réponse
    return NextResponse.json(
        { message: 'Déconnexion réussie' },
        {
            status: 200,
            headers: {
                'Set-Cookie': 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict'
            }
        }
    );
} 