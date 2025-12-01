"use client"

import { HospitalSidebar } from "@/components/hospital/hospital-sidebar"

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background">
            <HospitalSidebar />
            <main className="flex-1 lg:pl-64">
                {children}
            </main>
        </div>
    )
}
