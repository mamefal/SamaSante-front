import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Création de TOUS les comptes utilisateurs...\n')

    const passwords = {
        patient: 'Patient@2024!Secure',
        doctor: 'Doctor@2024!Secure',
        hospital: 'Hospital@2024!Secure',
        admin: 'Admin@2024!SuperSecure'
    }

    try {
        // Créer une organisation par défaut pour les docteurs
        const org = await prisma.organization.upsert({
            where: { slug: 'hopital-test' },
            update: {},
            create: {
                name: 'Hôpital de Test',
                slug: 'hopital-test',
                type: 'hopital',
                region: 'Dakar',
                city: 'Dakar'
            }
        })

        // 1. PATIENT
        console.log('📝 Création du compte PATIENT...')
        const patientHash = await bcrypt.hash(passwords.patient, 10)
        const patient = await prisma.user.upsert({
            where: { email: 'patient@test.com' },
            update: { password: patientHash },
            create: {
                email: 'patient@test.com',
                password: patientHash,
                role: 'PATIENT',
                patient: {
                    create: {
                        firstName: 'daouda ',
                        lastName: 'sarr',
                        dob: new Date('1990-01-15'),
                    }
                }
            }
        })
        console.log('✅ Patient créé:', patient.email)

        // 2. DOCTEUR
        console.log('\n📝 Création du compte DOCTEUR...')
        const doctorHash = await bcrypt.hash(passwords.doctor, 10)

        // Créer d'abord le docteur
        const doctorProfile = await prisma.doctor.upsert({
            where: { id: 1 },
            update: {},
            create: {
                firstName: 'Dr. Marie',
                lastName: 'Diop',
                specialty: 'Médecine Générale',
                organizationId: org.id
            }
        })

        // Puis créer l'utilisateur lié
        const doctor = await prisma.user.upsert({
            where: { email: 'doctor@test.com' },
            update: { password: doctorHash, doctorId: doctorProfile.id },
            create: {
                email: 'doctor@test.com',
                password: doctorHash,
                role: 'DOCTOR',
                doctorId: doctorProfile.id,
                organizationId: org.id
            }
        })
        console.log('✅ Docteur créé:', doctor.email)

        // 3. HOSPITAL ADMIN
        console.log('\n📝 Création du compte HOSPITAL ADMIN...')
        const hospitalHash = await bcrypt.hash(passwords.hospital, 10)
        const hospitalAdmin = await prisma.user.upsert({
            where: { email: 'hospital@test.com' },
            update: { password: hospitalHash },
            create: {
                email: 'hospital@test.com',
                password: hospitalHash,
                role: 'HOSPITAL_ADMIN',
                organizationId: org.id
            }
        })
        console.log('✅ Hospital Admin créé:', hospitalAdmin.email)

        // 4. SUPER ADMIN
        console.log('\n📝 Création du compte SUPER ADMIN...')
        const adminHash = await bcrypt.hash(passwords.admin, 10)
        const superAdmin = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: { password: adminHash },
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

        console.log('👤 PATIENT')
        console.log('   Email:     patient@test.com')
        console.log('   Password:  ' + passwords.patient)
        console.log('   Dashboard: /patient')
        console.log('')

        console.log('👨‍⚕️ DOCTEUR')
        console.log('   Email:     doctor@test.com')
        console.log('   Password:  ' + passwords.doctor)
        console.log('   Dashboard: /doctor')
        console.log('')

        console.log('🏥 HOSPITAL ADMIN')
        console.log('   Email:     hospital@test.com')
        console.log('   Password:  ' + passwords.hospital)
        console.log('   Dashboard: /hospital/dashboard')
        console.log('')

        console.log('⚡ SUPER ADMIN')
        console.log('   Email:     admin@test.com')
        console.log('   Password:  ' + passwords.admin)
        console.log('   Dashboard: /super-admin')
        console.log('   Monitoring: /monitoring')

        console.log('\n' + '='.repeat(80) + '\n')

    } catch (error) {
        console.error('❌ Erreur:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
