import { api } from './api'

export interface VaccinationRecord {
    id: number
    vaccineName: string
    date: string
    batchNumber?: string
    performedBy?: number
    nextDueDate?: string
    status: 'done' | 'pending' | 'overdue'
}

export interface GrowthRecord {
    id: number
    date: string
    weight?: number
    height?: number
    headCircumference?: number
    notes?: string
    percentiles?: any // JSON
    weightPercentile?: number
    heightPercentile?: number
    bmiPercentile?: number
}

export interface HealthDocument {
    id: number
    name: string
    type: string
    url: string
    uploadedBy: number
    createdAt: string
    category: 'lab_result' | 'prescription' | 'imaging' | 'report' | 'other'
}

export interface FamilyMember {
    id: number
    firstName: string
    lastName: string
    relationship: 'child' | 'spouse' | 'parent' | 'other'
    dateOfBirth: string
}

export const patientPortalService = {
    // Vaccinations
    getVaccinations: async (patientId?: number) => {
        const url = patientId ? `/patient-portal/family/${patientId}/vaccinations` : '/patient-portal/vaccinations'
        const response = await api.get(url)
        return response.data
    },

    // Growth Records
    getGrowthRecords: async (patientId?: number) => {
        const url = patientId ? `/patient-portal/family/${patientId}/growth` : '/patient-portal/growth'
        const response = await api.get(url)
        return response.data
    },

    addGrowthRecord: async (data: any) => {
        const response = await api.post('/patient-portal/growth', data)
        return response.data
    },

    // Documents
    getDocuments: async (patientId?: number) => {
        // If accessing family member docs, we might need a specific endpoint or filter
        // For now assuming the main /documents endpoint handles context or using portal specific routes
        const url = patientId ? `/patient-portal/family/${patientId}/documents` : '/patient-portal/documents'
        const response = await api.get(url)
        return response.data
    },

    uploadDocument: async (file: File, category: string, patientId?: number) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)
        if (patientId) formData.append('patientId', patientId.toString())

        const response = await api.post('/patient-portal/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    },

    // Family
    getFamilyMembers: async () => {
        const response = await api.get('/patient-portal/family')
        return response.data
    },

    addFamilyMember: async (data: any) => {
        const response = await api.post('/patient-portal/family', data)
        return response.data
    },

    // Medical File (Allergies, History)
    getMedicalFile: async () => {
        const response = await api.get('/patient-portal/medical-file')
        return response.data
    },

    updateMedicalFile: async (data: any) => {
        const response = await api.patch('/patient-portal/medical-file', data)
        return response.data
    },

    // Sharing
    shareMedicalFile: async (data: any) => {
        const response = await api.post('/patient-portal/medical-file/share', data)
        return response.data
    },

    getShares: async () => {
        const response = await api.get('/patient-portal/medical-file/shares')
        return response.data
    }
}
