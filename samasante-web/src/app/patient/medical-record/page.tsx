'use client'

import React, { useEffect, useState } from 'react'
import {
  patientPortalService,
  VaccinationRecord,
  GrowthRecord,
  HealthDocument
} from '@/lib/patient-portal'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Syringe,
  Activity,
  Download,
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  ShieldAlert,
  ClipboardList,
  User,
  Heart
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { generateMedicalReportPDF } from '@/lib/pdf-generator'

export default function MedicalRecordPage() {
  const [loading, setLoading] = useState(true)
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([])
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [documents, setDocuments] = useState<HealthDocument[]>([])
  const [medicalFile, setMedicalFile] = useState<any>(null)

  // Dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)

  // Forms
  const [historyForm, setHistoryForm] = useState({
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    emergencyContact: ''
  })
  const [newMeasurement, setNewMeasurement] = useState({
    weight: '',
    height: '',
    ageInMonths: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [vaccineData, growthData, docData, medicalData] = await Promise.all([
        patientPortalService.getVaccinations(),
        patientPortalService.getGrowthRecords(),
        patientPortalService.getDocuments(),
        patientPortalService.getMedicalFile()
      ])
      setVaccinations(vaccineData)
      setGrowthRecords(growthData)
      setDocuments(docData)
      setMedicalFile(medicalData)
      if (medicalData) {
        setHistoryForm({
          bloodType: medicalData.bloodType || '',
          allergies: medicalData.allergies || '',
          chronicConditions: medicalData.chronicConditions || '',
          emergencyContact: medicalData.emergencyContact || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch medical records', error)
      toast.error("Erreur lors du chargement du carnet de santé")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    generateMedicalReportPDF({
      patientName: "Moussa Ndiaye",
      patientDob: "1990-01-01",
      doctorName: "SamaSanté Team",
      date: new Date().toISOString(),
      consultationType: "Export complet du carnet de santé",
      observations: `Le patient présente un historique de ${vaccinations.length} vaccinations et ${growthRecords.length} mesures de croissance enregistrées.`,
      diagnosis: "Bilan de santé général",
      treatment: "Suivi régulier recommandé.",
      nextSteps: "Consulter les documents joints pour plus de détails."
    })

    toast.success('Le carnet de santé a été exporté en PDF')
  }

  const handleUpdateHistory = async () => {
    try {
      await patientPortalService.updateMedicalFile(historyForm)
      toast.success("Dossier médical mis à jour")
      setIsHistoryDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleAddMeasurement = async () => {
    try {
      if (!newMeasurement.weight && !newMeasurement.height) {
        toast.error("Veuillez saisir au moins le poids ou la taille")
        return
      }

      await patientPortalService.addGrowthRecord({
        patientId: 1, // Dynamiser avec l'auth
        measuredAt: new Date().toISOString(),
        ageInMonths: parseInt(newMeasurement.ageInMonths) || 0,
        weight: parseFloat(newMeasurement.weight) || undefined,
        height: parseFloat(newMeasurement.height) || undefined,
        notes: newMeasurement.notes
      })

      toast.success("Mesure ajoutée avec succès")
      setIsAddDialogOpen(false)
      fetchData()
      setNewMeasurement({ weight: '', height: '', ageInMonths: '', notes: '' })
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la mesure")
    }
  }

  const handleDownloadDoc = (docName: string) => {
    toast.success(`Téléchargement de ${docName}`, {
      description: "Veuillez patienter..."
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Carnet de Santé</h1>
          <p className="text-muted-foreground">Accédez à votre historique médical numérique.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button onClick={() => setIsHistoryDialogOpen(true)}>
            <ClipboardList className="mr-2 h-4 w-4" /> Antécédents
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Groupe Sanguin</p>
                <p className="text-2xl font-bold">{medicalFile?.bloodType || 'NR'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Allergies</p>
                <p className="text-2xl font-bold">{medicalFile?.allergies ? 'Oui' : 'Aucune'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Syringe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vaccins</p>
                <p className="text-2xl font-bold">{vaccinations.filter(v => v.status === 'done').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dernier Poids</p>
                <p className="text-2xl font-bold">{growthRecords.length > 0 ? `${growthRecords[growthRecords.length - 1].weight} kg` : '--'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vaccinations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vaccinations" className="flex items-center gap-2">
            <Syringe className="h-4 w-4" /> Vaccinations
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Croissance
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Documents
          </TabsTrigger>
        </TabsList>

        {/* VACCINATIONS */}
        <TabsContent value="vaccinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique de Vaccination</CardTitle>
              <CardDescription>Consultez vos vaccins passés et à venir.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {vaccinations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Aucun vaccin enregistré.</p>
                ) : (
                  vaccinations.map((vac) => (
                    <div key={vac.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="font-semibold">{vac.vaccineName}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {format(new Date(vac.date), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                        <p className="text-xs text-gray-500">Lot: {vac.batchNumber || 'N/A'}</p>
                      </div>
                      <Badge variant={vac.status === 'done' ? 'default' : 'outline'}>
                        {vac.status === 'done' ? 'Effectué' : 'À venir'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GROWTH */}
        <TabsContent value="growth" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Courbe de Poids</CardTitle>
                <CardDescription>Évolution du poids par rapport aux normes OMS.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthRecords}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="ageInMonths"
                        label={{ value: 'Âge (mois)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis label={{ value: 'Poids (kg)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#2563eb"
                        strokeWidth={2}
                        name="Poids du patient"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Dernières Mesures</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Poids</th>
                          <th className="px-3 py-2">Perc.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {growthRecords.slice(-5).reverse().map((record) => (
                          <tr key={record.id} className="border-b">
                            <td className="px-3 py-2">{format(new Date(record.date), 'dd/MM/yy')}</td>
                            <td className="px-3 py-2 font-medium">{record.weight} kg</td>
                            <td className="px-3 py-2">
                              {record.weightPercentile ? (
                                <Badge variant={record.weightPercentile < 10 || record.weightPercentile > 90 ? 'destructive' : 'secondary'}>
                                  {record.weightPercentile}%
                                </Badge>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* DOCUMENTS */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents Médicaux</CardTitle>
              <CardDescription>Ordonnances, résultats d&apos;analyse et certificats.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documents.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Aucun document disponible</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <p className="font-medium leading-none truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{doc.category.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(doc.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadDoc(doc.name)}>
                        <Download className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Measurement Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter une mesure</DialogTitle>
            <DialogDescription>
              Saisissez les données de croissance pour le suivi pédiatrique.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">Âge (mois)</Label>
              <Input
                id="age"
                type="number"
                value={newMeasurement.ageInMonths}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, ageInMonths: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">Poids (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={newMeasurement.weight}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="height" className="text-right">Taille (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={newMeasurement.height}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, height: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddMeasurement}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Dossier Médical</DialogTitle>
            <DialogDescription>
              Mettez à jour vos antécédents et informations vitales.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bloodType">Groupe Sanguin</Label>
              <Input
                id="bloodType"
                placeholder="Ex: A+"
                value={historyForm.bloodType}
                onChange={(e) => setHistoryForm({ ...historyForm, bloodType: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                placeholder="Listez vos allergies..."
                value={historyForm.allergies}
                onChange={(e) => setHistoryForm({ ...historyForm, allergies: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="conditions">Maladies Chroniques</Label>
              <Textarea
                id="conditions"
                placeholder="Ex: Diabète, Hypertension..."
                value={historyForm.chronicConditions}
                onChange={(e) => setHistoryForm({ ...historyForm, chronicConditions: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergency">Contact d'Urgence</Label>
              <Input
                id="emergency"
                placeholder="Nom et numéro..."
                value={historyForm.emergencyContact}
                onChange={(e) => setHistoryForm({ ...historyForm, emergencyContact: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateHistory}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
