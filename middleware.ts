import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Cloner les headers pour les modifier
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-url', request.url)

    // Retourner la réponse avec les headers modifiés
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
} 