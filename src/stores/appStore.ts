import { create } from 'zustand'
import type { Vehicle, Rental } from '@/types'

interface AppState {
  // Data caches
  vehicles: Vehicle[]
  rentals: Rental[]
  
  // Loading states
  isLoadingVehicles: boolean
  isLoadingRentals: boolean
  
  // Search/filter
  searchQuery: string
  filterKategori: string
  filterStatus: string
  
  // Setters
  setVehicles: (vehicles: Vehicle[]) => void
  setRentals: (rentals: Rental[]) => void
  setLoadingVehicles: (loading: boolean) => void
  setLoadingRentals: (loading: boolean) => void
  setSearchQuery: (query: string) => void
  setFilterKategori: (kategori: string) => void
  setFilterStatus: (status: string) => void
  resetFilters: () => void
  clearCache: () => void
}

export const useAppStore = create<AppState>((set) => ({
  vehicles: [],
  rentals: [],
  isLoadingVehicles: false,
  isLoadingRentals: false,
  searchQuery: '',
  filterKategori: '',
  filterStatus: '',

  setVehicles: (vehicles) => set({ vehicles }),
  setRentals: (rentals) => set({ rentals }),
  setLoadingVehicles: (isLoadingVehicles) => set({ isLoadingVehicles }),
  setLoadingRentals: (isLoadingRentals) => set({ isLoadingRentals }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterKategori: (filterKategori) => set({ filterKategori }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  resetFilters: () => set({ searchQuery: '', filterKategori: '', filterStatus: '' }),
  clearCache: () => set({ vehicles: [], rentals: [] }),
}))
