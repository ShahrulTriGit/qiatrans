import { create } from 'zustand'
import type { Vehicle, Rental, Inspection, DetectionResult } from '@/types'

interface AppState {
  // Data caches
  vehicles: Vehicle[]
  rentals: Rental[]
  inspections: Inspection[]
  detections: DetectionResult[]
  
  // Loading states
  isLoadingVehicles: boolean
  isLoadingRentals: boolean
  isLoadingInspections: boolean
  
  // Search/filter
  searchQuery: string
  filterKategori: string
  filterStatus: string
  
  // Setters
  setVehicles: (vehicles: Vehicle[]) => void
  setRentals: (rentals: Rental[]) => void
  setInspections: (inspections: Inspection[]) => void
  setDetections: (detections: DetectionResult[]) => void
  setLoadingVehicles: (loading: boolean) => void
  setLoadingRentals: (loading: boolean) => void
  setLoadingInspections: (loading: boolean) => void
  setSearchQuery: (query: string) => void
  setFilterKategori: (kategori: string) => void
  setFilterStatus: (status: string) => void
  resetFilters: () => void
}

export const useAppStore = create<AppState>((set) => ({
  vehicles: [],
  rentals: [],
  inspections: [],
  detections: [],
  isLoadingVehicles: false,
  isLoadingRentals: false,
  isLoadingInspections: false,
  searchQuery: '',
  filterKategori: '',
  filterStatus: '',

  setVehicles: (vehicles) => set({ vehicles }),
  setRentals: (rentals) => set({ rentals }),
  setInspections: (inspections) => set({ inspections }),
  setDetections: (detections) => set({ detections }),
  setLoadingVehicles: (isLoadingVehicles) => set({ isLoadingVehicles }),
  setLoadingRentals: (isLoadingRentals) => set({ isLoadingRentals }),
  setLoadingInspections: (isLoadingInspections) => set({ isLoadingInspections }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterKategori: (filterKategori) => set({ filterKategori }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  resetFilters: () => set({ searchQuery: '', filterKategori: '', filterStatus: '' }),
}))
