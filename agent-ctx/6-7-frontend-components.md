# Task 6-7: QiaTrans Auth & Customer Components

## Summary
Created all 12 client-side components for the QiaTrans car rental mobile-first web app.

## Files Created

### Auth Components (5 files)
1. **`/src/components/auth/SplashScreen.tsx`** - Dark blue gradient splash with QiaTrans logo, Car icon, pulse animation, auto-navigate to onboarding after 2.5s
2. **`/src/components/auth/OnboardingScreen.tsx`** - 3-step carousel (Rental Mobil Mudah, Inspeksi Digital, Deteksi Lecet AI) with dots indicator, Selanjutnya/Lewati buttons
3. **`/src/components/auth/LoginScreen.tsx`** - Professional login form with gradient header, email/password inputs, signIn('credentials'), role-based redirect (ADMIN→dashboard, CUSTOMER→home)
4. **`/src/components/auth/RegisterScreen.tsx`** - Registration form with nama/email/noTelepon/password/confirmPassword, validation, POST to /api/auth/register, auto-login on success
5. **`/src/components/auth/ForgotPasswordScreen.tsx`** - Forgot password with email input, simulated reset link sending, success state

### Customer Components (7 files)
6. **`/src/components/customer/HomeScreen.tsx`** - Full home screen with header, search, banner carousel, Mobil Populer horizontal scroll, Kategori grid, Rekomendasi grid, fetches from /api/vehicles
7. **`/src/components/customer/VehicleListScreen.tsx`** - Vehicle list with search, filter chips (All/SUV/Sedan/MPV/Hatchback/Pickup), sort options, 2-column grid, empty state
8. **`/src/components/customer/VehicleDetailScreen.tsx`** - Vehicle detail with image area, specs grid, description, floating "Booking Sekarang" button, fetches from /api/vehicles/[id]
9. **`/src/components/customer/BookingScreen.tsx`** - Booking form with vehicle info card, date pickers (Calendar popover), price calculation, notes textarea, POST to /api/rentals
10. **`/src/components/customer/MyRentalsScreen.tsx`** - Rentals list with tabs (Aktif/Pending/Semua), rental cards with status badges, inspection/evaluation action buttons
11. **`/src/components/customer/RentalHistoryScreen.tsx`** - Completed/cancelled rentals list with Evaluasi SUS and Evaluasi UEQ buttons for completed rentals
12. **`/src/components/customer/ProfileScreen.tsx`** - User profile with avatar, edit mode, KTP/SIM upload, dark mode toggle, logout button, app version info

## Key Design Decisions
- All components use `'use client'` directive
- Consistent use of shadcn/ui components (Card, Button, Input, Badge, Tabs, Calendar, etc.)
- Mobile-first design with rounded corners (rounded-xl, rounded-2xl), shadow-md
- Color theme uses `from-qia-dark to-primary` gradients, `bg-primary`, `text-primary`
- Price formatting with Intl.NumberFormat IDR
- Date formatting with Indonesian locale
- Navigation via useNavStore (setAuthPage, setCustomerPage, goBack)
- Auth via next-auth (useSession, signIn, signOut)
- Toast notifications via sonner
- Loading states with skeleton/placeholder components
- Empty states for zero-data scenarios
