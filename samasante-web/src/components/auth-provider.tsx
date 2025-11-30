"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    useEffect(() => {
        const handleUnauthorized = () => {
            localStorage.removeItem("token")
            router.push("/auth/login")
        }

        window.addEventListener("auth:unauthorized", handleUnauthorized)

        return () => {
            window.removeEventListener("auth:unauthorized", handleUnauthorized)
        }
    }, [router])

    return <>{children}</>
}
