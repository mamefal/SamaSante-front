// backend/src/lib/audit-log.ts
import { prisma } from './prisma.js'
import type { Context } from 'hono'

export type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'ACCESS'
    | 'EXPORT'
    | 'PRINT'

export type AuditEntity =
    | 'User'
    | 'Patient'
    | 'Doctor'
    | 'Appointment'
    | 'Prescription'
    | 'MedicalFile'
    | 'LabOrder'
    | 'ConsultationNote'
    | 'MedicalCertificate'

interface AuditLogData {
    userId?: number
    action: AuditAction
    entity: AuditEntity
    entityId?: number
    changes?: Record<string, any>
    ipAddress?: string
    userAgent?: string
    success?: boolean
    errorMessage?: string
}

/**
 * Crée un log d'audit
 */
export async function createAuditLog(data: AuditLogData) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                changes: data.changes ? JSON.stringify(data.changes) : null,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                success: data.success ?? true,
                errorMessage: data.errorMessage,
            },
        })
    } catch (error) {
        // Ne pas bloquer l'opération si le logging échoue
        console.error('Failed to create audit log:', error)
    }
}

/**
 * Helper pour extraire IP et User-Agent du contexte Hono
 */
export function getRequestMetadata(c: Context) {
    const ipAddress = c.req.header('x-forwarded-for') ||
        c.req.header('x-real-ip') ||
        'unknown'
    const userAgent = c.req.header('user-agent') || 'unknown'

    return { ipAddress, userAgent }
}

/**
 * Log une action de login
 */
export async function logLogin(userId: number, c: Context, success: boolean, errorMessage?: string) {
    const { ipAddress, userAgent } = getRequestMetadata(c)

    await createAuditLog({
        userId,
        action: 'LOGIN',
        entity: 'User',
        entityId: userId,
        ipAddress,
        userAgent,
        success,
        errorMessage,
    })
}

/**
 * Log une action de logout
 */
export async function logLogout(userId: number, c: Context) {
    const { ipAddress, userAgent } = getRequestMetadata(c)

    await createAuditLog({
        userId,
        action: 'LOGOUT',
        entity: 'User',
        entityId: userId,
        ipAddress,
        userAgent,
    })
}

/**
 * Log une création d'entité
 */
export async function logCreate(
    userId: number,
    entity: AuditEntity,
    entityId: number,
    data: Record<string, any>,
    c: Context
) {
    const { ipAddress, userAgent } = getRequestMetadata(c)

    await createAuditLog({
        userId,
        action: 'CREATE',
        entity,
        entityId,
        changes: { created: data },
        ipAddress,
        userAgent,
    })
}

/**
 * Log une mise à jour d'entité
 */
export async function logUpdate(
    userId: number,
    entity: AuditEntity,
    entityId: number,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    c: Context
) {
    const { ipAddress, userAgent } = getRequestMetadata(c)

    // Calculer les différences
    const changes: Record<string, any> = {}
    for (const key in newData) {
        if (oldData[key] !== newData[key]) {
            changes[key] = {
                from: oldData[key],
                to: newData[key],
            }
        }
    }

    await createAuditLog({
        userId,
        action: 'UPDATE',
        entity,
        entityId,
        changes,
        ipAddress,
        userAgent,
    })
}

/**
 * Log une suppression d'entité
 */
export async function logDelete(
    userId: number,
    entity: AuditEntity,
    entityId: number,
    data: Record<string, any>,
    c: Context
) {
    const { ipAddress, userAgent } = getRequestMetadata(c)

    await createAuditLog({
        userId,
        action: 'DELETE',
        entity,
        entityId,
        changes: { deleted: data },
        ipAddress,
        userAgent,
    })
}

/**
 * Log un accès à des données sensibles
 */
export async function logAccess(
    userId: number,
    entity: AuditEntity,
    entityId: number,
    c: Context
) {
    const { ipAddress, userAgent } = getRequestMetadata(c)

    await createAuditLog({
        userId,
        action: 'ACCESS',
        entity,
        entityId,
        ipAddress,
        userAgent,
    })
}

/**
 * Récupère les logs d'audit pour un utilisateur
 */
export async function getUserAuditLogs(userId: number, limit: number = 100) {
    return prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    })
}

/**
 * Récupère les logs d'audit pour une entité
 */
export async function getEntityAuditLogs(
    entity: AuditEntity,
    entityId: number,
    limit: number = 100
) {
    return prisma.auditLog.findMany({
        where: { entity, entityId },
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
    })
}

/**
 * Nettoie les anciens logs (rétention légale: 2 ans minimum)
 */
export async function cleanupOldAuditLogs(retentionDays: number = 730) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const deleted = await prisma.auditLog.deleteMany({
        where: {
            createdAt: {
                lt: cutoffDate,
            },
        },
    })

    return deleted.count
}
