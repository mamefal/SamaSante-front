import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border-none h-32">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm h-[400px]">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm h-[400px]">
                    <Skeleton className="h-full w-full" />
                </div>
            </div>
        </div>
    )
}
