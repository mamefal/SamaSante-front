
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // TODO: Clear session/cookie if needed
  // Note: Authentication is currently client-side (localStorage), so this server-side route is not strictly necessary for the current auth flow but kept for future server-side session management.
  return NextResponse.redirect(new URL("/", request.url), {
    status: 302,
  })
}

