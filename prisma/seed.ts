import { hash } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.detectionResult.deleteMany()
  await prisma.inspection.deleteMany()
  await prisma.sUSResult.deleteMany()
  await prisma.uEQResult.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.rental.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      nama: 'Admin QiaTrans',
      email: 'admin@qiatrans.com',
      password: adminPassword,
      role: 'ADMIN',
      noTelepon: '081234567890',
      alamat: 'Jl. Admin No. 1, Jakarta',
      verified: true,
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Create Customer users
  const customer1Password = await hash('customer123', 12)
  const customer1 = await prisma.user.create({
    data: {
      nama: 'Budi Santoso',
      email: 'customer1@qiatrans.com',
      password: customer1Password,
      role: 'CUSTOMER',
      noTelepon: '081234567891',
      alamat: 'Jl. Merdeka No. 10, Bandung',
      verified: true,
    },
  })
  console.log('✅ Customer 1 created:', customer1.email)

  const customer2Password = await hash('customer123', 12)
  const customer2 = await prisma.user.create({
    data: {
      nama: 'Siti Rahayu',
      email: 'customer2@qiatrans.com',
      password: customer2Password,
      role: 'CUSTOMER',
      noTelepon: '081234567892',
      alamat: 'Jl. Sudirman No. 20, Surabaya',
      verified: true,
    },
  })
  console.log('✅ Customer 2 created:', customer2.email)

  const customer3Password = await hash('customer123', 12)
  const customer3 = await prisma.user.create({
    data: {
      nama: 'Ahmad Wijaya',
      email: 'customer3@qiatrans.com',
      password: customer3Password,
      role: 'CUSTOMER',
      noTelepon: '081234567893',
      alamat: 'Jl. Gatot Subroto No. 30, Yogyakarta',
      verified: false,
    },
  })
  console.log('✅ Customer 3 created:', customer3.email)

  // Create Vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        namaMobil: 'Toyota Fortuner',
        merk: 'Toyota',
        model: 'Fortuner VRZ',
        tahun: 2023,
        warna: 'Putih',
        platNomor: 'B 1234 XYZ',
        hargaSewa: 750000,
        kategori: 'SUV',
        transmisi: 'Automatic',
        bahanBakar: 'Diesel',
        kapasitas: 7,
        status: 'TERSEDIA',
        foto: '/uploads/fortuner.jpg',
        deskripsi: 'Toyota Fortuner VRZ 2023, SUV premium dengan mesin diesel tangguh. Cocok untuk perjalanan keluarga maupun off-road ringan.',
      },
    }),
    prisma.vehicle.create({
      data: {
        namaMobil: 'Honda Civic',
        merk: 'Honda',
        model: 'Civic RS',
        tahun: 2023,
        warna: 'Hitam',
        platNomor: 'B 5678 ABC',
        hargaSewa: 500000,
        kategori: 'Sedan',
        transmisi: 'Automatic',
        bahanBakar: 'Bensin',
        kapasitas: 5,
        status: 'TERSEDIA',
        foto: '/uploads/civic.jpg',
        deskripsi: 'Honda Civic RS 2023, sedan sporty dengan fitur lengkap. Nyaman untuk perjalanan bisnis maupun santai.',
      },
    }),
    prisma.vehicle.create({
      data: {
        namaMobil: 'Toyota Avanza',
        merk: 'Toyota',
        model: 'Avanza G',
        tahun: 2022,
        warna: 'Silver',
        platNomor: 'D 9012 DEF',
        hargaSewa: 300000,
        kategori: 'MPV',
        transmisi: 'Manual',
        bahanBakar: 'Bensin',
        kapasitas: 7,
        status: 'DISEWA',
        foto: '/uploads/avanza.jpg',
        deskripsi: 'Toyota Avanza G 2022, MPV keluarga yang ekonomis dan luas. Pilihan tepat untuk perjalanan bersama keluarga.',
      },
    }),
    prisma.vehicle.create({
      data: {
        namaMobil: 'Honda Brio',
        merk: 'Honda',
        model: 'Brio RS',
        tahun: 2023,
        warna: 'Merah',
        platNomor: 'D 3456 GHI',
        hargaSewa: 200000,
        kategori: 'Hatchback',
        transmisi: 'Automatic',
        bahanBakar: 'Bensin',
        kapasitas: 5,
        status: 'TERSEDIA',
        foto: '/uploads/brio.jpg',
        deskripsi: 'Honda Brio RS 2023, hatchback stylish dan irit bahan bakar. Cocok untuk mobilitas harian di kota.',
      },
    }),
    prisma.vehicle.create({
      data: {
        namaMobil: 'Mitsubishi Pajero Sport',
        merk: 'Mitsubishi',
        model: 'Pajero Sport Dakar',
        tahun: 2022,
        warna: 'Abu-abu',
        platNomor: 'L 7890 JKL',
        hargaSewa: 800000,
        kategori: 'SUV',
        transmisi: 'Automatic',
        bahanBakar: 'Diesel',
        kapasitas: 7,
        status: 'MAINTENANCE',
        foto: '/uploads/pajero.jpg',
        deskripsi: 'Mitsubishi Pajero Sport Dakar 2022, SUV tangguh dengan performa luar biasa. Ideal untuk petualangan dan perjalanan jauh.',
      },
    }),
    prisma.vehicle.create({
      data: {
        namaMobil: 'Suzuki Ertiga',
        merk: 'Suzuki',
        model: 'Ertiga GX',
        tahun: 2023,
        warna: 'Biru',
        platNomor: 'L 2345 MNO',
        hargaSewa: 350000,
        kategori: 'MPV',
        transmisi: 'Automatic',
        bahanBakar: 'Bensin',
        kapasitas: 7,
        status: 'TERSEDIA',
        foto: '/uploads/ertiga.jpg',
        deskripsi: 'Suzuki Ertiga GX 2023, MPV modern dengan konsumsi BBM efisien. Kabin luas dan nyaman untuk seluruh keluarga.',
      },
    }),
  ])
  console.log('✅ Vehicles created:', vehicles.length)

  // Create Rentals
  const now = new Date()
  const rentals = await Promise.all([
    prisma.rental.create({
      data: {
        userId: customer1.id,
        vehicleId: vehicles[2].id, // Avanza
        tanggalSewa: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
        tanggalKembali: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
        status: 'ACTIVE',
        totalHarga: 2100000,
        catatan: 'Sewa untuk liburan keluarga',
      },
    }),
    prisma.rental.create({
      data: {
        userId: customer2.id,
        vehicleId: vehicles[1].id, // Civic
        tanggalSewa: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
        tanggalKembali: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
        tanggalPengembalian: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
        status: 'COMPLETED',
        totalHarga: 3500000,
        catatan: 'Perjalanan bisnis ke Surabaya',
      },
    }),
    prisma.rental.create({
      data: {
        userId: customer1.id,
        vehicleId: vehicles[0].id, // Fortuner
        tanggalSewa: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        tanggalKembali: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        status: 'PENDING',
        totalHarga: 3000000,
        catatan: 'Rencana perjalanan ke Puncak',
      },
    }),
    prisma.rental.create({
      data: {
        userId: customer3.id,
        vehicleId: vehicles[3].id, // Brio
        tanggalSewa: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15),
        tanggalKembali: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12),
        tanggalPengembalian: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12),
        status: 'CANCELLED',
        totalHarga: 600000,
        catatan: 'Dibatalkan karena perubahan jadwal',
      },
    }),
  ])
  console.log('✅ Rentals created:', rentals.length)

  // Create Inspections with Detection Results
  const inspection1 = await prisma.inspection.create({
    data: {
      rentalId: rentals[0].id, // Active rental
      vehicleId: vehicles[2].id, // Avanza
      jenisInspeksi: 'SEBELUM_RENTAL',
      tanggal: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      status: 'VERIFIED',
      catatan: 'Kondisi kendaraan baik sebelum disewakan',
      detections: {
        create: [
          {
            lokasiLecet: 'Bumper Depan Kiri',
            confidence: 0.85,
            gambarAsli: '/uploads/inspection/detection-before-1-orig.jpg',
            gambarHasil: '/uploads/inspection/detection-before-1-result.jpg',
            severity: 'RINGAN',
            verified: true,
            verifiedBy: admin.id,
          },
          {
            lokasiLecet: 'Pintu Belakang Kanan',
            confidence: 0.72,
            gambarAsli: '/uploads/inspection/detection-before-2-orig.jpg',
            gambarHasil: '/uploads/inspection/detection-before-2-result.jpg',
            severity: 'RINGAN',
            verified: true,
            verifiedBy: admin.id,
          },
        ],
      },
    },
  })

  const inspection2 = await prisma.inspection.create({
    data: {
      rentalId: rentals[1].id, // Completed rental
      vehicleId: vehicles[1].id, // Civic
      jenisInspeksi: 'SESUDAH_RENTAL',
      tanggal: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      status: 'COMPLETED',
      catatan: 'Terdapat lecet baru setelah pengembalian',
      detections: {
        create: [
          {
            lokasiLecet: 'Fender Kanan Depan',
            confidence: 0.91,
            gambarAsli: '/uploads/inspection/detection-after-1-orig.jpg',
            gambarHasil: '/uploads/inspection/detection-after-1-result.jpg',
            severity: 'SEDANG',
            verified: false,
          },
          {
            lokasiLecet: 'Bumper Belakang',
            confidence: 0.68,
            gambarAsli: '/uploads/inspection/detection-after-2-orig.jpg',
            gambarHasil: '/uploads/inspection/detection-after-2-result.jpg',
            severity: 'RINGAN',
            verified: false,
          },
          {
            lokasiLecet: 'Side Body Kiri',
            confidence: 0.45,
            gambarAsli: '/uploads/inspection/detection-after-3-orig.jpg',
            gambarHasil: '/uploads/inspection/detection-after-3-result.jpg',
            severity: 'BERAT',
            verified: false,
          },
        ],
      },
    },
  })

  console.log('✅ Inspections created: 2')
  console.log('✅ Inspection 1 detections:', inspection1.id)
  console.log('✅ Inspection 2 detections:', inspection2.id)

  // Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: customer1.id,
        title: 'Rental Aktif',
        message: 'Rental Toyota Avanza Anda sedang berlangsung. Tanggal kembali: ' + new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toLocaleDateString('id-ID'),
        type: 'INFO',
      },
    }),
    prisma.notification.create({
      data: {
        userId: customer1.id,
        title: 'Booking Menunggu Konfirmasi',
        message: 'Booking Toyota Fortuner Anda sedang menunggu konfirmasi admin.',
        type: 'WARNING',
      },
    }),
    prisma.notification.create({
      data: {
        userId: customer2.id,
        title: 'Rental Selesai',
        message: 'Rental Honda Civic Anda telah selesai. Terima kasih telah menggunakan QiaTrans!',
        type: 'SUCCESS',
      },
    }),
  ])
  console.log('✅ Notifications created')

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
