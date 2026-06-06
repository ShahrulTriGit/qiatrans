import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inspectionId = searchParams.get('inspectionId')

    const where: Record<string, unknown> = {}

    if (inspectionId) where.inspectionId = inspectionId

    const detections = await db.detectionResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const detectionsWithRelations = await Promise.all(
      (detections || []).map(async (det) => {
        const d = det as Record<string, string>
        const inspection = await db.inspection.findUnique({ where: { id: d.inspectionId } })
        let vehicle = null
        if (inspection) {
          vehicle = await db.vehicle.findUnique({ where: { id: (inspection as Record<string, string>).vehicleId } })
        }
        return { ...det, inspection: inspection ? { ...inspection, vehicle } : null }
      })
    )

    return NextResponse.json({ success: true, data: detectionsWithRelations })
  } catch (error) {
    console.error('Get detections error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data deteksi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      inspectionId,
      lokasiLecet,
      confidence,
      gambarAsli,
      gambarHasil,
      severity,
    } = body

    if (!inspectionId || !lokasiLecet || confidence === undefined || !gambarAsli || !gambarHasil) {
      return NextResponse.json(
        { success: false, error: 'Data deteksi tidak lengkap' },
        { status: 400 }
      )
    }

    const detection = await db.detectionResult.create({
      data: {
        inspectionId,
        lokasiLecet,
        confidence: Number(confidence),
        gambarAsli,
        gambarHasil,
        severity: severity || 'RINGAN',
        verified: false,
      },
    })

    return NextResponse.json(
      { success: true, data: detection, message: 'Hasil deteksi berhasil dibuat' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create detection error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat hasil deteksi' },
      { status: 500 }
    )
  }
}
