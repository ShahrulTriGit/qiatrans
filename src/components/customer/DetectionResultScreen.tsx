'use client'

import { useState, useEffect } from 'react'
import { useNavStore } from '@/stores/navStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Image,
  ScanSearch,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Eye,
  MapPin,
  Activity,
} from 'lucide-react'
import type { Inspection, DetectionResult } from '@/types'

// Mock data for when API is not available
const MOCK_DETECTIONS: DetectionResult[] = [
  {
    id: 'det-1',
    inspectionId: 'mock-insp-1',
    lokasiLecet: 'Bumper Depan',
    confidence: 0.92,
    gambarAsli: '/placeholder-original.jpg',
    gambarHasil: '/placeholder-result.jpg',
    severity: 'SEDANG',
    verified: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'det-2',
    inspectionId: 'mock-insp-1',
    lokasiLecet: 'Pintu Kiri Depan',
    confidence: 0.85,
    gambarAsli: '/placeholder-original.jpg',
    gambarHasil: '/placeholder-result.jpg',
    severity: 'RINGAN',
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'det-3',
    inspectionId: 'mock-insp-1',
    lokasiLecet: 'Fender Kanan Belakang',
    confidence: 0.48,
    gambarAsli: '/placeholder-original.jpg',
    gambarHasil: '/placeholder-result.jpg',
    severity: 'BERAT',
    verified: false,
    createdAt: new Date().toISOString(),
  },
]

const MOCK_INSPECTION: Inspection = {
  id: 'mock-insp-1',
  rentalId: 'rental-1',
  vehicleId: 'vehicle-1',
  jenisInspeksi: 'SEBELUM_RENTAL',
  tanggal: new Date().toISOString(),
  status: 'COMPLETED',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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
    status: 'DISEWA',
    foto: '',
    deskripsi: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

export default function DetectionResultScreen() {
  const { selectedInspectionId, goBack } = useNavStore()

  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [detections, setDetections] = useState<DetectionResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [imageTab, setImageTab] = useState('annotated')
  const [isMockData, setIsMockData] = useState(false)

  if (!selectedInspectionId) {
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
          <h1 className="text-lg font-semibold">Hasil Deteksi</h1>
        </div>
        <div className="p-4 flex flex-col items-center justify-center gap-3 py-20">
          <ScanSearch className="size-12 text-muted-foreground" />
          <p className="font-semibold text-muted-foreground">Inspeksi tidak ditemukan</p>
          <p className="text-xs text-muted-foreground text-center">Silakan pilih inspeksi dari riwayat</p>
          <Button variant="outline" onClick={goBack}>Kembali</Button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchInspectionData()
  }, [selectedInspectionId])

  const fetchInspectionData = async () => {
    setIsLoading(true)
    setIsMockData(false)
    try {
      const res = await fetch(`/api/inspections/${selectedInspectionId}`)
      const data = await res.json()

      if (data.success && data.data) {
        setInspection(data.data)
        setDetections(data.data.detections || [])
      } else {
        // Use mock data
        setInspection(MOCK_INSPECTION)
        setDetections(MOCK_DETECTIONS)
        setIsMockData(true)
      }
    } catch {
      // Use mock data
      setInspection(MOCK_INSPECTION)
      setDetections(MOCK_DETECTIONS)
      setIsMockData(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'RINGAN':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ringan</Badge>
      case 'SEDANG':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Sedang</Badge>
      case 'BERAT':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Berat</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600'
    if (confidence > 0.5) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getVehicleCondition = () => {
    if (detections.length === 0) return { label: 'Baik', color: 'text-green-600', icon: ShieldCheck }
    const hasHeavy = detections.some((d) => d.severity === 'BERAT')
    const hasMedium = detections.some((d) => d.severity === 'SEDANG')
    if (hasHeavy) return { label: 'Perlu Perhatian', color: 'text-red-600', icon: ShieldAlert }
    if (hasMedium) return { label: 'Cukup Baik', color: 'text-yellow-600', icon: AlertTriangle }
    return { label: 'Baik', color: 'text-green-600', icon: CheckCircle2 }
  }

  const avgConfidence =
    detections.length > 0
      ? detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length
      : 0

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
          <h1 className="text-lg font-semibold">Hasil Deteksi</h1>
        </div>
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  const condition = getVehicleCondition()
  const ConditionIcon = condition.icon

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
        <h1 className="text-lg font-semibold">Hasil Deteksi</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto pb-8">
        {/* Mock Data Warning Banner */}
        {isMockData && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            <AlertTriangle className="size-4 shrink-0" />
            <p className="text-xs font-medium">Data demo - koneksi API gagal</p>
          </div>
        )}

        {/* Vehicle & Inspection Info */}
        {inspection && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ScanSearch className="size-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {inspection.vehicle?.namaMobil || 'Kendaraan'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {inspection.jenisInspeksi === 'SEBELUM_RENTAL' ? 'Sebelum Rental' : 'Setelah Rental'} •{' '}
                    {new Date(inspection.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <Badge
                  variant={inspection.status === 'COMPLETED' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {inspection.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Tabs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gambar Deteksi</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={imageTab} onValueChange={setImageTab}>
              <TabsList className="w-full">
                <TabsTrigger value="annotated" className="flex-1">
                  <Eye className="size-4 mr-1" />
                  Anotasi
                </TabsTrigger>
                <TabsTrigger value="original" className="flex-1">
                  <Image className="size-4 mr-1" />
                  Asli
                </TabsTrigger>
              </TabsList>

              <TabsContent value="annotated" className="mt-3">
                <div className="relative rounded-lg overflow-hidden border bg-gray-100 aspect-[4/3]">
                  {detections.length > 0 && detections[0].gambarHasil ? (
                    <img
                      src={detections[0].gambarHasil}
                      alt="Annotated detection result"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ScanSearch className="size-12" />
                      <p className="text-sm">Gambar anotasi</p>
                    </div>
                  )}
                  {/* Simulated bounding boxes */}
                  {detections.map((det, idx) => (
                    <div
                      key={det.id}
                      className="absolute border-2 rounded-sm"
                      style={{
                        top: `${15 + (idx % 4) * 20}%`,
                        left: `${10 + (idx % 3) * 25}%`,
                        width: '25%',
                        height: '18%',
                        borderColor:
                          det.severity === 'BERAT'
                            ? '#ef4444'
                            : det.severity === 'SEDANG'
                              ? '#eab308'
                              : '#22c55e',
                      }}
                    >
                      <span
                        className="absolute -top-5 left-0 text-[10px] px-1 rounded"
                        style={{
                          backgroundColor:
                            det.severity === 'BERAT'
                              ? '#ef4444'
                              : det.severity === 'SEDANG'
                                ? '#eab308'
                                : '#22c55e',
                          color: '#fff',
                        }}
                      >
                        {det.lokasiLecet}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="original" className="mt-3">
                <div className="relative rounded-lg overflow-hidden border bg-gray-100 aspect-[4/3]">
                  {detections.length > 0 && detections[0].gambarAsli ? (
                    <img
                      src={detections[0].gambarAsli}
                      alt="Original image"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Image className="size-12" />
                      <p className="text-sm">Gambar asli</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Detection List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Deteksi Lecet ({detections.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detections.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <CheckCircle2 className="size-12 text-green-500" />
                <p className="font-semibold text-green-700">Tidak ada lecet terdeteksi</p>
                <p className="text-xs text-muted-foreground">Kendaraan dalam kondisi baik</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {detections.map((det, idx) => (
                  <div
                    key={det.id || idx}
                    className="p-3 border rounded-lg bg-white space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{det.lokasiLecet}</span>
                      </div>
                      {getSeverityBadge(det.severity)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="size-4 text-muted-foreground" />
                        <span className={`text-xs font-medium ${getConfidenceColor(det.confidence)}`}>
                          Confidence: {Math.round(det.confidence * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {det.verified ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
                            <ShieldCheck className="size-3 mr-1" />
                            Terverifikasi
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Belum Diverifikasi
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 border">
                <p className="text-xs text-muted-foreground">Total Lecet</p>
                <p className="text-2xl font-bold">{detections.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border">
                <p className="text-xs text-muted-foreground">Rata-rata Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(avgConfidence)}`}>
                  {detections.length > 0 ? `${Math.round(avgConfidence * 100)}%` : '-'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
              <div className="flex items-center gap-2">
                <ConditionIcon className={`size-5 ${condition.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">Kondisi Kendaraan</p>
                  <p className={`font-semibold ${condition.color}`}>{condition.label}</p>
                </div>
              </div>
            </div>

            {/* Severity breakdown */}
            {detections.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs">
                  <div className="size-3 rounded-full bg-green-500" />
                  Ringan: {detections.filter((d) => d.severity === 'RINGAN').length}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="size-3 rounded-full bg-yellow-500" />
                  Sedang: {detections.filter((d) => d.severity === 'SEDANG').length}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="size-3 rounded-full bg-red-500" />
                  Berat: {detections.filter((d) => d.severity === 'BERAT').length}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
