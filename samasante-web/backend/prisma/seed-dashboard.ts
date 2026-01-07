import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding dashboard data...')

    // 1. Get an organization
    const org = await prisma.organization.findFirst()
    if (!org) {
        console.error('No organization found. Run main seed first.')
        return
    }

    // 2. Get a doctor
    const doctor = await prisma.doctor.findFirst({
        where: { organizationId: org.id }
    })
    if (!doctor) {
        console.error('No doctor found.')
        return
    }

    // 3. Get some patients
    const patients = await prisma.patient.findMany({ take: 5 })
    if (patients.length === 0) {
        console.error('No patients found.')
        return
    }

    // 4. Create some ratings
    console.log('Creating ratings...')
    for (const patient of patients) {
        await prisma.doctorRating.upsert({
            where: { appointmentId: undefined, id: patient.id }, // Just dummy keys for seeding
            update: {},
            create: {
                doctorId: doctor.id,
                patientId: patient.id,
                score: Math.floor(Math.random() * 2) + 4, // 4 or 5
                comment: 'Excellent service!'
            }
        }).catch(() => { })
    }

    // 5. Update appointment sources
    console.log('Updating appointment sources...')
    const appointments = await prisma.appointment.findMany({
        where: { doctorId: doctor.id }
    })

    for (const apt of appointments) {
        await prisma.appointment.update({
            where: { id: apt.id },
            data: {
                source: Math.random() > 0.4 ? 'mobile' : 'web'
            }
        })
    }

    // 6. Create some rooms if none
    console.log('Creating rooms...')
    const roomCount = await prisma.room.count({ where: { organizationId: org.id } })
    if (roomCount === 0) {
        const dept = await prisma.department.findFirst({ where: { organizationId: org.id } })
        if (dept) {
            await prisma.room.create({
                data: {
                    number: '101',
                    type: 'standard',
                    status: 'available',
                    organizationId: org.id,
                    departmentId: dept.id,
                    beds: {
                        create: [
                            { number: '101-A' },
                            { number: '101-B' }
                        ]
                    }
                }
            })
            await prisma.room.create({
                data: {
                    number: '202',
                    type: 'vip',
                    status: 'occupied',
                    organizationId: org.id,
                    departmentId: dept.id,
                    beds: {
                        create: [
                            { number: '202-A', status: 'occupied' }
                        ]
                    }
                }
            })
        }
    }

    console.log('Dashboard seeding done!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
