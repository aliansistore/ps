# 🎮 ALIANSI STORE - PlayStation Game Marketplace

Website marketplace modern, kekinian, dan interaktif khusus game PlayStation 4 & PlayStation 5, langganan PS Plus, jasa isi game HEN subtitle Indonesia, dan voucher PSN. Dirancang dengan tema futuristik PlayStation, fitur checkout fleksibel (**Guest** maupun **Member**), serta **Panel Admin untuk Pemenuhan Order (Order Fulfillment)** secara instan.

Inspirasi layanan & alur transaksi mengacu pada model bisnis layanan digital game PlayStation seperti di `adzidigitalservice.my.id`.

---

## 🌟 Fitur Utama Website

### 1. 🛍️ Pengalaman Pembeli (Storefront)
- **Tampilan Keren & Kekinian**: Tema gelap futuristik PlayStation (*Dark Obsidian & Electric Blue Neon*) dengan efek *glassmorphism*, kartu bercahaya (*glow cards*), dan animasi mikro responsif.
- **Logo Brand Resmi**: Menggunakan logo resmi **ALIANSI STORE** dengan integrasi styling rapi di navbar dan invoice.
- **Pencarian & Filter Cepat**: Cari judul game secara *real-time* atau filter berdasarkan kategori:
  - 🎮 **PS5 Digital Games**
  - 🕹️ **PS4 Digital Games**
  - 🛠️ **Jasa Isi Game PS4 HEN Subtitle Indonesia**
  - 💎 **Langganan PlayStation Plus (Deluxe / Extra)**
  - 💳 **PSN Gift Card / Voucher Saldo IDR**
- **Pemilihan Tipe Akun Game Interaktif**:
  - **Akun Primary**: Main di user pribadi pembeli, trophy & save masuk ID pribadi, bisa online/offline.
  - **Akun Secondary**: Main langsung di akun yang disediakan toko dengan harga jauh lebih hemat.
  - **Panduan Pop-up Interaktif**: Penjelasan lengkap agar pembeli pemula tidak salah memilih.
- **Fleksibilitas Checkout**:
  - **Guest Checkout (Beli Cepat)**: Cukup masukkan Nama dan No. WhatsApp aktif (tanpa perlu repot daftar akun).
  - **Member Checkout**: Tersedia opsi daftar/login untuk menyimpan data profil dan riwayat belanja.
- **Kupon Diskon / Voucher**:
  - `ALIANSIBARU` (Diskon 10% untuk pelanggan baru)
  - `PS5HEMAT` (Diskon 15% untuk pembelian game PS5)
- **Metode Pembayaran Lengkap**:
  - 📲 **QRIS Dinamis** (Mendukung BCA Mobile, Livin by Mandiri, BRImo, DANA, GoPay, OVO, ShopeePay).
  - 🏦 **Transfer Bank** (BCA, Mandiri, BRI dengan tombol salin nomor rekening 1-klik).
  - 💬 **Konfirmasi WhatsApp Otomatis**: Pesan WhatsApp terformat rapi siap dikirim ke CS.
- **Sistem Pelacakan Invoice / Cek Pesanan**:
  - Setiap order mendapatkan Nomor Invoice unik (contoh: `ALN-20261103-7842`).
  - *Stepper visualizer* 4 tahapan status: *Menunggu Bayar ➔ Terverifikasi ➔ Diproses Admin ➔ Selesai*.
  - **Akses Kredensial Game Otomatis**: Saat pesanan diselesaikan oleh Admin, detail Akun PSN (Email, Password dengan tombol intip/salin, kode cadangan 2FA, link tutorial) langsung muncul di halaman invoice pembeli!

---

### 2. 🛡️ Panel Admin & Pemenuhan Order (Order Fulfillment)
Akses dashboard dengan menekan tombol **"Admin Mode"** di header navigasi (PIN Default: `1234`).

- **Dashboard Statistik Toko**:
  - Total Pendapatan / Omset transaksi yang lunas.
  - Total Pesanan Masuk.
  - Notifikasi Pesanan yang Perlu Diproses (*Pending Fulfillment*).
  - Total Game yang aktif di katalog.
- **Pusat Pemenuhan Order (Order Fulfillment Center)**:
  - Menampilkan daftar seluruh order yang masuk.
  - Tombol **"Kirim Akun / Fulfillment"**:
    - Membuka form pengisian: Email Akun PSN, Password, Kode Cadangan 2FA, Link Panduan, dan Catatan Khusus.
    - Sekali klik **"Simpan & Kirim ke Pembeli"**, status pesanan langsung berubah menjadi **SELESAI**.
    - Data akun otomatis tersimpan ke invoice pembeli.
    - Muncul opsi untuk langsung membuka WhatsApp dan mengirim format pesan kredensial akun ke pembeli dengan 1-klik!
  - Tombol verifikasi manual pembayaran (*Lunas*).
- **Manajemen Katalog Game (CRUD)**:
  - **Tambah Game Baru**: Masukkan judul, platform (PS4/PS5/HEN), kategori, harga akun Primary & Secondary, URL poster, dan deskripsi.
  - **Edit Game**: Perbarui harga dan detail game kapan saja.
  - **Status Stok**: Aktifkan / nonaktifkan stok dengan tombol *Ready Stok / Habis*.
  - **Hapus Game**: Menghapus game dari katalog.
- **Reset Demo Data**:
  - Tombol untuk mengembalikan data katalog dan pesanan ke kondisi awal untuk simulasi pengujian.

---

## 🚀 Cara Menjalankan Website

Website ini dibuat dengan arsitektur web modern yang mandiri (*zero-dependency*), sehingga dapat dijalankan dengan beberapa cara mudah:

### Cara 1: Menggunakan Script Server Otomatis (Direkomendasikan)
Cukup **dobel klik** file:
```
start.bat
```
Atau buka terminal PowerShell di folder ini dan jalankan:
```powershell
.\server.ps1
```
Browser Anda akan otomatis terbuka di alamat: **`http://localhost:5500`**

### Cara 2: Buka Langsung File HTML
Anda juga bisa langsung melakukan **dobel klik** pada file:
```
index.html
```
File akan terbuka langsung di browser (Google Chrome, Microsoft Edge, Firefox, Brave) tanpa perlu menjalankan server apa pun!

---

## 📁 Struktur Folder & File

```
aliansi-store/
├── assets/
│   ├── app.js               # Logika aplikasi, keranjang, checkout, invoice & admin
│   ├── logo.png             # Logo resmi ALIANSI STORE
│   ├── products-data.js     # Database awal game, pesanan demo & konfigurasi toko
│   └── style.css            # Desain tampilan neon futuristik PlayStation & glassmorphism
├── index.html               # File utama antarmuka toko & dashboard admin
├── README.md                # Dokumentasi lengkap panduan aplikasi
├── server.ps1               # Script server HTTP lokal ringan bawaan PowerShell
└── start.bat                # Shortcut dobel klik untuk Windows
```

---

## ⚙️ Kustomisasi Toko (Pengaturan WhatsApp & Rekening)

Untuk mengubah nomor WhatsApp Admin atau nomor rekening toko, Anda cukup membuka file [assets/products-data.js](file:///G:/My%20Drive/Personal/Project/Website%20Jualan%20Game%20PS4/assets/products-data.js) pada bagian `INITIAL_CONFIG`:

```javascript
const INITIAL_CONFIG = {
  storeName: "ALIANSI STORE",
  tagline: "Pusat Game Digital PS4, PS5 & Layanan PlayStation Terpercaya Indonesia",
  whatsappNumber: "6281234567890", // Ganti dengan nomor WhatsApp Admin Anda
  whatsappFormatted: "+62 812-3456-7890",
  adminPin: "1234",               // Ganti PIN login admin Anda di sini
  bankAccounts: [
    { bank: "BCA", number: "8830192831", name: "ALIANSI STORE INDONESIA" },
    { bank: "MANDIRI", number: "1370019283741", name: "ALIANSI STORE INDONESIA" },
    { bank: "BRI", number: "018201002938530", name: "ALIANSI STORE INDONESIA" },
    { bank: "DANA / OVO / GOPAY", number: "0812-3456-7890", name: "ALIANSI STORE" }
  ]
};
```

---

## 🎮 Kredensial Demo untuk Pengujian Cepat

- **PIN Admin**: `1234` (atau `admin`)
- **Contoh No. Invoice untuk Dilacak**:
  - `ALN-20261103-7842` (Status: *Perlu Diproses* - Coba proses di Admin Mode!)
  - `ALN-20261103-6521` (Status: *Selesai* - Kredensial akun game sudah tampil di invoice)
  - `ALN-20261103-5109` (Status: *Menunggu Bayar* - Muncul QRIS / Transfer Bank)
- **Kode Voucher Diskon**: `ALIANSIBARU` (10%), `PS5HEMAT` (15%)
