'use client'

import { useEffect, useState } from 'react'
import { useNavStore } from '@/stores/navStore'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Car,
} from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import type { Vehicle } from '@/types'

const emptyForm = {
  namaMobil: '',
  merk: '',
  model: '',
  tahun: new Date().getFullYear(),
  warna: '',
  platNomor: '',
  hargaSewa: 0,
  kategori: 'Sedan' as Vehicle['kategori'],
  transmisi: 'Automatic' as Vehicle['transmisi'],
  bahanBakar: 'Bensin' as Vehicle['bahanBakar'],
  kapasitas: 5,
  deskripsi: '',
  foto: '',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function getStatusColor(status: Vehicle['status']) {
  switch (status) {
    case 'TERSEDIA': return 'bg-success/10 text-success border-success/20'
    case 'DISEWA': return 'bg-warning/10 text-warning border-warning/20'
    case 'MAINTENANCE': return 'bg-destructive/10 text-destructive border-destructive/20'
    default: return 'bg-muted text-muted-foreground'
  }
}

export default function VehicleManagementScreen() {
  const { setAdminPage } = useNavStore()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  async function fetchVehicles() {
    try {
      const res = await fetch('/api/vehicles')
      if (res.ok) {
        const data = await res.json()
        setVehicles(data.data || [])
      }
    } catch {
      toast.error('Gagal memuat data kendaraan')
    } finally {
      setLoading(false)
    }
  }

  function openAddForm() {
    setEditingVehicle(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEditForm(vehicle: Vehicle) {
    setEditingVehicle(vehicle)
    setForm({
      namaMobil: vehicle.namaMobil,
      merk: vehicle.merk,
      model: vehicle.model,
      tahun: vehicle.tahun,
      warna: vehicle.warna,
      platNomor: vehicle.platNomor,
      hargaSewa: vehicle.hargaSewa,
      kategori: vehicle.kategori,
      transmisi: vehicle.transmisi,
      bahanBakar: vehicle.bahanBakar,
      kapasitas: vehicle.kapasitas,
      deskripsi: vehicle.deskripsi,
      foto: vehicle.foto,
    })
    setFormOpen(true)
  }

  function openDeleteDialog(vehicle: Vehicle) {
    setDeletingVehicle(vehicle)
    setDeleteOpen(true)
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      if (editingVehicle) {
        const res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        toast.success('Kendaraan berhasil diperbarui')
      } else {
        const res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        toast.success('Kendaraan berhasil ditambahkan')
      }
      setFormOpen(false)
      fetchVehicles()
    } catch {
      toast.error('Gagal menyimpan kendaraan')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deletingVehicle) return
    try {
      const res = await fetch(`/api/vehicles/${deletingVehicle.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Kendaraan berhasil dihapus')
      setDeleteOpen(false)
      fetchVehicles()
    } catch {
      toast.error('Gagal menghapus kendaraan')
    }
  }

  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.namaMobil.toLowerCase().includes(search.toLowerCase()) ||
      v.merk.toLowerCase().includes(search.toLowerCase()) ||
      v.platNomor.toLowerCase().includes(search.toLowerCase())
    const matchKategori = filterKategori === 'all' || v.kategori === filterKategori
    const matchStatus = filterStatus === 'all' || v.status === filterStatus
    return matchSearch && matchKategori && matchStatus
  })

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}><CardContent className="p-6"><div className="h-20 bg-muted rounded animate-pulse" /></CardContent></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Mobil</h1>
          <p className="text-muted-foreground mt-1">{vehicles.length} kendaraan terdaftar</p>
        </div>
        <Button onClick={openAddForm} className="bg-qia hover:bg-qia-dark text-qia-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Mobil
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, merk, atau plat nomor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterKategori} onValueChange={setFilterKategori}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="SUV">SUV</SelectItem>
            <SelectItem value="Sedan">Sedan</SelectItem>
            <SelectItem value="MPV">MPV</SelectItem>
            <SelectItem value="Hatchback">Hatchback</SelectItem>
            <SelectItem value="Pickup">Pickup</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="TERSEDIA">Tersedia</SelectItem>
            <SelectItem value="DISEWA">Disewa</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Foto</TableHead>
                    <TableHead>Nama Mobil</TableHead>
                    <TableHead>Merk</TableHead>
                    <TableHead>Plat Nomor</TableHead>
                    <TableHead>Harga Sewa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada kendaraan ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            {vehicle.foto ? (
                              <img src={vehicle.foto} alt={vehicle.namaMobil} className="w-full h-full object-cover" />
                            ) : (
                              <Car className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{vehicle.namaMobil}</TableCell>
                        <TableCell>{vehicle.merk}</TableCell>
                        <TableCell className="font-mono text-sm">{vehicle.platNomor}</TableCell>
                        <TableCell>{formatCurrency(vehicle.hargaSewa)}/hari</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(vehicle.status)} variant="outline">
                            {vehicle.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditForm(vehicle)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog(vehicle)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
        {filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Tidak ada kendaraan ditemukan
            </CardContent>
          </Card>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {vehicle.foto ? (
                      <img src={vehicle.foto} alt={vehicle.namaMobil} className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm truncate">{vehicle.namaMobil}</h3>
                        <p className="text-xs text-muted-foreground">{vehicle.merk} &middot; {vehicle.platNomor}</p>
                      </div>
                      <Badge className={getStatusColor(vehicle.status)} variant="outline">
                        {vehicle.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-primary mt-1">{formatCurrency(vehicle.hargaSewa)}/hari</p>
                    <div className="flex gap-1 mt-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEditForm(vehicle)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs text-destructive" onClick={() => openDeleteDialog(vehicle)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}</DialogTitle>
            <DialogDescription>
              {editingVehicle ? 'Perbarui informasi kendaraan' : 'Isi data kendaraan baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="namaMobil">Nama Mobil</Label>
              <Input id="namaMobil" value={form.namaMobil} onChange={(e) => setForm({ ...form, namaMobil: e.target.value })} placeholder="Toyota Avanza" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merk">Merk</Label>
              <Input id="merk" value={form.merk} onChange={(e) => setForm({ ...form, merk: e.target.value })} placeholder="Toyota" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Avanza G 2024" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun</Label>
              <Input id="tahun" type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warna">Warna</Label>
              <Input id="warna" value={form.warna} onChange={(e) => setForm({ ...form, warna: e.target.value })} placeholder="Putih" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platNomor">Plat Nomor</Label>
              <Input id="platNomor" value={form.platNomor} onChange={(e) => setForm({ ...form, platNomor: e.target.value })} placeholder="B 1234 ABC" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hargaSewa">Harga Sewa (per hari)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Rp</span>
                <Input
                  id="hargaSewa"
                  type="text"
                  inputMode="numeric"
                  value={form.hargaSewa ? form.hargaSewa.toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\./g, '')
                    setForm({ ...form, hargaSewa: parseInt(raw) || 0 })
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select value={form.kategori} onValueChange={(v) => setForm({ ...form, kategori: v as Vehicle['kategori'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="MPV">MPV</SelectItem>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                  <SelectItem value="Pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmisi">Transmisi</Label>
              <Select value={form.transmisi} onValueChange={(v) => setForm({ ...form, transmisi: v as Vehicle['transmisi'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bahanBakar">Bahan Bakar</Label>
              <Select value={form.bahanBakar} onValueChange={(v) => setForm({ ...form, bahanBakar: v as Vehicle['bahanBakar'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bensin">Bensin</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Listrik">Listrik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kapasitas">Kapasitas</Label>
              <Input id="kapasitas" type="number" value={form.kapasitas} onChange={(e) => setForm({ ...form, kapasitas: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Foto Mobil</Label>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
                  {form.foto ? (
                    <img src={form.foto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Car className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const formData = new FormData()
                      formData.append('file', file)
                      try {
                        const res = await fetch('/api/upload', { method: 'POST', body: formData })
                        const data = await res.json()
                        if (data.success) {
                          setForm({ ...form, foto: data.data.url })
                          toast.success('Foto berhasil diupload')
                        }
                      } catch {
                        toast.error('Gagal mengupload foto')
                      }
                    }}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">Format: JPG, PNG. Maks 5MB</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea id="deskripsi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} placeholder="Deskripsi kendaraan..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-qia hover:bg-qia-dark text-qia-foreground">
              {submitting ? 'Menyimpan...' : editingVehicle ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kendaraan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deletingVehicle?.namaMobil}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
