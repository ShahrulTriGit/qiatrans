'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Car, User, Calendar, Clock, CheckCircle2, XCircle, PlayCircle, Timer } from 'lucide-react'
import { useNavStore } from '@/stores/navStore'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { Rental, RentalStatus, Vehicle } from '@/types'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(time?: string | null) {
  if (!time) return ''
  const [h, m] = time.split(':')
  return `${h}.${m}`
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
}

function getStatusBadge(status: RentalStatus) {
  switch (status) {
    case 'PENDING':
      return <Badge className="bg-info/10 text-info border-info/20" variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
    case 'ACTIVE':
      return <Badge className="bg-success/10 text-success border-success/20" variant="outline"><PlayCircle className="w-3 h-3 mr-1" />Aktif</Badge>
    case 'COMPLETED':
      return <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline"><CheckCircle2 className="w-3 h-3 mr-1" />Selesai</Badge>
    case 'CANCELLED':
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20" variant="outline"><XCircle className="w-3 h-3 mr-1" />Dibatalkan</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function RentalDetailScreen() {
  const { setAdminPage, selectedRentalId } = useNavStore()
  const [rental, setRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [extending, setExtending] = useState(false)

  const fetchRental = useCallback(async () => {
    if (!selectedRentalId) return
    try {
      const res = await fetch(`/api/rentals/${selectedRentalId}`)
      const data = await res.json()
      if (data.success) setRental(data.data)
    } catch {
      toast.error('Gagal memuat detail rental')
    } finally {
      setLoading(false)
    }
  }, [selectedRentalId])

  useEffect(() => {
    fetchRental()
  }, [fetchRental])

  async function updateStatus(status: RentalStatus) {
    if (!selectedRentalId) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/rentals/${selectedRentalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Status berhasil diubah`)
      fetchRental()
    } catch {
      toast.error('Gagal mengubah status')
    } finally {
      setUpdating(false)
    }
  }

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
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!rental) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold">Rental tidak ditemukan</p>
        <Button variant="outline" className="mt-4" onClick={() => setAdminPage('rentals')}>Kembali</Button>
      </div>
    )
  }

  const user = rental.user as Record<string, unknown> | undefined
  const vehicle = rental.vehicle as Vehicle | undefined
  const canExtend = rental.status === 'ACTIVE' || rental.status === 'PENDING'

  const harga24 = vehicle?.hargaSewa ?? 0
  const harga12 = vehicle?.hargaSewa12Jam ?? Math.round(harga24 / 2)
  const harga6 = Math.round(harga12 / 2)

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setAdminPage('rentals')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Detail Rental</h1>
            {getStatusBadge(rental.status)}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">ID: {rental.id}</p>
        </div>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Informasi Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{user.nama as string}</p>
                <p className="text-sm text-muted-foreground">{user.email as string}</p>
                {(user.noTelp as string) && (
                  <p className="text-sm text-muted-foreground">{user.noTelp as string}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdminPage('customers')}
              >
                Lihat Customer
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Data customer tidak tersedia</p>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="w-4 h-4" />
            Informasi Kendaraan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicle ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {vehicle.foto ? (
                  <img src={vehicle.foto} alt={vehicle.namaMobil} className="w-full h-full object-cover" />
                ) : (
                  <Car className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold">{vehicle.namaMobil}</p>
                <p className="text-sm text-muted-foreground">
                  {vehicle.merk} &bull; {vehicle.platNomor}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Data kendaraan tidak tersedia</p>
          )}
        </CardContent>
      </Card>

      {/* Rental Period */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Periode Rental
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Sewa</p>
              <p className="font-semibold">{formatDate(rental.tanggalSewa)}</p>
              {rental.jamAmbil && <p className="text-sm text-muted-foreground">{formatTime(rental.jamAmbil)}</p>}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Kembali</p>
              <p className="font-semibold">{formatDate(rental.tanggalKembali)}</p>
              {rental.jamKembali && <p className="text-sm text-muted-foreground">{formatTime(rental.jamKembali)}</p>}
            </div>
          </div>
          {rental.tanggalPengembalian && (
            <>
              <Separator className="my-3" />
              <div>
                <p className="text-sm text-muted-foreground">Dikembalikan pada</p>
                <p className="font-semibold">{formatDateTime(rental.tanggalPengembalian)}</p>
              </div>
            </>
          )}
          <Separator className="my-3" />
          {rental.denda ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Harga Sewa</span>
                <span>{formatCurrency(rental.totalHarga - rental.denda)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-destructive font-medium">Denda Keterlambatan</span>
                <span className="text-destructive font-medium">{formatCurrency(rental.denda)}</span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <p className="text-xl font-bold text-primary">{formatCurrency(rental.totalHarga)}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Harga</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(rental.totalHarga)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {rental.catatan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{rental.catatan}</p>
          </CardContent>
        </Card>
      )}

      {/* Extend Rental */}
      {canExtend && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Perpanjang Waktu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Pilih durasi perpanjangan</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleExtend(6)}
                disabled={extending}
                className="p-3 rounded-xl border-2 border-border hover:border-primary/50 text-center transition-all active:scale-95 disabled:opacity-50"
              >
                <p className="text-xs text-muted-foreground">6 Jam</p>
                <p className="text-sm font-bold text-primary mt-0.5">{formatCurrency(harga6)}</p>
              </button>
              <button
                onClick={() => handleExtend(12)}
                disabled={extending}
                className="p-3 rounded-xl border-2 border-border hover:border-primary/50 text-center transition-all active:scale-95 disabled:opacity-50"
              >
                <p className="text-xs text-muted-foreground">12 Jam</p>
                <p className="text-sm font-bold text-primary mt-0.5">{formatCurrency(harga12)}</p>
              </button>
              <button
                onClick={() => handleExtend(24)}
                disabled={extending}
                className="p-3 rounded-xl border-2 border-border hover:border-primary/50 text-center transition-all active:scale-95 disabled:opacity-50"
              >
                <p className="text-xs text-muted-foreground">24 Jam</p>
                <p className="text-sm font-bold text-primary mt-0.5">{formatCurrency(harga24)}</p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {rental.status === 'PENDING' && (
          <>
            <Button
              className="flex-1 h-11"
              onClick={() => updateStatus('ACTIVE')}
              disabled={updating}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Verifikasi & Aktifkan
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-11 text-destructive"
              onClick={() => updateStatus('CANCELLED')}
              disabled={updating}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Tolak
            </Button>
          </>
        )}
        {rental.status === 'ACTIVE' && (
          <Button
            className="flex-1 h-11"
            onClick={() => updateStatus('COMPLETED')}
            disabled={updating}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Selesaikan Rental
          </Button>
        )}
      </div>
    </div>
  )
}
