import { prisma } from '../prisma.js'
import { smsService } from './sms.js'
import { emailService } from './email.js'
import { pushNotificationService } from './push.js'
import { logger } from '../logger.js'

export type NotificationType =
    | 'appointment_confirmation'
    | 'appointment_reminder'
    | 'appointment_cancellation'
    | 'prescription_ready'
    | 'lab_results_ready'
    | 'new_message'
    | 'account_created'
    | 'password_reset'
    | 'system_alert'
    | 'info'

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app'

interface NotificationParams {
    userId: number
    type: NotificationType
    title: string
    message: string
    channels?: NotificationChannel[]
    data?: any
}

interface AppointmentNotificationData {
    patientId: number
    doctorId: number
    appointmentId: number
    appointmentDate: Date
    location: string
}

/**
 * Unified Notification Manager
 * Orchestrates all notification channels (Email, SMS, Push, In-App)
 */
export class NotificationManager {
    /**
     * Send notification through specified channels
     */
    async send(params: NotificationParams): Promise<{
        success: boolean
        channels: {
            email?: boolean
            sms?: boolean
            push?: boolean
            inApp?: boolean
        }
    }> {
        const { userId, type, title, message, channels = ['in_app'], data } = params

        const results = {
            success: false,
            channels: {} as any
        }

        try {
            // Get user details
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    patient: true,
                    doctor: true
                }
            })

            if (!user) {
                logger.error(`User ${userId} not found for notification`)
                return results
            }

            // Always create in-app notification
            if (channels.includes('in_app')) {
                results.channels.inApp = await this.createInAppNotification({
                    userId,
                    type,
                    title,
                    message,
                    data
                })
            }

            // Send email if channel is enabled
            if (channels.includes('email') && user.email) {
                results.channels.email = await this.sendEmailNotification({
                    user,
                    type,
                    title,
                    message,
                    data
                })
            }

            // Send SMS if channel is enabled
            if (channels.includes('sms') && user.phone) {
                results.channels.sms = await this.sendSMSNotification({
                    user,
                    type,
                    message,
                    data
                })
            }

            // Send push notification if channel is enabled
            if (channels.includes('push')) {
                results.channels.push = await this.sendPushNotification({
                    userId,
                    type,
                    title,
                    message,
                    data
                })
            }

            // Mark as successful if at least one channel succeeded
            results.success = Object.values(results.channels).some(v => v === true)

            logger.info(`Notification sent: Type=${type}, User=${userId}, Channels=${JSON.stringify(results.channels)}`)

            return results
        } catch (error) {
            logger.error(`Failed to send notification (User: ${userId}, Type: ${type}): ${error}`)
            return results
        }
    }

    /**
     * Create in-app notification
     */
    private async createInAppNotification(params: {
        userId: number
        type: string
        title: string
        message: string
        data?: any
    }): Promise<boolean> {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: params.userId,
                    type: params.type,
                    title: params.title,
                    message: params.message,
                    read: false
                }
            })

            // Real-time broadcast
            import('../socket.js').then(({ socketService }) => {
                socketService.emitToUser(params.userId, 'notification', notification)
            })

            return true
        } catch (error) {
            logger.error(`Failed to create in-app notification: ${error}`)
            return false
        }
    }

    /**
     * Send email notification
     */
    private async sendEmailNotification(params: {
        user: any
        type: string
        title: string
        message: string
        data?: any
    }): Promise<boolean> {
        const { user, type, title, message, data } = params

        // Use specific email templates based on type
        switch (type) {
            case 'account_created':
                return emailService.sendWelcomeEmail({
                    to: user.email,
                    name: user.name || 'Utilisateur',
                    role: user.role
                })

            case 'password_reset':
                return emailService.sendPasswordResetEmail({
                    to: user.email,
                    name: user.name || 'Utilisateur',
                    resetToken: data?.resetToken || ''
                })

            case 'appointment_confirmation':
                if (data?.appointment) {
                    return emailService.sendAppointmentConfirmationEmail({
                        to: user.email,
                        patientName: user.name || 'Patient',
                        doctorName: data.appointment.doctorName,
                        specialty: data.appointment.specialty,
                        appointmentDate: data.appointment.date,
                        location: data.appointment.location
                    })
                }
                break

            case 'appointment_reminder':
                if (data?.appointment) {
                    return emailService.sendAppointmentReminderEmail({
                        to: user.email,
                        patientName: user.name || 'Patient',
                        doctorName: data.appointment.doctorName,
                        appointmentDate: data.appointment.date,
                        location: data.appointment.location
                    })
                }
                break

            default:
                // Generic email for other types
                return emailService.sendEmail({
                    to: user.email,
                    subject: title,
                    html: `<p>${message}</p>`,
                    text: message
                })
        }

        return false
    }

    /**
     * Send SMS notification
     */
    private async sendSMSNotification(params: {
        user: any
        type: string
        message: string
        data?: any
    }): Promise<boolean> {
        const { user, type, message, data } = params

        // Use specific SMS templates based on type
        switch (type) {
            case 'appointment_confirmation':
                if (data?.appointment) {
                    return smsService.sendAppointmentConfirmation({
                        to: user.phone,
                        patientName: user.name || 'Patient',
                        doctorName: data.appointment.doctorName,
                        appointmentDate: data.appointment.date,
                        location: data.appointment.location
                    })
                }
                break

            case 'appointment_reminder':
                if (data?.appointment) {
                    return smsService.sendAppointmentReminder({
                        to: user.phone,
                        patientName: user.name || 'Patient',
                        doctorName: data.appointment.doctorName,
                        appointmentDate: data.appointment.date,
                        location: data.appointment.location
                    })
                }
                break

            case 'appointment_cancellation':
                if (data?.appointment) {
                    return smsService.sendAppointmentCancellation({
                        to: user.phone,
                        patientName: user.name || 'Patient',
                        appointmentDate: data.appointment.date
                    })
                }
                break

            default:
                // Generic SMS for other types
                return smsService.sendSMS({
                    to: user.phone,
                    message
                })
        }

        return false
    }

    /**
     * Send push notification
     */
    private async sendPushNotification(params: {
        userId: number
        type: string
        title: string
        message: string
        data?: any
    }): Promise<boolean> {
        const { userId, type, title, message, data } = params

        switch (type) {
            case 'appointment_reminder':
                if (data?.appointment) {
                    return pushNotificationService.sendAppointmentReminderPush({
                        userId,
                        doctorName: data.appointment.doctorName,
                        appointmentDate: data.appointment.date,
                        location: data.appointment.location
                    })
                }
                break

            case 'prescription_ready':
                if (data?.doctorName) {
                    return pushNotificationService.sendPrescriptionReadyPush({
                        userId,
                        doctorName: data.doctorName
                    })
                }
                break

            case 'new_message':
                if (data?.sender && data?.preview) {
                    return pushNotificationService.sendNewMessagePush({
                        userId,
                        senderName: data.sender,
                        messagePreview: data.preview
                    })
                }
                break

            default:
                return pushNotificationService.sendPush({
                    userId,
                    title,
                    body: message,
                    data
                })
        }

        return false
    }

    /**
     * Send appointment confirmation notification
     */
    async sendAppointmentConfirmation(data: AppointmentNotificationData): Promise<void> {
        const { patientId, doctorId, appointmentDate, location } = data

        // Get patient and doctor details
        const [patient, doctor] = await Promise.all([
            prisma.patient.findUnique({
                where: { id: patientId },
                include: { User: true }
            }),
            prisma.doctor.findUnique({
                where: { id: doctorId }
            })
        ])

        if (!patient?.User || !doctor) {
            logger.error('Patient or doctor not found for appointment notification')
            return
        }

        const userId = patient.User.id

        await this.send({
            userId,
            type: 'appointment_confirmation',
            title: 'Rendez-vous confirmé',
            message: `Votre rendez-vous avec Dr. ${doctor.firstName} ${doctor.lastName} est confirmé`,
            channels: ['in_app', 'email', 'sms'],
            data: {
                appointment: {
                    doctorName: `${doctor.firstName} ${doctor.lastName}`,
                    specialty: doctor.specialty,
                    date: appointmentDate,
                    location
                }
            }
        })
    }

    /**
     * Schedule appointment reminder (24h before)
     */
    async scheduleAppointmentReminder(data: AppointmentNotificationData): Promise<void> {
        const { patientId, doctorId, appointmentDate, location } = data

        // Calculate reminder time (24 hours before)
        const reminderTime = new Date(appointmentDate)
        reminderTime.setHours(reminderTime.getHours() - 24)

        // Only schedule if appointment is more than 24h away
        if (reminderTime <= new Date()) {
            logger.info('Appointment is less than 24h away, skipping reminder scheduling')
            return
        }

        // Get patient and doctor details
        const [patient, doctor] = await Promise.all([
            prisma.patient.findUnique({
                where: { id: patientId },
                include: { User: true }
            }),
            prisma.doctor.findUnique({
                where: { id: doctorId }
            })
        ])

        if (!patient?.User || !doctor) {
            logger.error('Patient or doctor not found for appointment reminder')
            return
        }

        // Calculate delay
        const now = new Date()
        const delay = reminderTime.getTime() - now.getTime()

        // Use the background queue
        const { scheduleNotification } = await import('../queue.js')

        await scheduleNotification({
            userId: patient.User.id,
            type: 'appointment_reminder',
            title: 'Rappel de rendez-vous',
            message: `Rendez-vous demain avec Dr. ${doctor.firstName} ${doctor.lastName}`,
            channels: ['in_app', 'email', 'sms', 'push'],
            data: {
                appointment: {
                    doctorName: `${doctor.firstName} ${doctor.lastName}`,
                    specialty: doctor.specialty,
                    date: appointmentDate,
                    location
                }
            }
        }, delay)

        logger.info(`Appointment reminder queued for Patient ${patientId} (in ${Math.round(delay / 3600000)}h)`)
    }

    /**
     * Schedule a vaccination reminder
     */
    async scheduleVaccinationReminder(
        patientId: number,
        vaccineName: string,
        dueDate: Date
    ) {
        // Calculate reminder time (7 days before and 1 day before)
        const now = new Date()

        // Reminder 1: 3 days before
        const reminder1Date = new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000)
        if (reminder1Date > now) {
            const delay = reminder1Date.getTime() - now.getTime()
            await this.queueVaccinationReminder(patientId, vaccineName, dueDate, delay)
        }

        // Reminder 2: 1 day before
        const reminder2Date = new Date(dueDate.getTime() - 1 * 24 * 60 * 60 * 1000)
        if (reminder2Date > now) {
            const delay = reminder2Date.getTime() - now.getTime()
            await this.queueVaccinationReminder(patientId, vaccineName, dueDate, delay)
        }
    }

    private async queueVaccinationReminder(patientId: number, vaccineName: string, dueDate: Date, delay: number) {
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: { User: true }
        })

        if (!patient?.User) return

        const { scheduleNotification } = await import('../queue.js')

        await scheduleNotification({
            userId: patient.User.id,
            type: 'vaccination_reminder',
            title: 'Rappel de vaccination',
            message: `Votre vaccin "${vaccineName}" est prévu pour le ${dueDate.toLocaleDateString('fr-FR')}.`,
            channels: ['in_app', 'email', 'push'],
            data: { vaccineName, dueDate: dueDate.toISOString() }
        }, delay)
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: number, userId: number): Promise<boolean> {
        try {
            await prisma.notification.updateMany({
                where: {
                    id: notificationId,
                    userId
                },
                data: {
                    read: true
                }
            })
            return true
        } catch (error) {
            logger.error(`Failed to mark notification ${notificationId} as read: ${error}`)
            return false
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: number): Promise<boolean> {
        try {
            await prisma.notification.updateMany({
                where: {
                    userId,
                    read: false
                },
                data: {
                    read: true
                }
            })
            return true
        } catch (error) {
            logger.error(`Failed to mark all notifications as read for User ${userId}: ${error}`)
            return false
        }
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: number): Promise<number> {
        try {
            return await prisma.notification.count({
                where: {
                    userId,
                    read: false
                }
            })
        } catch (error) {
            logger.error(`Failed to get unread count for User ${userId}: ${error}`)
            return 0
        }
    }

    /**
     * Delete old notifications (older than 30 days)
     */
    async cleanupOldNotifications(): Promise<number> {
        try {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const result = await prisma.notification.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo
                    },
                    read: true
                }
            })

            logger.info(`Cleaned up ${result.count} old notifications`)
            return result.count
        } catch (error) {
            logger.error(`Failed to cleanup old notifications: ${error}`)
            return 0
        }
    }
}

// Singleton instance
export const notificationManager = new NotificationManager()
