import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Création des utilisateurs avec mots de passe robustes...\n')

    // Mots de passe robustes
    const passwords = {
        patient: 'Patient@2024!Secure',
        admin: 'Admin@2024!SuperSecure'
    }

    try {
        // 1. Créer un patient
        const patientHash = await bcrypt.hash(passwords.patient, 10)
        const patient = await prisma.user.upsert({
            where: { email: 'patient@test.com' },
            update: {
                password: patientHash,
            },
            create: {
                email: 'patient@test.com',
                password: patientHash,
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

        // 2. Créer un super admin
        const adminHash = await bcrypt.hash(passwords.admin, 10)
        const superAdmin = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {
                password: adminHash,
            },
            create: {
                email: 'admin@test.com',
                password: adminHash,
                role: 'SUPER_ADMIN',
            }
        })
        console.log('✅ Super Admin créé:', superAdmin.email)

        console.log('\n✅ Utilisateurs créés avec succès!')
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('📋 IDENTIFIANTS DE TEST (MOTS DE PASSE ROBUSTES)')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('Patient:')
        console.log('  Email:    patient@test.com')
        console.log('  Password:', passwords.patient)
        console.log('')
        console.log('Super Admin:')
        console.log('  Email:    admin@test.com')
        console.log('  Password:', passwords.admin)
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
