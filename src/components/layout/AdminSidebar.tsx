'use client'

import { useNavStore, type AdminPage } from '@/stores/navStore'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Car,
  Users,
  ClipboardList,
  Scan,
  Shield,
  FileText,
  AlertTriangle,
  BarChart3,
  Brain,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

const menuItems: { page: AdminPage; label: string; icon: React.ElementType; group: string }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Utama' },
  { page: 'vehicles', label: 'Data Mobil', icon: Car, group: 'Manajemen' },
  { page: 'customers', label: 'Data Customer', icon: Users, group: 'Manajemen' },
  { page: 'rentals', label: 'Data Rental', icon: ClipboardList, group: 'Manajemen' },
  { page: 'inspections', label: 'Data Inspeksi', icon: Scan, group: 'Inspeksi' },
  { page: 'detections', label: 'Hasil Deteksi', icon: Scan, group: 'Inspeksi' },
  { page: 'damage-verification', label: 'Verifikasi Kerusakan', icon: Shield, group: 'Inspeksi' },
  { page: 'rental-report', label: 'Laporan Rental', icon: FileText, group: 'Laporan' },
  { page: 'damage-report', label: 'Laporan Kerusakan', icon: AlertTriangle, group: 'Laporan' },
  { page: 'sus-report', label: 'Laporan SUS', icon: BarChart3, group: 'Laporan' },
  { page: 'ueq-report', label: 'Laporan UEQ', icon: Brain, group: 'Laporan' },
  { page: 'settings', label: 'Pengaturan', icon: Settings, group: 'Lainnya' },
]

export default function AdminSidebar() {
  const { adminPage, setAdminPage } = useNavStore()
  const { data: session } = useSession()

  const groups = ['Utama', 'Manajemen', 'Inspeksi', 'Laporan', 'Lainnya']

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 overflow-y-auto bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold text-lg">
          Q
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">QiaTrans</h1>
          <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-6">
        {groups.map((group) => (
          <div key={group}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {group}
            </p>
            <div className="space-y-0.5">
              {menuItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon
                  const isActive = adminPage === item.page

                  return (
                    <button
                      key={item.page}
                      onClick={() => setAdminPage(item.page)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
            {session?.user?.nama?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.nama || 'Admin'}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
