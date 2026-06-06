'use client'

import { useState, useEffect } from 'react'
import { useNavStore } from '@/stores/navStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRightLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Download,
  Car,
  Image,
  ScanSearch,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import type { Inspection, DetectionResult } from '@/types'

interface ComparisonData {
  beforeInspection: Inspection | null
  afterInspection: Inspection | null
  beforeDetections: DetectionResult[]
  afterDetections: DetectionResult[]
  newDetections: DetectionResult[]
  existingDetections: DetectionResult[]
}

const MOCK_BEFORE_DETECTIONS: DetectionResult[] = [
  {
    id: 'bd-1',
    inspectionId: 'insp-before-1',
    lokasiLecet: 'Bumper Depan',
    confidence: 0.87,
    gambarAsli: '',
    gambarHasil: '',
    severity: 'RINGAN',
    verified: true,
    createdAt: '2024-01-15T09:15:00.000Z',
  },
]

const MOCK_AFTER_DETECTIONS: DetectionResult[] = [
  {
    id: 'ad-1',
    inspectionId: 'insp-after-1',
    lokasiLecet: 'Bumper Depan',
    confidence: 0.87,
    gambarAsli: '',
    gambarHasil: '',
    severity: 'RINGAN',
    verified: true,
    createdAt: '2024-01-20T16:15:00.000Z',
  },
  {
    id: 'ad-2',
    inspectionId: 'insp-after-1',
    lokasiLecet: 'Pintu Kiri Depan',
    confidence: 0.91,
    gambarAsli: '',
    gambarHasil: '',
    severity: 'SEDANG',
    verified: false,
    createdAt: '2024-01-20T16:15:00.000Z',
  },
  {
    id: 'ad-3',
    inspectionId: 'insp-after-1',
    lokasiLecet: 'Fender Kanan Belakang',
    confidence: 0.78,
    gambarAsli: '',
    gambarHasil: '',
    severity: 'BERAT',
    verified: false,
    createdAt: '2024-01-20T16:15:00.000Z',
  },
]

const MOCK_BEFORE_INSPECTION: Inspection = {
  id: 'insp-before-1',
  rentalId: 'rental-1',
  vehicleId: 'vehicle-1',
  jenisInspeksi: 'SEBELUM_RENTAL',
  tanggal: '2024-01-15T09:00:00.000Z',
  status: 'COMPLETED',
  createdAt: '2024-01-15T09:00:00.000Z',
  updatedAt: '2024-01-15T09:30:00.000Z',
  vehicle: {
    id: 'vehicle-1',
    namaMobil: 'Toyota Avanza 2024',
    merk: 'Toyota',
    model: 'Avanza',
    tahun: 2024,
    warna: 'Putih',
    platNomor: 'B 1234 XYZ',
    hargaSewa: 350000,
    kategori: 'MPV',
    transmisi: 'Automatic',
    bahanBakar: 'Bensin',
    kapasitas: 7,
    status: 'TERSEDIA',
    foto: '',
    deskripsi: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  detections: MOCK_BEFORE_DETECTIONS,
}

const MOCK_AFTER_INSPECTION: Inspection = {
  id: 'insp-after-1',
  rentalId: 'rental-1',
  vehicleId: 'vehicle-1',
  jenisInspeksi: 'SESUDAH_RENTAL',
  tanggal: '2024-01-20T16:00:00.000Z',
  status: 'COMPLETED',
  createdAt: '2024-01-20T16:00:00.000Z',
  updatedAt: '2024-01-20T16:30:00.000Z',
  vehicle: {
    id: 'vehicle-1',
    namaMobil: 'Toyota Avanza 2024',
    merk: 'Toyota',
    model: 'Avanza',
    tahun: 2024,
    warna: 'Putih',
    platNomor: 'B 1234 XYZ',
    hargaSewa: 350000,
    kategori: 'MPV',
    transmisi: 'Automatic',
    bahanBakar: 'Bensin',
    kapasitas: 7,
    status: 'TERSEDIA',
    foto: '',
    deskripsi: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  detections: MOCK_AFTER_DETECTIONS,
}

export default function DamageComparisonScreen() {
  const { selectedRentalId, goBack } = useNavStore()

  const [comparison, setComparison] = useState<ComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    fetchComparisonData()
  }, [selectedRentalId])

  const fetchComparisonData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/inspections?rentalId=${selectedRentalId}`)
      const data = await res.json()

      if (data.success && data.data && Array.isArray(data.data)) {
        const inspections: Inspection[] = data.data
        const beforeInspection = inspections.find((i) => i.jenisInspeksi === 'SEBELUM_RENTAL') || null
        const afterInspection = inspections.find((i) => i.jenisInspeksi === 'SESUDAH_RENTAL') || null

        if (beforeInspection || afterInspection) {
          const beforeDetections = beforeInspection?.detections || []
          const afterDetections = afterInspection?.detections || []

          // Find new detections (in after but not in before)
          const beforeLocations = new Set(beforeDetections.map((d) => d.lokasiLecet))
          const newDetections = afterDetections.filter((d) => !beforeLocations.has(d.lokasiLecet))
          const existingDetections = afterDetections.filter((d) => beforeLocations.has(d.lokasiLecet))

          setComparison({
            beforeInspection,
            afterInspection,
            beforeDetections,
            afterDetections,
            newDetections,
            existingDetections,
          })
          setIsLoading(false)
          return
        }
      }

      // Use mock data
      const beforeLocations = new Set(MOCK_BEFORE_DETECTIONS.map((d) => d.lokasiLecet))
      const newDetections = MOCK_AFTER_DETECTIONS.filter((d) => !beforeLocations.has(d.lokasiLecet))
      const existingDetections = MOCK_AFTER_DETECTIONS.filter((d) => beforeLocations.has(d.lokasiLecet))

      setComparison({
        beforeInspection: MOCK_BEFORE_INSPECTION,
        afterInspection: MOCK_AFTER_INSPECTION,
        beforeDetections: MOCK_BEFORE_DETECTIONS,
        afterDetections: MOCK_AFTER_DETECTIONS,
        newDetections,
        existingDetections,
      })
    } catch {
      // Use mock data
      const beforeLocations = new Set(MOCK_BEFORE_DETECTIONS.map((d) => d.lokasiLecet))
      const newDetections = MOCK_AFTER_DETECTIONS.filter((d) => !beforeLocations.has(d.lokasiLecet))
      const existingDetections = MOCK_AFTER_DETECTIONS.filter((d) => beforeLocations.has(d.lokasiLecet))

      setComparison({
        beforeInspection: MOCK_BEFORE_INSPECTION,
        afterInspection: MOCK_AFTER_INSPECTION,
        beforeDetections: MOCK_BEFORE_DETECTIONS,
        afterDetections: MOCK_AFTER_DETECTIONS,
        newDetections,
        existingDetections,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    setIsDownloading(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      toast.success('Laporan berhasil diunduh')
    } catch {
      toast.error('Gagal mengunduh laporan')
    } finally {
      setIsDownloading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'RINGAN':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'SEDANG':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'BERAT':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getChangeIndicator = () => {
    if (!comparison) return null
    const beforeCount = comparison.beforeDetections.length
    const afterCount = comparison.afterDetections.length
    const diff = afterCount - beforeCount

    if (diff > 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingUp className="size-5" />
          <span className="text-sm font-semibold">+{diff} lecet baru</span>
        </div>
      )
    } else if (diff < 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingDown className="size-5" />
          <span className="text-sm font-semibold">{diff} lecet berkurang</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Minus className="size-5" />
        <span className="text-sm font-semibold">Tidak ada perubahan</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary/80"
            onClick={goBack}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold">Perbandingan Kondisi Kendaraan</h1>
        </div>
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md">
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary/80"
          onClick={goBack}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-lg font-semibold">Perbandingan Kondisi Kendaraan</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto pb-8">
        {/* Vehicle Info */}
        {comparison?.beforeInspection?.vehicle && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="size-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {comparison.beforeInspection.vehicle.namaMobil}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {comparison.beforeInspection.vehicle.platNomor}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Side by Side Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="size-5 text-primary" />
              Perbandingan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {/* Before Column */}
              <div className="space-y-2">
                <div className="text-center">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-2">
                    Sebelum Rental
                  </Badge>
                </div>
                <div className="rounded-lg overflow-hidden border bg-gray-50 aspect-[4/3] flex items-center justify-center">
                  {comparison?.beforeDetections.length && comparison.beforeDetections[0].gambarHasil ? (
                    <img
                      src={comparison.beforeDetections[0].gambarHasil}
                      alt="Sebelum rental"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Image className="size-8" />
                      <span className="text-[10px]">Gambar Sebelum</span>
                    </div>
                  )}
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 border">
                  <p className="text-2xl font-bold">{comparison?.beforeDetections.length ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">Lecet</p>
                </div>
              </div>

              {/* After Column */}
              <div className="space-y-2">
                <div className="text-center">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-2">
                    Sesudah Rental
                  </Badge>
                </div>
                <div className="rounded-lg overflow-hidden border bg-gray-50 aspect-[4/3] flex items-center justify-center">
                  {comparison?.afterDetections.length && comparison.afterDetections[0].gambarHasil ? (
                    <img
                      src={comparison.afterDetections[0].gambarHasil}
                      alt="Sesudah rental"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Image className="size-8" />
                      <span className="text-[10px]">Gambar Sesudah</span>
                    </div>
                  )}
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 border">
                  <p className="text-2xl font-bold">{comparison?.afterDetections.length ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">Lecet</p>
                </div>
              </div>
            </div>

            {/* Change Indicator */}
            <div className="mt-4 flex justify-center p-3 rounded-lg bg-gray-50 border">
              {getChangeIndicator()}
            </div>
          </CardContent>
        </Card>

        {/* Summary Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ringkasan Perbandingan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 mb-1">Sebelum</p>
                <p className="text-xl font-bold text-blue-800">{comparison?.beforeDetections.length ?? 0}</p>
                <p className="text-[10px] text-blue-500">lecet</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-xs text-purple-600 mb-1">Sesudah</p>
                <p className="text-xl font-bold text-purple-800">{comparison?.afterDetections.length ?? 0}</p>
                <p className="text-[10px] text-purple-500">lecet</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-600 mb-1">Baru</p>
                <p className="text-xl font-bold text-red-800">{comparison?.newDetections.length ?? 0}</p>
                <p className="text-[10px] text-red-500">lecet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Damages */}
        {comparison && comparison.newDetections.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="size-5 text-red-500" />
                Kerusakan Baru
              </CardTitle>
              <CardDescription>
                Lecet yang terdeteksi setelah rental dan tidak ada sebelumnya
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {comparison.newDetections.map((det, idx) => (
                  <div
                    key={det.id || idx}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="size-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-900">{det.lokasiLecet}</p>
                        <p className="text-xs text-red-600">
                          Confidence: {Math.round(det.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${getSeverityColor(det.severity)}`}>
                      {det.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Damages */}
        {comparison && comparison.existingDetections.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="size-5 text-amber-500" />
                Lecet yang Sudah Ada
              </CardTitle>
              <CardDescription>
                Lecet yang sudah terdeteksi sebelum rental
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="max-h-40 overflow-y-auto space-y-2">
                {comparison.existingDetections.map((det, idx) => (
                  <div
                    key={det.id || idx}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Minus className="size-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-900">{det.lokasiLecet}</p>
                        <p className="text-xs text-amber-600">
                          Confidence: {Math.round(det.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${getSeverityColor(det.severity)}`}>
                      {det.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Damage Report Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Laporan Kerusakan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {comparison && comparison.newDetections.length === 0 ? (
              <div className="flex flex-col items-center py-4 gap-2">
                <CheckCircle2 className="size-10 text-green-500" />
                <p className="font-semibold text-green-700">Tidak ada kerusakan baru</p>
                <p className="text-xs text-muted-foreground text-center">
                  Kendaraan dikembalikan dalam kondisi yang sama seperti saat diserahkan
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {comparison?.newDetections.map((det, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-red-700 font-medium">{det.lokasiLecet}</span>
                    <Badge className={`text-[10px] ${getSeverityColor(det.severity)}`}>
                      {det.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <Button
              className="w-full"
              variant="outline"
              onClick={handleDownloadReport}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Mengunduh...
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Unduh Laporan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
