import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

export const i18n = new Hono<HonoEnv>()

// ============================================
// TRANSLATIONS
// ============================================

/**
 * GET /translations
 * Récupérer les traductions pour une langue
 */
i18n.get('/translations',
    async (c) => {
        const language = c.req.query('language') || 'fr'
        const namespace = c.req.query('namespace')

        try {
            const where: any = { language }
            if (namespace) {
                where.namespace = namespace
            }

            const translations = await prisma.translation.findMany({
                where,
                select: {
                    key: true,
                    value: true,
                    namespace: true
                }
            })

            // Convertir en objet clé-valeur
            const translationsMap: Record<string, string> = {}
            translations.forEach(t => {
                const fullKey = namespace ? t.key : `${t.namespace}.${t.key}`
                translationsMap[fullKey] = t.value
            })

            return c.json(translationsMap)
        } catch (error) {
            console.error('Failed to fetch translations:', error)
            return c.json({ error: 'Erreur lors de la récupération des traductions' }, 500)
        }
    }
)

/**
 * POST /translations
 * Ajouter/Mettre à jour une traduction
 */
const UpsertTranslationSchema = z.object({
    key: z.string(),
    language: z.enum(['fr', 'wo', 'en']),
    value: z.string(),
    namespace: z.string().default('common'),
    description: z.string().optional(),
    context: z.string().optional()
})

i18n.post('/translations',
    requireAuth(['SUPER_ADMIN', 'ADMIN']),
    zValidator('json', UpsertTranslationSchema),
    async (c) => {
        const data = c.req.valid('json')

        try {
            const translation = await prisma.translation.upsert({
                where: {
                    key_language_namespace: {
                        key: data.key,
                        language: data.language,
                        namespace: data.namespace
                    }
                },
                update: {
                    value: data.value,
                    description: data.description,
                    context: data.context
                },
                create: data
            })

            return c.json(translation, 201)
        } catch (error) {
            console.error('Failed to upsert translation:', error)
            return c.json({ error: 'Erreur lors de l\'ajout de la traduction' }, 500)
        }
    }
)

/**
 * POST /translations/batch
 * Importer plusieurs traductions
 */
const BatchTranslationsSchema = z.object({
    language: z.enum(['fr', 'wo', 'en']),
    namespace: z.string().default('common'),
    translations: z.record(z.string(), z.string())
})

i18n.post('/translations/batch',
    requireAuth(['SUPER_ADMIN']),
    zValidator('json', BatchTranslationsSchema),
    async (c) => {
        const { language, namespace, translations } = c.req.valid('json')

        try {
            const data = Object.entries(translations).map(([key, value]) => ({
                key,
                language,
                namespace,
                value
            }))

            // Utiliser createMany avec skipDuplicates
            const result = await prisma.translation.createMany({
                data,
                // skipDuplicates: true // Not supported in SQLite
            })

            return c.json({ created: result.count }, 201)
        } catch (error) {
            console.error('Failed to batch import translations:', error)
            return c.json({ error: 'Erreur lors de l\'import des traductions' }, 500)
        }
    }
)

/**
 * GET /translations/missing
 * Trouver les clés manquantes pour une langue
 */
i18n.get('/translations/missing',
    requireAuth(['SUPER_ADMIN', 'ADMIN']),
    async (c) => {
        const targetLanguage = c.req.query('language') || 'wo'
        const baseLanguage = c.req.query('base') || 'fr'

        try {
            // Récupérer toutes les clés de la langue de base
            const baseTranslations = await prisma.translation.findMany({
                where: { language: baseLanguage },
                select: { key: true, namespace: true }
            })

            // Récupérer toutes les clés de la langue cible
            const targetTranslations = await prisma.translation.findMany({
                where: { language: targetLanguage },
                select: { key: true, namespace: true }
            })

            // Créer des sets pour comparaison
            const targetKeys = new Set(
                targetTranslations.map(t => `${t.namespace}:${t.key}`)
            )

            // Trouver les clés manquantes
            const missing = baseTranslations.filter(
                t => !targetKeys.has(`${t.namespace}:${t.key}`)
            )

            return c.json({
                targetLanguage,
                baseLanguage,
                missingCount: missing.length,
                missing: missing.map(t => ({
                    key: t.key,
                    namespace: t.namespace
                }))
            })
        } catch (error) {
            console.error('Failed to find missing translations:', error)
            return c.json({ error: 'Erreur lors de la recherche des traductions manquantes' }, 500)
        }
    }
)

// ============================================
// USER LANGUAGE PREFERENCES
// ============================================

/**
 * GET /preferences
 * Récupérer les préférences linguistiques de l'utilisateur
 */
i18n.get('/preferences',
    requireAuth(),
    async (c) => {
        const user = c.get('user') as any

        try {
            let preferences = await prisma.userLanguagePreference.findUnique({
                where: { userId: user.id }
            })

            // Créer des préférences par défaut si elles n'existent pas
            if (!preferences) {
                preferences = await prisma.userLanguagePreference.create({
                    data: {
                        userId: user.id,
                        preferredLanguage: 'fr'
                    }
                })
            }

            return c.json(preferences)
        } catch (error) {
            console.error('Failed to fetch language preferences:', error)
            return c.json({ error: 'Erreur lors de la récupération des préférences' }, 500)
        }
    }
)

/**
 * PUT /preferences
 * Mettre à jour les préférences linguistiques
 */
const UpdatePreferencesSchema = z.object({
    preferredLanguage: z.enum(['fr', 'wo', 'en']),
    secondaryLanguages: z.string().optional(),
    dateFormat: z.string().optional(),
    timeFormat: z.enum(['24h', '12h']).optional(),
    timezone: z.string().optional(),
    showTransliteration: z.boolean().optional()
})

i18n.put('/preferences',
    requireAuth(),
    zValidator('json', UpdatePreferencesSchema),
    async (c) => {
        const user = c.get('user') as any
        const data = c.req.valid('json')

        try {
            const preferences = await prisma.userLanguagePreference.upsert({
                where: { userId: user.id },
                update: data,
                create: {
                    userId: user.id,
                    ...data
                }
            })

            return c.json(preferences)
        } catch (error) {
            console.error('Failed to update language preferences:', error)
            return c.json({ error: 'Erreur lors de la mise à jour des préférences' }, 500)
        }
    }
)

// ============================================
// LANGUAGE DETECTION & HELPERS
// ============================================

/**
 * GET /detect
 * Détecter la langue depuis le header Accept-Language
 */
i18n.get('/detect',
    async (c) => {
        const acceptLanguage = c.req.header('Accept-Language') || 'fr'

        // Parser le header Accept-Language
        const languages = acceptLanguage
            .split(',')
            .map(lang => {
                const [code, q = '1'] = lang.trim().split(';q=')
                return {
                    code: code.split('-')[0].toLowerCase(),
                    quality: parseFloat(q)
                }
            })
            .sort((a, b) => b.quality - a.quality)

        // Trouver la première langue supportée
        const supported = ['fr', 'wo', 'en']
        const detected = languages.find(l => supported.includes(l.code))?.code || 'fr'

        return c.json({
            detected,
            supported,
            acceptLanguage
        })
    }
)

/**
 * GET /languages
 * Liste des langues supportées
 */
i18n.get('/languages',
    async (c) => {
        const languages = [
            {
                code: 'fr',
                name: 'Français',
                nativeName: 'Français',
                flag: '🇫🇷',
                isDefault: true
            },
            {
                code: 'wo',
                name: 'Wolof',
                nativeName: 'Wolof',
                flag: '🇸🇳',
                isDefault: false
            },
            {
                code: 'en',
                name: 'English',
                nativeName: 'English',
                flag: '🇬🇧',
                isDefault: false
            }
        ]

        // Compter les traductions disponibles par langue
        const counts = await prisma.translation.groupBy({
            by: ['language'],
            _count: true
        })

        const countsMap = Object.fromEntries(
            counts.map(c => [c.language, c._count])
        )

        return c.json(
            languages.map(lang => ({
                ...lang,
                translationCount: countsMap[lang.code] || 0
            }))
        )
    }
)

/**
 * GET /stats
 * Statistiques des traductions
 */
i18n.get('/stats',
    requireAuth(['SUPER_ADMIN', 'ADMIN']),
    async (c) => {
        try {
            const [
                totalTranslations,
                byLanguage,
                byNamespace,
                verified,
                unverified
            ] = await Promise.all([
                prisma.translation.count(),
                prisma.translation.groupBy({
                    by: ['language'],
                    _count: true
                }),
                prisma.translation.groupBy({
                    by: ['namespace'],
                    _count: true
                }),
                prisma.translation.count({
                    where: { isVerified: true }
                }),
                prisma.translation.count({
                    where: { isVerified: false }
                })
            ])

            return c.json({
                totalTranslations,
                byLanguage: Object.fromEntries(
                    byLanguage.map(l => [l.language, l._count])
                ),
                byNamespace: Object.fromEntries(
                    byNamespace.map(n => [n.namespace, n._count])
                ),
                verified,
                unverified,
                verificationRate: totalTranslations > 0
                    ? ((verified / totalTranslations) * 100).toFixed(2)
                    : 0
            })
        } catch (error) {
            console.error('Failed to fetch translation stats:', error)
            return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500)
        }
    }
)

export default i18n
