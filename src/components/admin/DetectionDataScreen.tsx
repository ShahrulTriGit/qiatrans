'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Search, ScanEye, ShieldCheck, ShieldAlert, MapPin } from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DetectionResult, DetectionSeverity } from '@/types'

function getSeverityColor(severity: DetectionSeverity) {
  switch (severity) {
    case 'RINGAN':
      return 'bg-success/10 text-success border-success/20'
    case 'SEDANG':
      return 'bg-warning/10 text-warning border-warning/20'
    case 'BERAT':
      return 'bg-destructive/10 text-destructive border-destructive/20'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getSeverityLabel(severity: DetectionSeverity) {
  switch (severity) {
    case 'RINGAN': return 'Ringan'
    case 'SEDANG': return 'Sedang'
    case 'BERAT': return 'Berat'
    default: return severity
  }
}

function formatConfidence(confidence: number) {
  return `${(confidence * 100).toFixed(1)}%`
}

export default function DetectionDataScreen() {
  const [detections, setDetections] = useState<DetectionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterVerified, setFilterVerified] = useState<string>('all')

  const fetchDetections = useCallback(async () => {
    try {
      const res = await fetch('/api/detections')
      if (res.ok) {
        const data = await res.json()
        setDetections(data.data || [])
      }
    } catch {
      toast.error('Gagal memuat data deteksi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDetections()
  }, [fetchDetections])

  const filteredDetections = detections.filter((d) => {
    const q = search.toLowerCase()
    const matchSearch =
      d.lokasiLecet.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
    const matchVerified =
      filterVerified === 'all' ||
      (filterVerified === 'verified' && d.verified) ||
      (filterVerified === 'unverified' && !d.verified)
    return matchSearch && matchVerified
  })

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}><CardContent className="p-4"><div className="h-40 bg-muted rounded animate-pulse" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hasil Deteksi</h1>
        <p className="text-muted-foreground mt-1">{detections.length} deteksi tercatat</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari lokasi lecet atau ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterVerified} onValueChange={setFilterVerified}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status Verifikasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Detection Grid */}
      {filteredDetections.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <ScanEye className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            Tidak ada data deteksi
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDetections.map((detection) => (
            <Card key={detection.id} className="overflow-hidden">
              {/* Image thumbnails */}
              <div className="flex h-40 sm:h-32 bg-muted">
                <div className="flex-1 relative overflow-hidden">
                  {detection.gambarAsli ? (
                    <img
                      src={detection.gambarAsli}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ScanEye className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 text-[11px] sm:text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Asli
                  </span>
                </div>
                <div className="flex-1 relative overflow-hidden border-l border-border">
                  {detection.gambarHasil ? (
                    <img
                      src={detection.gambarHasil}
                      alt="Result"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ScanEye className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 text-[11px] sm:text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Hasil
                  </span>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{detection.lokasiLecet}</span>
                  </div>
                  <Badge className={getSeverityColor(detection.severity)} variant="outline">
                    {getSeverityLabel(detection.severity)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Confidence: {formatConfidence(detection.confidence)}</span>
                  {detection.verified ? (
                    <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-warning/10 text-warning border-warning/20" variant="outline">
                      <ShieldAlert className="w-3 h-3 mr-1" /> Unverified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
