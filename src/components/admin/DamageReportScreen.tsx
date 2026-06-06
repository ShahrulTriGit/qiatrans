'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Car,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Vehicle, Inspection, DetectionResult, DetectionSeverity } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const SEVERITY_COLORS: Record<DetectionSeverity, string> = {
  RINGAN: 'oklch(0.55 0.17 145)',
  SEDANG: 'oklch(0.70 0.17 75)',
  BERAT: 'oklch(0.577 0.245 27.325)',
}

export default function DamageReportScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [detections, setDetections] = useState<DetectionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all')

  const fetchData = useCallback(async () => {
    try {
      const [vRes, iRes, dRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/inspections'),
        fetch('/api/detections'),
      ])
      if (vRes.ok) {
        const vData = await vRes.json()
        setVehicles(vData.data || [])
      }
      if (iRes.ok) {
        const iData = await iRes.json()
        setInspections(iData.data || [])
      }
      if (dRes.ok) {
        const dData = await dRes.json()
        setDetections(dData.data || [])
      }
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredDetections = detections.filter((d) => {
    if (selectedVehicleId === 'all') return true
    const inspection = inspections.find((i) => i.id === d.inspectionId)
    return inspection?.vehicleId === selectedVehicleId
  })

  const filteredInspections = inspections.filter((i) => {
    if (selectedVehicleId === 'all') return true
    return i.vehicleId === selectedVehicleId
  })

  // Before/after comparison by rental
  const rentalMap = new Map<string, { before?: Inspection; after?: Inspection }>()
  filteredInspections.forEach((insp) => {
    const existing = rentalMap.get(insp.rentalId) || {}
    if (insp.jenisInspeksi === 'SEBELUM_RENTAL') {
      existing.before = insp
    } else {
      existing.after = insp
    }
    rentalMap.set(insp.rentalId, existing)
  })

  const comparisons = Array.from(rentalMap.entries()).map(([rentalId, data]) => {
    const beforeDetections = data.before?.detections?.length || 0
    const afterDetections = data.after?.detections?.length || 0
    const vehicle = data.before?.vehicle || data.after?.vehicle
    return {
      rentalId,
      vehicleName: vehicle?.namaMobil || '-',
      beforeCount: beforeDetections,
      afterCount: afterDetections,
      newDamages: Math.max(0, afterDetections - beforeDetections),
      beforeDate: data.before?.tanggal,
      afterDate: data.after?.tanggal,
    }
  })

  // Severity distribution for chart
  const severityCounts: Record<string, number> = { Ringan: 0, Sedang: 0, Berat: 0 }
  filteredDetections.forEach((d) => {
    if (d.severity === 'RINGAN') severityCounts.Ringan++
    else if (d.severity === 'SEDANG') severityCounts.Sedang++
    else if (d.severity === 'BERAT') severityCounts.Berat++
  })

  const severityChartData = Object.entries(severityCounts).map(([name, count]) => ({
    name,
    count,
    fill: name === 'Ringan' ? SEVERITY_COLORS.RINGAN : name === 'Sedang' ? SEVERITY_COLORS.SEDANG : SEVERITY_COLORS.BERAT,
  }))

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
        <h1 className="text-2xl font-bold text-foreground">Laporan Kerusakan</h1>
        <p className="text-muted-foreground mt-1">Perbandingan kondisi kendaraan sebelum dan sesudah rental</p>
      </div>

      {/* Vehicle Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-muted-foreground shrink-0" />
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Pilih Kendaraan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kendaraan</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.namaMobil} - {v.platNomor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Severity Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribusi Tingkat Kerusakan</CardTitle>
          <CardDescription>{filteredDetections.length} total deteksi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)' }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {severityChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center mt-2">
            {severityChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-sm">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }} />
                <span className="text-muted-foreground">{item.name}: {item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Before/After Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perbandingan Kondisi Kendaraan</CardTitle>
          <CardDescription>Sebelum vs sesudah rental</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Tgl Inspeksi Sebelum</TableHead>
                  <TableHead className="text-center">Deteksi Sebelum</TableHead>
                  <TableHead>Tgl Inspeksi Sesudah</TableHead>
                  <TableHead className="text-center">Deteksi Sesudah</TableHead>
                  <TableHead className="text-center">Kerusakan Baru</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data perbandingan
                    </TableCell>
                  </TableRow>
                ) : (
                  comparisons.map((comp) => (
                    <TableRow key={comp.rentalId}>
                      <TableCell className="font-medium">{comp.vehicleName}</TableCell>
                      <TableCell>{comp.beforeDate ? formatDate(comp.beforeDate) : '-'}</TableCell>
                      <TableCell className="text-center">{comp.beforeCount}</TableCell>
                      <TableCell>{comp.afterDate ? formatDate(comp.afterDate) : '-'}</TableCell>
                      <TableCell className="text-center">{comp.afterCount}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            comp.newDamages > 0
                              ? 'bg-destructive/10 text-destructive border-destructive/20'
                              : 'bg-success/10 text-success border-success/20'
                          }
                        >
                          {comp.newDamages > 0 ? `+${comp.newDamages}` : '0'}
                        </Badge>
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
  )
}
