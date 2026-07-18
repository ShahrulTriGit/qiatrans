const admin = require('firebase-admin');
const path = require('path');
const { hashSync } = require('bcryptjs');

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const now = new Date().toISOString();

async function seed() {
  console.log('Memulai seeding data...\n');

  // 1. Create Super Admin User
  console.log('Membuat user super admin...');
  const superAdminPassword = hashSync('superadmin123', 12);
  const superAdminRef = await db.collection('users').add({
    nama: 'Super Admin QiaTrans',
    email: 'superadmin@qiatrans.com',
    password: superAdminPassword,
    role: 'SUPER_ADMIN',
    verified: true,
    noTelepon: '081234567895',
    alamat: 'Jl. Super Admin No. 1',
    fotoProfil: null,
    noKTP: null,
    noSIM: null,
    fotoKTP: null,
    fotoSIM: null,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`  ✓ Super Admin: superadmin@qiatrans.com / superadmin123 (ID: ${superAdminRef.id})`);

  // 1a. Create Admin User
  console.log('Membuat user admin...');
  const adminPassword = hashSync('admin123', 12);
  const adminRef = await db.collection('users').add({
    nama: 'Admin QiaTrans',
    email: 'admin@qiatrans.com',
    password: adminPassword,
    role: 'ADMIN',
    verified: true,
    noTelepon: '081234567890',
    alamat: 'Jl. Contoh No. 123',
    fotoProfil: null,
    noKTP: null,
    noSIM: null,
    fotoKTP: null,
    fotoSIM: null,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`  ✓ Admin: admin@qiatrans.com / admin123 (ID: ${adminRef.id})`);

  // 1b. Create Owner User
  console.log('Membuat user owner...');
  const ownerPassword = hashSync('owner123', 12);
  const ownerRef = await db.collection('users').add({
    nama: 'Owner QiaTrans',
    email: 'owner@qiatrans.com',
    password: ownerPassword,
    role: 'OWNER',
    verified: true,
    noTelepon: '081234567894',
    alamat: 'Jl. Owner No. 1',
    fotoProfil: null,
    noKTP: null,
    noSIM: null,
    fotoKTP: null,
    fotoSIM: null,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`  ✓ Owner: owner@qiatrans.com / owner123 (ID: ${ownerRef.id})`);

  // 2. Create Sample Customer
  console.log('Membuat user customer...');
  const customerPassword = hashSync('customer123', 12);
  const customerRef = await db.collection('users').add({
    nama: 'Budi Santoso',
    email: 'budi@email.com',
    password: customerPassword,
    role: 'CUSTOMER',
    verified: true,
    noTelepon: '081234567891',
    alamat: 'Jl. Merdeka No. 45',
    fotoProfil: null,
    noKTP: '3173010101900001',
    noSIM: '123456789012',
    fotoKTP: null,
    fotoSIM: null,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`  ✓ Customer: budi@email.com / customer123 (ID: ${customerRef.id})`);

  // 3. Create Vehicles
  console.log('\nMembuat data kendaraan...');
  const vehicles = [
    {
      namaMobil: 'Toyota Avanza',
      merk: 'Toyota',
      model: 'Avanza 1.3 E',
      tahun: 2023,
      warna: 'Putih',
      platNomor: 'B 1234 CD',
      hargaSewa: 350000,
      hargaSewa12Jam: 210000,
      kategori: 'MPV (Multi Purpose Vehicle)',
      transmisi: 'Manual',
      bahanBakar: 'Bensin',
      kapasitas: 7,
      status: 'TERSEDIA',
      foto: '/uploads/avanza.jpg',
      deskripsi: 'Toyota Avanza 1.3 E, cocok untuk keluarga, irit bahan bakar.',
      createdAt: now,
      updatedAt: now,
    },
    {
      namaMobil: 'Honda Brio',
      merk: 'Honda',
      model: 'Brio Satya E',
      tahun: 2022,
      warna: 'Merah',
      platNomor: 'B 5678 EF',
      hargaSewa: 250000,
      hargaSewa12Jam: 150000,
      kategori: 'City Car',
      transmisi: 'Manual',
      bahanBakar: 'Bensin',
      kapasitas: 5,
      status: 'TERSEDIA',
      foto: '/uploads/brio.jpg',
      deskripsi: 'Honda Brio Satya E, lincah di perkotaan, konsumsi BBM irit.',
      createdAt: now,
      updatedAt: now,
    },
    {
      namaMobil: 'Mitsubishi Pajero',
      merk: 'Mitsubishi',
      model: 'Pajero Sport Dakar',
      tahun: 2024,
      warna: 'Hitam',
      platNomor: 'B 9012 GH',
      hargaSewa: 750000,
      hargaSewa12Jam: 450000,
      kategori: 'Van/Minibus',
      transmisi: 'Automatic',
      bahanBakar: 'Diesel',
      kapasitas: 7,
      status: 'TERSEDIA',
      foto: '/uploads/pajero.jpg',
      deskripsi: 'Mitsubishi Pajero Sport Dakar, tangguh di segala medan.',
      createdAt: now,
      updatedAt: now,
    },
    {
      namaMobil: 'Daihatsu Sigra',
      merk: 'Daihatsu',
      model: 'Sigra 1.0 D',
      tahun: 2023,
      warna: 'Silver',
      platNomor: 'B 3456 IJ',
      hargaSewa: 200000,
      hargaSewa12Jam: 120000,
      kategori: 'MPV (Multi Purpose Vehicle)',
      transmisi: 'Manual',
      bahanBakar: 'Bensin',
      kapasitas: 7,
      status: 'TERSEDIA',
      foto: '/uploads/sigra.jpg',
      deskripsi: 'Daihatsu Sigra 1.0 D, ekonomis untuk perjalanan sehari-hari.',
      createdAt: now,
      updatedAt: now,
    },
    {
      namaMobil: 'Toyota Fortuner',
      merk: 'Toyota',
      model: 'Fortuner GR Sport',
      tahun: 2024,
      warna: 'Putih',
      platNomor: 'B 7890 KL',
      hargaSewa: 850000,
      hargaSewa12Jam: 510000,
      kategori: 'Van/Minibus',
      transmisi: 'Automatic',
      bahanBakar: 'Diesel',
      kapasitas: 7,
      status: 'TERSEDIA',
      foto: '/uploads/fortuner.jpg',
      deskripsi: 'Toyota Fortuner GR Sport, performa tinggi dengan kenyamanan maksimal.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const vehicleRefs = [];
  for (const v of vehicles) {
    const ref = await db.collection('vehicles').add(v);
    vehicleRefs.push(ref.id);
    console.log(`  ✓ ${v.namaMobil} (${v.platNomor})`);
  }

  console.log('\n✓ Seeding selesai!');
  console.log(`\nLogin Super Admin: superadmin@qiatrans.com / superadmin123`);
  console.log(`Login Admin:       admin@qiatrans.com / admin123`);
  console.log(`Login Owner:       owner@qiatrans.com / owner123`);
  console.log(`Login User:        budi@email.com / customer123`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding gagal:', err);
  process.exit(1);
});
