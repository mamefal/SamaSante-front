"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplet,
  AlertCircle,
  Heart,
  Bell,
  Globe,
  Video,
  Save,
  Lock,
  Trash2,
  HelpCircle,
  Shield,
  Edit
} from "lucide-react"
import { toast } from "sonner"

export default function PatientProfile() {
  // Mock user data
  const [profile, setProfile] = useState({
    first_name: "Moussa",
    last_name: "Ndiaye",
    email: "patient@samasante.sn",
    phone: "+221 77 123 45 67",
    date_of_birth: "1990-01-01",
    address: "Sicap Liberté, Dakar",
    blood_type: "O+",
    emergency_contact: "+221 77 000 00 00",
    allergies: "Arachides",
    chronic_conditions: "Aucune",
  })

  const [preferences, setPreferences] = useState({
    smsNotifications: true,
    emailNotifications: true,
    teleconsultation: false,
    language: "fr"
  })

  const handleSave = () => {
    toast.success("Profil mis à jour avec succès")
  }

  const handlePasswordChange = () => {
    toast.info("Fonctionnalité à venir")
  }

  const handleDeleteAccount = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      toast.error("Suppression du compte annulée")
    }
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
      <div className="p-8 space-y-8">
        {/* Header with Avatar */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {profile.first_name?.[0]}
                {profile.last_name?.[0]}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-emerald-500 hover:bg-emerald-50 transition-colors">
              <Edit className="h-4 w-4 text-emerald-600" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {profile.first_name} {profile.last_name}
            </h1>
            <div className="flex items-center mt-2 text-gray-600">
              <Mail className="h-4 w-4 mr-2 text-emerald-500" />
              {profile.email}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal & Medical Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-l-4 border-l-emerald-500 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <User className="h-5 w-5 mr-2 text-emerald-600" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                      Prénom
                    </Label>
                    <Input
                      id="firstName"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                      Nom
                    </Label>
                    <Input
                      id="lastName"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                      <Phone className="h-4 w-4 inline mr-1 text-emerald-500" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+221 XX XXX XX XX"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 inline mr-1 text-emerald-500" />
                      Date de Naissance
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile.date_of_birth}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                    <MapPin className="h-4 w-4 inline mr-1 text-emerald-500" />
                    Adresse
                  </Label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Votre adresse complète au Sénégal"
                    rows={2}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="border-l-4 border-l-red-500 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Informations Médicales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType" className="text-sm font-semibold text-gray-700">
                      <Droplet className="h-4 w-4 inline mr-1 text-red-500" />
                      Groupe Sanguin
                    </Label>
                    <Select value={profile.blood_type} onValueChange={(value) => setProfile({ ...profile, blood_type: value })}>
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-sm font-semibold text-gray-700">
                      <Phone className="h-4 w-4 inline mr-1 text-orange-500" />
                      Contact d'Urgence
                    </Label>
                    <Input
                      id="emergencyContact"
                      value={profile.emergency_contact}
                      onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
                      placeholder="+221 XX XXX XX XX"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm font-semibold text-gray-700">
                    <AlertCircle className="h-4 w-4 inline mr-1 text-orange-500" />
                    Allergies
                  </Label>
                  <Textarea
                    id="allergies"
                    value={profile.allergies}
                    onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                    placeholder="Listez vos allergies connues (médicaments, aliments, etc.)"
                    rows={2}
                    className="bg-orange-50 border-orange-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronicConditions" className="text-sm font-semibold text-gray-700">
                    <Heart className="h-4 w-4 inline mr-1 text-blue-500" />
                    Conditions Chroniques
                  </Label>
                  <Textarea
                    id="chronicConditions"
                    value={profile.chronic_conditions}
                    onChange={(e) => setProfile({ ...profile, chronic_conditions: e.target.value })}
                    placeholder="Maladies chroniques, traitements en cours, etc."
                    rows={2}
                    className="bg-blue-50 border-blue-200"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preferences & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Preferences */}
            <Card className="border-l-4 border-l-teal-500 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-teal-600" />
                  Préférences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Notifications SMS</p>
                    <p className="text-xs text-gray-500">Rappels de RDV par SMS</p>
                  </div>
                  <Switch
                    checked={preferences.smsNotifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, smsNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Notifications Email</p>
                    <p className="text-xs text-gray-500">Confirmations par email</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      <Video className="h-4 w-4 inline mr-1" />
                      Téléconsultation
                    </p>
                    <p className="text-xs text-gray-500">Consultations à distance</p>
                  </div>
                  <Switch
                    checked={preferences.teleconsultation}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, teleconsultation: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-semibold text-gray-700">
                    <Globe className="h-4 w-4 inline mr-1 text-teal-500" />
                    Langue Préférée
                  </Label>
                  <Select value={preferences.language} onValueChange={(value) => setPreferences({ ...preferences, language: value })}>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="wo">Wolof</SelectItem>
                      <SelectItem value="ar">Arabe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les Modifications
              </Button>

              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
                onClick={handlePasswordChange}
              >
                <Lock className="h-4 w-4 mr-2" />
                Changer le Mot de Passe
              </Button>

              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer le Compte
              </Button>
            </div>

            {/* Support */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900">Besoin d'aide ?</p>
                    <p className="text-sm text-blue-700 mt-1">Contactez notre support client pour toute question</p>
                    <Button size="sm" variant="outline" className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100">
                      Contacter le Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
