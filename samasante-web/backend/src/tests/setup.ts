// backend/src/tests/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest'
import { prisma } from '../lib/prisma.js'

// Setup avant tous les tests
beforeAll(async () => {
    // Utiliser une base de données de test
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db'

    console.log('🧪 Test setup: Database initialized')
})

// Cleanup après chaque test
afterEach(async () => {
    // Nettoyer les données de test - Compatible SQLite et PostgreSQL
    try {
        // Pour SQLite, on peut simplement supprimer toutes les données
        const models = [
            'Appointment',
            'DoctorDocument',
            'Availability',
            'MedicalFile',
            'Patient',
            'Doctor',
            'PracticeSite',
            'User',
        ]

        // Désactiver les contraintes de clés étrangères temporairement
        await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`

        for (const model of models) {
            await prisma.$executeRawUnsafe(`DELETE FROM "${model}";`)
        }

        // Réactiver les contraintes
        await prisma.$executeRaw`PRAGMA foreign_keys = ON;`
    } catch (error) {
        console.log('Could not clean up test data:', error)
    }
})

// Cleanup après tous les tests
afterAll(async () => {
    await prisma.$disconnect()
    console.log('🧪 Test teardown: Database disconnected')
})
