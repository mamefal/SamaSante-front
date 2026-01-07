'use client'

import React, { useEffect, useState } from 'react'
import {
    notificationsService,
    Notification,
    NotificationPreferences
} from '@/lib/notifications'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
    Bell,
    Mail,
    MessageSquare,
    Smartphone,
    CheckCheck,
    Settings,
    Loader2,
    Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [notifs, prefs] = await Promise.all([
                notificationsService.getUserNotifications(),
                notificationsService.getPreferences()
            ])
            setNotifications(notifs)
            setPreferences(prefs)
        } catch (error) {
            console.error('Failed to load notifications', error)
            // Mock preferences if backend fails (dev mode)
            setPreferences({
                userId: 1,
                emailEnabled: true,
                smsEnabled: true,
                pushEnabled: false,
                appointmentReminders: true,
                marketingEmails: false
            } as any)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: number) => {
        try {
            await notificationsService.markAsRead(id)
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, status: 'read' } : n
            ))
        } catch (error) {
            console.error('Failed to mark as read', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead()
            setNotifications(notifications.map(n => ({ ...n, status: 'read' })))
        } catch (error) {
            console.error('Failed to mark all as read', error)
        }
    }

    const togglePreference = async (key: keyof NotificationPreferences) => {
        if (!preferences) return
        const newValue = !preferences[key]
        const newPrefs = { ...preferences, [key]: newValue }
        setPreferences(newPrefs)

        try {
            await notificationsService.updatePreferences({ [key]: newValue })
        } catch (error) {
            console.error('Failed to update preference', error)
            // Revert on error
            setPreferences(preferences)
        }
    }

    const testChannel = async (channel: string) => {
        try {
            await notificationsService.sendTest(channel)
            alert(`Test ${channel} envoyé !`)
        } catch (error) {
            console.error('Test failed', error)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const unreadCount = notifications.filter(n => n.status !== 'read').length

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">Gérez vos alertes et préférences.</p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={markAllAsRead}>
                        <CheckCheck className="mr-2 h-4 w-4" /> Tout marquer comme lu
                    </Button>
                )}
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list" className="relative">
                        <Bell className="mr-2 h-4 w-4" /> Liste
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                {unreadCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="preferences">
                        <Settings className="mr-2 h-4 w-4" /> Préférences
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dernières Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`flex items-start justify-between p-4 border rounded-lg transition-colors ${notif.status !== 'read' ? 'bg-blue-50/50 border-blue-100' : 'bg-white'}`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className={`p-2 rounded-full ${notif.status !== 'read' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                {notif.channel === 'sms' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                                                {notif.channel === 'email' && <Mail className="h-5 w-5 text-purple-600" />}
                                                {notif.channel === 'in_app' && <Bell className="h-5 w-5 text-orange-600" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className={`text-sm font-medium leading-none ${notif.status !== 'read' ? 'text-black' : 'text-gray-600'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {format(new Date(notif.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                                </p>
                                            </div>
                                        </div>
                                        {notif.status !== 'read' && (
                                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>
                                                Marquer comme lu
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {notifications.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Aucune notification pour le moment.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Canaux de Communication</CardTitle>
                            <CardDescription>Choisissez comment vous souhaitez être contacté.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2 border-b pb-4">
                                <div className="flex items-center space-x-4">
                                    <Mail className="h-6 w-6 text-gray-500" />
                                    <Label htmlFor="email" className="flex flex-col space-y-1">
                                        <span>Emails</span>
                                        <span className="font-normal text-xs text-muted-foreground">Notifications par email</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => testChannel('email')}>Tester</Button>
                                    <Switch
                                        id="email"
                                        checked={preferences?.emailEnabled}
                                        onCheckedChange={() => togglePreference('emailEnabled')}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between space-x-2 border-b pb-4">
                                <div className="flex items-center space-x-4">
                                    <MessageSquare className="h-6 w-6 text-gray-500" />
                                    <Label htmlFor="sms" className="flex flex-col space-y-1">
                                        <span>SMS</span>
                                        <span className="font-normal text-xs text-muted-foreground">Alertes urgentes sur mobile</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => testChannel('sms')}>Tester</Button>
                                    <Switch
                                        id="sms"
                                        checked={preferences?.smsEnabled}
                                        onCheckedChange={() => togglePreference('smsEnabled')}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex items-center space-x-4">
                                    <Smartphone className="h-6 w-6 text-gray-500" />
                                    <Label htmlFor="push" className="flex flex-col space-y-1">
                                        <span>Notifications Push</span>
                                        <span className="font-normal text-xs text-muted-foreground">Alertes sur application mobile</span>
                                    </Label>
                                </div>
                                <Switch
                                    id="push"
                                    checked={preferences?.pushEnabled}
                                    onCheckedChange={() => togglePreference('pushEnabled')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Types de Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="reminders" className="flex flex-col space-y-1">
                                    <span>Rappels de Rendez-vous</span>
                                    <span className="font-normal text-xs text-muted-foreground">Recevoir des rappels avant vos consultations</span>
                                </Label>
                                <Switch
                                    id="reminders"
                                    checked={preferences?.appointmentReminders}
                                    onCheckedChange={() => togglePreference('appointmentReminders')}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="marketing" className="flex flex-col space-y-1">
                                    <span>Offres & Actualités</span>
                                    <span className="font-normal text-xs text-muted-foreground">Recevoir des informations sur nos services</span>
                                </Label>
                                <Switch
                                    id="marketing"
                                    checked={preferences?.marketingEmails}
                                    onCheckedChange={() => togglePreference('marketingEmails')}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
