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
import { signOut } from 'next-auth/react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const menuItems: { page: AdminPage; label: string; icon: React.ElementType; group: string }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Utama' },
  { page: 'vehicles', label: 'Data Mobil', icon: Car, group: 'Manajemen' },
  { page: 'customers', label: 'Data Customer', icon: Users, group: 'Manajemen' },
  { page: 'rentals', label: 'Data Rental', icon: ClipboardList, group: 'Manajemen' },
  { page: 'inspections', label: 'Data Inspeksi', icon: Scan, group: 'Inspeksi' },
  { page: 'detections', label: 'Hasil Deteksi', icon: Shield, group: 'Inspeksi' },
  { page: 'damage-verification', label: 'Verifikasi Kerusakan', icon: AlertTriangle, group: 'Inspeksi' },
  { page: 'rental-report', label: 'Laporan Rental', icon: FileText, group: 'Laporan' },
  { page: 'damage-report', label: 'Laporan Kerusakan', icon: AlertTriangle, group: 'Laporan' },
  { page: 'sus-report', label: 'Laporan SUS', icon: BarChart3, group: 'Laporan' },
  { page: 'ueq-report', label: 'Laporan UEQ', icon: Brain, group: 'Laporan' },
  { page: 'settings', label: 'Pengaturan', icon: Settings, group: 'Lainnya' },
]

const groups = ['Utama', 'Manajemen', 'Inspeksi', 'Laporan', 'Lainnya']

export default function AdminSidebar() {
  const { adminPage, setAdminPage } = useNavStore()
  const { data: session } = useSession()

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold text-base">
            Q
          </div>
          <div>
            <h1 className="text-base font-bold">QiaTrans</h1>
            <p className="text-[11px] text-sidebar-foreground/60">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
            <SidebarMenu>
              {menuItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon
                  const isActive = adminPage === item.page
                  return (
                    <SidebarMenuItem key={item.page}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setAdminPage(item.page)}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold shrink-0">
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
      </SidebarFooter>
    </Sidebar>
  )
}
