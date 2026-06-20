'use client'

import { useNavStore, type CustomerPage } from '@/stores/navStore'
import { Home, Car, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems: { page: CustomerPage; label: string; icon: React.ElementType }[] = [
  { page: 'home', label: 'Beranda', icon: Home },
  { page: 'my-rentals', label: 'Rental', icon: Car },
  { page: 'rental-history', label: 'Riwayat', icon: Clock },
  { page: 'profile', label: 'Profil', icon: User },
]

export default function BottomNav() {
  const { customerPage, setCustomerPage } = useNavStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = customerPage === item.page ||
            (item.page === 'home' && ['vehicle-list', 'vehicle-detail', 'booking', 'notifications'].includes(customerPage)) ||
            (item.page === 'rental-history' && ['sus-feedback', 'ueq-feedback', 'rental-history'].includes(customerPage))

          return (
            <button
              key={item.page}
              onClick={() => setCustomerPage(item.page)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-2 transition-all duration-200 min-w-0 flex-1',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-bold')}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
