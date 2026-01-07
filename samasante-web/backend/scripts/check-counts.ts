import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const doctors = await prisma.doctor.findMany()
    console.log('Doctors:', JSON.stringify(doctors, null, 2))

    const patients = await prisma.patient.findMany()
    console.log('Patients:', JSON.stringify(patients, null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
