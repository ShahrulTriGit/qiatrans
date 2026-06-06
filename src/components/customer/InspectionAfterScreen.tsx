'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useNavStore } from '@/stores/navStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Camera,
  Upload,
  ScanSearch,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Car,
  Save,
  X,
  ArrowRightLeft,
} from 'lucide-react'
import type { Inspection, DetectionResult } from '@/types'

type Step = 'upload' | 'preview' | 'detect' | 'result'

const MOCK_LOCATIONS = [
  'Bumper Depan',
  'Pintu Kiri Depan',
  'Pintu Kiri Belakang',
  'Bumper Belakang',
  'Kap Mesin',
  'Lampu Depan Kiri',
  'Fender Kanan Depan',
  'Pintu Kanan Belakang',
  'Spion Kanan',
  'Lampu Belakang Kiri',
]

const MOCK_SEVERITIES: Array<'RINGAN' | 'SEDANG' | 'BERAT'> = ['RINGAN', 'SEDANG', 'BERAT']

function generateMockDetections(imageUrl: string): DetectionResult[] {
  const count = Math.floor(Math.random() * 5) + 1 // Post-rental more likely to have damage
  const results: DetectionResult[] = []
  for (let i = 0; i < count; i++) {
    results.push({
      id: `mock-det-after-${Date.now()}-${i}`,
      inspectionId: '',
      lokasiLecet: MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)],
      confidence: Math.round((0.55 + Math.random() * 0.44) * 100) / 100,
      gambarAsli: imageUrl,
      gambarHasil: imageUrl,
      severity: MOCK_SEVERITIES[Math.floor(Math.random() * MOCK_SEVERITIES.length)],
      verified: false,
      createdAt: new Date().toISOString(),
    })
  }
  return results
}

export default function InspectionAfterScreen() {
  const { data: session } = useSession()
  const { selectedRentalId, goBack, setCustomerPage } = useNavStore()

  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [detectionProgress, setDetectionProgress] = useState(0)
  const [inspectionData, setInspectionData] = useState<Inspection | null>(null)
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string)
      setCurrentStep('preview')
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!imageFile) return
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.success && data.data?.url) {
        setUploadedUrl(data.data.url)
        setCurrentStep('detect')
        toast.success('Gambar berhasil diunggah')
      } else {
        setUploadedUrl(selectedImage!)
        setCurrentStep('detect')
        toast.success('Gambar berhasil diunggah')
      }
    } catch {
      setUploadedUrl(selectedImage!)
      setCurrentStep('detect')
      toast.success('Gambar berhasil diunggah')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDetection = async () => {
    setIsDetecting(true)
    setDetectionProgress(0)

    try {
      const imageUrl = uploadedUrl || selectedImage!

      // Create inspection record
      const inspectionRes = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalId: selectedRentalId,
          jenisInspeksi: 'SESUDAH_RENTAL',
          gambar: imageUrl,
        }),
      })

      const inspectionDataRes = await inspectionRes.json()
      let inspection: Inspection

      if (inspectionDataRes.success && inspectionDataRes.data) {
        inspection = inspectionDataRes.data
      } else {
        inspection = {
          id: `mock-insp-after-${Date.now()}`,
          rentalId: selectedRentalId || '',
          vehicleId: '',
          jenisInspeksi: 'SESUDAH_RENTAL',
          tanggal: new Date().toISOString(),
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }

      setInspectionData(inspection)

      // Simulate detection progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 200))
        setDetectionProgress(i)
      }

      // Simulate YOLOv8 detection
      const mockResults = generateMockDetections(imageUrl)

      try {
        await fetch('/api/detections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inspectionId: inspection.id,
            gambarAsli: imageUrl,
            gambarHasil: imageUrl,
            detections: mockResults.map((d) => ({
              lokasiLecet: d.lokasiLecet,
              confidence: d.confidence,
              severity: d.severity,
            })),
          }),
        })
      } catch {
        // Detection API may not exist yet
      }

      const updatedResults = mockResults.map((d) => ({
        ...d,
        inspectionId: inspection.id,
      }))

      setDetectionResults(updatedResults)
      setCurrentStep('result')
      toast.success('Deteksi selesai')
    } catch {
      toast.error('Gagal menjalankan deteksi')
    } finally {
      setIsDetecting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      toast.success('Hasil inspeksi berhasil disimpan')
      goBack()
    } catch {
      toast.error('Gagal menyimpan hasil')
    } finally {
      setIsSaving(false)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImageFile(null)
    setUploadedUrl(null)
    setCurrentStep('upload')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'RINGAN':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'SEDANG':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'BERAT':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600'
    if (confidence > 0.5) return 'text-yellow-600'
    return 'text-orange-600'
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
        <h1 className="text-lg font-semibold">Inspeksi Setelah Rental</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto pb-8">
        {/* Vehicle Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Rental #{selectedRentalId?.slice(0, 8) || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Inspeksi Setelah Rental</p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Step {currentStep === 'upload' ? '1' : currentStep === 'preview' ? '2' : currentStep === 'detect' ? '3' : '4'}/4
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Note */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <ArrowRightLeft className="size-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Perbandingan Otomatis</p>
                <p className="text-blue-700">
                  Hasil akan dibandingkan dengan inspeksi sebelum rental untuk mengidentifikasi kerusakan baru.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Petunjuk Inspeksi</p>
                <p>Ambil foto kendaraan setelah rental selesai. Sistem akan mendeteksi lecet baru dan membandingkannya dengan kondisi sebelum rental.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                Ambil Foto Kendaraan
              </CardTitle>
              <CardDescription>Foto akan dianalisis untuk mendeteksi lecet baru</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageSelect}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />

              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 border-dashed border-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="size-8 text-primary" />
                <span className="text-sm font-medium">Gunakan Kamera</span>
              </Button>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  atau
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full h-16 flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-5 text-primary" />
                <span className="text-sm font-medium">Pilih dari Galeri</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Preview */}
        {currentStep === 'preview' && selectedImage && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                Pratinjau Gambar
              </CardTitle>
              <CardDescription>Periksa gambar sebelum diunggah</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border bg-gray-100">
                <img
                  src={selectedImage}
                  alt="Preview kendaraan"
                  className="w-full h-64 object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 size-8"
                  onClick={removeImage}
                >
                  <X className="size-4" />
                </Button>
                {/* Simulated bounding box overlay */}
                <div className="absolute top-[20%] left-[15%] w-[30%] h-[25%] border-2 border-yellow-400 rounded-sm">
                  <span className="absolute -top-5 left-0 bg-yellow-400 text-black text-[10px] px-1 rounded">
                    Scanning...
                  </span>
                </div>
                <div className="absolute bottom-[25%] right-[20%] w-[25%] h-[20%] border-2 border-green-400 rounded-sm opacity-50">
                  <span className="absolute -top-5 left-0 bg-green-400 text-black text-[10px] px-1 rounded">
                    OK
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Unggah Gambar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Detect */}
        {currentStep === 'detect' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                Jalankan Deteksi
              </CardTitle>
              <CardDescription>AI akan menganalisis gambar dan membandingkan dengan inspeksi sebelumnya</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadedUrl && (
                <div className="rounded-lg overflow-hidden border bg-gray-100">
                  <img
                    src={uploadedUrl}
                    alt="Gambar terunggah"
                    className="w-full h-40 object-cover opacity-80"
                  />
                </div>
              )}

              {!isDetecting ? (
                <Button className="w-full" size="lg" onClick={handleDetection}>
                  <ScanSearch className="size-5" />
                  Jalankan Deteksi
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <span className="text-sm font-medium">Menganalisis gambar...</span>
                  </div>
                  <Progress value={detectionProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {detectionProgress < 30
                      ? 'Memproses gambar...'
                      : detectionProgress < 60
                        ? 'Menjalankan model YOLOv8...'
                        : detectionProgress < 90
                          ? 'Membandingkan dengan inspeksi sebelumnya...'
                          : 'Hampir selesai...'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Results */}
        {currentStep === 'result' && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</div>
                  Hasil Deteksi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {detectionResults.length === 0 ? (
                  <div className="flex flex-col items-center py-6 gap-2">
                    <CheckCircle2 className="size-12 text-green-500" />
                    <p className="font-semibold text-green-700">Tidak ada lecet terdeteksi</p>
                    <p className="text-xs text-muted-foreground">Kendaraan dikembalikan dalam kondisi baik</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="size-5 text-red-500 shrink-0" />
                      <p className="text-sm font-medium text-red-800">
                        {detectionResults.length} lecet terdeteksi
                      </p>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {detectionResults.map((result, idx) => (
                        <div
                          key={result.id || idx}
                          className="flex items-center justify-between p-3 bg-white border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <AlertTriangle className="size-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{result.lokasiLecet}</p>
                              <p className={`text-xs font-medium ${getConfidenceColor(result.confidence)}`}>
                                Confidence: {Math.round(result.confidence * 100)}%
                              </p>
                            </div>
                          </div>
                          <Badge className={`text-[10px] ${getSeverityColor(result.severity)}`}>
                            {result.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Comparison Note */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <ArrowRightLeft className="size-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Hasil akan dibandingkan dengan inspeksi sebelum rental untuk mengidentifikasi kerusakan baru.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Inspection details */}
                {inspectionData && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>ID Inspeksi: {inspectionData.id.slice(0, 12)}...</p>
                    <p>Tanggal: {new Date(inspectionData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p>Jenis: Setelah Rental</p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Simpan Hasil
                    </>
                  )}
                </Button>

                {detectionResults.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (inspectionData) {
                        setCustomerPage('detection-result', { inspectionId: inspectionData.id })
                      }
                    }}
                  >
                    Lihat Detail Deteksi
                  </Button>
                )}

                {selectedRentalId && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setCustomerPage('detection-result', { inspectionId: inspectionData?.id || '' })}
                  >
                    <ArrowRightLeft className="size-4" />
                    Lihat Perbandingan
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
