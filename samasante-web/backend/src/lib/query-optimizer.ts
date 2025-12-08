// backend/src/lib/query-optimizer.ts
import { Prisma } from '@prisma/client'

/**
 * Optimisation des queries Prisma
 */

// Select minimal fields pour listes
export const minimalUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
} satisfies Prisma.UserSelect

export const minimalPatientSelect = {
    id: true,
    firstName: true,
    lastName: true,
    dob: true,
    phone: true,
    email: true,
} satisfies Prisma.PatientSelect

export const minimalDoctorSelect = {
    id: true,
    firstName: true,
    lastName: true,
    specialty: true,
    phonePublic: true,
    emailPublic: true,
} satisfies Prisma.DoctorSelect

export const minimalAppointmentSelect = {
    id: true,
    start: true,
    end: true,
    status: true,
    motive: true,
    patientId: true,
    doctorId: true,
} satisfies Prisma.AppointmentSelect

// Pagination helper
export interface PaginationParams {
    page?: number
    limit?: number
}

export interface PaginatedResult<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

export function getPaginationParams(params: PaginationParams) {
    const page = Math.max(1, params.page || 1)
    const limit = Math.min(100, Math.max(1, params.limit || 20))
    const skip = (page - 1) * limit

    return { page, limit, skip }
}

export function buildPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit)

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    }
}

// Query optimization helpers
export function optimizeIncludes<T extends Record<string, any>>(
    include: T,
    maxDepth: number = 2
): T {
    // Limiter la profondeur des includes pour éviter N+1
    // En production, utiliser dataloader ou similar
    return include
}

// Batch loading helper
export async function batchLoad<T, K>(
    keys: K[],
    loader: (keys: K[]) => Promise<T[]>
): Promise<Map<K, T>> {
    const results = await loader(keys)
    const map = new Map<K, T>()

    results.forEach((result: any, index) => {
        map.set(keys[index]!, result)
    })

    return map
}

// Query performance monitoring
export async function measureQuery<T>(
    queryName: string,
    query: () => Promise<T>
): Promise<T> {
    const start = Date.now()

    try {
        const result = await query()
        const duration = Date.now() - start

        if (duration > 1000) {
            console.warn(`⚠️  Slow query: ${queryName} took ${duration}ms`)
        }

        return result
    } catch (error) {
        const duration = Date.now() - start
        console.error(`❌ Query error: ${queryName} failed after ${duration}ms`, error)
        throw error
    }
}
