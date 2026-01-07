// src/app/monitoring/layout.tsx
import { Metadata } from "next"

export const metadata = {
    title: "Monitoring - AMINA",
    description: "Monitoring système",
}

export default function MonitoringLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
