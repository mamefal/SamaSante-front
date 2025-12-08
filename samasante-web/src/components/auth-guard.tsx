"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getRole, type UserRole } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
    children: React.ReactNode
    allowedRoles: UserRole[]
    redirectTo?: string
}

export function AuthGuard({ children, allowedRoles, redirectTo = "/auth/login" }: AuthGuardProps) {
    const router = useRouter()

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            router.push(redirectTo)
            return
        }

        // Check if user has required role
        const userRole = getRole()
        if (userRole && !allowedRoles.includes(userRole)) {
            // Redirect to appropriate dashboard based on role
            switch (userRole) {
                case "DOCTOR":
                    router.push("/doctor")
                    break
                case "PATIENT":
                    router.push("/patient")
                    break
                case "HOSPITAL_ADMIN":
                    router.push("/hospital/dashboard")
                    break
                case "SUPER_ADMIN":
                    router.push("/super-admin")
                    break
                default:
                    router.push("/")
            }
        }
    }, [router, allowedRoles, redirectTo])

    // Show loading while checking auth
    if (!isAuthenticated()) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const userRole = getRole()
    if (userRole && !allowedRoles.includes(userRole)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return <>{children}</>
}
