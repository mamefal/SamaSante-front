// src/components/monitoring/activity-chart.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ActivityChartProps {
    title: string
    data: Array<{ date: string; count: number }>
    dataKey?: string
}

export function ActivityChart({ title, data, dataKey = "count" }: ActivityChartProps) {
    // Format data for chart
    const chartData = data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
