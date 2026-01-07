import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { notificationManager } from '../lib/notifications/index.js'
import { logger } from '../lib/logger.js'

const notifications = new Hono()

/**
 * GET /notifications
 * Get all notifications for the current user
 */
notifications.get('/', async (c) => {
    // @ts-ignore - Type issue with Hono context
    const user = c.get('user') as { id: number } | undefined

    if (!user) {
        return c.json({ error: "Non autorisé" }, 401)
    }

    try {
        const limit = parseInt(c.req.query('limit') || '20')
        const offset = parseInt(c.req.query('offset') || '0')
        const unreadOnly = c.req.query('unreadOnly') === 'true'

        const where: any = { userId: user.id }
        if (unreadOnly) {
            where.read = false
        }

        const [notifs, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            }),
            prisma.notification.count({ where })
        ])

        return c.json({
            notifications: notifs.map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                time: n.createdAt.toISOString(),
                read: n.read,
                type: n.type
            })),
            total,
            limit,
            offset
        })
    } catch (error) {
        logger.error(`Failed to fetch notifications for User ${user.id}: ${error}`)
        return c.json({ error: "Erreur lors de la récupération des notifications" }, 500)
    }
})

/**
 * GET /notifications/unread-count
 * Get count of unread notifications
 */
notifications.get('/unread-count', async (c) => {
    // @ts-ignore
    const user = c.get('user') as { id: number } | undefined

    if (!user) {
        return c.json({ error: "Non autorisé" }, 401)
    }

    try {
        const count = await notificationManager.getUnreadCount(user.id)
        return c.json({ count })
    } catch (error) {
        logger.error(`Failed to get unread count for User ${user.id}: ${error}`)
        return c.json({ error: "Erreur lors du comptage des notifications" }, 500)
    }
})

/**
 * PUT /notifications/:id/read
 * Mark a notification as read
 */
notifications.put('/:id/read', async (c) => {
    // @ts-ignore
    const user = c.get('user') as { id: number } | undefined

    if (!user) {
        return c.json({ error: "Non autorisé" }, 401)
    }

    try {
        const notificationId = parseInt(c.req.param('id'))

        const success = await notificationManager.markAsRead(notificationId, user.id)

        if (success) {
            return c.json({ success: true, message: "Notification marquée comme lue" })
        } else {
            return c.json({ error: "Notification non trouvée" }, 404)
        }
    } catch (error) {
        logger.error(`Failed to mark notification ${c.req.param('id')} as read for User ${user.id}: ${error}`)
        return c.json({ error: "Erreur lors de la mise à jour" }, 500)
    }
})

/**
 * PUT /notifications/mark-all-read
 * Mark all notifications as read
 */
notifications.put('/mark-all-read', async (c) => {
    // @ts-ignore
    const user = c.get('user') as { id: number } | undefined

    if (!user) {
        return c.json({ error: "Non autorisé" }, 401)
    }

    try {
        const success = await notificationManager.markAllAsRead(user.id)

        if (success) {
            return c.json({ success: true, message: "Toutes les notifications marquées comme lues" })
        } else {
            return c.json({ error: "Erreur lors de la mise à jour" }, 500)
        }
    } catch (error) {
        logger.error(`Failed to mark all notifications as read for User ${user.id}: ${error}`)
        return c.json({ error: "Erreur lors de la mise à jour" }, 500)
    }
})

/**
 * DELETE /notifications/:id
 * Delete a notification
 */
notifications.delete('/:id', async (c) => {
    // @ts-ignore
    const user = c.get('user') as { id: number } | undefined

    if (!user) {
        return c.json({ error: "Non autorisé" }, 401)
    }

    try {
        const notificationId = parseInt(c.req.param('id'))

        await prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId: user.id
            }
        })

        return c.json({ success: true, message: "Notification supprimée" })
    } catch (error) {
        logger.error(`Failed to delete notification for User ${user.id}: ${error}`)
        return c.json({ error: "Erreur lors de la suppression" }, 500)
    }
})

/**
 * DELETE /notifications
 * Delete all read notifications
 */
notifications.delete('/', async (c) => {
    // @ts-ignore
    const user = c.get('user') as { id: number } | undefined

    if (!user) {
        return c.json({ error: "Non autorisé" }, 401)
    }

    try {
        const result = await prisma.notification.deleteMany({
            where: {
                userId: user.id,
                read: true
            }
        })

        return c.json({
            success: true,
            message: `${result.count} notification(s) supprimée(s)`,
            count: result.count
        })
    } catch (error) {
        logger.error(`Failed to delete notifications for User ${user.id}: ${error}`)
        return c.json({ error: "Erreur lors de la suppression" }, 500)
    }
})

/**
 * POST /notifications/test
 * Send a test notification (for development/testing)
 */
notifications.post('/test', async (c) => {
    // @ts-ignore
    const user = c.get('user') as { id: number } | undefined

    if (!user) {
        return c.json({ error: "Non autorisé" }, 401)
    }

    try {
        const body = await c.req.json()
        const { type = 'info', channels = ['in_app'] } = body

        const result = await notificationManager.send({
            userId: user.id,
            type: type as any,
            title: 'Test de notification',
            message: 'Ceci est une notification de test',
            channels: channels
        })

        return c.json({
            success: result.success,
            channels: result.channels,
            message: "Notification de test envoyée"
        })
    } catch (error) {
        logger.error(`Failed to send test notification for User ${user.id}: ${error}`)
        return c.json({ error: "Erreur lors de l'envoi" }, 500)
    }
})

export default notifications
