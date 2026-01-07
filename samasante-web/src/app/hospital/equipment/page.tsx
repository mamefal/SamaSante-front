"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Monitor,
    Wrench,
    Search,
    Plus,
    Filter,
    CheckCircle,
    Calendar,
    MoreHorizontal,
    Edit,
    Trash2,
    Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function HospitalEquipment() {
    const [searchTerm, setSearchTerm] = useState("")
    const [equipmentList, setEquipmentList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [currentItem, setCurrentItem] = useState<any>(null)

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        department: "",
        status: "operational",
        serialNumber: "",
        lastMaintenance: "",
        nextMaintenance: ""
    })

    useEffect(() => {
        fetchEquipment()
    }, [])

    const fetchEquipment = async () => {
        try {
            const res = await api.get("/equipment")
            setEquipmentList(res.data)
        } catch (error) {
            console.error("Error fetching equipment:", error)
            toast.error("Erreur lors du chargement des équipements")
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Format dates to ISO if present
            const payload = {
                ...formData,
                lastMaintenance: formData.lastMaintenance ? new Date(formData.lastMaintenance).toISOString() : undefined,
                nextMaintenance: formData.nextMaintenance ? new Date(formData.nextMaintenance).toISOString() : undefined
            }

            if (currentItem) {
                await api.put(`/equipment/${currentItem.id}`, payload)
                toast.success("Équipement modifié avec succès")
            } else {
                await api.post("/equipment", payload)
                toast.success("Équipement ajouté avec succès")
            }

            setIsAddOpen(false)
            setIsEditOpen(false)
            setCurrentItem(null)
            resetForm()
            fetchEquipment()
        } catch (error) {
            console.error("Error saving equipment:", error)
            toast.error("Erreur lors de l'enregistrement")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) return
        try {
            await api.delete(`/equipment/${id}`)
            toast.success("Équipement supprimé")
            fetchEquipment()
        } catch (error) {
            console.error("Error deleting equipment:", error)
            toast.error("Erreur lors de la suppression")
        }
    }

    const openEdit = (item: any) => {
        setCurrentItem(item)
        setFormData({
            name: item.name,
            type: item.type,
            department: item.department || "",
            status: item.status,
            serialNumber: item.serialNumber || "",
            lastMaintenance: item.lastMaintenance ? item.lastMaintenance.split('T')[0] : "",
            nextMaintenance: item.nextMaintenance ? item.nextMaintenance.split('T')[0] : ""
        })
        setIsEditOpen(true)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            type: "",
            department: "",
            status: "operational",
            serialNumber: "",
            lastMaintenance: "",
            nextMaintenance: ""
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "operational":
                return "bg-green-100 text-green-700 hover:bg-green-200 border-none"
            case "maintenance":
                return "bg-orange-100 text-orange-700 hover:bg-orange-200 border-none animate-pulse"
            case "broken":
                return "bg-red-100 text-red-700 hover:bg-red-200 border-none"
            default:
                return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
        }
    }

    const filteredList = equipmentList.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        total: equipmentList.length,
        operational: equipmentList.filter(i => i.status === 'operational').length,
        maintenance: equipmentList.filter(i => i.status === 'maintenance').length
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
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
                <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un Équipement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Ajouter un équipement</DialogTitle>
                            <DialogDescription>
                                Créez une nouvelle entrée dans l'inventaire.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nom</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Type</Label>
                                <Input id="type" name="type" value={formData.type} onChange={handleInputChange} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="department" className="text-right">Département</Label>
                                <Input id="department" name="department" value={formData.department} onChange={handleInputChange} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="serialNumber" className="text-right">N° Série</Label>
                                <Input id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Statut</Label>
                                <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Sélectionner un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="operational">Opérationnel</SelectItem>
                                        <SelectItem value="maintenance">En maintenance</SelectItem>
                                        <SelectItem value="broken">Hors service</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                        <DialogFooter>
                            <Button type="submit" onClick={handleSubmit}>Enregistrer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setCurrentItem(null); resetForm(); } }}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Modifier l'équipement</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">Nom</Label>
                                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-type" className="text-right">Type</Label>
                                <Input id="edit-type" name="type" value={formData.type} onChange={handleInputChange} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-department" className="text-right">Département</Label>
                                <Input id="edit-department" name="department" value={formData.department} onChange={handleInputChange} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-serialNumber" className="text-right">N° Série</Label>
                                <Input id="edit-serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-status" className="text-right">Statut</Label>
                                <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Sélectionner un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="operational">Opérationnel</SelectItem>
                                        <SelectItem value="maintenance">En maintenance</SelectItem>
                                        <SelectItem value="broken">Hors service</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-lastMaintenance" className="text-right">Dernière Maint.</Label>
                                <Input type="date" id="edit-lastMaintenance" name="lastMaintenance" value={formData.lastMaintenance} onChange={handleInputChange} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-nextMaintenance" className="text-right">Prochaine Maint.</Label>
                                <Input type="date" id="edit-nextMaintenance" name="nextMaintenance" value={formData.nextMaintenance} onChange={handleInputChange} className="col-span-3" />
                            </div>
                        </form>
                        <DialogFooter>
                            <Button type="submit" onClick={handleSubmit}>Mettre à jour</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Équipements</p>
                                <h3 className="text-3xl font-bold mt-2">{stats.total}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Monitor className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">En Service</p>
                                <h3 className="text-3xl font-bold mt-2 text-green-600">{stats.operational}</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">En Maintenance</p>
                                <h3 className="text-3xl font-bold mt-2 text-orange-600">{stats.maintenance}</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Wrench className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
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
                        {filteredList.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-gray-50/80 transition-colors gap-4 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        h-12 w-12 rounded-xl flex items-center justify-center shadow-sm border
                                        ${item.status === 'operational' ? 'bg-green-50 border-green-100 text-green-600' :
                                            item.status === 'maintenance' ? 'bg-orange-50 border-orange-100 text-orange-600' :
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
                                            {item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString('fr-FR') : '-'}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> Prochaine
                                        </div>
                                        <span className={`font-medium text-sm ${item.status === 'maintenance' ? 'text-orange-600' : 'text-gray-900'}`}>
                                            {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString('fr-FR') : '-'}
                                        </span>
                                    </div>

                                    <Badge className={`${getStatusColor(item.status)} px-3 py-1`}>
                                        {item.status === 'operational' ? 'En service' : item.status === 'maintenance' ? 'En maintenance' : 'Hors service'}
                                    </Badge>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => openEdit(item)}>
                                                <Edit className="mr-2 h-4 w-4" /> Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Wrench className="mr-2 h-4 w-4" /> Planifier maintenance
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>
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
