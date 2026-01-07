// backend/src/lib/monitoring.ts
import { prisma } from './prisma.js'

export interface SystemStats {
    users: {
        total: number
        byRole: Record<string, number>
    }
    appointments: {
        total: number
        byStatus: Record<string, number>
    }
    doctors: {
        total: number
        verified: number
    }
    patients: {
        total: number
    }
}

export interface SystemHealth {
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

export interface ActivityMetrics {
    appointmentsLast7Days: Array<{ date: string; count: number }>
    usersLast7Days: Array<{ date: string; count: number }>
    activeUsers: number
}

/**
 * Get system statistics
 */
export async function getSystemStats(): Promise<SystemStats> {
    const [
        totalUsers,
        usersByRole,
        totalAppointments,
        appointmentsByStatus,
        totalDoctors,
        verifiedDoctors,
        totalPatients,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.groupBy({
            by: ['role'],
            _count: true,
        }),
        prisma.appointment.count(),
        prisma.appointment.groupBy({
            by: ['status'],
            _count: true,
        }),
        prisma.doctor.count(),
        prisma.doctor.count({ where: { status: 'verified' } }),
        prisma.patient.count(),
    ])

    return {
        users: {
            total: totalUsers,
            byRole: Object.fromEntries(
                usersByRole.map((r) => [r.role, r._count])
            ),
        },
        appointments: {
            total: totalAppointments,
            byStatus: Object.fromEntries(
                appointmentsByStatus.map((s) => [s.status, s._count])
            ),
        },
        doctors: {
            total: totalDoctors,
            verified: verifiedDoctors,
        },
        patients: {
            total: totalPatients,
        },
    }
}

/**
 * Get system health
 */
export async function getSystemHealth(): Promise<SystemHealth> {
    const startTime = Date.now()

    // Test database connection
    let dbStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
    let dbResponseTime = 0

    try {
        await prisma.$queryRaw`SELECT 1`
        dbResponseTime = Date.now() - startTime

        if (dbResponseTime > 1000) {
            dbStatus = 'degraded'
        }
    } catch (error) {
        dbStatus = 'down'
    }

    // Get memory usage
    const memUsage = process.memoryUsage()
    const totalMem = memUsage.heapTotal
    const usedMem = memUsage.heapUsed

    return {
        database: {
            status: dbStatus,
            responseTime: dbResponseTime,
        },
        api: {
            status: 'healthy',
            uptime: process.uptime(),
        },
        memory: {
            used: usedMem,
            total: totalMem,
            percentage: (usedMem / totalMem) * 100,
        },
    }
}

/**
 * Get activity metrics
 */
export async function getActivityMetrics(): Promise<ActivityMetrics> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get appointments for last 7 days
    const appointments = await prisma.appointment.findMany({
        where: {
            createdAt: {
                gte: sevenDaysAgo,
            },
        },
        select: {
            createdAt: true,
        },
    })

    // Get users created in last 7 days
    const users = await prisma.user.findMany({
        where: {
            createdAt: {
                gte: sevenDaysAgo,
            },
        },
        select: {
            createdAt: true,
        },
    })

    // Group by date
    const appointmentsByDate = groupByDate(appointments)
    const usersByDate = groupByDate(users)

    return {
        appointmentsLast7Days: appointmentsByDate,
        usersLast7Days: usersByDate,
        // Utilisateurs actifs : ceux créés au cours des dernières 5 minutes (exemple simple)
        activeUsers: users.filter((u) => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            return u.createdAt >= fiveMinutesAgo
        }).length,
    }
}

/**
 * Helper to group items by date
 */
function groupByDate(items: Array<{ createdAt: Date }>): Array<{ date: string; count: number }> {
    const grouped = new Map<string, number>()

    items.forEach((item) => {
        const date = item.createdAt.toISOString().split('T')[0]
        grouped.set(date, (grouped.get(date) || 0) + 1)
    })

    return Array.from(grouped.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
}
