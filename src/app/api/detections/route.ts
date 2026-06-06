import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inspectionId = searchParams.get('inspectionId')

    const where: Record<string, unknown> = {}

    if (inspectionId) where.inspectionId = inspectionId

    const detections = await db.detectionResult.findMany({
      where,
      include: {
        inspection: {
          include: {
            vehicle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: detections })
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
