"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, User, Phone, Mail, Calendar, MapPin, FileText, UserPlus, Users, Activity, Loader2, Filter, ArrowUpDown, MoreHorizontal } from "lucide-react"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Patient {
    id: number
    firstName: string
    lastName: string
    dob: string
    phone: string
    email: string
    gender: string
    address: string
    createdAt: string
}

export default function HospitalPatients() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchPatients()
    }, [])

    const fetchPatients = async () => {
        try {
            const res = await api.get("/patients")
            setPatients(res.data)
        } catch (error) {
            console.error("Error fetching patients:", error)
            toast.error("Erreur lors du chargement des patients")
        } finally {
            setLoading(false)
        }
    }

    const filteredPatients = patients.filter(patient =>
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
    )

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
                    <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestion des dossiers patients de l&apos;hôpital
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white">
                        <FileText className="mr-2 h-4 w-4" />
                        Exporter
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Nouveau Patient
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                                <h3 className="text-3xl font-bold mt-2">{patients.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-600 font-medium">+12%</span>
                            <span className="text-muted-foreground ml-2">vs mois dernier</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nouveaux (Mois)</p>
                                <h3 className="text-3xl font-bold mt-2">+{Math.floor(patients.length * 0.15)}</h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <UserPlus className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-600 font-medium">+5%</span>
                            <span className="text-muted-foreground ml-2">vs mois dernier</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Taux de Retour</p>
                                <h3 className="text-3xl font-bold mt-2">85%</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Activity className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-600 font-medium">+2%</span>
                            <span className="text-muted-foreground ml-2">vs mois dernier</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="bg-white shadow-sm border-none">
                <CardHeader className="border-b bg-white px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher un patient..."
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
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-gray-50/80 transition-colors gap-4 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                                {patient.firstName[0]}{patient.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {patient.firstName} {patient.lastName}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(patient.dob).toLocaleDateString('fr-FR')}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {patient.phone || "N/A"}
                                                </span>
                                                {patient.email && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {patient.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Dossier
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                                                <DropdownMenuItem>Éditer</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Archiver</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun patient trouvé</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                    Essayez de modifier vos critères de recherche ou ajoutez un nouveau patient.
                                </p>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Nouveau Patient
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
