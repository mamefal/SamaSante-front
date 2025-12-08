// backend/src/lib/sentry.ts
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

export function initSentry() {
    if (!process.env.SENTRY_DSN) {
        console.warn('⚠️  SENTRY_DSN not configured. Error tracking disabled.')
        return
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        release: process.env.APP_VERSION || '1.0.0',

        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Profiling
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
            nodeProfilingIntegration(),
        ],

        // Filter sensitive data
        beforeSend(event, hint) {
            // Remove sensitive medical data
            if (event.request?.data) {
                const data = event.request.data as any
                if (data.password) delete data.password
                if (data.allergies) delete data.allergies
                if (data.medicalNotes) delete data.medicalNotes
                if (data.token) delete data.token
            }

            // Remove cookies and headers
            if (event.request) {
                delete event.request.cookies
                if (event.request.headers) {
                    delete event.request.headers.authorization
                    delete event.request.headers.cookie
                }
            }

            return event
        },

        // Ignore certain errors
        ignoreErrors: [
            'AbortError',
            'CancelledError',
            'NetworkError',
        ],
    })

    console.log('✅ Sentry initialized')
}

// Helper to capture exceptions
export const captureException = (error: Error, context?: Record<string, any>) => {
    Sentry.captureException(error, {
        extra: context,
    })
}

// Helper to capture messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
    Sentry.captureMessage(message, level)
}

// Helper to set user context
export const setUserContext = (user: { id: number; email: string; role: string }) => {
    Sentry.setUser({
        id: user.id.toString(),
        email: user.email,
        role: user.role,
    })
}

// Helper to add breadcrumb
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
    })
}

// Performance monitoring
export function startTransaction(name: string, op: string) {
    return Sentry.startSpan({ name, op }, (span) => span)
}
