'use client'

import { useEffect, useState } from 'react'
import { useNavStore } from '@/stores/navStore'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  Car,
  CreditCard,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  CalendarCheck,
  ArrowRight,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { DashboardStats, Rental } from '@/types'

const revenueData = [
  { day: 'Sen', revenue: 3200000 },
  { day: 'Sel', revenue: 4500000 },
  { day: 'Rab', revenue: 3800000 },
  { day: 'Kam', revenue: 5100000 },
  { day: 'Jum', revenue: 6200000 },
  { day: 'Sab', revenue: 7800000 },
  { day: 'Min', revenue: 5400000 },
]

const rentalStatusData = [
  { name: 'Aktif', value: 12, color: 'oklch(0.55 0.17 145)' },
  { name: 'Pending', value: 5, color: 'oklch(0.55 0.15 230)' },
  { name: 'Selesai', value: 28, color: 'oklch(0.45 0.15 250)' },
  { name: 'Dibatalkan', value: 3, color: 'oklch(0.65 0.03 250)' },
]

const mockStats: DashboardStats = {
  totalVehicles: 24,
  activeRentals: 12,
  totalRevenue: 48500000,
  totalCustomers: 156,
  pendingBookings: 5,
  completedRentals: 28,
  cancelledRentals: 3,
  availableVehicles: 18,
}

const mockRentals: Partial<Rental>[] = [
  {
    id: '1',
    tanggalSewa: '2026-03-01',
    tanggalKembali: '2026-03-05',
    status: 'ACTIVE',
    totalHarga: 2400000,
    user: { nama: 'Budi Santoso' },
    vehicle: { namaMobil: 'Toyota Avanza' },
  },
  {
    id: '2',
    tanggalSewa: '2026-03-02',
    tanggalKembali: '2026-03-04',
    status: 'PENDING',
    totalHarga: 1800000,
    user: { nama: 'Siti Aminah' },
    vehicle: { namaMobil: 'Honda Jazz' },
  },
  {
    id: '3',
    tanggalSewa: '2026-02-28',
    tanggalKembali: '2026-03-03',
    status: 'COMPLETED',
    totalHarga: 3200000,
    user: { nama: 'Ahmad Fauzi' },
    vehicle: { namaMobil: 'Mitsubishi Xpander' },
  },
  {
    id: '4',
    tanggalSewa: '2026-03-01',
    tanggalKembali: '2026-03-07',
    status: 'ACTIVE',
    totalHarga: 5600000,
    user: { nama: 'Dewi Lestari' },
    vehicle: { namaMobil: 'Toyota Fortuner' },
  },
  {
    id: '5',
    tanggalSewa: '2026-02-25',
    tanggalKembali: '2026-02-28',
    status: 'CANCELLED',
    totalHarga: 1500000,
    user: { nama: 'Rudi Hartono' },
    vehicle: { namaMobil: 'Suzuki Ertiga' },
  },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'ACTIVE': return 'default' as const
    case 'PENDING': return 'secondary' as const
    case 'COMPLETED': return 'outline' as const
    case 'CANCELLED': return 'destructive' as const
    default: return 'secondary' as const
  }
}

export default function DashboardScreen() {
  const { setAdminPage } = useNavStore()
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [recentRentals, setRecentRentals] = useState<Partial<Rental>[]>(mockRentals)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          setStats(data.data)
        }
      }
    } catch {
      // Use mock data
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Kendaraan',
      value: stats.totalVehicles,
      icon: Car,
      trend: '+12%',
      trendUp: true,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Rental Aktif',
      value: stats.activeRentals,
      icon: CalendarCheck,
      trend: '+8%',
      trendUp: true,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Total Pendapatan',
      value: formatCurrency(stats.totalRevenue),
      icon: CreditCard,
      trend: '+23%',
      trendUp: true,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      title: 'Total Customer',
      value: stats.totalCustomers,
      icon: Users,
      trend: '+5%',
      trendUp: true,
      color: 'text-info',
      bg: 'bg-info/10',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard QiaTrans</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang, {session?.user?.name || 'Admin'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAdminPage('vehicle-form')} className="bg-qia hover:bg-qia-dark text-qia-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Mobil
          </Button>
          <Button variant="outline" onClick={() => setAdminPage('rentals')}>
            <CalendarCheck className="w-4 h-4 mr-2" />
            Lihat Booking
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {card.trendUp ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className={card.trendUp ? 'text-success' : 'text-destructive'}>
                      {card.trend}
                    </span>
                    <span className="text-muted-foreground">vs bulan lalu</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Pendapatan 7 Hari Terakhir</CardTitle>
            <CardDescription>Tren pendapatan harian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
                  <YAxis className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.45 0.15 250)"
                    strokeWidth={3}
                    dot={{ fill: 'oklch(0.45 0.15 250)', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rental Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Rental</CardTitle>
            <CardDescription>Distribusi status rental</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rentalStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {rentalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {rentalStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rentals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Rental Terbaru</CardTitle>
            <CardDescription>5 rental terakhir</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setAdminPage('rentals')}>
            Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Tanggal Sewa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRentals.map((rental) => (
                  <TableRow
                    key={rental.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setAdminPage('rental-detail', { rentalId: rental.id! })}
                  >
                    <TableCell className="font-medium">{rental.user?.nama || '-'}</TableCell>
                    <TableCell>{rental.vehicle?.namaMobil || '-'}</TableCell>
                    <TableCell>{formatDate(rental.tanggalSewa!)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(rental.status!)}>{rental.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(rental.totalHarga!)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
