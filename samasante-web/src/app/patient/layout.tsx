"use client"

import { PatientSidebar } from "@/components/patient/patient-sidebar"

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <PatientSidebar />
            <main className="flex-1 lg:pl-64">
                {children}
            </main>
        </div>
    )
}
