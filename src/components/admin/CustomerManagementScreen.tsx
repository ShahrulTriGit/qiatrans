'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Search, Users, ShieldCheck, ShieldX, Mail, Phone, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import type { User, Rental } from '@/types'

export default function CustomerManagementScreen() {
  const [customers, setCustomers] = useState<User[]>([])
  const [rentalCounts, setRentalCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [verifyTarget, setVerifyTarget] = useState<User | null>(null)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    try {
      const [custRes, rentalRes] = await Promise.all([
        fetch('/api/users?role=CUSTOMER'),
        fetch('/api/rentals'),
      ])

      if (custRes.ok) {
        const data = await custRes.json()
        setCustomers(data.data || [])
      }

      if (rentalRes.ok) {
        const rentalData = await rentalRes.json()
        const rentals: Rental[] = rentalData.data || []
        const counts: Record<string, number> = {}
        for (const r of rentals) {
          counts[r.userId] = (counts[r.userId] || 0) + 1
        }
        setRentalCounts(counts)
      }
    } catch {
      toast.error('Gagal memuat data customer')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleVerify() {
    if (!verifyTarget) return
    setToggling(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: verifyTarget.id, verified: !verifyTarget.verified }),
      })
      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === verifyTarget.id ? { ...c, verified: !c.verified } : c
          )
        )
        toast.success(
          verifyTarget.verified
            ? `${verifyTarget.nama} berhasil di-unverify`
            : `${verifyTarget.nama} berhasil diverifikasi`
        )
      } else {
        toast.error('Gagal mengubah status verifikasi')
      }
    } catch {
      toast.error('Gagal mengubah status verifikasi')
    } finally {
      setToggling(false)
      setVerifyTarget(null)
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.nama.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.noTelepon && c.noTelepon.toLowerCase().includes(q))
    )
  })

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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
          <h1 className="text-2xl font-bold text-foreground">Data Customer</h1>
          <p className="text-muted-foreground mt-1">{customers.length} customer terdaftar</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama, email, atau telepon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>No. Telepon</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead className="text-right">Jumlah Rental</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Tidak ada customer ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(customer.nama)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{customer.nama}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            {customer.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            {customer.noTelepon || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.verified ? (
                            <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-warning/10 text-warning border-warning/20" variant="outline">
                              <ShieldX className="w-3 h-3 mr-1" /> Unverified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {rentalCounts[customer.id] ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={customer.verified ? 'outline' : 'default'}
                            onClick={() => setVerifyTarget(customer)}
                          >
                            {customer.verified ? (
                              <><ShieldX className="w-3.5 h-3.5 mr-1" /> Unverify</>
                            ) : (
                              <><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verify</>
                            )}
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
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Tidak ada customer ditemukan
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(customer.nama)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm">{customer.nama}</h3>
                      {customer.verified ? (
                        <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-warning/10 text-warning border-warning/20" variant="outline">
                          <ShieldX className="w-3 h-3 mr-1" /> Unverified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {customer.email}
                    </p>
                    {customer.noTelepon && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {customer.noTelepon}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        Jumlah Rental: <span className="font-medium text-foreground">{rentalCounts[customer.id] ?? 0}</span>
                      </span>
                      <Button
                        size="sm"
                        variant={customer.verified ? 'outline' : 'default'}
                        onClick={() => setVerifyTarget(customer)}
                      >
                        {customer.verified ? (
                          <><ShieldX className="w-3.5 h-3.5 mr-1" /> Unverify</>
                        ) : (
                          <><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verify</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Verify/Unverify Confirmation Dialog */}
      <AlertDialog open={!!verifyTarget} onOpenChange={(open) => { if (!open) setVerifyTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verifyTarget?.verified ? 'Unverify Customer' : 'Verify Customer'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {verifyTarget?.verified
                ? `Apakah Anda yakin ingin menghapus status verifikasi dari ${verifyTarget?.nama}? Customer ini tidak akan bisa melakukan rental hingga diverifikasi kembali.`
                : `Apakah Anda yakin ingin memverifikasi ${verifyTarget?.nama}? Customer ini akan dapat melakukan rental setelah diverifikasi.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggling}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleVerify} disabled={toggling}>
              {toggling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {verifyTarget?.verified ? 'Unverify' : 'Verify'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
