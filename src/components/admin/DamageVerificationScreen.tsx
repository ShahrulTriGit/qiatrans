'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  ShieldCheck,
  ShieldX,
  ScanEye,
  MapPin,
  CheckCircle2,
  XCircle,
  Filter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DetectionResult, DetectionSeverity } from '@/types'

function getSeverityColor(severity: DetectionSeverity) {
  switch (severity) {
    case 'RINGAN':
      return 'bg-success/10 text-success border-success/20'
    case 'SEDANG':
      return 'bg-warning/10 text-warning border-warning/20'
    case 'BERAT':
      return 'bg-destructive/10 text-destructive border-destructive/20'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getSeverityLabel(severity: DetectionSeverity) {
  switch (severity) {
    case 'RINGAN': return 'Ringan'
    case 'SEDANG': return 'Sedang'
    case 'BERAT': return 'Berat'
    default: return severity
  }
}

function formatConfidence(confidence: number) {
  return `${(confidence * 100).toFixed(1)}%`
}

export default function DamageVerificationScreen() {
  const { data: session } = useSession()
  const [detections, setDetections] = useState<DetectionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('unverified')

  useEffect(() => {
    fetchDetections()
  }, [])

  async function fetchDetections() {
    try {
      const res = await fetch('/api/detections')
      if (res.ok) {
        const data = await res.json()
        setDetections(data.data || [])
      }
    } catch {
      toast.error('Gagal memuat data deteksi')
    } finally {
      setLoading(false)
    }
  }

  async function verifyDetection(id: string, verified: boolean) {
    try {
      const res = await fetch(`/api/detections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified,
          verifiedBy: session?.user?.id || 'admin',
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(verified ? 'Deteksi berhasil diverifikasi' : 'Deteksi ditolak')
      fetchDetections()
    } catch {
      toast.error('Gagal memperbarui status verifikasi')
    }
  }

  const unverifiedDetections = detections.filter((d) => !d.verified)
  const verifiedDetections = detections.filter((d) => d.verified)

  const currentList = activeTab === 'unverified' ? unverifiedDetections : verifiedDetections

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}><CardContent className="p-6"><div className="h-32 bg-muted rounded animate-pulse" /></CardContent></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verifikasi Kerusakan</h1>
        <p className="text-muted-foreground mt-1">
          {unverifiedDetections.length} deteksi menunggu verifikasi
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unverified">
            <ShieldX className="w-4 h-4 mr-1" />
            Menunggu ({unverifiedDetections.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Terverifikasi ({verifiedDetections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {currentList.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <ScanEye className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                {activeTab === 'unverified'
                  ? 'Tidak ada deteksi yang menunggu verifikasi'
                  : 'Belum ada deteksi yang terverifikasi'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {currentList.map((detection) => (
                <Card key={detection.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Images */}
                      <div className="flex gap-1 shrink-0">
                        <div className="w-24 h-24 rounded-md bg-muted overflow-hidden">
                          {detection.gambarAsli ? (
                            <img
                              src={detection.gambarAsli}
                              alt="Original"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ScanEye className="w-6 h-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="w-24 h-24 rounded-md bg-muted overflow-hidden">
                          {detection.gambarHasil ? (
                            <img
                              src={detection.gambarHasil}
                              alt="Result"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ScanEye className="w-6 h-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{detection.lokasiLecet}</span>
                          </div>
                          <Badge className={getSeverityColor(detection.severity)} variant="outline">
                            {getSeverityLabel(detection.severity)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                          <div>Confidence: <span className="font-medium text-foreground">{formatConfidence(detection.confidence)}</span></div>
                          <div>Inspeksi: <span className="font-mono text-xs">{detection.inspectionId.slice(0, 8)}...</span></div>
                        </div>

                        {detection.verified && (
                          <div className="text-xs text-success flex items-center gap-1 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Diverifikasi oleh {detection.verifiedBy || 'admin'}
                          </div>
                        )}

                        {!detection.verified && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90 text-success-foreground h-8"
                              onClick={() => verifyDetection(detection.id, true)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Verifikasi
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-destructive"
                              onClick={() => verifyDetection(detection.id, false)}
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Tolak
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
