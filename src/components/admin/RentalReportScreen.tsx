'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  DollarSign,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Rental, RentalStatus } from '@/types'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStatusBadge(status: RentalStatus) {
  switch (status) {
    case 'PENDING': return <Badge className="bg-info/10 text-info border-info/20" variant="outline">Pending</Badge>
    case 'ACTIVE': return <Badge className="bg-success/10 text-success border-success/20" variant="outline">Aktif</Badge>
    case 'COMPLETED': return <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">Selesai</Badge>
    case 'CANCELLED': return <Badge className="bg-destructive/10 text-destructive border-destructive/20" variant="outline">Dibatalkan</Badge>
    default: return <Badge variant="secondary">{status}</Badge>
  }
}

export default function RentalReportScreen() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchRentals()
  }, [])

  async function fetchRentals() {
    try {
      const res = await fetch('/api/rentals')
      if (res.ok) {
        const data = await res.json()
        setRentals(data.data || [])
      }
    } catch {
      toast.error('Gagal memuat data rental')
    } finally {
      setLoading(false)
    }
  }

  const filteredRentals = rentals.filter((r) => {
    if (dateFrom && r.tanggalSewa < dateFrom) return false
    if (dateTo && r.tanggalSewa > dateTo) return false
    return true
  })

  const totalRentals = filteredRentals.length
  const completedRentals = filteredRentals.filter((r) => r.status === 'COMPLETED').length
  const cancelledRentals = filteredRentals.filter((r) => r.status === 'CANCELLED').length
  const totalRevenue = filteredRentals
    .filter((r) => r.status === 'COMPLETED' || r.status === 'ACTIVE')
    .reduce((sum, r) => sum + r.totalHarga, 0)

  // Revenue by date for chart
  const revenueByDate = filteredRentals
    .filter((r) => r.status === 'COMPLETED' || r.status === 'ACTIVE')
    .reduce<Record<string, number>>((acc, r) => {
      const date = r.tanggalSewa.split('T')[0]
      acc[date] = (acc[date] || 0) + r.totalHarga
      return acc
    }, {})

  const chartData = Object.entries(revenueByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      revenue,
    }))

  function handleExport() {
    // Create CSV
    const headers = ['ID', 'Customer', 'Kendaraan', 'Tgl Sewa', 'Tgl Kembali', 'Status', 'Total']
    const rows = filteredRentals.map((r) => [
      r.id,
      r.user?.nama || '-',
      r.vehicle?.namaMobil || '-',
      r.tanggalSewa,
      r.tanggalKembali,
      r.status,
      r.totalHarga,
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rental-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Laporan berhasil diekspor')
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan Rental</h1>
          <p className="text-muted-foreground mt-1">Ringkasan dan laporan data rental</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Ekspor CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Dari Tanggal</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Sampai Tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="shrink-0"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{totalRentals}</p>
            <p className="text-xs text-muted-foreground">Total Rental</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold">{completedRentals}</p>
            <p className="text-xs text-muted-foreground">Selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 mx-auto text-destructive mb-2" />
            <p className="text-2xl font-bold">{cancelledRentals}</p>
            <p className="text-xs text-muted-foreground">Dibatalkan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto text-warning mb-2" />
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">Total Pendapatan</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tren Pendapatan</CardTitle>
            <CardDescription>Pendapatan dari rental selesai dan aktif</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="oklch(0.45 0.15 250)" strokeWidth={2} dot={{ fill: 'oklch(0.45 0.15 250)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Rental</CardTitle>
          <CardDescription>{filteredRentals.length} data rental</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Tgl Sewa</TableHead>
                  <TableHead>Tgl Kembali</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data rental
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRentals.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">{rental.user?.nama || '-'}</TableCell>
                      <TableCell>{rental.vehicle?.namaMobil || '-'}</TableCell>
                      <TableCell>{formatDate(rental.tanggalSewa)}</TableCell>
                      <TableCell>{formatDate(rental.tanggalKembali)}</TableCell>
                      <TableCell>{getStatusBadge(rental.status)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(rental.totalHarga)}</TableCell>
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
