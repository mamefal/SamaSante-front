// Script pour créer des utilisateurs de test
// Exécuter avec: node create-test-users.js

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
    console.log('🔧 Création des utilisateurs de test...\n')

    // Mot de passe commun pour tous les comptes de test
    const password = 'test123'
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        // 1. Patient de test
        const patient = await prisma.user.upsert({
            where: { email: 'patient@test.com' },
            update: {},
            create: {
                email: 'patient@test.com',
                password: hashedPassword,
                role: 'PATIENT',
                patient: {
                    create: {
                        firstName: 'Jean',
                        lastName: 'Dupont',
                        dob: new Date('1990-01-15'),
                    }
                }
            },
            include: { patient: true }
        })
        console.log('✅ Patient créé:', patient.email)

        // 2. Docteur de test
        const doctor = await prisma.user.upsert({
            where: { email: 'docteur@test.com' },
            update: {},
            create: {
                email: 'docteur@test.com',
                password: hashedPassword,
                role: 'DOCTOR',
                doctor: {
                    create: {
                        firstName: 'Dr. Marie',
                        lastName: 'Martin',
                        specialty: 'Médecine générale',
                        licenseNumber: 'SN-12345',
                        status: 'verified',
                    }
                }
            },
            include: { doctor: true }
        })
        console.log('✅ Docteur créé:', doctor.email)

        // 3. Admin hôpital de test
        const hospitalAdmin = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {},
            create: {
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'HOSPITAL_ADMIN',
            }
        })
        console.log('✅ Admin hôpital créé:', hospitalAdmin.email)

        // 4. Super Admin de test
        const superAdmin = await prisma.user.upsert({
            where: { email: 'superadmin@test.com' },
            update: {},
            create: {
                email: 'superadmin@test.com',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
            }
        })
        console.log('✅ Super Admin créé:', superAdmin.email)

        console.log('\n✅ Tous les utilisateurs de test ont été créés avec succès!')
        console.log('\n📋 IDENTIFIANTS DE TEST:')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('Mot de passe pour tous: test123')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('Patient:        patient@test.com')
        console.log('Docteur:        docteur@test.com')
        console.log('Admin Hôpital:  admin@test.com')
        console.log('Super Admin:    superadmin@test.com')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    } catch (error) {
        console.error('❌ Erreur lors de la création des utilisateurs:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createTestUsers()
