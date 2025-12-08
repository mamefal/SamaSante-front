import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Création des utilisateurs de test...\n')

    const password = 'test123'
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        // 1. Créer un patient
        const patient = await prisma.user.upsert({
            where: { email: 'patient@test.com' },
            update: {
                password: hashedPassword,
            },
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

        // 2. Créer un super admin (sans relation doctor/patient)
        const superAdmin = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {
                password: hashedPassword,
            },
            create: {
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
            }
        })
        console.log('✅ Super Admin créé:', superAdmin.email)

        console.log('\n✅ Utilisateurs de test créés avec succès!')
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('📋 IDENTIFIANTS DE TEST')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('Mot de passe pour tous: test123')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('Patient:      patient@test.com')
        console.log('Super Admin:  admin@test.com')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    } catch (error) {
        console.error('❌ Erreur:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
