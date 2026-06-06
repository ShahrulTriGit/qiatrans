'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  BarChart3,
  UserCheck,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SUSResult } from '@/types'

function getScoreInterpretation(score: number) {
  if (score >= 85.5) return { label: 'Excellent', color: 'text-success', bg: 'bg-success/10' }
  if (score >= 72.5) return { label: 'Good', color: 'text-info', bg: 'bg-info/10' }
  if (score >= 52.5) return { label: 'OK', color: 'text-warning', bg: 'bg-warning/10' }
  if (score >= 32.5) return { label: 'Poor', color: 'text-destructive', bg: 'bg-destructive/10' }
  return { label: 'Worst Imaginable', color: 'text-destructive', bg: 'bg-destructive/10' }
}

function getScoreColor(score: number) {
  if (score >= 85.5) return 'oklch(0.55 0.17 145)'
  if (score >= 72.5) return 'oklch(0.55 0.15 230)'
  if (score >= 52.5) return 'oklch(0.70 0.17 75)'
  if (score >= 32.5) return 'oklch(0.577 0.245 27.325)'
  return 'oklch(0.45 0.20 20)'
}

export default function SUSReportScreen() {
  const [results, setResults] = useState<SUSResult[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/sus')
      if (res.ok) {
        const data = await res.json()
        setResults(data.data || [])
      }
    } catch {
      toast.error('Gagal memuat data SUS')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const averageScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.skor, 0) / results.length
    : 0

  const interpretation = getScoreInterpretation(averageScore)

  // Distribution chart data - score ranges
  const ranges = [
    { range: '0-20', min: 0, max: 20 },
    { range: '20-40', min: 20, max: 40 },
    { range: '40-60', min: 40, max: 60 },
    { range: '60-80', min: 60, max: 80 },
    { range: '80-100', min: 80, max: 100 },
  ]

  const distributionData = ranges.map((range) => ({
    range: range.range,
    count: results.filter((r) => r.skor >= range.min && r.skor < range.max).length +
      (range.max === 100 ? results.filter((r) => r.skor === 100).length : 0),
  }))

  // Gauge percentage
  const gaugePercent = Math.min(100, Math.max(0, averageScore))

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted rounded animate-pulse" /></CardContent></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Laporan SUS</h1>
        <p className="text-muted-foreground mt-1">System Usability Scale - {results.length} responden</p>
      </div>

      {/* Average Score Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Gauge */}
            <div className="relative w-48 h-48 shrink-0">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background arc */}
                <circle
                  cx="100" cy="100" r="80"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="16"
                  strokeDasharray="376.99 125.66"
                  strokeLinecap="round"
                  transform="rotate(135 100 100)"
                />
                {/* Filled arc */}
                <circle
                  cx="100" cy="100" r="80"
                  fill="none"
                  stroke={getScoreColor(averageScore)}
                  strokeWidth="16"
                  strokeDasharray={`${(gaugePercent / 100) * 376.99} 502.65`}
                  strokeLinecap="round"
                  transform="rotate(135 100 100)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{averageScore.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>

            {/* Interpretation */}
            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-lg font-semibold">Skor Rata-rata SUS</h3>
              <Badge className={`${interpretation.bg} ${interpretation.color} text-lg px-4 py-1`} variant="outline">
                {interpretation.label}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Berdasarkan {results.length} responden
              </p>
              <div className="text-xs text-muted-foreground space-y-0.5 mt-2">
                <p>0-32.5: Worst Imaginable</p>
                <p>32.5-52.5: Poor</p>
                <p>52.5-72.5: OK</p>
                <p>72.5-85.5: Good</p>
                <p>85.5-100: Excellent</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribusi Skor SUS</CardTitle>
          <CardDescription>Jumlah responden per rentang skor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="range" tick={{ fill: 'var(--muted-foreground)' }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
                <Bar dataKey="count" fill="oklch(0.45 0.15 250)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Individual Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hasil Individu</CardTitle>
          <CardDescription>Detail skor setiap responden</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Responden</TableHead>
                  <TableHead>Rental ID</TableHead>
                  <TableHead className="text-center">Q1-Q5</TableHead>
                  <TableHead className="text-center">Q6-Q10</TableHead>
                  <TableHead className="text-right">Skor SUS</TableHead>
                  <TableHead>Interpretasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data SUS
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((result) => {
                    const interp = getScoreInterpretation(result.skor)
                    return (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">
                          {result.user?.nama || `User ${result.userId.slice(0, 6)}`}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{result.rentalId.slice(0, 8)}...</TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {result.q1},{result.q2},{result.q3},{result.q4},{result.q5}
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {result.q6},{result.q7},{result.q8},{result.q9},{result.q10}
                        </TableCell>
                        <TableCell className="text-right font-bold">{result.skor.toFixed(1)}</TableCell>
                        <TableCell>
                          <Badge className={`${interp.bg} ${interp.color}`} variant="outline">
                            {interp.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
