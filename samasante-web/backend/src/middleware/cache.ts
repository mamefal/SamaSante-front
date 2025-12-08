// backend/src/middleware/cache.ts
import { createMiddleware } from 'hono/factory'
import { cache, CACHE_TTL } from '../lib/cache.js'
import { logger } from '../lib/logger.js'

/**
 * Middleware de cache pour les réponses API
 */
export const cacheMiddleware = (ttl: number = CACHE_TTL.MEDIUM) => {
    return createMiddleware(async (c, next) => {
        // Only cache GET requests
        if (c.req.method !== 'GET') {
            return next()
        }

        // Generate cache key from URL and query params
        const url = new URL(c.req.url)
        const cacheKey = `api:${url.pathname}${url.search}`

        // Try to get from cache
        const cached = await cache.get(cacheKey)
        if (cached) {
            logger.debug({ cacheKey }, 'Cache hit')
            c.header('X-Cache', 'HIT')
            return c.json(cached)
        }

        // Execute request
        await next()

        // Cache successful responses
        if (c.res.status === 200) {
            try {
                const responseData = await c.res.clone().json()
                await cache.set(cacheKey, responseData, ttl)
                c.header('X-Cache', 'MISS')
                logger.debug({ cacheKey, ttl }, 'Response cached')
            } catch (error) {
                // Response might not be JSON, skip caching
                logger.debug({ cacheKey }, 'Response not cacheable')
            }
        }
    })
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string) {
    await cache.deletePattern(pattern)
    logger.info({ pattern }, 'Cache invalidated')
}

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
    patient: async (patientId: number) => {
        await invalidateCache(`api:*patient*${patientId}*`)
        await invalidateCache(`patient:${patientId}`)
    },

    doctor: async (doctorId: number) => {
        await invalidateCache(`api:*doctor*${doctorId}*`)
        await invalidateCache(`doctor:${doctorId}`)
        await invalidateCache(`slots:${doctorId}:*`)
    },

    appointment: async (appointmentId: number, doctorId?: number) => {
        await invalidateCache(`api:*appointment*${appointmentId}*`)
        await invalidateCache(`appointment:${appointmentId}`)
        if (doctorId) {
            await invalidateCache(`appointments:${doctorId}:*`)
            await invalidateCache(`slots:${doctorId}:*`)
        }
    },

    stats: async () => {
        await invalidateCache(`stats:*`)
    },
}
