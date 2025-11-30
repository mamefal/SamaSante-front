"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ClipboardList,
    TrendingUp,
    Users,
    Calendar,
    Download,
    FileText,
    BarChart3,
    PieChart,
    ArrowUpRight,
    MoreHorizontal,
    FileSpreadsheet
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function HospitalReports() {
    const reports = [
        {
            id: 1,
            title: "Rapport mensuel des consultations",
            type: "PDF",
            date: "28 Nov 2025",
            size: "2.4 MB",
            category: "Activités",
            author: "Dr. Fall"
        },
        {
            id: 2,
            title: "Statistiques par département",
            type: "Excel",
            date: "27 Nov 2025",
            size: "1.8 MB",
            category: "Performance",
            author: "Admin"
        },
        {
            id: 3,
            title: "Analyse des urgences - T3",
            type: "PDF",
            date: "15 Nov 2025",
            size: "3.2 MB",
            category: "Qualité",
            author: "Dr. Diop"
        },
        {
            id: 4,
            title: "Rapport de satisfaction patients",
            type: "PDF",
            date: "01 Nov 2025",
            size: "1.5 MB",
            category: "Qualité",
            author: "Service Qualité"
        },
        {
            id: 5,
            title: "Bilan financier mensuel - Octobre",
            type: "Excel",
            date: "05 Nov 2025",
            size: "4.1 MB",
            category: "Finance",
            author: "Comptabilité"
        }
    ]

    const getFileIcon = (type: string) => {
        if (type === 'PDF') return <FileText className="h-6 w-6 text-red-600" />
        if (type === 'Excel') return <FileSpreadsheet className="h-6 w-6 text-green-600" />
        return <FileText className="h-6 w-6 text-blue-600" />
    }

    const getFileBg = (type: string) => {
        if (type === 'PDF') return 'bg-red-50 border-red-100'
        if (type === 'Excel') return 'bg-green-50 border-green-100'
        return 'bg-blue-50 border-blue-100'
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rapports & Statistiques</h1>
                    <p className="text-muted-foreground mt-1">
                        Analyses détaillées et export de données
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Générer un Rapport
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Patients Ce Mois</p>
                                <h3 className="text-3xl font-bold mt-2">1,234</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-4 font-medium">
                            <ArrowUpRight className="h-3 w-3" />
                            +12% vs mois dernier
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Consultations</p>
                                <h3 className="text-3xl font-bold mt-2">856</h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-4 font-medium">
                            <ArrowUpRight className="h-3 w-3" />
                            +8% vs mois dernier
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                                <h3 className="text-3xl font-bold mt-2">94%</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Basé sur 245 avis</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                                <h3 className="text-3xl font-bold mt-2">45M</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <PieChart className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-4 font-medium">
                            <ArrowUpRight className="h-3 w-3" />
                            +15% vs mois dernier
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Reports List */}
            <Card className="bg-white shadow-sm border-none">
                <CardHeader className="border-b bg-white px-6 py-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ClipboardList className="h-5 w-5 text-gray-500" />
                        Rapports Disponibles
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-gray-50/80 transition-colors gap-4 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        h-12 w-12 rounded-xl flex items-center justify-center shadow-sm border
                                        ${getFileBg(report.type)}
                                    `}>
                                        {getFileIcon(report.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {report.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-600 hover:bg-gray-200">
                                                {report.category}
                                            </Badge>
                                            <span>•</span>
                                            <span>{report.date}</span>
                                            <span>•</span>
                                            <span>{report.size}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                                    <div className="text-sm text-right hidden md:block">
                                        <div className="text-gray-500">Généré par</div>
                                        <div className="font-medium text-gray-900">{report.author}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                                            <Download className="h-4 w-4" />
                                            <span className="hidden sm:inline">Télécharger</span>
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Aperçu</DropdownMenuItem>
                                                <DropdownMenuItem>Partager</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
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
