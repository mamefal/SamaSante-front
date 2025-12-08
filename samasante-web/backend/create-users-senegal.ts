import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🇸🇳 Création des comptes avec noms sénégalais...\n')

    const passwords = {
        patient: 'Patient@2024!Secure',
        doctor: 'Doctor@2024!Secure',
        hospital: 'Hospital@2024!Secure',
        admin: 'Admin@2024!SuperSecure'
    }

    try {
        // Créer une organisation
        const org = await prisma.organization.upsert({
            where: { slug: 'hopital-fann-dakar' },
            update: {},
            create: {
                name: 'Hôpital Fann de Dakar',
                slug: 'hopital-fann-dakar',
                type: 'hopital',
                region: 'Dakar',
                city: 'Dakar'
            }
        })

        // 1. PATIENT - Amadou Diallo
        console.log('📝 Création du compte PATIENT...')
        const patientHash = await bcrypt.hash(passwords.patient, 10)
        const patient = await prisma.user.upsert({
            where: { email: 'amadou.diallo@test.sn' },
            update: { password: patientHash },
            create: {
                email: 'amadou.diallo@test.sn',
                password: patientHash,
                role: 'PATIENT',
                patient: {
                    create: {
                        firstName: 'Amadou',
                        lastName: 'Diallo',
                        dob: new Date('1985-03-20'),
                    }
                }
            }
        })
        console.log('✅ Patient créé:', patient.email, '- Amadou Diallo')

        // 2. DOCTEUR - Dr. Fatou Sall
        console.log('\n📝 Création du compte DOCTEUR...')
        const doctorHash = await bcrypt.hash(passwords.doctor, 10)

        const doctorProfile = await prisma.doctor.upsert({
            where: { id: 1 },
            update: {},
            create: {
                firstName: 'Dr. Fatou',
                lastName: 'Sall',
                specialty: 'Médecine Générale',
                organizationId: org.id
            }
        })

        const doctor = await prisma.user.upsert({
            where: { email: 'fatou.sall@test.sn' },
            update: { password: doctorHash, doctorId: doctorProfile.id },
            create: {
                email: 'fatou.sall@test.sn',
                password: doctorHash,
                role: 'DOCTOR',
                doctorId: doctorProfile.id,
                organizationId: org.id
            }
        })
        console.log('✅ Docteur créé:', doctor.email, '- Dr. Fatou Sall')

        // 3. HOSPITAL ADMIN - Moussa Ndiaye
        console.log('\n📝 Création du compte HOSPITAL ADMIN...')
        const hospitalHash = await bcrypt.hash(passwords.hospital, 10)
        const hospitalAdmin = await prisma.user.upsert({
            where: { email: 'moussa.ndiaye@test.sn' },
            update: { password: hospitalHash },
            create: {
                email: 'moussa.ndiaye@test.sn',
                password: hospitalHash,
                role: 'HOSPITAL_ADMIN',
                organizationId: org.id
            }
        })
        console.log('✅ Hospital Admin créé:', hospitalAdmin.email, '- Moussa Ndiaye')

        // 4. SUPER ADMIN - Awa Thiam
        console.log('\n📝 Création du compte SUPER ADMIN...')
        const adminHash = await bcrypt.hash(passwords.admin, 10)
        const superAdmin = await prisma.user.upsert({
            where: { email: 'awa.thiam@test.sn' },
            update: { password: adminHash },
            create: {
                email: 'awa.thiam@test.sn',
                password: adminHash,
                role: 'SUPER_ADMIN',
            }
        })
        console.log('✅ Super Admin créé:', superAdmin.email, '- Awa Thiam')

        console.log('\n' + '='.repeat(80))
        console.log('🇸🇳 TOUS LES COMPTES SÉNÉGALAIS CRÉÉS!')
        console.log('='.repeat(80))
        console.log('\n📋 IDENTIFIANTS DE CONNEXION\n')

        console.log('👤 PATIENT - Amadou Diallo')
        console.log('   Email:     amadou.diallo@test.sn')
        console.log('   Password:  ' + passwords.patient)
        console.log('   Dashboard: /patient')
        console.log('')

        console.log('👨‍⚕️ DOCTEUR - Dr. Fatou Sall')
        console.log('   Email:     fatou.sall@test.sn')
        console.log('   Password:  ' + passwords.doctor)
        console.log('   Dashboard: /doctor')
        console.log('')

        console.log('🏥 HOSPITAL ADMIN - Moussa Ndiaye')
        console.log('   Email:     moussa.ndiaye@test.sn')
        console.log('   Password:  ' + passwords.hospital)
        console.log('   Dashboard: /hospital/dashboard')
        console.log('')

        console.log('⚡ SUPER ADMIN - Awa Thiam')
        console.log('   Email:     awa.thiam@test.sn')
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
