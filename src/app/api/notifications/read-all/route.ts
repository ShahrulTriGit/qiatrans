import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID diperlukan' },
        { status: 400 }
      )
    }

    await db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Semua notifikasi telah ditandai sebagai dibaca',
    })
  } catch (error) {
    console.error('Mark all read error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menandai notifikasi' },
      { status: 500 }
    )
  }
}
