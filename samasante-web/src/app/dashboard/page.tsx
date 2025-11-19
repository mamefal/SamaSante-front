import { redirect } from "next/navigation"
import { createClient} from "@prisma/client/"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Activity, Settings } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const user = data.user
  const userType = user.user_metadata?.user_type || "patient"
  const firstName = user.user_metadata?.first_name || ""
  const lastName = user.user_metadata?.last_name || ""

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">SAMASANTE</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Bonjour, {firstName} {lastName}
              </span>
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm" type="submit">
                  Déconnexion
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tableau de bord {userType === "doctor" ? "Médecin" : userType === "admin" ? "Administrateur" : "Patient"}
          </h1>
          <p className="text-muted-foreground">Bienvenue sur votre espace SAMASANTE</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rendez-vous</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {userType === "doctor" ? "Consultations prévues" : "RDV à venir"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userType === "doctor" ? "Patients" : userType === "admin" ? "Utilisateurs" : "Consultations"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {userType === "doctor" ? "Patients suivis" : userType === "admin" ? "Comptes actifs" : "Historique"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activité</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paramètres</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">✓</div>
              <p className="text-xs text-muted-foreground">Profil configuré</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              {userType === "doctor"
                ? "Gérez vos consultations et patients"
                : userType === "admin"
                  ? "Administration de la plateforme"
                  : "Prenez rendez-vous et gérez votre santé"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {userType === "patient" && (
                <>
                  <Button className="h-20 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    Prendre RDV
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Users className="h-6 w-6 mb-2" />
                    Mes médecins
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Activity className="h-6 w-6 mb-2" />
                    Mon dossier
                  </Button>
                </>
              )}

              {userType === "doctor" && (
                <>
                  <Button className="h-20 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    Mon agenda
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Users className="h-6 w-6 mb-2" />
                    Mes patients
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Settings className="h-6 w-6 mb-2" />
                    Mon profil
                  </Button>
                </>
              )}

              {userType === "admin" && (
                <>
                  <Button className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Gestion KYC
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Activity className="h-6 w-6 mb-2" />
                    Statistiques
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Settings className="h-6 w-6 mb-2" />
                    Configuration
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
