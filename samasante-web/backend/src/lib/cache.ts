// backend/src/lib/cache.ts
import { Redis } from 'ioredis'
import { logger } from './logger.js'

// Configuration Redis
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    maxRetriesPerRequest: null, // Required for BullMQ
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
    },
}

// Client Redis
export const redis = new Redis(redisConfig)

redis.on('connect', () => {
    logger.info('✅ Redis connected')
})

redis.on('error', (err: Error) => {
    logger.error({ err }, '❌ Redis connection error')
})

// Cache service
export class CacheService {
    private prefix: string

    constructor(prefix: string = 'samasante') {
        this.prefix = prefix
    }

    private getKey(key: string): string {
        return `${this.prefix}:${key}`
    }

    /**
     * Get cached value
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await redis.get(this.getKey(key))
            if (!value) return null

            return JSON.parse(value) as T
        } catch (error) {
            logger.error({ error, key }, 'Cache get error')
            return null
        }
    }

    /**
     * Set cached value with TTL (seconds)
     */
    async set(key: string, value: any, ttl: number = 3600): Promise<void> {
        try {
            await redis.setex(this.getKey(key), ttl, JSON.stringify(value))
        } catch (error) {
            logger.error({ error, key }, 'Cache set error')
        }
    }

    /**
     * Delete cached value
     */
    async delete(key: string): Promise<void> {
        try {
            await redis.del(this.getKey(key))
        } catch (error) {
            logger.error({ error, key }, 'Cache delete error')
        }
    }

    /**
     * Delete multiple keys by pattern
     */
    async deletePattern(pattern: string): Promise<void> {
        try {
            const keys = await redis.keys(this.getKey(pattern))
            if (keys.length > 0) {
                await redis.del(...keys)
            }
        } catch (error) {
            logger.error({ error, pattern }, 'Cache delete pattern error')
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(this.getKey(key))
            return result === 1
        } catch (error) {
            logger.error({ error, key }, 'Cache exists error')
            return false
        }
    }

    /**
     * Increment counter
     */
    async increment(key: string, ttl?: number): Promise<number> {
        try {
            const value = await redis.incr(this.getKey(key))
            if (ttl) {
                await redis.expire(this.getKey(key), ttl)
            }
            return value
        } catch (error) {
            logger.error({ error, key }, 'Cache increment error')
            return 0
        }
    }

    /**
     * Get or set (cache-aside pattern)
     */
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl: number = 3600
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key)
        if (cached !== null) {
            return cached
        }

        // Fetch from source
        const value = await fetcher()

        // Store in cache
        await this.set(key, value, ttl)

        return value
    }
}

// Default cache instance
export const cache = new CacheService()

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    DAY: 86400, // 24 hours
    WEEK: 604800, // 7 days
}

// Cache key builders
export const cacheKeys = {
    user: (id: number) => `user:${id}`,
    patient: (id: number) => `patient:${id}`,
    doctor: (id: number) => `doctor:${id}`,
    appointment: (id: number) => `appointment:${id}`,
    appointments: (doctorId: number, date: string) => `appointments:${doctorId}:${date}`,
    availableSlots: (doctorId: number, date: string) => `slots:${doctorId}:${date}`,
    stats: (type: string) => `stats:${type}`,
}
