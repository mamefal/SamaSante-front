'use client'

import React, { useEffect, useState } from 'react'
import { pharmacyService, InventoryItem } from '@/lib/pharmacy'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    Plus,
    AlertTriangle,
    Package,
    TrendingUp,
    Loader2,
    Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { toast } from 'sonner'

export default function PharmacyDashboard() {
    // ... items state ...
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [movements, setMovements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [alerts, setAlerts] = useState<any>({ lowStock: 0, expired: 0 })
    const [activeTab, setActiveTab] = useState<'inventory' | 'suppliers' | 'orders' | 'movements'>('inventory')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [invData, alertsData, suppliersData, movementsData] = await Promise.all([
                pharmacyService.getInventory(),
                pharmacyService.getAlerts(),
                pharmacyService.getSuppliers(),
                pharmacyService.getMovements()
            ])
            setInventory(invData)
            setSuppliers(suppliersData)
            setMovements(movementsData)
            setAlerts({
                lowStock: alertsData.filter((a: any) => a.type === 'low_stock').length,
                expired: alertsData.filter((a: any) => a.type === 'expired').length
            })
        } catch (error) {
            console.error('Failed to load pharmacy data', error)
            toast.error('Erreur lors du chargement des données')
        } finally {
            setLoading(false)
        }
    }

    const handleAddMedication = () => {
        toast.info("Module d'ajout de médicament en cours de développement", {
            description: "Cette fonctionnalité ouvrira un formulaire modal.",
            action: {
                label: "Compris",
                onClick: () => console.log("Undo")
            }
        })
    }

    const handleManageItem = (item: InventoryItem) => {
        toast.success(`Gestion du stock: ${item.medication?.name}`, {
            description: `Stock actuel: ${item.quantity} - ${item.medication?.form}`
        })
    }

    // ... rest of code until button ...

    const filteredInventory = inventory.filter(item =>
        item.medication?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pharmacie & Stock</h1>
                    <p className="text-muted-foreground">Gérez l'inventaire et les mouvements de médicaments.</p>
                </div>
                <Button onClick={handleAddMedication}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter un médicament
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Références</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inventory.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{alerts.lowStock}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Périmés</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{alerts.expired}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                    Inventaire
                </button>
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors ${activeTab === 'suppliers' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                    Fournisseurs
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                    Commandes
                </button>
                <button
                    onClick={() => setActiveTab('movements')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors ${activeTab === 'movements' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                    Mouvements
                </button>
            </div>

            {activeTab === 'inventory' && (

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Inventaire</CardTitle>
                            <div className="relative w-72">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher (Nom, Lot)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Médicament</TableHead>
                                    <TableHead>Forme</TableHead>
                                    <TableHead>Lot</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Expiration</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInventory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.medication?.name}</TableCell>
                                        <TableCell>{item.medication?.form}</TableCell>
                                        <TableCell>{item.batchNumber}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>
                                            {item.expiryDate ? format(new Date(item.expiryDate), 'dd MMM yyyy', { locale: fr }) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                item.status === 'ok' ? 'default' :
                                                    item.status === 'low' ? 'secondary' : 'destructive'
                                            }>
                                                {item.status === 'ok' ? 'En Stock' :
                                                    item.status === 'low' ? 'Stock Faible' :
                                                        item.status === 'expired' ? 'Périmé' : 'Critique'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleManageItem(item)}>Gérer</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredInventory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            Aucun médicament trouvé
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'suppliers' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des Fournisseurs</CardTitle>
                        <CardDescription>Consultez et gérez vos partenaires d'approvisionnement.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Téléphone</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell>{s.contactName}</TableCell>
                                        <TableCell>{s.email}</TableCell>
                                        <TableCell>{s.phone}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">Contacter</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {suppliers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">Aucun fournisseur enregistré</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'movements' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Historique des Mouvements</CardTitle>
                        <CardDescription>Flux de stock (Entrées, Sorties, Ajustements).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Médicament</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Quantité</TableHead>
                                    <TableHead>Raison</TableHead>
                                    <TableHead>Effectué par</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movements.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell>{format(new Date(m.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                                        <TableCell className="font-medium">{m.inventoryItem?.medication?.name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={m.type === 'in' ? 'default' : m.type === 'out' ? 'destructive' : 'secondary'}>
                                                {m.type === 'in' ? 'Entrée' : m.type === 'out' ? 'Sortie' : m.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={m.type === 'in' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                            {m.type === 'in' ? '+' : '-'}{Math.abs(m.quantity)}
                                        </TableCell>
                                        <TableCell>{m.reason}</TableCell>
                                        <TableCell>{m.user?.name || 'Système'}</TableCell>
                                    </TableRow>
                                ))}
                                {movements.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Aucun mouvement enregistré</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
