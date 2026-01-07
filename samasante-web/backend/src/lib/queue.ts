import { Queue, Worker, Job } from 'bullmq'
import { redis } from './cache.js'
import { logger } from './logger.js'

// Interface for notification jobs
interface NotificationJobData {
    userId: number
    type: string
    title: string
    message: string
    channels: string[]
    data?: any
}

// Create the notification queue
export const notificationQueue = new Queue('notifications', {
    connection: redis
})

// Initialize the worker
export const setupNotificationWorker = () => {
    const worker = new Worker('notifications', async (job: Job<NotificationJobData>) => {
        logger.info(`Processing background notification job ${job.id} for user ${job.data.userId}`)

        try {
            // Lazy import to avoid circular dependencies
            const { notificationManager } = await import('./notifications/manager.js')

            await notificationManager.send({
                userId: job.data.userId,
                type: job.data.type as any,
                title: job.data.title,
                message: job.data.message,
                channels: job.data.channels as any,
                data: job.data.data
            })

            logger.info(`Notification job ${job.id} completed successfully`)
        } catch (error) {
            logger.error(`Failed to process notification job ${job.id}: ${error}`)
            throw error // BullMQ will handle retries if configured
        }
    }, {
        connection: redis
    })

    worker.on('failed', (job, err) => {
        logger.error(`Job ${job?.id} failed: ${err.message}`)
    })

    logger.info('Notification worker initialized')
    return worker
}

/**
 * Schedule a notification
 * @param delay Delay in milliseconds
 */
export async function scheduleNotification(data: NotificationJobData, delay: number) {
    return notificationQueue.add('send-notification', data, {
        delay,
        removeOnComplete: true,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    })
}
