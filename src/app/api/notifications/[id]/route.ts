import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const notification = await db.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notifikasi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    console.error('Get notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil notifikasi' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingNotification = await db.notification.findUnique({
      where: { id },
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, error: 'Notifikasi tidak ditemukan' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (body.read !== undefined) updateData.read = body.read
    if (body.title !== undefined) updateData.title = body.title
    if (body.message !== undefined) updateData.message = body.message
    if (body.type !== undefined) updateData.type = body.type

    const notification = await db.notification.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notifikasi berhasil diperbarui',
    })
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui notifikasi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingNotification = await db.notification.findUnique({
      where: { id },
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, error: 'Notifikasi tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.notification.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Notifikasi berhasil dihapus',
    })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus notifikasi' },
      { status: 500 }
    )
  }
}
