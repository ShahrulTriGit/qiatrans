import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firestore'

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

    let rentals
    try {
      rentals = await db.rental.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
    } catch {
      rentals = await db.rental.findMany({ where })
    }

    const rentalsWithRelations = await Promise.all(
      rentals.map(async (rental) => {
        const user = await db.user.findUnique({ where: { id: (rental as Record<string, string>).userId } })
        const vehicle = await db.vehicle.findUnique({ where: { id: (rental as Record<string, string>).vehicleId } })
        const { password, ...userWithoutPassword } = (user as Record<string, unknown>) || {}
        return { ...rental, user: userWithoutPassword, vehicle }
      })
    )

    return NextResponse.json({ success: true, data: rentalsWithRelations })
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
        tanggalSewa: new Date(tanggalSewa).toISOString(),
        tanggalKembali: new Date(tanggalKembali).toISOString(),
        totalHarga: Number(totalHarga),
        catatan: catatan || null,
        status: 'PENDING',
      },
    })

    // Update vehicle status to DISEWA
    await db.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'DISEWA' },
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
