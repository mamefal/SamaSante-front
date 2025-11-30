"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Bell,
    AlertCircle,
    CheckCircle,
    Clock,
    Filter,
    Check,
    Trash2,
    Info,
    MoreHorizontal
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Alert {
    id: number
    type: "urgent" | "warning" | "info"
    title: string
    message: string
    createdAt: string
    read: boolean
}

export default function HospitalAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([
        {
            id: 1,
            type: "urgent",
            title: "Urgence - Salle d'opération 3",
            message: "Équipement défaillant détecté lors du test pré-opératoire. Intervention technique requise immédiatement.",
            createdAt: new Date().toISOString(),
            read: false
        },
        {
            id: 2,
            type: "warning",
            title: "Stock médicaments faible",
            message: "Le stock de Paracétamol 500mg a atteint le seuil critique (moins de 50 boîtes).",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            read: false
        },
        {
            id: 3,
            type: "info",
            title: "Nouveau patient admis",
            message: "Patient Aminata Touré admise en Cardiologie - Chambre 205.",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            read: false
        },
        {
            id: 4,
            type: "warning",
            title: "Rendez-vous en attente",
            message: "12 rendez-vous nécessitent une confirmation manuelle dans le système.",
            createdAt: new Date(Date.now() - 10800000).toISOString(),
            read: true
        }
    ])

    const [filter, setFilter] = useState<"all" | "urgent" | "warning" | "info">("all")

    const getAlertIcon = (type: string) => {
        switch (type) {
            case "urgent":
                return <AlertCircle className="h-6 w-6 text-red-600" />
            case "warning":
                return <Clock className="h-6 w-6 text-orange-600" />
            case "info":
                return <Info className="h-6 w-6 text-blue-600" />
            default:
                return <Bell className="h-6 w-6" />
        }
    }

    const getAlertBg = (type: string) => {
        switch (type) {
            case "urgent":
                return "bg-red-50 border-red-100"
            case "warning":
                return "bg-orange-50 border-orange-100"
            case "info":
                return "bg-blue-50 border-blue-100"
            default:
                return "bg-gray-50 border-gray-100"
        }
    }

    const unreadCount = alerts.filter(a => !a.read).length
    const filteredAlerts = filter === "all" ? alerts : alerts.filter(a => a.type === filter)

    const markAllAsRead = () => {
        setAlerts(alerts.map(a => ({ ...a, read: true })))
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Centre d'Alertes</h1>
                    <p className="text-muted-foreground mt-1">
                        Notifications et urgences de l'établissement
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={markAllAsRead}
                    className="bg-white hover:bg-gray-50 text-gray-700"
                >
                    <Check className="h-4 w-4 mr-2" />
                    Tout marquer comme lu
                </Button>
            </div>

            {/* Stats & Filters */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card
                    className={`cursor-pointer transition-all hover:shadow-md border-none shadow-sm ${filter === 'urgent' ? 'ring-2 ring-red-500' : 'bg-white'}`}
                    onClick={() => setFilter("urgent")}
                >
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Urgences</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">
                                {alerts.filter(a => a.type === "urgent").length}
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all hover:shadow-md border-none shadow-sm ${filter === 'warning' ? 'ring-2 ring-orange-500' : 'bg-white'}`}
                    onClick={() => setFilter("warning")}
                >
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Avertissements</p>
                            <p className="text-3xl font-bold text-orange-600 mt-2">
                                {alerts.filter(a => a.type === "warning").length}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all hover:shadow-md border-none shadow-sm ${filter === 'info' ? 'ring-2 ring-blue-500' : 'bg-white'}`}
                    onClick={() => setFilter("info")}
                >
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Informations</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {alerts.filter(a => a.type === "info").length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Info className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all hover:shadow-md border-none shadow-sm ${filter === 'all' ? 'ring-2 ring-gray-500' : 'bg-white'}`}
                    onClick={() => setFilter("all")}
                >
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {alerts.length}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-xl">
                            <Bell className="h-6 w-6 text-gray-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts List */}
            <Card className="bg-white shadow-sm border-none">
                <CardHeader className="border-b bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-gray-500" />
                            <CardTitle className="text-lg">
                                {filter === "all" ? "Toutes les alertes" : `Alertes ${filter}`}
                            </CardTitle>
                        </div>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            {filteredAlerts.length} résultats
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        {filteredAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`
                                    group flex items-start gap-4 p-6 transition-all duration-200 hover:bg-gray-50
                                    ${alert.read ? 'opacity-75' : 'bg-blue-50/10'}
                                `}
                            >
                                <div className={`
                                    p-3 rounded-xl flex-shrink-0 border
                                    ${getAlertBg(alert.type)}
                                `}>
                                    {getAlertIcon(alert.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className={`font-bold text-lg ${alert.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                                    {alert.title}
                                                </h3>
                                                {!alert.read && (
                                                    <Badge className="bg-blue-600 hover:bg-blue-700 animate-pulse">
                                                        Nouveau
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-gray-600 leading-relaxed">
                                                {alert.message}
                                            </p>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Marquer comme lu</DropdownMenuItem>
                                                <DropdownMenuItem>Archiver</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {format(new Date(alert.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="uppercase tracking-wider text-gray-400">
                                            ID: #{alert.id.toString().padStart(4, '0')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredAlerts.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Aucune alerte</h3>
                                <p className="text-gray-500 mt-1">Tout est calme pour le moment</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
