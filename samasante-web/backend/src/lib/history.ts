// backend/src/lib/history.ts
import { prisma } from './prisma.js'

/**
 * Enregistre l'historique des modifications d'une entité
 */
export async function recordHistory(
    entityType: string,
    entityId: number,
    userId: number,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    oldData: any,
    newData: any
) {
    // Calculer les différences
    const changes: Record<string, { old: any; new: any }> = {}

    if (action === 'UPDATE') {
        for (const key in newData) {
            if (oldData[key] !== newData[key]) {
                changes[key] = {
                    old: oldData[key],
                    new: newData[key],
                }
            }
        }
    }

    // Créer l'entrée d'historique
    await prisma.modificationHistory.create({
        data: {
            entityType,
            entityId,
            userId,
            action,
            changes: JSON.stringify(changes),
            oldData: action === 'DELETE' ? JSON.stringify(oldData) : null,
            newData: action === 'CREATE' ? JSON.stringify(newData) : null,
        },
    })
}

/**
 * Récupère l'historique d'une entité
 */
export async function getEntityHistory(
    entityType: string,
    entityId: number,
    limit: number = 50
) {
    const history = await prisma.modificationHistory.findMany({
        where: {
            entityType,
            entityId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    })

    return history.map((entry) => ({
        id: entry.id,
        action: entry.action,
        user: entry.user,
        changes: entry.changes ? JSON.parse(entry.changes) : null,
        createdAt: entry.createdAt,
    }))
}

/**
 * Récupère toutes les modifications d'un utilisateur
 */
export async function getUserModifications(userId: number, limit: number = 100) {
    return prisma.modificationHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    })
}

/**
 * Middleware pour tracker automatiquement les modifications
 */
export function createHistoryMiddleware(entityType: string) {
    return async (
        entityId: number,
        userId: number,
        action: 'CREATE' | 'UPDATE' | 'DELETE',
        oldData?: any,
        newData?: any
    ) => {
        await recordHistory(entityType, entityId, userId, action, oldData, newData)
    }
}
