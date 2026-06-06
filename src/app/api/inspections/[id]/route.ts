import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const inspection = await db.inspection.findUnique({ where: { id } })

    if (!inspection) {
      return NextResponse.json(
        { success: false, error: 'Inspeksi tidak ditemukan' },
        { status: 404 }
      )
    }

    const ins = inspection as Record<string, string>
    const vehicle = await db.vehicle.findUnique({ where: { id: ins.vehicleId } })
    const rental = await db.rental.findUnique({ where: { id: ins.rentalId } })
    const detections = await db.detectionResult.findMany({ where: { inspectionId: id } })

    let user = null
    if (rental) {
      user = await db.user.findUnique({ where: { id: (rental as Record<string, string>).userId } })
      const { password, ...u } = (user as Record<string, unknown>) || {}
      user = u
    }

    return NextResponse.json({
      success: true,
      data: { ...inspection, vehicle, rental: rental ? { ...rental, user } : null, detections: detections || [] },
    })
  } catch (error) {
    console.error('Get inspection error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data inspeksi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingInspection = await db.inspection.findUnique({ where: { id } })

    if (!existingInspection) {
      return NextResponse.json(
        { success: false, error: 'Inspeksi tidak ditemukan' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (body.status) updateData.status = body.status
    if (body.catatan !== undefined) updateData.catatan = body.catatan

    const inspection = await db.inspection.update({
      where: { id },
      data: updateData,
    })

    const ins = inspection as Record<string, string>
    const vehicle = await db.vehicle.findUnique({ where: { id: ins.vehicleId } })
    const rental = await db.rental.findUnique({ where: { id: ins.rentalId } })
    const detections = await db.detectionResult.findMany({ where: { inspectionId: id } })

    return NextResponse.json({
      success: true,
      data: { ...inspection, vehicle, rental, detections: detections || [] },
      message: 'Inspeksi berhasil diperbarui',
    })
  } catch (error) {
    console.error('Update inspection error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui inspeksi' },
      { status: 500 }
    )
  }
}
