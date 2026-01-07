"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    FileText,
    User,
    Clock,
    Loader2,
    ArrowRight,
    Activity,
    Heart,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { getUser } from "@/lib/auth"

type Appointment = {
    id: number
    start: string
    motive: string
    status: string
    doctor: {
        firstName: string
        lastName: string
        specialty: string
    }
}

export default function PatientDashboard() {
    const [loading, setLoading] = useState(true)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const user = getUser()

    const [tips, setTips] = useState<any[]>([])

    useEffect(() => {
        loadAppointments()
        loadTips()
    }, [])

    const loadAppointments = async () => {
        try {
            const res = await api.get("/appointments")
            setAppointments(res.data.slice(0, 5)) // Only show next 5 appointments
        } catch (error) {
            console.error("Error loading appointments:", error)
        } finally {
            setLoading(false)
        }
    }

    const loadTips = async () => {
        try {
            const res = await api.get("/health-tips")
            setTips(res.data)
        } catch (error) {
            console.error("Error loading tips:", error)
        }
    }

    const getStatusBadge = (status: string) => {
        const config = {
            booked: { label: "Confirmé", className: "bg-blue-100 text-blue-700" },
            completed: { label: "Terminé", className: "bg-green-100 text-green-700" },
            cancelled: { label: "Annulé", className: "bg-red-100 text-red-700" },
        }
        const statusConfig = config[status as keyof typeof config] || { label: status, className: "" }
        return (
            <Badge className={statusConfig.className}>
                {statusConfig.label}
            </Badge>
        )
    }

    const getTipIcon = (iconName: string) => {
        switch (iconName) {
            case 'droplet': return Activity
            case 'activity': return Activity
            case 'moon': return Clock
            case 'alert-circle': return Activity
            case 'heart': return Heart
            default: return Activity
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Bienvenue, {user?.email?.split('@')[0]}</h1>
                <p className="text-muted-foreground mt-1">
                    Gérez vos rendez-vous et consultez votre dossier médical
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Prochains RDV
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {appointments.filter(a => a.status === 'booked').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Rendez-vous confirmés
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Consultations
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {appointments.filter(a => a.status === 'completed').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Consultations terminées
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Dossier Médical
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Complet</div>
                        <p className="text-xs text-muted-foreground">
                            Dernière mise à jour récente
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Santé
                        </CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Bon</div>
                        <p className="text-xs text-muted-foreground">
                            État général
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Upcoming Appointments */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Prochains Rendez-vous</CardTitle>
                                <CardDescription>
                                    Vos rendez-vous à venir
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/patient/appointments">
                                    Voir tout
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {appointments.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Aucun rendez-vous</h3>
                                <p className="text-muted-foreground mt-2">
                                    Vous n&apos;avez pas de rendez-vous programmés
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href="/patient/search">
                                        Prendre rendez-vous
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {appointment.doctor.specialty}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {appointment.motive}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4" />
                                                {new Date(appointment.start).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            {getStatusBadge(appointment.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions Rapides</CardTitle>
                        <CardDescription>
                            Accès rapide aux fonctionnalités
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/patient/search">
                                <Calendar className="mr-2 h-4 w-4" />
                                Prendre un rendez-vous
                            </Link>
                        </Button>
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/patient/medical-record">
                                <FileText className="mr-2 h-4 w-4" />
                                Mon dossier médical
                            </Link>
                        </Button>
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/patient/profile">
                                <User className="mr-2 h-4 w-4" />
                                Mon profil
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Health Tips */}
                <Card>
                    <CardHeader>
                        <CardTitle>Conseils Santé</CardTitle>
                        <CardDescription>
                            Recommandations pour votre bien-être
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {tips.length > 0 ? tips.map((tip, i) => {
                            const Icon = getTipIcon(tip.icon)
                            return (
                                <div key={i} className="flex gap-3">
                                    <div className={`h-8 w-8 rounded-full bg-${tip.color}-100 flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`h-4 w-4 text-${tip.color}-600`} />
                                    </div>
                                    <div>
                                        <p className="font-medium">{tip.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {tip.content}
                                        </p>
                                    </div>
                                </div>
                            )
                        }) : (
                            <p className="text-sm text-muted-foreground">Chargement des conseils...</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
