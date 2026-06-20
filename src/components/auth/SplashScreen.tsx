'use client'

import { useEffect } from 'react'
import { Car } from 'lucide-react'
import { useNavStore } from '@/stores/navStore'

export default function SplashScreen() {
  const setAuthPage = useNavStore((s) => s.setAuthPage)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthPage('onboarding')
    }, 2500)
    return () => clearTimeout(timer)
  }, [setAuthPage])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-qia-dark to-primary">
      <div className="animate-pulse-slow flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-150" />
          <div className="relative bg-white/15 backdrop-blur-sm rounded-3xl p-6">
            <Car className="w-20 h-20 text-white" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            QiaTrans
          </h1>
          <p className="text-white/70 text-base font-light tracking-wide">
            Rental Mobil Cerdas
          </p>
        </div>
      </div>

      <div className="absolute bottom-12 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-white/40"
            style={{
              animation: `pulse 1.4s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
