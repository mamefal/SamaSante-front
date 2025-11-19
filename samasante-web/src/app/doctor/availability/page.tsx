import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Clock, Plus, Edit, Trash2, Save } from "lucide-react"

export default async function DoctorAvailability() {
  const supabase = await createClient()

  // Mock availability data
  const weeklySchedule = [
    {
      day: "Lundi",
      dayCode: "monday",
      isActive: true,
      slots: [
        { start: "09:00", end: "12:00", type: "morning" },
        { start: "14:00", end: "17:00", type: "afternoon" },
      ],
    },
    {
      day: "Mardi",
      dayCode: "tuesday",
      isActive: true,
      slots: [
        { start: "09:00", end: "12:00", type: "morning" },
        { start: "14:00", end: "17:00", type: "afternoon" },
      ],
    },
    {
      day: "Mercredi",
      dayCode: "wednesday",
      isActive: true,
      slots: [{ start: "09:00", end: "12:00", type: "morning" }],
    },
    {
      day: "Jeudi",
      dayCode: "thursday",
      isActive: true,
      slots: [
        { start: "09:00", end: "12:00", type: "morning" },
        { start: "14:00", end: "17:00", type: "afternoon" },
      ],
    },
    {
      day: "Vendredi",
      dayCode: "friday",
      isActive: true,
      slots: [{ start: "09:00", end: "12:00", type: "morning" }],
    },
    {
      day: "Samedi",
      dayCode: "saturday",
      isActive: false,
      slots: [],
    },
    {
      day: "Dimanche",
      dayCode: "sunday",
      isActive: false,
      slots: [],
    },
  ]

  const consultationSettings = {
    defaultDuration: 30,
    bufferTime: 15,
    maxAdvanceBooking: 30,
    allowSameDayBooking: true,
    consultationFee: 25000,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes disponibilités</h1>
          <p className="text-muted-foreground">Configurez vos créneaux de consultation</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>

      {/* Consultation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Paramètres de consultation
          </CardTitle>
          <CardDescription>Configuration générale de vos consultations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée par défaut (minutes)</Label>
              <Select defaultValue={consultationSettings.defaultDuration.toString()}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer">Temps de pause (minutes)</Label>
              <Select defaultValue={consultationSettings.bufferTime.toString()}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Aucun</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee">Tarif consultation (FCFA)</Label>
              <Input id="fee" type="number" defaultValue={consultationSettings.consultationFee} placeholder="25000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance">Réservation à l'avance (jours)</Label>
              <Select defaultValue={consultationSettings.maxAdvanceBooking.toString()}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="14">14 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="same-day" defaultChecked={consultationSettings.allowSameDayBooking} />
              <Label htmlFor="same-day">Autoriser RDV le jour même</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Planning hebdomadaire</CardTitle>
          <CardDescription>Définissez vos créneaux de disponibilité pour chaque jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {weeklySchedule.map((daySchedule) => (
              <div key={daySchedule.dayCode} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Switch defaultChecked={daySchedule.isActive} />
                    <h3 className="font-medium">{daySchedule.day}</h3>
                    {!daySchedule.isActive && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Fermé
                      </Badge>
                    )}
                  </div>
                  {daySchedule.isActive && (
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter créneau
                    </Button>
                  )}
                </div>

                {daySchedule.isActive && (
                  <div className="space-y-3">
                    {daySchedule.slots.map((slot, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">De</Label>
                          <Input type="time" defaultValue={slot.start} className="w-32" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">À</Label>
                          <Input type="time" defaultValue={slot.end} className="w-32" />
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {slot.type === "morning" ? "Matin" : "Après-midi"}
                        </Badge>
                        <div className="flex space-x-2 ml-auto">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 bg-transparent">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {daySchedule.slots.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">Aucun créneau défini</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Modèles rapides</CardTitle>
          <CardDescription>Appliquez des horaires prédéfinis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-dashed">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Temps plein</h3>
                <p className="text-sm text-muted-foreground">Lun-Ven: 9h-12h, 14h-17h</p>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                  Appliquer
                </Button>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-dashed">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Matinées</h3>
                <p className="text-sm text-muted-foreground">Lun-Ven: 9h-12h</p>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                  Appliquer
                </Button>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-dashed">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Personnalisé</h3>
                <p className="text-sm text-muted-foreground">Créer un nouveau modèle</p>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                  Créer
                </Button>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
