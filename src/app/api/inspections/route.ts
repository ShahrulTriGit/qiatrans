import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rentalId = searchParams.get('rentalId')
    const jenisInspeksi = searchParams.get('jenisInspeksi')

    const where: Record<string, unknown> = {}

    if (rentalId) where.rentalId = rentalId
    if (jenisInspeksi) where.jenisInspeksi = jenisInspeksi

    const inspections = await db.inspection.findMany({
      where,
      include: {
        vehicle: true,
        rental: {
          include: {
            user: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
          },
        },
        detections: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: inspections })
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
      include: {
        vehicle: true,
        rental: true,
      },
    })

    return NextResponse.json(
      { success: true, data: inspection, message: 'Inspeksi berhasil dibuat' },
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
