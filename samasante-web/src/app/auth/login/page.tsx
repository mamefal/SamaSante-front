"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { setToken, setUser } from "@/lib/auth"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

// Logger conditionnel pour le développement uniquement
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

      // Determine redirect URL based on role
      const role = res.data.user.role
      devLog('User role:', role)

      let redirectUrl = "/patient"
      if (role === "DOCTOR") {
        redirectUrl = "/doctor"
      } else if (role === "HOSPITAL_ADMIN") {
        redirectUrl = "/hospital/dashboard"
      } else if (role === "SUPER_ADMIN") {
        redirectUrl = "/super-admin"
      }

      // Save user data only (token is in HttpOnly cookie)
      setUser(res.data.user)
      toast.success("Connexion réussie")

      devLog('Redirecting to:', redirectUrl)

      // Show loading overlay during redirect
      toast.loading("Redirection en cours...", { id: "redirect" })

      // Force cache refresh with timestamp and location.replace
      setTimeout(() => {
        // Add timestamp to force cache refresh
        const cacheBustUrl = `${redirectUrl}?_t=${Date.now()}`
        // Use replace instead of href to prevent back button issues
        window.location.replace(cacheBustUrl)
      }, 1000)  // 1 second pour garantir que le cookie est disponible
    } catch (error: any) {
      devError('Login error:', error)

      if (error.response) {
        // Server responded with error
        devError('Error response:', error.response.data)
        toast.error(error.response.data.message || "Identifiants invalides")
      } else if (error.request) {
        // Request made but no response
        devError('No response received:', error.request)
        toast.error("Impossible de contacter le serveur")
      } else {
        // Something else happened
        devError('Error message:', error.message)
        toast.error("Une erreur est survenue")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Connexion en cours...</p>
          </div>
        </div>
      )}

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
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Connexion</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Accédez à votre espace AMINA
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-300 dark:border-gray-700"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>

        {/* Signup Link */}
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Pas encore de compte ? </span>
          <Link href="/auth/signup" className="text-blue-500 hover:text-blue-600 font-medium">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}
