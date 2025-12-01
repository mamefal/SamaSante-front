"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Bed,
    User,
    Calendar,
    Activity,
    Search,
    Plus,
    Stethoscope,
    Clock,
    MoreHorizontal,
    Filter,
    ArrowUpDown
} from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function HospitalAdmissions() {
    const [searchTerm, setSearchTerm] = useState("")

    const admissions = [
        {
            id: 1,
            patient: "Aminata Touré",
            age: 34,
            room: "Chambre 205",
            department: "Cardiologie",
            admissionDate: "2025-11-25",
            status: "Stable",
            doctor: "Dr. Fall",
            priority: "Moyenne"
        },
        {
            id: 2,
            patient: "Ibrahima Sarr",
            age: 58,
            room: "Chambre 312",
            department: "Chirurgie",
            admissionDate: "2025-11-27",
            status: "Post-opératoire",
            doctor: "Dr. Ndiaye",
            priority: "Haute"
        },
        {
            id: 3,
            patient: "Khady Diop",
            age: 42,
            room: "Chambre 108",
            department: "Pédiatrie",
            admissionDate: "2025-11-28",
            status: "En observation",
            doctor: "Dr. Diop",
            priority: "Faible"
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Stable":
                return "bg-green-100 text-green-700 hover:bg-green-200 border-none"
            case "Post-opératoire":
                return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"
            case "En observation":
                return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none"
            case "Critique":
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
                    <h1 className="text-3xl font-bold text-gray-900">Hospitalisations</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestion des admissions et des lits
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Admission
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Hospitalisés</p>
                                <h3 className="text-3xl font-bold mt-2">{admissions.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Bed className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Lits Disponibles</p>
                                <h3 className="text-3xl font-bold mt-2 text-green-600">12</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Bed className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Sur 50 lits au total</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Admissions (24h)</p>
                                <h3 className="text-3xl font-bold mt-2">3</h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 mt-4 font-medium">+2 depuis hier</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Taux d'Occupation</p>
                                <h3 className="text-3xl font-bold mt-2">76%</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Activity className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Niveau modéré</p>
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
                        {admissions.map((admission) => (
                            <div
                                key={admission.id}
                                className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-gray-50/80 transition-colors gap-4 group"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                            {admission.patient.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {admission.patient}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Bed className="h-3.5 w-3.5" /> {admission.room}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Stethoscope className="h-3.5 w-3.5" /> {admission.department}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Admis le
                                        </div>
                                        <span className="font-medium text-sm text-gray-900">
                                            {new Date(admission.admissionDate).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <User className="h-3 w-3" /> Médecin
                                        </div>
                                        <span className="font-medium text-sm text-blue-600">
                                            {admission.doctor}
                                        </span>
                                    </div>

                                    <Badge className={`${getStatusColor(admission.status)} px-3 py-1`}>
                                        {admission.status}
                                    </Badge>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>Détails du séjour</DropdownMenuItem>
                                            <DropdownMenuItem>Transférer</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-green-600">Autoriser sortie</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
