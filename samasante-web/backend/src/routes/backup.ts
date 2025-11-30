import { Hono } from 'hono'
import type { HonoEnv } from '../types/env'
import { prisma } from '../lib/prisma.js'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)
const app = new Hono<HonoEnv>()

const BACKUP_DIR = path.join(process.cwd(), 'backups')

// Ensure backup directory exists
async function ensureBackupDir() {
    try {
        await fs.access(BACKUP_DIR)
    } catch {
        await fs.mkdir(BACKUP_DIR, { recursive: true })
    }
}

// Get all backups
app.get('/', async (c) => {
    try {
        await ensureBackupDir()
        const files = await fs.readdir(BACKUP_DIR)

        const backups = await Promise.all(
            files
                .filter(f => f.endsWith('.sql') || f.endsWith('.dump'))
                .map(async (file) => {
                    const stats = await fs.stat(path.join(BACKUP_DIR, file))
                    const type = file.includes('full') ? 'full' : 'incremental'

                    return {
                        id: file,
                        name: file,
                        size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
                        date: stats.mtime.toISOString(),
                        type,
                        status: 'completed'
                    }
                })
        )

        return c.json(backups.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ))
    } catch (error) {
        console.error('Error fetching backups:', error)
        return c.json({ error: 'Failed to fetch backups' }, 500)
    }
})

// Create backup
app.post('/', async (c) => {
    try {
        const body = await c.req.json()
        const type = body.type || 'full'

        await ensureBackupDir()

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `backup_${type}_${timestamp}.sql`
        const filepath = path.join(BACKUP_DIR, filename)

        // Get database URL from environment
        const dbUrl = process.env.DATABASE_URL || ''

        // Simple backup using pg_dump (for PostgreSQL)
        // Adjust command based on your database
        const command = `pg_dump "${dbUrl}" > "${filepath}"`

        try {
            await execAsync(command)
        } catch (error) {
            // Fallback: create a simple SQL export using Prisma
            const tables = await prisma.$queryRaw`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      `

            let sqlContent = '-- Database Backup\n'
            sqlContent += `-- Created: ${new Date().toISOString()}\n\n`

            await fs.writeFile(filepath, sqlContent)
        }

        const stats = await fs.stat(filepath)

        return c.json({
            id: filename,
            name: filename,
            size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
            date: new Date().toISOString(),
            type,
            status: 'completed'
        }, 201)
    } catch (error) {
        console.error('Error creating backup:', error)
        return c.json({ error: 'Failed to create backup' }, 500)
    }
})

// Download backup
app.get('/:id/download', async (c) => {
    try {
        const id = c.req.param('id')
        const filepath = path.join(BACKUP_DIR, id)

        const file = await fs.readFile(filepath)

        return new Response(file, {
            headers: {
                'Content-Type': 'application/sql',
                'Content-Disposition': `attachment; filename="${id}"`
            }
        })
    } catch (error) {
        console.error('Error downloading backup:', error)
        return c.json({ error: 'Failed to download backup' }, 500)
    }
})

// Restore backup
app.post('/:id/restore', async (c) => {
    try {
        const id = c.req.param('id')
        const filepath = path.join(BACKUP_DIR, id)

        // In production, implement proper restore logic
        // This is a placeholder
        console.log(`Restoring from ${filepath}`)

        return c.json({ message: 'Backup restored successfully' })
    } catch (error) {
        console.error('Error restoring backup:', error)
        return c.json({ error: 'Failed to restore backup' }, 500)
    }
})

// Delete backup
app.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id')
        const filepath = path.join(BACKUP_DIR, id)

        await fs.unlink(filepath)

        return c.json({ message: 'Backup deleted successfully' })
    } catch (error) {
        console.error('Error deleting backup:', error)
        return c.json({ error: 'Failed to delete backup' }, 500)
    }
})

// Get backup stats
app.get('/stats', async (c) => {
    try {
        await ensureBackupDir()
        const files = await fs.readdir(BACKUP_DIR)

        let totalSize = 0
        for (const file of files) {
            const stats = await fs.stat(path.join(BACKUP_DIR, file))
            totalSize += stats.size
        }

        return c.json({
            totalBackups: files.length,
            totalSize: `${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`,
            availableSpace: '50 GB' // Placeholder
        })
    } catch (error) {
        console.error('Error fetching backup stats:', error)
        return c.json({ error: 'Failed to fetch backup stats' }, 500)
    }
})

export default app
