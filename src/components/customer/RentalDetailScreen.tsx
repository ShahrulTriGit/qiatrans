'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Car, CalendarDays, Clock, StickyNote, Plus, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavStore } from '@/stores/navStore'
import { toast } from 'sonner'
import type { Rental, Vehicle } from '@/types'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const formatTime = (time?: string | null) => {
  if (!time) return ''
  const [h, m] = time.split(':')
  return `${h}.${m}`
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Badge className="bg-info/10 text-info">Pending</Badge>
    case 'ACTIVE':
      return <Badge className="bg-success/10 text-success">Aktif</Badge>
    case 'COMPLETED':
      return <Badge className="bg-primary/10 text-primary">Selesai</Badge>
    case 'CANCELLED':
      return <Badge variant="secondary">Dibatalkan</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function RentalDetailScreen() {
  const { goBack, selectedRentalId } = useNavStore()
  const [rental, setRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)
  const [extending, setExtending] = useState(false)

  const fetchRental = useCallback(async () => {
    if (!selectedRentalId) return
    try {
      const res = await fetch(`/api/rentals/${selectedRentalId}`)
      const data = await res.json()
      if (data.success) setRental(data.data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [selectedRentalId])

  useEffect(() => {
    fetchRental()
  }, [fetchRental])

  async function handleExtend(hours: number) {
    if (!selectedRentalId) return
    setExtending(true)
    try {
      const res = await fetch(`/api/rentals/${selectedRentalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendHours: hours }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error('Gagal memperpanjang', { description: data.error })
        return
      }
      toast.success(`Berhasil diperpanjang ${hours} jam`)
      setRental(data.data)
    } catch {
      toast.error('Gagal memperpanjang rental')
    } finally {
      setExtending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-5 pt-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  if (!rental) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
        <p className="text-lg font-semibold">Rental tidak ditemukan</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={goBack}>Kembali</Button>
      </div>
    )
  }

  const vehicle = rental.vehicle as Vehicle | undefined
  const canExtend = rental.status === 'ACTIVE' || rental.status === 'PENDING'

  const harga24 = vehicle?.hargaSewa ?? 0
  const harga12 = vehicle?.hargaSewa12Jam ?? Math.round(harga24 / 2)
  const harga6 = Math.round(harga12 / 2)

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
          <h1 className="text-lg font-bold">Detail Rental</h1>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Status</p>
          {statusBadge(rental.status)}
        </div>

        {/* Vehicle Info */}
        {vehicle && (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-qia-light to-muted rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {vehicle.foto ? (
                  <img src={vehicle.foto} alt={vehicle.namaMobil} className="w-full h-full object-cover" />
                ) : (
                  <Car className="w-8 h-8 text-primary/30" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{vehicle.namaMobil}</p>
                <p className="text-xs text-muted-foreground">
                  {vehicle.merk} &bull; {vehicle.platNomor}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rental Period */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Periode Sewa
            </h3>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-qia-light/20 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Ambil</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(rental.tanggalSewa)} {formatTime(rental.jamAmbil)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-qia-light/20 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Kembali</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(rental.tanggalKembali)} {formatTime(rental.jamKembali)}
                </p>
              </div>
            </div>

            <Separator />

            {rental.denda ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Harga Sewa</span>
                  <span>{formatPrice(rental.totalHarga - rental.denda)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-destructive font-medium">Denda Keterlambatan</span>
                  <span className="text-destructive font-medium">{formatPrice(rental.denda)}</span>
                </div>
                <div className="border-t pt-2 flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(rental.totalHarga)}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Harga</p>
                <p className="text-lg font-bold text-primary">{formatPrice(rental.totalHarga)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extend Rental */}
        {canExtend && (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                Perpanjang Waktu
              </h3>
              <p className="text-xs text-muted-foreground">Pilih durasi perpanjangan yang diinginkan</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleExtend(6)}
                  disabled={extending}
                  className="p-3 rounded-xl border-2 border-border hover:border-primary/50 text-center transition-all active:scale-95 disabled:opacity-50"
                >
                  <p className="text-xs text-muted-foreground">6 Jam</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(harga6)}</p>
                </button>
                <button
                  onClick={() => handleExtend(12)}
                  disabled={extending}
                  className="p-3 rounded-xl border-2 border-border hover:border-primary/50 text-center transition-all active:scale-95 disabled:opacity-50"
                >
                  <p className="text-xs text-muted-foreground">12 Jam</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(harga12)}</p>
                </button>
                <button
                  onClick={() => handleExtend(24)}
                  disabled={extending}
                  className="p-3 rounded-xl border-2 border-border hover:border-primary/50 text-center transition-all active:scale-95 disabled:opacity-50"
                >
                  <p className="text-xs text-muted-foreground">24 Jam</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(harga24)}</p>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {rental.catatan && (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-primary" />
                Catatan
              </h3>
              <p className="text-sm text-muted-foreground">{rental.catatan}</p>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl"
          onClick={goBack}
        >
          Kembali
        </Button>
      </div>
    </div>
  )
}
