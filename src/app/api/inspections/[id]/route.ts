import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const inspection = await db.inspection.findUnique({
      where: { id },
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
    })

    if (!inspection) {
      return NextResponse.json(
        { success: false, error: 'Inspeksi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: inspection })
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

    const existingInspection = await db.inspection.findUnique({
      where: { id },
    })

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
      include: {
        vehicle: true,
        rental: true,
        detections: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: inspection,
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
