"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Pill,
    Package,
    AlertTriangle,
    Search,
    Plus,
    Filter,
    ArrowUpDown,
    MoreVertical,
    FileDown,
    MoreHorizontal,
    Edit,
    Trash2
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const medications = [
    { id: 1, name: "Paracétamol 500mg", category: "Antalgique", stock: 1500, minStock: 200, price: 500, expiry: "2025-12-31", status: "In Stock" },
    { id: 2, name: "Amoxicilline 1g", category: "Antibiotique", stock: 45, minStock: 50, price: 2500, expiry: "2024-06-15", status: "Low Stock" },
    { id: 3, name: "Ibuprofène 400mg", category: "Anti-inflammatoire", stock: 800, minStock: 100, price: 1200, expiry: "2025-08-20", status: "In Stock" },
    { id: 4, name: "Oméprazole 20mg", category: "Gastro-entérologie", stock: 0, minStock: 30, price: 3000, expiry: "2024-12-01", status: "Out of Stock" },
    { id: 5, name: "Metformine 500mg", category: "Antidiabétique", stock: 300, minStock: 100, price: 1800, expiry: "2025-03-10", status: "In Stock" },
]

export default function HospitalMedications() {
    const [searchTerm, setSearchTerm] = useState("")

    const getStatusColor = (status: string) => {
        switch (status) {
            case "In Stock":
                return "bg-green-100 text-green-700 hover:bg-green-200 border-none"
            case "Low Stock":
                return "bg-orange-100 text-orange-700 hover:bg-orange-200 border-none animate-pulse"
            case "Out of Stock":
                return "bg-red-100 text-red-700 hover:bg-red-200 border-none"
            default:
                return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "In Stock": return "En Stock"
            case "Low Stock": return "Stock Faible"
            case "Out of Stock": return "Rupture"
            default: return status
        }
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Médicaments</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestion de l'inventaire pharmaceutique
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white shadow-sm">
                        <FileDown className="mr-2 h-4 w-4" />
                        Exporter
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un médicament
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Références</p>
                                <h3 className="text-3xl font-bold mt-2">1,234</h3>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-50">
                                <Pill className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Médicaments actifs</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Stock Faible</p>
                                <h3 className="text-3xl font-bold mt-2 text-orange-600">23</h3>
                            </div>
                            <div className="p-2 rounded-lg bg-orange-50">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Nécessitent réapprovisionnement</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Valeur Stock</p>
                                <h3 className="text-3xl font-bold mt-2">12.5M</h3>
                            </div>
                            <div className="p-2 rounded-lg bg-green-50">
                                <Package className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Valeur totale estimée</p>
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
                                placeholder="Rechercher un médicament..."
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
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-sm text-gray-500">Nom du Médicament</th>
                                    <th className="text-left py-4 px-6 font-medium text-sm text-gray-500">Catégorie</th>
                                    <th className="text-left py-4 px-6 font-medium text-sm text-gray-500">Stock</th>
                                    <th className="text-left py-4 px-6 font-medium text-sm text-gray-500">Prix Unitaire</th>
                                    <th className="text-left py-4 px-6 font-medium text-sm text-gray-500">Expiration</th>
                                    <th className="text-left py-4 px-6 font-medium text-sm text-gray-500">Statut</th>
                                    <th className="text-right py-4 px-6 font-medium text-sm text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {medications.map((med) => (
                                    <tr key={med.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{med.name}</div>
                                            <div className="text-xs text-gray-500">Ref: MED-{med.id.toString().padStart(4, '0')}</div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-600">
                                                {med.category}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${med.stock <= med.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {med.stock}
                                                </span>
                                                <span className="text-xs text-gray-400">/ {med.minStock} min</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{med.price.toLocaleString()} FCFA</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{med.expiry}</td>
                                        <td className="py-4 px-6">
                                            <Badge className={getStatusColor(med.status)}>
                                                {getStatusLabel(med.status)}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
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
                                                        <Plus className="mr-2 h-4 w-4" /> Réapprovisionner
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
