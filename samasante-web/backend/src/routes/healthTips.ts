import { Hono } from 'hono'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

export const healthTips = new Hono<HonoEnv>()

const TIPS_DB = [
    {
        category: 'general',
        title: 'Hydratation',
        content: 'Buvez au moins 1.5L d\'eau par jour pour maintenir une bonne hydratation.',
        icon: 'droplet',
        color: 'blue'
    },
    {
        category: 'general',
        title: 'Activité physique',
        content: '30 minutes de marche rapide par jour réduisent les risques cardiovasculaires.',
        icon: 'activity',
        color: 'green'
    },
    {
        category: 'general',
        title: 'Sommeil',
        content: 'Essayez de dormir entre 7 et 8 heures par nuit pour une récupération optimale.',
        icon: 'moon',
        color: 'purple'
    },
    {
        category: 'diabetes',
        title: 'Sucre',
        content: 'Limitez les boissons sucrées et privilégiez l\'eau ou le thé sans sucre.',
        icon: 'alert-circle',
        color: 'orange'
    },
    {
        category: 'hypertension',
        title: 'Sel',
        content: 'Réduisez votre consommation de sel pour mieux contrôler votre tension artérielle.',
        icon: 'heart',
        color: 'red'
    }
]

healthTips.get('/',
    requireAuth(['PATIENT']),
    async (c) => {
        // In a real app, we would filter based on patient's conditions
        // For now, return random tips
        const shuffled = [...TIPS_DB].sort(() => 0.5 - Math.random())
        return c.json(shuffled.slice(0, 3))
    }
)
