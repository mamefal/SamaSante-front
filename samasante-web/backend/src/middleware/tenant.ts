import type { Context } from 'hono'

/**
 * Middleware pour l'isolation des données multi-tenant
 * - Super Admin voit toutes les organisations
 * - Hospital Admin voit uniquement son organisation
 * - Doctor/Patient voient uniquement leur organisation
 */
export const tenantMiddleware = async (c: Context, next: () => Promise<void>) => {
    const user = c.get('user')

    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    // Super Admin peut accéder à toutes les données
    if (user.role === 'SUPER_ADMIN') {
        c.set('organizationId', null) // null = accès à tout
        c.set('isSuperAdmin', true)
        await next()
        return
    }

    // Tous les autres rôles doivent avoir une organisation
    if (!user.organizationId) {
        return c.json({
            error: 'No organization assigned',
            message: 'Votre compte n\'est pas attaché à une organisation'
        }, 403)
    }

    // Hospital Admin, Doctor, Patient : limités à leur organisation
    c.set('organizationId', user.organizationId)
    c.set('isSuperAdmin', false)

    await next()
}

/**
 * Helper pour obtenir le filtre d'organisation
 * Retourne {} pour Super Admin, { organizationId } pour les autres
 */
export function getOrganizationFilter(c: Context) {
    const isSuperAdmin = c.get('isSuperAdmin')
    const organizationId = c.get('organizationId')

    if (isSuperAdmin) {
        return {} // Pas de filtre pour Super Admin
    }

    return { organizationId }
}

/**
 * Helper pour valider l'accès à une ressource
 * Vérifie que la ressource appartient à l'organisation de l'utilisateur
 */
export function validateResourceAccess(
    c: Context,
    resourceOrganizationId: number | null
): boolean {
    const isSuperAdmin = c.get('isSuperAdmin')

    if (isSuperAdmin) {
        return true // Super Admin a accès à tout
    }

    const userOrganizationId = c.get('organizationId')
    return resourceOrganizationId === userOrganizationId
}
