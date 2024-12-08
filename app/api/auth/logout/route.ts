import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = cookies();
    
    // Supprimer le cookie d'authentification
    cookieStore.delete('auth_token');

    return NextResponse.json(
        { message: 'Déconnexion réussie' },
        {
            status: 200,
            headers: {
                'Set-Cookie': 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
            }
        }
    );
} 