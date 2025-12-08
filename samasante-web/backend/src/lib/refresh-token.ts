// backend/src/lib/refresh-token.ts
import { prisma } from './prisma.js'
import crypto from 'crypto'

const REFRESH_TOKEN_EXPIRY_DAYS = 7 // 7 jours

/**
 * Génère un refresh token sécurisé
 */
export function generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex')
}

/**
 * Crée un nouveau refresh token pour un utilisateur
 */
export async function createRefreshToken(userId: number): Promise<string> {
    const token = generateRefreshToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

    await prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt,
        },
    })

    return token
}

/**
 * Vérifie et récupère un refresh token
 */
export async function verifyRefreshToken(token: string) {
    const refreshToken = await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    })

    if (!refreshToken) {
        return null
    }

    // Vérifier si le token est expiré
    if (new Date() > refreshToken.expiresAt) {
        await prisma.refreshToken.delete({ where: { id: refreshToken.id } })
        return null
    }

    // Vérifier si le token a été révoqué
    if (refreshToken.revokedAt) {
        return null
    }

    return refreshToken
}

/**
 * Révoque un refresh token
 */
export async function revokeRefreshToken(token: string, replacedBy?: string) {
    await prisma.refreshToken.update({
        where: { token },
        data: {
            revokedAt: new Date(),
            replacedBy,
        },
    })
}

/**
 * Révoque tous les refresh tokens d'un utilisateur
 */
export async function revokeAllUserTokens(userId: number) {
    await prisma.refreshToken.updateMany({
        where: {
            userId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    })
}

/**
 * Nettoie les tokens expirés (à exécuter périodiquement)
 */
export async function cleanupExpiredTokens() {
    const deleted = await prisma.refreshToken.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    })

    return deleted.count
}

/**
 * Rotation du refresh token (bonne pratique de sécurité)
 */
export async function rotateRefreshToken(oldToken: string): Promise<string | null> {
    const refreshToken = await verifyRefreshToken(oldToken)

    if (!refreshToken) {
        return null
    }

    // Créer un nouveau token
    const newToken = await createRefreshToken(refreshToken.userId)

    // Révoquer l'ancien
    await revokeRefreshToken(oldToken, newToken)

    return newToken
}
