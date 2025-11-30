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

export function setToken(token: string, userFromApi?: User) {
  if (!hasWindow()) return
  localStorage.setItem(TOKEN_KEY, token)

  // Set cookie for middleware
  document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax`

  // Optionnel : persister un "user" minimal si l’API n’en renvoie pas
  if (userFromApi) {
    setUser(userFromApi)
  } else {
    const p = getPayload()
    if (p) {
      setUser({
        id: Number(p.sub),
        role: p.role,
        doctorId: p.doctorId ?? null,
        patientId: p.patientId ?? null,
      })
    }
  }
}

export function getToken(): string | null {
  if (!hasWindow()) return null
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  if (!hasWindow()) return
  localStorage.removeItem(TOKEN_KEY)
}

export function setUser(u: User) {
  if (!hasWindow()) return
  localStorage.setItem(USER_KEY, JSON.stringify(u))

  // Set cookie for middleware
  document.cookie = `user=${encodeURIComponent(JSON.stringify(u))}; path=/; max-age=2592000; SameSite=Lax`
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

export function logout() {
  clearToken()
  clearUser()

  // Clear cookies
  if (hasWindow()) {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

// --- JWT utils ---
export function getPayload(): TokenPayload | null {
  const token = getToken()
  if (!token) return null
  try {
    return jwtDecode<TokenPayload>(token)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  const p = getPayload()
  if (!p) return false
  if (typeof p.exp === "number") {
    const nowSec = Math.floor(Date.now() / 1000)
    if (p.exp <= nowSec) return false
  }
  return true
}

export function getRole(): UserRole | null {
  return getPayload()?.role ?? null
}

export function getDoctorId(): number | null {
  const p = getPayload()
  return (p?.doctorId ?? null) as number | null
}

export function getPatientId(): number | null {
  const p = getPayload()
  return (p?.patientId ?? null) as number | null
}

/** Petit helper si tu veux construire des headers fetch/axios manuellement */
export function authHeader(): Record<string, string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}
