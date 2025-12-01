export type JwtUser = {
    sub: number
    role: 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'ADMIN' | 'DOCTOR' | 'PATIENT'
    doctorId?: number | null
    patientId?: number | null
}

export type HonoEnv = {
    Variables: {
        user: JwtUser
        organizationId?: number
        isSuperAdmin?: boolean
    }
}
