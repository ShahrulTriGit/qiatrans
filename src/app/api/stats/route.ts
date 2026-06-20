import { NextResponse } from 'next/server'
import { db } from '@/lib/firestore'

export async function GET() {
  try {
    const [
      totalVehicles,
      activeRentals,
      completedRentals,
      cancelledRentals,
      pendingBookings,
      totalCustomers,
      availableVehicles,
      revenueRentals,
    ] = await Promise.all([
      db.vehicle.count(),
      db.rental.count({ where: { status: 'ACTIVE' } }),
      db.rental.count({ where: { status: 'COMPLETED' } }),
      db.rental.count({ where: { status: 'CANCELLED' } }),
      db.rental.count({ where: { status: 'PENDING' } }),
      db.user.count({ where: { role: 'CUSTOMER' } }),
      db.vehicle.count({ where: { status: 'TERSEDIA' } }),
      db.rental.findMany({
        where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
      }),
    ])

    const totalRevenue = (revenueRentals || []).reduce(
      (sum: number, r) => sum + (Number((r as Record<string, unknown>).totalHarga) || 0),
      0
    )

    const stats = {
      totalVehicles,
      activeRentals,
      totalRevenue,
      totalCustomers,
      pendingBookings,
      completedRentals,
      cancelledRentals,
      availableVehicles,
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil statistik' },
      { status: 500 }
    )
  }
}
