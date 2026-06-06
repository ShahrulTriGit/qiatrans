import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const rentalId = searchParams.get('rentalId')

    const where: Record<string, unknown> = {}

    if (userId) where.userId = userId
    if (rentalId) where.rentalId = rentalId

    const susResults = await db.sUSResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const susWithRelations = await Promise.all(
      (susResults || []).map(async (sus) => {
        const s = sus as Record<string, string>
        const user = await db.user.findUnique({ where: { id: s.userId } })
        const rental = await db.rental.findUnique({ where: { id: s.rentalId } })
        let vehicle = null
        if (rental) {
          vehicle = await db.vehicle.findUnique({ where: { id: (rental as Record<string, string>).vehicleId } })
        }
        const { password, ...userWithoutPassword } = (user as Record<string, unknown>) || {}
        return { ...sus, user: userWithoutPassword, rental: rental ? { ...rental, vehicle } : null }
      })
    )

    return NextResponse.json({ success: true, data: susWithRelations })
  } catch (error) {
    console.error('Get SUS results error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data SUS' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      rentalId,
      q1, q2, q3, q4, q5, q6, q7, q8, q9, q10,
    } = body

    if (!userId || !rentalId || q1 === undefined || q2 === undefined || q3 === undefined ||
        q4 === undefined || q5 === undefined || q6 === undefined || q7 === undefined ||
        q8 === undefined || q9 === undefined || q10 === undefined) {
      return NextResponse.json(
        { success: false, error: 'Data SUS tidak lengkap' },
        { status: 400 }
      )
    }

    // Calculate SUS score
    // Odd items (q1, q3, q5, q7, q9) contribute positively: score = value - 1
    // Even items (q2, q4, q6, q8, q10) contribute negatively: score = 5 - value
    const oddSum = Number(q1) - 1 + Number(q3) - 1 + Number(q5) - 1 + Number(q7) - 1 + Number(q9) - 1
    const evenSum = 5 - Number(q2) + 5 - Number(q4) + 5 - Number(q6) + 5 - Number(q8) + 5 - Number(q10)
    const skor = ((oddSum + evenSum) * 2.5)

    const susResult = await db.sUSResult.create({
      data: {
        userId,
        rentalId,
        q1: Number(q1),
        q2: Number(q2),
        q3: Number(q3),
        q4: Number(q4),
        q5: Number(q5),
        q6: Number(q6),
        q7: Number(q7),
        q8: Number(q8),
        q9: Number(q9),
        q10: Number(q10),
        skor,
      },
    })

    return NextResponse.json(
      { success: true, data: susResult, message: 'Hasil SUS berhasil disimpan' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create SUS result error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan hasil SUS' },
      { status: 500 }
    )
  }
}
