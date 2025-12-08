"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { setUser } from "@/lib/auth"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Heart, CheckCircle2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dob, setDob] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!dob) {
        toast.error("Date de naissance requise")
        setLoading(false)
        return
      }

      const payload = {
        email,
        password,
        role: "PATIENT",
        patient: {
          firstName,
          lastName,
          dob,
        }
      }

      const res = await api.post("/auth/register", payload)
      setUser(res.data.user)
      toast.success("Compte créé avec succès ! Bienvenue sur SamaSanté")

      router.replace("/patient")
    } catch (e) {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md fade-in">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
            <Heart className="text-white h-7 w-7" />
          </div>
          <span className="text-2xl font-bold">SamaSanté</span>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Créer un compte</h1>
          <p className="text-muted-foreground">
            Inscription patient - Gratuit et rapide
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
              <Input
                id="firstName"
                placeholder="Jean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-12 rounded-lg"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
              <Input
                id="lastName"
                placeholder="Dupont"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="h-12 rounded-lg"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-medium">Date de naissance</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="h-12 rounded-lg"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-lg"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 rounded-lg"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium btn-scale"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Création...
              </>
            ) : (
              "Créer mon compte patient"
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">
              <strong>Vous êtes médecin ?</strong> Les comptes médecins sont créés par votre hôpital. Contactez votre administration.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted-foreground">Vous avez déjà un compte ? </span>
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
