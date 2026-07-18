import { hash } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.sUSResult.deleteMany()
  await prisma.uEQResult.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.rental.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.user.deleteMany()

  // Create Super Admin user
  const superAdminPassword = await hash('superadmin123', 12)
  const superAdmin = await prisma.user.create({
    data: {
      nama: 'Super Admin QiaTrans',
      email: 'superadmin@qiatrans.com',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      noTelepon: '081234567895',
      alamat: 'Jl. Super Admin No. 1, Jakarta',
      verified: true,
    },
  })
  console.log('✅ Super Admin created:', superAdmin.email)

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

  // Create Owner user
  const ownerPassword = await hash('owner123', 12)
  const owner = await prisma.user.create({
    data: {
      nama: 'Owner QiaTrans',
      email: 'owner@qiatrans.com',
      password: ownerPassword,
      role: 'OWNER',
      noTelepon: '081234567894',
      alamat: 'Jl. Owner No. 1, Jakarta',
      verified: true,
    },
  })
  console.log('✅ Owner created:', owner.email)

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
