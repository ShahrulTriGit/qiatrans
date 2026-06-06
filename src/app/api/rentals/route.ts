import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const vehicleId = searchParams.get('vehicleId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (userId) where.userId = userId
    if (vehicleId) where.vehicleId = vehicleId
    if (status) where.status = status

    const rentals = await db.rental.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: rentals })
  } catch (error) {
    console.error('Get rentals error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data rental' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      vehicleId,
      tanggalSewa,
      tanggalKembali,
      totalHarga,
      catatan,
    } = body

    if (!userId || !vehicleId || !tanggalSewa || !tanggalKembali || !totalHarga) {
      return NextResponse.json(
        { success: false, error: 'Data rental tidak lengkap' },
        { status: 400 }
      )
    }

    const rental = await db.rental.create({
      data: {
        userId,
        vehicleId,
        tanggalSewa: new Date(tanggalSewa),
        tanggalKembali: new Date(tanggalKembali),
        totalHarga: Number(totalHarga),
        catatan: catatan || null,
        status: 'PENDING',
      },
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

    // Update vehicle status to DISERWA
    await db.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'DISERWA' },
    })

    return NextResponse.json(
      { success: true, data: rental, message: 'Rental berhasil dibuat' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create rental error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat rental' },
      { status: 500 }
    )
  }
}
