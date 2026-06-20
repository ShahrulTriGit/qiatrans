'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Camera,
  LogOut,
  Moon,
  Sun,
  FileText,
  Info,
  AlertTriangle,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useNavStore } from '@/stores/navStore'
import { toast } from 'sonner'

export default function ProfileScreen() {
  const { goBack } = useNavStore()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [editMode, setEditMode] = useState(false)
  const [uploadingKtp, setUploadingKtp] = useState(false)
  const [uploadingSim, setUploadingSim] = useState(false)
  const [form, setForm] = useState({
    nama: session?.user?.nama || '',
    email: session?.user?.email || '',
    noTelepon: '',
    alamat: '',
    noKTP: '',
    noSIM: '',
    fotoKTP: '',
    fotoSIM: '',
  })
  const ktpInputRef = useRef<HTMLInputElement>(null)
  const simInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user')
        if (res.ok) {
          const json = await res.json()
          const data = json.data
          if (data) {
            setForm((prev) => ({
              ...prev,
              nama: data.nama || prev.nama,
              email: data.email || prev.email,
              noTelepon: data.noTelepon || '',
              alamat: data.alamat || '',
              noKTP: data.noKTP || '',
              noSIM: data.noSIM || '',
              fotoKTP: data.fotoKTP || '',
              fotoSIM: data.fotoSIM || '',
            }))
          }
        }
      } catch {
        // silently fail — form keeps session defaults
      }
    }
    fetchUser()
  }, [])

  const handleUploadFile = async (file: File, type: 'ktp' | 'sim') => {
    const setUploading = type === 'ktp' ? setUploadingKtp : setUploadingSim
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadData.success) {
        toast.error(`Gagal mengupload ${type.toUpperCase()}`)
        return
      }
      const url = uploadData.data.url

      const saveRes = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type === 'ktp' ? 'fotoKTP' : 'fotoSIM']: url }),
      })
      const saveData = await saveRes.json()
      if (saveData.success !== false) {
        setForm((prev) => ({
          ...prev,
          [type === 'ktp' ? 'fotoKTP' : 'fotoSIM']: url,
        }))
        toast.success(`${type.toUpperCase()} berhasil diupload`)
      } else {
        toast.error(saveData.message || 'Gagal menyimpan')
      }
    } catch {
      toast.error(`Gagal mengupload ${type.toUpperCase()}`)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'sim') => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }
    handleUploadFile(file, type)
    e.target.value = ''
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama,
          noTelepon: form.noTelepon,
          alamat: form.alamat,
          noKTP: form.noKTP,
          noSIM: form.noSIM,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success !== false) {
        setForm((prev) => ({
          ...prev,
          nama: data.nama || prev.nama,
          noTelepon: data.noTelepon ?? prev.noTelepon,
          alamat: data.alamat ?? prev.alamat,
          noKTP: data.noKTP ?? prev.noKTP,
          noSIM: data.noSIM ?? prev.noSIM,
        }))
        setEditMode(false)
        toast.success('Profil berhasil diperbarui')
      } else {
        toast.error(data.message || 'Gagal memperbarui profil')
      }
    } catch {
      toast.error('Gagal memperbarui profil')
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    toast.success('Berhasil keluar')
  }

  const missingDocs = !form.fotoKTP || !form.fotoSIM
  const userInitial = session?.user?.nama
    ? session.user.nama.charAt(0).toUpperCase()
    : 'U'

  const profileItems = [
    {
      icon: Mail,
      label: 'Email',
      value: session?.user?.email || '-',
      field: 'email',
    },
    {
      icon: Phone,
      label: 'No. Telepon',
      value: form.noTelepon || '-',
      field: 'noTelepon',
    },
    {
      icon: MapPin,
      label: 'Alamat',
      value: form.alamat || '-',
      field: 'alamat',
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">Profil</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="rounded-xl"
          >
            <Edit3 className="w-4 h-4 mr-1.5" />
            {editMode ? 'Batal' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-4">
        {/* Document Warning */}
        {missingDocs && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-800">Lengkapi Dokumen</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Upload KTP dan SIM sebelum melakukan pemesanan mobil.
                {!form.fotoKTP && !form.fotoSIM
                  ? ' KTP dan SIM belum diupload.'
                  : !form.fotoKTP
                    ? ' KTP belum diupload.'
                    : ' SIM belum diupload.'}
              </p>
            </div>
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            {editMode && (
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <h2 className="text-lg font-bold mt-3">
            {session?.user?.nama || 'User'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {session?.user?.email || ''}
          </p>
        </div>

        {/* User Info */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-5">
            {editMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Nama</Label>
                  <Input
                    value={form.nama}
                    onChange={(e) =>
                      setForm({ ...form, nama: e.target.value })
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">No. Telepon</Label>
                  <Input
                    value={form.noTelepon}
                    onChange={(e) =>
                      setForm({ ...form, noTelepon: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Alamat</Label>
                  <Input
                    value={form.alamat}
                    onChange={(e) =>
                      setForm({ ...form, alamat: e.target.value })
                    }
                    placeholder="Masukkan alamat"
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  className="w-full h-11 rounded-xl font-semibold"
                >
                  Simpan Perubahan
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {profileItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="text-sm font-medium truncate">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload KTP/SIM */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold">Dokumen</h3>
            <input
              ref={ktpInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'ktp')}
            />
            <input
              ref={simInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'sim')}
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => ktpInputRef.current?.click()}
                disabled={uploadingKtp}
                className="flex flex-col items-center gap-2 p-4 border border-dashed rounded-xl hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                {form.fotoKTP ? (
                  <img src={form.fotoKTP} alt="KTP" className="w-full h-20 object-cover rounded-lg" />
                ) : (
                  <FileText className="w-6 h-6 text-muted-foreground" />
                )}
                <span className="text-xs font-medium text-muted-foreground">
                  {uploadingKtp ? 'Mengupload...' : form.fotoKTP ? 'Ganti KTP' : 'Upload KTP'}
                </span>
              </button>
              <button
                onClick={() => simInputRef.current?.click()}
                disabled={uploadingSim}
                className="flex flex-col items-center gap-2 p-4 border border-dashed rounded-xl hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                {form.fotoSIM ? (
                  <img src={form.fotoSIM} alt="SIM" className="w-full h-20 object-cover rounded-lg" />
                ) : (
                  <FileText className="w-6 h-6 text-muted-foreground" />
                )}
                <span className="text-xs font-medium text-muted-foreground">
                  {uploadingSim ? 'Mengupload...' : form.fotoSIM ? 'Ganti SIM' : 'Upload SIM'}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold">Pengaturan</h3>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Mode Gelap</p>
                  <p className="text-xs text-muted-foreground">
                    {theme === 'dark' ? 'Aktif' : 'Nonaktif'}
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'dark' : 'light')
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">QiaTrans</p>
                <p className="text-xs text-muted-foreground">
                  Versi 1.0.0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5 font-semibold"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </div>
    </div>
  )
}
