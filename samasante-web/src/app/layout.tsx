import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "sonner"
import "./globals.css"

// Tu peux remplacer par les polices que tu veux (par ex. Geist n'est pas dispo nativement)
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "AMINA - Plateforme de Santé Numérique du Sénégal",
  description:
    "Prenez rendez-vous avec les meilleurs médecins du Sénégal. Plateforme de santé numérique moderne et sécurisée.",
  generator: "AMINA",
}
import { AuthProvider } from "@/components/auth-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster richColors closeButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

