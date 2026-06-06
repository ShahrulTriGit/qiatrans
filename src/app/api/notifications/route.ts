import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: Record<string, unknown> = {}

    if (userId) where.userId = userId
    if (type) where.type = type
    if (unreadOnly) where.read = false

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil notifikasi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, message, type } = body

    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Data notifikasi tidak lengkap' },
        { status: 400 }
      )
    }

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'INFO',
        read: false,
      },
    })

    return NextResponse.json(
      { success: true, data: notification, message: 'Notifikasi berhasil dibuat' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat notifikasi' },
      { status: 500 }
    )
  }
}
