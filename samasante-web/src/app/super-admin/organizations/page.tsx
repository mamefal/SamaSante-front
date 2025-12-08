"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, Plus, MapPin, Phone, Mail, Loader2, Search, Filter, ArrowUpDown, Activity, Users, Stethoscope } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Organization {
    id: number
    name: string
    slug: string
    type: string
    region: string
    city: string
    phone: string
    email: string
    _count?: {
        doctors: number
        patients: number
    }
}

export default function OrganizationsManagement() {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [newOrg, setNewOrg] = useState({
        name: "",
        slug: "",
        type: "hopital",
        region: "Dakar",
        city: "",
        address: "",
        phone: "",
        email: ""
    })

    const fetchOrganizations = async () => {
        try {
            const res = await api.get("/organizations")
            setOrganizations(res.data)
        } catch (error) {
            console.error("Error fetching organizations:", error)
            toast.error("Erreur lors du chargement des organisations")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrganizations()
    }, [])

    const handleCreate = async () => {
        try {
            await api.post("/organizations", newOrg)
            toast.success("Organisation créée avec succès")
            setIsDialogOpen(false)
            fetchOrganizations()
        } catch (error) {
            toast.error("Erreur lors de la création")
        }
    }

    const filteredOrganizations = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.type.toLowerCase().includes(searchTerm.toLowerCase())
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
                        Organisations
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Gestion des hôpitaux et cliniques partenaires
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all">
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle Organisation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center">Ajouter une organisation</DialogTitle>
                            <DialogDescription className="text-center">
                                Créez un nouvel espace pour un hôpital ou une clinique.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        value={newOrg.name}
                                        onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        placeholder="Ex: Hôpital Principal"
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={newOrg.slug}
                                        onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                                        placeholder="ex: hopital-principal"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select onValueChange={(v) => setNewOrg({ ...newOrg, type: v })} defaultValue={newOrg.type}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hopital">Hôpital</SelectItem>
                                            <SelectItem value="clinique">Clinique</SelectItem>
                                            <SelectItem value="cabinet">Cabinet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="region">Région</Label>
                                    <Select onValueChange={(v) => setNewOrg({ ...newOrg, region: v })} defaultValue={newOrg.region}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Région" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Dakar">Dakar</SelectItem>
                                            <SelectItem value="Thiès">Thiès</SelectItem>
                                            <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">Ville</Label>
                                <Input
                                    id="city"
                                    value={newOrg.city}
                                    onChange={(e) => setNewOrg({ ...newOrg, city: e.target.value })}
                                    placeholder="Ville"
                                    className="h-11"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <Input
                                        id="phone"
                                        value={newOrg.phone}
                                        onChange={(e) => setNewOrg({ ...newOrg, phone: e.target.value })}
                                        placeholder="+221..."
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={newOrg.email}
                                        onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                                        placeholder="contact@hopital.sn"
                                        className="h-11"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">Créer l&apos;organisation</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Organisations</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{organizations.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Établissements enregistrés</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Médecins</CardTitle>
                        <Stethoscope className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {organizations.reduce((acc, org) => acc + (org._count?.doctors || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Personnel médical</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {organizations.reduce((acc, org) => acc + (org._count?.patients || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Patients pris en charge</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher une organisation..."
                            className="pl-10 bg-gray-50 border-gray-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtres
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Trier
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrganizations.length > 0 ? (
                        filteredOrganizations.map((org) => (
                            <Card key={org.id} className="group hover:shadow-lg transition-all duration-300 border-t-4 border-t-transparent hover:border-t-blue-500">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">{org.name}</CardTitle>
                                            <Badge variant="secondary" className="mt-1 bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                                                {org.type}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-3 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span className="line-clamp-1">{org.city}, {org.region}</span>
                                        </div>
                                        {org.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{org.phone}</span>
                                            </div>
                                        )}
                                        {org.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span className="line-clamp-1">{org.email}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-sm">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-lg text-gray-900">{org._count?.doctors || 0}</span>
                                            <span className="text-xs text-gray-500">Médecins</span>
                                        </div>
                                        <div className="h-10 w-px bg-gray-100"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-lg text-gray-900">{org._count?.patients || 0}</span>
                                            <span className="text-xs text-gray-500">Patients</span>
                                        </div>
                                        <div className="h-10 w-px bg-gray-100"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-lg text-green-600">Actif</span>
                                            <span className="text-xs text-gray-500">Statut</span>
                                        </div>
                                    </div>
                                    <Button className="w-full mt-4 bg-gray-50 text-gray-900 hover:bg-blue-600 hover:text-white transition-colors" variant="ghost">
                                        Voir les détails
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                            <Building2 className="h-16 w-16 text-gray-200 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune organisation trouvée</h3>
                            <p className="text-muted-foreground max-w-sm mb-6">
                                Essayez de modifier vos critères de recherche ou ajoutez une nouvelle organisation.
                            </p>
                            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle Organisation
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
