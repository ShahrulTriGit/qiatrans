'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Search, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavStore } from '@/stores/navStore'
import { useAppStore } from '@/stores/appStore'
import type { Vehicle } from '@/types'

type SortOption = 'terbaru' | 'harga-terendah' | 'harga-tertinggi'

const filterChips = ['All', 'City Car', 'MPV (Multi Purpose Vehicle)', 'Van/Minibus'] as const

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

export default function VehicleListScreen() {
  const { goBack, setCustomerPage } = useNavStore()
  const { filterKategori, setFilterKategori } = useAppStore()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>(() => filterKategori || 'All')
  const [sortOption, setSortOption] = useState<SortOption>('terbaru')
  const [showSort, setShowSort] = useState(false)

  useEffect(() => {
    setFilterKategori('')
  }, [setFilterKategori])

  const fetchVehicles = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const filteredVehicles = useMemo(() => {
    let result = [...vehicles]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (v) =>
          v.namaMobil.toLowerCase().includes(q) ||
          v.merk.toLowerCase().includes(q) ||
          v.kategori.toLowerCase().includes(q)
      )
    }

    // Filter by category
    if (activeFilter !== 'All') {
      result = result.filter((v) => v.kategori === activeFilter)
    }

    // Sort
    switch (sortOption) {
      case 'harga-terendah':
        result.sort((a, b) => a.hargaSewa - b.hargaSewa)
        break
      case 'harga-tertinggi':
        result.sort((a, b) => b.hargaSewa - a.hargaSewa)
        break
      case 'terbaru':
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
    }

    return result
  }, [vehicles, search, activeFilter, sortOption])

  const sortLabels: Record<SortOption, string> = {
    terbaru: 'Terbaru',
    'harga-terendah': 'Harga Terendah',
    'harga-tertinggi': 'Harga Tertinggi',
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari mobil..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl pl-10"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === chip
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between px-4 pb-3">
          <p className="text-sm text-muted-foreground">
            {filteredVehicles.length} mobil ditemukan
          </p>
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="text-sm font-medium text-primary flex items-center gap-1"
            >
              {sortLabels[sortOption]}
            </button>
            {showSort && (
              <div className="absolute right-0 top-8 bg-popover border rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
                {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortOption(key)
                      setShowSort(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                      sortOption === key
                        ? 'text-primary font-semibold'
                        : 'text-foreground'
                    }`}
                  >
                    {sortLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="px-4 pt-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-md rounded-xl animate-pulse">
                <div className="h-28 bg-muted rounded-t-xl" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Car className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">Tidak ada mobil ditemukan</p>
            <p className="text-sm text-muted-foreground mt-1">
              Coba ubah filter atau kata kunci pencarian
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredVehicles.map((v) => (
              <Card
                key={v.id}
                className="border-0 shadow-md rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  setCustomerPage('vehicle-detail', { vehicleId: v.id })
                }
              >
                <div className="h-28 rounded-t-xl overflow-hidden bg-gradient-to-br from-qia-light to-muted flex items-center justify-center">
                  {v.foto ? (
                    <img src={v.foto} alt={v.namaMobil} className="w-full h-full object-cover" />
                  ) : (
                    <Car className="w-8 h-8 text-primary/30" />
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-semibold truncate">{v.namaMobil}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {v.merk} &bull; {v.tahun}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {v.kategori}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {v.transmisi}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-primary mt-2">
                    {formatPrice(v.hargaSewa)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /24 jam
                    </span>
                  </p>
                  <p className="text-xs font-medium text-primary">
                    {formatPrice(v.hargaSewa12Jam)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /12 jam
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
