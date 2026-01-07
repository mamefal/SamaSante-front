import twilio from 'twilio'
import { logger } from '../logger.js'

interface SMSConfig {
    accountSid: string
    authToken: string
    fromNumber: string
    messagingServiceSid?: string
}

interface SendSMSParams {
    to: string
    message: string
    scheduledFor?: Date
}

export class SMSService {
    private client: twilio.Twilio | null = null
    private config: SMSConfig | null = null
    private enabled: boolean = false

    constructor() {
        this.initialize()
    }

    private initialize() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const fromNumber = process.env.TWILIO_PHONE_NUMBER
        const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

        if (!accountSid || !authToken || !fromNumber) {
            logger.warn('SMS service not configured - missing Twilio credentials')
            this.enabled = false
            return
        }

        this.config = {
            accountSid,
            authToken,
            fromNumber,
            messagingServiceSid
        }

        this.client = twilio(accountSid, authToken)
        this.enabled = true
        logger.info('SMS service initialized successfully')
    }

    /**
     * Send SMS to a phone number
     * Handles Senegalese phone number format (+221...)
     */
    async sendSMS({ to, message, scheduledFor }: SendSMSParams): Promise<boolean> {
        if (!this.enabled || !this.client || !this.config) {
            logger.warn('SMS service not enabled - skipping SMS send')
            return false
        }

        try {
            // Normalize phone number for Senegal
            const normalizedPhone = this.normalizePhoneNumber(to)

            if (!normalizedPhone) {
                logger.error(`Invalid phone number format: ${to}`)
                return false
            }

            const params: any = {
                body: message,
                to: normalizedPhone
            }

            // Use Messaging Service SID if available (highly recommended for scheduling)
            if (this.config.messagingServiceSid) {
                params.messagingServiceSid = this.config.messagingServiceSid
            } else {
                params.from = this.config.fromNumber
            }

            // Schedule SMS if needed
            if (scheduledFor) {
                // If scheduling, Twilio REQUIRE a MessagingServiceSid or a specific from number that supports it
                params.sendAt = scheduledFor
                params.scheduleType = 'fixed'
            }

            const result = await this.client.messages.create(params)

            logger.info(`SMS sent successfully to ${normalizedPhone} (SID: ${result.sid}, Status: ${result.status})`)

            return true
        } catch (error) {
            logger.error(`Failed to send SMS to ${to}: ${error}`)
            return false
        }
    }

    /**
     * Send appointment reminder SMS
     */
    async sendAppointmentReminder(params: {
        to: string
        patientName: string
        doctorName: string
        appointmentDate: Date
        location: string
    }): Promise<boolean> {
        const { to, patientName, doctorName, appointmentDate, location } = params

        const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })

        const message = `Bonjour ${patientName},\n\nRappel de rendez-vous:\nDr. ${doctorName}\n${formattedDate}\nLieu: ${location}\n\nMerci de confirmer votre présence.\n\nAMINA`

        // Send 24 hours before appointment
        const reminderTime = new Date(appointmentDate)
        reminderTime.setHours(reminderTime.getHours() - 24)

        return this.sendSMS({
            to,
            message,
            scheduledFor: reminderTime > new Date() ? reminderTime : undefined
        })
    }

    /**
     * Send appointment confirmation SMS
     */
    async sendAppointmentConfirmation(params: {
        to: string
        patientName: string
        doctorName: string
        appointmentDate: Date
        location: string
    }): Promise<boolean> {
        const { to, patientName, doctorName, appointmentDate, location } = params

        const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })

        const message = `Bonjour ${patientName},\n\nVotre rendez-vous est confirmé:\nDr. ${doctorName}\n${formattedDate}\nLieu: ${location}\n\nÀ bientôt!\n\nAMINA`

        return this.sendSMS({ to, message })
    }

    /**
     * Send appointment cancellation SMS
     */
    async sendAppointmentCancellation(params: {
        to: string
        patientName: string
        appointmentDate: Date
    }): Promise<boolean> {
        const { to, patientName, appointmentDate } = params

        const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })

        const message = `Bonjour ${patientName},\n\nVotre rendez-vous du ${formattedDate} a été annulé.\n\nPour reprendre rendez-vous, connectez-vous à AMINA.\n\nCordialement,\nAMINA`

        return this.sendSMS({ to, message })
    }

    /**
     * Send OTP/verification code
     */
    async sendVerificationCode(params: {
        to: string
        code: string
        expiryMinutes?: number
    }): Promise<boolean> {
        const { to, code, expiryMinutes = 10 } = params

        const message = `Votre code de vérification AMINA est: ${code}\n\nCe code expire dans ${expiryMinutes} minutes.\n\nNe partagez ce code avec personne.`

        return this.sendSMS({ to, message })
    }

    /**
     * Normalize phone number to international format
     * Handles Senegalese numbers (+221...)
     */
    private normalizePhoneNumber(phone: string): string | null {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '')

        // If starts with 221 (Senegal country code), add +
        if (cleaned.startsWith('221')) {
            return `+${cleaned}`
        }

        // If starts with 0, replace with +221
        if (cleaned.startsWith('0')) {
            return `+221${cleaned.substring(1)}`
        }

        // If 9 digits (local Senegal number), add +221
        if (cleaned.length === 9) {
            return `+221${cleaned}`
        }

        // If already has country code without +
        if (cleaned.length >= 10) {
            return `+${cleaned}`
        }

        return null
    }

    /**
     * Check if SMS service is enabled
     */
    isEnabled(): boolean {
        return this.enabled
    }
}

// Singleton instance
export const smsService = new SMSService()
