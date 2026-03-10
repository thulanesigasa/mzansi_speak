// @ts-ignore
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const nonce = btoa(crypto.randomUUID())
    const isDev = process.env.NODE_ENV === 'development'

    // In development, Next.js needs 'unsafe-eval' and 'unsafe-inline' for HMR
    const scriptSrc = isDev
        ? `script-src 'self' 'unsafe-eval' 'unsafe-inline'`
        : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`

    // Strict CSP Header
    const cspHeader = `
    default-src 'self';
    ${scriptSrc};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://bessyqfhiqqopsethbyj.supabase.co;
    font-src 'self';
    connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://bessyqfhiqqopsethbyj.supabase.co;
    media-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://bessyqfhiqqopsethbyj.supabase.co;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
  `.replace(/\s{2,}/g, ' ').trim()

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', cspHeader)

    let response = NextResponse.next({
        request: { headers: requestHeaders },
    })

    // Supabase Auth and MFA Enforcement
    const supabase = createMiddlewareClient({ req: request, res: response })
    const { data: { session } } = await supabase.auth.getSession()

    const { pathname } = request.nextUrl
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
        if (!session) {
            const loginUrl = new URL('/', request.url)
            return NextResponse.redirect(loginUrl)
        }

        // MFA level check
        const { data: amrData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (amrData && amrData.currentLevel !== amrData.nextLevel) {
            const loginUrl = new URL('/', request.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    response.headers.set('Content-Security-Policy', cspHeader)
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    return response
}

export const config = {
    runtime: 'experimental-edge',
    matcher: [
        {
            source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
}
