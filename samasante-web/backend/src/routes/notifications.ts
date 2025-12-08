import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'

const notifications = new Hono()

notifications.get('/', async (c) => {
    // @ts-ignore - Type issue with Hono context
    const user = c.get('user') as { id: number } | undefined

    if (!user) {
        return c.json({ error: "Non autorisé" }, 401)
    }

    try {
        const notifs = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to last 20 notifications
        })

        return c.json(notifs.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: n.createdAt.toISOString(), // Simplified time format
            read: n.read,
            type: n.type
        })))
    } catch (error) {
        return c.json({ error: "Erreur lors de la récupération des notifications" }, 500)
    }
})

export default notifications
