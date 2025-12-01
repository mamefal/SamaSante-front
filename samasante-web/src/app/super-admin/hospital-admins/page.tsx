"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    UserCog,
    Plus,
    Search,
    MoreVertical,
    Mail,
    Phone,
    Building2,
    CheckCircle2,
    XCircle,
    Edit,
    Trash2,
    Key,
    Shield,
} from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type HospitalAdmin = {
    id: number
    name: string
    email: string
    phone: string
    organization: string
    organizationId: number
    status: "active" | "inactive"
    lastLogin: string
    createdAt: string
}

export default function HospitalAdminsPage() {
    const [admins, setAdmins] = useState<HospitalAdmin[]>([
        {
            id: 1,
            name: "Fatou Sall",
            email: "admin@hopital-dakar.sn",
            phone: "+221 77 123 45 67",
            organization: "Hôpital Principal de Dakar",
            organizationId: 1,
            status: "active",
            lastLogin: "2024-01-15 14:30",
            createdAt: "2023-06-01"
        },
        {
            id: 2,
            name: "Moussa Diop",
            email: "admin@clinique-thies.sn",
            phone: "+221 77 234 56 78",
            organization: "Clinique Moderne de Thiès",
            organizationId: 2,
            status: "active",
            lastLogin: "2024-01-14 09:15",
            createdAt: "2023-07-15"
        },
        {
            id: 3,
            name: "Aissatou Ndiaye",
            email: "admin@centre-kaolack.sn",
            phone: "+221 77 345 67 89",
            organization: "Centre de Santé de Kaolack",
            organizationId: 3,
            status: "inactive",
            lastLogin: "2023-12-20 16:45",
            createdAt: "2023-08-01"
        },
    ])
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newAdmin, setNewAdmin] = useState({
        name: "",
        email: "",
        phone: "",
        organizationId: "",
        password: ""
    })

    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.organization.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateAdmin = () => {
        if (!newAdmin.name || !newAdmin.email || !newAdmin.organizationId) {
            toast.error("Veuillez remplir tous les champs obligatoires")
            return
        }

        const admin: HospitalAdmin = {
            id: Date.now(),
            name: newAdmin.name,
            email: newAdmin.email,
            phone: newAdmin.phone,
            organization: "Organisation " + newAdmin.organizationId,
            organizationId: parseInt(newAdmin.organizationId),
            status: "active",
            lastLogin: "Jamais connecté",
            createdAt: new Date().toISOString()
        }

        setAdmins([...admins, admin])
        setIsCreateDialogOpen(false)
        setNewAdmin({ name: "", email: "", phone: "", organizationId: "", password: "" })
        toast.success("Administrateur créé avec succès !")
    }

    const handleToggleStatus = (id: number) => {
        setAdmins(admins.map(admin =>
            admin.id === id
                ? { ...admin, status: admin.status === "active" ? "inactive" : "active" }
                : admin
        ))
        toast.success("Statut mis à jour")
    }

    const handleDelete = (id: number) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet administrateur ?")) {
            setAdmins(admins.filter(admin => admin.id !== id))
            toast.success("Administrateur supprimé")
        }
    }

    const handleResetPassword = (admin: HospitalAdmin) => {
        toast.success(`Email de réinitialisation envoyé à ${admin.email}`)
    }

    return (
        <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Administrateurs d&apos;Hôpitaux
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Gérez les comptes administrateurs de toutes les organisations
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Nouvel Administrateur
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Créer un Administrateur</DialogTitle>
                            <DialogDescription>
                                Créez un nouveau compte administrateur pour une organisation
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">
                                    Nom complet *
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Fatou Sall"
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    className="h-12"
                                />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-base font-semibold">
                                        Email *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@hopital.sn"
                                        value={newAdmin.email}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-base font-semibold">
                                        Téléphone
                                    </Label>
                                    <Input
                                        id="phone"
                                        placeholder="+221 77 123 45 67"
                                        value={newAdmin.phone}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                                        className="h-12"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organization" className="text-base font-semibold">
                                    Organisation *
                                </Label>
                                <select
                                    id="organization"
                                    value={newAdmin.organizationId}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, organizationId: e.target.value })}
                                    className="w-full h-12 p-3 border rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                >
                                    <option value="">Sélectionner une organisation</option>
                                    <option value="1">Hôpital Principal de Dakar</option>
                                    <option value="2">Clinique Moderne de Thiès</option>
                                    <option value="3">Centre de Santé de Kaolack</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-base font-semibold">
                                    Mot de passe temporaire *
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Minimum 8 caractères"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    className="h-12"
                                />
                                <p className="text-sm text-muted-foreground">
                                    L&apos;administrateur devra changer ce mot de passe à la première connexion
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleCreateAdmin}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Créer l&apos;Administrateur
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Administrateurs
                        </CardTitle>
                        <UserCog className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{admins.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tous les comptes
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Actifs
                        </CardTitle>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {admins.filter(a => a.status === "active").length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Comptes actifs
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Inactifs
                        </CardTitle>
                        <XCircle className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {admins.filter(a => a.status === "inactive").length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Comptes désactivés
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Organisations
                        </CardTitle>
                        <Building2 className="h-5 w-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {new Set(admins.map(a => a.organizationId)).size}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Avec administrateurs
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card className="shadow-md">
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom, email ou organisation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 text-base"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Admins List */}
            <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <CardTitle className="text-2xl">Liste des Administrateurs</CardTitle>
                    <CardDescription className="mt-1">
                        {filteredAdmins.length} administrateur(s) trouvé(s)
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {filteredAdmins.map((admin) => (
                            <div
                                key={admin.id}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                                            <UserCog className="h-7 w-7 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">{admin.name}</h3>
                                                {admin.status === "active" ? (
                                                    <Badge className="bg-green-100 text-green-700">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Actif
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700">
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Inactif
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    {admin.email}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    {admin.phone}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4" />
                                                    {admin.organization}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4" />
                                                    Dernière connexion: {admin.lastLogin}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuItem onClick={() => toast.info("Fonctionnalité en développement")}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                                                <Key className="mr-2 h-4 w-4" />
                                                Réinitialiser le mot de passe
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(admin.id)}>
                                                {admin.status === "active" ? (
                                                    <>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Désactiver
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Activer
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(admin.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Supprimer
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
