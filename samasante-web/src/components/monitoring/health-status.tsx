// src/components/monitoring/health-status.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react"

interface HealthStatusProps {
    database: {
        status: 'healthy' | 'degraded' | 'down'
        responseTime: number
    }
    api: {
        status: 'healthy' | 'degraded' | 'down'
        uptime: number
    }
    memory: {
        used: number
        total: number
        percentage: number
    }
}

export function HealthStatus({ database, api, memory }: HealthStatusProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />
            case 'degraded':
                return <AlertCircle className="h-4 w-4 text-orange-600" />
            case 'down':
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                return null
        }
    }

    const getStatusBadge = (status: string) => {
        const variant = status === 'healthy' ? 'default' : status === 'degraded' ? 'secondary' : 'destructive'
        return <Badge variant={variant as any}>{status}</Badge>
    }

    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}h ${minutes}m`
    }

    const formatMemory = (bytes: number) => {
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Santé du Système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Database */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getStatusIcon(database.status)}
                        <span className="font-medium">Base de données</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(database.status)}
                        <span className="text-sm text-muted-foreground">
                            {database.responseTime}ms
                        </span>
                    </div>
                </div>

                {/* API */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getStatusIcon(api.status)}
                        <span className="font-medium">API</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(api.status)}
                        <span className="text-sm text-muted-foreground">
                            Uptime: {formatUptime(api.uptime)}
                        </span>
                    </div>
                </div>

                {/* Memory */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Mémoire</span>
                        <span className="text-sm text-muted-foreground">
                            {formatMemory(memory.used)} / {formatMemory(memory.total)}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${memory.percentage > 80 ? 'bg-red-600' :
                                    memory.percentage > 60 ? 'bg-orange-600' :
                                        'bg-green-600'
                                }`}
                            style={{ width: `${memory.percentage}%` }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {memory.percentage.toFixed(1)}% utilisé
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
