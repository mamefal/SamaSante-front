// backend/src/routes/monitoring.ts
import { Hono } from 'hono'
import { verifyJWT } from '../lib/auth.js'
import { getSystemStats, getSystemHealth, getActivityMetrics } from '../lib/monitoring.js'

export const monitoring = new Hono()

// Middleware to check SUPER_ADMIN role
monitoring.use('*', async (c, next) => {
    const token = c.req.header('cookie')?.split('token=')[1]?.split(';')[0]

    if (!token) {
        return c.text('Unauthorized', 401)
    }

    try {
        const payload = await verifyJWT(token)

        if (payload.role !== 'SUPER_ADMIN') {
            return c.text('Forbidden - SUPER_ADMIN access required', 403)
        }

        await next()
    } catch (error) {
        return c.text('Unauthorized', 401)
    }
})

/**
 * GET /api/monitoring/stats
 * Get system statistics
 */
monitoring.get('/stats', async (c) => {
    try {
        const stats = await getSystemStats()
        return c.json(stats)
    } catch (error) {
        console.error('Error fetching stats:', error)
        return c.json({ error: 'Failed to fetch statistics' }, 500)
    }
})

/**
 * GET /api/monitoring/health
 * Get system health
 */
monitoring.get('/health', async (c) => {
    try {
        const health = await getSystemHealth()
        return c.json(health)
    } catch (error) {
        console.error('Error fetching health:', error)
        return c.json({ error: 'Failed to fetch health status' }, 500)
    }
})

/**
 * GET /api/monitoring/metrics
 * Get activity metrics
 */
monitoring.get('/metrics', async (c) => {
    try {
        const metrics = await getActivityMetrics()
        return c.json(metrics)
    } catch (error) {
        console.error('Error fetching metrics:', error)
        return c.json({ error: 'Failed to fetch metrics' }, 500)
    }
})
