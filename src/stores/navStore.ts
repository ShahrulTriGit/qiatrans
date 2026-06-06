import { create } from 'zustand'

export type AuthPage = 'splash' | 'onboarding' | 'login' | 'register' | 'forgot-password'

export type CustomerPage =
  | 'home'
  | 'vehicle-list'
  | 'vehicle-detail'
  | 'booking'
  | 'my-rentals'
  | 'rental-history'
  | 'inspection-before'
  | 'inspection-after'
  | 'detection-result'
  | 'inspection-history'
  | 'sus-feedback'
  | 'ueq-feedback'
  | 'profile'
  | 'notifications'

export type AdminPage =
  | 'dashboard'
  | 'vehicles'
  | 'vehicle-form'
  | 'customers'
  | 'rentals'
  | 'rental-detail'
  | 'inspections'
  | 'detections'
  | 'damage-verification'
  | 'rental-report'
  | 'damage-report'
  | 'sus-report'
  | 'ueq-report'
  | 'settings'
  | 'notifications'

interface NavigationState {
  authPage: AuthPage
  customerPage: CustomerPage
  adminPage: AdminPage
  selectedVehicleId: string | null
  selectedRentalId: string | null
  selectedInspectionId: string | null
  selectedDetectionId: string | null
  navigationHistory: string[]
  setAuthPage: (page: AuthPage) => void
  setCustomerPage: (page: CustomerPage, params?: Record<string, string>) => void
  setAdminPage: (page: AdminPage, params?: Record<string, string>) => void
  goBack: () => void
  reset: () => void
}

export const useNavStore = create<NavigationState>((set, get) => ({
  authPage: 'splash',
  customerPage: 'home',
  adminPage: 'dashboard',
  selectedVehicleId: null,
  selectedRentalId: null,
  selectedInspectionId: null,
  selectedDetectionId: null,
  navigationHistory: [],

  setAuthPage: (page) => set({ authPage: page }),

  setCustomerPage: (page, params) =>
    set((state) => ({
      customerPage: page,
      navigationHistory: [...state.navigationHistory, `customer:${state.customerPage}`],
      selectedVehicleId: params?.vehicleId ?? state.selectedVehicleId,
      selectedRentalId: params?.rentalId ?? state.selectedRentalId,
      selectedInspectionId: params?.inspectionId ?? state.selectedInspectionId,
      selectedDetectionId: params?.detectionId ?? state.selectedDetectionId,
    })),

  setAdminPage: (page, params) =>
    set((state) => ({
      adminPage: page,
      navigationHistory: [...state.navigationHistory, `admin:${state.adminPage}`],
      selectedVehicleId: params?.vehicleId ?? state.selectedVehicleId,
      selectedRentalId: params?.rentalId ?? state.selectedRentalId,
      selectedInspectionId: params?.inspectionId ?? state.selectedInspectionId,
      selectedDetectionId: params?.detectionId ?? state.selectedDetectionId,
    })),

  goBack: () => {
    const { navigationHistory } = get()
    if (navigationHistory.length > 0) {
      const last = navigationHistory[navigationHistory.length - 1]
      const [role, page] = last.split(':')
      set((state) => ({
        navigationHistory: state.navigationHistory.slice(0, -1),
        ...(role === 'customer'
          ? { customerPage: page as CustomerPage }
          : { adminPage: page as AdminPage }),
      }))
    }
  },

  reset: () =>
    set({
      authPage: 'splash',
      customerPage: 'home',
      adminPage: 'dashboard',
      selectedVehicleId: null,
      selectedRentalId: null,
      selectedInspectionId: null,
      selectedDetectionId: null,
      navigationHistory: [],
    }),
}))
