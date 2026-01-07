import webpush from 'web-push'
import { logger } from '../logger.js'

interface PushSubscription {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

interface SendPushParams {
    userId: number
    title: string
    body: string
    icon?: string
    badge?: string
    data?: any
    actions?: Array<{
        action: string
        title: string
        icon?: string
    }>
}

/**
 * Push Notification Service
 */
export class PushNotificationService {
    private subscriptions: Map<number, PushSubscription[]> = new Map()
    private enabled: boolean = false

    constructor() {
        this.initialize()
    }

    private initialize() {
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
        const appEmail = process.env.SMTP_FROM_EMAIL || 'admin@samasante.sn'

        if (vapidPublicKey && vapidPrivateKey) {
            webpush.setVapidDetails(
                `mailto:${appEmail}`,
                vapidPublicKey,
                vapidPrivateKey
            )
            this.enabled = true
            logger.info('Push notification service initialized (Web Push)')
        } else {
            logger.warn('Push notification service not configured (Missing VAPID keys)')
            this.enabled = false
        }
    }

    /**
     * Subscribe a user to push notifications
     */
    async subscribe(userId: number, subscription: PushSubscription): Promise<boolean> {
        try {
            const userSubscriptions = this.subscriptions.get(userId) || []

            const exists = userSubscriptions.some(
                sub => sub.endpoint === subscription.endpoint
            )

            if (!exists) {
                userSubscriptions.push(subscription)
                this.subscriptions.set(userId, userSubscriptions)
                logger.info(`User ${userId} subscribed to push notifications`)
            }

            return true
        } catch (error) {
            logger.error(`Failed to subscribe User ${userId}: ${error}`)
            return false
        }
    }

    /**
     * Unsubscribe a user
     */
    async unsubscribe(userId: number, endpoint: string): Promise<boolean> {
        try {
            const userSubscriptions = this.subscriptions.get(userId) || []
            const filtered = userSubscriptions.filter(sub => sub.endpoint !== endpoint)
            this.subscriptions.set(userId, filtered)
            return true
        } catch (error) {
            return false
        }
    }

    /**
     * Send push notification to a user
     */
    async sendPush(params: SendPushParams): Promise<boolean> {
        if (!this.enabled) return false

        const { userId, title, body, icon, badge, data, actions } = params

        try {
            const userSubscriptions = this.subscriptions.get(userId) || []

            if (userSubscriptions.length === 0) {
                return false
            }

            const payload = JSON.stringify({
                notification: {
                    title,
                    body,
                    icon: icon || '/logo.png',
                    badge: badge || '/badge.png',
                    data,
                    actions,
                    vibrate: [100, 50, 100]
                }
            })

            const sendPromises = userSubscriptions.map(sub =>
                webpush.sendNotification(sub as any, payload)
                    .catch(error => {
                        if (error.statusCode === 404 || error.statusCode === 410) {
                            // Subscription expired or invalid
                            this.unsubscribe(userId, sub.endpoint)
                        }
                        logger.error(`WebPush error for user ${userId}: ${error}`)
                    })
            )

            await Promise.all(sendPromises)
            logger.info(`Push messages sent to User ${userId}`)

            return true
        } catch (error) {
            logger.error(`Failed to send push to User ${userId}: ${error}`)
            return false
        }
    }

    /**
     * Send appointment reminder push notification
     */
    async sendAppointmentReminderPush(params: {
        userId: number
        doctorName: string
        appointmentDate: Date
        location: string
    }): Promise<boolean> {
        const { userId, doctorName, appointmentDate, location } = params

        const formattedTime = appointmentDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })

        return this.sendPush({
            userId,
            title: '⏰ Rappel de rendez-vous',
            body: `Rendez-vous demain avec Dr. ${doctorName} à ${formattedTime}`,
            icon: '/icons/appointment-icon.png',
            badge: '/icons/badge-icon.png',
            data: {
                type: 'appointment_reminder',
                appointmentDate: appointmentDate.toISOString(),
                location
            },
            actions: [
                {
                    action: 'view',
                    title: 'Voir détails'
                },
                {
                    action: 'cancel',
                    title: 'Annuler'
                }
            ]
        })
    }

    /**
     * Send new message push notification
     */
    async sendNewMessagePush(params: {
        userId: number
        senderName: string
        messagePreview: string
    }): Promise<boolean> {
        const { userId, senderName, messagePreview } = params

        return this.sendPush({
            userId,
            title: `💬 Nouveau message de ${senderName}`,
            body: messagePreview,
            icon: '/icons/message-icon.png',
            data: {
                type: 'new_message',
                sender: senderName
            },
            actions: [
                {
                    action: 'reply',
                    title: 'Répondre'
                },
                {
                    action: 'view',
                    title: 'Voir'
                }
            ]
        })
    }

    /**
     * Send prescription ready push notification
     */
    async sendPrescriptionReadyPush(params: {
        userId: number
        doctorName: string
    }): Promise<boolean> {
        const { userId, doctorName } = params

        return this.sendPush({
            userId,
            title: '💊 Ordonnance disponible',
            body: `Dr. ${doctorName} a créé une nouvelle ordonnance pour vous`,
            icon: '/icons/prescription-icon.png',
            data: {
                type: 'prescription_ready',
                doctor: doctorName
            },
            actions: [
                {
                    action: 'view',
                    title: 'Consulter'
                }
            ]
        })
    }

    /**
     * Check if push service is enabled
     */
    isEnabled(): boolean {
        return this.enabled
    }

    /**
     * Get subscription count for a user
     */
    getSubscriptionCount(userId: number): number {
        return this.subscriptions.get(userId)?.length || 0
    }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService()
