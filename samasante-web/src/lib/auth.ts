// src/lib/auth.ts
import { jwtDecode } from "jwt-decode"

const TOKEN_KEY = "amina:token"
const USER_KEY = "amina:user"

// --- Types ---
export type UserRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR" | "PATIENT" | "ADMIN"

export type User = {
  id: number
  email?: string
  name?: string
  role: UserRole
  doctor?: { id: number } | null
  doctorId?: number | null
  patientId?: number | null
}

export type TokenPayload = {
  sub: number | string
  role: UserRole
  doctorId?: number | null
  patientId?: number | null
  iat?: number
  exp?: number
}

// --- Storage helpers ---
function hasWindow() {
  return typeof window !== "undefined"
}

/**
 * @deprecated Token is now stored in HttpOnly cookie, not localStorage
 * This function is kept for backward compatibility but does nothing
 */
export function setToken(token: string, user: User) {
  if (!hasWindow()) return
  // Token is in HttpOnly cookie, just set user
  setUser(user)
}

/**
 * @deprecated Token is now in HttpOnly cookie, not accessible from JavaScript
 */
export function getToken(): string | null {
  return null // Token is in HttpOnly cookie
}

/**
 * @deprecated Token is in HttpOnly cookie, cleared by logout
 */
export function clearToken() {
  // Token is in HttpOnly cookie, will be cleared by backend
}

export function setUser(u: User) {
  if (!hasWindow()) return
  localStorage.setItem(USER_KEY, JSON.stringify(u))

  // Cookie is set by backend (token)
  // We don't need to set user cookie client-side
}

export function getUser(): User | null {
  if (!hasWindow()) return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function clearUser() {
  if (!hasWindow()) return
  localStorage.removeItem(USER_KEY)
}

export async function logout() {
  try {
    // Call backend logout endpoint
    if (hasWindow()) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Send cookies
      }).catch(() => {
        // Ignore errors, we'll clear local data anyway
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local data
    clearUser();

    // Clear cookies client-side as well
    if (hasWindow()) {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }
}

// --- JWT utils ---
// Note: Token is in HttpOnly cookie, not accessible from JavaScript
// These functions now work with user data from localStorage

/**
 * @deprecated Token is in HttpOnly cookie, payload not accessible
 * Use getUser() instead
 */
export function getPayload(): TokenPayload | null {
  // Token is in HttpOnly cookie, not accessible from JavaScript
  return null
}

export function isAuthenticated(): boolean {
  // Check if user data exists in localStorage
  // The middleware verifies the actual token cookie server-side
  return getUser() !== null
}

export function getRole(): UserRole | null {
  const user = getUser()
  return user?.role ?? null
}

export function getDoctorId(): number | null {
  const user = getUser()
  return user?.doctorId ?? null
}

export function getPatientId(): number | null {
  const user = getUser()
  return user?.patientId ?? null
}

/** Petit helper si tu veux construire des headers fetch/axios manuellement */
export function authHeader(): Record<string, string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}




