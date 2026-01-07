import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import { tenantMiddleware, getOrganizationFilter } from '../middleware/tenant.js'
import { getDailySlots } from '../lib/slots.js'

import type { HonoEnv } from '../types/env.js'

export const doctors = new Hono<HonoEnv>()

// Require authentication first
doctors.use('*', requireAuth())

// Apply tenant middleware to all routes
doctors.use('*', tenantMiddleware)

doctors.get('/', async (c) => {
  const q = c.req.query('q') || ''
  const orgFilter = getOrganizationFilter(c)

  const list = await prisma.doctor.findMany({
    where: {
      ...orgFilter, // Filtre par organisation
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { specialty: { contains: q } }
      ]
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    take: 50
  })
  return c.json(list)
})

// Get doctor statistics for dashboard
doctors.get('/stats', async (c) => {
  const user = c.get('user') as any
  const doctorId = user.doctorId

  if (!doctorId) {
    return c.json({ error: 'Doctor profile not found' }, 404)
  }

  // 1. Total Patients (Unique patients seen by this doctor)
  const totalPatients = await prisma.appointment.groupBy({
    by: ['patientId'],
    where: {
      doctorId: doctorId,
      status: 'done'
    }
  }).then(groups => groups.length)

  // 2. Today's Appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctorId,
      start: {
        gte: today,
        lt: tomorrow
      }
    },
    include: {
      patient: {
        select: { firstName: true, lastName: true }
      }
    },
    orderBy: { start: 'asc' }
  })

  // 3. Weekly Appointments Trend (Last 7 days)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6)
  oneWeekAgo.setHours(0, 0, 0, 0)

  const weeklyData = await prisma.appointment.findMany({
    where: {
      doctorId: doctorId,
      start: {
        gte: oneWeekAgo
      }
    },
    select: {
      start: true
    }
  })

  // Process weekly data into format expected by chart
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const trendMap = new Map<string, number>()

  // Initialize last 7 days with 0
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayName = days[d.getDay()] || ''
    if (dayName && !trendMap.has(dayName)) {
      trendMap.set(dayName, 0)
    }
  }

  weeklyData.forEach(apt => {
    const dayName = days[apt.start.getDay()] || ''
    if (dayName) {
      trendMap.set(dayName, (trendMap.get(dayName) || 0) + 1)
    }
  })

  // Convert map to array and sort to have current day last (optional, or just 7 days)
  // For simplicity, let's just return the map as an array of objects
  // We want the order to be chronological? Or just Mon-Sun? 
  // The UI expects "day" and "appointments".
  // Let's just return the last 7 days in order.
  const weeklyAppointments = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayName = days[d.getDay()] || ''
    // Count for this specific date (not just day name collision)
    const count = weeklyData.filter(a => {
      const ad = new Date(a.start)
      return ad.getDate() === d.getDate() && ad.getMonth() === d.getMonth()
    }).length

    if (dayName) {
      weeklyAppointments.push({
        day: dayName,
        appointments: count
      })
    }
  }

  // 4. Recent Activity (Last 5 actions/appointments)
  const recentActivityRaw = await prisma.appointment.findMany({
    where: { doctorId: doctorId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      patient: { select: { firstName: true, lastName: true } }
    }
  })

  const recentActivity = recentActivityRaw.map(act => ({
    id: act.id,
    patient: `${act.patient.firstName} ${act.patient.lastName}`,
    action: act.status === 'booked' ? 'Nouveau rendez-vous' :
      act.status === 'done' ? 'Consultation terminée' :
        act.status === 'cancelled' ? 'Rendez-vous annulé' : 'Mise à jour',
    time: act.createdAt ? new Date(act.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
  }))

  // 5. Revenue (Estimated: 15,000 FCFA per completed appointment)
  const completedAppointmentsCount = await prisma.appointment.count({
    where: {
      doctorId: doctorId,
      status: 'done'
    }
  })
  const revenue = completedAppointmentsCount * 15000

  // 6. Satisfaction (Real data from DoctorRating)
  const satisfactionAvg = await prisma.doctorRating.aggregate({
    where: { doctorId },
    _avg: { score: true }
  })
  const satisfaction = satisfactionAvg._avg.score || 4.8

  return c.json({
    totalPatients,
    todayAppointments: todayAppointments.map(apt => ({
      id: apt.id,
      patient: `${apt.patient.firstName} ${apt.patient.lastName}`,
      time: apt.start ? new Date(apt.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
      type: apt.motive || 'Consultation',
      status: apt.status
    })),
    weeklyAppointments,
    recentActivity,
    revenue,
    satisfaction
  })
})

// Get doctor details by ID
doctors.get('/:id',
  requireAuth(['DOCTOR', 'ADMIN', 'SUPER_ADMIN', 'HOSPITAL_ADMIN']),
  async (c) => {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) return c.text('Invalid doctor ID', 400)

    const doctor = await prisma.doctor.findUnique({
      where: { id }
    })

    if (!doctor) return c.json({ error: 'Doctor not found' }, 404)

    return c.json(doctor)
  }
)

const VerifySchema = z.object({
  ordreNumber: z.string().min(3),
  kycScore: z.number().min(0).max(100)
})

doctors.post('/:id/verify',
  requireAuth(['SUPER_ADMIN']), // Seul Super Admin peut vérifier
  zValidator('json', VerifySchema),
  async (c) => {
    const id = Number(c.req.param('id'))
    const { ordreNumber, kycScore } = c.req.valid('json')
    const d = await prisma.doctor.update({
      where: { id },
      data: { ordreNumber, kycScore, status: 'verified', verifiedAt: new Date() }
    })
    return c.json(d)
  }
)

doctors.patch('/:id/settings',
  requireAuth(['DOCTOR', 'ADMIN']),
  async (c) => {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) return c.text('Invalid doctor ID', 400)

    try {
      const settings = await c.req.json()

      // Get current settings to merge
      const doctor = await prisma.doctor.findUnique({
        where: { id }
      })

      if (!doctor) return c.json({ error: 'Doctor not found' }, 404)

      const currentSettings = (doctor as any).settings || {}
      const newSettings = { ...currentSettings, ...settings }

      const updatedDoctor = await prisma.doctor.update({
        where: { id },
        data: { settings: newSettings } as any
      })

      return c.json({ success: true, settings: (updatedDoctor as any).settings })
    } catch (error) {
      console.error('Error updating settings:', error)
      return c.json({ error: 'Failed to update settings' }, 500)
    }
  }
)

// Get doctor availability
doctors.get('/:id/availability',
  requireAuth(['PATIENT', 'DOCTOR', 'ADMIN']),
  async (c) => {
    const doctorId = Number(c.req.param('id'))
    if (Number.isNaN(doctorId)) return c.text('Invalid doctor ID', 400)

    const queryDate = c.req.query('date')
    const dateStr = (queryDate && typeof queryDate === 'string') ? queryDate : new Date().toISOString().split('T')[0]

    // Default duration 30 mins for now
    const durationMinutes = 30

    try {
      const slots = await getDailySlots({
        doctorId,
        date: dateStr,
        durationMinutes
      })

      // Format for frontend
      const formattedSlots = slots.map((slot: any) => ({
        time: slot.start, // "HH:mm"
        display: slot.start
      }))

      return c.json(formattedSlots)
    } catch (error) {
      console.error('Error fetching availability:', error)
      return c.json({ error: 'Failed to fetch availability' }, 500)
    }
  }
)

// Save doctor availability
doctors.post('/:id/availability',
  requireAuth(['DOCTOR', 'ADMIN']),
  async (c) => {
    const doctorId = Number(c.req.param('id'))
    if (Number.isNaN(doctorId)) return c.text('Invalid doctor ID', 400)

    try {
      const body = await c.req.json()
      const { weeklySchedule, consultationDuration } = body

      // Check if availability record exists
      const existingAvailability = await prisma.availability.findFirst({
        where: { doctorId }
      })

      const ruleJson = JSON.stringify({
        weeklySchedule,
        consultationDuration
      })

      if (existingAvailability) {
        await prisma.availability.update({
          where: { id: existingAvailability.id },
          data: { ruleJson }
        })
      } else {
        await prisma.availability.create({
          data: {
            doctorId,
            ruleJson
          }
        })
      }

      return c.json({ success: true })
    } catch (error) {
      console.error('Error saving availability:', error)
      return c.json({ error: 'Failed to save availability' }, 500)
    }
  }
)

// Get doctor availability settings (rules)
doctors.get('/:id/availability/settings',
  requireAuth(['DOCTOR', 'ADMIN']),
  async (c) => {
    const doctorId = Number(c.req.param('id'))
    if (Number.isNaN(doctorId)) return c.text('Invalid doctor ID', 400)

    try {
      const availability = await prisma.availability.findFirst({
        where: { doctorId }
      })

      if (!availability) {
        return c.json({ weeklySchedule: null, consultationDuration: 30 })
      }

      return c.json(JSON.parse(availability.ruleJson))
    } catch (error) {
      console.error('Error fetching availability settings:', error)
      return c.json({ error: 'Failed to fetch availability settings' }, 500)
    }
  }
)

// Get doctor's patients
doctors.get('/:id/patients',
  requireAuth(['DOCTOR', 'ADMIN']),
  async (c) => {
    const doctorId = Number(c.req.param('id'))
    if (Number.isNaN(doctorId)) return c.text('Invalid doctor ID', 400)

    try {
      // 1. Find all appointments for this doctor to identify patients
      const appointments = await prisma.appointment.findMany({
        where: { doctorId },
        select: {
          patientId: true,
          start: true,
          status: true,
          motive: true
        },
        orderBy: { start: 'desc' }
      })

      const patientIds = [...new Set(appointments.map(a => a.patientId))]

      // 2. Fetch patient details
      const patients = await prisma.patient.findMany({
        where: { id: { in: patientIds } },
        include: {
          medicalFile: {
            select: {
              bloodType: true,
              allergies: true,
              chronicConditions: true
            }
          }
        }
      })

      // 3. Format data
      const formattedPatients = patients.map(patient => {
        const patientApps = appointments.filter(a => a.patientId === patient.id)

        const lastVisit = patientApps.find(a => a.status === 'done' && new Date(a.start) < new Date())
        const nextAppointment = patientApps.find(a => new Date(a.start) > new Date() && a.status !== 'cancelled')

        // Calculate age from DOB
        const age = new Date().getFullYear() - new Date(patient.dob).getFullYear()

        // Helper to parse potential JSON or return array
        const parseList = (str: string | null) => {
          if (!str) return []
          try {
            return JSON.parse(str)
          } catch {
            return [str]
          }
        }

        const medicalFile = patient.medicalFile || { chronicConditions: null, bloodType: null, allergies: null }

        return {
          id: patient.id.toString(),
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email || "",
          phone: patient.phone || "",
          age: age,
          gender: "female", // Placeholder, gender not in Patient schema yet
          city: "Dakar", // Placeholder, address not in Patient schema yet
          lastVisit: lastVisit?.start.toISOString() || null,
          nextAppointment: nextAppointment?.start.toISOString() || null,
          totalVisits: patientApps.filter(a => a.status === 'done').length,
          status: "active",
          conditions: parseList(medicalFile.chronicConditions || null),
          bloodType: medicalFile.bloodType || "",
          allergies: parseList(medicalFile.allergies || null),
          appointments: patientApps.slice(0, 5).map(a => ({
            id: "0",
            date: a.start.toISOString().split('T')[0],
            time: a.start.toISOString().split('T')[1].substring(0, 5),
            type: a.motive,
            status: a.status
          }))
        }
      })

      return c.json(formattedPatients)

    } catch (error) {
      console.error('Error fetching patients:', error)
      return c.json({ error: 'Failed to fetch patients' }, 500)
    }
  }
)
