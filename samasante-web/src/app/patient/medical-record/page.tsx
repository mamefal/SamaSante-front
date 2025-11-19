import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function MedicalRecord() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user?.id).single()

  // Get completed appointments with medical notes
  const { data: consultations } = await supabase
    .from("appointments")
    .select(`
      *,
      doctors (
        first_name,
        last_name,
        speciality
      )
    `)
    .eq("patient_id", user?.id)
    .eq("status", "completed")
    .order("appointment_date", { ascending: false })
    .limit(10)

  const medicalInfo = {
    bloodType: profile?.blood_type || "Non renseigné",
    allergies: profile?.allergies || "Aucune allergie connue",
    chronicConditions: profile?.chronic_conditions || "Aucune condition chronique",
    emergencyContact: profile?.emergency_contact || "Non renseigné",
  }

  const vitalSigns = [
    { label: "Poids", value: "70 kg", date: "15 Jan 2024", status: "normal" },
    { label: "Taille", value: "175 cm", date: "15 Jan 2024", status: "normal" },
    { label: "Tension", value: "120/80", date: "10 Jan 2024", status: "normal" },
    { label: "Température", value: "36.5°C", date: "10 Jan 2024", status: "normal" },
  ]

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <h1 className="text-xl font-bold">Mon dossier médical</h1>
        <p className="text-blue-100 text-sm">Informations médicales personnelles</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Personal Medical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations médicales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Groupe sanguin</p>
                <p className="font-semibold">{medicalInfo.bloodType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Contact d'urgence</p>
                <p className="font-semibold">{medicalInfo.emergencyContact}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Allergies</p>
              <p className="text-sm bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">{medicalInfo.allergies}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Conditions chroniques</p>
              <p className="text-sm bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                {medicalInfo.chronicConditions}
              </p>
            </div>

            <Button variant="outline" size="sm" className="w-full bg-transparent">
              Modifier les informations
            </Button>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Signes vitaux récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {vitalSigns.map((vital, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{vital.label}</p>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                      Normal
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{vital.value}</p>
                  <p className="text-xs text-gray-500">{vital.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Consultations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consultations récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {consultations && consultations.length > 0 ? (
              consultations.map((consultation: any) => (
                <div key={consultation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {consultation.doctors?.first_name?.[0]}
                          {consultation.doctors?.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          Dr. {consultation.doctors?.first_name} {consultation.doctors?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{consultation.doctors?.speciality}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(consultation.appointment_date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {consultation.diagnosis && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Diagnostic</p>
                      <p className="text-sm">{consultation.diagnosis}</p>
                    </div>
                  )}

                  {consultation.prescription && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Prescription</p>
                      <p className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-400">
                        {consultation.prescription}
                      </p>
                    </div>
                  )}

                  {consultation.notes && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Notes</p>
                      <p className="text-sm">{consultation.notes}</p>
                    </div>
                  )}

                  <Button variant="ghost" size="sm" className="mt-2 text-blue-600">
                    Voir les détails complets
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Aucune consultation enregistrée</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documents médicaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Résultats d'analyses</p>
                    <p className="text-xs text-gray-500">15 Jan 2024</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  Voir
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Ordonnance</p>
                    <p className="text-xs text-gray-500">10 Jan 2024</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  Voir
                </Button>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter un document
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
