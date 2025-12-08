import { compareSync, hashSync } from 'bcryptjs'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

/** Hash password with bcrypt */
export function hash(plain: string): string {
  return hashSync(plain, 10)
}

/** Compare password with hash */
export function compare(plain: string, hashed: string): boolean {
  return compareSync(plain, hashed)
}

/** Signe un JWT (HS256, exp 1 jour) */
export async function signJwt(payload: JWTPayload | Record<string, unknown>, expiresIn: string = '1d') {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export type UserRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR" | "PATIENT" | "ADMIN"

/** Vérifie un JWT et renvoie le payload typé */
export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as { sub: number; role: UserRole; doctorId?: number | null }
}

// Aliases for compatibility
export const hashPassword = hash
export const comparePassword = compare
export const signJWT = signJwt
export const verifyJWT = verifyJwt
