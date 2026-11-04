-- ========================================================
-- ALIANSI STORE - Supabase Database Schema & Initial Data
-- Run this in Supabase: Dashboard > SQL Editor > New Query > Paste & Run
-- ========================================================

-- 1. Table: products
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  platform JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  type TEXT DEFAULT 'digital',
  badge TEXT,
  is_sub_indo BOOLEAN DEFAULT false,
  is_hen BOOLEAN DEFAULT false,
  is_spotlight BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0,
  sold_count INTEGER DEFAULT 0,
  release_year INTEGER,
  size TEXT,
  publisher TEXT,
  tagline TEXT,
  images JSONB DEFAULT '{}'::jsonb,
  prices JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_type TEXT DEFAULT 'guest',
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  notes TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  voucher_code TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'PENDING',
  status TEXT DEFAULT 'PENDING_PAYMENT',
  fulfillment JSONB
);

-- 3. Table: store_config
CREATE TABLE IF NOT EXISTS public.store_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  store_name TEXT DEFAULT 'ALIANSI STORE',
  tagline TEXT,
  whatsapp_number TEXT,
  whatsapp_formatted TEXT,
  admin_pin TEXT DEFAULT '1234',
  bank_accounts JSONB DEFAULT '[]'::jsonb,
  vouchers JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: customers
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  identifier TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  pin TEXT,
  role TEXT DEFAULT 'customer',
  role_label TEXT DEFAULT 'Member',
  avatar TEXT DEFAULT '🎮',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) with open public policies for Storefront
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Products Policies: Anyone can view, anon/admin can insert/update
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert/update products" ON public.products;
CREATE POLICY "Anyone can insert/update products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Orders Policies: Anyone can view their invoice and create orders
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create and update orders" ON public.orders;
CREATE POLICY "Public can create and update orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Store Config Policies
DROP POLICY IF EXISTS "Public can view store config" ON public.store_config;
CREATE POLICY "Public can view store config" ON public.store_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update store config" ON public.store_config;
CREATE POLICY "Anyone can update store config" ON public.store_config FOR ALL USING (true) WITH CHECK (true);

-- Customers Policies
DROP POLICY IF EXISTS "Public can view customers" ON public.customers;
CREATE POLICY "Public can view customers" ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can register and update customers" ON public.customers;
CREATE POLICY "Public can register and update customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- Initial Data Seeding
-- ========================================================

-- Store Config
INSERT INTO public.store_config (id, store_name, tagline, whatsapp_number, whatsapp_formatted, admin_pin, bank_accounts, vouchers)
VALUES (
  'main',
  'ALIANSI STORE',
  'Spesialis Game PS4 HEN, Game Subtitle Indonesia & Akun Digital Terpercaya',
  '6281234567890',
  '+62 812-3456-7890',
  '1234',
  '[
    {"bank": "BCA", "number": "8830192831", "name": "ALIANSI STORE INDONESIA"},
    {"bank": "MANDIRI", "number": "1370019283741", "name": "ALIANSI STORE INDONESIA"},
    {"bank": "BRI", "number": "018201002938530", "name": "ALIANSI STORE INDONESIA"},
    {"bank": "DANA / OVO / GOPAY", "number": "0812-3456-7890", "name": "ALIANSI STORE"}
  ]'::jsonb,
  '[
    {"code": "ALIANSIBARU", "discountPercent": 10, "minPurchase": 100000, "maxDiscount": 30000},
    {"code": "HENHEMAT", "discountPercent": 15, "minPurchase": 200000, "maxDiscount": 50000}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  tagline = EXCLUDED.tagline,
  whatsapp_number = EXCLUDED.whatsapp_number,
  whatsapp_formatted = EXCLUDED.whatsapp_formatted,
  bank_accounts = EXCLUDED.bank_accounts,
  vouchers = EXCLUDED.vouchers;

-- Initial Products (14 Official Subtitle Indonesia & Bitbox Titles)
DELETE FROM public.products;
INSERT INTO public.products (id, title, slug, platform, category, type, badge, is_sub_indo, is_hen, is_spotlight, rating, sold_count, release_year, size, publisher, tagline, images, prices, description, features, in_stock)
VALUES
(
  'game-it-takes-two-subindo',
  'It Takes Two (Full Subtitle Indonesia)',
  'it-takes-two-sub-indo-ps4-hen',
  '["PS4 HEN", "PS4", "PS5"]'::jsonb,
  'subindo',
  'digital',
  'ðŸ‘« GAME OF THE YEAR',
  true, true, true, 5.0, 1350, 2021, '45 GB',
  'Electronic Arts / Hazelight Studios',
  'Petualangan Co-op Terbaik Pemenang Game of the Year dengan Subtitle Indonesia Rapi',
  '{"poster": "assets/covers/it-takes-two.jpg", "cover": "assets/covers/it-takes-two.jpg"}'::jsonb,
  '{"primary": 120000, "secondary": 70000, "original": 479000}'::jsonb,
  'Mainkan mahakarya petualangan co-op 2 pemain paling seru It Takes Two dengan Full Subtitle Bahasa Indonesia.',
  '["100% Subtitle Indonesia (Dialog Cody, May, & Dr. Hakim)", "Mendukung Split-screen 2 Pemain Offline & Online", "Kompatibel PS4 HEN (Firmware 5.05 - 11.00) & Akun Digital", "Termasuk Panduan Pasang File PKG Mudah", "Garansi Game Lancar Bebas Bug"]'::jsonb,
  true
),
(
  'game-gow-ragnarok-subindo',
  'God of War RagnarÃ¶k (Full Subtitle Indonesia)',
  'god-of-war-ragnarok-sub-indo',
  '["PS4 HEN", "PS5", "PS4"]'::jsonb,
  'subindo',
  'digital',
  'ðŸ† MASTERPIECE SUB INDO',
  true, true, true, 5.0, 2680, 2022, '110 GB',
  'PlayStation Studios / Santa Monica',
  'Perjalanan Terakhir Kratos & Atreus Menghadapi Takdir 9 Alam dalam Bahasa Indonesia',
  '{"poster": "assets/covers/gow-ragnarok.jpg", "cover": "assets/covers/gow-ragnarok.jpg"}'::jsonb,
  '{"primary": 250000, "secondary": 140000, "original": 879000}'::jsonb,
  'Babak penutup epik saga Nordik Kratos dan Atreus kini hadir dengan terjemahan Bahasa Indonesia terlengkap.',
  '["Full Subtitle Bahasa Indonesia Lengkap Misi & Lore Kodex", "Mendukung DLC Valhalla Terintegrasi", "Tampilan 60 FPS Sangat Halus di PS4 Pro & PS5", "Kompatibel PS4 HEN Firmware 5.05 hingga 11.00", "Full Part Google Drive Super Cepat"]'::jsonb,
  true
),
(
  'game-ghost-tsushima-subindo',
  'Ghost of Tsushima: Director''s Cut (Full Subtitle Indonesia)',
  'ghost-of-tsushima-sub-indo',
  '["PS4 HEN", "PS5", "PS4"]'::jsonb,
  'subindo',
  'digital',
  'âš”ï¸ SAMURAI EPIC',
  true, true, true, 5.0, 2150, 2021, '60 GB',
  'PlayStation Studios / Sucker Punch',
  'Kisah Perjuangan Jin Sakai Menjadi Sang Hantu Tsushima dengan Subtitle Indonesia',
  '{"poster": "assets/covers/ghost-tsushima.jpg", "cover": "assets/covers/ghost-tsushima.jpg"}'::jsonb,
  '{"primary": 195000, "secondary": 110000, "original": 729000}'::jsonb,
  'Rasakan keindahan pulau Tsushima era feodal Jepang dalam kisah Jin Sakai yang berkorban mempertahankan tanah kelahirannya.',
  '["Teks & Dialog Cerita Full Subtitle Bahasa Indonesia", "Termasuk Ekspansi Pulau Iki & Mode Kurosawa", "Audio Dubbing Jepang Asli dengan Lipsync Akurat", "Kompatibel PS4 HEN Semua Firmware", "File Game PKG Tested 100% Anti Crash"]'::jsonb,
  true
),
(
  'game-tlou-part2-subindo',
  'The Last of Us Part II (Full Subtitle Indonesia)',
  'the-last-of-us-part-2-sub-indo',
  '["PS4 HEN", "PS5", "PS4"]'::jsonb,
  'subindo',
  'digital',
  'ðŸ”¥ INTENSE DRAMA',
  true, true, true, 4.9, 1980, 2020, '78 GB',
  'PlayStation Studios / Naughty Dog',
  'Kisah Balas Dendam Penuh Emosi Ellie & Abby dengan Subtitle Indonesia Lengkap',
  '{"poster": "assets/covers/tlou-part2.jpg", "cover": "assets/covers/tlou-part2.jpg"}'::jsonb,
  '{"primary": 190000, "secondary": 105000, "original": 579000}'::jsonb,
  'Lanjutan perjalanan emosional Ellie melintasi Seattle pasca-pandemi dalam misi membalas dendam.',
  '["Full Subtitle Bahasa Indonesia Dialog & File Surat Rahasia", "Gameplay Stealth Survival Paling Realistis", "Visual Menakjubkan Memaksimalkan Kemampuan PS4", "Support PS4 HEN Firmware 5.05 - 11.00", "File Google Drive Lengkap Part 1 - Selesai"]'::jsonb,
  true
),
(
  'game-gta5-subindo',
  'GTA V MOD Subtitle Indonesia',
  'gta-v-mod-sub-indo-ps4-hen',
  '["PS4 HEN", "PS4", "PS5"]'::jsonb,
  'subindo',
  'digital',
  'ðŸš— MOD INDONESIA',
  true, true, true, 5.0, 3120, 2023, '85 GB',
  'Rockstar Games / ALIANSI Mod Team',
  'Jelajahi Los Santos dengan Subtitle Indonesia, Cheat Menu Trainer & Mod Lokal',
  '{"poster": "assets/covers/gta-v.jpg", "cover": "assets/covers/gta-v.jpg"}'::jsonb,
  '{"primary": 150000, "secondary": 85000, "original": 429000}'::jsonb,
  'Kisah tiga serangkai Michael, Franklin, dan Trevor kini dilengkapi Subtitle Indonesia lengkap, Menu Cheat Trainer bawaan, dan mod lokal.',
  '["100% Subtitle Indonesia Misi Cerita Utama & Percakapan Telepon", "Dilengkapi Menu Mod Trainer Siap Pakai di PS4 HEN", "Bonus Opsi Kendaraan Lokal Indonesia", "Gameplay Sangat Stabil Bebas Error", "Akses Link Google Drive Selamanya"]'::jsonb,
  true
),
(
  'game-mk11-subindo',
  'Mortal Kombat 11 Ultimate (Full Subtitle Indonesia)',
  'mortal-kombat-11-ultimate-sub-indo',
  '["PS4 HEN", "PS4", "PS5"]'::jsonb,
  'subindo',
  'digital',
  'ðŸ¥Š ALL DLC UNLOCKED',
  true, true, false, 4.9, 1420, 2020, '68 GB',
  'Warner Bros. Games / NetherRealm',
  'Edisi Terlengkap Termasuk Aftermath & Kombat Pack dengan Story Mode Sub Indo',
  '{"poster": "assets/covers/mortal-kombat-11.jpg", "cover": "assets/covers/mortal-kombat-11.jpg"}'::jsonb,
  '{"primary": 140000, "secondary": 80000, "original": 499000}'::jsonb,
  'Versi puncak dari game fighting terpopuler dengan grafik sinematik spektakuler.',
  '["Subtitle Indonesia untuk Story Mode Sinematik & Aftermath", "Karakter Lengkap: Rambo, Terminator, Robocop, Spawn, Joker", "Fatality & Brutality Unlocked", "Mode 2 Pemain Versus Seru Bersama Teman", "Support PS4 HEN Semua Versi"]'::jsonb,
  true
),
(
  'game-hogwarts-legacy-subindo',
  'Hogwarts Legacy (Full Subtitle Indonesia)',
  'hogwarts-legacy-sub-indo',
  '["PS4 HEN", "PS5", "PS4"]'::jsonb,
  'subindo',
  'digital',
  'ðŸª„ OPEN WORLD RPG',
  true, true, true, 4.9, 1890, 2023, '75 GB',
  'Warner Bros. Games / Avalanche',
  'Jadilah Penyihir di Dunia Harry Potter Abad ke-19 dengan Subtitle Indonesia Rapi',
  '{"poster": "assets/covers/hogwarts-legacy.jpg", "cover": "assets/covers/hogwarts-legacy.jpg"}'::jsonb,
  '{"primary": 230000, "secondary": 130000, "original": 799000}'::jsonb,
  'Petualangan RPG aksi dunia terbuka di dunia sihir Hogwarts tahun 1800-an.',
  '["100% Subtitle Indonesia Misi Cerita, Dialog Guru & Mantra", "Bebas Buat Karakter Penyihir & Masuk Asrama Impian", "Eksplorasi Dunia Sihir Terbuka yang Sangat Luas", "Format PKG PS4 HEN Siap Pasang", "Kecepatan Download Maksimal Google Drive"]'::jsonb,
  true
),
(
  'game-uncharted-4-subindo',
  'Uncharted 4: A Thief''s End (Full Subtitle Indonesia)',
  'uncharted-4-a-thiefs-end-sub-indo',
  '["PS4 HEN", "PS5", "PS4"]'::jsonb,
  'subindo',
  'digital',
  'ðŸ§­ ACTION ADVENTURE',
  true, true, false, 5.0, 2210, 2021, '55 GB',
  'PlayStation Studios / Naughty Dog',
  'Petualangan Terakhir Nathan Drake Mencari Harta Karun Bajak Laut Henry Avery',
  '{"poster": "assets/covers/uncharted-4.jpg", "cover": "assets/covers/uncharted-4.jpg"}'::jsonb,
  '{"primary": 130000, "secondary": 75000, "original": 379000}'::jsonb,
  'Ikuti aksi petualangan mendebarkan Nathan Drake mencari kota koloni bajak laut Libertalia.',
  '["Full Subtitle Indonesia untuk Semua Dialog & Buku Catatan Drake", "Aksi Tembak-Menembak & Parkour Sinematik Memukau", "Teka-teki Misteri Bajak Laut Menantang", "Mendukung Konsol PS4 HEN Semua Firmware", "File Game Lengkap Bersih dari Corrupt"]'::jsonb,
  true
),
(
  'game-stray-subindo',
  'Stray (Full Subtitle Indonesia)',
  'stray-sub-indo-ps4-hen',
  '["PS4 HEN", "PS4", "PS5"]'::jsonb,
  'subindo',
  'digital',
  'ðŸ± KUCING CYBERPUNK',
  true, true, false, 4.9, 1650, 2022, '15 GB',
  'Annapurna Interactive / BlueTwelve',
  'Eksplorasi Kota Cyberpunk Penuh Robot sebagai Kucing Oren Pintar dengan Teks Indonesia',
  '{"poster": "assets/covers/stray.jpg", "cover": "assets/covers/stray.jpg"}'::jsonb,
  '{"primary": 110000, "secondary": 65000, "original": 349000}'::jsonb,
  'Game unik peraih penghargaan di mana Anda mengendalikan kucing oren tersesat di dalam kota futuristik bawah tanah.',
  '["Full Teks & Subtitle Bahasa Indonesia Dialog Robot & Drone B-12", "Ukuran Ringan (Hanya 15 GB), Cepat Didownload", "Visual Cyberpunk Bernuansa Neon Sangat Cantik", "Support PS4 HEN 5.05 hingga 11.00", "Link Google Drive Praktis & Cepat"]'::jsonb,
  true
),
(
  'game-ac-odyssey-subindo',
  'Assassin''s Creed Odyssey (Full Subtitle Indonesia)',
  'assassins-creed-odyssey-sub-indo',
  '["PS4 HEN", "PS4", "PS5"]'::jsonb,
  'subindo',
  'digital',
  'ðŸ›ï¸ YUNANI KUNO RPG',
  true, true, false, 4.8, 1720, 2020, '80 GB',
  'Ubisoft',
  'Pilih Alexios atau Kassandra dan Taklukkan Yunani Kuno dalam Bahasa Indonesia',
  '{"poster": "assets/covers/ac-odyssey.jpg", "cover": "assets/covers/ac-odyssey.jpg"}'::jsonb,
  '{"primary": 145000, "secondary": 85000, "original": 589000}'::jsonb,
  'Jadilah pahlawan Sparta legendaris di era Perang Peloponnesos dengan seluruh pilihan dialog cerita bersubtitle Bahasa Indonesia.',
  '["Subtitle Bahasa Indonesia untuk Seluruh Quest Utama & Percabangan Cerita", "Pilihan Karakter Alexios atau Kassandra", "Pertempuran Kolosal Perang 300 Prajurit & Perang Kapal Laut", "Kompatibel PS4 HEN Semua Versi", "Garansi File PKG Bebas Rusak"]'::jsonb,
  true
),
(
  'game-one-piece-odyssey-subindo',
  'One Piece Odyssey (Full Subtitle Indonesia)',
  'one-piece-odyssey-sub-indo',
  '["PS4 HEN", "PS4", "PS5"]'::jsonb,
  'subindo',
  'digital',
  'ðŸ´â€â˜ ï¸ ANIME RPG',
  true, true, false, 4.8, 1390, 2023, '35 GB',
  'Bandai Namco / ILCA',
  'Petualangan Kru Bajak Laut Topi Jerami di Pulau Misterius Waford dengan Subtitle Indonesia',
  '{"poster": "assets/covers/one-piece-odyssey.jpg", "cover": "assets/covers/one-piece-odyssey.jpg"}'::jsonb,
  '{"primary": 175000, "secondary": 95000, "original": 649000}'::jsonb,
  'Game RPG turn-based orisinal kreasi Eiichiro Oda bersama kru Mugiwara dalam Bahasa Indonesia.',
  '["100% Subtitle Indonesia Seluruh Dialog & Jurus Spesial Mugiwara", "Cerita Orisinal Pengawasan Langsung Eiichiro Oda", "Pertarungan Turn-based Strategis Berbasis Area", "Support PS4 HEN Semua Versi", "Link Download Cepat Tanpa Batas Kuota"]'::jsonb,
  true
),
(
  'game-watch-dogs-subindo',
  'Watch Dogs (Full Subtitle Indonesia)',
  'watch-dogs-sub-indo-ps4-hen',
  '["PS4 HEN", "PS4", "PS5"]'::jsonb,
  'subindo',
  'digital',
  'ðŸ’» HACKER OPEN WORLD',
  true, true, false, 4.7, 1540, 2020, '25 GB',
  'Ubisoft',
  'Retas Seluruh Kota Chicago sebagai Aiden Pearce dengan Dialog Subtitle Indonesia',
  '{"poster": "assets/covers/watch-dogs.jpg", "cover": "assets/covers/watch-dogs.jpg"}'::jsonb,
  '{"primary": 95000, "secondary": 55000, "original": 299000}'::jsonb,
  'Gunakan smartphone Anda sebagai senjata terhebat untuk mengendalikan sistem ctOS di kota Chicago dengan Subtitle Indonesia lengkap.',
  '["Subtitle Bahasa Indonesia Misi Cerita Utama & Audio Log", "Mekanik Hacking Kota Open-World Unik", "Aksi Tembak dan Stealth yang Solid", "Kompatibel PS4 HEN Firmware 5.05 - 11.00", "Ukuran Hemat 25 GB Siap Instalasi Cepat"]'::jsonb,
  true
),
(
  'game-spiderman-subindo',
  'Marvel''s Spider-Man (Full Subtitle Indonesia)',
  'marvels-spider-man-sub-indo',
  '["PS4 HEN", "PS5", "PS4"]'::jsonb,
  'subindo',
  'digital',
  'ðŸ•·ï¸ SUPERHERO HIT',
  true, true, true, 5.0, 3450, 2021, '50 GB',
  'PlayStation Studios / Insomniac',
  'Berayun di Kota New York Melawan Sinister Six dengan Terjemahan Sub Indo Lengkap',
  '{"poster": "assets/covers/spiderman.jpg", "cover": "assets/covers/spiderman.jpg"}'::jsonb,
  '{"primary": 160000, "secondary": 90000, "original": 579000}'::jsonb,
  'Rasakan sensasi berayun jaring laba-laba paling dinamis sebagai Peter Parker melintasi gedung pencakar langit New York City.',
  '["100% Subtitle Indonesia Dialog Peter, MJ, Miles & Sinister Six", "Termasuk Paket 3 DLC Cerita The City That Never Sleeps", "Buka Beragam Kostum Ikonik Spider-Man", "Support PS4 HEN Semua Firmware", "File Game Teruji 100% Working"]'::jsonb,
  true
),
(
  'game-pes-2027-bitbox',
  'PES 2027 Bitbox Summer Update',
  'pes-2027-bitbox-summer-update-ps4-hen',
  '["PS4 HEN", "PS4"]'::jsonb,
  'sports',
  'digital',
  'âš½ LATEST UPDATE 2027',
  true, true, true, 5.0, 4120, 2027, '42 GB',
  'Konami / Bitbox Patch Team',
  'Patch Musim Panas Terbaru: Jersey 2026/2027, Bursa Transfer Eropa, BRI Liga 1 & Timnas',
  '{"poster": "assets/covers/pes-2027.jpg", "cover": "assets/covers/pes-2027.jpg"}'::jsonb,
  '{"primary": 135000, "secondary": 75000, "original": 399000}'::jsonb,
  'Patch Bitbox Summer Edition membawa pembaruan bursa transfer terkini musim 2026/2027, jersey anyar, serta BRI Liga 1 dan Timnas Indonesia lengkap.',
  '["Update Transfer Pemain Musim Panas 2026/2027 Lengkap", "BRI Liga 1 Indonesia & Timnas Garuda Full Face Realistis", "Komentator Jernih & Stadion Terkenal Eropa Berlisensi", "Grafis Tajam & Gameplay Responsif untuk PS4 HEN", "Tinggal Pasang File PKG Langsung Main"]'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  platform = EXCLUDED.platform,
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  prices = EXCLUDED.prices,
  images = EXCLUDED.images,
  in_stock = EXCLUDED.in_stock,
  updated_at = NOW();

-- Initial Demo Orders
INSERT INTO public.orders (id, customer_type, customer_name, customer_phone, customer_email, notes, items, subtotal, discount, total, payment_method, payment_status, status, fulfillment)
VALUES
(
  'ALN-20261103-7842',
  'member',
  'Rian Pratama',
  '081234567890',
  'rian.pratama@gmail.com',
  'Tolong kirim panduan install PKG untuk PS4 HEN ya min',
  '[{"productId": "game-re4-subindo", "title": "Resident Evil 4 Remake (Full Subtitle Indonesia)", "variant": "primary", "price": 290000, "qty": 1, "platform": "PS4 HEN"}]'::jsonb,
  290000, 0, 290000, 'qris', 'PAID', 'COMPLETED',
  '{"account": "Link PKG Google Drive Private Server Aliansi", "password": "Token Akses: ALN-RE4-IND-9912", "guideLink": "https://aliansistore.com/panduan-install-hen-pkg", "notes": "PKG Base Game + Update 1.10 Sub Indo sudah dipaketkan. Siap instal via Package Installer di PS4 HEN."}'::jsonb
),
(
  'ALN-20261103-9120',
  'member',
  'Rian Pratama',
  '081234567890',
  'rian.pratama@gmail.com',
  'Tolong pastikan jersey terbaru Persib & Persija sudah update ya',
  '[{"productId": "game-pes25-subindo", "title": "eFootball PES 2025 Patch BRI Liga 1 & Timnas Indonesia (PS4 HEN)", "variant": "primary", "price": 150000, "qty": 1, "platform": "PS4 HEN"}]'::jsonb,
  150000, 15000, 135000, 'qris', 'PAID', 'PROCESSING',
  NULL
),
(
  'ALN-20261103-6521',
  'member',
  'Budi Santoso',
  '085712349988',
  'budi.santoso@yahoo.com',
  'Request game GTA V Sub Indo dan PES 2025 BRI Liga 1',
  '[{"productId": "service-hen-1tb", "title": "Paket Jasa Isi Game PS4 HEN 1TB (Bebas Request 15-25 Game + Sub Indo)", "variant": "primary", "price": 200000, "qty": 1, "platform": "PS4 HEN"}]'::jsonb,
  200000, 20000, 180000, 'bca', 'PAID', 'COMPLETED',
  '{"account": "order-hen.aliansi@gmail.com", "password": "AlnPass2026!#", "guideLink": "https://aliansistore.com/tutorial-install-pkg-ps4-hen", "notes": "Game pesanan sudah diisi lengkap sesuai list request."}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 8. Optional Additions for Google Drive Automation
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gdrive_folder_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;