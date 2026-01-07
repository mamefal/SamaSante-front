import React from 'react'


import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

// Données factices – à remplacer par les vraies données d'API
const dummyData = [
    { date: '2024-11-01', appointments: 12 },
    { date: '2024-11-08', appointments: 9 },
    { date: '2024-11-15', appointments: 15 },
    { date: '2024-11-22', appointments: 7 },
    { date: '2024-11-29', appointments: 13 },
]

export default function AppointmentChart() {
    return (
        <div className="h-64 w-full bg-white rounded-lg shadow">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

