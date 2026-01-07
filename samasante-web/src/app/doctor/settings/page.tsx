"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Shield, Calendar, User, Save, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { getDoctorId } from "@/lib/auth"
import { toast } from "sonner"

export default function DoctorSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      newAppointment: true,
      reminders: true,
      cancellations: true,
      reviews: false
    },
    calendar: {
      defaultView: "week",
      startTime: "08:00",
      endTime: "18:00",
      showWeekends: false
    },
    privacy: {
      publicProfile: true,
      showReviews: true,
      dataSharing: false,
      retention: "24"
    },
    system: {
      language: "fr",
      timezone: "GMT",
      theme: "light",
      compactMode: false
    },
    backup: {
      autoBackup: true
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const doctorId = getDoctorId()
    if (!doctorId) return

    try {
      const res = await api.get(`/doctors/${doctorId}`)
      if (res.data && res.data.settings) {
        // Merge with default settings to ensure all keys exist
        setSettings(prev => ({
          ...prev,
          ...res.data.settings
        }))
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Erreur lors du chargement des paramètres")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const doctorId = getDoctorId()
    if (!doctorId) return

    setSaving(true)
    try {
      await api.patch(`/doctors/${doctorId}/settings`, settings)
      toast.success("Paramètres sauvegardés")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground">Configurez vos préférences et paramètres</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Sauvegarder
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Compte
            </CardTitle>
            <CardDescription>Paramètres de votre compte médecin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input id="current-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" placeholder="••••••••" />
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Gérez vos préférences de notification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nouveaux rendez-vous</Label>
                <p className="text-sm text-muted-foreground">Recevoir une notification pour chaque nouveau RDV</p>
              </div>
              <Switch
                checked={settings.notifications.newAppointment}
                onCheckedChange={(checked) => updateSetting('notifications', 'newAppointment', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rappels de consultation</Label>
                <p className="text-sm text-muted-foreground">Rappel 30 minutes avant chaque consultation</p>
              </div>
              <Switch
                checked={settings.notifications.reminders}
                onCheckedChange={(checked) => updateSetting('notifications', 'reminders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Annulations</Label>
                <p className="text-sm text-muted-foreground">Notification en cas d'annulation de RDV</p>
              </div>
              <Switch
                checked={settings.notifications.cancellations}
                onCheckedChange={(checked) => updateSetting('notifications', 'cancellations', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nouveaux avis patients</Label>
                <p className="text-sm text-muted-foreground">Notification pour les nouveaux commentaires</p>
              </div>
              <Switch
                checked={settings.notifications.reviews}
                onCheckedChange={(checked) => updateSetting('notifications', 'reviews', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Calendar Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Agenda
            </CardTitle>
            <CardDescription>Paramètres de votre agenda médical</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-view">Vue par défaut</Label>
              <Select
                value={settings.calendar.defaultView}
                onValueChange={(value) => updateSetting('calendar', 'defaultView', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Jour</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">Heure de début</Label>
              <Select
                value={settings.calendar.startTime}
                onValueChange={(value) => updateSetting('calendar', 'startTime', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="07:00">07:00</SelectItem>
                  <SelectItem value="08:00">08:00</SelectItem>
                  <SelectItem value="09:00">09:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">Heure de fin</Label>
              <Select
                value={settings.calendar.endTime}
                onValueChange={(value) => updateSetting('calendar', 'endTime', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="17:00">17:00</SelectItem>
                  <SelectItem value="18:00">18:00</SelectItem>
                  <SelectItem value="19:00">19:00</SelectItem>
                  <SelectItem value="20:00">20:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Afficher les week-ends</Label>
                <p className="text-sm text-muted-foreground">Inclure samedi et dimanche dans l'agenda</p>
              </div>
              <Switch
                checked={settings.calendar.showWeekends}
                onCheckedChange={(checked) => updateSetting('calendar', 'showWeekends', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Confidentialité
            </CardTitle>
            <CardDescription>Paramètres de confidentialité et sécurité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profil public</Label>
                <p className="text-sm text-muted-foreground">Permettre aux patients de voir votre profil</p>
              </div>
              <Switch
                checked={settings.privacy.publicProfile}
                onCheckedChange={(checked) => updateSetting('privacy', 'publicProfile', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Afficher les avis</Label>
                <p className="text-sm text-muted-foreground">Rendre les avis patients visibles publiquement</p>
              </div>
              <Switch
                checked={settings.privacy.showReviews}
                onCheckedChange={(checked) => updateSetting('privacy', 'showReviews', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Partage de données</Label>
                <p className="text-sm text-muted-foreground">Autoriser l'analyse anonyme des données</p>
              </div>
              <Switch
                checked={settings.privacy.dataSharing}
                onCheckedChange={(checked) => updateSetting('privacy', 'dataSharing', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-retention">Rétention des données (mois)</Label>
              <Select
                value={settings.privacy.retention}
                onValueChange={(value) => updateSetting('privacy', 'retention', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 mois</SelectItem>
                  <SelectItem value="24">24 mois</SelectItem>
                  <SelectItem value="36">36 mois</SelectItem>
                  <SelectItem value="60">5 ans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Système
            </CardTitle>
            <CardDescription>Préférences système et interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Select
                value={settings.system.language}
                onValueChange={(value) => updateSetting('system', 'language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="wo">Wolof</SelectItem>
                  <SelectItem value="en">Anglais</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <Select
                value={settings.system.timezone}
                onValueChange={(value) => updateSetting('system', 'timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GMT">GMT (Dakar)</SelectItem>
                  <SelectItem value="GMT+1">GMT+1</SelectItem>
                  <SelectItem value="GMT-1">GMT-1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Thème</Label>
              <Select
                value={settings.system.theme}
                onValueChange={(value) => updateSetting('system', 'theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode compact</Label>
                <p className="text-sm text-muted-foreground">Interface plus dense pour plus d'informations</p>
              </div>
              <Switch
                checked={settings.system.compactMode}
                onCheckedChange={(checked) => updateSetting('system', 'compactMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup & Export */}
        <Card>
          <CardHeader>
            <CardTitle>Sauvegarde et export</CardTitle>
            <CardDescription>Gérez vos données et sauvegardes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">Sauvegarde hebdomadaire de vos données</p>
              </div>
              <Switch
                checked={settings.backup.autoBackup}
                onCheckedChange={(checked) => updateSetting('backup', 'autoBackup', checked)}
              />
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full bg-transparent">
                Exporter mes données
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Télécharger la sauvegarde
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
