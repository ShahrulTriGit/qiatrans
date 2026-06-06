import { NextRequest, NextResponse } from 'next/server'
import { getSession } from 'next-auth/react'
import { db } from '@/lib/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vehicle = await db.vehicle.findUnique({
      where: { id },
    })

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Kendaraan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: vehicle })
  } catch (error) {
    console.error('Get vehicle error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data kendaraan' },
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
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya admin yang dapat mengubah kendaraan' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const existingVehicle = await db.vehicle.findUnique({
      where: { id },
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { success: false, error: 'Kendaraan tidak ditemukan' },
        { status: 404 }
      )
    }

    const vehicle = await db.vehicle.update({
      where: { id },
      data: {
        ...(body.namaMobil !== undefined && { namaMobil: body.namaMobil }),
        ...(body.merk !== undefined && { merk: body.merk }),
        ...(body.model !== undefined && { model: body.model }),
        ...(body.tahun !== undefined && { tahun: Number(body.tahun) }),
        ...(body.warna !== undefined && { warna: body.warna }),
        ...(body.platNomor !== undefined && { platNomor: body.platNomor }),
        ...(body.hargaSewa !== undefined && { hargaSewa: Number(body.hargaSewa) }),
        ...(body.kategori !== undefined && { kategori: body.kategori }),
        ...(body.transmisi !== undefined && { transmisi: body.transmisi }),
        ...(body.bahanBakar !== undefined && { bahanBakar: body.bahanBakar }),
        ...(body.kapasitas !== undefined && { kapasitas: Number(body.kapasitas) }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.foto !== undefined && { foto: body.foto }),
        ...(body.deskripsi !== undefined && { deskripsi: body.deskripsi }),
      },
    })

    return NextResponse.json({
      success: true,
      data: vehicle,
      message: 'Kendaraan berhasil diperbarui',
    })
  } catch (error) {
    console.error('Update vehicle error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui kendaraan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya admin yang dapat menghapus kendaraan' },
        { status: 403 }
      )
    }

    const { id } = await params

    const existingVehicle = await db.vehicle.findUnique({
      where: { id },
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { success: false, error: 'Kendaraan tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.vehicle.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Kendaraan berhasil dihapus',
    })
  } catch (error) {
    console.error('Delete vehicle error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus kendaraan' },
      { status: 500 }
    )
  }
}
