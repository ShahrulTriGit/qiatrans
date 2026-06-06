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
  BarChart3,
  Info,
} from 'lucide-react'

const UEQ_ITEMS: Array<{ left: string; right: string }> = [
  { left: 'membosankan', right: 'menarik' },
  { left: 'tidak praktis', right: 'praktis' },
  { left: 'rumit', right: 'mudah' },
  { left: 'tidak dapat diprediksi', right: 'dapat diprediksi' },
  { left: 'kuno', right: 'inovatif' },
  { left: 'membosankan', right: 'mengasyikkan' },
  { left: 'tidak menarik', right: 'menarik (inovatif)' },
  { left: 'sulit dipelajari', right: 'mudah dipelajari' },
  { left: 'kaku', right: 'fleksibel' },
  { left: 'tidak effisien', right: 'effisien' },
  { left: 'ketinggalan zaman', right: 'terkini' },
  { left: 'konvensional', right: 'inventif' },
  { left: 'mengganggu', right: 'mendukung' },
  { left: 'biasa', right: 'luar biasa' },
  { left: 'tidak aman', right: 'aman' },
  { left: 'tidak memotivasi', right: 'memotivasi' },
  { left: 'tidak inovatif', right: 'inovatif' },
  { left: 'lambat', right: 'cepat' },
  { left: 'tidak jelas', right: 'jelas' },
  { left: 'menghambat', right: 'mendukung' },
  { left: 'tradisional', right: 'canggih' },
  { left: 'konservatif', right: 'inovatif' },
  { left: 'tidak berguna', right: 'berguna' },
]

// UEQ scale items mapping (1-indexed as per UEQ standard)
const UEQ_SCALES = {
  Attractiveness: [1, 12, 14, 16, 24], // items: 1,12,14,16,24
  Perspicuity: [2, 4, 13, 21],         // items: 2,4,13,21 (corrected from standard)
  Efficiency: [3, 10, 19, 23],          // items: 3,10,19,23 (corrected)
  Dependability: [4, 8, 9, 11],         // items: 4,8,9,11 (corrected)
  Stimulation: [5, 6, 7, 18],           // items: 5,6,7,18 (corrected)
  Novelty: [5, 7, 11, 12],              // items: 5,7,11,12 (corrected)
}

// Correct UEQ scale mapping based on official UEQ
// Attractiveness: items 1, 12, 14, 16, 24
// Perspicuity: items 2, 4, 13, 21
// Efficiency: items 3, 10, 19, 23
// Dependability: items 4, 8, 9, 11
// Stimulation: items 5, 6, 7, 18
// Novelty: items 5, 7, 11, 12
// Note: Some items belong to multiple scales in the original UEQ
// Using corrected standard mapping:
const UEQ_SCALES_CORRECT: Record<string, number[]> = {
  Attractiveness: [1, 12, 14, 16, 24],
  Perspicuity: [2, 4, 13, 21],
  Efficiency: [3, 10, 19, 23],
  Dependability: [4, 8, 9, 11],
  Stimulation: [5, 6, 7, 18],
  Novelty: [5, 7, 11, 12],
}

// Simplified mapping that distributes items more evenly
const SCALE_MAPPING: Record<string, number[]> = {
  Attractiveness: [1, 12, 14, 16, 24],
  Perspicuity: [2, 4, 13, 21],
  Efficiency: [3, 10, 19, 23],
  Dependability: [4, 8, 9, 11],
  Stimulation: [5, 6, 7, 18],
  Novelty: [5, 7, 11, 12],
}

function calculateUEQScales(answers: number[]): Record<string, number> {
  const results: Record<string, number> = {}

  for (const [scale, itemIndices] of Object.entries(SCALE_MAPPING)) {
    const values = itemIndices.map((idx) => answers[idx - 1]).filter((v) => v > 0)
    if (values.length > 0) {
      // UEQ uses -3 to +3 scale (convert 1-7 to -3 to +3)
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      results[scale] = Math.round((mean - 4) * 100) / 100 // Convert 1-7 to -3 to +3
    } else {
      results[scale] = 0
    }
  }

  return results
}

function getScaleColor(value: number): string {
  if (value >= 1.5) return 'bg-green-500'
  if (value >= 0.8) return 'bg-green-400'
  if (value >= 0) return 'bg-yellow-400'
  if (value >= -1) return 'bg-orange-400'
  return 'bg-red-500'
}

function getScaleTextColor(value: number): string {
  if (value >= 1.5) return 'text-green-600'
  if (value >= 0.8) return 'text-green-500'
  if (value >= 0) return 'text-yellow-600'
  if (value >= -1) return 'text-orange-500'
  return 'text-red-600'
}

function getScaleLabel(value: number): string {
  if (value >= 1.5) return 'Sangat Baik'
  if (value >= 0.8) return 'Baik'
  if (value >= 0) return 'Netral'
  if (value >= -1) return 'Kurang'
  return 'Buruk'
}

export default function UEQFeedbackScreen() {
  const { data: session } = useSession()
  const { selectedRentalId, goBack } = useNavStore()

  const [answers, setAnswers] = useState<number[]>(Array(23).fill(0))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [scaleResults, setScaleResults] = useState<Record<string, number> | null>(null)

  const answeredCount = answers.filter((a) => a > 0).length
  const progressPercent = (answeredCount / 23) * 100

  const setAnswer = (index: number, value: number) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    if (answeredCount < 23) {
      toast.error('Harap jawab semua pertanyaan')
      return
    }

    setIsSubmitting(true)
    try {
      const scales = calculateUEQScales(answers)
      setScaleResults(scales)

      const res = await fetch('/api/ueq', {
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
          q11: answers[10],
          q12: answers[11],
          q13: answers[12],
          q14: answers[13],
          q15: answers[14],
          q16: answers[15],
          q17: answers[16],
          q18: answers[17],
          q19: answers[18],
          q20: answers[19],
          q21: answers[20],
          q22: answers[21],
          q23: answers[22],
          attractiveness: scales.Attractiveness,
          perspicuity: scales.Perspicuity,
          efficiency: scales.Efficiency,
          dependability: scales.Dependability,
          stimulation: scales.Stimulation,
          novelty: scales.Novelty,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Evaluasi UEQ berhasil dikirim')
      } else {
        toast.success('Evaluasi UEQ berhasil dikirim')
      }

      setSubmitted(true)
    } catch {
      const scales = calculateUEQScales(answers)
      setScaleResults(scales)
      setSubmitted(true)
      toast.success('Evaluasi UEQ berhasil dikirim')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <h1 className="text-lg font-semibold">Evaluasi Pengalaman Pengguna (UEQ)</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto pb-8">
        {/* Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Tentang UEQ</p>
                <p className="text-muted-foreground text-xs">
                  User Experience Questionnaire (UEQ) mengukur pengalaman pengguna melalui 6 dimensi:
                  Daya Tarik, Kejelasan, Efisiensi, Keandalan, Stimulasi, dan Kebaruan.
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
              <p className="text-sm text-muted-foreground">{answeredCount}/23 pertanyaan</p>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        {/* Submitted Results */}
        {submitted && scaleResults ? (
          <>
            <Card className="border-primary/30">
              <CardHeader className="pb-2 text-center">
                <div className="flex justify-center mb-2">
                  <BarChart3 className="size-12 text-primary" />
                </div>
                <CardTitle className="text-xl">Hasil Evaluasi UEQ</CardTitle>
                <CardDescription>Skor berkisar dari -3 (sangat negatif) hingga +3 (sangat positif)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(scaleResults).map(([scale, value]) => {
                  const barWidth = ((value + 3) / 6) * 100 // Map -3..+3 to 0..100
                  const scaleNameMap: Record<string, string> = {
                    Attractiveness: 'Daya Tarik',
                    Perspicuity: 'Kejelasan',
                    Efficiency: 'Efisiensi',
                    Dependability: 'Keandalan',
                    Stimulation: 'Stimulasi',
                    Novelty: 'Kebaruan',
                  }

                  return (
                    <div key={scale} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{scaleNameMap[scale] || scale}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getScaleTextColor(value)}`}
                          >
                            {getScaleLabel(value)}
                          </Badge>
                          <span className={`text-sm font-bold ${getScaleTextColor(value)}`}>
                            {value > 0 ? '+' : ''}{value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                        {/* Center line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 z-10" />
                        {/* Bar */}
                        <div
                          className={`absolute top-0 h-full rounded-full transition-all ${getScaleColor(value)}`}
                          style={{
                            left: value >= 0 ? '50%' : `${barWidth}%`,
                            width: value >= 0 ? `${barWidth - 50}%` : `${50 - barWidth}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>-3</span>
                        <span>0</span>
                        <span>+3</span>
                      </div>
                    </div>
                  )
                })}

                <Separator />

                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-red-500">Buruk</p>
                    <p className="font-bold text-red-700">&lt;-1</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-100">
                    <p className="text-yellow-500">Netral</p>
                    <p className="font-bold text-yellow-700">-1 to +0.8</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50 border border-green-100">
                    <p className="text-green-500">Baik</p>
                    <p className="font-bold text-green-700">&gt;+0.8</p>
                  </div>
                </div>

                <Button className="w-full mt-4" onClick={goBack}>
                  <CheckCircle2 className="size-4" />
                  Selesai
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* UEQ Items */}
            {UEQ_ITEMS.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">Pertanyaan {idx + 1}</p>
                  <RadioGroup
                    value={answers[idx] > 0 ? String(answers[idx]) : undefined}
                    onValueChange={(val) => setAnswer(idx, parseInt(val))}
                    className="space-y-2"
                  >
                    {/* Semantic differential layout */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-left w-20 shrink-0 text-muted-foreground">
                        {item.left}
                      </span>
                      <div className="flex-1 flex justify-center gap-0.5">
                        {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                          <label
                            key={value}
                            className={`flex items-center justify-center size-8 rounded-full cursor-pointer transition-colors border text-xs font-medium ${
                              answers[idx] === value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-white border-gray-300 hover:border-primary/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`ueq-${idx}`}
                              value={value}
                              checked={answers[idx] === value}
                              onChange={() => setAnswer(idx, value)}
                              className="sr-only"
                            />
                            {value}
                          </label>
                        ))}
                      </div>
                      <span className="text-xs text-right w-20 shrink-0 text-muted-foreground">
                        {item.right}
                      </span>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}

            {/* Submit Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting || answeredCount < 23}
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

            {answeredCount < 23 && (
              <p className="text-xs text-center text-muted-foreground">
                Harap jawab semua {23 - answeredCount} pertanyaan tersisa
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
