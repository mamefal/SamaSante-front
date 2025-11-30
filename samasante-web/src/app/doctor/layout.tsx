"use client"

import { DoctorSidebar } from "@/components/doctor/doctor-sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/auth/login")
        } else {
            setIsLoading(false)
        }
    }, [router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background">
            <DoctorSidebar />
            <main className="flex-1 lg:pl-64">
                {children}
            </main>
        </div>
    )
}
