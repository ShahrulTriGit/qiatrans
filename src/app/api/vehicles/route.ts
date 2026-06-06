import { NextRequest, NextResponse } from 'next/server'
import { getSession } from 'next-auth/react'
import { db } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kategori = searchParams.get('kategori')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const merk = searchParams.get('merk')

    const where: Record<string, unknown> = {}

    if (kategori) where.kategori = kategori
    if (status) where.status = status
    if (merk) where.merk = merk
    if (search) {
      where.OR = [
        { namaMobil: { contains: search } },
        { merk: { contains: search } },
        { model: { contains: search } },
      ]
    }

    const vehicles = await db.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: vehicles })
  } catch (error) {
    console.error('Get vehicles error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data kendaraan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya admin yang dapat menambah kendaraan' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      namaMobil,
      merk,
      model,
      tahun,
      warna,
      platNomor,
      hargaSewa,
      kategori,
      transmisi,
      bahanBakar,
      kapasitas,
      foto,
      deskripsi,
    } = body

    if (!namaMobil || !merk || !model || !tahun || !platNomor || !hargaSewa || !kategori) {
      return NextResponse.json(
        { success: false, error: 'Data kendaraan tidak lengkap' },
        { status: 400 }
      )
    }

    const vehicle = await db.vehicle.create({
      data: {
        namaMobil,
        merk,
        model,
        tahun: Number(tahun),
        warna: warna || '',
        platNomor,
        hargaSewa: Number(hargaSewa),
        kategori,
        transmisi: transmisi || 'Manual',
        bahanBakar: bahanBakar || 'Bensin',
        kapasitas: Number(kapasitas) || 5,
        foto: foto || '',
        deskripsi: deskripsi || '',
      },
    })

    return NextResponse.json(
      { success: true, data: vehicle, message: 'Kendaraan berhasil ditambahkan' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create vehicle error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menambah kendaraan' },
      { status: 500 }
    )
  }
}
