'use client'

import { useSession } from 'next-auth/react'
import { useNavStore } from '@/stores/navStore'
import BottomNav from '@/components/layout/BottomNav'
import AdminSidebar from '@/components/layout/AdminSidebar'

// Auth screens
import SplashScreen from '@/components/auth/SplashScreen'
import OnboardingScreen from '@/components/auth/OnboardingScreen'
import LoginScreen from '@/components/auth/LoginScreen'
import RegisterScreen from '@/components/auth/RegisterScreen'
import ForgotPasswordScreen from '@/components/auth/ForgotPasswordScreen'

// Customer screens
import HomeScreen from '@/components/customer/HomeScreen'
import VehicleListScreen from '@/components/customer/VehicleListScreen'
import VehicleDetailScreen from '@/components/customer/VehicleDetailScreen'
import BookingScreen from '@/components/customer/BookingScreen'
import MyRentalsScreen from '@/components/customer/MyRentalsScreen'
import RentalHistoryScreen from '@/components/customer/RentalHistoryScreen'
import InspectionBeforeScreen from '@/components/customer/InspectionBeforeScreen'
import InspectionAfterScreen from '@/components/customer/InspectionAfterScreen'
import DetectionResultScreen from '@/components/customer/DetectionResultScreen'
import InspectionHistoryScreen from '@/components/customer/InspectionHistoryScreen'
import DamageComparisonScreen from '@/components/customer/DamageComparisonScreen'
import SUSFeedbackScreen from '@/components/customer/SUSFeedbackScreen'
import UEQFeedbackScreen from '@/components/customer/UEQFeedbackScreen'
import NotificationsScreen from '@/components/customer/NotificationsScreen'
import ProfileScreen from '@/components/customer/ProfileScreen'

// Admin screens
import DashboardScreen from '@/components/admin/DashboardScreen'
import VehicleManagementScreen from '@/components/admin/VehicleManagementScreen'
import CustomerManagementScreen from '@/components/admin/CustomerManagementScreen'
import RentalManagementScreen from '@/components/admin/RentalManagementScreen'
import InspectionDataScreen from '@/components/admin/InspectionDataScreen'
import DetectionDataScreen from '@/components/admin/DetectionDataScreen'
import DamageVerificationScreen from '@/components/admin/DamageVerificationScreen'
import RentalReportScreen from '@/components/admin/RentalReportScreen'
import DamageReportScreen from '@/components/admin/DamageReportScreen'
import SUSReportScreen from '@/components/admin/SUSReportScreen'
import UEQReportScreen from '@/components/admin/UEQReportScreen'
import SettingsScreen from '@/components/admin/SettingsScreen'
import AdminNotificationsScreen from '@/components/admin/NotificationsScreen'

function AuthRouter() {
  const { authPage } = useNavStore()

  switch (authPage) {
    case 'splash':
      return <SplashScreen />
    case 'onboarding':
      return <OnboardingScreen />
    case 'login':
      return <LoginScreen />
    case 'register':
      return <RegisterScreen />
    case 'forgot-password':
      return <ForgotPasswordScreen />
    default:
      return <SplashScreen />
  }
}

function CustomerRouter() {
  const customerPage = useNavStore((s) => s.customerPage)

  switch (customerPage) {
    case 'home':
      return <HomeScreen />
    case 'vehicle-list':
      return <VehicleListScreen />
    case 'vehicle-detail':
      return <VehicleDetailScreen />
    case 'booking':
      return <BookingScreen />
    case 'my-rentals':
      return <MyRentalsScreen />
    case 'rental-history':
      return <RentalHistoryScreen />
    case 'inspection-before':
      return <InspectionBeforeScreen />
    case 'inspection-after':
      return <InspectionAfterScreen />
    case 'detection-result':
      return <DetectionResultScreen />
    case 'inspection-history':
      return <InspectionHistoryScreen />
    case 'damage-comparison':
      return <DamageComparisonScreen />
    case 'sus-feedback':
      return <SUSFeedbackScreen />
    case 'ueq-feedback':
      return <UEQFeedbackScreen />
    case 'notifications':
      return <NotificationsScreen />
    case 'profile':
      return <ProfileScreen />
    default:
      return <HomeScreen />
  }
}

function AdminRouter() {
  const { adminPage } = useNavStore()

  switch (adminPage) {
    case 'dashboard':
      return <DashboardScreen />
    case 'vehicles':
    case 'vehicle-form':
      return <VehicleManagementScreen />
    case 'customers':
      return <CustomerManagementScreen />
    case 'rentals':
    case 'rental-detail':
      return <RentalManagementScreen />
    case 'inspections':
      return <InspectionDataScreen />
    case 'detections':
      return <DetectionDataScreen />
    case 'damage-verification':
      return <DamageVerificationScreen />
    case 'rental-report':
      return <RentalReportScreen />
    case 'damage-report':
      return <DamageReportScreen />
    case 'sus-report':
      return <SUSReportScreen />
    case 'ueq-report':
      return <UEQReportScreen />
    case 'settings':
      return <SettingsScreen />
    case 'notifications':
      return <AdminNotificationsScreen />
    default:
      return <DashboardScreen />
  }
}

export default function AppShell() {
  const { data: session, status } = useSession()
  const { setAuthPage, setCustomerPage, setAdminPage } = useNavStore()

  // Show splash while loading session
  if (status === 'loading') {
    return <SplashScreen />
  }

  // Not authenticated - show auth flow
  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <AuthRouter />
      </div>
    )
  }

  // Authenticated - show role-based layout
  const isAdmin = session.user?.role === 'ADMIN'

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="ml-0 lg:ml-64 min-h-screen pb-4">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <AdminRouter />
          </div>
        </main>
      </div>
    )
  }

  // Customer layout
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <CustomerRouter />
      </main>
      <BottomNav />
    </div>
  )
}
