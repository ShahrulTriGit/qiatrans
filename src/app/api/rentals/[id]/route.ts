import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rental = await db.rental.findUnique({ where: { id } })

    if (!rental) {
      return NextResponse.json(
        { success: false, error: 'Rental tidak ditemukan' },
        { status: 404 }
      )
    }

    const r = rental as Record<string, string>
    const user = await db.user.findUnique({ where: { id: r.userId } })
    const vehicle = await db.vehicle.findUnique({ where: { id: r.vehicleId } })

    const { password, ...userWithoutPassword } = (user as Record<string, unknown>) || {}

    return NextResponse.json({
      success: true,
      data: { ...rental, user: userWithoutPassword, vehicle },
    })
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
    const session = await getServerSession(authOptions)
    const { id } = await params
    const body = await request.json()

    const existingRental = await db.rental.findUnique({ where: { id } })

    if (!existingRental) {
      return NextResponse.json(
        { success: false, error: 'Rental tidak ditemukan' },
        { status: 404 }
      )
    }

    const existing = existingRental as Record<string, string>
    const updateData: Record<string, unknown> = {}

    if (body.status && session && (session.user.role === 'ADMIN' || session.user.role === 'OWNER' || session.user.role === 'SUPER_ADMIN')) {
      updateData.status = body.status

      if (body.status === 'ACTIVE') {
        await db.vehicle.update({
          where: { id: existing.vehicleId },
          data: { status: 'DISEWA' },
        })
      }

      if (body.status === 'COMPLETED' || body.status === 'CANCELLED') {
        await db.vehicle.update({
          where: { id: existing.vehicleId },
          data: { status: 'TERSEDIA' },
        })
        updateData.tanggalPengembalian = new Date().toISOString()
      }
    }

    if (body.catatan !== undefined) {
      updateData.catatan = body.catatan
    }

    if (body.extendHours && session) {
      if (existing.status !== 'ACTIVE' && existing.status !== 'PENDING') {
        return NextResponse.json(
          { success: false, error: 'Hanya rental aktif atau pending yang bisa diperpanjang' },
          { status: 400 }
        )
      }

      const hours = Number(body.extendHours)
      if (![6, 12, 24].includes(hours)) {
        return NextResponse.json(
          { success: false, error: 'Durasi perpanjangan harus 6, 12, atau 24 jam' },
          { status: 400 }
        )
      }

      const vehicle = await db.vehicle.findUnique({ where: { id: existing.vehicleId } })
      if (!vehicle) {
        return NextResponse.json(
          { success: false, error: 'Kendaraan tidak ditemukan' },
          { status: 404 }
        )
      }

      const v = vehicle as Record<string, number>
      const hargaSewa24 = Number(v.hargaSewa) || 0
      const hargaSewa12 = Number(v.hargaSewa12Jam) || Math.round(hargaSewa24 / 2)

      let biayaTambahan = 0
      if (hours === 24) {
        biayaTambahan = hargaSewa24
      } else if (hours === 12) {
        biayaTambahan = hargaSewa12
      } else {
        biayaTambahan = Math.round(hargaSewa12 / 2)
      }

      const currentEnd = new Date(existing.tanggalKembali)
      currentEnd.setHours(currentEnd.getHours() + hours)

      updateData.tanggalKembali = currentEnd.toISOString()
      updateData.totalHarga = Number(existing.totalHarga) + biayaTambahan
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
    })

    const r = rental as Record<string, string>
    const user = await db.user.findUnique({ where: { id: r.userId } })
    const vehicle = await db.vehicle.findUnique({ where: { id: r.vehicleId } })
    const { password, ...userWithoutPassword } = (user as Record<string, unknown>) || {}

    return NextResponse.json({
      success: true,
      data: { ...rental, user: userWithoutPassword, vehicle },
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
