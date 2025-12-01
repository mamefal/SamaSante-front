"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Database,
    Download,
    Upload,
    Clock,
    CheckCircle2,
    AlertCircle,
    Server,
    HardDrive,
    Calendar,
    FileArchive,
    RefreshCw,
    Trash2,
} from "lucide-react"
import { toast } from "sonner"

type BackupFile = {
    id: string
    name: string
    size: string
    date: string
    type: "full" | "incremental"
    status: "completed" | "in-progress" | "failed"
}

export default function BackupRestorePage() {
    const [backups, setBackups] = useState<BackupFile[]>([
        {
            id: "1",
            name: "backup_full_2024_01_15.sql",
            size: "2.4 GB",
            date: "2024-01-15 03:00:00",
            type: "full",
            status: "completed"
        },
        {
            id: "2",
            name: "backup_incremental_2024_01_14.sql",
            size: "156 MB",
            date: "2024-01-14 03:00:00",
            type: "incremental",
            status: "completed"
        },
        {
            id: "3",
            name: "backup_full_2024_01_08.sql",
            size: "2.3 GB",
            date: "2024-01-08 03:00:00",
            type: "full",
            status: "completed"
        },
    ])
    const [isBackingUp, setIsBackingUp] = useState(false)
    const [isRestoring, setIsRestoring] = useState(false)

    const handleCreateBackup = async (type: "full" | "incremental") => {
        setIsBackingUp(true)
        toast.info(`Création d'une sauvegarde ${type === "full" ? "complète" : "incrémentale"}...`)

        // Simulate backup creation
        setTimeout(() => {
            const newBackup: BackupFile = {
                id: Date.now().toString(),
                name: `backup_${type}_${new Date().toISOString().split('T')[0]}.sql`,
                size: type === "full" ? "2.5 GB" : "180 MB",
                date: new Date().toISOString(),
                type,
                status: "completed"
            }
            setBackups([newBackup, ...backups])
            setIsBackingUp(false)
            toast.success("Sauvegarde créée avec succès !")
        }, 3000)
    }

    const handleRestore = async (backupId: string) => {
        setIsRestoring(true)
        toast.warning("Restauration en cours... Ne fermez pas cette page.")

        // Simulate restore
        setTimeout(() => {
            setIsRestoring(false)
            toast.success("Restauration terminée avec succès !")
        }, 5000)
    }

    const handleDownload = (backup: BackupFile) => {
        toast.success(`Téléchargement de ${backup.name} démarré`)
    }

    const handleDelete = (backupId: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette sauvegarde ?")) {
            setBackups(backups.filter(b => b.id !== backupId))
            toast.success("Sauvegarde supprimée")
        }
    }

    const getStatusBadge = (status: BackupFile["status"]) => {
        const config = {
            completed: { icon: CheckCircle2, label: "Terminé", className: "bg-green-100 text-green-700" },
            "in-progress": { icon: RefreshCw, label: "En cours", className: "bg-blue-100 text-blue-700" },
            failed: { icon: AlertCircle, label: "Échec", className: "bg-red-100 text-red-700" },
        }
        const { icon: Icon, label, className } = config[status]
        return (
            <Badge className={className}>
                <Icon className="h-3 w-3 mr-1" />
                {label}
            </Badge>
        )
    }

    const getTypeBadge = (type: BackupFile["type"]) => {
        return type === "full" ? (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Database className="h-3 w-3 mr-1" />
                Complète
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <FileArchive className="h-3 w-3 mr-1" />
                Incrémentale
            </Badge>
        )
    }

    return (
        <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Sauvegarde & Restauration
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Gérez les sauvegardes de la base de données de la plateforme
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => handleCreateBackup("incremental")}
                        disabled={isBackingUp}
                        variant="outline"
                        size="lg"
                        className="shadow-md hover:shadow-lg transition-all"
                    >
                        <FileArchive className="mr-2 h-5 w-5" />
                        Sauvegarde Incrémentale
                    </Button>
                    <Button
                        onClick={() => handleCreateBackup("full")}
                        disabled={isBackingUp}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all"
                    >
                        <Database className="mr-2 h-5 w-5" />
                        Sauvegarde Complète
                    </Button>
                </div>
            </div>

            {/* System Status */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Espace Utilisé
                        </CardTitle>
                        <HardDrive className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">7.2 GB</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            sur 50 GB disponibles
                        </p>
                        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: "14.4%" }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sauvegardes Totales
                        </CardTitle>
                        <Database className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{backups.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {backups.filter(b => b.type === "full").length} complètes, {backups.filter(b => b.type === "incremental").length} incrémentales
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Dernière Sauvegarde
                        </CardTitle>
                        <Clock className="h-5 w-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">Aujourd&apos;hui</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {new Date(backups[0]?.date || new Date()).toLocaleString('fr-FR')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Statut Système
                        </CardTitle>
                        <Server className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xl font-bold">Opérationnel</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tous les services fonctionnent
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Backup List */}
            <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Historique des Sauvegardes</CardTitle>
                            <CardDescription className="mt-1">
                                Liste de toutes les sauvegardes disponibles
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualiser
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {backups.map((backup) => (
                            <div
                                key={backup.id}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                                            <Database className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">{backup.name}</h3>
                                                {getTypeBadge(backup.type)}
                                                {getStatusBadge(backup.status)}
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <HardDrive className="h-4 w-4" />
                                                    {backup.size}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(backup.date).toLocaleString('fr-FR')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownload(backup)}
                                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Télécharger
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRestore(backup.id)}
                                            disabled={isRestoring}
                                            className="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Restaurer
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(backup.id)}
                                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Configuration */}
            <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <CardTitle className="text-2xl">Configuration Automatique</CardTitle>
                    <CardDescription className="mt-1">
                        Planifiez des sauvegardes automatiques
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <Label htmlFor="schedule" className="text-base font-semibold">
                                Fréquence des sauvegardes complètes
                            </Label>
                            <select
                                id="schedule"
                                className="w-full p-3 border rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            >
                                <option>Quotidienne (3h00)</option>
                                <option>Hebdomadaire (Dimanche 3h00)</option>
                                <option>Mensuelle (1er du mois 3h00)</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="retention" className="text-base font-semibold">
                                Durée de rétention
                            </Label>
                            <select
                                id="retention"
                                className="w-full p-3 border rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            >
                                <option>7 jours</option>
                                <option>30 jours</option>
                                <option>90 jours</option>
                                <option>1 an</option>
                            </select>
                        </div>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-md">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Enregistrer la Configuration
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
