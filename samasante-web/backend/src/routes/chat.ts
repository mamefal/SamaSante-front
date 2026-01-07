import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

export const chat = new Hono<HonoEnv>()

// ============================================
// CONVERSATIONS
// ============================================

/**
 * GET /conversations
 * Liste des conversations de l'utilisateur
 */
chat.get('/conversations',
    requireAuth(['DOCTOR', 'PATIENT', 'HOSPITAL_ADMIN']),
    async (c) => {
        const user = c.get('user') as any

        try {
            const conversations = await prisma.conversation.findMany({
                where: {
                    participants: {
                        some: {
                            userId: user.id
                        }
                    },
                    isArchived: false
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                }
                            }
                        }
                    },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    appointment: {
                        select: {
                            id: true,
                            start: true,
                            motive: true
                        }
                    }
                },
                orderBy: {
                    lastMessageAt: 'desc'
                }
            })

            // Calculer le nombre de messages non lus pour chaque conversation
            const conversationsWithUnread = await Promise.all(
                conversations.map(async (conv) => {
                    const participant = conv.participants.find(p => p.userId === user.id)
                    const unreadCount = await prisma.message.count({
                        where: {
                            conversationId: conv.id,
                            createdAt: {
                                gt: participant?.lastReadAt || new Date(0)
                            },
                            senderId: {
                                not: user.id
                            }
                        }
                    })

                    return {
                        ...conv,
                        unreadCount,
                        lastMessage: conv.messages[0] || null
                    }
                })
            )

            return c.json(conversationsWithUnread)
        } catch (error) {
            console.error('Failed to fetch conversations:', error)
            return c.json({ error: 'Erreur lors de la récupération des conversations' }, 500)
        }
    }
)

/**
 * POST /conversations
 * Créer une nouvelle conversation
 */
const CreateConversationSchema = z.object({
    type: z.enum(['direct', 'group', 'consultation']),
    title: z.string().optional(),
    participantIds: z.array(z.number()),
    appointmentId: z.number().optional()
})

chat.post('/conversations',
    requireAuth(['DOCTOR', 'PATIENT', 'HOSPITAL_ADMIN']),
    zValidator('json', CreateConversationSchema),
    async (c) => {
        const user = c.get('user') as any
        const { type, title, participantIds, appointmentId } = c.req.valid('json')

        try {
            // Vérifier si une conversation directe existe déjà
            if (type === 'direct' && participantIds.length === 1) {
                const existingConv = await prisma.conversation.findFirst({
                    where: {
                        type: 'direct',
                        participants: {
                            every: {
                                userId: {
                                    in: [user.id, participantIds[0]]
                                }
                            }
                        }
                    },
                    include: {
                        participants: true
                    }
                })

                if (existingConv && existingConv.participants.length === 2) {
                    return c.json(existingConv)
                }
            }

            // Créer la conversation
            const conversation = await prisma.conversation.create({
                data: {
                    type,
                    title,
                    appointmentId,
                    participants: {
                        create: [
                            { userId: user.id, role: 'admin' },
                            ...participantIds.map(id => ({ userId: id, role: 'member' }))
                        ]
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                }
                            }
                        }
                    }
                }
            })

            return c.json(conversation, 201)
        } catch (error) {
            console.error('Failed to create conversation:', error)
            return c.json({ error: 'Erreur lors de la création de la conversation' }, 500)
        }
    }
)

/**
 * GET /conversations/:id
 * Détails d'une conversation
 */
chat.get('/conversations/:id',
    requireAuth(['DOCTOR', 'PATIENT', 'HOSPITAL_ADMIN']),
    async (c) => {
        const user = c.get('user') as any
        const conversationId = parseInt(c.req.param('id'))

        try {
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: {
                        some: {
                            userId: user.id
                        }
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                }
                            }
                        }
                    },
                    appointment: true
                }
            })

            if (!conversation) {
                return c.json({ error: 'Conversation non trouvée' }, 404)
            }

            return c.json(conversation)
        } catch (error) {
            console.error('Failed to fetch conversation:', error)
            return c.json({ error: 'Erreur lors de la récupération de la conversation' }, 500)
        }
    }
)

// ============================================
// MESSAGES
// ============================================

/**
 * GET /conversations/:id/messages
 * Messages d'une conversation
 */
chat.get('/conversations/:id/messages',
    requireAuth(['DOCTOR', 'PATIENT', 'HOSPITAL_ADMIN']),
    async (c) => {
        const user = c.get('user') as any
        const conversationId = parseInt(c.req.param('id'))
        const limit = parseInt(c.req.query('limit') || '50')
        const before = c.req.query('before') // cursor-based pagination

        try {
            // Vérifier que l'utilisateur est participant
            const participant = await prisma.conversationParticipant.findFirst({
                where: {
                    conversationId,
                    userId: user.id
                }
            })

            if (!participant) {
                return c.json({ error: 'Accès refusé' }, 403)
            }

            const messages = await prisma.message.findMany({
                where: {
                    conversationId,
                    ...(before && {
                        createdAt: {
                            lt: new Date(before)
                        }
                    })
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            role: true
                        }
                    },
                    attachments: true,
                    replyTo: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            })

            return c.json(messages.reverse())
        } catch (error) {
            console.error('Failed to fetch messages:', error)
            return c.json({ error: 'Erreur lors de la récupération des messages' }, 500)
        }
    }
)

/**
 * POST /conversations/:id/messages
 * Envoyer un message
 */
const SendMessageSchema = z.object({
    content: z.string().min(1),
    type: z.enum(['text', 'image', 'file', 'system']).default('text'),
    replyToId: z.number().optional(),
    attachments: z.array(z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        thumbnailUrl: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional()
    })).optional()
})

chat.post('/conversations/:id/messages',
    requireAuth(['DOCTOR', 'PATIENT', 'HOSPITAL_ADMIN']),
    zValidator('json', SendMessageSchema),
    async (c) => {
        const user = c.get('user') as any
        const conversationId = parseInt(c.req.param('id'))
        const { content, type, replyToId, attachments } = c.req.valid('json')

        try {
            // Vérifier que l'utilisateur est participant
            const participant = await prisma.conversationParticipant.findFirst({
                where: {
                    conversationId,
                    userId: user.id
                }
            })

            if (!participant) {
                return c.json({ error: 'Accès refusé' }, 403)
            }

            // Créer le message
            const message = await prisma.message.create({
                data: {
                    conversationId,
                    senderId: user.id,
                    content,
                    type,
                    replyToId,
                    attachments: attachments ? {
                        create: attachments
                    } : undefined
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            role: true
                        }
                    },
                    attachments: true,
                    replyTo: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            })

            // Mettre à jour lastMessageAt de la conversation
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { lastMessageAt: new Date() }
            })

            // WebSocket broadcast pour temps réel
            import('../lib/socket.js').then(({ socketService }) => {
                socketService.emitToConversation(conversationId, 'new_message', message)

                // Also notify participants who are not in the conversation rooms
                // This can be used for global unread count updates
                prisma.conversationParticipant.findMany({
                    where: { conversationId, userId: { not: user.id } },
                    select: { userId: true }
                }).then(participants => {
                    participants.forEach(p => {
                        socketService.emitToUser(p.userId, 'message_notification', {
                            conversationId,
                            senderName: user.name,
                            content: message.content
                        })
                    })
                })
            })

            return c.json(message, 201)
        } catch (error) {
            console.error('Failed to send message:', error)
            return c.json({ error: 'Erreur lors de l\'envoi du message' }, 500)
        }
    }
)

/**
 * PUT /conversations/:id/read
 * Marquer les messages comme lus
 */
chat.put('/conversations/:id/read',
    requireAuth(['DOCTOR', 'PATIENT', 'HOSPITAL_ADMIN']),
    async (c) => {
        const user = c.get('user') as any
        const conversationId = parseInt(c.req.param('id'))

        try {
            await prisma.conversationParticipant.updateMany({
                where: {
                    conversationId,
                    userId: user.id
                },
                data: {
                    lastReadAt: new Date()
                }
            })

            return c.json({ success: true })
        } catch (error) {
            console.error('Failed to mark as read:', error)
            return c.json({ error: 'Erreur lors de la mise à jour' }, 500)
        }
    }
)

/**
 * DELETE /messages/:id
 * Supprimer un message
 */
chat.delete('/messages/:id',
    requireAuth(['DOCTOR', 'PATIENT', 'HOSPITAL_ADMIN']),
    async (c) => {
        const user = c.get('user') as any
        const messageId = parseInt(c.req.param('id'))

        try {
            const message = await prisma.message.findUnique({
                where: { id: messageId }
            })

            if (!message) {
                return c.json({ error: 'Message non trouvé' }, 404)
            }

            if (message.senderId !== user.id) {
                return c.json({ error: 'Accès refusé' }, 403)
            }

            // Soft delete
            await prisma.message.update({
                where: { id: messageId },
                data: {
                    isDeleted: true,
                    content: 'Message supprimé'
                }
            })

            return c.json({ success: true })
        } catch (error) {
            console.error('Failed to delete message:', error)
            return c.json({ error: 'Erreur lors de la suppression' }, 500)
        }
    }
)

/**
 * PUT /messages/:id
 * Modifier un message
 */
const EditMessageSchema = z.object({
    content: z.string().min(1)
})

chat.put('/messages/:id',
    requireAuth(['DOCTOR', 'PATIENT', 'HOSPITAL_ADMIN']),
    zValidator('json', EditMessageSchema),
    async (c) => {
        const user = c.get('user') as any
        const messageId = parseInt(c.req.param('id'))
        const { content } = c.req.valid('json')

        try {
            const message = await prisma.message.findUnique({
                where: { id: messageId }
            })

            if (!message) {
                return c.json({ error: 'Message non trouvé' }, 404)
            }

            if (message.senderId !== user.id) {
                return c.json({ error: 'Accès refusé' }, 403)
            }

            const updated = await prisma.message.update({
                where: { id: messageId },
                data: {
                    content,
                    isEdited: true
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            role: true
                        }
                    },
                    attachments: true
                }
            })

            return c.json(updated)
        } catch (error) {
            console.error('Failed to edit message:', error)
            return c.json({ error: 'Erreur lors de la modification' }, 500)
        }
    }
)

export default chat
