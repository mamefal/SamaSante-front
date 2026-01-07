import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Création de tous les comptes utilisateurs...\n')

    // Mots de passe robustes pour chaque rôle
    const passwords = {
        patient: 'Patient@2024!Secure',
        doctor: 'Doctor@2024!Secure',
        hospital: 'Hospital@2024!Secure',
        admin: 'Admin@2024!SuperSecure'
    }

    try {
        // 1. Créer un PATIENT
        console.log('📝 Création du compte PATIENT...')
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

        // 2. Créer un DOCTEUR
        console.log('\n📝 Création du compte DOCTEUR...')
        const doctorHash = await bcrypt.hash(passwords.doctor, 10)

        // Create or get organization first
        const organization = await prisma.organization.upsert({
            where: { slug: 'hopital-principal-dakar' },
            update: {},
            create: {
                name: 'Hôpital Principal de Dakar',
                slug: 'hopital-principal-dakar',
                type: 'hopital',
                region: 'Dakar',
                city: 'Dakar',
            }
        })

        const doctor = await prisma.user.upsert({
            where: { email: 'doctor@test.com' },
            update: {
                password: doctorHash,
            },
            create: {
                email: 'doctor@test.com',
                password: doctorHash,
                role: 'DOCTOR',
                doctor: {
                    create: {
                        firstName: 'Dr. Marie',
                        lastName: 'Diop',
                        specialty: 'Médecine Générale',
                        organizationId: organization.id,
                    }
                }
            },
            include: { doctor: true }
        })
        console.log('✅ Docteur créé:', doctor.email)

        // 3. Créer un HOSPITAL_ADMIN
        console.log('\n📝 Création du compte HOSPITAL ADMIN...')
        const hospitalHash = await bcrypt.hash(passwords.hospital, 10)
        const hospitalAdmin = await prisma.user.upsert({
            where: { email: 'hospital@test.com' },
            update: {
                password: hospitalHash,
            },
            create: {
                email: 'hospital@test.com',
                password: hospitalHash,
                role: 'HOSPITAL_ADMIN',
            }
        })
        console.log('✅ Hospital Admin créé:', hospitalAdmin.email)

        // 4. Créer un SUPER_ADMIN
        console.log('\n📝 Création du compte SUPER ADMIN...')
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

        console.log('\n' + '='.repeat(80))
        console.log('✅ TOUS LES COMPTES CRÉÉS AVEC SUCCÈS!')
        console.log('='.repeat(80))
        console.log('\n📋 IDENTIFIANTS DE CONNEXION\n')

        console.log('👤 PATIENT (Dashboard: /patient)')
        console.log('   Email:    patient@test.com')
        console.log('   Password:', passwords.patient)
        console.log('')

        console.log('👨‍⚕️ DOCTEUR (Dashboard: /doctor)')
        console.log('   Email:    doctor@test.com')
        console.log('   Password:', passwords.doctor)
        console.log('')

        console.log('🏥 HOSPITAL ADMIN (Dashboard: /hospital/dashboard)')
        console.log('   Email:    hospital@test.com')
        console.log('   Password:', passwords.hospital)
        console.log('')

        console.log('⚡ SUPER ADMIN (Dashboard: /super-admin)')
        console.log('   Email:    admin@test.com')
        console.log('   Password:', passwords.admin)

        console.log('\n' + '='.repeat(80) + '\n')

    } catch (error) {
        console.error('❌ Erreur lors de la création des comptes:', error)
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
