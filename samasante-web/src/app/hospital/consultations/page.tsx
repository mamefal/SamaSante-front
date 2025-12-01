"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Stethoscope,
    Clock,
    CheckCircle,
    Search,
    User,
    Calendar,
    ArrowRight,
    Filter,
    MoreHorizontal
} from "lucide-react"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function HospitalConsultations() {
    const [searchTerm, setSearchTerm] = useState("")

    const consultations = [
        {
            id: 1,
            patient: "Ousmane Ba",
            doctor: "Dr. Fall",
            department: "Cardiologie",
            time: "09:00",
            status: "Terminée",
            duration: "30 min",
            type: "Suivi"
        },
        {
            id: 2,
            patient: "Aissatou Sy",
            doctor: "Dr. Diop",
            department: "Pédiatrie",
            time: "10:30",
            status: "En cours",
            duration: "15 min",
            type: "Urgence"
        },
        {
            id: 3,
            patient: "Mamadou Diallo",
            doctor: "Dr. Ndiaye",
            department: "Médecine Générale",
            time: "11:00",
            status: "En attente",
            duration: "-",
            type: "Première visite"
        },
        {
            id: 4,
            patient: "Fatou Ndiaye",
            doctor: "Dr. Sow",
            department: "Dermatologie",
            time: "11:30",
            status: "En attente",
            duration: "-",
            type: "Suivi"
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Terminée":
                return "bg-green-100 text-green-700 hover:bg-green-200 border-none"
            case "En cours":
                return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none animate-pulse"
            case "En attente":
                return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none"
            case "Annulée":
                return "bg-red-100 text-red-700 hover:bg-red-200 border-none"
            default:
                return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
        }
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Consultations</h1>
                    <p className="text-muted-foreground mt-1">
                        Suivi des consultations en temps réel
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-white">
                        <Calendar className="h-4 w-4 mr-2" />
                        Aujourd'hui
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Nouvelle Consultation
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Aujourd'hui</p>
                                <h3 className="text-3xl font-bold mt-2">{consultations.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Stethoscope className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Consultations programmées</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                                <h3 className="text-3xl font-bold mt-2 text-green-600">
                                    {consultations.filter(c => c.status === "Terminée").length}
                                </h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Taux de réalisation: 25%</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Durée Moyenne</p>
                                <h3 className="text-3xl font-bold mt-2">25 min</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Par consultation</p>
                    </CardContent>
                </Card>
            </div>

            {/* Consultations List */}
            <Card className="bg-white shadow-sm border-none">
                <CardHeader className="border-b bg-white px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5 text-gray-500" />
                            <CardTitle className="text-lg">File d'attente et consultations</CardTitle>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Rechercher..."
                                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="bg-white">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        {consultations.map((consultation) => (
                            <div
                                key={consultation.id}
                                className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-gray-50/80 transition-colors gap-4 group"
                            >
                                <div className="flex items-center gap-6 mb-4 md:mb-0 w-full md:w-auto">
                                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-xl border border-blue-100 group-hover:bg-blue-100 transition-colors">
                                        <span className="text-lg font-bold text-blue-700">{consultation.time}</span>
                                        <span className="text-xs text-blue-500 font-medium">AM</span>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{consultation.patient}</h3>
                                            <Badge variant="outline" className="text-xs font-normal bg-gray-50 text-gray-500">
                                                {consultation.type}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" /> {consultation.doctor}
                                            </span>
                                            <span className="hidden md:inline">•</span>
                                            <span className="flex items-center gap-1">
                                                <Stethoscope className="h-3.5 w-3.5" /> {consultation.department}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full md:w-auto gap-6">
                                    <div className="text-right hidden md:block">
                                        <div className="text-xs text-gray-500 mb-1">Durée estimée</div>
                                        <div className="font-medium flex items-center justify-end gap-1">
                                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                                            {consultation.duration}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Badge className={`${getStatusColor(consultation.status)} px-3 py-1`}>
                                            {consultation.status}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Voir dossier</DropdownMenuItem>
                                                <DropdownMenuItem>Reprogrammer</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Annuler</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
