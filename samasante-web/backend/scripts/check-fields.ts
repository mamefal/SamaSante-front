import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // @ts-ignore
    const doctor = await prisma.doctor.findFirst()
    console.log('Fields in Doctor:', Object.keys(doctor || {}))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
