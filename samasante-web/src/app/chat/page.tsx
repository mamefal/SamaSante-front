'use client'

import React, { useEffect, useState, useRef } from 'react'
import { chatService, Conversation, Message, User } from '@/lib/chat'
import {
    Send,
    Paperclip,
    Search,
    MoreVertical,
    Phone,
    Video,
    Info,
    Loader2
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Simulation user ID (to be replaced with auth context)
    const currentUserId = 1

    useEffect(() => {
        fetchConversations()
    }, [])

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.id)
        }
    }, [activeConversation])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleCall = (type: 'audio' | 'video') => {
        toast.info(`Appel ${type === 'audio' ? 'audio' : 'vidéo'} en cours...`, {
            description: "Fonctionnalité de télémédecine simulée."
        })
    }

    const handleInfo = () => {
        toast.info("Informations du patient", {
            description: "Dossier médical détaillé accessible via le portail médecin."
        })
    }

    const handleAttachment = () => {
        toast.info("Pièce jointe", {
            description: "Le sélecteur de fichiers s'ouvrira ici."
        })
    }

    const fetchConversations = async () => {
        try {
            const data = await chatService.getConversations()
            setConversations(data)
        } catch (error) {
            console.error('Failed to load conversations', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (id: number) => {
        try {
            const data = await chatService.getMessages(id)
            setMessages(data)
        } catch (error) {
            console.error('Failed to load messages', error)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputText.trim() || !activeConversation) return

        const tempId = Date.now()
        const tempMessage: Message = {
            id: tempId,
            content: inputText,
            senderId: currentUserId,
            conversationId: activeConversation.id,
            type: 'text',
            createdAt: new Date().toISOString()
        }

        setMessages([...messages, tempMessage])
        setInputText('')

        try {
            await chatService.sendMessage(activeConversation.id, tempMessage.content)
            // Refresh messages to get real ID and server timestamp
            fetchMessages(activeConversation.id)
        } catch (error) {
            console.error('Failed to send message', error)
            // Remove temp message on error or show error state
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants.find(p => p.userId !== currentUserId)?.user || {
            firstName: 'Utilisateur',
            lastName: 'Inconnu',
            id: 0,
            role: 'unknown'
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden border-t">
            {/* Sidebar - Conversation List */}
            <div className="w-1/3 border-r flex flex-col min-w-[300px]">
                <div className="p-4 border-b bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher une conversation..." className="pl-8 bg-white" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col">
                        {conversations.map((conv) => {
                            const otherUser = getOtherParticipant(conv)
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={cn(
                                        "flex items-start p-4 hover:bg-gray-50 transition-colors text-left border-b",
                                        activeConversation?.id === conv.id && "bg-blue-50 hover:bg-blue-50"
                                    )}
                                >
                                    <Avatar className="h-10 w-10 mt-1">
                                        <AvatarImage src={otherUser.avatar} />
                                        <AvatarFallback>{otherUser.firstName[0]}{otherUser.lastName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-3 flex-1 overflow-hidden">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-sm font-semibold truncate">
                                                {otherUser.firstName} {otherUser.lastName}
                                            </p>
                                            {conv.lastMessage && (
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate" title={conv.lastMessage?.content}>
                                            {conv.lastMessage?.content || "Nouvelle conversation"}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
                            <div className="flex items-center">
                                <div className="relative">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={getOtherParticipant(activeConversation).avatar} />
                                        <AvatarFallback>
                                            {getOtherParticipant(activeConversation).firstName[0]}
                                            {getOtherParticipant(activeConversation).lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-semibold">
                                        {getOtherParticipant(activeConversation).firstName} {getOtherParticipant(activeConversation).lastName}
                                    </h3>
                                    <p className="text-xs text-green-600 font-medium">En ligne</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleCall('audio')}><Phone className="h-5 w-5 text-gray-500" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleCall('video')}><Video className="h-5 w-5 text-gray-500" /></Button>
                                <Button variant="ghost" size="icon" onClick={handleInfo}><Info className="h-5 w-5 text-gray-500" /></Button>
                            </div>
                        </div>

                        {/* Messages List - Missing in previous versions */}
                        <div className="flex-1 p-4 bg-gray-50/50 overflow-y-auto">
                            <div className="space-y-4">
                                {messages.map((msg) => {
                                    const isMe = msg.senderId === currentUserId
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                                isMe
                                                    ? "ml-auto bg-primary text-primary-foreground"
                                                    : "bg-white border text-gray-900 shadow-sm"
                                            )}
                                        >
                                            {msg.content}
                                            <span className={cn("text-[10px] opacity-70", isMe ? "text-blue-100" : "text-gray-400")}>
                                                {format(new Date(msg.createdAt), 'HH:mm')}
                                            </span>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleAttachment}
                                    className="flex-shrink-0 text-gray-500 hover:text-gray-700"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </Button>

                                <div className="flex-1 relative">
                                    <Input
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Écrivez votre message..."
                                        className="pr-10 bg-gray-50 focus:bg-white transition-colors"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className={cn(
                                        "flex-shrink-0 transition-opacity",
                                        !inputText.trim() ? "opacity-50" : "opacity-100"
                                    )}
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50/30">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <div className="text-3xl text-gray-400">👋</div>
                        </div>
                        <p className="text-lg font-medium">Sélectionnez une conversation</p>
                        <p className="text-sm">pour commencer à discuter</p>
                    </div>
                )}
            </div>
        </div>
    )
}
