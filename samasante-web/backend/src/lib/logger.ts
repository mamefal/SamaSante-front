// backend/src/lib/logger.ts
import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',

    transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        }
        : undefined,

    // Production configuration
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() }
        },
    },

    // Add context
    base: {
        env: process.env.NODE_ENV,
        service: 'samasante-api',
    },

    // Redact sensitive fields
    redact: {
        paths: [
            'password',
            'token',
            'accessToken',
            'refreshToken',
            'req.headers.authorization',
            'req.headers.cookie',
            'allergies',
            'medicalNotes',
        ],
        remove: true,
    },
})

// Helper functions
export const logError = (error: Error, context?: Record<string, any>) => {
    logger.error({ err: error, ...context }, error.message)
}

export const logInfo = (message: string, context?: Record<string, any>) => {
    logger.info(context, message)
}

export const logWarn = (message: string, context?: Record<string, any>) => {
    logger.warn(context, message)
}

export const logDebug = (message: string, context?: Record<string, any>) => {
    logger.debug(context, message)
}

// Performance logging
export const logPerformance = (
    operation: string,
    duration: number,
    context?: Record<string, any>
) => {
    logger.info(
        {
            operation,
            duration_ms: duration,
            ...context,
        },
        `${operation} completed in ${duration}ms`
    )
}

// Database query logging
export const logQuery = (
    query: string,
    duration: number,
    params?: any[]
) => {
    logger.debug(
        {
            query,
            duration_ms: duration,
            params,
        },
        'Database query executed'
    )
}

// HTTP request logging
export const logRequest = (
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: number
) => {
    logger.info(
        {
            method,
            path,
            statusCode,
            duration_ms: duration,
            userId,
        },
        `${method} ${path} ${statusCode} - ${duration}ms`
    )
}
