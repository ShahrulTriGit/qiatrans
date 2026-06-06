'use client'

import { useState } from 'react'
import { Car, Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useNavStore } from '@/stores/navStore'
import { toast } from 'sonner'

export default function LoginScreen() {
  const { setAuthPage, setCustomerPage, setAdminPage } = useNavStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email atau password salah')
        toast.error('Login gagal', { description: 'Email atau password salah' })
      } else if (result?.ok) {
        toast.success('Login berhasil!')
        // Re-fetch session to get role
        const res = await fetch('/api/auth/session')
        const session = await res.json()
        if (session?.user?.role === 'ADMIN') {
          setAdminPage('dashboard')
        } else {
          setCustomerPage('home')
        }
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-qia-dark to-primary px-6 pt-14 pb-10 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2">
            <Car className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-2xl font-bold text-white">QiaTrans</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Selamat Datang!</h1>
        <p className="text-white/70 text-sm mt-1">
          Masuk ke akun Anda untuk melanjutkan
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 -mt-6">
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-3 text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setAuthPage('forgot-password')}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Lupa Password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-xl"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 pb-8">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <button
              onClick={() => setAuthPage('register')}
              className="text-primary font-semibold hover:underline"
            >
              Daftar
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
