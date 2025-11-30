"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, UserCog, Mail, Phone, Building2, Edit, Trash2, Stethoscope, Loader2, Filter, ArrowUpDown, MoreHorizontal } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Doctor {
    id: number
    firstName: string
    lastName: string
    specialty: string
    phonePublic?: string
    emailPublic?: string
    status: string
    department?: {
        id: number
        name: string
    }
    _count?: {
        appointments: number
    }
}

interface Department {
    id: number
    name: string
}

export default function HospitalDoctors() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        specialty: "",
        phonePublic: "",
        emailPublic: "",
        departmentId: ""
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [doctorsRes, deptsRes] = await Promise.all([
                api.get("/doctors?organizationId=1"),
                api.get("/departments?organizationId=1")
            ])
            setDoctors(doctorsRes.data)
            setDepartments(deptsRes.data)
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Erreur lors du chargement")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingDoctor) {
                await api.put(`/doctors/${editingDoctor.id}`, {
                    ...formData,
                    departmentId: formData.departmentId ? Number(formData.departmentId) : null
                })
                toast.success("Médecin modifié")
            } else {
                await api.post("/doctors", {
                    ...formData,
                    organizationId: 1,
                    departmentId: formData.departmentId ? Number(formData.departmentId) : null,
                    status: "verified"
                })
                toast.success("Médecin ajouté")
            }
            setIsDialogOpen(false)
            resetForm()
            fetchData()
        } catch (error) {
            console.error("Error saving doctor:", error)
            toast.error("Erreur lors de l'enregistrement")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce médecin ?")) return

        try {
            await api.delete(`/doctors/${id}`)
            toast.success("Médecin supprimé")
            fetchData()
        } catch (error) {
            console.error("Error deleting doctor:", error)
            toast.error("Erreur lors de la suppression")
        }
    }

    const openEditDialog = (doctor: Doctor) => {
        setEditingDoctor(doctor)
        setFormData({
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            specialty: doctor.specialty,
            phonePublic: doctor.phonePublic || "",
            emailPublic: doctor.emailPublic || "",
            departmentId: doctor.department?.id.toString() || ""
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setEditingDoctor(null)
        setFormData({
            firstName: "",
            lastName: "",
            specialty: "",
            phonePublic: "",
            emailPublic: "",
            departmentId: ""
        })
    }

    const filteredDoctors = doctors.filter(doc =>
        doc.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Médecins</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestion du personnel médical et des spécialistes
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={resetForm}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un Médecin
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">
                                {editingDoctor ? "Modifier le médecin" : "Nouveau médecin"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Prénom</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Nom</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialty">Spécialité</Label>
                                <Input
                                    id="specialty"
                                    value={formData.specialty}
                                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                    placeholder="Ex: Cardiologie, Pédiatrie..."
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Département</Label>
                                <Select
                                    value={formData.departmentId}
                                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Sélectionner un département" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phonePublic}
                                        onChange={(e) => setFormData({ ...formData, phonePublic: e.target.value })}
                                        placeholder="+221 77 123 45 67"
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.emailPublic}
                                        onChange={(e) => setFormData({ ...formData, emailPublic: e.target.value })}
                                        placeholder="dr.nom@hopital.sn"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    {editingDoctor ? "Enregistrer" : "Ajouter le médecin"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Médecins</p>
                                <h3 className="text-3xl font-bold mt-2">{doctors.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Stethoscope className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Spécialités</p>
                                <h3 className="text-3xl font-bold mt-2">{new Set(doctors.map(d => d.specialty)).size}</h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Building2 className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Départements</p>
                                <h3 className="text-3xl font-bold mt-2">{departments.length}</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <UserCog className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
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
                                placeholder="Rechercher un médecin..."
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
                        {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doctor) => (
                                <div
                                    key={doctor.id}
                                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-gray-50/80 transition-colors gap-4 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                                                {doctor.firstName[0]}{doctor.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                Dr. {doctor.firstName} {doctor.lastName}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-normal">
                                                    {doctor.specialty}
                                                </Badge>
                                                {doctor.department && (
                                                    <span className="flex items-center gap-1 text-gray-400">
                                                        <span>•</span>
                                                        <span>{doctor.department.name}</span>
                                                    </span>
                                                )}
                                            </div>
                                            {(doctor.phonePublic || doctor.emailPublic) && (
                                                <div className="text-sm text-gray-400 mt-2 flex flex-wrap gap-4">
                                                    {doctor.phonePublic && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Phone className="h-3 w-3" />
                                                            {doctor.phonePublic}
                                                        </span>
                                                    )}
                                                    {doctor.emailPublic && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Mail className="h-3 w-3" />
                                                            {doctor.emailPublic}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                        <Badge variant={doctor.status === 'verified' ? 'default' : 'secondary'} className={doctor.status === 'verified' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none' : ''}>
                                            {doctor.status === 'verified' ? 'Vérifié' : doctor.status}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEditDialog(doctor)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDelete(doctor.id)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Stethoscope className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun médecin trouvé</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                    Essayez de modifier vos critères de recherche ou ajoutez un nouveau médecin.
                                </p>
                                <Button onClick={resetForm} variant="outline" className="border-gray-200 text-gray-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter un médecin
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
