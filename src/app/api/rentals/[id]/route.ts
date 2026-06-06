import { NextRequest, NextResponse } from 'next/server'
import { getSession } from 'next-auth/react'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rental = await db.rental.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            noTelepon: true,
            role: true,
            alamat: true,
          },
        },
        vehicle: true,
        inspections: {
          include: {
            detections: true,
          },
        },
      },
    })

    if (!rental) {
      return NextResponse.json(
        { success: false, error: 'Rental tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: rental })
  } catch (error) {
    console.error('Get rental error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data rental' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params
    const body = await request.json()

    const existingRental = await db.rental.findUnique({
      where: { id },
    })

    if (!existingRental) {
      return NextResponse.json(
        { success: false, error: 'Rental tidak ditemukan' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    // Admin can change status to any value
    if (body.status && session && session.user.role === 'ADMIN') {
      updateData.status = body.status

      // If status is ACTIVE, update vehicle status
      if (body.status === 'ACTIVE') {
        await db.vehicle.update({
          where: { id: existingRental.vehicleId },
          data: { status: 'DISEWA' },
        })
      }

      // If status is COMPLETED or CANCELLED, make vehicle available again
      if (body.status === 'COMPLETED' || body.status === 'CANCELLED') {
        await db.vehicle.update({
          where: { id: existingRental.vehicleId },
          data: { status: 'TERSEDIA' },
        })
        updateData.tanggalPengembalian = new Date()
      }
    }

    if (body.catatan !== undefined) {
      updateData.catatan = body.catatan
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data yang diperbarui' },
        { status: 400 }
      )
    }

    const rental = await db.rental.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            noTelepon: true,
            role: true,
          },
        },
        vehicle: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: rental,
      message: 'Rental berhasil diperbarui',
    })
  } catch (error) {
    console.error('Update rental error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui rental' },
      { status: 500 }
    )
  }
}
