"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, User, Stethoscope, Search, Filter, ArrowUpDown, Loader2, CheckCircle, XCircle, AlertCircle, MoreHorizontal } from "lucide-react"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Appointment {
    id: number
    dateTime: string
    status: string
    reason?: string
    patient: {
        firstName: string
        lastName: string
        phone?: string
    }
    doctor: {
        firstName: string
        lastName: string
        specialty: string
    }
}

export default function HospitalAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        try {
            const res = await api.get("/appointments")
            setAppointments(res.data)
        } catch (error) {
            console.error("Error fetching appointments:", error)
            toast.error("Erreur lors du chargement des rendez-vous")
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Confirmé</Badge>
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none">En attente</Badge>
            case "cancelled":
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Annulé</Badge>
            case "completed":
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none">Terminé</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const filteredAppointments = appointments.filter(apt =>
        apt.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calendar Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 = Sunday

        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

        const days = []
        // Previous month padding
        for (let i = 0; i < startingDay; i++) {
            days.push(null)
        }
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i))
        }
        return days
    }

    const days = getDaysInMonth(currentDate)
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const getAppointmentsForDay = (date: Date) => {
        return appointments.filter(apt => {
            const aptDate = new Date(apt.dateTime)
            return aptDate.getDate() === date.getDate() &&
                aptDate.getMonth() === date.getMonth() &&
                aptDate.getFullYear() === date.getFullYear()
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rendez-vous</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestion du planning et des consultations
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className={`bg-white ${viewMode === 'calendar' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                        onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
                    >
                        {viewMode === 'list' ? <Calendar className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
                        {viewMode === 'list' ? 'Vue Calendrier' : 'Vue Liste'}
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Clock className="mr-2 h-4 w-4" />
                        Nouveau Rendez-vous
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total</p>
                                <h3 className="text-3xl font-bold mt-2">{appointments.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Confirmés</p>
                                <h3 className="text-3xl font-bold mt-2">{appointments.filter(a => a.status === 'confirmed').length}</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                                <h3 className="text-3xl font-bold mt-2">{appointments.filter(a => a.status === 'pending').length}</h3>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Annulés</p>
                                <h3 className="text-3xl font-bold mt-2">{appointments.filter(a => a.status === 'cancelled').length}</h3>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="bg-white shadow-sm border-none">
                <CardHeader className="border-b bg-white px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {viewMode === 'list' ? (
                            <>
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Rechercher (patient, médecin)..."
                                        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button variant="outline" size="sm" className="text-gray-600">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filtres
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-gray-600">
                                        <ArrowUpDown className="mr-2 h-4 w-4" />
                                        Trier
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <h2 className="text-xl font-bold text-gray-900 capitalize">
                                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                                </h2>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={prevMonth}>Précédent</Button>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Aujourd'hui</Button>
                                    <Button variant="outline" size="sm" onClick={nextMonth}>Suivant</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {viewMode === 'list' ? (
                        <div className="divide-y divide-gray-100">
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((apt) => (
                                    <div key={apt.id} className="p-6 hover:bg-gray-50/80 transition-colors group">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center justify-center h-14 w-14 bg-blue-50 rounded-xl text-blue-700 border border-blue-100">
                                                    <span className="text-xs font-semibold uppercase">{format(new Date(apt.dateTime), "MMM", { locale: fr })}</span>
                                                    <span className="text-xl font-bold">{format(new Date(apt.dateTime), "dd")}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {apt.patient.firstName} {apt.patient.lastName}
                                                        </h3>
                                                        {getStatusBadge(apt.status)}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                                                        <span className="flex items-center gap-1.5">
                                                            <Stethoscope className="h-3.5 w-3.5" />
                                                            Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {format(new Date(apt.dateTime), "HH:mm")}
                                                        </span>
                                                    </div>
                                                    {apt.reason && (
                                                        <p className="text-sm text-gray-400 mt-1 italic">
                                                            "{apt.reason}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full md:w-auto">
                                                {apt.status === 'pending' && (
                                                    <>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                                                            Confirmer
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                                            Annuler
                                                        </Button>
                                                    </>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem>Voir détails</DropdownMenuItem>
                                                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">Annuler le RDV</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16">
                                    <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun rendez-vous trouvé</h3>
                                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                        Aucun rendez-vous ne correspond à vos critères de recherche.
                                    </p>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Clock className="mr-2 h-4 w-4" />
                                        Nouveau Rendez-vous
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                                {weekDays.map((day) => (
                                    <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                                        {day}
                                    </div>
                                ))}
                                {days.map((date, i) => (
                                    <div key={i} className={`bg-white min-h-[120px] p-2 ${!date ? 'bg-gray-50/50' : ''}`}>
                                        {date && (
                                            <>
                                                <div className={`text-sm font-medium mb-2 ${date.getDate() === new Date().getDate() &&
                                                    date.getMonth() === new Date().getMonth()
                                                    ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                                                    : 'text-gray-900'
                                                    }`}>
                                                    {date.getDate()}
                                                </div>
                                                <div className="space-y-1">
                                                    {getAppointmentsForDay(date).map(apt => (
                                                        <div
                                                            key={apt.id}
                                                            className={`text-xs p-1.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity ${apt.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                apt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                                    'bg-gray-50 text-gray-700 border-gray-100'
                                                                }`}
                                                            title={`${format(new Date(apt.dateTime), "HH:mm")} - ${apt.patient.firstName} ${apt.patient.lastName}`}
                                                        >
                                                            <span className="font-medium">{format(new Date(apt.dateTime), "HH:mm")}</span> {apt.patient.lastName}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
