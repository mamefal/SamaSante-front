import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

export const pharmacy = new Hono<HonoEnv>()

// ============================================
// MEDICATIONS (Catalogue)
// ============================================

/**
 * GET /medications
 * Liste des médicaments
 */
pharmacy.get('/medications',
    requireAuth(['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN']),
    async (c) => {
        try {
            const search = c.req.query('search')
            const category = c.req.query('category')
            const limit = parseInt(c.req.query('limit') || '50')
            const offset = parseInt(c.req.query('offset') || '0')

            const where: any = {
                isActive: true
            }

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { genericName: { contains: search, mode: 'insensitive' } },
                    { dci: { contains: search, mode: 'insensitive' } }
                ]
            }

            if (category) {
                where.category = category
            }

            const [medications, total] = await Promise.all([
                prisma.medication.findMany({
                    where,
                    take: limit,
                    skip: offset,
                    orderBy: { name: 'asc' }
                }),
                prisma.medication.count({ where })
            ])

            return c.json({
                medications,
                total,
                limit,
                offset
            })
        } catch (error) {
            console.error('Failed to fetch medications:', error)
            return c.json({ error: 'Erreur lors de la récupération des médicaments' }, 500)
        }
    }
)

/**
 * POST /medications
 * Créer un médicament
 */
const CreateMedicationSchema = z.object({
    name: z.string().min(1),
    genericName: z.string().optional(),
    category: z.string(),
    form: z.string(),
    dosage: z.string(),
    barcode: z.string().optional(),
    dci: z.string().optional(),
    manufacturer: z.string().optional(),
    requiresPrescription: z.boolean().default(true),
    unitPrice: z.number().optional(),
    description: z.string().optional(),
    sideEffects: z.string().optional(),
    contraindications: z.string().optional()
})

pharmacy.post('/medications',
    requireAuth(['HOSPITAL_ADMIN', 'SUPER_ADMIN']),
    zValidator('json', CreateMedicationSchema),
    async (c) => {
        const data = c.req.valid('json')

        try {
            const medication = await prisma.medication.create({
                data
            })

            return c.json(medication, 201)
        } catch (error) {
            console.error('Failed to create medication:', error)
            return c.json({ error: 'Erreur lors de la création du médicament' }, 500)
        }
    }
)

/**
 * GET /medications/:id
 * Détails d'un médicament
 */
pharmacy.get('/medications/:id',
    requireAuth(['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN']),
    async (c) => {
        const id = parseInt(c.req.param('id'))

        try {
            const medication = await prisma.medication.findUnique({
                where: { id },
                include: {
                    inventoryItems: {
                        include: {
                            organization: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            })

            if (!medication) {
                return c.json({ error: 'Médicament non trouvé' }, 404)
            }

            return c.json(medication)
        } catch (error) {
            console.error('Failed to fetch medication:', error)
            return c.json({ error: 'Erreur lors de la récupération du médicament' }, 500)
        }
    }
)

// ============================================
// INVENTORY (Stock par organisation)
// ============================================

/**
 * GET /inventory
 * Inventaire de l'organisation
 */
pharmacy.get('/inventory',
    requireAuth(['HOSPITAL_ADMIN', 'DOCTOR']),
    async (c) => {
        const user = c.get('user') as any

        if (!user.organizationId) {
            return c.json({ error: 'Organisation non définie' }, 400)
        }

        try {
            const lowStock = c.req.query('lowStock') === 'true'
            const expiringSoon = c.req.query('expiringSoon') === 'true'

            const where: any = {
                organizationId: user.organizationId
            }

            // Filtre stock bas
            if (lowStock) {
                where.quantity = {
                    lte: prisma.inventoryItem.fields.minQuantity
                }
            }

            // Filtre péremption proche (30 jours)
            if (expiringSoon) {
                const thirtyDaysFromNow = new Date()
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

                where.expiryDate = {
                    lte: thirtyDaysFromNow,
                    gte: new Date()
                }
            }

            const inventory = await prisma.inventoryItem.findMany({
                where,
                include: {
                    medication: true,
                    alerts: {
                        where: {
                            isResolved: false
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            })

            const inventoryWithStatus = inventory.map(item => {
                let status = 'ok'
                if (item.quantity <= 0) status = 'critical'
                else if (item.quantity <= item.minQuantity) status = 'low'

                if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
                    status = 'expired'
                }

                return { ...item, status }
            })

            return c.json(inventoryWithStatus)
        } catch (error) {
            console.error('Failed to fetch inventory:', error)
            return c.json({ error: 'Erreur lors de la récupération de l\'inventaire' }, 500)
        }
    }
)

/**
 * POST /inventory
 * Ajouter un médicament à l'inventaire
 */
const AddInventorySchema = z.object({
    medicationId: z.number(),
    quantity: z.number().min(0),
    minQuantity: z.number().min(0).default(10),
    maxQuantity: z.number().optional(),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    location: z.string().optional()
})

pharmacy.post('/inventory',
    requireAuth(['HOSPITAL_ADMIN']),
    zValidator('json', AddInventorySchema),
    async (c) => {
        const user = c.get('user') as any
        const data = c.req.valid('json')

        if (!user.organizationId) {
            return c.json({ error: 'Organisation non définie' }, 400)
        }

        try {
            const inventoryItem = await prisma.inventoryItem.create({
                data: {
                    ...data,
                    organizationId: user.organizationId,
                    expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined
                },
                include: {
                    medication: true
                }
            })

            // Créer le mouvement de stock initial
            await prisma.stockMovement.create({
                data: {
                    inventoryItemId: inventoryItem.id,
                    type: 'in',
                    quantity: data.quantity,
                    previousQuantity: 0,
                    newQuantity: data.quantity,
                    reason: 'Stock initial',
                    userId: user.id
                }
            })

            return c.json(inventoryItem, 201)
        } catch (error) {
            console.error('Failed to add inventory:', error)
            return c.json({ error: 'Erreur lors de l\'ajout à l\'inventaire' }, 500)
        }
    }
)

/**
 * PUT /inventory/:id
 * Mettre à jour un item d'inventaire
 */
const UpdateInventorySchema = z.object({
    quantity: z.number().min(0).optional(),
    minQuantity: z.number().min(0).optional(),
    maxQuantity: z.number().optional(),
    location: z.string().optional()
})

pharmacy.put('/inventory/:id',
    requireAuth(['HOSPITAL_ADMIN']),
    zValidator('json', UpdateInventorySchema),
    async (c) => {
        const user = c.get('user') as any
        const id = parseInt(c.req.param('id'))
        const data = c.req.valid('json')

        try {
            const item = await prisma.inventoryItem.findUnique({
                where: { id }
            })

            if (!item) {
                return c.json({ error: 'Item non trouvé' }, 404)
            }

            if (item.organizationId !== user.organizationId) {
                return c.json({ error: 'Accès refusé' }, 403)
            }

            const updated = await prisma.inventoryItem.update({
                where: { id },
                data,
                include: {
                    medication: true
                }
            })

            return c.json(updated)
        } catch (error) {
            console.error('Failed to update inventory:', error)
            return c.json({ error: 'Erreur lors de la mise à jour' }, 500)
        }
    }
)

// ============================================
// STOCK MOVEMENTS
// ============================================

/**
 * POST /inventory/:id/movements
 * Enregistrer un mouvement de stock
 */
const StockMovementSchema = z.object({
    type: z.enum(['in', 'out', 'adjustment', 'expired', 'damaged']),
    quantity: z.number(),
    reason: z.string().optional(),
    referenceType: z.string().optional(),
    referenceId: z.number().optional(),
    notes: z.string().optional()
})

pharmacy.post('/inventory/:id/movements',
    requireAuth(['HOSPITAL_ADMIN', 'DOCTOR']),
    zValidator('json', StockMovementSchema),
    async (c) => {
        const user = c.get('user') as any
        const inventoryItemId = parseInt(c.req.param('id'))
        const { type, quantity, reason, referenceType, referenceId, notes } = c.req.valid('json')

        try {
            const item = await prisma.inventoryItem.findUnique({
                where: { id: inventoryItemId }
            })

            if (!item) {
                return c.json({ error: 'Item non trouvé' }, 404)
            }

            if (item.organizationId !== user.organizationId) {
                return c.json({ error: 'Accès refusé' }, 403)
            }

            // Calculer la nouvelle quantité
            let newQuantity = item.quantity
            if (type === 'in') {
                newQuantity += quantity
            } else {
                newQuantity -= quantity
            }

            if (newQuantity < 0) {
                return c.json({ error: 'Stock insuffisant' }, 400)
            }

            // Créer le mouvement
            const movement = await prisma.stockMovement.create({
                data: {
                    inventoryItemId,
                    type,
                    quantity: type === 'in' ? quantity : -quantity,
                    previousQuantity: item.quantity,
                    newQuantity,
                    reason,
                    referenceType,
                    referenceId,
                    notes,
                    userId: user.id
                }
            })

            // Mettre à jour la quantité
            await prisma.inventoryItem.update({
                where: { id: inventoryItemId },
                data: { quantity: newQuantity }
            })

            // Vérifier et créer des alertes si nécessaire
            await checkAndCreateAlerts(inventoryItemId, newQuantity, item)

            return c.json(movement, 201)
        } catch (error) {
            console.error('Failed to create stock movement:', error)
            return c.json({ error: 'Erreur lors de l\'enregistrement du mouvement' }, 500)
        }
    }
)

/**
 * GET /inventory/:id/movements
 * Historique des mouvements
 */
pharmacy.get('/inventory/:id/movements',
    requireAuth(['HOSPITAL_ADMIN', 'DOCTOR']),
    async (c) => {
        const user = c.get('user') as any
        const inventoryItemId = parseInt(c.req.param('id'))
        const limit = parseInt(c.req.query('limit') || '50')

        try {
            const item = await prisma.inventoryItem.findUnique({
                where: { id: inventoryItemId }
            })

            if (!item) {
                return c.json({ error: 'Item non trouvé' }, 404)
            }

            if (item.organizationId !== user.organizationId) {
                return c.json({ error: 'Accès refusé' }, 403)
            }

            const movements = await prisma.stockMovement.findMany({
                where: { inventoryItemId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            role: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            })

            return c.json(movements)
        } catch (error) {
            console.error('Failed to fetch movements:', error)
            return c.json({ error: 'Erreur lors de la récupération de l\'historique' }, 500)
        }
    }
)

// ============================================
// ALERTS
// ============================================

/**
 * GET /alerts
 * Alertes de stock
 */
pharmacy.get('/alerts',
    requireAuth(['HOSPITAL_ADMIN', 'DOCTOR']),
    async (c) => {
        const user = c.get('user') as any

        if (!user.organizationId) {
            return c.json({ error: 'Organisation non définie' }, 400)
        }

        try {
            const resolved = c.req.query('resolved') === 'true'

            const alerts = await prisma.stockAlert.findMany({
                where: {
                    inventoryItem: {
                        organizationId: user.organizationId
                    },
                    isResolved: resolved
                },
                include: {
                    inventoryItem: {
                        include: {
                            medication: true
                        }
                    },
                    resolver: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            return c.json(alerts)
        } catch (error) {
            console.error('Failed to fetch alerts:', error)
            return c.json({ error: 'Erreur lors de la récupération des alertes' }, 500)
        }
    }
)

/**
 * PUT /alerts/:id/resolve
 * Résoudre une alerte
 */
pharmacy.put('/alerts/:id/resolve',
    requireAuth(['HOSPITAL_ADMIN']),
    async (c) => {
        const user = c.get('user') as any
        const id = parseInt(c.req.param('id'))

        try {
            const alert = await prisma.stockAlert.findUnique({
                where: { id },
                include: {
                    inventoryItem: true
                }
            })

            if (!alert) {
                return c.json({ error: 'Alerte non trouvée' }, 404)
            }

            if (alert.inventoryItem.organizationId !== user.organizationId) {
                return c.json({ error: 'Accès refusé' }, 403)
            }

            const resolved = await prisma.stockAlert.update({
                where: { id },
                data: {
                    isResolved: true,
                    resolvedAt: new Date(),
                    resolvedBy: user.id
                }
            })

            return c.json(resolved)
        } catch (error) {
            console.error('Failed to resolve alert:', error)
            return c.json({ error: 'Erreur lors de la résolution de l\'alerte' }, 500)
        }
    }
)

// ============================================
// STATISTICS
// ============================================

/**
 * GET /stats
 * Statistiques de la pharmacie
 */
pharmacy.get('/stats',
    requireAuth(['HOSPITAL_ADMIN']),
    async (c) => {
        const user = c.get('user') as any

        if (!user.organizationId) {
            return c.json({ error: 'Organisation non définie' }, 400)
        }

        try {
            const [
                totalItems,
                lowStockCount,
                expiringSoonCount,
                expiredCount,
                totalValue,
                unresolvedAlerts
            ] = await Promise.all([
                // Total items
                prisma.inventoryItem.count({
                    where: { organizationId: user.organizationId }
                }),
                // Low stock
                prisma.inventoryItem.count({
                    where: {
                        organizationId: user.organizationId,
                        quantity: {
                            lte: prisma.inventoryItem.fields.minQuantity
                        }
                    }
                }),
                // Expiring soon (30 days)
                prisma.inventoryItem.count({
                    where: {
                        organizationId: user.organizationId,
                        expiryDate: {
                            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            gte: new Date()
                        }
                    }
                }),
                // Expired
                prisma.inventoryItem.count({
                    where: {
                        organizationId: user.organizationId,
                        expiryDate: {
                            lt: new Date()
                        }
                    }
                }),
                // Total value (approximation)
                prisma.inventoryItem.findMany({
                    where: { organizationId: user.organizationId },
                    include: { medication: true }
                }).then(items =>
                    items.reduce((sum, item) =>
                        sum + (item.quantity * (item.medication.unitPrice || 0)), 0
                    )
                ),
                // Unresolved alerts
                prisma.stockAlert.count({
                    where: {
                        inventoryItem: {
                            organizationId: user.organizationId
                        },
                        isResolved: false
                    }
                })
            ])

            return c.json({
                totalItems,
                lowStockCount,
                expiringSoonCount,
                expiredCount,
                totalValue,
                unresolvedAlerts
            })
        } catch (error) {
            console.error('Failed to fetch stats:', error)
            return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500)
        }
    }
)

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkAndCreateAlerts(
    inventoryItemId: number,
    newQuantity: number,
    item: any
) {
    const alerts: any[] = []

    // Fetch medication and supplier info if needed
    const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: inventoryItemId },
        include: {
            medication: true,
            supplier: true,
            organization: true
        }
    })

    if (!inventoryItem) return

    // Stock bas
    if (newQuantity <= item.minQuantity && newQuantity > 0) {
        alerts.push({
            inventoryItemId,
            type: 'low_stock',
            severity: 'warning',
            message: `Stock bas: ${newQuantity} unités restantes (seuil: ${item.minQuantity})`
        })
    }

    // Rupture de stock
    if (newQuantity === 0) {
        alerts.push({
            inventoryItemId,
            type: 'out_of_stock',
            severity: 'critical',
            message: 'Rupture de stock'
        })
    }

    // Péremption proche (30 jours)
    if (item.expiryDate) {
        const daysUntilExpiry = Math.floor(
            (item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            alerts.push({
                inventoryItemId,
                type: 'expiring_soon',
                severity: 'warning',
                message: `Expire dans ${daysUntilExpiry} jours`
            })
        } else if (daysUntilExpiry <= 0) {
            alerts.push({
                inventoryItemId,
                type: 'expired',
                severity: 'critical',
                message: 'Médicament périmé'
            })
        }
    }

    // Créer les alertes
    if (alerts.length > 0) {
        await prisma.stockAlert.createMany({
            data: alerts,
        })

        // Envoyer des notifications réelles si rupture ou stock bas
        for (const alert of alerts) {
            if ((alert.type === 'low_stock' || alert.type === 'out_of_stock') && inventoryItem.supplier?.email) {
                const { notificationManager } = await import('../lib/notifications/manager.js')
                const { emailService } = await import('../lib/notifications/email.js')

                // Notification interne (HOSPITAL_ADMIN)
                // (Déjà géré via les alertes qui apparaissent sur le dashboard, 
                // mais on peut envoyer un mail à l'admin aussi)

                // Notification au FOURNISSEUR
                await emailService.sendEmail({
                    to: inventoryItem.supplier.email,
                    subject: `[SamaSante] Alerte de stock: ${inventoryItem.medication.name}`,
                    html: `
                        <h2>Alerte de Stock</h2>
                        <p>L'établissement <strong>${inventoryItem.organization.name}</strong> signale un stock bas pour le produit suivant :</p>
                        <ul>
                            <li><strong>Produit :</strong> ${inventoryItem.medication.name} (${inventoryItem.medication.dosage})</li>
                            <li><strong>Quantité actuelle :</strong> ${newQuantity}</li>
                            <li><strong>Seuil d'alerte :</strong> ${inventoryItem.minQuantity}</li>
                        </ul>
                        <p>Merci de prendre les dispositions nécessaires pour un réapprovisionnement.</p>
                    `,
                    text: `Alerte de Stock: ${inventoryItem.medication.name}. Quantité actuelle: ${newQuantity}.`
                })

                console.log(`Notification envoyée au fournisseur ${inventoryItem.supplier.name} (${inventoryItem.supplier.email})`)
            }
        }
    }
}

export default pharmacy
