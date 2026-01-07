import { PrismaClient } from '@prisma/client'
import { hash } from '../src/lib/auth.js'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Start seeding MASSIVE rich data for presentation...')

    // 0. Cleanup
    console.log('🧹 Cleaning up old data...')

    // Pour SQLite, on peut désactiver les FK temporairement pour le cleanup
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;')

    await prisma.notification.deleteMany({})
    await prisma.consultationNote.deleteMany({})
    await prisma.appointment.deleteMany({})
    await prisma.patient.deleteMany({})
    await prisma.medicalFile.deleteMany({})
    await prisma.doctor.deleteMany({})
    await prisma.practiceSite.deleteMany({})
    await prisma.payment.deleteMany({})
    await prisma.invoice.deleteMany({})
    await prisma.subscription.deleteMany({})
    await prisma.inventoryItem.deleteMany({})
    await prisma.medication.deleteMany({})
    await prisma.emergency.deleteMany({})
    await prisma.department.deleteMany({})
    await prisma.user.deleteMany({})

    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;')

    const testPassword = 'Test123456!'
    const hashedPassword = await hash(testPassword)

    // 1. Organizations
    console.log('🏢 Creating Organizations...')
    const orgs = [
        {
            name: 'Clinique SamaSanté Dakar',
            slug: 'clinique-samasante-dakar',
            type: 'clinique',
            region: 'Dakar',
            city: 'Dakar Plateau',
            address: 'Rue Mohammed V, Dakar',
            phone: '+221 33 821 00 00',
            email: 'dakar@samasante.sn'
        },
        {
            name: 'Centre Hospitalier Thies',
            slug: 'ch-thies',
            type: 'hopital',
            region: 'Thies',
            city: 'Thies',
            address: 'Avenue Malick Sy',
            phone: '+221 33 951 22 22',
            email: 'thies@samasante.sn'
        },
        {
            name: 'Clinique Privée Mbour',
            slug: 'clinique-mbour',
            type: 'clinique',
            region: 'Thies',
            city: 'Mbour',
            address: 'Quartier Saly',
            phone: '+221 33 957 11 11',
            email: 'mbour@samasante.sn'
        }
    ]

    const createdOrgs = []
    for (const org of orgs) {
        const o = await prisma.organization.upsert({
            where: { slug: org.slug },
            update: org,
            create: org
        })
        createdOrgs.push(o)
    }
    const dakarClinic = createdOrgs[0]

    // 2. Departments
    console.log('🏥 Creating Departments...')
    const depts = ['Cardiologie', 'Pédiatrie', 'Gynécologie', 'Médecine Générale', 'Urgences', 'Radiologie']
    const createdDepts = []
    for (const dept of depts) {
        const d = await prisma.department.create({
            data: {
                name: dept,
                organizationId: dakarClinic.id,
                description: `Département de ${dept} de la Clinique SamaSanté Dakar`
            }
        })
        createdDepts.push(d)
    }

    // 3. Practice Sites
    const mainSite = await prisma.practiceSite.create({
        data: {
            name: 'SamaSanté Plateau',
            type: 'clinique',
            region: 'Dakar',
            city: 'Dakar',
            address: 'Rue Carnot'
        }
    })

    // 4. Pricing Plans
    console.log('💳 Creating Pricing Plans...')
    const plans = [
        {
            name: 'Starter',
            slug: 'starter',
            description: 'Pour les petits cabinets médicaux',
            monthlyPrice: 50000,
            maxDoctors: 5,
            features: ['Dossier Patient', 'RDV en ligne']
        },
        {
            name: 'Professional',
            slug: 'professional',
            description: 'Solution complète pour cliniques',
            monthlyPrice: 150000,
            maxDoctors: 20,
            includesChat: true,
            includesPharmacy: true,
            includesAnalytics: true,
            features: ['Chat', 'Pharmacie', 'Analyses', 'Multi-sites']
        },
        {
            name: 'Enterprise',
            slug: 'enterprise',
            description: 'Le summum pour grands hôpitaux',
            monthlyPrice: 500000,
            maxDoctors: 100,
            includesChat: true,
            includesPharmacy: true,
            includesTelemed: true,
            includesAnalytics: true,
            features: ['Télémédecine', 'API', 'Support dédié']
        }
    ]

    const createdPlans = []
    for (const plan of plans) {
        const p = await prisma.pricingPlan.upsert({
            where: { slug: plan.slug },
            update: plan,
            create: plan as any
        })
        createdPlans.push(p)
    }

    // 5. Subscription
    await prisma.subscription.create({
        data: {
            organizationId: dakarClinic.id,
            planId: createdPlans[1].id,
            billingCycle: 'monthly',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'active'
        }
    })

    // 6. Users & Doctors
    console.log('👨‍⚕️ Creating Doctors...')
    const doctorData = [
        { firstName: 'Fatou', lastName: 'Sall', specialty: 'Cardiologie', email: 'fatou.sall@test.sn', deptIdx: 0 },
        { firstName: 'Abdou', lastName: 'Diop', specialty: 'Pédiatrie', email: 'abdou.diop@test.sn', deptIdx: 1 },
        { firstName: 'Khady', lastName: 'Ndiaye', specialty: 'Gynécologie', email: 'khady.ndiaye@test.sn', deptIdx: 2 },
        { firstName: 'Ibrahima', lastName: 'Faye', specialty: 'Médecine Générale', email: 'ibrahima.faye@test.sn', deptIdx: 3 },
        { firstName: 'Ousmane', lastName: 'Sow', specialty: 'Médecine Générale', email: 'ousmane.sow@test.sn', deptIdx: 3 },
        { firstName: 'Mariama', lastName: 'Diallo', specialty: 'Urgences', email: 'mariama.diallo@test.sn', deptIdx: 4 }
    ]

    const createdDoctors = []
    for (const d of doctorData) {
        const doctor = await prisma.doctor.create({
            data: {
                firstName: d.firstName,
                lastName: d.lastName,
                specialty: d.specialty,
                ordreNumber: `SN-${d.specialty.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
                status: 'verified',
                practiceSiteId: mainSite.id,
                organizationId: dakarClinic.id,
                departmentId: createdDepts[d.deptIdx].id
            }
        })
        createdDoctors.push(doctor)

        await prisma.user.upsert({
            where: { email: d.email },
            update: { doctorId: doctor.id, organizationId: dakarClinic.id, role: 'DOCTOR', password: hashedPassword },
            create: {
                email: d.email,
                password: hashedPassword,
                role: 'DOCTOR',
                doctorId: doctor.id,
                organizationId: dakarClinic.id
            }
        })
    }

    // 7. Patients
    console.log('👥 Creating Patients...')
    const patientNames = [
        { f: 'Amadou', l: 'Ba', email: 'amadou.ba@test.sn' },
        { f: 'Bineta', l: 'Gueye', email: 'bineta.gueye@test.sn' },
        { f: 'Cheikh', l: 'Tidiane', email: 'cheikh.tidiane@test.sn' },
        { f: 'Demba', l: 'Ka', email: 'demba.ka@test.sn' },
        { f: 'Fatou', l: 'Binetou', email: 'fatou.binetou@test.sn' },
        { f: 'Gorgui', l: 'Sy', email: 'gorgui.sy@test.sn' },
        { f: 'Habibatou', l: 'Wane', email: 'habibatou.wane@test.sn' },
        { f: 'Issa', l: 'Ndiaye', email: 'issa.ndiaye@test.sn' },
        { f: 'Jamil', l: 'Ba', email: 'jamil.ba@test.sn' },
        { f: 'Khadija', l: 'Sarr', email: 'khadija.sarr@test.sn' },
        { f: 'Lamine', l: 'Faye', email: 'lamine.faye@test.sn' },
        { f: 'Moussa', l: 'Diouf', email: 'moussa.diouf@test.sn' },
        { f: 'Ndèye', l: 'Sall', email: 'ndeye.sall@test.sn' },
        { f: 'Oumar', l: 'Kane', email: 'oumar.kane@test.sn' },
        { f: 'Pape', l: 'Moussa', email: 'pape.moussa@test.sn' }
    ]

    const createdPatients = []
    for (const p of patientNames) {
        const patient = await prisma.patient.create({
            data: {
                firstName: p.f,
                lastName: p.l,
                dob: new Date(1970 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
                phone: `+221 77 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
                email: p.email,
                organizationId: dakarClinic.id,
                gender: Math.random() > 0.5 ? 'male' : 'female'
            }
        })
        createdPatients.push(patient)

        // Only create user for Amadou Ba for demo
        if (p.f === 'Amadou') {
            await prisma.user.upsert({
                where: { email: p.email },
                update: { patientId: patient.id, organizationId: dakarClinic.id, role: 'PATIENT', password: hashedPassword },
                create: {
                    email: p.email,
                    password: hashedPassword,
                    role: 'PATIENT',
                    patientId: patient.id,
                    organizationId: dakarClinic.id
                }
            })

            await prisma.medicalFile.upsert({
                where: { patientId: patient.id },
                update: {},
                create: {
                    patientId: patient.id,
                    bloodType: 'O+',
                    allergies: 'Pénicilline',
                    chronicConditions: 'Hypertension',
                    treatments: 'Lisinopril 10mg',
                    emergencyContact: 'Bineta Ba (+221 77 000 00 00)'
                }
            })
        }
    }

    // 8. Super Admin & Hospital Admin
    await prisma.user.upsert({
        where: { email: 'awa.thiam@test.sn' },
        update: { password: hashedPassword, role: 'SUPER_ADMIN' },
        create: { email: 'awa.thiam@test.sn', password: hashedPassword, role: 'SUPER_ADMIN' }
    })

    const hAdmin = await prisma.user.upsert({
        where: { email: 'moussa.ndiaye@test.sn' },
        update: { password: hashedPassword, role: 'HOSPITAL_ADMIN', organizationId: dakarClinic.id },
        create: { email: 'moussa.ndiaye@test.sn', password: hashedPassword, role: 'HOSPITAL_ADMIN', organizationId: dakarClinic.id }
    })

    // 9. Appointments
    console.log('📅 Creating Appointments...')
    const statuses = ['done', 'booked', 'cancelled', 'no_show']
    const motives = ['Consultation de routine', 'Suivi médical', 'Urgence', 'Vaccination', 'Douleurs abdominales', 'Maux de tête']

    // Today's appointments (Full schedule for Fatou Sall)
    const today = new Date()
    today.setHours(8, 0, 0, 0)

    for (let i = 0; i < 8; i++) {
        const start = new Date(today.getTime() + i * 45 * 60000)
        const end = new Date(start.getTime() + 30 * 60000)
        const appt = await prisma.appointment.create({
            data: {
                patientId: createdPatients[i % createdPatients.length].id,
                doctorId: createdDoctors[0].id,
                siteId: mainSite.id,
                start,
                end,
                status: i < 3 ? 'done' : 'booked',
                motive: motives[Math.floor(Math.random() * motives.length)]
            }
        })

        if (appt.status === 'done') {
            await prisma.consultationNote.create({
                data: {
                    appointmentId: appt.id,
                    doctorId: appt.doctorId,
                    patientId: appt.patientId,
                    chiefComplaint: 'Symptômes habituels',
                    diagnosis: 'Patient en bonne santé, stabilisation observée.',
                    treatment: 'Continuer le traitement actuel.',
                    examination: 'Plaintes mineures.'
                }
            })
        }
    }

    // Past appointments for stats (Last 30 days)
    console.log('📈 Creating Analytics Data...')
    for (let i = 1; i <= 60; i++) {
        const pastDate = new Date()
        pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30))
        pastDate.setHours(Math.floor(Math.random() * 8) + 8, 0, 0, 0)

        await prisma.appointment.create({
            data: {
                patientId: createdPatients[Math.floor(Math.random() * createdPatients.length)].id,
                doctorId: createdDoctors[Math.floor(Math.random() * createdDoctors.length)].id,
                siteId: mainSite.id,
                start: pastDate,
                end: new Date(pastDate.getTime() + 30 * 60000),
                status: 'done',
                motive: motives[Math.floor(Math.random() * motives.length)]
            }
        })
    }

    // 10. Billing
    console.log('💰 Creating Billing Data...')
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    for (let i = 0; i < 12; i++) {
        const invDate = new Date(2025, i, 1)
        const inv = await prisma.invoice.create({
            data: {
                invoiceNumber: `INV-2025-${(i + 1).toString().padStart(4, '0')}`,
                organizationId: dakarClinic.id,
                type: 'subscription',
                total: 150000,
                subtotal: 150000,
                status: 'paid',
                dueDate: invDate,
                paidAt: invDate,
                items: {
                    create: {
                        description: `Abonnement Professional - ${months[i]} 2025`,
                        quantity: 1,
                        unitPrice: 150000,
                        amount: 150000
                    }
                }
            }
        })

        await prisma.payment.create({
            data: {
                invoiceId: inv.id,
                amount: 150000,
                paymentMethod: 'mobile_money',
                provider: i % 2 === 0 ? 'wave' : 'orange_money',
                status: 'completed',
                paidAt: invDate
            }
        })
    }

    // 11. Pharmacy
    console.log('💊 Filling Pharmacy Inventory...')
    const meds = [
        { name: 'Augmentin 1g', cat: 'Antibiotique', price: 4500, code: 'AUG-1G-SN' },
        { name: 'Doliprane 1000mg', cat: 'Analgésique', price: 1200, code: 'DOL-1G-SN' },
        { name: 'Amlodipine 5mg', cat: 'Antihypertenseur', price: 3500, code: 'AML-5M-SN' },
        { name: 'Metformine 500mg', cat: 'Antidiabétique', price: 2800, code: 'MET-5M-SN' },
        { name: 'Salbutamol Spray', cat: 'Asthme', price: 4200, code: 'SAL-SP-SN' },
        { name: 'Spasfon', cat: 'Antispasmodique', price: 1800, code: 'SPA-OR-SN' }
    ]

    for (const m of meds) {
        const med = await prisma.medication.upsert({
            where: { barcode: m.code },
            update: {},
            create: {
                name: m.name,
                category: m.cat,
                form: 'Comprimé',
                dosage: 'Standard',
                barcode: m.code,
                unitPrice: m.price
            }
        })

        await prisma.inventoryItem.create({
            data: {
                medicationId: med.id,
                organizationId: dakarClinic.id,
                quantity: 100 + Math.floor(Math.random() * 500),
                minQuantity: 50,
                batchNumber: `BAT-${Math.floor(Math.random() * 1000)}`,
                expiryDate: new Date(2026, 11, 31)
            }
        })
    }

    // 12. Emergencies
    console.log('🚨 Creating Emergencies...')
    const emergencyCases = [
        { name: 'Modou Fall', symptoms: 'Douleur thoracique aiguë', severity: 'Critique', triage: 'Rouge' },
        { name: 'Soda Beye', symptoms: 'Fracture ouverte tibia', severity: 'Urgent', triage: 'Orange' },
        { name: 'Malick Niang', symptoms: 'Fièvre persistante 40°C', severity: 'Stable', triage: 'Jaune' }
    ]

    for (const em of emergencyCases) {
        await prisma.emergency.create({
            data: {
                patientName: em.name,
                age: 25 + Math.floor(Math.random() * 40),
                gender: 'M',
                condition: em.symptoms,
                severity: em.severity,
                triage: em.triage,
                status: 'En attente',
                organizationId: dakarClinic.id
            }
        })
    }

    // 13. Notifications
    await prisma.notification.create({
        data: {
            userId: hAdmin.id,
            type: 'system',
            title: 'Bienvenue sur AMINA',
            message: 'La plateforme est prête pour votre présentation.'
        }
    })

    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!')
    console.log('📊 Stats Summary:')
    console.log(`- Organizations: ${createdOrgs.length}`)
    console.log(`- Doctors: ${createdDoctors.length}`)
    console.log(`- Patients: ${createdPatients.length}`)
    console.log(`- Appointments: 68+`)
    console.log(`- Invoices: 12`)
    console.log(`- Medications: ${meds.length}`)
    console.log(`- Emergencies: ${emergencyCases.length}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
