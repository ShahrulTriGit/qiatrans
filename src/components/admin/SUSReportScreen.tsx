'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  BarChart3,
  UserCheck,
  Download,
} from 'lucide-react'
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
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

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

  const filteredResults = results.filter((r) => {
    if (dateFrom && r.createdAt < dateFrom) return false
    if (dateTo && r.createdAt > dateTo + 'T23:59:59') return false
    return true
  })

  const averageScore = filteredResults.length > 0
    ? filteredResults.reduce((sum, r) => sum + r.skor, 0) / filteredResults.length
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
    count: filteredResults.filter((r) => r.skor >= range.min && r.skor < range.max).length +
      (range.max === 100 ? filteredResults.filter((r) => r.skor === 100).length : 0),
  }))

  // Gauge percentage
  const gaugePercent = Math.min(100, Math.max(0, averageScore))

  function handleExport() {
    const headers = ['ID', 'Responden', 'Rental ID', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Skor SUS', 'Interpretasi', 'Tanggal']
    const rows = filteredResults.map((r) => [
      r.id,
      r.user?.nama || '-',
      r.rentalId,
      r.q1, r.q2, r.q3, r.q4, r.q5,
      r.q6, r.q7, r.q8, r.q9, r.q10,
      r.skor.toFixed(1),
      getScoreInterpretation(r.skor).label,
      r.createdAt,
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sus-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Laporan SUS berhasil diekspor')
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
          <h1 className="text-2xl font-bold text-foreground">Laporan SUS</h1>
          <p className="text-muted-foreground mt-1">System Usability Scale - {filteredResults.length} responden</p>
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
                Berdasarkan {filteredResults.length} responden
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
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto max-h-96 overflow-y-auto">
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
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data SUS
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => {
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
          {/* Mobile cards */}
          <div className="md:hidden space-y-3 max-h-96 overflow-y-auto">
            {filteredResults.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Tidak ada data SUS</p>
            ) : (
              filteredResults.map((result) => {
                const interp = getScoreInterpretation(result.skor)
                return (
                  <div key={result.id} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{result.user?.nama || `User ${result.userId.slice(0, 6)}`}</p>
                        <p className="text-xs text-muted-foreground font-mono">ID: {result.rentalId.slice(0, 8)}...</p>
                      </div>
                      <Badge className={`${interp.bg} ${interp.color}`} variant="outline">{interp.label}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        <span>Q1-Q5: {result.q1},{result.q2},{result.q3},{result.q4},{result.q5}</span>
                        <br />
                        <span>Q6-Q10: {result.q6},{result.q7},{result.q8},{result.q9},{result.q10}</span>
                      </div>
                      <span className="text-lg font-bold">{result.skor.toFixed(1)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
