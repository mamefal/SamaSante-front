import { IncomingWebhook } from '@slack/webhook'
import nodemailer from 'nodemailer'

const slackWebhook = process.env.SLACK_WEBHOOK_URL
    ? new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)
    : null

const transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
    : null

export const sendSlackAlert = async (title: string, message: string, severity: string) => {
    if (!slackWebhook) {
        console.warn('⚠️ Slack webhook not configured, skipping alert')
        return
    }

    try {
        await slackWebhook.send({
            text: `*${severity.toUpperCase()}* – ${title}\n${message}`,
        })
        console.log('✅ Slack alert sent successfully')
    } catch (error) {
        console.error('❌ Failed to send Slack alert:', error)
    }
}

export const sendEmailAlert = async (title: string, message: string, severity: string) => {
    if (!transporter) {
        console.warn('⚠️ SMTP not configured, skipping email alert')
        return
    }

    try {
        await transporter.sendMail({
            from: `"AMINA Alert" <${process.env.SMTP_FROM}>`,
            to: process.env.ALERT_RECIPIENTS?.split(',') ?? '',
            subject: `[${severity.toUpperCase()}] ${title}`,
            text: message,
        })
        console.log('✅ Email alert sent successfully')
    } catch (error) {
        console.error('❌ Failed to send email alert:', error)
    }
}
