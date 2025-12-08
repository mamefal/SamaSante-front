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
import { Loader2, ArrowLeft, Heart, Shield, Clock } from "lucide-react"

const isDev = process.env.NODE_ENV === 'development'
const devLog = (...args: any[]) => isDev && console.log(...args)
const devError = (...args: any[]) => isDev && console.error(...args)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      devLog('Attempting login with:', email)
      const res = await api.post("/auth/login", { email, password })
      devLog('Login response:', res.data)

      const role = res.data.user.role
      devLog('User role:', role)

      let redirectUrl = "/patient"
      if (role === "DOCTOR") redirectUrl = "/doctor"
      else if (role === "HOSPITAL_ADMIN") redirectUrl = "/hospital/dashboard"
      else if (role === "SUPER_ADMIN") redirectUrl = "/super-admin"

      setUser(res.data.user)
      toast.success("Connexion réussie")

      devLog('Redirecting to:', redirectUrl)
      devLog('User data:', res.data.user)

      // Forcer la redirection avec window.location.replace
      setTimeout(() => {
        devLog('Executing redirect now to:', redirectUrl)
        window.location.replace(redirectUrl)
      }, 1500) // 1.5 secondes pour être sûr
    } catch (error: any) {
      devError('Login error:', error)
      if (error.response) {
        toast.error(error.response.data.message || "Identifiants invalides")
      } else if (error.request) {
        toast.error("Impossible de contacter le serveur")
      } else {
        toast.error("Une erreur est survenue")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 relative bg-background">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="mx-auto w-full max-w-md fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">SamaSanté</span>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Bon retour !</h1>
            <p className="text-muted-foreground">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-lg"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-lg text-base font-medium btn-scale"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/auth/signup" className="text-primary font-medium hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Info */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-primary text-white relative overflow-hidden">
        <div className="relative z-10 max-w-md text-center">
          <h2 className="text-5xl font-bold mb-6">
            Bienvenue sur SamaSanté
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Votre santé, notre priorité. Accédez à des soins de qualité en quelques clics.
          </p>

          <div className="space-y-6">
            {[
              { icon: Shield, text: "Données 100% sécurisées" },
              { icon: Clock, text: "Disponible 24/7" },
              { icon: Heart, text: "Médecins vérifiés" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-lg font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
