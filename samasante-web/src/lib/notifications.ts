import { api } from './api'

export interface Notification {
    id: number
    type: string
    title: string
    message: string
    channel: string // sms|email|push|in_app
    status: 'sent' | 'delivered' | 'failed' | 'read'
    createdAt: string
    metadata?: any
}

export interface NotificationPreferences {
    userId: number
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    appointmentReminders: boolean
    marketingEmails: boolean
}

export const notificationsService = {
    // Get user notifications
    getUserNotifications: async () => {
        const response = await api.get('/notifications')
        return response.data
    },

    // Mark as read
    markAsRead: async (id: number) => {
        const response = await api.put(`/notifications/${id}/read`, {})
        return response.data
    },

    // Mark all as read
    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all', {})
        return response.data
    },

    // Get preferences
    getPreferences: async () => {
        const response = await api.get('/notifications/preferences')
        return response.data
    },

    // Update preferences
    updatePreferences: async (data: Partial<NotificationPreferences>) => {
        const response = await api.put('/notifications/preferences', data)
        return response.data
    },

    // Test notification
    sendTest: async (channel: string) => {
        const response = await api.post('/notifications/test', { channel })
        return response.data
    }
}
