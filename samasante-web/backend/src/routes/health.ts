import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { redis } from '../lib/cache.js'

const health = new Hono()

// Basic health check
health.get('/', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    })
})

// Readiness check - vérifie que l'app peut servir du trafic
health.get('/ready', async (c) => {
    const checks = {
        database: false,
        redis: false,
    }

    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`
        checks.database = true
    } catch (error) {
        console.error('Database health check failed:', error)
    }

    try {
        // Check Redis connection
        await redis.ping()
        checks.redis = true
    } catch (error) {
        console.error('Redis health check failed:', error)
    }

    const isReady = checks.database && checks.redis
    const status = isReady ? 200 : 503

    return c.json({
        status: isReady ? 'ready' : 'not ready',
        checks,
        timestamp: new Date().toISOString(),
    }, status)
})

// Liveness check - vérifie que l'app est vivante
health.get('/live', (c) => {
    return c.json({
        status: 'alive',
        timestamp: new Date().toISOString(),
    })
})

export { health }
