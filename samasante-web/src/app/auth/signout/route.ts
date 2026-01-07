
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url), { status: 302 })
  // Supprimer le cookie d'authentification (nommé "auth_token" par convention)
  response.cookies.delete('auth_token')
  // Si d'autres cookies de session existent, les supprimer également
  response.cookies.delete('session')
  return response
}

