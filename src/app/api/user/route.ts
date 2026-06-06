import { NextRequest, NextResponse } from 'next/server'
import { getSession } from 'next-auth/react'
import { db } from '@/lib/firestore'
import { compare, hash } from 'bcryptjs'

// GET /api/user - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }

    const { password, ...userWithoutPassword } = user as Record<string, unknown>

    return NextResponse.json({ success: true, data: userWithoutPassword })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil profil' },
      { status: 500 }
    )
  }
}

// PUT /api/user - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nama, noTelepon, alamat, noKTP, noSIM, fotoProfil, fotoKTP, fotoSIM, verified } = body

    const updateData: Record<string, unknown> = {}
    if (nama !== undefined) updateData.nama = nama
    if (noTelepon !== undefined) updateData.noTelepon = noTelepon
    if (alamat !== undefined) updateData.alamat = alamat
    if (noKTP !== undefined) updateData.noKTP = noKTP
    if (noSIM !== undefined) updateData.noSIM = noSIM
    if (fotoProfil !== undefined) updateData.fotoProfil = fotoProfil
    if (fotoKTP !== undefined) updateData.fotoKTP = fotoKTP
    if (fotoSIM !== undefined) updateData.fotoSIM = fotoSIM
    if (verified !== undefined && session.user.role === 'ADMIN') updateData.verified = verified

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data yang diperbarui' },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    const { password, ...user } = updatedUser as Record<string, unknown>

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Profil berhasil diperbarui',
    })
  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui profil' },
      { status: 500 }
    )
  }
}

// POST /api/user - Change password
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Password lama dan baru harus diisi' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password baru minimal 6 karakter' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }

    const isPasswordValid = await compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Password lama salah' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(newPassword, 12)
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengubah password' },
      { status: 500 }
    )
  }
}
