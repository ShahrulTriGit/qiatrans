'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  Car,
  Fuel,
  Palette,
  Users,
  Gauge,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavStore } from '@/stores/navStore'
import type { Vehicle } from '@/types'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const statusMap: Record<string, { label: string; className: string }> = {
  TERSEDIA: { label: 'Tersedia', className: 'bg-success/10 text-success' },
  DISEWA: { label: 'Disewa', className: 'bg-warning/10 text-warning' },
  MAINTENANCE: { label: 'Maintenance', className: 'bg-destructive/10 text-destructive' },
}

export default function VehicleDetailScreen() {
  const { goBack, setCustomerPage, selectedVehicleId } = useNavStore()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchVehicle = useCallback(async () => {
    try {
      const res = await fetch(`/api/vehicles/${selectedVehicleId}`)
      const data = await res.json()
      if (data.success) {
        setVehicle(data.data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [selectedVehicleId])

  useEffect(() => {
    if (selectedVehicleId) {
      fetchVehicle()
    }
  }, [selectedVehicleId, fetchVehicle])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <div className="h-72 bg-muted animate-pulse" />
        <div className="px-5 -mt-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <p className="text-lg font-semibold">Kendaraan tidak ditemukan</p>
        <Button onClick={goBack} className="mt-4 rounded-xl">
          Kembali
        </Button>
      </div>
    )
  }

  const status = statusMap[vehicle.status] || statusMap.TERSEDIA
  const isAvailable = vehicle.status === 'TERSEDIA'

  const specs = [
    { icon: Gauge, label: 'Transmisi', value: vehicle.transmisi },
    { icon: Fuel, label: 'Bahan Bakar', value: vehicle.bahanBakar },
    { icon: Users, label: 'Kapasitas', value: `${vehicle.kapasitas} orang` },
    { icon: Palette, label: 'Warna', value: vehicle.warna },
    { icon: CreditCard, label: 'Plat Nomor', value: vehicle.platNomor },
  ]

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Vehicle Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-qia-dark to-primary flex items-center justify-center">
        {vehicle.foto ? (
          <img src={vehicle.foto} alt={vehicle.namaMobil} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Car className="w-24 h-24 text-white/20" strokeWidth={1} />
        )}
        <button
          onClick={goBack}
          className="absolute top-12 left-4 w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content Card */}
      <div className="px-5 -mt-6 relative z-10">
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold">{vehicle.namaMobil}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {vehicle.merk} &bull; {vehicle.model} &bull; {vehicle.tahun}
                </p>
              </div>
              <Badge className={`${status.className} shrink-0`}>
                {status.label}
              </Badge>
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(vehicle.hargaSewa)}
              </span>
              <span className="text-sm text-muted-foreground">/24 jam</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-primary">
                {formatPrice(vehicle.hargaSewa12Jam ?? Math.round(vehicle.hargaSewa / 2))}
              </span>
              <span className="text-sm text-muted-foreground">/12 jam</span>
            </div>

            <Separator className="my-4" />

            {/* Specs Grid */}
            <h3 className="text-sm font-semibold mb-3">Spesifikasi</h3>
            <div className="grid grid-cols-2 gap-3">
              {specs.map((spec) => {
                const Icon = spec.icon
                return (
                  <div
                    key={spec.label}
                    className="flex items-center gap-2.5 p-2.5 bg-muted/50 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">
                        {spec.label}
                      </p>
                      <p className="text-sm font-medium truncate">
                        {spec.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Category */}
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                {vehicle.kategori}
              </Badge>
            </div>

            {/* Description */}
            {vehicle.deskripsi && (
              <>
                <Separator className="my-4" />
                <h3 className="text-sm font-semibold mb-2">Deskripsi</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {vehicle.deskripsi}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Button */}
      <div className="px-5 mt-5 pb-4">
        <Button
          onClick={() =>
            setCustomerPage('booking', { vehicleId: vehicle.id })
          }
          disabled={!isAvailable}
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          {isAvailable ? 'Booking Sekarang' : 'Tidak Tersedia'}
        </Button>
      </div>
    </div>
  )
}
