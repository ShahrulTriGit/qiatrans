'use client'

import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useNavStore } from '@/stores/navStore'
import { toast } from 'sonner'

export default function RegisterScreen() {
  const { setAuthPage, setCustomerPage } = useNavStore()
  const [form, setForm] = useState({
    nama: '',
    email: '',
    noTelepon: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.nama.trim()) errs.nama = 'Nama wajib diisi'
    if (!form.email.trim()) errs.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Format email tidak valid'
    if (!form.noTelepon.trim()) errs.noTelepon = 'No. Telepon wajib diisi'
    if (!form.password) errs.password = 'Password wajib diisi'
    else if (form.password.length < 6)
      errs.password = 'Password minimal 6 karakter'
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Password tidak cocok'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          noTelepon: form.noTelepon,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error('Registrasi gagal', {
          description: data.error || 'Terjadi kesalahan',
        })
        return
      }

      toast.success('Registrasi berhasil! Silakan login')

      setTimeout(() => {
        setAuthPage('login')
      }, 1500)
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => setAuthPage('login')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Daftar Akun</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buat akun baru untuk mulai menyewa mobil
          </p>
        </div>

        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium">
                  Nama Lengkap
                </Label>
                <Input
                  id="nama"
                  placeholder="Masukkan nama lengkap"
                  value={form.nama}
                  onChange={(e) => updateField('nama', e.target.value)}
                  className="h-11 rounded-xl"
                />
                {errors.nama && (
                  <p className="text-xs text-destructive">{errors.nama}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="h-11 rounded-xl"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="noTelepon" className="text-sm font-medium">
                  No. Telepon
                </Label>
                <Input
                  id="noTelepon"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={form.noTelepon}
                  onChange={(e) => updateField('noTelepon', e.target.value)}
                  className="h-11 rounded-xl"
                />
                {errors.noTelepon && (
                  <p className="text-xs text-destructive">{errors.noTelepon}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="h-11 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Konfirmasi Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField('confirmPassword', e.target.value)
                  }
                  className="h-11 rounded-xl"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-xl mt-2"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <button
              onClick={() => setAuthPage('login')}
              className="text-primary font-semibold hover:underline"
            >
              Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
