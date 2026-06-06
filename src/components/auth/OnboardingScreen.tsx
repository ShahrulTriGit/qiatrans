'use client'

import { useState } from 'react'
import { Car, Camera, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavStore } from '@/stores/navStore'

const steps = [
  {
    icon: Car,
    title: 'Rental Mobil Mudah',
    description:
      'Pilih dan sewa mobil impian Anda dengan proses yang cepat dan mudah. Berbagai pilihan kendaraan tersedia untuk kebutuhan Anda.',
    gradient: 'from-qia-dark to-primary',
  },
  {
    icon: Camera,
    title: 'Inspeksi Digital',
    description:
      'Lakukan inspeksi kendaraan secara digital sebelum dan sesudah rental. Dokumentasi lengkap dan terstruktur.',
    gradient: 'from-primary to-qia',
  },
  {
    icon: ScanLine,
    title: 'Deteksi Lecet AI',
    description:
      'Teknologi AI canggih untuk mendeteksi lecet dan kerusakan pada kendaraan secara otomatis dengan akurasi tinggi.',
    gradient: 'from-qia to-qia-dark',
  },
]

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0)
  const setAuthPage = useNavStore((s) => s.setAuthPage)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setAuthPage('login')
    }
  }

  const handleSkip = () => {
    setAuthPage('login')
  }

  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Icon Area */}
        <div
          className={`w-40 h-40 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-10 shadow-lg transition-all duration-500`}
        >
          <Icon className="w-20 h-20 text-white" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="text-center animate-fade-in" key={currentStep}>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {step.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            {step.description}
          </p>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center gap-2 mt-10">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-6 pb-8 flex flex-col gap-3">
        <Button onClick={handleNext} className="w-full h-12 text-base font-semibold rounded-xl">
          {currentStep === steps.length - 1 ? 'Mulai' : 'Selanjutnya'}
        </Button>
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Lewati
        </button>
      </div>
    </div>
  )
}
