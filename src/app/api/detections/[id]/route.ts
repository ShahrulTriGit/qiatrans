import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const detection = await db.detectionResult.findUnique({
      where: { id },
      include: {
        inspection: {
          include: {
            vehicle: true,
            rental: true,
          },
        },
      },
    })

    if (!detection) {
      return NextResponse.json(
        { success: false, error: 'Hasil deteksi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: detection })
  } catch (error) {
    console.error('Get detection error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data deteksi' },
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

    const existingDetection = await db.detectionResult.findUnique({
      where: { id },
    })

    if (!existingDetection) {
      return NextResponse.json(
        { success: false, error: 'Hasil deteksi tidak ditemukan' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (body.verified !== undefined) updateData.verified = body.verified
    if (body.verifiedBy !== undefined) updateData.verifiedBy = body.verifiedBy
    if (body.severity) updateData.severity = body.severity
    if (body.lokasiLecet) updateData.lokasiLecet = body.lokasiLecet

    const detection = await db.detectionResult.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: detection,
      message: 'Hasil deteksi berhasil diperbarui',
    })
  } catch (error) {
    console.error('Update detection error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui hasil deteksi' },
      { status: 500 }
    )
  }
}
