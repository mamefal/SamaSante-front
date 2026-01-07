import { api } from './api'

export interface Medication {
    id: number
    code: string
    name: string
    description?: string
    manufacturer?: string
    form: string // tablet|syrup|injection...
    dosage: string

    unitPrice: number
    prescriptionRequired: boolean

    // Relations
    inventory?: InventoryItem[]
}

export interface InventoryItem {
    id: number
    medicationId: number
    organizationId: number
    quantity: number
    minQuantity: number
    maxQuantity?: number

    batchNumber?: string
    expiryDate?: string
    location?: string

    medication?: Medication
    supplierId?: number
    status: 'ok' | 'low' | 'critical' | 'expired'
}

export interface StockMovement {
    id: number
    type: 'in' | 'out' | 'adjustment' | 'expired' | 'return'
    quantity: number
    inventoryItemId: number
    reference: string
    reason?: string
    performedBy: number
    date: string
}

export const pharmacyService = {
    // Get all medications in catalogue
    getMedications: async () => {
        const response = await api.get('/pharmacy/medications')
        return response.data
    },

    // Get organization inventory
    getInventory: async () => {
        const response = await api.get('/pharmacy/inventory')
        return response.data
    },

    // Add item to inventory
    addToInventory: async (data: any) => {
        const response = await api.post('/pharmacy/inventory', data)
        return response.data
    },

    // Record stock movement (IN/OUT)
    recordMovement: async (data: {
        inventoryItemId: number
        quantity: number
        type: 'in' | 'out' | 'adjustment' | 'expired'
        reason?: string
        reference?: string
    }) => {
        const response = await api.post('/pharmacy/movements', data)
        return response.data
    },

    // Get alerts (low stock, expired)
    getAlerts: async () => {
        const response = await api.get('/pharmacy/alerts')
        return response.data
    },

    // Get stock movements
    getMovements: async () => {
        const response = await api.get('/pharmacy/movements')
        return response.data
    },

    // Get aggregated stats
    getStats: async () => {
        const response = await api.get('/pharmacy/stats')
        return response.data
    },

    // Suppliers
    getSuppliers: async () => {
        const response = await api.get('/suppliers')
        return response.data
    },

    createSupplier: async (data: any) => {
        const response = await api.post('/suppliers', data)
        return response.data
    },

    // Purchase Orders
    getPurchaseOrders: async () => {
        const response = await api.get('/purchase-orders')
        return response.data
    },

    createPurchaseOrder: async (data: any) => {
        const response = await api.post('/purchase-orders', data)
        return response.data
    }
}
