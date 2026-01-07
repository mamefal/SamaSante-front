import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const appointments = await prisma.appointment.findMany({
        where: {
            start: {
                gte: today
            }
        },
        include: {
            patient: true,
            doctor: true
        }
    })
    console.log('Today appointments:', JSON.stringify(appointments, null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
