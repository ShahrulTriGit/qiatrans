'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Car, CalendarDays, Clock, StickyNote, AlertTriangle, Timer } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useNavStore } from '@/stores/navStore'
import type { Vehicle } from '@/types'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0')
  return Array.from({ length: 4 }, (_, j) => {
    const m = String(j * 15).padStart(2, '0')
    return `${h}.${m}`
  })
}).flat()

export default function BookingScreen() {
  const { goBack, setCustomerPage, selectedVehicleId } = useNavStore()
  const { data: session, update } = useSession()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tanggalSewa, setTanggalSewa] = useState<Date>()
  const [tanggalKembali, setTanggalKembali] = useState<Date>()
  const [jamAmbil, setJamAmbil] = useState('08.00')
  const [jamKembali, setJamKembali] = useState('08.00')
  const [catatan, setCatatan] = useState('')
  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)
  const [missingDocs, setMissingDocs] = useState(false)

  const checkDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/user')
      if (res.ok) {
        const json = await res.json()
        const data = json.data
        if (data) {
          const hasKtp = !!data.fotoKTP
          const hasSim = !!data.fotoSIM
          setMissingDocs(!hasKtp || !hasSim)
        }
      }
    } catch {
      // silently fail
    }
  }, [])

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
    if (selectedVehicleId) {
      checkDocuments()
      fetchVehicle()
    }
  }, [selectedVehicleId, fetchVehicle, checkDocuments])

  const durationInfo = useMemo(() => {
    if (!tanggalSewa || !tanggalKembali) return { days: 0, durasiType: '24jam' as const }

    const [startH, startM] = jamAmbil.split('.').map(Number)
    const [endH, endM] = jamKembali.split('.').map(Number)

    const start = new Date(tanggalSewa)
    start.setHours(startH, startM, 0, 0)
    const end = new Date(tanggalKembali)
    end.setHours(endH, endM, 0, 0)

    const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    if (totalHours <= 0) return { days: 0, durasiType: '24jam' as const }

    if (totalHours <= 12) return { days: 1, durasiType: '12jam' as const }
    if (totalHours <= 24) return { days: 1, durasiType: '24jam' as const }
    return { days: Math.ceil(totalHours / 24), durasiType: '24jam' as const }
  }, [tanggalSewa, tanggalKembali, jamAmbil, jamKembali])

  const days = durationInfo.days
  const durasiType = durationInfo.durasiType

  const pricePerUnit = useMemo(() => {
    if (!vehicle) return 0
    const harga12 = vehicle.hargaSewa12Jam ?? Math.round(vehicle.hargaSewa / 2)
    return durasiType === '12jam' ? harga12 : vehicle.hargaSewa
  }, [vehicle, durasiType])

  const totalPrice = useMemo(() => {
    if (!vehicle || days === 0) return 0
    return days * pricePerUnit
  }, [vehicle, days, pricePerUnit])

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
    if (missingDocs) {
      toast.error('Lengkapi dokumen terlebih dahulu', {
        description: 'Upload KTP dan SIM di halaman Profil sebelum melakukan booking.',
      })
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
          jamAmbil: jamAmbil.replace('.', ':'),
          jamKembali: jamKembali.replace('.', ':'),
          catatan: catatan || null,
          totalHarga: totalPrice,
          durasiType,
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
        {/* Document Warning */}
        {missingDocs && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-800">Dokumen Belum Lengkap</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Anda harus upload KTP dan SIM di halaman Profil sebelum bisa melakukan booking.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-8 px-3 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                onClick={() => setCustomerPage('profile')}
              >
                Ke Halaman Profil
              </Button>
            </div>
          </div>
        )}

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
                    /24 jam
                  </span>
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    ({formatPrice(vehicle.hargaSewa12Jam ?? Math.round(vehicle.hargaSewa / 2))}/12 jam)
                  </span>
                </p>
              </div>
              <Badge variant="secondary">{vehicle.kategori}</Badge>
            </CardContent>
          </Card>
        )}

        {/* Duration Info (auto-detected) */}
        {days > 0 && (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Timer className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Durasi Otomatis</p>
                <p className="text-xs text-muted-foreground">
                  {days} {days === 1 ? 'hari' : 'hari'} &middot; {durasiType === '12jam' ? 'Setengah Hari (12 jam)' : 'Penuh (24 jam)'}
                </p>
              </div>
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
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={jamAmbil} onValueChange={setJamAmbil}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={jamKembali} onValueChange={setJamKembali}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  {formatPrice(pricePerUnit)} x {days} {durasiType === '12jam' ? '12 jam' : '24 jam'}
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

      {/* Confirm Button */}
      <div className="px-5 pb-4">
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
