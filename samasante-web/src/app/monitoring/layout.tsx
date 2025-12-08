
// src/app/monitoring/layout.tsx
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Monitoring - SamaSanté",
    description: "Dashboard de monitoring système",
}

export default function MonitoringLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
