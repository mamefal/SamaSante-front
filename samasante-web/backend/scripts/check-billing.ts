import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const orgs = await prisma.organization.findMany({
        include: {
            _count: {
                select: {
                    doctors: true,
                    patients: true,
                    invoices: true
                }
            }
        }
    })
    console.log('Organizations:', JSON.stringify(orgs, null, 2))

    const invoices = await prisma.invoice.findMany({
        include: { items: true }
    })
    console.log('Invoices:', JSON.stringify(invoices, null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
