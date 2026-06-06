'use client'

import { useEffect, useState } from 'react'
import { useNavStore } from '@/stores/navStore'
import { toast } from 'sonner'
import {
  Search,
  ClipboardCheck,
  Eye,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Inspection, InspectionJenis, InspectionStatus } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getJenisLabel(jenis: InspectionJenis) {
  return jenis === 'SEBELUM_RENTAL' ? 'Sebelum Rental' : 'Sesudah Rental'
}

function getJenisBadge(jenis: InspectionJenis) {
  return jenis === 'SEBELUM_RENTAL' ? (
    <Badge className="bg-info/10 text-info border-info/20" variant="outline">Sebelum</Badge>
  ) : (
    <Badge className="bg-warning/10 text-warning border-warning/20" variant="outline">Sesudah</Badge>
  )
}

function getStatusBadge(status: InspectionStatus) {
  switch (status) {
    case 'PENDING':
      return <Badge className="bg-info/10 text-info border-info/20" variant="outline">Pending</Badge>
    case 'COMPLETED':
      return <Badge className="bg-success/10 text-success border-success/20" variant="outline">Completed</Badge>
    case 'VERIFIED':
      return <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">Verified</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function InspectionDataScreen() {
  const { setAdminPage } = useNavStore()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState<string>('all')

  useEffect(() => {
    fetchInspections()
  }, [])

  async function fetchInspections() {
    try {
      const res = await fetch('/api/inspections')
      if (res.ok) {
        const data = await res.json()
        setInspections(data.data || [])
      }
    } catch {
      toast.error('Gagal memuat data inspeksi')
    } finally {
      setLoading(false)
    }
  }

  const filteredInspections = inspections.filter((i) => {
    const q = search.toLowerCase()
    const matchSearch =
      (i.vehicle?.namaMobil || '').toLowerCase().includes(q) ||
      i.rentalId.toLowerCase().includes(q)
    const matchJenis = filterJenis === 'all' || i.jenisInspeksi === filterJenis
    return matchSearch && matchJenis
  })

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted rounded animate-pulse" /></CardContent></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Inspeksi</h1>
        <p className="text-muted-foreground mt-1">{inspections.length} inspeksi tercatat</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari kendaraan atau rental ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterJenis} onValueChange={setFilterJenis}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Jenis Inspeksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="SEBELUM_RENTAL">Sebelum Rental</SelectItem>
            <SelectItem value="SESUDAH_RENTAL">Sesudah Rental</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rental ID</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Detection Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada data inspeksi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInspections.map((inspection) => (
                      <TableRow key={inspection.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-mono text-xs">{inspection.rentalId.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{inspection.vehicle?.namaMobil || '-'}</TableCell>
                        <TableCell>{getJenisBadge(inspection.jenisInspeksi)}</TableCell>
                        <TableCell>{formatDate(inspection.tanggal)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{inspection.detections?.length || 0} deteksi</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAdminPage('rental-detail', { rentalId: inspection.rentalId })}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredInspections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Tidak ada data inspeksi
            </CardContent>
          </Card>
        ) : (
          filteredInspections.map((inspection) => (
            <Card key={inspection.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{inspection.vehicle?.namaMobil || '-'}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{inspection.rentalId.slice(0, 8)}...</p>
                  </div>
                  {getStatusBadge(inspection.status)}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {getJenisBadge(inspection.jenisInspeksi)}
                  <span className="text-xs text-muted-foreground">{formatDate(inspection.tanggal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{inspection.detections?.length || 0} deteksi</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setAdminPage('rental-detail', { rentalId: inspection.rentalId })}
                  >
                    <Eye className="w-3 h-3 mr-1" /> Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
