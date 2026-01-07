import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config()
const prisma = new PrismaClient()
const keys = Object.getOwnPropertyNames(prisma).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(prisma)))
console.log('Available Prisma keys:', keys.filter(k => !k.startsWith('_')).slice(0, 100))
process.exit(0)
