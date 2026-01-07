import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { logger } from '../logger.js'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: {
    name: string
    email: string
  }
}

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    path?: string
    content?: string | Buffer
  }>
}

export class EmailService {
  private transporter: Transporter | null = null
  private config: EmailConfig | null = null
  private enabled: boolean = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const fromEmail = process.env.SMTP_FROM_EMAIL || user
    const fromName = process.env.SMTP_FROM_NAME || 'AMINA'

    if (!host || !port || !user || !pass) {
      logger.warn('Email service not configured - missing SMTP credentials')
      this.enabled = false
      return
    }

    this.config = {
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: { user, pass },
      from: { name: fromName, email: fromEmail || 'noreply@samasante.sn' }
    }

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth
    })

    this.enabled = true
    logger.info('Email service initialized successfully')
  }

  /**
   * Send email
   */
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    if (!this.enabled || !this.transporter || !this.config) {
      logger.warn('Email service not enabled - skipping email send')
      return false
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.email}>`,
        to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
        attachments: params.attachments
      })

      logger.info(`Email sent successfully to ${params.to} (MessageID: ${info.messageId})`)

      return true
    } catch (error) {
      logger.error(`Failed to send email to ${params.to}: ${error}`)
      return false
    }
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(params: {
    to: string
    name: string
    role: string
  }): Promise<boolean> {
    const { to, name, role } = params

    const roleText = {
      PATIENT: 'patient',
      DOCTOR: 'médecin',
      HOSPITAL_ADMIN: 'administrateur hospitalier',
      SUPER_ADMIN: 'super administrateur'
    }[role] || 'utilisateur'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue sur AMINA! 🏥</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${name}</strong>,</p>
            
            <p>Nous sommes ravis de vous accueillir sur AMINA en tant que <strong>${roleText}</strong>.</p>
            
            <p>Votre compte a été créé avec succès. Vous pouvez maintenant:</p>
            <ul>
              ${role === 'PATIENT' ? `
                <li>Prendre rendez-vous avec des médecins</li>
                <li>Consulter votre dossier médical</li>
                <li>Recevoir vos prescriptions en ligne</li>
              ` : ''}
              ${role === 'DOCTOR' ? `
                <li>Gérer vos disponibilités</li>
                <li>Consulter vos rendez-vous</li>
                <li>Créer des prescriptions et certificats</li>
              ` : ''}
              ${role === 'HOSPITAL_ADMIN' ? `
                <li>Gérer les médecins de votre établissement</li>
                <li>Suivre les statistiques</li>
                <li>Gérer les équipements et départements</li>
              ` : ''}
            </ul>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/auth/login" class="button">Se connecter maintenant</a>
            </center>
            
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>L'équipe AMINA</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AMINA - Votre santé, notre priorité</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to,
      subject: 'Bienvenue sur AMINA! 🎉',
      html,
      text: `Bonjour ${name}, bienvenue sur AMINA en tant que ${roleText}!`
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(params: {
    to: string
    name: string
    resetToken: string
  }): Promise<boolean> {
    const { to, name, resetToken } = params
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réinitialisation de mot de passe 🔒</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${name}</strong>,</p>
            
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte AMINA.</p>
            
            <p>Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous:</p>
            
            <center>
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </center>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>Ce lien expire dans <strong>1 heure</strong></li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Ne partagez jamais ce lien avec personne</li>
              </ul>
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${resetUrl}</p>
            
            <p>Cordialement,<br>L'équipe AMINA</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AMINA - Votre santé, notre priorité</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to,
      subject: 'Réinitialisation de votre mot de passe AMINA',
      html,
      text: `Bonjour ${name}, cliquez sur ce lien pour réinitialiser votre mot de passe: ${resetUrl}`
    })
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmationEmail(params: {
    to: string
    patientName: string
    doctorName: string
    specialty: string
    appointmentDate: Date
    location: string
  }): Promise<boolean> {
    const { to, patientName, doctorName, specialty, appointmentDate, location } = params

    const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const formattedTime = appointmentDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-card { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .info-row { display: flex; margin: 10px 0; }
          .info-label { font-weight: bold; min-width: 120px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Rendez-vous confirmé</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${patientName}</strong>,</p>
            
            <p>Votre rendez-vous a été confirmé avec succès!</p>
            
            <div class="appointment-card">
              <h3 style="margin-top: 0;">Détails du rendez-vous</h3>
              <div class="info-row">
                <span class="info-label">👨‍⚕️ Médecin:</span>
                <span>Dr. ${doctorName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🏥 Spécialité:</span>
                <span>${specialty}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Date:</span>
                <span>${formattedDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🕐 Heure:</span>
                <span>${formattedTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📍 Lieu:</span>
                <span>${location}</span>
              </div>
            </div>
            
            <p><strong>💡 Conseils:</strong></p>
            <ul>
              <li>Arrivez 10 minutes avant l'heure du rendez-vous</li>
              <li>Apportez vos documents médicaux pertinents</li>
              <li>Vous recevrez un rappel 24h avant le rendez-vous</li>
            </ul>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/patient/appointments" class="button">Voir mes rendez-vous</a>
            </center>
            
            <p>Cordialement,<br>L'équipe AMINA</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AMINA - Votre santé, notre priorité</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to,
      subject: `Rendez-vous confirmé - Dr. ${doctorName} - ${formattedDate}`,
      html
    })
  }

  /**
   * Send appointment reminder email (24h before)
   */
  async sendAppointmentReminderEmail(params: {
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
      day: 'numeric'
    })

    const formattedTime = appointmentDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reminder-box { background: #fff3cd; border: 2px solid #ff9800; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Rappel de rendez-vous</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${patientName}</strong>,</p>
            
            <div class="reminder-box">
              <h2 style="margin-top: 0; color: #ff9800;">Rendez-vous demain!</h2>
              <p style="font-size: 18px; margin: 10px 0;">
                <strong>Dr. ${doctorName}</strong><br>
                ${formattedDate} à ${formattedTime}<br>
                📍 ${location}
              </p>
            </div>
            
            <p>N'oubliez pas d'apporter:</p>
            <ul>
              <li>Votre carte d'identité</li>
              <li>Vos documents médicaux</li>
              <li>Votre carte de mutuelle (si applicable)</li>
            </ul>
            
            <p>En cas d'empêchement, merci d'annuler votre rendez-vous au moins 2 heures à l'avance.</p>
            
            <p>À demain!<br>L'équipe AMINA</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AMINA - Votre santé, notre priorité</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to,
      subject: `⏰ Rappel: Rendez-vous demain avec Dr. ${doctorName}`,
      html
    })
  }

  /**
   * Check if email service is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) return false

    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      logger.error(`SMTP connection verification failed: ${error}`)
      return false
    }
  }
}

// Singleton instance
export const emailService = new EmailService()
