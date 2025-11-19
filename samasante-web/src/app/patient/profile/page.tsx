import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default async function PatientProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user?.id).single()

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {profile?.first_name?.[0]}
              {profile?.last_name?.[0]}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {profile?.first_name} {profile?.last_name}
            </h1>
            <p className="text-cyan-100">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Prénom
                </Label>
                <Input id="firstName" defaultValue={profile?.first_name || ""} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Nom
                </Label>
                <Input id="lastName" defaultValue={profile?.last_name || ""} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  defaultValue={profile?.phone || ""}
                  className="mt-1"
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date de naissance
                </Label>
                <Input id="dateOfBirth" type="date" defaultValue={profile?.date_of_birth || ""} className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium">
                Adresse
              </Label>
              <Textarea
                id="address"
                defaultValue={profile?.address || ""}
                className="mt-1"
                placeholder="Votre adresse complète au Sénégal"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations médicales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodType" className="text-sm font-medium">
                  Groupe sanguin
                </Label>
                <select
                  id="bloodType"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  defaultValue={profile?.blood_type || ""}
                >
                  <option value="">Sélectionner</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <Label htmlFor="emergencyContact" className="text-sm font-medium">
                  Contact d'urgence
                </Label>
                <Input
                  id="emergencyContact"
                  defaultValue={profile?.emergency_contact || ""}
                  className="mt-1"
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="allergies" className="text-sm font-medium">
                Allergies
              </Label>
              <Textarea
                id="allergies"
                defaultValue={profile?.allergies || ""}
                className="mt-1"
                placeholder="Listez vos allergies connues (médicaments, aliments, etc.)"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="chronicConditions" className="text-sm font-medium">
                Conditions chroniques
              </Label>
              <Textarea
                id="chronicConditions"
                defaultValue={profile?.chronic_conditions || ""}
                className="mt-1"
                placeholder="Maladies chroniques, traitements en cours, etc."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Préférences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications SMS</p>
                <p className="text-sm text-gray-500">Recevoir des rappels de RDV par SMS</p>
              </div>
              <input type="checkbox" className="w-4 h-4" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications email</p>
                <p className="text-sm text-gray-500">Recevoir des confirmations par email</p>
              </div>
              <input type="checkbox" className="w-4 h-4" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Téléconsultation</p>
                <p className="text-sm text-gray-500">Accepter les consultations à distance</p>
              </div>
              <input type="checkbox" className="w-4 h-4" />
            </div>

            <div>
              <Label htmlFor="preferredLanguage" className="text-sm font-medium">
                Langue préférée
              </Label>
              <select
                id="preferredLanguage"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                defaultValue="fr"
              >
                <option value="fr">Français</option>
                <option value="wo">Wolof</option>
                <option value="ar">Arabe</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Sauvegarder les modifications</Button>

          <Button variant="outline" className="w-full bg-transparent">
            Changer le mot de passe
          </Button>

          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
            Supprimer le compte
          </Button>
        </div>

        {/* Support */}
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900">Besoin d'aide ?</p>
                <p className="text-sm text-blue-700">Contactez notre support client</p>
              </div>
              <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 bg-transparent">
                Contacter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
