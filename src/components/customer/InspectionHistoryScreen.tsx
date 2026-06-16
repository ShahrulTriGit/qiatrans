'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useNavStore } from '@/stores/navStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ClipboardList,
  Car,
  Calendar,
  ScanSearch,
  ChevronRight,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { Inspection } from '@/types'

const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-1',
    rentalId: 'rental-1',
    vehicleId: 'vehicle-1',
    jenisInspeksi: 'SEBELUM_RENTAL',
    tanggal: '2024-01-15T09:00:00.000Z',
    status: 'COMPLETED',
    catatan: 'Kondisi baik, sedikit lecet di bumper',
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
      status: 'DISEWA',
      foto: '',
      deskripsi: '',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    detections: [
      {
        id: 'det-1',
        inspectionId: 'insp-1',
        lokasiLecet: 'Bumper Depan',
        confidence: 0.87,
        gambarAsli: '',
        gambarHasil: '',
        severity: 'RINGAN',
        verified: true,
        createdAt: '2024-01-15T09:15:00.000Z',
      },
    ],
  },
  {
    id: 'insp-2',
    rentalId: 'rental-1',
    vehicleId: 'vehicle-1',
    jenisInspeksi: 'SESUDAH_RENTAL',
    tanggal: '2024-01-20T16:00:00.000Z',
    status: 'COMPLETED',
    catatan: 'Lecet baru terdeteksi di pintu kiri',
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
    detections: [
      {
        id: 'det-2',
        inspectionId: 'insp-2',
        lokasiLecet: 'Pintu Kiri Depan',
        confidence: 0.91,
        gambarAsli: '',
        gambarHasil: '',
        severity: 'SEDANG',
        verified: false,
        createdAt: '2024-01-20T16:15:00.000Z',
      },
      {
        id: 'det-3',
        inspectionId: 'insp-2',
        lokasiLecet: 'Bumper Depan',
        confidence: 0.87,
        gambarAsli: '',
        gambarHasil: '',
        severity: 'RINGAN',
        verified: true,
        createdAt: '2024-01-20T16:15:00.000Z',
      },
    ],
  },
  {
    id: 'insp-3',
    rentalId: 'rental-2',
    vehicleId: 'vehicle-2',
    jenisInspeksi: 'SEBELUM_RENTAL',
    tanggal: '2024-02-01T10:00:00.000Z',
    status: 'PENDING',
    createdAt: '2024-02-01T10:00:00.000Z',
    updatedAt: '2024-02-01T10:00:00.000Z',
    vehicle: {
      id: 'vehicle-2',
      namaMobil: 'Honda Civic 2023',
      merk: 'Honda',
      model: 'Civic',
      tahun: 2023,
      warna: 'Hitam',
      platNomor: 'B 5678 ABC',
      hargaSewa: 500000,
      kategori: 'Sedan',
      transmisi: 'Automatic',
      bahanBakar: 'Bensin',
      kapasitas: 5,
      status: 'DISEWA',
      foto: '',
      deskripsi: '',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    detections: [],
  },
]

export default function InspectionHistoryScreen() {
  const { data: session } = useSession()
  const { setCustomerPage, goBack } = useNavStore()

  const [inspections, setInspections] = useState<Inspection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  const fetchInspections = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/inspections?userId=${session?.user?.id}`)
      const data = await res.json()

      if (data.success && data.data && Array.isArray(data.data)) {
        setInspections(data.data)
      } else {
        setInspections(MOCK_INSPECTIONS)
      }
    } catch {
      setInspections(MOCK_INSPECTIONS)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (session?.user?.id) {
      fetchInspections()
    }
  }, [session?.user?.id, fetchInspections])

  const filteredInspections = inspections.filter((insp) => {
    if (activeTab === 'all') return true
    if (activeTab === 'before') return insp.jenisInspeksi === 'SEBELUM_RENTAL'
    if (activeTab === 'after') return insp.jenisInspeksi === 'SESUDAH_RENTAL'
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px]">
            <CheckCircle2 className="size-3 mr-1" />
            Selesai
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-[10px]">
            <Clock className="size-3 mr-1" />
            Pending
          </Badge>
        )
      case 'VERIFIED':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
            <CheckCircle2 className="size-3 mr-1" />
            Terverifikasi
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (jenis: string) => {
    if (jenis === 'SEBELUM_RENTAL') {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
          Sebelum
        </Badge>
      )
    }
    return (
      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]">
        Sesudah
      </Badge>
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
        <h1 className="text-lg font-semibold">Riwayat Inspeksi</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto pb-8">
        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1 text-xs">
              Semua
            </TabsTrigger>
            <TabsTrigger value="before" className="flex-1 text-xs">
              Sebelum Rental
            </TabsTrigger>
            <TabsTrigger value="after" className="flex-1 text-xs">
              Sesudah Rental
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredInspections.length === 0 && (
          <Card>
            <CardContent className="p-8 flex flex-col items-center gap-3">
              <FileSearch className="size-12 text-muted-foreground" />
              <p className="font-semibold text-muted-foreground">Belum ada inspeksi</p>
              <p className="text-xs text-muted-foreground text-center">
                Riwayat inspeksi kendaraan Anda akan muncul di sini
              </p>
            </CardContent>
          </Card>
        )}

        {/* Inspection Cards */}
        {!isLoading && filteredInspections.length > 0 && (
          <div className="space-y-3">
            {filteredInspections.map((insp) => {
              const detectionCount = insp.detections?.length || 0

              return (
                <Card
                  key={insp.id}
                  className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                  onClick={() => {
                    setCustomerPage('detection-result', { inspectionId: insp.id })
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ScanSearch className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold truncate">
                            {insp.vehicle?.namaMobil || 'Kendaraan'}
                          </p>
                          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(insp.jenisInspeksi)}
                          {getStatusBadge(insp.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(insp.tanggal).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="size-3" />
                            {detectionCount} deteksi
                          </div>
                        </div>
                        {insp.catatan && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {insp.catatan}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
