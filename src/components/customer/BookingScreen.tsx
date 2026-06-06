'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Car, CalendarDays, StickyNote } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useNavStore } from '@/stores/navStore'
import type { Vehicle } from '@/types'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

export default function BookingScreen() {
  const { goBack, setCustomerPage, selectedVehicleId } = useNavStore()
  const { data: session } = useSession()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tanggalSewa, setTanggalSewa] = useState<Date>()
  const [tanggalKembali, setTanggalKembali] = useState<Date>()
  const [catatan, setCatatan] = useState('')
  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)

  const fetchVehicle = useCallback(async () => {
    try {
      const res = await fetch(`/api/vehicles/${selectedVehicleId}`)
      const data = await res.json()
      if (data.success) {
        setVehicle(data.data)
        if (data.data?.status && data.data.status !== 'TERSEDIA') {
          toast.warning('Kendaraan sedang tidak tersedia', {
            description: `Status: ${data.data.status}`,
          })
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [selectedVehicleId])

  useEffect(() => {
    if (selectedVehicleId) fetchVehicle()
  }, [selectedVehicleId, fetchVehicle])

  const days = useMemo(() => {
    if (!tanggalSewa || !tanggalKembali) return 0
    const diff = tanggalKembali.getTime() - tanggalSewa.getTime()
    const d = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return d > 0 ? d : 0
  }, [tanggalSewa, tanggalKembali])

  const totalPrice = useMemo(() => {
    if (!vehicle || days === 0) return 0
    return days * vehicle.hargaSewa
  }, [vehicle, days])

  const handleSubmit = async () => {
    if (!selectedVehicleId) {
      toast.error('Kendaraan tidak valid, silakan pilih ulang')
      return
    }
    if (!tanggalSewa || !tanggalKembali) {
      toast.error('Pilih tanggal sewa dan tanggal kembali')
      return
    }
    if (days === 0) {
      toast.error('Tanggal kembali harus setelah tanggal sewa')
      return
    }
    if (!session?.user?.id) {
      toast.error('Sesi tidak valid, silakan login ulang')
      return
    }
    if (vehicle && vehicle.status !== 'TERSEDIA') {
      toast.error('Kendaraan tidak tersedia untuk disewa', {
        description: `Status kendaraan: ${vehicle.status}`,
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          vehicleId: selectedVehicleId,
          tanggalSewa: tanggalSewa.toISOString(),
          tanggalKembali: tanggalKembali.toISOString(),
          catatan: catatan || null,
          totalHarga: totalPrice,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error('Booking gagal', { description: data.error })
        return
      }

      toast.success('Booking berhasil!', {
        description: 'Anda akan diarahkan ke daftar rental',
      })
      setCustomerPage('my-rentals')
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-5 pt-6">
        <div className="h-24 bg-muted rounded-2xl animate-pulse mb-4" />
        <div className="h-60 bg-muted rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Booking</h1>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4">
        {/* Vehicle Info */}
        {vehicle && (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-qia-light to-muted rounded-xl flex items-center justify-center shrink-0">
                <Car className="w-8 h-8 text-primary/30" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{vehicle.namaMobil}</p>
                <p className="text-xs text-muted-foreground">
                  {vehicle.merk} &bull; {vehicle.tahun}
                </p>
                <p className="text-sm font-bold text-primary mt-1">
                  {formatPrice(vehicle.hargaSewa)}
                  <span className="text-xs font-normal text-muted-foreground">
                    /hari
                  </span>
                </p>
              </div>
              <Badge variant="secondary">{vehicle.kategori}</Badge>
            </CardContent>
          </Card>
        )}

        {/* Date Pickers */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-5 space-y-5">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Pilih Tanggal
            </h3>

            {/* Tanggal Sewa */}
            <div className="space-y-2">
              <Label className="text-sm">Tanggal Sewa</Label>
              <Popover open={openStart} onOpenChange={setOpenStart}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-start text-left font-normal rounded-xl"
                  >
                    {tanggalSewa ? (
                      format(tanggalSewa, 'dd MMMM yyyy', { locale: idLocale })
                    ) : (
                      <span className="text-muted-foreground">Pilih tanggal sewa</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tanggalSewa}
                    onSelect={(date) => {
                      setTanggalSewa(date)
                      setOpenStart(false)
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Tanggal Kembali */}
            <div className="space-y-2">
              <Label className="text-sm">Tanggal Kembali</Label>
              <Popover open={openEnd} onOpenChange={setOpenEnd}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-start text-left font-normal rounded-xl"
                  >
                    {tanggalKembali ? (
                      format(tanggalKembali, 'dd MMMM yyyy', { locale: idLocale })
                    ) : (
                      <span className="text-muted-foreground">Pilih tanggal kembali</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tanggalKembali}
                    onSelect={(date) => {
                      setTanggalKembali(date)
                      setOpenEnd(false)
                    }}
                    disabled={(date) =>
                      date < (tanggalSewa || new Date(new Date().setHours(0, 0, 0, 0)))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-primary" />
              Catatan
            </h3>
            <Textarea
              placeholder="Tambahkan catatan (opsional)"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="rounded-xl min-h-[80px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Price Summary */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold">Ringkasan Harga</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatPrice(vehicle?.hargaSewa || 0)} x {days} hari
                </span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/95 backdrop-blur-sm border-t z-20">
        <Button
          onClick={handleSubmit}
          disabled={submitting || days === 0 || !selectedVehicleId || (vehicle !== null && vehicle.status !== 'TERSEDIA')}
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          {submitting ? 'Memproses...' : 'Konfirmasi Booking'}
        </Button>
      </div>
    </div>
  )
}
