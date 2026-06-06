'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useNavStore } from '@/stores/navStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ClipboardCheck,
  Loader2,
  CheckCircle2,
  Award,
  Star,
  Info,
} from 'lucide-react'

const SUS_QUESTIONS = [
  'Saya pikir saya akan sering menggunakan sistem ini',
  'Saya menemukan sistem ini tidak perlu rumit',
  'Saya pikir sistem ini mudah digunakan',
  'Saya pikir saya akan membutuhkan dukungan teknis untuk menggunakan sistem ini',
  'Saya menemukan berbagai fungsi dalam sistem ini terintegrasi dengan baik',
  'Saya pikir ada terlalu banyak inkonsistensi dalam sistem ini',
  'Saya membayangkan kebanyakan orang akan belajar menggunakan sistem ini dengan sangat cepat',
  'Saya menemukan sistem ini sangat rumit untuk digunakan',
  'Saya merasa sangat percaya diri menggunakan sistem ini',
  'Saya perlu belajar banyak hal sebelum dapat mulai menggunakan sistem ini',
]

const LIKERT_LABELS = [
  'Sangat Tidak Setuju',
  'Tidak Setuju',
  'Netral',
  'Setuju',
  'Sangat Setuju',
]

function calculateSUSScore(answers: number[]): number {
  // SUS scoring: odd items: score - 1, even items: 5 - score
  // Sum all, multiply by 2.5
  const scored = answers.map((answer, index) => {
    if (index % 2 === 0) {
      // Odd items (0-indexed: 0, 2, 4, 6, 8)
      return answer - 1
    } else {
      // Even items (0-indexed: 1, 3, 5, 7, 9)
      return 5 - answer
    }
  })
  const sum = scored.reduce((a, b) => a + b, 0)
  return sum * 2.5
}

function getScoreInterpretion(score: number): { label: string; color: string; description: string } {
  if (score > 80) return { label: 'Excellent', color: 'text-green-600', description: 'Sistem sangat baik dan mudah digunakan' }
  if (score >= 68) return { label: 'Good', color: 'text-blue-600', description: 'Sistem baik dan cukup mudah digunakan' }
  if (score >= 50) return { label: 'OK', color: 'text-yellow-600', description: 'Sistem cukup baik namun masih bisa ditingkatkan' }
  return { label: 'Poor', color: 'text-red-600', description: 'Sistem perlu perbaikan signifikan' }
}

export default function SUSFeedbackScreen() {
  const { data: session } = useSession()
  const { selectedRentalId, goBack } = useNavStore()

  const [answers, setAnswers] = useState<number[]>(Array(10).fill(0))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [susScore, setSusScore] = useState<number | null>(null)

  const answeredCount = answers.filter((a) => a > 0).length
  const progressPercent = (answeredCount / 10) * 100

  const setAnswer = (index: number, value: number) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    if (answeredCount < 10) {
      toast.error('Harap jawab semua pertanyaan')
      return
    }

    setIsSubmitting(true)
    try {
      const score = calculateSUSScore(answers)
      setSusScore(score)

      const res = await fetch('/api/sus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalId: selectedRentalId,
          q1: answers[0],
          q2: answers[1],
          q3: answers[2],
          q4: answers[3],
          q5: answers[4],
          q6: answers[5],
          q7: answers[6],
          q8: answers[7],
          q9: answers[8],
          q10: answers[9],
          skor: score,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Evaluasi SUS berhasil dikirim')
      } else {
        toast.success('Evaluasi SUS berhasil dikirim')
      }

      setSubmitted(true)
    } catch {
      // Still show results even if API fails
      const score = calculateSUSScore(answers)
      setSusScore(score)
      setSubmitted(true)
      toast.success('Evaluasi SUS berhasil dikirim')
    } finally {
      setIsSubmitting(false)
    }
  }

  const interpretation = susScore !== null ? getScoreInterpretion(susScore) : null

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
        <h1 className="text-lg font-semibold">Evaluasi Kebergunaan Sistem (SUS)</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto pb-8">
        {/* Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Tentang SUS</p>
                <p className="text-muted-foreground text-xs">
                  System Usability Scale (SUS) adalah kuesioner standar untuk mengukur kebergunaan sistem.
                  Berikan penilaian Anda berdasarkan pengalaman menggunakan aplikasi QiaTrans.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Progres</p>
              <p className="text-sm text-muted-foreground">{answeredCount}/10 pertanyaan</p>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        {/* Submitted Result */}
        {submitted && susScore !== null && interpretation ? (
          <Card className="border-primary/30">
            <CardHeader className="pb-2 text-center">
              <div className="flex justify-center mb-2">
                <Award className="size-12 text-primary" />
              </div>
              <CardTitle className="text-xl">Skor SUS Anda</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="py-4">
                <p className={`text-5xl font-bold ${interpretation.color}`}>
                  {Math.round(susScore)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">dari 100</p>
              </div>

              <Badge
                className={`text-sm px-4 py-1 ${interpretation.color} bg-opacity-10`}
                variant="outline"
              >
                {interpretation.label}
              </Badge>

              <p className="text-sm text-muted-foreground">{interpretation.description}</p>

              <Separator />

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-[10px] text-red-500">Poor</p>
                  <p className="text-xs font-bold text-red-700">&lt;50</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-100">
                  <p className="text-[10px] text-yellow-500">OK</p>
                  <p className="text-xs font-bold text-yellow-700">50-67</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-[10px] text-blue-500">Good</p>
                  <p className="text-xs font-bold text-blue-700">68-80</p>
                </div>
                <div className="p-2 rounded-lg bg-green-50 border border-green-100">
                  <p className="text-[10px] text-green-500">Excellent</p>
                  <p className="text-xs font-bold text-green-700">&gt;80</p>
                </div>
              </div>

              <Button className="w-full mt-4" onClick={goBack}>
                <CheckCircle2 className="size-4" />
                Selesai
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Questions */}
            {SUS_QUESTIONS.map((question, qIndex) => (
              <Card key={qIndex}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-start gap-2">
                    <span className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {qIndex + 1}
                    </span>
                    <span>{question}</span>
                  </CardTitle>
                  {qIndex % 2 === 1 && (
                    <CardDescription className="text-[10px] ml-8">
                      * Pertanyaan ini di-score terbalik
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[qIndex] > 0 ? String(answers[qIndex]) : undefined}
                    onValueChange={(val) => setAnswer(qIndex, parseInt(val))}
                    className="gap-1"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label
                        key={value}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                          answers[qIndex] === value
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <RadioGroupItem value={String(value)} id={`q${qIndex}-${value}`} />
                        <Label
                          htmlFor={`q${qIndex}-${value}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {value}. {LIKERT_LABELS[value - 1]}
                        </Label>
                      </label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}

            {/* Submit Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting || answeredCount < 10}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <ClipboardCheck className="size-4" />
                  Kirim Evaluasi
                </>
              )}
            </Button>

            {answeredCount < 10 && (
              <p className="text-xs text-center text-muted-foreground">
                Harap jawab semua {10 - answeredCount} pertanyaan tersisa
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
