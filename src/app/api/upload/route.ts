import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File harus diupload' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${uuidv4()}.${ext}`

    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      success: true,
      data: { url: blob.url, filename },
      message: 'File berhasil diupload',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengupload file' },
      { status: 500 }
    )
  }
}
