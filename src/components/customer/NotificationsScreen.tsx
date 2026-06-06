'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNavStore } from '@/stores/navStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Bell,
  BellOff,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import type { Notification, NotificationType } from '@/types'

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Rental Dikonfirmasi',
    message: 'Rental Toyota Avanza Anda telah dikonfirmasi. Silakan lakukan inspeksi sebelum rental.',
    type: 'SUCCESS',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    title: 'Deteksi Selesai',
    message: 'Inspeksi kendaraan Anda telah selesai. 2 lecet terdeteksi pada kendaraan.',
    type: 'INFO',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    title: 'Pengembalian Mendatang',
    message: 'Rental Anda akan berakhir besok. Jangan lupa melakukan inspeksi setelah rental.',
    type: 'WARNING',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    title: 'Kerusakan Baru Terdeteksi',
    message: 'Perbandingan inspeksi menunjukkan 1 lecet baru setelah rental. Silakan periksa laporan.',
    type: 'WARNING',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    title: 'Pembayaran Berhasil',
    message: 'Pembayaran rental sebesar Rp 350.000 telah berhasil diproses.',
    type: 'SUCCESS',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
]

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'INFO':
      return <Info className="size-5 text-blue-500" />
    case 'WARNING':
      return <AlertTriangle className="size-5 text-amber-500" />
    case 'SUCCESS':
      return <CheckCircle2 className="size-5 text-green-500" />
    case 'ERROR':
      return <XCircle className="size-5 text-red-500" />
    default:
      return <Bell className="size-5 text-gray-500" />
  }
}

function getNotificationBg(type: NotificationType) {
  switch (type) {
    case 'INFO':
      return 'bg-blue-50'
    case 'WARNING':
      return 'bg-amber-50'
    case 'SUCCESS':
      return 'bg-green-50'
    case 'ERROR':
      return 'bg-red-50'
    default:
      return 'bg-gray-50'
  }
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7) return `${days} hari lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function NotificationsScreen() {
  const { data: session } = useSession()
  const { goBack } = useNavStore()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()

      if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
        setNotifications(data.data)
      } else {
        setNotifications(MOCK_NOTIFICATIONS)
      }
    } catch {
      setNotifications(MOCK_NOTIFICATIONS)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    } catch {
      // API may not exist yet
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('Semua notifikasi ditandai sebagai dibaca')
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md">
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary/80"
          onClick={goBack}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-lg font-semibold">Notifikasi</h1>
        {unreadCount > 0 && (
          <Badge className="bg-white text-primary ml-auto text-xs">
            {unreadCount} baru
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-3 max-w-lg mx-auto pb-8">
        {/* Actions */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              onClick={markAllAsRead}
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              Tandai semua dibaca
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notifications.length === 0 && (
          <Card>
            <CardContent className="p-8 flex flex-col items-center gap-3">
              <BellOff className="size-12 text-muted-foreground" />
              <p className="font-semibold text-muted-foreground">Belum ada notifikasi</p>
              <p className="text-xs text-muted-foreground text-center">
                Notifikasi terkait rental dan inspeksi Anda akan muncul di sini
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notification Cards */}
        {!isLoading && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notif.read ? 'border-l-4 border-l-primary' : ''
                }`}
                onClick={() => {
                  if (!notif.read) markAsRead(notif.id)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`size-10 rounded-full flex items-center justify-center shrink-0 ${getNotificationBg(notif.type)}`}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm font-semibold truncate ${!notif.read ? '' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <div className="size-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="size-3" />
                        {formatTimeAgo(notif.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
