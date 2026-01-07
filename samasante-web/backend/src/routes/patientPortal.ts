import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

export const patientPortal = new Hono<HonoEnv>()

// ============================================
// FAMILY ACCOUNTS
// ============================================

/**
 * GET /family
 * Récupérer le compte famille
 */
patientPortal.get('/family',
    requireAuth(['PATIENT']),
    async (c) => {
        const user = c.get('user') as any

        if (!user.patientId) {
            return c.json({ error: 'Patient ID non trouvé' }, 400)
        }

        try {
            // Chercher si le patient est le chef de famille
            let familyAccount = await prisma.familyAccount.findUnique({
                where: { primaryPatientId: user.patientId },
                include: {
                    primaryPatient: true,
                    members: {
                        include: {
                            patient: true
                        }
                    }
                }
            })

            // Ou si le patient est membre d'une famille
            if (!familyAccount) {
                const membership = await prisma.familyMember.findUnique({
                    where: { patientId: user.patientId },
                    include: {
                        familyAccount: {
                            include: {
                                primaryPatient: true,
                                members: {
                                    include: {
                                        patient: true
                                    }
                                }
                            }
                        }
                    }
                })

                familyAccount = membership?.familyAccount || null
            }

            return c.json(familyAccount)
        } catch (error) {
            console.error('Failed to fetch family account:', error)
            return c.json({ error: 'Erreur lors de la récupération du compte famille' }, 500)
        }
    }
)

/**
 * POST /family
 * Créer un compte famille
 */
patientPortal.post('/family',
    requireAuth(['PATIENT']),
    async (c) => {
        const user = c.get('user') as any

        if (!user.patientId) {
            return c.json({ error: 'Patient ID non trouvé' }, 400)
        }

        try {
            // Vérifier qu'il n'existe pas déjà
            const existing = await prisma.familyAccount.findUnique({
                where: { primaryPatientId: user.patientId }
            })

            if (existing) {
                return c.json({ error: 'Compte famille déjà existant' }, 409)
            }

            const familyAccount = await prisma.familyAccount.create({
                data: {
                    primaryPatientId: user.patientId
                },
                include: {
                    primaryPatient: true,
                    members: true
                }
            })

            return c.json(familyAccount, 201)
        } catch (error) {
            console.error('Failed to create family account:', error)
            return c.json({ error: 'Erreur lors de la création du compte famille' }, 500)
        }
    }
)

/**
 * POST /family/members
 * Ajouter un membre à la famille
 */
const AddFamilyMemberSchema = z.object({
    patientId: z.number(),
    relationship: z.enum(['parent', 'child', 'spouse', 'sibling', 'other']),
    canBookFor: z.boolean().default(true),
    canViewRecords: z.boolean().default(true)
})

patientPortal.post('/family/members',
    requireAuth(['PATIENT']),
    zValidator('json', AddFamilyMemberSchema),
    async (c) => {
        const user = c.get('user') as any
        const data = c.req.valid('json')

        if (!user.patientId) {
            return c.json({ error: 'Patient ID non trouvé' }, 400)
        }

        try {
            // Vérifier que le compte famille existe
            const familyAccount = await prisma.familyAccount.findUnique({
                where: { primaryPatientId: user.patientId }
            })

            if (!familyAccount) {
                return c.json({ error: 'Compte famille non trouvé. Créez-en un d\'abord.' }, 404)
            }

            // Ajouter le membre
            const member = await prisma.familyMember.create({
                data: {
                    familyAccountId: familyAccount.id,
                    ...data
                },
                include: {
                    patient: true
                }
            })

            return c.json(member, 201)
        } catch (error) {
            console.error('Failed to add family member:', error)
            return c.json({ error: 'Erreur lors de l\'ajout du membre' }, 500)
        }
    }
)

// ============================================
// VACCINATION RECORDS
// ============================================

/**
 * GET /vaccinations
 * Récupérer les vaccinations
 */
patientPortal.get('/vaccinations',
    requireAuth(['PATIENT', 'DOCTOR']),
    async (c) => {
        const user = c.get('user') as any
        const patientId = c.req.query('patientId')
            ? parseInt(c.req.query('patientId')!)
            : user.patientId

        if (!patientId) {
            return c.json({ error: 'Patient ID requis' }, 400)
        }

        try {
            const vaccinations = await prisma.vaccinationRecord.findMany({
                where: { patientId },
                orderBy: { administeredAt: 'desc' }
            })

            return c.json(vaccinations)
        } catch (error) {
            console.error('Failed to fetch vaccinations:', error)
            return c.json({ error: 'Erreur lors de la récupération des vaccinations' }, 500)
        }
    }
)

/**
 * POST /vaccinations
 * Ajouter une vaccination
 */
const AddVaccinationSchema = z.object({
    patientId: z.number(),
    vaccineName: z.string(),
    vaccineType: z.string().optional(),
    administeredAt: z.string(),
    administeredBy: z.string().optional(),
    location: z.string().optional(),
    batchNumber: z.string().optional(),
    manufacturer: z.string().optional(),
    expiryDate: z.string().optional(),
    doseNumber: z.number().optional(),
    totalDoses: z.number().optional(),
    nextDoseDate: z.string().optional(),
    reaction: z.string().optional(),
    notes: z.string().optional(),
    certificateUrl: z.string().optional()
})

patientPortal.post('/vaccinations',
    requireAuth(['DOCTOR', 'HOSPITAL_ADMIN']),
    zValidator('json', AddVaccinationSchema),
    async (c) => {
        const data = c.req.valid('json')

        try {
            const vaccination = await prisma.vaccinationRecord.create({
                data: {
                    ...data,
                    administeredAt: new Date(data.administeredAt),
                    nextDoseDate: data.nextDoseDate ? new Date(data.nextDoseDate) : null,
                    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null
                }
            })

            // Planifier un rappel si une prochaine dose est prévue
            if (data.nextDoseDate) {
                const { notificationManager } = await import('../lib/notifications/manager.js')
                await notificationManager.scheduleVaccinationReminder(
                    data.patientId,
                    data.vaccineName,
                    new Date(data.nextDoseDate)
                )
            }

            return c.json(vaccination, 201)
        } catch (error) {
            console.error('Failed to add vaccination:', error)
            return c.json({ error: 'Erreur lors de l\'ajout de la vaccination' }, 500)
        }
    }
)

// ============================================
// GROWTH RECORDS (Courbes de croissance)
// ============================================

/**
 * GET /growth
 * Récupérer les mesures de croissance
 */
patientPortal.get('/growth',
    requireAuth(['PATIENT', 'DOCTOR']),
    async (c) => {
        const user = c.get('user') as any
        const patientId = c.req.query('patientId')
            ? parseInt(c.req.query('patientId')!)
            : user.patientId

        if (!patientId) {
            return c.json({ error: 'Patient ID requis' }, 400)
        }

        try {
            const growthRecords = await prisma.growthRecord.findMany({
                where: { patientId },
                orderBy: { measuredAt: 'asc' }
            })

            return c.json(growthRecords)
        } catch (error) {
            console.error('Failed to fetch growth records:', error)
            return c.json({ error: 'Erreur lors de la récupération des mesures' }, 500)
        }
    }
)

/**
 * POST /growth
 * Ajouter une mesure de croissance
 */
const AddGrowthRecordSchema = z.object({
    patientId: z.number(),
    measuredAt: z.string(),
    ageInMonths: z.number(),
    weight: z.number().optional(),
    height: z.number().optional(),
    headCircumference: z.number().optional(),
    measuredBy: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional()
})

patientPortal.post('/growth',
    requireAuth(['DOCTOR', 'HOSPITAL_ADMIN']),
    zValidator('json', AddGrowthRecordSchema),
    async (c) => {
        const data = c.req.valid('json')

        try {
            // Calculer le BMI si poids et taille sont fournis
            let bmi: number | undefined
            if (data.weight && data.height) {
                const heightInMeters = data.height / 100
                bmi = data.weight / (heightInMeters * heightInMeters)
            }

            // Calculer les percentiles selon les courbes OMS
            let weightPercentile: number | undefined
            const patient = await (prisma as any).patient.findUnique({
                where: { id: data.patientId },
                select: { gender: true }
            })

            if (data.weight) {
                const { getWeightForAgePercentile } = await import('../lib/who-growth.js')
                weightPercentile = getWeightForAgePercentile(
                    data.ageInMonths,
                    data.weight,
                    (patient?.gender as any) === 'female' ? 'female' : 'male'
                )
            }

            const growthRecord = await (prisma as any).growthRecord.create({
                data: {
                    ...data,
                    measuredAt: new Date(data.measuredAt),
                    bmi,
                    weightPercentile
                }
            })

            return c.json(growthRecord, 201)
        } catch (error) {
            console.error('Failed to add growth record:', error)
            return c.json({ error: 'Erreur lors de l\'ajout de la mesure' }, 500)
        }
    }
)

// ============================================
// HEALTH DOCUMENTS
// ============================================

/**
 * GET /documents
 * Récupérer les documents de santé
 */
patientPortal.get('/documents',
    requireAuth(['PATIENT', 'DOCTOR']),
    async (c) => {
        const user = c.get('user') as any
        const patientId = c.req.query('patientId')
            ? parseInt(c.req.query('patientId')!)
            : user.patientId
        const type = c.req.query('type')

        if (!patientId) {
            return c.json({ error: 'Patient ID requis' }, 400)
        }

        try {
            const where: any = { patientId }
            if (type) {
                where.type = type
            }

            const documents = await prisma.healthDocument.findMany({
                where,
                include: {
                    uploader: {
                        select: {
                            id: true,
                            name: true,
                            role: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })

            return c.json(documents)
        } catch (error) {
            console.error('Failed to fetch health documents:', error)
            return c.json({ error: 'Erreur lors de la récupération des documents' }, 500)
        }
    }
)

/**
 * POST /documents
 * Ajouter un document de santé
 */
const AddHealthDocumentSchema = z.object({
    patientId: z.number(),
    type: z.enum(['vaccination_card', 'growth_chart', 'lab_result', 'imaging', 'prescription', 'other']),
    title: z.string(),
    description: z.string().optional(),
    fileUrl: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    documentDate: z.string().optional(),
    tags: z.string().optional(),
    isShared: z.boolean().default(false),
    sharedWith: z.string().optional()
})

patientPortal.post('/documents',
    requireAuth(['PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN']),
    zValidator('json', AddHealthDocumentSchema),
    async (c) => {
        const user = c.get('user') as any
        const data = c.req.valid('json')

        try {
            const document = await prisma.healthDocument.create({
                data: {
                    ...data,
                    documentDate: data.documentDate ? new Date(data.documentDate) : undefined,
                    uploadedBy: user.id
                },
                include: {
                    uploader: {
                        select: {
                            id: true,
                            name: true,
                            role: true
                        }
                    }
                }
            })

            return c.json(document, 201)
        } catch (error) {
            console.error('Failed to add health document:', error)
            return c.json({ error: 'Erreur lors de l\'ajout du document' }, 500)
        }
    }
)

// ============================================
// HEALTH METRICS
// ============================================

/**
 * GET /metrics
 * Récupérer les métriques de santé
 */
patientPortal.get('/metrics',
    requireAuth(['PATIENT', 'DOCTOR']),
    async (c) => {
        const user = c.get('user') as any
        const patientId = c.req.query('patientId')
            ? parseInt(c.req.query('patientId')!)
            : user.patientId
        const type = c.req.query('type')
        const from = c.req.query('from')
        const to = c.req.query('to')

        if (!patientId) {
            return c.json({ error: 'Patient ID requis' }, 400)
        }

        try {
            const where: any = { patientId }
            if (type) {
                where.type = type
            }
            if (from || to) {
                where.measuredAt = {}
                if (from) where.measuredAt.gte = new Date(from)
                if (to) where.measuredAt.lte = new Date(to)
            }

            const metrics = await prisma.healthMetric.findMany({
                where,
                orderBy: { measuredAt: 'desc' },
                take: 100
            })

            return c.json(metrics)
        } catch (error) {
            console.error('Failed to fetch health metrics:', error)
            return c.json({ error: 'Erreur lors de la récupération des métriques' }, 500)
        }
    }
)

/**
 * POST /metrics
 * Ajouter une métrique de santé
 */
const AddHealthMetricSchema = z.object({
    patientId: z.number(),
    type: z.string(),
    value: z.number(),
    unit: z.string(),
    systolic: z.number().optional(),
    diastolic: z.number().optional(),
    measuredAt: z.string(),
    source: z.string().optional(),
    deviceName: z.string().optional(),
    notes: z.string().optional(),
    tags: z.string().optional()
})

patientPortal.post('/metrics',
    requireAuth(['PATIENT', 'DOCTOR']),
    zValidator('json', AddHealthMetricSchema),
    async (c) => {
        const data = c.req.valid('json')

        try {
            const metric = await prisma.healthMetric.create({
                data: {
                    ...data,
                    measuredAt: new Date(data.measuredAt)
                }
            })

            return c.json(metric, 201)
        } catch (error) {
            console.error('Failed to add health metric:', error)
            return c.json({ error: 'Erreur lors de l\'ajout de la métrique' }, 500)
        }
    }
)

/**
 * GET /dashboard
 * Dashboard patient complet
 */
patientPortal.get('/dashboard',
    requireAuth(['PATIENT']),
    async (c) => {
        const user = c.get('user') as any

        if (!user.patientId) {
            return c.json({ error: 'Patient ID non trouvé' }, 400)
        }

        try {
            const [
                patient,
                upcomingAppointments,
                recentVaccinations,
                latestGrowth,
                recentMetrics,
                familyAccount
            ] = await Promise.all([
                // Patient info
                prisma.patient.findUnique({
                    where: { id: user.patientId },
                    include: {
                        medicalFile: true
                    }
                }),
                // Prochains rendez-vous
                prisma.appointment.findMany({
                    where: {
                        patientId: user.patientId,
                        start: {
                            gte: new Date()
                        },
                        status: 'booked'
                    },
                    include: {
                        doctor: true,
                        site: true
                    },
                    orderBy: { start: 'asc' },
                    take: 5
                }),
                // Vaccinations récentes
                prisma.vaccinationRecord.findMany({
                    where: { patientId: user.patientId },
                    orderBy: { administeredAt: 'desc' },
                    take: 5
                }),
                // Dernière mesure de croissance
                prisma.growthRecord.findFirst({
                    where: { patientId: user.patientId },
                    orderBy: { measuredAt: 'desc' }
                }),
                // Métriques récentes
                prisma.healthMetric.findMany({
                    where: { patientId: user.patientId },
                    orderBy: { measuredAt: 'desc' },
                    take: 10
                }),
                // Compte famille
                prisma.familyAccount.findUnique({
                    where: { primaryPatientId: user.patientId },
                    include: {
                        members: {
                            include: {
                                patient: true
                            }
                        }
                    }
                })
            ])

            return c.json({
                patient,
                upcomingAppointments,
                recentVaccinations,
                latestGrowth,
                recentMetrics,
                familyAccount
            })
        } catch (error) {
            console.error('Failed to fetch dashboard:', error)
            return c.json({ error: 'Erreur lors de la récupération du dashboard' }, 500)
        }
    }
)

// ============================================
// MEDICAL FILE (Allergies, chronic conditions)
// ============================================

/**
 * GET /medical-file
 */
patientPortal.get('/medical-file',
    requireAuth(['PATIENT', 'DOCTOR']),
    async (c) => {
        const user = c.get('user') as any
        const patientId = c.req.query('patientId')
            ? parseInt(c.req.query('patientId')!)
            : user.patientId

        if (!patientId) {
            return c.json({ error: 'Patient ID requis' }, 400)
        }

        try {
            const medicalFile = await prisma.medicalFile.findUnique({
                where: { patientId }
            })

            return c.json(medicalFile)
        } catch (error) {
            console.error('Failed to fetch medical file:', error)
            return c.json({ error: 'Erreur lors de la récupération du dossier médical' }, 500)
        }
    }
)

/**
 * PATCH /medical-file
 */
const UpdateMedicalFileSchema = z.object({
    bloodType: z.string().optional(),
    allergies: z.string().optional(),
    chronicConditions: z.string().optional(),
    emergencyContact: z.string().optional(),
    treatments: z.string().optional(),
    notes: z.string().optional()
})

patientPortal.patch('/medical-file',
    requireAuth(['PATIENT', 'DOCTOR']),
    zValidator('json', UpdateMedicalFileSchema),
    async (c) => {
        const user = c.get('user') as any
        const data = c.req.valid('json')
        const patientId = user.patientId

        if (!patientId) {
            return c.json({ error: 'Patient ID non trouvé' }, 400)
        }

        try {
            const medicalFile = await prisma.medicalFile.upsert({
                where: { patientId },
                update: data,
                create: {
                    ...data,
                    patientId
                }
            })

            return c.json(medicalFile)
        } catch (error) {
            console.error('Failed to update medical file:', error)
            return c.json({ error: 'Erreur lors de la mise à jour du dossier médical' }, 500)
        }
    }
)

// ============================================
// MEDICAL FILE SHARING
// ============================================

/**
 * POST /medical-file/share
 * Share medical file with an organization
 */
const ShareMedicalFileSchema = z.object({
    organizationId: z.number(),
    canEdit: z.boolean().default(false),
    expiresAt: z.string().optional()
})

patientPortal.post('/medical-file/share',
    requireAuth(['PATIENT']),
    zValidator('json', ShareMedicalFileSchema),
    async (c) => {
        const user = c.get('user') as any
        const data = c.req.valid('json')
        const patientId = user.patientId

        try {
            const medicalFile = await prisma.medicalFile.findUnique({
                where: { patientId }
            })

            if (!medicalFile) {
                return c.json({ error: 'Dossier médical non trouvé' }, 404)
            }

            const sharing = await (prisma as any).medicalFileSharing.upsert({
                where: {
                    medicalFileId_organizationId: {
                        medicalFileId: medicalFile.id,
                        organizationId: data.organizationId
                    }
                },
                update: {
                    canEdit: data.canEdit,
                    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                    sharedByUserId: user.id
                },
                create: {
                    medicalFileId: medicalFile.id,
                    organizationId: data.organizationId,
                    canEdit: data.canEdit,
                    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                    sharedByUserId: user.id
                }
            })

            return c.json(sharing)
        } catch (error) {
            console.error('Failed to share medical file:', error)
            return c.json({ error: 'Erreur lors du partage du dossier médical' }, 500)
        }
    }
)

/**
 * GET /medical-file/shares
 * List active shares for the patient
 */
patientPortal.get('/medical-file/shares',
    requireAuth(['PATIENT']),
    async (c) => {
        const user = c.get('user') as any
        const patientId = user.patientId

        try {
            const medicalFile = await prisma.medicalFile.findUnique({
                where: { patientId }
            })

            if (!medicalFile) return c.json([])

            const shares = await (prisma as any).medicalFileSharing.findMany({
                where: { medicalFileId: medicalFile.id },
                include: { organization: true }
            })

            return c.json(shares)
        } catch (error) {
            return c.json({ error: 'Erreur lors de la récupération des partages' }, 500)
        }
    }
)

export default patientPortal
