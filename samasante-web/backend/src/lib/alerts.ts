// backend/src/lib/alerts.ts
import { logger } from './logger.js'
import { captureMessage } from './sentry.js'

interface AlertConfig {
    name: string
    threshold: number
    window: number // in seconds
    cooldown: number // in seconds
}

class AlertManager {
    private counters: Map<string, { count: number; lastReset: number; lastAlert: number }> = new Map()

    // Check if threshold is exceeded
    check(config: AlertConfig): boolean {
        const now = Date.now()
        const key = config.name

        let counter = this.counters.get(key)

        if (!counter) {
            counter = { count: 0, lastReset: now, lastAlert: 0 }
            this.counters.set(key, counter)
        }

        // Reset counter if window expired
        if (now - counter.lastReset > config.window * 1000) {
            counter.count = 0
            counter.lastReset = now
        }

        counter.count++

        // Check threshold
        if (counter.count >= config.threshold) {
            // Check cooldown
            if (now - counter.lastAlert > config.cooldown * 1000) {
                counter.lastAlert = now
                return true
            }
        }

        return false
    }

    // Reset a counter
    reset(name: string) {
        this.counters.delete(name)
    }
}

export const alertManager = new AlertManager()

// Alert types
export const sendAlert = async (
    title: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: Record<string, any>
) => {
    logger.error({
        alert: title,
        message,
        severity,
        ...context,
    }, `ALERT: ${title}`)

    // Send to Sentry
    captureMessage(`[${severity.toUpperCase()}] ${title}: ${message}`, 'error')

    // TODO: Send to Slack, email, SMS, etc.
    // await sendSlackAlert(title, message, severity)
    // await sendEmailAlert(title, message, severity)
}

// Predefined alerts
export const alertHighErrorRate = () => {
    const config: AlertConfig = {
        name: 'high_error_rate',
        threshold: 10, // 10 errors
        window: 60, // in 1 minute
        cooldown: 300, // alert every 5 minutes max
    }

    if (alertManager.check(config)) {
        sendAlert(
            'High Error Rate',
            'More than 10 errors in the last minute',
            'high'
        )
    }
}

export const alertSlowResponse = (endpoint: string, duration: number) => {
    if (duration > 5000) { // 5 seconds
        sendAlert(
            'Slow API Response',
            `${endpoint} took ${duration}ms to respond`,
            'medium',
            { endpoint, duration }
        )
    }
}

export const alertDatabaseConnection = () => {
    sendAlert(
        'Database Connection Failed',
        'Unable to connect to the database',
        'critical'
    )
}

export const alertMemoryUsage = (usage: number) => {
    if (usage > 90) { // 90% memory usage
        const config: AlertConfig = {
            name: 'high_memory',
            threshold: 3,
            window: 300, // 5 minutes
            cooldown: 600, // 10 minutes
        }

        if (alertManager.check(config)) {
            sendAlert(
                'High Memory Usage',
                `Memory usage at ${usage}%`,
                'high',
                { usage }
            )
        }
    }
}

export const alertFailedLogins = (email: string) => {
    const config: AlertConfig = {
        name: `failed_login_${email}`,
        threshold: 5,
        window: 300, // 5 minutes
        cooldown: 1800, // 30 minutes
    }

    if (alertManager.check(config)) {
        sendAlert(
            'Multiple Failed Login Attempts',
            `5+ failed login attempts for ${email}`,
            'medium',
            { email }
        )
    }
}

export const alertUnauthorizedAccess = (userId: number, resource: string) => {
    sendAlert(
        'Unauthorized Access Attempt',
        `User ${userId} attempted to access ${resource}`,
        'high',
        { userId, resource }
    )
}
