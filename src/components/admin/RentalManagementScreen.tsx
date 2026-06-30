'use client'

import { useCallback, useEffect, useState } from 'react'
import { useNavStore } from '@/stores/navStore'
import { toast } from 'sonner'
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Rental, RentalStatus } from '@/types'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStatusBadge(status: RentalStatus) {
  switch (status) {
    case 'PENDING':
      return <Badge className="bg-info/10 text-info border-info/20" variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
    case 'ACTIVE':
      return <Badge className="bg-success/10 text-success border-success/20" variant="outline"><PlayCircle className="w-3 h-3 mr-1" />Aktif</Badge>
    case 'COMPLETED':
      return <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline"><CheckCircle2 className="w-3 h-3 mr-1" />Selesai</Badge>
    case 'CANCELLED':
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20" variant="outline"><XCircle className="w-3 h-3 mr-1" />Dibatalkan</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function RentalManagementScreen() {
  const { setAdminPage } = useNavStore()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')

  const fetchRentals = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchRentals()
  }, [fetchRentals])

  async function updateRentalStatus(id: string, status: RentalStatus) {
    try {
      const res = await fetch(`/api/rentals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Status rental berhasil diubah ke ${status}`)
      fetchRentals()
    } catch {
      toast.error('Gagal mengubah status rental')
    }
  }

  const filteredRentals = rentals.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch =
      (r.user?.nama || '').toLowerCase().includes(q) ||
      (r.vehicle?.namaMobil || '').toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    const matchTab = activeTab === 'all' || r.status === activeTab
    return matchSearch && matchTab
  })

  const statusCounts = {
    all: rentals.length,
    PENDING: rentals.filter((r) => r.status === 'PENDING').length,
    ACTIVE: rentals.filter((r) => r.status === 'ACTIVE').length,
    COMPLETED: rentals.filter((r) => r.status === 'COMPLETED').length,
    CANCELLED: rentals.filter((r) => r.status === 'CANCELLED').length,
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

  const renderRentalRow = (rental: Rental) => (
    <TableRow
      key={rental.id}
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => setAdminPage('rental-detail', { rentalId: rental.id })}
    >
      <TableCell className="font-medium">{rental.user?.nama || '-'}</TableCell>
      <TableCell>{rental.vehicle?.namaMobil || '-'}</TableCell>
      <TableCell>{formatDate(rental.tanggalSewa)} {rental.jamAmbil || ''}</TableCell>
      <TableCell>{formatDate(rental.tanggalKembali)} {rental.jamKembali || ''}</TableCell>
      <TableCell>{getStatusBadge(rental.status)}</TableCell>
      <TableCell className="text-right">{formatCurrency(rental.totalHarga)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {rental.status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs text-success"
                onClick={() => updateRentalStatus(rental.id, 'ACTIVE')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Verifikasi
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={() => updateRentalStatus(rental.id, 'CANCELLED')}
              >
                <XCircle className="w-3 h-3 mr-1" /> Tolak
              </Button>
            </>
          )}
          {rental.status === 'ACTIVE' && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs text-primary"
              onClick={() => updateRentalStatus(rental.id, 'COMPLETED')}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" /> Selesaikan
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )

  const renderMobileCard = (rental: Rental) => (
    <Card key={rental.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-sm">{rental.user?.nama || '-'}</h3>
            <p className="text-xs text-muted-foreground">{rental.vehicle?.namaMobil || '-'}</p>
          </div>
          {getStatusBadge(rental.status)}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
          <div>Sewa: {formatDate(rental.tanggalSewa)} {rental.jamAmbil || ''}</div>
          <div>Kembali: {formatDate(rental.tanggalKembali)} {rental.jamKembali || ''}</div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-primary">{formatCurrency(rental.totalHarga)}</span>
          <div className="flex gap-1">
            {rental.status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-success"
                  onClick={() => updateRentalStatus(rental.id, 'ACTIVE')}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verifikasi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-destructive"
                  onClick={() => updateRentalStatus(rental.id, 'CANCELLED')}
                >
                  <XCircle className="w-3 h-3 mr-1" /> Tolak
                </Button>
              </>
            )}
            {rental.status === 'ACTIVE' && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs text-primary"
                onClick={() => updateRentalStatus(rental.id, 'COMPLETED')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Selesaikan
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Rental</h1>
        <p className="text-muted-foreground mt-1">{rentals.length} total rental</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari customer, kendaraan, atau ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto flex flex-wrap">
          <TabsTrigger value="all">Semua ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({statusCounts.PENDING})</TabsTrigger>
          <TabsTrigger value="ACTIVE">Aktif ({statusCounts.ACTIVE})</TabsTrigger>
          <TabsTrigger value="COMPLETED">Selesai ({statusCounts.COMPLETED})</TabsTrigger>
          <TabsTrigger value="CANCELLED">Dibatalkan ({statusCounts.CANCELLED})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Kendaraan</TableHead>
                        <TableHead>Tgl Sewa</TableHead>
                        <TableHead>Tgl Kembali</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRentals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Tidak ada data rental
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRentals.map(renderRentalRow)
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredRentals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Tidak ada data rental
                </CardContent>
              </Card>
            ) : (
              filteredRentals.map(renderMobileCard)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
