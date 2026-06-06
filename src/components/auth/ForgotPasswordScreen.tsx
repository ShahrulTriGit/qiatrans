'use client'

import { useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useNavStore } from '@/stores/navStore'
import { toast } from 'sonner'

export default function ForgotPasswordScreen() {
  const setAuthPage = useNavStore((s) => s.setAuthPage)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Email wajib diisi')
      return
    }

    setLoading(true)
    // Simulate sending reset link
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLoading(false)
    setSent(true)
    toast.success('Link reset password telah dikirim', {
      description: 'Silakan cek email Anda',
    })
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
          <h1 className="text-2xl font-bold">Lupa Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Masukkan email Anda untuk menerima link reset password
          </p>
        </div>

        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex justify-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fp-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="fp-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  disabled={loading}
                >
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-success" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">Email Terkirim!</h3>
                <p className="text-sm text-muted-foreground">
                  Link reset password telah dikirim ke <strong>{email}</strong>.
                  Silakan cek inbox email Anda.
                </p>
                <Button
                  onClick={() => setAuthPage('login')}
                  className="w-full h-12 text-base font-semibold rounded-xl mt-4"
                >
                  Kembali ke Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => setAuthPage('login')}
            className="text-sm text-primary font-semibold hover:underline"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  )
}
