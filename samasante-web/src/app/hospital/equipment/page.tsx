"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Monitor,
    Activity,
    Wrench,
    Search,
    Plus,
    Filter,
    CheckCircle,
    AlertTriangle,
    Calendar,
    Settings,
    MoreHorizontal,
    Edit,
    Trash2
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

export default function HospitalEquipment() {
    const [searchTerm, setSearchTerm] = useState("")

    const equipmentList = [
        {
            id: 1,
            name: "Scanner IRM Philips Ingenia",
            type: "Imagerie",
            department: "Radiologie",
            status: "En service",
            lastMaintenance: "2024-10-15",
            nextMaintenance: "2025-04-15",
            serialNumber: "SN-2023-8842"
        },
        {
            id: 2,
            name: "Moniteur Multiparamétrique",
            type: "Monitoring",
            department: "Urgences",
            status: "En maintenance",
            lastMaintenance: "2024-11-01",
            nextMaintenance: "2024-12-01",
            serialNumber: "SN-2022-1105"
        },
        {
            id: 3,
            name: "Respirateur Artificiel",
            type: "Réanimation",
            department: "Soins Intensifs",
            status: "En service",
            lastMaintenance: "2024-09-20",
            nextMaintenance: "2025-03-20",
            serialNumber: "SN-2023-5591"
        },
        {
            id: 4,
            name: "Échographe Portable",
            type: "Imagerie",
            department: "Gynécologie",
            status: "Hors service",
            lastMaintenance: "2024-08-10",
            nextMaintenance: "2024-11-30",
            serialNumber: "SN-2021-3321"
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "En service":
                return "bg-green-100 text-green-700 hover:bg-green-200 border-none"
            case "En maintenance":
                return "bg-orange-100 text-orange-700 hover:bg-orange-200 border-none animate-pulse"
            case "Hors service":
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
                    <h1 className="text-3xl font-bold text-gray-900">Équipements</h1>
                    <p className="text-muted-foreground mt-1">
                        Inventaire et suivi de maintenance
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un Équipement
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Équipements</p>
                                <h3 className="text-3xl font-bold mt-2">342</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Monitor className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Valeur totale: 1.2M €</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">En Service</p>
                                <h3 className="text-3xl font-bold mt-2 text-green-600">318</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">93% opérationnels</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">En Maintenance</p>
                                <h3 className="text-3xl font-bold mt-2 text-orange-600">24</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Wrench className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Dont 4 critiques</p>
                    </CardContent>
                </Card>
            </div>

            {/* Equipment List */}
            <Card className="bg-white shadow-sm border-none">
                <CardHeader className="border-b bg-white px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher un équipement..."
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
                        {equipmentList.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-gray-50/80 transition-colors gap-4 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        h-12 w-12 rounded-xl flex items-center justify-center shadow-sm border
                                        ${item.status === 'En service' ? 'bg-green-50 border-green-100 text-green-600' :
                                            item.status === 'En maintenance' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                                                'bg-red-50 border-red-100 text-red-600'}
                                    `}>
                                        <Monitor className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-600">
                                                {item.type}
                                            </Badge>
                                            <span>•</span>
                                            <span>{item.department}</span>
                                            <span>•</span>
                                            <span className="font-mono text-xs text-gray-400">{item.serialNumber}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Wrench className="h-3 w-3" /> Dernière maintenance
                                        </div>
                                        <span className="font-medium text-sm text-gray-900">
                                            {new Date(item.lastMaintenance).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> Prochaine
                                        </div>
                                        <span className={`font-medium text-sm ${item.status === 'En maintenance' ? 'text-orange-600' : 'text-gray-900'}`}>
                                            {new Date(item.nextMaintenance).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>

                                    <Badge className={`${getStatusColor(item.status)} px-3 py-1`}>
                                        {item.status}
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
                                                <Edit className="mr-2 h-4 w-4" /> Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Wrench className="mr-2 h-4 w-4" /> Planifier maintenance
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                            </DropdownMenuItem>
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
