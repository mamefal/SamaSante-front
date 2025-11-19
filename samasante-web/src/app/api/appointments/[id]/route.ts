
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const doctorId = searchParams.get("doctorId")
  const patientId = searchParams.get("patientId")
  const status = searchParams.get("status")

  try {
    const where: any = {}

    if (doctorId) {
      where.doctorId = Number.parseInt(doctorId)
    }
    if (patientId) {
      where.patientId = Number.parseInt(patientId)
    }
    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        site: {
          select: {
            name: true,
            city: true,
            address: true,
          },
        },
      },
      orderBy: {
        start: "asc",
      },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, doctorId, start, end, motive, siteId } = body

    // Check if the time slot is available
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: Number.parseInt(doctorId),
        start: new Date(start),
        status: {
          not: "cancelled",
        },
      },
    })

    if (existingAppointments.length > 0) {
      return NextResponse.json({ error: "Ce créneau n'est pas disponible" }, { status: 400 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: Number.parseInt(patientId),
        doctorId: Number.parseInt(doctorId),
        start: new Date(start),
        end: new Date(end),
        motive,
        siteId: siteId ? Number.parseInt(siteId) : null,
        status: "booked",
        source: "web",
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
