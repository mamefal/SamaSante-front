import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import { logger } from './logger.js'

export class SocketService {
    private io: Server | null = null

    initialize(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3001',
                methods: ['GET', 'POST'],
                credentials: true
            }
        })

        this.io.on('connection', (socket) => {
            const userId = socket.handshake.query.userId as string

            if (userId) {
                socket.join(`user:${userId}`)
                logger.info(`User ${userId} connected via WebSocket`)
            }

            socket.on('join_conversation', (conversationId: string) => {
                socket.join(`conversation:${conversationId}`)
                logger.info(`Socket ${socket.id} joined conversation ${conversationId}`)
            })

            socket.on('leave_conversation', (conversationId: string) => {
                socket.leave(`conversation:${conversationId}`)
                logger.info(`Socket ${socket.id} left conversation ${conversationId}`)
            })

            socket.on('disconnect', () => {
                logger.info(`Socket ${socket.id} disconnected`)
            })
        })

        logger.info('WebSocket service initialized')
    }

    emitToUser(userId: number | string, event: string, data: any) {
        if (!this.io) return
        this.io.to(`user:${userId}`).emit(event, data)
    }

    emitToConversation(conversationId: number | string, event: string, data: any) {
        if (!this.io) return
        this.io.to(`conversation:${conversationId}`).emit(event, data)
    }

    getIO() {
        return this.io
    }
}

export const socketService = new SocketService()
