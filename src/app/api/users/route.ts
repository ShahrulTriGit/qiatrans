import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya admin/owner/super admin yang dapat melihat daftar pengguna' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { email: { contains: search } },
        { noTelepon: { contains: search } },
      ]
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const usersWithoutPassword = (users || []).map((u) => {
      const { password, ...rest } = u as Record<string, unknown>
      return rest
    })

    return NextResponse.json({ success: true, data: usersWithoutPassword })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pengguna' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, nama, noTelepon, alamat, noKTP, noSIM, fotoProfil, fotoKTP, fotoSIM, verified, role } = body

    // Users can only update their own profile unless admin
    const targetUserId = id || session.user.id
    if (targetUserId !== session.user.id && session.user.role !== 'ADMIN' && session.user.role !== 'OWNER' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses untuk mengubah profil ini' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (nama !== undefined) updateData.nama = nama
    if (noTelepon !== undefined) updateData.noTelepon = noTelepon
    if (alamat !== undefined) updateData.alamat = alamat
    if (noKTP !== undefined) updateData.noKTP = noKTP
    if (noSIM !== undefined) updateData.noSIM = noSIM
    if (fotoProfil !== undefined) updateData.fotoProfil = fotoProfil
    if (fotoKTP !== undefined) updateData.fotoKTP = fotoKTP
    if (fotoSIM !== undefined) updateData.fotoSIM = fotoSIM
    if (verified !== undefined && (session.user.role === 'ADMIN' || session.user.role === 'OWNER' || session.user.role === 'SUPER_ADMIN')) updateData.verified = verified
    if (role !== undefined && session.user.role === 'SUPER_ADMIN') {
      const validRoles = ['CUSTOMER', 'ADMIN', 'OWNER', 'SUPER_ADMIN']
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Role tidak valid. Role yang diizinkan: CUSTOMER, ADMIN, OWNER, SUPER_ADMIN' },
          { status: 400 }
        )
      }
      updateData.role = role
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data yang diperbarui' },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: updateData,
    })

    const { password, ...user } = (updatedUser as Record<string, unknown>) || {}

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Profil berhasil diperbarui',
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui profil' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya Super Admin yang dapat menghapus akun' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pengguna harus diisi' },
        { status: 400 }
      )
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak dapat menghapus akun sendiri' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.rental.deleteMany({ where: { userId: id } })
    await db.notification.deleteMany({ where: { userId: id } })
    await db.sUSResult.deleteMany({ where: { userId: id } })
    await db.uEQResult.deleteMany({ where: { userId: id } })
    await db.user.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: `Akun ${user.nama} berhasil dihapus`,
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus akun' },
      { status: 500 }
    )
  }
}
