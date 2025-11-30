"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    FlaskConical,
    Calendar,
    User,
    Eye,
    Filter,
    Plus,
    Microscope,
    TestTube,
    Dna,
    MoreHorizontal,
    CheckCircle,
    Clock,
    AlertCircle
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

interface LabOrder {
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
    status: string
    urgency: string
    tests: any[]
    type: string
}

export default function HospitalLabOrders() {
    const [orders, setOrders] = useState<LabOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    // Mock data for development if API fails or is empty
    const mockOrders: LabOrder[] = [
        {
            id: 1,
            patient: { firstName: "Aminata", lastName: "Touré" },
            doctor: { firstName: "Jean", lastName: "Fall" },
            createdAt: new Date().toISOString(),
            status: "pending",
            urgency: "urgent",
            tests: [],
            type: "Hématologie"
        },
        {
            id: 2,
            patient: { firstName: "Moussa", lastName: "Diop" },
            doctor: { firstName: "Fatou", lastName: "Ndiaye" },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: "completed",
            urgency: "normal",
            tests: [],
            type: "Biochimie"
        },
        {
            id: 3,
            patient: { firstName: "Seynabou", lastName: "Sow" },
            doctor: { firstName: "Amadou", lastName: "Ba" },
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            status: "processing",
            urgency: "normal",
            tests: [],
            type: "Immunologie"
        }
    ]

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await api.get("/lab-orders")
            if (res.data && res.data.length > 0) {
                setOrders(res.data)
            } else {
                setOrders(mockOrders)
            }
        } catch (error) {
            console.error("Error fetching lab orders:", error)
            setOrders(mockOrders) // Fallback to mock data
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders.filter(order =>
        order.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700 hover:bg-green-200 border-none"
            case "pending": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none"
            case "processing": return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none animate-pulse"
            case "cancelled": return "bg-red-100 text-red-700 hover:bg-red-200 border-none"
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "completed": return "Terminé"
            case "pending": return "En attente"
            case "processing": return "En cours"
            case "cancelled": return "Annulé"
            default: return status
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "Hématologie": return <TestTube className="h-5 w-5 text-red-500" />
            case "Biochimie": return <FlaskConical className="h-5 w-5 text-green-500" />
            case "Immunologie": return <Dna className="h-5 w-5 text-purple-500" />
            default: return <Microscope className="h-5 w-5 text-blue-500" />
        }
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analyses Médicales</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestion et suivi des examens de laboratoire
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Analyse
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
                                <h3 className="text-3xl font-bold mt-2">{orders.length}</h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <FlaskConical className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Ce mois-ci</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">En Attente</p>
                                <h3 className="text-3xl font-bold mt-2 text-yellow-600">
                                    {orders.filter(o => o.status === 'pending').length}
                                </h3>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">À traiter</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">En Cours</p>
                                <h3 className="text-3xl font-bold mt-2 text-blue-600">
                                    {orders.filter(o => o.status === 'processing').length}
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Microscope className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Analyses actives</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                                <h3 className="text-3xl font-bold mt-2 text-green-600">
                                    {orders.filter(o => o.status === 'completed').length}
                                </h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Résultats disponibles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Orders List */}
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
                                <p className="text-muted-foreground">Chargement des analyses...</p>
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-gray-50/80 transition-colors gap-4 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-600">
                                            {getTypeIcon(order.type || "General")}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {order.patient.firstName} {order.patient.lastName}
                                                </h3>
                                                {order.urgency === "urgent" && (
                                                    <Badge variant="destructive" className="text-xs font-normal animate-pulse">
                                                        Urgent
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3.5 w-3.5" /> Dr. {order.doctor.lastName}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(new Date(order.createdAt), "d MMM yyyy", { locale: fr })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                                            <TestTube className="h-4 w-4 text-purple-500" />
                                            <span className="font-medium">{order.type}</span>
                                        </div>

                                        <Badge className={`${getStatusColor(order.status)} px-3 py-1`}>
                                            {getStatusLabel(order.status)}
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
                                <FlaskConical className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                Aucune analyse trouvée
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
