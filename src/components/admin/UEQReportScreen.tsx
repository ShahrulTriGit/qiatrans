'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import type { UEQResult } from '@/types'

const UEQ_SCALES = [
  { key: 'attractiveness' as const, label: 'Attractiveness', color: 'oklch(0.45 0.15 250)' },
  { key: 'perspicuity' as const, label: 'Perspicuity', color: 'oklch(0.55 0.17 145)' },
  { key: 'efficiency' as const, label: 'Efficiency', color: 'oklch(0.70 0.17 75)' },
  { key: 'dependability' as const, label: 'Dependability', color: 'oklch(0.55 0.15 230)' },
  { key: 'stimulation' as const, label: 'Stimulation', color: 'oklch(0.65 0.18 45)' },
  { key: 'novelty' as const, label: 'Novelty', color: 'oklch(0.70 0.15 200)' },
]

function getScoreColor(score: number) {
  if (score >= 1.5) return 'text-success'
  if (score >= 0.8) return 'text-info'
  if (score >= 0.0) return 'text-warning'
  return 'text-destructive'
}

function getScoreLabel(score: number) {
  if (score >= 1.5) return 'Excellent'
  if (score >= 0.8) return 'Good'
  if (score >= 0.0) return 'Neutral'
  return 'Below Average'
}

// UEQ scores range from -3 to +3
function getScoreBadgeVariant(score: number) {
  if (score >= 1.5) return 'bg-success/10 text-success border-success/20'
  if (score >= 0.8) return 'bg-info/10 text-info border-info/20'
  if (score >= 0.0) return 'bg-warning/10 text-warning border-warning/20'
  return 'bg-destructive/10 text-destructive border-destructive/20'
}

export default function UEQReportScreen() {
  const [results, setResults] = useState<UEQResult[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/ueq')
      if (res.ok) {
        const data = await res.json()
        setResults(data.data || [])
      }
    } catch {
      toast.error('Gagal memuat data UEQ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const filteredResults = results.filter((r) => {
    if (dateFrom && r.createdAt < dateFrom) return false
    if (dateTo && r.createdAt > dateTo + 'T23:59:59') return false
    return true
  })

  // Calculate average scores for each scale
  const averages = UEQ_SCALES.map((scale) => {
    const values = filteredResults.map((r) => r[scale.key])
    const avg = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
    return {
      dimension: scale.label,
      score: parseFloat(avg.toFixed(2)),
      fullMark: 3,
    }
  })

  function handleExport() {
    const headers = ['ID', 'Responden', 'Rental ID', 'Attractiveness', 'Perspicuity', 'Efficiency', 'Dependability', 'Stimulation', 'Novelty', 'Tanggal']
    const rows = filteredResults.map((r) => [
      r.id,
      r.user?.nama || '-',
      r.rentalId,
      r.attractiveness.toFixed(2),
      r.perspicuity.toFixed(2),
      r.efficiency.toFixed(2),
      r.dependability.toFixed(2),
      r.stimulation.toFixed(2),
      r.novelty.toFixed(2),
      r.createdAt,
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ueq-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Laporan UEQ berhasil diekspor')
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan UEQ</h1>
          <p className="text-muted-foreground mt-1">User Experience Questionnaire - {filteredResults.length} responden</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Ekspor CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Dari Tanggal</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Sampai Tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="shrink-0"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart & Average Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profil UEQ</CardTitle>
            <CardDescription>Skor rata-rata 6 dimensi UEQ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={averages} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[-3, 3]}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                  />
                  <Radar
                    name="Skor Rata-rata"
                    dataKey="score"
                    stroke="oklch(0.45 0.15 250)"
                    fill="oklch(0.45 0.15 250)"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Score Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skor Rata-rata per Dimensi</CardTitle>
            <CardDescription>Interpretasi berdasarkan benchmark UEQ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {UEQ_SCALES.map((scale, idx) => {
              const avg = averages[idx].score
              return (
                <div key={scale.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scale.color }} />
                    <span className="font-medium text-sm">{scale.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getScoreColor(avg)}`}>
                      {avg.toFixed(2)}
                    </span>
                    <Badge className={getScoreBadgeVariant(avg)} variant="outline">
                      {getScoreLabel(avg)}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Individual Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hasil Individu</CardTitle>
          <CardDescription>Detail skor setiap responden</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Responden</TableHead>
                  <TableHead className="text-center">Attract.</TableHead>
                  <TableHead className="text-center">Persp.</TableHead>
                  <TableHead className="text-center">Effic.</TableHead>
                  <TableHead className="text-center">Depend.</TableHead>
                  <TableHead className="text-center">Stimul.</TableHead>
                  <TableHead className="text-center">Novelty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada data UEQ
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.user?.nama || `User ${result.userId.slice(0, 6)}`}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(result.attractiveness)}>{result.attractiveness.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(result.perspicuity)}>{result.perspicuity.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(result.efficiency)}>{result.efficiency.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(result.dependability)}>{result.dependability.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(result.stimulation)}>{result.stimulation.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(result.novelty)}>{result.novelty.toFixed(2)}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3 max-h-96 overflow-y-auto">
            {filteredResults.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Tidak ada data UEQ</p>
            ) : (
              filteredResults.map((result) => (
                <div key={result.id} className="p-4 border border-border rounded-lg">
                  <p className="font-medium text-sm mb-2">{result.user?.nama || `User ${result.userId.slice(0, 6)}`}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Attract.</p>
                      <p className={`font-semibold ${getScoreColor(result.attractiveness)}`}>{result.attractiveness.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Persp.</p>
                      <p className={`font-semibold ${getScoreColor(result.perspicuity)}`}>{result.perspicuity.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Effic.</p>
                      <p className={`font-semibold ${getScoreColor(result.efficiency)}`}>{result.efficiency.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Depend.</p>
                      <p className={`font-semibold ${getScoreColor(result.dependability)}`}>{result.dependability.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stimul.</p>
                      <p className={`font-semibold ${getScoreColor(result.stimulation)}`}>{result.stimulation.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Novelty</p>
                      <p className={`font-semibold ${getScoreColor(result.novelty)}`}>{result.novelty.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
