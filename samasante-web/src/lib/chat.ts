import { api } from './api'

export interface User {
    id: number
    firstName: string
    lastName: string
    role: string
    avatar?: string
}

export interface Message {
    id: number
    content: string
    senderId: number
    conversationId: number
    type: 'text' | 'image' | 'file'
    fileUrl?: string
    createdAt: string
    readAt?: string
    sender?: User
}

export interface Conversation {
    id: number
    type: 'consultation' | 'support' | 'general'
    organizationId: number
    status: 'active' | 'archived'
    participants: {
        user: User
        userId: number
    }[]
    messages: Message[]
    lastMessage?: Message
    updatedAt: string
}

export const chatService = {
    getConversations: async () => {
        const response = await api.get('/chat/conversations')
        return response.data
    },

    getMessages: async (conversationId: number) => {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`)
        return response.data
    },

    sendMessage: async (conversationId: number, content: string, type: 'text' | 'image' | 'file' = 'text', fileUrl?: string) => {
        const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
            content,
            type,
            fileUrl
        })
        return response.data
    },

    createConversation: async (participantId: number, type: string = 'general') => {
        const response = await api.post('/chat/conversations', {
            participantId,
            type
        })
        return response.data
    },

    markAsRead: async (conversationId: number) => {
        const response = await api.put(`/chat/conversations/${conversationId}/read`, {})
        return response.data
    }
}
