'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Search, Shield, Loader2, Crown, UserCog, User } from 'lucide-react'
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
import type { User as UserType } from '@/types'

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-red-100 text-red-700 border-red-200', icon: Crown },
  ADMIN: { label: 'Admin', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Shield },
  OWNER: { label: 'Owner', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: UserCog },
  CUSTOMER: { label: 'Customer', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: User },
}

export default function AccessManagementScreen() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [changeTarget, setChangeTarget] = useState<UserType | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [changing, setChanging] = useState(false)

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data || [])
      }
    } catch {
      toast.error('Gagal memuat data pengguna')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleChangeRole() {
    if (!changeTarget || !newRole) return
    setChanging(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: changeTarget.id, role: newRole }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === changeTarget.id ? { ...u, role: newRole as UserType['role'] } : u
          )
        )
        toast.success(`Role ${changeTarget.nama} berhasil diubah ke ${roleConfig[newRole]?.label}`)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Gagal mengubah role')
      }
    } catch {
      toast.error('Gagal mengubah role')
    } finally {
      setChanging(false)
      setChangeTarget(null)
      setNewRole('')
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.nama.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
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

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p className="text-muted-foreground mt-2">Hanya Super Admin yang dapat mengelola hak akses</p>
      </div>
    )
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

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Hak Akses</h1>
          <p className="text-muted-foreground mt-1">{users.length} pengguna terdaftar</p>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(roleConfig).map(([key, config]) => {
          const Icon = config.icon
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roleCounts[key] || 0}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama, email, atau role..."
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
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role Saat Ini</TableHead>
                    <TableHead>Verifikasi</TableHead>
                    <TableHead className="text-right">Ubah Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Tidak ada pengguna ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const config = roleConfig[user.role] || roleConfig.CUSTOMER
                      const Icon = config.icon
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(user.nama)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.nama}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={config.color}>
                              <Icon className="w-3 h-3 mr-1" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.verified ? 'default' : 'secondary'}>
                              {user.verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              onOpenChange={() => setNewRole(user.role)}
                              value={user.role}
                              onValueChange={(value) => {
                                if (value !== user.role) {
                                  setChangeTarget(user)
                                  setNewRole(value)
                                }
                              }}
                            >
                              <SelectTrigger className="w-[140px]" disabled={user.id === session?.user?.id}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="OWNER">Owner</SelectItem>
                                <SelectItem value="CUSTOMER">Customer</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Tidak ada pengguna ditemukan
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => {
            const config = roleConfig[user.role] || roleConfig.CUSTOMER
            const Icon = config.icon
            return (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(user.nama)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm">{user.nama}</h3>
                        <Badge variant="outline" className={`${config.color} text-xs`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant={user.verified ? 'default' : 'secondary'} className="text-xs">
                          {user.verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                        </Badge>
                        <Select
                          value={user.role}
                          onValueChange={(value) => {
                            if (value !== user.role) {
                              setChangeTarget(user)
                              setNewRole(value)
                            }
                          }}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-xs" disabled={user.id === session?.user?.id}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="OWNER">Owner</SelectItem>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Change Role Confirmation Dialog */}
      <AlertDialog open={!!changeTarget} onOpenChange={(open) => { if (!open) { setChangeTarget(null); setNewRole('') } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ubah Role Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah role <strong>{changeTarget?.nama}</strong> dari{' '}
              <strong>{roleConfig[changeTarget?.role || '']?.label}</strong> ke{' '}
              <strong>{roleConfig[newRole]?.label}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={changing}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeRole} disabled={changing}>
              {changing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ubah Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
