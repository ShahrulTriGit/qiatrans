'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Car, Star, BarChart3 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavStore } from '@/stores/navStore'
import type { Rental } from '@/types'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function RentalHistoryScreen() {
  const { goBack, setCustomerPage, customerPage } = useNavStore()
  const { data: session } = useSession()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [susEvaluated, setSusEvaluated] = useState<Set<string>>(new Set())
  const [ueqEvaluated, setUeqEvaluated] = useState<Set<string>>(new Set())


  const fetchRentals = useCallback(async () => {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const [rentalRes, susRes, ueqRes] = await Promise.all([
        fetch(`/api/rentals?userId=${session.user.id}&status=COMPLETED`),
        fetch(`/api/sus?userId=${session.user.id}`),
        fetch(`/api/ueq?userId=${session.user.id}`),
      ])

      if (rentalRes.ok) {
        const data = await rentalRes.json()
        if (data.success) setRentals(data.data || [])
      }

      const susIds = new Set<string>()
      const ueqIds = new Set<string>()

      if (susRes.ok) {
        const susData = await susRes.json()
        if (susData.success && Array.isArray(susData.data)) {
          susData.data.forEach((r: { rentalId?: string }) => {
            if (r.rentalId) susIds.add(r.rentalId)
          })
        }
      }

      if (ueqRes.ok) {
        const ueqData = await ueqRes.json()
        if (ueqData.success && Array.isArray(ueqData.data)) {
          ueqData.data.forEach((r: { rentalId?: string }) => {
            if (r.rentalId) ueqIds.add(r.rentalId)
          })
        }
      }

      setSusEvaluated(susIds)
      setUeqEvaluated(ueqIds)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (session?.user?.id) fetchRentals()
  }, [session?.user?.id, fetchRentals, customerPage])

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Riwayat Rental</h1>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md rounded-2xl animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-14 h-14 bg-muted rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : rentals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Car className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Belum ada riwayat rental
            </p>
          </div>
        ) : (
          rentals.map((rental) => {
            const statusLabel =
              rental.status === 'COMPLETED'
                ? 'Selesai'
                : rental.status === 'CANCELLED'
                  ? 'Dibatalkan'
                  : rental.status

            const statusClass =
              rental.status === 'COMPLETED'
                ? 'bg-primary/10 text-primary'
                : rental.status === 'CANCELLED'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-info/10 text-info'

            const needsSus = rental.status === 'COMPLETED' && !susEvaluated.has(rental.id)
            const needsUeq = rental.status === 'COMPLETED' && !ueqEvaluated.has(rental.id)

            return (
              <Card
                key={rental.id}
                className="border-0 shadow-md rounded-2xl"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-qia-light to-muted rounded-xl flex items-center justify-center shrink-0">
                      <Car className="w-7 h-7 text-primary/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm truncate">
                          {rental.vehicle?.namaMobil || 'Mobil'}
                        </p>
                        <Badge className={`${statusClass} text-[10px] shrink-0`}>
                          {statusLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rental.vehicle?.merk} &bull;{' '}
                        {rental.vehicle?.tahun}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(rental.tanggalSewa)} {rental.jamAmbil} -{' '}
                        {formatDate(rental.tanggalKembali)} {rental.jamKembali}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {formatPrice(rental.totalHarga)}
                      </p>
                    </div>
                  </div>

                  {/* Evaluation Status */}
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${!susEvaluated.has(rental.id) ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'}`}
                      >
                        SUS {susEvaluated.has(rental.id) ? '✓' : '—'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${!ueqEvaluated.has(rental.id) ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'}`}
                      >
                        UEQ {ueqEvaluated.has(rental.id) ? '✓' : '—'}
                      </Badge>
                    </div>
                    {(needsSus || needsUeq) && (
                      <div className="flex gap-2">
                        {needsSus && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-xl text-xs"
                            onClick={() =>
                              setCustomerPage('sus-feedback', {
                                rentalId: rental.id,
                              })
                            }
                          >
                            <Star className="w-3.5 h-3.5 mr-1.5" />
                            Evaluasi SUS
                          </Button>
                        )}
                        {needsUeq && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-xl text-xs"
                            onClick={() =>
                              setCustomerPage('ueq-feedback', {
                                rentalId: rental.id,
                              })
                            }
                          >
                            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                            Evaluasi UEQ
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
