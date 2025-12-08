// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Environment
    environment: process.env.NODE_ENV,

    // Release tracking
    release: process.env.APP_VERSION || '1.0.0',

    // Server-specific configuration
    integrations: [
        // Profiling integration removed - not available in @sentry/nextjs
        // Use @sentry/profiling-node separately if needed
    ],

    // Performance monitoring
    profilesSampleRate: 1.0,

    // Filter sensitive data
    beforeSend(event, hint) {
        // Don't send events in development
        if (process.env.NODE_ENV === 'development') {
            return null;
        }

        // Remove sensitive medical data
        if (event.request?.data) {
            const data = event.request.data as any;
            if (data.allergies) delete data.allergies;
            if (data.medicalNotes) delete data.medicalNotes;
            if (data.password) delete data.password;
        }

        return event;
    },
});
