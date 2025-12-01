"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    FileText,
    Calendar,
    User,
    Eye,
    Pill,
    Filter,
    Download,
    Plus,
    MoreHorizontal,
    CheckCircle,
    Clock
} from "lucide-react"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Prescription {
    id: number
    patient: {
        firstName: string
        lastName: string
    }
    doctor: {
        firstName: string
        lastName: string
    }
    createdAt: string
    medications: any[]
    diagnosis?: string
    status: string
}

export default function HospitalPrescriptions() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    // Mock data for development
    const mockPrescriptions: Prescription[] = [
        {
            id: 1,
            patient: { firstName: "Aminata", lastName: "Touré" },
            doctor: { firstName: "Jean", lastName: "Fall" },
            createdAt: new Date().toISOString(),
            medications: [1, 2, 3],
            diagnosis: "Hypertension artérielle",
            status: "active"
        },
        {
            id: 2,
            patient: { firstName: "Moussa", lastName: "Diop" },
            doctor: { firstName: "Fatou", lastName: "Ndiaye" },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            medications: [1, 2],
            diagnosis: "Bronchite aiguë",
            status: "completed"
        },
        {
            id: 3,
            patient: { firstName: "Seynabou", lastName: "Sow" },
            doctor: { firstName: "Amadou", lastName: "Ba" },
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            medications: [1],
            diagnosis: "Migraine",
            status: "active"
        }
    ]

    useEffect(() => {
        fetchPrescriptions()
    }, [])

    const fetchPrescriptions = async () => {
        try {
            const res = await api.get("/prescriptions")
            if (res.data && res.data.length > 0) {
                setPrescriptions(res.data)
            } else {
                setPrescriptions(mockPrescriptions)
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error)
            setPrescriptions(mockPrescriptions)
        } finally {
            setLoading(false)
        }
    }

    const filteredPrescriptions = prescriptions.filter(p =>
        p.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-700 hover:bg-green-200 border-none"
            case "completed": return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
            case "cancelled": return "bg-red-100 text-red-700 hover:bg-red-200 border-none"
            default: return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active": return "Active"
            case "completed": return "Terminée"
            case "cancelled": return "Annulée"
            default: return status
        }
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ordonnances</h1>
                    <p className="text-muted-foreground mt-1">
                        Registre centralisé des prescriptions médicales
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Ordonnance
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Prescriptions</p>
                                <h3 className="text-3xl font-bold mt-2">{prescriptions.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Ce mois-ci</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Actives</p>
                                <h3 className="text-3xl font-bold mt-2 text-green-600">
                                    {prescriptions.filter(p => p.status === 'active').length}
                                </h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Pill className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Traitements en cours</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Moyenne / Jour</p>
                                <h3 className="text-3xl font-bold mt-2">12</h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 mt-4 font-medium">+15% vs mois dernier</p>
                    </CardContent>
                </Card>
            </div>

            {/* Prescriptions List */}
            <Card className="bg-white shadow-sm border-none">
                <CardHeader className="border-b bg-white px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher patient, médecin..."
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
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Chargement des ordonnances...</p>
                            </div>
                        ) : filteredPrescriptions.length > 0 ? (
                            filteredPrescriptions.map((prescription) => (
                                <div
                                    key={prescription.id}
                                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-gray-50/80 transition-colors gap-4 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 border border-gray-100">
                                            <AvatarFallback className="bg-blue-50 text-blue-600 font-medium">
                                                {prescription.patient.firstName[0]}{prescription.patient.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {prescription.patient.firstName} {prescription.patient.lastName}
                                                </h3>
                                                {prescription.diagnosis && (
                                                    <Badge variant="outline" className="text-xs font-normal text-gray-500 border-gray-200">
                                                        {prescription.diagnosis}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3.5 w-3.5" /> Dr. {prescription.doctor.lastName}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(new Date(prescription.createdAt), "d MMM yyyy", { locale: fr })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                                            <Pill className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium">{prescription.medications?.length || 0}</span> médicaments
                                        </div>

                                        <Badge className={`${getStatusColor(prescription.status)} px-3 py-1`}>
                                            {getStatusLabel(prescription.status)}
                                        </Badge>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4" /> Voir détails
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Download className="mr-2 h-4 w-4" /> Télécharger PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">
                                                    Annuler
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                Aucune ordonnance trouvée
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
