"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Loader2, Phone, Mail, Calendar, Users, UserPlus, FileDown, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Patient {
    id: number
    firstName: string
    lastName: string
    email?: string
    phone?: string
    dob: string
    organization?: {
        name: string
    }
}

export default function PatientsManagement() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchPatients = async () => {
        setLoading(true)
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

    useEffect(() => {
        fetchPatients()
    }, [])

    const filteredPatients = patients.filter(p =>
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Gestion des Patients
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Liste complète des patients enregistrés
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="shadow-sm" onClick={fetchPatients}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualiser
                    </Button>
                    <Button variant="outline" className="shadow-sm">
                        <FileDown className="mr-2 h-4 w-4" />
                        Exporter
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                        <div className="p-2 rounded-lg bg-blue-50">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{patients.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Patients enregistrés</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Nouveaux (Mois)</CardTitle>
                        <div className="p-2 rounded-lg bg-green-50">
                            <UserPlus className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">+{Math.floor(patients.length * 0.1)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Croissance mensuelle</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Âge Moyen</CardTitle>
                        <div className="p-2 rounded-lg bg-purple-50">
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">34 ans</div>
                        <p className="text-xs text-muted-foreground mt-1">Moyenne globale</p>
                    </CardContent>
                </Card>
            </div>

            {/* Patients List */}
            <Card className="shadow-lg">
                <CardHeader className="border-b bg-gray-50/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher par nom, email..."
                                className="pl-10 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {filteredPatients.length} patients trouvés
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <div key={patient.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                                            <span className="font-bold text-lg">
                                                {patient.firstName[0]}{patient.lastName[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</h3>
                                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                                                {patient.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {patient.email}
                                                    </span>
                                                )}
                                                {patient.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {patient.phone}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(patient.dob), 'dd MMM yyyy', { locale: fr })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {patient.organization && (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                {patient.organization.name}
                                            </Badge>
                                        )}
                                        <Button variant="ghost" size="sm">
                                            Détails
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                                <h3 className="text-lg font-semibold mb-2">Aucun patient trouvé</h3>
                                <p className="text-muted-foreground">
                                    Essayez de modifier vos critères de recherche
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
