import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, email, password, role, noTelepon } = body

    if (!nama || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nama, email, dan password harus diisi' },
        { status: 400 }
      )
    }

    // Validate noTelepon if provided
    if (noTelepon !== undefined && noTelepon !== null && typeof noTelepon !== 'string') {
      return NextResponse.json(
        { success: false, error: 'noTelepon harus berupa string' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findFirst({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: role || 'CUSTOMER',
        verified: false,
        noTelepon: noTelepon || '',
        alamat: '',
        fotoProfil: null,
        noKTP: null,
        noSIM: null,
        fotoKTP: null,
        fotoSIM: null,
      },
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { success: true, data: userWithoutPassword, message: 'Registrasi berhasil' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}
