import { create } from 'zustand'

export type AuthPage = 'splash' | 'onboarding' | 'login' | 'register' | 'forgot-password'

export type CustomerPage =
  | 'home'
  | 'vehicle-list'
  | 'vehicle-detail'
  | 'booking'
  | 'my-rentals'
  | 'rental-history'
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
  | 'rental-report'
  | 'sus-report'
  | 'ueq-report'
  | 'settings'
  | 'notifications'

const MAX_HISTORY = 50

interface HistoryEntry {
  role: 'customer' | 'admin'
  page: string
  params: {
    selectedVehicleId: string | null
    selectedRentalId: string | null
  }
}

interface NavigationState {
  authPage: AuthPage
  customerPage: CustomerPage
  adminPage: AdminPage
  selectedVehicleId: string | null
  selectedRentalId: string | null

  navigationHistory: HistoryEntry[]
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
  navigationHistory: [],

  setAuthPage: (page) => set({ authPage: page }),

  setCustomerPage: (page, params) =>
    set((state) => {
      const prevPage = `customer:${state.customerPage}`
      const lastEntry = state.navigationHistory[state.navigationHistory.length - 1]
      const lastPageStr = lastEntry ? `${lastEntry.role}:${lastEntry.page}` : ''
      if (lastPageStr === prevPage) {
        return {
          customerPage: page,
          selectedVehicleId: params?.vehicleId ?? state.selectedVehicleId,
          selectedRentalId: params?.rentalId ?? state.selectedRentalId,
        }
      }
      const entry: HistoryEntry = {
        role: 'customer',
        page: state.customerPage,
        params: {
          selectedVehicleId: state.selectedVehicleId,
          selectedRentalId: state.selectedRentalId,
        },
      }
      const history = [...state.navigationHistory, entry]
      if (history.length > MAX_HISTORY) history.shift()
      return {
        customerPage: page,
        navigationHistory: history,
        selectedVehicleId: params?.vehicleId ?? state.selectedVehicleId,
        selectedRentalId: params?.rentalId ?? state.selectedRentalId,
      }
    }),

  setAdminPage: (page, params) =>
    set((state) => {
      const prevPage = `admin:${state.adminPage}`
      const lastEntry = state.navigationHistory[state.navigationHistory.length - 1]
      const lastPageStr = lastEntry ? `${lastEntry.role}:${lastEntry.page}` : ''
      if (lastPageStr === prevPage) {
        return {
          adminPage: page,
          selectedVehicleId: params?.vehicleId ?? state.selectedVehicleId,
          selectedRentalId: params?.rentalId ?? state.selectedRentalId,
        }
      }
      const entry: HistoryEntry = {
        role: 'admin',
        page: state.adminPage,
        params: {
          selectedVehicleId: state.selectedVehicleId,
          selectedRentalId: state.selectedRentalId,
        },
      }
      const history = [...state.navigationHistory, entry]
      if (history.length > MAX_HISTORY) history.shift()
      return {
        adminPage: page,
        navigationHistory: history,
        selectedVehicleId: params?.vehicleId ?? state.selectedVehicleId,
        selectedRentalId: params?.rentalId ?? state.selectedRentalId,
      }
    }),

  goBack: () => {
    const { navigationHistory } = get()
    if (navigationHistory.length > 0) {
      const last = navigationHistory[navigationHistory.length - 1]
      set((state) => ({
        navigationHistory: state.navigationHistory.slice(0, -1),
        ...(last.role === 'customer'
          ? { customerPage: last.page as CustomerPage }
          : { adminPage: last.page as AdminPage }),
        selectedVehicleId: last.params.selectedVehicleId,
        selectedRentalId: last.params.selectedRentalId,
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
      navigationHistory: [],
    }),
}))
