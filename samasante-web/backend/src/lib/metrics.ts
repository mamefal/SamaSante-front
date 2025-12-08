// backend/src/lib/metrics.ts
import { logger } from './logger.js'

interface Metric {
    name: string
    value: number
    timestamp: number
    tags?: Record<string, string>
}

class MetricsCollector {
    private metrics: Metric[] = []
    private flushInterval: NodeJS.Timeout | null = null

    constructor() {
        // Flush metrics every 60 seconds
        this.flushInterval = setInterval(() => {
            this.flush()
        }, 60000)
    }

    // Record a metric
    record(name: string, value: number, tags?: Record<string, string>) {
        this.metrics.push({
            name,
            value,
            timestamp: Date.now(),
            tags,
        })
    }

    // Increment a counter
    increment(name: string, tags?: Record<string, string>) {
        this.record(name, 1, tags)
    }

    // Record timing
    timing(name: string, duration: number, tags?: Record<string, string>) {
        this.record(name, duration, { ...tags, unit: 'ms' })
    }

    // Record gauge (current value)
    gauge(name: string, value: number, tags?: Record<string, string>) {
        this.record(name, value, tags)
    }

    // Flush metrics to log
    private flush() {
        if (this.metrics.length === 0) return

        // Group by metric name
        const grouped = this.metrics.reduce((acc, metric) => {
            if (!acc[metric.name]) {
                acc[metric.name] = []
            }
            const record = acc as Record<string, number[]>
            if (!record[metric.name]) record[metric.name] = []
            record[metric.name]!.push(metric.value)
            return record
        }, {} as Record<string, number[]>)

        // Calculate stats
        Object.entries(grouped).forEach(([name, values]) => {
            const count = values.length
            const sum = values.reduce((a, b) => a + b, 0)
            const avg = sum / count
            const min = Math.min(...values)
            const max = Math.max(...values)

            logger.info({
                metric: name,
                count,
                avg,
                min,
                max,
                sum,
            }, `Metric: ${name}`)
        })

        // Clear metrics
        this.metrics = []
    }

    // Stop collecting
    stop() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval)
            this.flush()
        }
    }
}

export const metrics = new MetricsCollector()

// Predefined metrics
export const trackApiRequest = (
    method: string,
    path: string,
    statusCode: number,
    duration: number
) => {
    metrics.timing('api.request.duration', duration, {
        method,
        path,
        status: statusCode.toString(),
    })

    metrics.increment('api.request.count', {
        method,
        path,
        status: statusCode.toString(),
    })
}

export const trackDatabaseQuery = (
    operation: string,
    table: string,
    duration: number
) => {
    metrics.timing('db.query.duration', duration, {
        operation,
        table,
    })

    metrics.increment('db.query.count', {
        operation,
        table,
    })
}

export const trackCacheHit = (key: string, hit: boolean) => {
    metrics.increment('cache.access', {
        key,
        result: hit ? 'hit' : 'miss',
    })
}

export const trackUserAction = (action: string, userId: number) => {
    metrics.increment('user.action', {
        action,
        userId: userId.toString(),
    })
}

export const trackError = (errorType: string, endpoint?: string) => {
    metrics.increment('error.count', {
        type: errorType,
        endpoint: endpoint || 'unknown',
    })
}

// Memory usage
export const trackMemoryUsage = () => {
    const usage = process.memoryUsage()

    metrics.gauge('memory.heap.used', usage.heapUsed / 1024 / 1024, { unit: 'MB' })
    metrics.gauge('memory.heap.total', usage.heapTotal / 1024 / 1024, { unit: 'MB' })
    metrics.gauge('memory.rss', usage.rss / 1024 / 1024, { unit: 'MB' })
}

// Start memory tracking
setInterval(trackMemoryUsage, 30000) // Every 30 seconds
