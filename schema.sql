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

-- Initial Products
INSERT INTO public.products (id, title, slug, platform, category, type, badge, is_sub_indo, is_hen, is_spotlight, rating, sold_count, release_year, size, publisher, tagline, images, prices, description, features, in_stock)
VALUES
(
  'game-re4-subindo',
  'Resident Evil 4 Remake (Full Subtitle Indonesia)',
  'resident-evil-4-remake-sub-indo',
  '["PS4 HEN", "PS5", "PS4"]'::jsonb,
  'subindo',
  'digital',
  '🇮🇩 FULL SUB INDO',
  true, true, true, 4.9, 1420, 2023, '67 GB',
  'CAPCOM / ALIANSI STORE Sub Indo Team',
  'Misi Penyelamatan Leon di Eropa dengan Terjemahan Bahasa Indonesia Rapi',
  '{
    "poster": "https://image.api.playstation.com/vulcan/ap/rnd/202210/0706/EVWyZD6qXZMOHVq38P4Ffq1B.png",
    "backdrop": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://image.api.playstation.com/vulcan/ap/rnd/202210/0706/EVWyZD6qXZMOHVq38P4Ffq1B.png"
  }'::jsonb,
  '{"primary": 290000, "secondary": 160000, "original": 829000}'::jsonb,
  'Karya agung survival horror Resident Evil 4 Remake yang telah dirombak dengan Full Subtitle Bahasa Indonesia (Dialog cerita, file dokumen rahasia, menu senjata, & petunjuk item).',
  '["100% Subtitle Indonesia (Dialog Leon, Ashley, Luis, Saddler)", "Mendukung konsol PS4 HEN (Firmware 5.05 hingga 11.00)", "Tersedia juga varian Akun Digital Resmi untuk PS4 / PS5 Non-HEN", "Termasuk Bonus DLC Senjata & Kostum Klasik", "Garansi Game Lancar Tanpa Crash"]'::jsonb,
  true
),
(
  'game-gta5-subindo',
  'Grand Theft Auto V: Indonesia Edition (Sub Indo + Mod Mobil)',
  'gta-v-sub-indo-ps4-hen',
  '["PS4 HEN", "PS4", "PS5"]'::jsonb,
  'subindo',
  'digital',
  '🔥 BEST SELLER SUB INDO',
  true, true, true, 5.0, 2350, 2023, '85 GB',
  'Rockstar Games / ALIANSI Mod',
  'Jelajahi Los Santos dengan Subtitle Indonesia, Cheat Menu & Mod Lokal',
  '{
    "poster": "https://image.api.playstation.com/vulcan/ap/rnd/202202/2816/mYn2ETBTXD280cqk3mU02eaf.png",
    "backdrop": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://image.api.playstation.com/vulcan/ap/rnd/202202/2816/mYn2ETBTXD280cqk3mU02eaf.png"
  }'::jsonb,
  '{"primary": 180000, "secondary": 95000, "original": 429000}'::jsonb,
  'Kisah kriminal Michael, Trevor, dan Franklin di Los Santos kini hadir dengan teks Subtitle Bahasa Indonesia lengkap. Untuk pengguna PS4 HEN, tersedia opsi paket Mod Trainer, Mobil Patroli Indonesia, dan uang tak terbatas.',
  '["Teks Subtitle Indonesia Misi Cerita Utama & Misi Sampingan", "Khusus PS4 HEN: Tersedia Menu Cheat / Mod Trainer Siap Pakai", "Pilihan versi Akun Digital Resmi untuk konsol Non-HEN", "Grafis jernih 60 FPS di PS4 Pro & PS5", "Panduan install PKG sangat mudah"]'::jsonb,
  true
),
(
  'game-gow-ragnarok-subindo',
  'God of War Ragnarök: Valhalla (Full Subtitle Indonesia)',
  'god-of-war-ragnarok-sub-indo',
  '["PS4 HEN", "PS5", "PS4"]'::jsonb,
  'subindo',
  'digital',
  '🏆 MASTERPIECE SUB INDO',
  true, true, true, 5.0, 1680, 2023, '110 GB',
  'Sony Interactive Entertainment',
  'Perjalanan Epik Kratos & Atreus Melintasi 9 Alam dengan Bahasa Indonesia',
  '{
    "poster": "https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png",
    "backdrop": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png"
  }'::jsonb,
  '{"primary": 310000, "secondary": 175000, "original": 879000}'::jsonb,
  'Kratos dan Atreus bertarung menghadapi dewa-dewi mitologi Nordik. Dialog dramatis dan dongeng Mimir kini diterjemahkan utuh ke dalam bahasa Indonesia.',
  '["Subtitle Bahasa Indonesia Lengkap (Dialog, Lore, Codex Jurnal)", "Dukungan PS4 HEN Firmware 9.00 / 11.00 & Konsol Digital Resmi", "Termasuk DLC Gratis Valhalla", "Garansi Game Berjalan Sempurna"]'::jsonb,
  true
),
(
  'game-pes2025-hen',
  'eFootball PES 2025 Patch BRI Liga 1 & Timnas Indonesia (PS4 HEN)',
  'efootball-pes-2025-bri-liga-1-ps4-hen',
  '["PS4 HEN"]'::jsonb,
  'hen',
  'game',
  '⚽ UPDATE MUSIM 2024/2025',
  true, true, true, 4.9, 2890, 2024, '45 GB',
  'KONAMI / Patch Komunitas Indonesia',
  'Mainkan Klub BRI Liga 1 & Skuad Timnas Indonesia Wajah Realistis!',
  '{
    "poster": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80"
  }'::jsonb,
  '{"primary": 85000, "secondary": 85000, "original": 150000}'::jsonb,
  'Game bola paling dicari untuk pengguna PS4 HEN! Patch update musim terbaru 2024/2025 dengan klub BRI Liga 1, Timnas Indonesia Senior & U-23 wajah asli, transfer Eropa terbaru.',
  '["18 Klub BRI Liga 1 Indonesia Lengkap Roster 2024/2025", "Skuad Lengkap Timnas Indonesia", "Transfer Liga Eropa Terbaru", "Format PKG Praktis Khusus Konsol PS4 HEN"]'::jsonb,
  true
),
(
  'service-hen-1tb',
  'Paket Jasa Isi Game PS4 HEN 1TB (Bebas Request 15-25 Game + Sub Indo)',
  'jasa-isi-game-ps4-hen-1tb',
  '["PS4 HEN"]'::jsonb,
  'service-hen',
  'service',
  '⭐ REKOMENDASI 1TB',
  true, true, false, 5.0, 3120, 2024, '1000 GB',
  'ALIANSI STORE Workshop',
  'Koleksi 2.000+ Judul Game PS4 Update Patch & Mod Menu Siap Pakai',
  '{
    "poster": "https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=600&q=80"
  }'::jsonb,
  '{"primary": 200000, "secondary": 200000, "original": 350000}'::jsonb,
  'Layanan pengisian game harddisk eksternal atau unit PS4 HEN. Anda bebas memilih 15 sampai 25 judul game sesuka hati dari database 2.000+ game kami.',
  '["Bebas Request 15 - 25 Judul Game Full 1TB", "Bisa Request Game Subtitle Indonesia", "Termasuk Patch eFootball PES 2025 BRI Liga 1", "Pengerjaan kilat 1 hari kerja bergaransi"]'::jsonb,
  true
),
(
  'service-hen-500gb',
  'Paket Jasa Isi Game PS4 HEN 500GB (Bebas Request 8-12 Game + Sub Indo)',
  'jasa-isi-game-ps4-hen-500gb',
  '["PS4 HEN"]'::jsonb,
  'service-hen',
  'service',
  'HEMAT 500GB',
  true, true, false, 4.9, 1450, 2024, '500 GB',
  'ALIANSI STORE Workshop',
  'Paket Hemat Pengisian Game PS4 HEN Internal / Eksternal 500GB',
  '{
    "poster": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80"
  }'::jsonb,
  '{"primary": 130000, "secondary": 130000, "original": 200000}'::jsonb,
  'Paket pengisian game PS4 HEN kapasitas 500GB. Sangat pas untuk harddisk internal PS4 Slim / Fat standar.',
  '["Bebas Request 8 - 12 Judul Game Populer 500GB", "Termasuk Game Subtitle Indonesia Pilihan", "Update Patch & DLC Terbaru", "Garansi Game Normal Lancar"]'::jsonb,
  true
),
(
  'tool-flashdisk-hen',
  'Flashdisk HEN Auto-Exploit PS4 (Plug & Play Firmware 9.00 / 11.00)',
  'flashdisk-hen-auto-exploit-ps4',
  '["PS4 HEN"]'::jsonb,
  'tool',
  'hardware',
  '⚡ ALAT AKTIVASI HEN',
  false, true, false, 4.9, 970, 2024, 'Flashdisk USB',
  'ALIANSI STORE Hardware',
  'Aktivasi HEN 1 Klik Tanpa Ribet Buka Browser Berulang Kali',
  '{
    "poster": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=600&q=80",
    "backdrop": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=600&q=80"
  }'::jsonb,
  '{"primary": 85000, "secondary": 85000, "original": 125000}'::jsonb,
  'Flashdisk USB berisi konfigurasi payload jailbreak otomatis untuk PS4 Firmware 9.00 atau 11.00. Tinggal tancap ke port USB konsol dan HEN aktif seketika.',
  '["Aktivasi HEN Cepat & Stabil", "Tersedia Varian Firmware 9.00 dan 11.00", "Flashdisk Original Berkualitas", "Disertakan Panduan Video & CS WhatsApp"]'::jsonb,
  true
),
(
  'game-tlou-subindo',
  'The Last of Us Part I (Full Subtitle Indonesia)',
  'the-last-of-us-part-1-sub-indo',
  '["PS4 HEN", "PS5"]'::jsonb,
  'subindo',
  'digital',
  '❤️ DRAMA SUB INDO',
  true, true, false, 4.9, 1210, 2023, '79 GB',
  'Sony Interactive Entertainment',
  'Kisah Emosional Joel & Ellie dengan Terjemahan Bahasa Indonesia Menyentuh',
  '{
    "poster": "https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/eMMvkwvWb9r7294B1B7q8fG0.png",
    "backdrop": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/eMMvkwvWb9r7294B1B7q8fG0.png"
  }'::jsonb,
  '{"primary": 320000, "secondary": 180000, "original": 879000}'::jsonb,
  'Perjalanan bertahan hidup melintasi Amerika yang hancur akibat jamur Cordyceps. Dengan teks terjemahan bahasa Indonesia lengkap.',
  '["Full Subtitle Indonesia untuk Cerita Utama & DLC Left Behind", "Support Konsol PS4 HEN & Akun Digital PS5", "Visual Remake Realistis", "Garansi Bebas Bug & Error"]'::jsonb,
  true
),
(
  'game-rdr2-subindo',
  'Red Dead Redemption 2 (Full Subtitle Indonesia)',
  'red-dead-redemption-2-sub-indo',
  '["PS4 HEN", "PS4"]'::jsonb,
  'subindo',
  'digital',
  '🤠 OPEN WORLD SUB INDO',
  true, true, false, 5.0, 1980, 2022, '105 GB',
  'Rockstar Games',
  'Dunia Koboi Terbesar Rockstar Games dengan Subtitle Indonesia Lengkap',
  '{
    "poster": "https://image.api.playstation.com/cdn/UP1004/CUSA03041_00/Hpl5MtwQgOVCSNmSpP44QfZGYSwRhAEz.png",
    "backdrop": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://image.api.playstation.com/cdn/UP1004/CUSA03041_00/Hpl5MtwQgOVCSNmSpP44QfZGYSwRhAEz.png"
  }'::jsonb,
  '{"primary": 210000, "secondary": 120000, "original": 740000}'::jsonb,
  'Kisah Arthur Morgan dan geng penjahat Van der Linde di penghujung era Wild West. Lebih dari 100 jam dialog telah diterjemahkan ke bahasa Indonesia.',
  '["Full Subtitle Indonesia untuk Semua Dialog & Dokumen Cerita", "Kompatibel PS4 HEN (Format PKG Siap Install)", "Pilihan Akun Digital Resmi Non-HEN Tersedia", "Dunia Open World Paling Imersif Sepanjang Masa"]'::jsonb,
  true
),
(
  'game-ghostoftsushima-subindo',
  'Ghost of Tsushima: Director''s Cut (Full Subtitle Indonesia)',
  'ghost-of-tsushima-sub-indo',
  '["PS4 HEN", "PS5", "PS4"]'::jsonb,
  'subindo',
  'digital',
  '⚔️ SAMURAI SUB INDO',
  true, true, false, 4.9, 1540, 2023, '65 GB',
  'Sony Interactive Entertainment',
  'Pertahankan Tanah Tsushima dengan Teks Bahasa Indonesia & Dubbing Jepang',
  '{
    "poster": "https://image.api.playstation.com/vulcan/ap/rnd/202106/2321/44vQhFGBXJqRk2z013Nqm72D.png",
    "backdrop": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://image.api.playstation.com/vulcan/ap/rnd/202106/2321/44vQhFGBXJqRk2z013Nqm72D.png"
  }'::jsonb,
  '{"primary": 280000, "secondary": 150000, "original": 879000}'::jsonb,
  'Pertarungan katana epik samurai Jin Sakai mempertahankan pulau Tsushima dari serbuan Mongol. Teks bahasa Indonesia dipadukan dengan dubbing bahasa Jepang.',
  '["Full Subtitle Indonesia (Cerita Utama + Ekspansi Pulau Iki)", "Support PS4 HEN & Konsol Digital Resmi", "Opsi Audio Bahasa Jepang & Lip Sync Sempurna", "Mode Foto Sinematik & Grafis Menakjubkan"]'::jsonb,
  true
),
(
  'game-fc25',
  'EA SPORTS FC 25',
  'ea-sports-fc-25',
  '["PS5", "PS4", "PS4 HEN"]'::jsonb,
  'sports',
  'digital',
  'TOP SELLER #1',
  false, true, false, 4.8, 1820, 2024, '48 GB',
  'Electronic Arts',
  'Klub Pilihanmu, Taktik Modern FC IQ, dan Timnas Indonesia!',
  '{
    "poster": "https://image.api.playstation.com/vulcan/ap/rnd/202406/2518/c5be188df04a01a357eb4bb7a87ea74c2d6f8510a2bb124b.png",
    "backdrop": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://image.api.playstation.com/vulcan/ap/rnd/202406/2518/c5be188df04a01a357eb4bb7a87ea74c2d6f8510a2bb124b.png"
  }'::jsonb,
  '{"primary": 385000, "secondary": 210000, "original": 799000}'::jsonb,
  'Era baru sepak bola dunia dengan EA SPORTS FC 25! Hadir dengan teknologi HyperMotionV, sistem taktis FC IQ modern, serta update roster musim terbaru 2024/2025.',
  '["Tersedia Versi Akun Digital Legal & Versi PS4 HEN", "FC IQ: Overhaul sistem kecerdasan taktis AI lebih nyata", "5v5 Rush Mode: Main seru bareng teman", "Garansi Anti-Revoke Selamanya"]'::jsonb,
  true
),
(
  'game-wukong',
  'Black Myth: Wukong',
  'black-myth-wukong',
  '["PS5"]'::jsonb,
  'rpg',
  'digital',
  'GAME OF THE YEAR NOMINEE',
  false, false, false, 4.9, 950, 2024, '130 GB',
  'Game Science',
  'Taklukkan Mitologi Barat dengan Kekuatan Monyet Sakti',
  '{
    "poster": "https://image.api.playstation.com/vulcan/ap/rnd/202405/2908/782d480862a939f75e2faea0e219fb09623e1dc04d49d9c2.png",
    "backdrop": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85",
    "cover": "https://image.api.playstation.com/vulcan/ap/rnd/202405/2908/782d480862a939f75e2faea0e219fb09623e1dc04d49d9c2.png"
  }'::jsonb,
  '{"primary": 420000, "secondary": 245000, "original": 829000}'::jsonb,
  'Action RPG berlatar mitologi Tiongkok yang memukau karya Game Science. Anda bertualang sebagai Sang Takdir untuk mengungkap misteri Kera Sakti.',
  '["Visual Unreal Engine 5 Photorealistic di PS5", "72 Transformasi Mistis & Variasi Tongkat Sakti", "DualSense Haptic Feedback & Audio 3D Tempest", "Garansi Akun Legal 100% Selamanya"]'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  platform = EXCLUDED.platform,
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  prices = EXCLUDED.prices,
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
