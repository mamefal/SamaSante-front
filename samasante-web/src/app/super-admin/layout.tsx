import { AdminSidebar } from "@/components/super-admin/admin-sidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 lg:pl-64">
                {children}
            </main>
        </div>
    )
}
