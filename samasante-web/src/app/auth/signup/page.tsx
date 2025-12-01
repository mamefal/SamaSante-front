"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { setToken } from "@/lib/auth"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

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
      setToken(res.data.token, res.data.user)
      toast.success("Compte créé avec succès ! Bienvenue sur AMINA")

      // Redirect to patient dashboard
      router.replace("/patient")
    } catch (e) {
      // toast d'erreur déjà géré par l'interceptor axios
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-semibold">AMINA</span>
        </div>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Créer un compte</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Inscription patient - Gratuit et rapide
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
              <Input
                id="firstName"
                placeholder="Jean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-11 rounded-xl border-gray-300 dark:border-gray-700"
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
                className="h-11 rounded-xl border-gray-300 dark:border-gray-700"
                disabled={loading}
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-medium">Date de naissance</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-300 dark:border-gray-700"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-300 dark:border-gray-700"
              disabled={loading}
            />
          </div>

          {/* Password */}
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
              className="h-11 rounded-xl border-gray-300 dark:border-gray-700"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              "Créer mon compte patient"
            )}
          </Button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Vous êtes médecin ?</strong> Les comptes médecins sont créés par votre hôpital. Contactez votre administration.
          </p>
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Vous avez déjà un compte ? </span>
          <Link href="/auth/login" className="text-blue-500 hover:text-blue-600 font-medium">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
