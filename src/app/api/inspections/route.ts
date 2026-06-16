import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rentalId = searchParams.get('rentalId')
    const jenisInspeksi = searchParams.get('jenisInspeksi')
    const userId = searchParams.get('userId')

    let where: Record<string, unknown> = {}

    if (rentalId) where.rentalId = rentalId
    if (jenisInspeksi) where.jenisInspeksi = jenisInspeksi

    if (userId) {
      const userRentals = (await db.rental.findMany({
        where: { userId },
      })) as Record<string, unknown>[]
      const rentalIds = (userRentals || []).map((r) => r.id as string)
      if (rentalIds.length > 0) {
        where.rentalId = { in: rentalIds }
      } else {
        return NextResponse.json({ success: true, data: [] })
      }
    }

    const inspections = await db.inspection.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const inspectionsWithRelations = await Promise.all(
      (inspections || []).map(async (ins) => {
        const i = ins as Record<string, string>
        const vehicle = await db.vehicle.findUnique({ where: { id: i.vehicleId } })
        const rental = await db.rental.findUnique({ where: { id: i.rentalId } })
        const detections = await db.detectionResult.findMany({ where: { inspectionId: i.id } })

        let user = null
        if (rental) {
          user = await db.user.findUnique({ where: { id: (rental as Record<string, string>).userId } })
          const { password, ...u } = (user as Record<string, unknown>) || {}
          user = u
        }

        return { ...ins, vehicle, rental: rental ? { ...rental, user } : null, detections: detections || [] }
      })
    )

    return NextResponse.json({ success: true, data: inspectionsWithRelations })
  } catch (error) {
    console.error('Get inspections error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data inspeksi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rentalId, vehicleId, jenisInspeksi, catatan } = body

    if (!rentalId || !vehicleId || !jenisInspeksi) {
      return NextResponse.json(
        { success: false, error: 'Data inspeksi tidak lengkap' },
        { status: 400 }
      )
    }

    const inspection = await db.inspection.create({
      data: {
        rentalId,
        vehicleId,
        jenisInspeksi,
        catatan: catatan || null,
        status: 'PENDING',
      },
    })

    const ins = inspection as Record<string, string>
    const vehicle = await db.vehicle.findUnique({ where: { id: ins.vehicleId } })
    const rental = await db.rental.findUnique({ where: { id: ins.rentalId } })

    return NextResponse.json(
      { success: true, data: { ...inspection, vehicle, rental }, message: 'Inspeksi berhasil dibuat' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create inspection error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat inspeksi' },
      { status: 500 }
    )
  }
}
