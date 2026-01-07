import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Chemins publics
  const isPublicPath = pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/api/public')

  if (isPublicPath) {
    if (token && pathname.startsWith('/auth')) {
      // Si déjà connecté, rediriger vers le dashboard (rôle à vérifier idéalement)
      // Pour l'instant on laisse passer pour éviter les boucles de redirection complexes
      return NextResponse.next()
    }
    return NextResponse.next()
  }

  if (!token) {
    console.log('🔒 Middleware - Accès refusé (pas de token):', pathname)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = payload.role as string

    console.log('✅ Middleware - Token verified, role:', role, 'path:', pathname)

    // Vérification basique des accès par rôle
    if (pathname.startsWith('/patient') && role !== 'PATIENT') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (pathname.startsWith('/doctor') && role !== 'DOCTOR') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (pathname.startsWith('/hospital') && !['HOSPITAL_ADMIN', 'ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (pathname.startsWith('/super-admin') && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch (err) {
    console.error('🔒 Middleware - Token invalide:', err)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next (Next.js internals)
     * - static files (images, fonts, etc.)
     */
    '/((?!api|_next|.*\\..*|favicon.ico).*)',
  ],
}
