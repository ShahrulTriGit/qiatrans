'use client'

import { SessionProvider } from 'next-auth/react'
import AppShell from '@/components/layout/AppShell'

export default function Home() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  )
}
