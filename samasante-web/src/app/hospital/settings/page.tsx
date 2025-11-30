"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Save, MapPin, Phone, Mail, AlertTriangle, Globe } from "lucide-react"
import { toast } from "sonner"

export default function HospitalSettings() {
    // Mock data - à remplacer par vraies données de l'organisation
    const hospitalData = {
        name: "Hôpital Principal de Dakar",
        slug: "hopital-principal-dakar",
        type: "hopital",
        region: "Dakar",
        city: "Dakar",
        address: "Avenue Blaise Diagne, Dakar",
        phone: "+221 33 824 56 78",
        email: "contact@hopital-dakar.sn",
        description: "Hôpital principal de la région de Dakar offrant des services médicaux complets"
    }

    const handleSave = () => {
        toast.success("Paramètres sauvegardés avec succès")
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
                    <p className="text-muted-foreground mt-1">
                        Configuration de l'établissement
                    </p>
                </div>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Organization Info */}
                    <Card className="bg-white shadow-sm border-none">
                        <CardHeader className="border-b bg-white px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-gray-900">Informations générales</CardTitle>
                                    <CardDescription>Détails visibles par les patients</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nom de l&apos;établissement</Label>
                                    <Input id="name" defaultValue={hospitalData.name} className="bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-sm font-medium text-gray-700">Identifiant URL</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input id="slug" defaultValue={hospitalData.slug} disabled className="pl-10 bg-gray-100 text-gray-500 border-gray-200" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="text-sm font-medium text-gray-700">Type</Label>
                                    <select
                                        id="type"
                                        className="w-full h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                                        defaultValue={hospitalData.type}
                                    >
                                        <option value="hopital">Hôpital</option>
                                        <option value="clinique">Clinique</option>
                                        <option value="cabinet">Cabinet</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="region" className="text-sm font-medium text-gray-700">Région</Label>
                                    <Input id="region" defaultValue={hospitalData.region} className="bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                                <Textarea
                                    id="description"
                                    defaultValue={hospitalData.description}
                                    rows={4}
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card className="bg-white shadow-sm border-none">
                        <CardHeader className="border-b bg-white px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-gray-900">Coordonnées</CardTitle>
                                    <CardDescription>Moyens de contact</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Adresse complète</Label>
                                <Input id="address" defaultValue={hospitalData.address} className="bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">Ville</Label>
                                    <Input id="city" defaultValue={hospitalData.city} className="bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input id="phone" defaultValue={hospitalData.phone} className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email de contact</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input id="email" type="email" defaultValue={hospitalData.email} className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Danger Zone */}
                <div className="lg:col-span-1">
                    <Card className="bg-white shadow-sm border-none overflow-hidden">
                        <CardHeader className="border-b bg-red-50/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-red-900">Zone de danger</CardTitle>
                                    <CardDescription className="text-red-700/80">Actions irréversibles</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <h4 className="font-semibold text-red-900 mb-2">Désactiver l&apos;établissement</h4>
                                <p className="text-sm text-red-700 mb-4">
                                    Rend votre établissement invisible pour les patients et suspend les rendez-vous.
                                </p>
                                <Button variant="outline" className="w-full bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors">
                                    Désactiver temporairement
                                </Button>
                            </div>

                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <h4 className="font-semibold text-red-900 mb-2">Supprimer le compte</h4>
                                <p className="text-sm text-red-700 mb-4">
                                    Cette action est définitive. Toutes les données seront supprimées.
                                </p>
                                <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                                    Supprimer définitivement
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
