import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {
  // TEMPORAIRE : Middleware complètement désactivé pour tester
  console.log('🔍 Middleware - DÉSACTIVÉ - Passage autorisé pour:', request.nextUrl.pathname)
  return NextResponse.next()
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
