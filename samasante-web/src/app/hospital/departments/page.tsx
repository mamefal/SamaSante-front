"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Users, Edit, Trash2, Building2, Stethoscope, Activity, Loader2, MoreHorizontal } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Department {
    id: number
    name: string
    description?: string
    headDoctorId?: number
    _count: {
        doctors: number
    }
}

export default function HospitalDepartments() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingDept, setEditingDept] = useState<Department | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        description: ""
    })

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            // In production, get organizationId from auth context
            const res = await api.get("/departments?organizationId=1")
            setDepartments(res.data)
        } catch (error) {
            console.error("Error fetching departments:", error)
            toast.error("Erreur lors du chargement des départements")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingDept) {
                await api.put(`/departments/${editingDept.id}`, formData)
                toast.success("Département modifié")
            } else {
                await api.post("/departments", { ...formData, organizationId: 1 })
                toast.success("Département créé")
            }
            setIsDialogOpen(false)
            setFormData({ name: "", description: "" })
            setEditingDept(null)
            fetchDepartments()
        } catch (error) {
            console.error("Error saving department:", error)
            toast.error("Erreur lors de l'enregistrement")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) return

        try {
            await api.delete(`/departments/${id}`)
            toast.success("Département supprimé")
            fetchDepartments()
        } catch (error) {
            console.error("Error deleting department:", error)
            toast.error("Erreur lors de la suppression")
        }
    }

    const openEditDialog = (dept: Department) => {
        setEditingDept(dept)
        setFormData({
            name: dept.name,
            description: dept.description || ""
        })
        setIsDialogOpen(true)
    }

    const openCreateDialog = () => {
        setEditingDept(null)
        setFormData({ name: "", description: "" })
        setIsDialogOpen(true)
    }

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
                    <h1 className="text-3xl font-bold text-gray-900">Départements</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestion des services et spécialités de l&apos;hôpital
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={openCreateDialog}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nouveau Département
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">
                                {editingDept ? "Modifier le département" : "Nouveau département"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">Nom du département</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Cardiologie, Pédiatrie..."
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description des services et activités..."
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    {editingDept ? "Enregistrer" : "Créer le département"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Départements</p>
                                <h3 className="text-3xl font-bold mt-2">{departments.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Médecins</p>
                                <h3 className="text-3xl font-bold mt-2">
                                    {departments.reduce((acc, dept) => acc + (dept._count?.doctors || 0), 0)}
                                </h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Stethoscope className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Activité</p>
                                <h3 className="text-3xl font-bold mt-2 text-green-600">Active</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Activity className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Departments Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.length > 0 ? (
                    departments.map((dept) => (
                        <Card key={dept.id} className="group hover:shadow-lg transition-all duration-300 border-none shadow-sm bg-white">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{dept.name}</CardTitle>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditDialog(dept)}>
                                                <Edit className="mr-2 h-4 w-4" /> Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(dept.id)} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {dept.description && (
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                                        {dept.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <span>{dept._count?.doctors || 0} médecin(s)</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-none">
                                        Actif
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun département</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Commencez par créer les départements de votre établissement pour organiser vos services.
                        </p>
                        <Button onClick={openCreateDialog} variant="outline" className="border-gray-200 text-gray-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Créer le premier département
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
