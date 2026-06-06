'use client'

import { useEffect, useState } from 'react'
import {
  Car,
  Bell,
  Search,
  ChevronRight,
  Truck,
  CarFront,
  Bus,
  Gauge,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { useNavStore } from '@/stores/navStore'
import type { Vehicle } from '@/types'

const categories = [
  { key: 'SUV', label: 'SUV', icon: Truck, color: 'bg-blue-100 text-blue-700' },
  { key: 'Sedan', label: 'Sedan', icon: CarFront, color: 'bg-emerald-100 text-emerald-700' },
  { key: 'MPV', label: 'MPV', icon: Bus, color: 'bg-amber-100 text-amber-700' },
  { key: 'Hatchback', label: 'Hatchback', icon: Car, color: 'bg-purple-100 text-purple-700' },
  { key: 'Pickup', label: 'Pickup', icon: Gauge, color: 'bg-rose-100 text-rose-700' },
]

const bannerGradients = [
  'from-qia-dark to-primary',
  'from-primary to-qia',
  'from-qia to-emerald-700',
]

const bannerTexts = [
  { title: 'Diskon 20% Rental Pertama!', subtitle: 'Gunakan kode QIATRANS20' },
  { title: 'Inspeksi Gratis', subtitle: 'Setiap rental mendapat inspeksi digital' },
  { title: 'AI Scratch Detection', subtitle: 'Deteksi lecet otomatis dengan AI' },
]

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

export default function HomeScreen() {
  const { setCustomerPage } = useNavStore()
  const { data: session } = useSession()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles')
      const data = await res.json()
      if (data.success) {
        setVehicles(data.data || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const popularVehicles = vehicles.slice(0, 6)
  const recommendedVehicles = vehicles.slice(0, 4)

  const userInitial = session?.user?.nama
    ? session.user.nama.charAt(0).toUpperCase()
    : 'U'

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-qia-dark to-primary px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-1.5">
              <Car className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-lg font-bold text-white">QiaTrans</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCustomerPage('notifications')}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Bell className="w-5 h-5 text-white" />
            </button>
            <Avatar className="w-10 h-10 border-2 border-white/30">
              <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari mobil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setCustomerPage('vehicle-list')}
            className="h-11 rounded-xl pl-10 bg-white/95 border-0 shadow-sm"
          />
        </div>
      </div>

      {/* Banner Carousel */}
      <div className="px-5 mt-5">
        <Carousel
          opts={{ loop: true, align: 'start' }}
          className="w-full"
        >
          <CarouselContent>
            {bannerGradients.map((gradient, i) => (
              <CarouselItem key={i}>
                <div
                  className={`bg-gradient-to-r ${gradient} rounded-2xl p-5 min-h-[130px] flex flex-col justify-center`}
                >
                  <h3 className="text-lg font-bold text-white">
                    {bannerTexts[i].title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    {bannerTexts[i].subtitle}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3 w-fit rounded-lg text-xs font-semibold"
                  >
                    Lihat Detail
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Mobil Populer */}
      <div className="mt-7">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-lg font-bold">Mobil Populer</h2>
          <button
            onClick={() => setCustomerPage('vehicle-list')}
            className="text-sm text-primary font-medium flex items-center gap-0.5 hover:underline"
          >
            Lihat Semua
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="min-w-[200px] border-0 shadow-md rounded-xl animate-pulse"
                >
                  <div className="h-28 bg-muted rounded-t-xl" />
                  <CardContent className="p-3">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))
            : popularVehicles.map((v) => (
                <Card
                  key={v.id}
                  className="min-w-[200px] border-0 shadow-md rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() =>
                    setCustomerPage('vehicle-detail', { vehicleId: v.id })
                  }
                >
                  <div className="h-28 bg-gradient-to-br from-qia-light to-muted rounded-t-xl flex items-center justify-center">
                    <Car className="w-10 h-10 text-primary/30" />
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {v.namaMobil}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {v.merk} &bull; {v.tahun}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {v.kategori}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-primary mt-2">
                      {formatPrice(v.hargaSewa)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /hari
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>

      {/* Kategori */}
      <div className="mt-7 px-5">
        <h2 className="text-lg font-bold mb-3">Kategori</h2>
        <div className="grid grid-cols-5 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.key}
                onClick={() =>
                  setCustomerPage('vehicle-list')
                }
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${cat.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rekomendasi */}
      <div className="mt-7 px-5">
        <h2 className="text-lg font-bold mb-3">Rekomendasi</h2>
        <div className="grid grid-cols-2 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="border-0 shadow-md rounded-xl animate-pulse"
                >
                  <div className="h-28 bg-muted rounded-t-xl" />
                  <CardContent className="p-3">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))
            : recommendedVehicles.map((v) => (
                <Card
                  key={v.id}
                  className="border-0 shadow-md rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() =>
                    setCustomerPage('vehicle-detail', { vehicleId: v.id })
                  }
                >
                  <div className="h-28 bg-gradient-to-br from-qia-light to-muted rounded-t-xl flex items-center justify-center">
                    <Car className="w-8 h-8 text-primary/30" />
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-semibold truncate">{v.namaMobil}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.merk} &bull; {v.kategori}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1.5">
                      {formatPrice(v.hargaSewa)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /hari
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </div>
  )
}
