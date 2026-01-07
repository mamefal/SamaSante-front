import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

export const billing = new Hono<HonoEnv>()

// ============================================
// PRICING PLANS
// ============================================

/**
 * GET /plans
 * Liste des plans tarifaires
 */
billing.get('/plans',
    async (c) => {
        try {
            const plans = await prisma.pricingPlan.findMany({
                where: {
                    isActive: true,
                    isPublic: true
                },
                orderBy: { monthlyPrice: 'asc' }
            })

            return c.json(plans)
        } catch (error) {
            console.error('Failed to fetch pricing plans:', error)
            return c.json({ error: 'Erreur lors de la récupération des plans' }, 500)
        }
    }
)

/**
 * POST /plans
 * Créer un plan tarifaire (Super Admin)
 */
const CreatePlanSchema = z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    monthlyPrice: z.number(),
    yearlyPrice: z.number().optional(),
    maxDoctors: z.number().optional(),
    maxPatients: z.number().optional(),
    maxAppointments: z.number().optional(),
    maxStorage: z.number().optional(),
    features: z.any(),
    includesChat: z.boolean().default(false),
    includesPharmacy: z.boolean().default(false),
    includesTelemed: z.boolean().default(false),
    includesAnalytics: z.boolean().default(false)
})

billing.post('/plans',
    requireAuth(['SUPER_ADMIN']),
    zValidator('json', CreatePlanSchema),
    async (c) => {
        const data = c.req.valid('json')

        try {
            const plan = await prisma.pricingPlan.create({
                data
            })

            return c.json(plan, 201)
        } catch (error) {
            console.error('Failed to create pricing plan:', error)
            return c.json({ error: 'Erreur lors de la création du plan' }, 500)
        }
    }
)

// ============================================
// SUBSCRIPTIONS
// ============================================

/**
 * GET /subscriptions
 * Abonnement de l'organisation
 */
billing.get('/subscriptions',
    requireAuth(['HOSPITAL_ADMIN', 'SUPER_ADMIN']),
    async (c) => {
        const user = c.get('user') as any

        if (!user.organizationId && user.role !== 'SUPER_ADMIN') {
            return c.json({ error: 'Organisation non définie' }, 400)
        }

        try {
            const where: any = user.role === 'SUPER_ADMIN'
                ? {}
                : { organizationId: user.organizationId }

            const subscriptions = await prisma.subscription.findMany({
                where,
                include: {
                    plan: true,
                    organization: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })

            return c.json(subscriptions)
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error)
            return c.json({ error: 'Erreur lors de la récupération des abonnements' }, 500)
        }
    }
)

/**
 * POST /subscriptions
 * Créer un abonnement
 */
const CreateSubscriptionSchema = z.object({
    organizationId: z.number(),
    planId: z.number(),
    billingCycle: z.enum(['monthly', 'yearly']),
    startDate: z.string(),
    isTrial: z.boolean().default(false),
    trialDays: z.number().default(14)
})

billing.post('/subscriptions',
    requireAuth(['HOSPITAL_ADMIN', 'SUPER_ADMIN']),
    zValidator('json', CreateSubscriptionSchema),
    async (c) => {
        const data = c.req.valid('json')

        try {
            const plan = await prisma.pricingPlan.findUnique({
                where: { id: data.planId }
            })

            if (!plan) {
                return c.json({ error: 'Plan non trouvé' }, 404)
            }

            const startDate = new Date(data.startDate)
            const endDate = new Date(startDate)

            if (data.billingCycle === 'monthly') {
                endDate.setMonth(endDate.getMonth() + 1)
            } else {
                endDate.setFullYear(endDate.getFullYear() + 1)
            }

            const trialEndsAt = data.isTrial
                ? new Date(startDate.getTime() + data.trialDays * 24 * 60 * 60 * 1000)
                : undefined

            const subscription = await prisma.subscription.create({
                data: {
                    organizationId: data.organizationId,
                    planId: data.planId,
                    billingCycle: data.billingCycle,
                    startDate,
                    endDate,
                    isTrial: data.isTrial,
                    trialEndsAt,
                    status: data.isTrial ? 'trial' : 'active'
                },
                include: {
                    plan: true
                }
            })

            // Créer la première facture si pas en essai
            if (!data.isTrial) {
                await createSubscriptionInvoice(subscription, plan)
            }

            return c.json(subscription, 201)
        } catch (error) {
            console.error('Failed to create subscription:', error)
            return c.json({ error: 'Erreur lors de la création de l\'abonnement' }, 500)
        }
    }
)

/**
 * PUT /subscriptions/:id/cancel
 * Annuler un abonnement
 */
const CancelSubscriptionSchema = z.object({
    reason: z.string().optional()
})

billing.put('/subscriptions/:id/cancel',
    requireAuth(['HOSPITAL_ADMIN', 'SUPER_ADMIN']),
    zValidator('json', CancelSubscriptionSchema),
    async (c) => {
        const id = parseInt(c.req.param('id'))
        const { reason } = c.req.valid('json')

        try {
            const subscription = await prisma.subscription.update({
                where: { id },
                data: {
                    status: 'cancelled',
                    cancelledAt: new Date(),
                    cancelReason: reason,
                    autoRenew: false
                }
            })

            return c.json(subscription)
        } catch (error) {
            console.error('Failed to cancel subscription:', error)
            return c.json({ error: 'Erreur lors de l\'annulation' }, 500)
        }
    }
)

// ============================================
// INVOICES
// ============================================

/**
 * GET /invoices
 * Liste des factures
 */
billing.get('/invoices',
    requireAuth(['HOSPITAL_ADMIN', 'SUPER_ADMIN']),
    async (c) => {
        const user = c.get('user') as any
        const status = c.req.query('status')

        if (!user.organizationId && user.role !== 'SUPER_ADMIN') {
            return c.json({ error: 'Organisation non définie' }, 400)
        }

        try {
            const where: any = user.role === 'SUPER_ADMIN'
                ? {}
                : { organizationId: user.organizationId }

            if (status) {
                where.status = status
            }

            const invoices = await prisma.invoice.findMany({
                where,
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    items: true,
                    payments: true
                },
                orderBy: { createdAt: 'desc' }
            })

            return c.json(invoices)
        } catch (error) {
            console.error('Failed to fetch invoices:', error)
            return c.json({ error: 'Erreur lors de la récupération des factures' }, 500)
        }
    }
)

/**
 * GET /invoices/:id
 * Détails d'une facture
 */
billing.get('/invoices/:id',
    requireAuth(['HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT']),
    async (c) => {
        const id = parseInt(c.req.param('id'))

        try {
            const invoice = await prisma.invoice.findUnique({
                where: { id },
                include: {
                    organization: true,
                    subscription: {
                        include: {
                            plan: true
                        }
                    },
                    appointment: true,
                    items: true,
                    payments: true
                }
            })

            if (!invoice) {
                return c.json({ error: 'Facture non trouvée' }, 404)
            }

            return c.json(invoice)
        } catch (error) {
            console.error('Failed to fetch invoice:', error)
            return c.json({ error: 'Erreur lors de la récupération de la facture' }, 500)
        }
    }
)

/**
 * POST /invoices
 * Créer une facture manuelle
 */
const CreateInvoiceSchema = z.object({
    organizationId: z.number(),
    type: z.enum(['subscription', 'consultation', 'service', 'other']),
    appointmentId: z.number().optional(),
    items: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number()
    })),
    dueDate: z.string(),
    notes: z.string().optional()
})

billing.post('/invoices',
    requireAuth(['HOSPITAL_ADMIN', 'SUPER_ADMIN']),
    zValidator('json', CreateInvoiceSchema),
    async (c) => {
        const data = c.req.valid('json')

        try {
            // Générer numéro de facture unique
            const invoiceNumber = await generateInvoiceNumber()

            // Calculer montants
            const subtotal = data.items.reduce((sum, item) =>
                sum + (item.quantity * item.unitPrice), 0
            )
            const taxRate = 0 // À configurer selon le pays
            const taxAmount = subtotal * (taxRate / 100)
            const total = subtotal + taxAmount

            const invoice = await prisma.invoice.create({
                data: {
                    invoiceNumber,
                    organizationId: data.organizationId,
                    appointmentId: data.appointmentId,
                    type: data.type,
                    subtotal,
                    taxRate,
                    taxAmount,
                    total,
                    dueDate: new Date(data.dueDate),
                    notes: data.notes,
                    items: {
                        create: data.items.map(item => ({
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            amount: item.quantity * item.unitPrice
                        }))
                    }
                },
                include: {
                    items: true
                }
            })

            return c.json(invoice, 201)
        } catch (error) {
            console.error('Failed to create invoice:', error)
            return c.json({ error: 'Erreur lors de la création de la facture' }, 500)
        }
    }
)

// ============================================
// PAYMENTS
// ============================================

/**
 * POST /payments
 * Enregistrer un paiement
 */
const CreatePaymentSchema = z.object({
    invoiceId: z.number(),
    amount: z.number(),
    paymentMethod: z.enum(['card', 'mobile_money', 'bank_transfer', 'cash', 'check']),
    provider: z.string().optional(),
    transactionId: z.string().optional(),
    notes: z.string().optional()
})

billing.post('/payments',
    requireAuth(['HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT']),
    zValidator('json', CreatePaymentSchema),
    async (c) => {
        const data = c.req.valid('json')

        try {
            const invoice = await prisma.invoice.findUnique({
                where: { id: data.invoiceId }
            })

            if (!invoice) {
                return c.json({ error: 'Facture non trouvée' }, 404)
            }

            const payment = await prisma.payment.create({
                data: {
                    invoiceId: data.invoiceId,
                    amount: data.amount,
                    paymentMethod: data.paymentMethod,
                    provider: data.provider,
                    transactionId: data.transactionId,
                    notes: data.notes,
                    status: 'completed',
                    paidAt: new Date()
                }
            })

            // Mettre à jour le statut de la facture
            const totalPaid = await prisma.payment.aggregate({
                where: {
                    invoiceId: data.invoiceId,
                    status: 'completed'
                },
                _sum: {
                    amount: true
                }
            })

            if (totalPaid._sum.amount && totalPaid._sum.amount >= invoice.total) {
                await prisma.invoice.update({
                    where: { id: data.invoiceId },
                    data: {
                        status: 'paid',
                        paidAt: new Date()
                    }
                })
            }

            return c.json(payment, 201)
        } catch (error) {
            console.error('Failed to create payment:', error)
            return c.json({ error: 'Erreur lors de l\'enregistrement du paiement' }, 500)
        }
    }
)

// ============================================
// REFUNDS
// ============================================

/**
 * POST /refunds
 * Demander un remboursement
 */
const CreateRefundSchema = z.object({
    paymentId: z.number(),
    amount: z.number(),
    reason: z.string()
})

billing.post('/refunds',
    requireAuth(['HOSPITAL_ADMIN', 'SUPER_ADMIN']),
    zValidator('json', CreateRefundSchema),
    async (c) => {
        const user = c.get('user') as any
        const data = c.req.valid('json')

        try {
            const payment = await prisma.payment.findUnique({
                where: { id: data.paymentId }
            })

            if (!payment) {
                return c.json({ error: 'Paiement non trouvé' }, 404)
            }

            if (data.amount > payment.amount) {
                return c.json({ error: 'Montant du remboursement supérieur au paiement' }, 400)
            }

            const refund = await prisma.refund.create({
                data: {
                    paymentId: data.paymentId,
                    amount: data.amount,
                    reason: data.reason,
                    processedBy: user.id
                }
            })

            return c.json(refund, 201)
        } catch (error) {
            console.error('Failed to create refund:', error)
            return c.json({ error: 'Erreur lors de la demande de remboursement' }, 500)
        }
    }
)

/**
 * PUT /refunds/:id/process
 * Traiter un remboursement
 */
billing.put('/refunds/:id/process',
    requireAuth(['SUPER_ADMIN']),
    async (c) => {
        const user = c.get('user') as any
        const id = parseInt(c.req.param('id'))

        try {
            const refund = await prisma.refund.update({
                where: { id },
                data: {
                    status: 'completed',
                    processedAt: new Date(),
                    processedBy: user.id
                }
            })

            // Mettre à jour le statut du paiement
            await prisma.payment.update({
                where: { id: refund.paymentId },
                data: {
                    status: 'refunded'
                }
            })

            return c.json(refund)
        } catch (error) {
            console.error('Failed to process refund:', error)
            return c.json({ error: 'Erreur lors du traitement du remboursement' }, 500)
        }
    }
)

// ============================================
// STATISTICS
// ============================================

/**
 * GET /stats
 * Statistiques de facturation
 */
billing.get('/stats',
    requireAuth(['HOSPITAL_ADMIN', 'SUPER_ADMIN']),
    async (c) => {
        const user = c.get('user') as any

        if (!user.organizationId && user.role !== 'SUPER_ADMIN') {
            return c.json({ error: 'Organisation non définie' }, 400)
        }

        try {
            const where: any = user.role === 'SUPER_ADMIN'
                ? {}
                : { organizationId: user.organizationId }

            const [
                totalInvoices,
                paidInvoices,
                pendingInvoices,
                overdueInvoices,
                totalRevenue,
                activeSubscriptions
            ] = await Promise.all([
                prisma.invoice.count({ where }),
                prisma.invoice.count({ where: { ...where, status: 'paid' } }),
                prisma.invoice.count({ where: { ...where, status: 'pending' } }),
                prisma.invoice.count({
                    where: {
                        ...where,
                        status: 'pending',
                        dueDate: { lt: new Date() }
                    }
                }),
                prisma.invoice.aggregate({
                    where: { ...where, status: 'paid' },
                    _sum: { total: true }
                }),
                prisma.subscription.count({
                    where: {
                        ...where,
                        status: 'active'
                    }
                })
            ])

            return c.json({
                totalInvoices,
                paidInvoices,
                pendingInvoices,
                overdueInvoices,
                totalRevenue: totalRevenue._sum.total || 0,
                activeSubscriptions
            })
        } catch (error) {
            console.error('Failed to fetch billing stats:', error)
            return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500)
        }
    }
)

// ============================================
// HELPER FUNCTIONS
// ============================================

async function generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const count = await prisma.invoice.count({
        where: {
            createdAt: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`)
            }
        }
    })

    return `INV-${year}-${String(count + 1).padStart(6, '0')}`
}

async function createSubscriptionInvoice(subscription: any, plan: any) {
    const invoiceNumber = await generateInvoiceNumber()
    const amount = subscription.billingCycle === 'monthly'
        ? plan.monthlyPrice
        : plan.yearlyPrice || plan.monthlyPrice * 12

    await prisma.invoice.create({
        data: {
            invoiceNumber,
            organizationId: subscription.organizationId,
            subscriptionId: subscription.id,
            type: 'subscription',
            subtotal: amount,
            total: amount,
            dueDate: subscription.startDate,
            items: {
                create: {
                    description: `Abonnement ${plan.name} - ${subscription.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}`,
                    quantity: 1,
                    unitPrice: amount,
                    amount
                }
            }
        }
    })
}

export default billing
