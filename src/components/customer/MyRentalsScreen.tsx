'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Car, Star, CheckCircle2, BarChart3 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNavStore } from '@/stores/navStore'
import type { Rental, RentalStatus } from '@/types'

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

const statusConfig: Record<RentalStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-info/10 text-info' },
  ACTIVE: { label: 'Aktif', className: 'bg-success/10 text-success' },
  COMPLETED: { label: 'Selesai', className: 'bg-primary/10 text-primary' },
  CANCELLED: { label: 'Dibatalkan', className: 'bg-muted text-muted-foreground' },
}

const EmptyStateComponent = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
      <Car className="w-7 h-7 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
)

export default function MyRentalsScreen() {
  const { goBack, setCustomerPage, selectedRentalId, customerPage } = useNavStore()
  const { data: session } = useSession()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [evaluatedSus, setEvaluatedSus] = useState<Set<string>>(new Set())
  const [evaluatedUeq, setEvaluatedUeq] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const [rentalRes, susRes, ueqRes] = await Promise.all([
        fetch(`/api/rentals?userId=${session.user.id}`),
        fetch(`/api/sus?userId=${session.user.id}`),
        fetch(`/api/ueq?userId=${session.user.id}`),
      ])

      if (rentalRes.ok) {
        const data = await rentalRes.json()
        if (data.success) setRentals(data.data || [])
      }

      if (susRes.ok) {
        const susData = await susRes.json()
        if (susData.data) {
          setEvaluatedSus(new Set(susData.data.map((s: Record<string, string>) => s.rentalId)))
        }
      }

      if (ueqRes.ok) {
        const ueqData = await ueqRes.json()
        if (ueqData.data) {
          setEvaluatedUeq(new Set(ueqData.data.map((u: Record<string, string>) => u.rentalId)))
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData, customerPage])

  const activeRentals = useMemo(
    () => rentals.filter((r) => r.status === 'ACTIVE'),
    [rentals]
  )
  const pendingRentals = useMemo(
    () => rentals.filter((r) => r.status === 'PENDING'),
    [rentals]
  )

  const RentalCard = ({ rental }: { rental: Rental }) => {
    const status = statusConfig[rental.status] || statusConfig.PENDING
    return (
      <Card
        className="border-0 shadow-md rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => {
          setCustomerPage('rental-detail', { rentalId: rental.id })
        }}
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
                <Badge className={`${status.className} text-[10px] shrink-0`}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(rental.tanggalSewa)} {rental.jamAmbil} - {formatDate(rental.tanggalKembali)} {rental.jamKembali}
              </p>
              <p className="text-sm font-bold text-primary mt-1.5">
                {formatPrice(rental.totalHarga)}
              </p>
            </div>
          </div>


          {rental.status === 'COMPLETED' && (
            <div className="mt-3 pt-3 border-t space-y-2">
              {!evaluatedSus.has(rental.id) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCustomerPage('sus-feedback', { rentalId: rental.id })
                  }}
                >
                  <Star className="w-3.5 h-3.5 mr-1.5" />
                  Isi Evaluasi SUS
                </Button>
              )}
              {!evaluatedUeq.has(rental.id) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCustomerPage('ueq-feedback', { rentalId: rental.id })
                  }}
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                  Isi Evaluasi UEQ
                </Button>
              )}
              {evaluatedSus.has(rental.id) && evaluatedUeq.has(rental.id) && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-success">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Evaluasi selesai
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Rental Saya</h1>
        </div>
      </div>

      <div className="px-5 pt-4">
        <Tabs defaultValue="active">
          <TabsList className="w-full rounded-xl">
            <TabsTrigger value="active" className="rounded-lg text-xs">
              Aktif ({activeRentals.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg text-xs">
              Pending ({pendingRentals.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-lg text-xs">
              Semua ({rentals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-3">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
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
            ) : activeRentals.length === 0 ? (
              <EmptyStateComponent message="Belum ada rental aktif" />
            ) : (
              activeRentals.map((r) => <RentalCard key={r.id} rental={r} />)
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {pendingRentals.length === 0 ? (
              <EmptyStateComponent message="Tidak ada rental pending" />
            ) : (
              pendingRentals.map((r) => <RentalCard key={r.id} rental={r} />)
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-4 space-y-3">
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
              <EmptyStateComponent message="Belum ada rental" />
            ) : (
              rentals.map((r) => <RentalCard key={r.id} rental={r} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
