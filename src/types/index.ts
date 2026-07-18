// User Types
export interface User {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'OWNER' | 'SUPER_ADMIN';
  fotoProfil?: string | null;
  noKTP?: string | null;
  noSIM?: string | null;
  fotoKTP?: string | null;
  fotoSIM?: string | null;
  alamat?: string | null;
  noTelepon?: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserWithoutPassword = Omit<User, 'password'>

// Vehicle Types
export interface Vehicle {
  id: string;
  namaMobil: string;
  merk: string;
  model: string;
  tahun: number;
  warna: string;
  platNomor: string;
  hargaSewa: number;
  kategori: 'City Car' | 'MPV (Multi Purpose Vehicle)' | 'Van/Minibus';
  transmisi: 'Manual' | 'Automatic';
  bahanBakar: 'Bensin' | 'Diesel' | 'Hybrid' | 'Listrik';
  kapasitas: number;
  status: 'TERSEDIA' | 'DISEWA' | 'MAINTENANCE';
  foto: string;
  deskripsi: string;
  createdAt: string;
  updatedAt: string;
}

// Rental Types
export type RentalStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Rental {
  id: string;
  userId: string;
  vehicleId: string;
  tanggalSewa: string;
  tanggalKembali: string;
  jamAmbil?: string | null;
  jamKembali?: string | null;
  tanggalPengembalian?: string | null;
  status: RentalStatus;
  totalHarga: number;
  durasiType?: string | null;
  catatan?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: UserWithoutPassword;
  vehicle?: Vehicle;
}

// SUS Result Types
export interface SUSResult {
  id: string;
  userId: string;
  rentalId: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
  q10: number;
  skor: number;
  createdAt: string;
  user?: UserWithoutPassword;
  rental?: Rental;
}

// UEQ Result Types
export interface UEQResult {
  id: string;
  userId: string;
  rentalId: string;
  attractiveness: number;
  perspicuity: number;
  efficiency: number;
  dependability: number;
  stimulation: number;
  novelty: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
  q10: number;
  q11: number;
  q12: number;
  q13: number;
  q14: number;
  q15: number;
  q16: number;
  q17: number;
  q18: number;
  q19: number;
  q20: number;
  q21: number;
  q22: number;
  q23: number;
  createdAt: string;
  user?: UserWithoutPassword;
  rental?: Rental;
}

// Notification Types
export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
}

// Auth Types
export interface SessionUser {
  id: string;
  nama: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'OWNER' | 'SUPER_ADMIN';
}

export interface RegisterData {
  nama: string;
  email: string;
  password: string;
  role?: 'CUSTOMER' | 'ADMIN' | 'OWNER' | 'SUPER_ADMIN';
}

export interface LoginData {
  email: string;
  password: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalVehicles: number;
  activeRentals: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingBookings: number;
  completedRentals: number;
  cancelledRentals: number;
  availableVehicles: number;
}
