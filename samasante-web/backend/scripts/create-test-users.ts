import { PrismaClient } from '@prisma/client'
import { hash } from '../src/lib/auth.js'

const prisma = new PrismaClient()

async function createTestUsers() {
    console.log('🔧 Creating test users...')

    const testPassword = 'Test123456!' // Strong password for all test accounts
    const hashedPassword = await hash(testPassword)

    // 1. Créer une organisation par défaut
    const org = await prisma.organization.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Clinique SamaSanté Dakar',
            slug: 'samasante-dakar',
            type: 'clinique',
            region: 'Dakar',
            city: 'Dakar',
            address: 'Plateau, Dakar',
            email: 'contact@samasante.sn'
        }
    })
    console.log('✅ Default organization ensured')

    // 2. Créer des plans tarifaires
    const plans = [
        {
            id: 1,
            name: 'Starter',
            slug: 'starter',
            monthlyPrice: 50000,
            yearlyPrice: 540000,
            maxDoctors: 5,
            includesChat: false,
            includesPharmacy: false
        },
        {
            id: 2,
            name: 'Professional',
            slug: 'professional',
            monthlyPrice: 150000,
            yearlyPrice: 1620000,
            maxDoctors: 20,
            includesChat: true,
            includesPharmacy: true
        }
    ]

    for (const plan of plans) {
        await prisma.pricingPlan.upsert({
            where: { id: plan.id },
            update: plan,
            create: plan as any
        })
    }
    console.log('✅ Pricing plans ensured')

    const users = [
        {
            email: 'awa.thiam@test.sn',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            firstName: 'Awa',
            lastName: 'Thiam',
            organizationId: 1,
        },
        {
            email: 'moussa.ndiaye@test.sn',
            password: hashedPassword,
            role: 'HOSPITAL_ADMIN',
            firstName: 'Moussa',
            lastName: 'Ndiaye',
            organizationId: 1,
        },
        {
            email: 'fatou.sall@test.sn',
            password: hashedPassword,
            role: 'DOCTOR',
            firstName: 'Fatou',
            lastName: 'Sall',
            organizationId: 1,
        },
        {
            email: 'amadou.ba@test.sn',
            password: hashedPassword,
            role: 'PATIENT',
            firstName: 'Amadou',
            lastName: 'Ba',
            organizationId: 1,
        },
    ]

    for (const userData of users) {
        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email },
            })

            if (existingUser) {
                // Update existing user
                await prisma.user.update({
                    where: { email: userData.email },
                    data: {
                        password: hashedPassword,
                        role: userData.role as any,
                    },
                })
                console.log(`✅ Updated user: ${userData.email} (${userData.role})`)
            } else {
                // Create new user (without doctor/patient reference first)
                const user = await prisma.user.create({
                    data: {
                        email: userData.email,
                        password: userData.password,
                        role: userData.role as any,
                        organizationId: userData.organizationId,
                    },
                })

                // If doctor, create doctor profile and link to user
                if (userData.role === 'DOCTOR') {
                    const doctor = await prisma.doctor.create({
                        data: {
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            specialty: 'Médecine Générale',
                            organizationId: userData.organizationId,
                        },
                    })

                    // Update user with doctorId
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { doctorId: doctor.id },
                    })
                }

                // If patient, create patient profile and link to user
                if (userData.role === 'PATIENT') {
                    const patient = await prisma.patient.create({
                        data: {
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            dob: new Date('1990-01-01'),
                            gender: 'M',
                            phone: '+221771234567',
                            organizationId: userData.organizationId,
                        },
                    })

                    // Update user with patientId
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { patientId: patient.id },
                    })
                }

                console.log(`✅ Created user: ${userData.email} (${userData.role})`)
            }
        } catch (error) {
            console.error(`❌ Error creating user ${userData.email}:`, error)
        }
    }

    console.log('\n📋 Test Accounts:')
    console.log('==================')
    console.log('Email: awa.thiam@test.sn')
    console.log('Password: Test123456!')
    console.log('Role: SUPER_ADMIN')
    console.log('')
    console.log('Email: moussa.ndiaye@test.sn')
    console.log('Password: Test123456!')
    console.log('Role: HOSPITAL_ADMIN')
    console.log('')
    console.log('Email: fatou.sall@test.sn')
    console.log('Password: Test123456!')
    console.log('Role: DOCTOR')
    console.log('')
    console.log('Email: amadou.ba@test.sn')
    console.log('Password: Test123456!')
    console.log('Role: PATIENT')
    console.log('==================\n')
}

createTestUsers()
    .then(() => {
        console.log('✅ Test users created successfully')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Error:', error)
        process.exit(1)
    })
    .finally(() => {
        prisma.$disconnect()
    })
