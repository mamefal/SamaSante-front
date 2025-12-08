"use client"

import { DoctorSidebar } from "@/components/doctor/doctor-sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard allowedRoles={["DOCTOR"]}>
            <div className="flex min-h-screen bg-background">
                <DoctorSidebar />
                <main className="flex-1 lg:pl-64">
                    {children}
                </main>
            </div>
        </AuthGuard>
    )
}
