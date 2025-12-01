"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Shield, Globe, Database, Mail, Save, Server, Lock, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export default function AdminSettings() {

  const handleSave = () => {
    toast.success("Paramètres sauvegardés avec succès")
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Paramètres Plateforme
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Configuration générale de l'écosystème AMINA
          </p>
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all">
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder tout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Settings className="mr-2 h-5 w-5 text-blue-500" />
              Configuration générale
            </CardTitle>
            <CardDescription>Paramètres de base de la plateforme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Nom de la plateforme</Label>
              <Input id="platform-name" defaultValue="AMINA" className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform-description">Description</Label>
              <Textarea id="platform-description" defaultValue="Plateforme de santé numérique du Sénégal" rows={3} className="bg-gray-50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email de contact</Label>
                <Input id="contact-email" type="email" defaultValue="contact@amina.sn" className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-phone">Téléphone support</Label>
                <Input id="support-phone" defaultValue="+221 33 XXX XX XX" className="bg-gray-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-t-4 border-t-yellow-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Bell className="mr-2 h-5 w-5 text-yellow-500" />
              Notifications
            </CardTitle>
            <CardDescription>Gestion des alertes et notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Notifications email</Label>
                <p className="text-sm text-muted-foreground">Recevoir les alertes par email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alertes KYC</Label>
                <p className="text-sm text-muted-foreground">Notifications pour nouvelles demandes KYC</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Rapports quotidiens</Label>
                <p className="text-sm text-muted-foreground">Résumé quotidien d&apos;activité</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alertes système</Label>
                <p className="text-sm text-muted-foreground">Notifications d&apos;erreurs et maintenance</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-t-4 border-t-red-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Shield className="mr-2 h-5 w-5 text-red-500" />
              Sécurité
            </CardTitle>
            <CardDescription>Paramètres de sécurité et conformité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Délai d&apos;expiration de session (minutes)</Label>
              <Select defaultValue="60">
                <SelectTrigger className="bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                  <SelectItem value="120">2 heures</SelectItem>
                  <SelectItem value="240">4 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Authentification à deux facteurs</Label>
                <p className="text-sm text-muted-foreground">Obligatoire pour les administrateurs</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Audit des connexions</Label>
                <p className="text-sm text-muted-foreground">Enregistrer les tentatives de connexion</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-policy">Politique de mot de passe</Label>
              <Select defaultValue="strong">
                <SelectTrigger className="bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basique (8 caractères min)</SelectItem>
                  <SelectItem value="strong">Forte (12 caractères, majuscules, chiffres)</SelectItem>
                  <SelectItem value="very-strong">Très forte (16 caractères, symboles)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Globe className="mr-2 h-5 w-5 text-green-500" />
              Paramètres régionaux
            </CardTitle>
            <CardDescription>Configuration locale et régionale</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-language">Langue par défaut</Label>
                <Select defaultValue="fr">
                  <SelectTrigger className="bg-gray-50">
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
                <Select defaultValue="GMT">
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GMT">GMT (Dakar)</SelectItem>
                    <SelectItem value="GMT+1">GMT+1</SelectItem>
                    <SelectItem value="GMT-1">GMT-1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select defaultValue="XOF">
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="USD">Dollar US (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Format de date</Label>
                <Select defaultValue="dd/mm/yyyy">
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card className="border-t-4 border-t-purple-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Database className="mr-2 h-5 w-5 text-purple-500" />
              Base de données
            </CardTitle>
            <CardDescription>Maintenance et sauvegarde</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">Sauvegarde quotidienne à 2h00</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-retention">Rétention des sauvegardes (jours)</Label>
              <Select defaultValue="30">
                <SelectTrigger className="bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-3 pt-2">
              <Button variant="outline" className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                <Server className="mr-2 h-4 w-4" />
                Créer une sauvegarde
              </Button>
              <Button variant="outline" className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                <Database className="mr-2 h-4 w-4" />
                Restaurer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="border-t-4 border-t-cyan-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Mail className="mr-2 h-5 w-5 text-cyan-500" />
              Configuration email
            </CardTitle>
            <CardDescription>Paramètres SMTP et templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">Serveur SMTP</Label>
              <Input id="smtp-host" placeholder="smtp.example.com" className="bg-gray-50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Port</Label>
                <Input id="smtp-port" placeholder="587" className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-security">Sécurité</Label>
                <Select defaultValue="tls">
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-username">Nom d&apos;utilisateur</Label>
              <Input id="smtp-username" placeholder="noreply@amina.sn" className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">Mot de passe</Label>
              <Input id="smtp-password" type="password" placeholder="••••••••" className="bg-gray-50" />
            </div>
            <Button variant="outline" className="w-full mt-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50">
              <MessageSquare className="mr-2 h-4 w-4" />
              Tester la configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div >
  )
}
