import { api } from './api'

export interface PricingPlan {
    id: number
    name: string
    slug: string
    description: string
    monthlyPrice: number
    yearlyPrice?: number
    maxDoctors?: number
    features: string[]
    includesChat: boolean
    includesPharmacy: boolean
}

export interface Invoice {
    id: number
    invoiceNumber: string
    amount: number
    status: 'pending' | 'paid' | 'overdue'
    dueDate: string
    pdfUrl?: string
}

export const billingService = {
    getPlans: async () => {
        const response = await api.get('/billing/plans')
        return response.data
    },

    getSubscriptions: async () => {
        const response = await api.get('/billing/subscriptions')
        return response.data
    },

    createSubscription: async (data: any) => {
        const response = await api.post('/billing/subscriptions', data)
        return response.data
    },

    getInvoices: async () => {
        const response = await api.get('/billing/invoices')
        return response.data
    },

    payInvoice: async (data: any) => {
        const response = await api.post('/billing/payments', data)
        return response.data
    }
}
