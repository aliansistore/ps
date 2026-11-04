// ALIANSI STORE - Products Catalog Database & Media Assets
// Spesialis: Game PS4 HEN, Game Subtitle Indonesia, Jasa Isi HDD & Game Digital PS4/PS5

const INITIAL_PRODUCTS = [
  {
    id: "game-re4-subindo",
    title: "Resident Evil 4 Remake (Full Subtitle Indonesia)",
    slug: "resident-evil-4-remake-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🇮🇩 FULL SUB INDO",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 4.9,
    soldCount: 1420,
    releaseYear: 2023,
    size: "67 GB",
    publisher: "CAPCOM / ALIANSI STORE Sub Indo Team",
    tagline: "Misi Penyelamatan Leon di Eropa dengan Terjemahan Bahasa Indonesia Rapi",
    images: {
      poster: "assets/covers/re4-remake.jpg",
      backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/re4-remake.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 290000,
      secondary: 160000,
      original: 829000
    },
    description: "Karya agung survival horror Resident Evil 4 Remake yang telah dirombak dengan Full Subtitle Bahasa Indonesia (Dialog cerita, file dokumen rahasia, menu senjata, & petunjuk item). Sangat seru dan jalan cerita kini 100% mudah dipahami!",
    features: [
      "100% Subtitle Indonesia (Dialog Leon, Ashley, Luis, Saddler)",
      "Mendukung konsol PS4 HEN (Firmware 5.05 hingga 11.00)",
      "Tersedia juga varian Akun Digital Resmi untuk PS4 / PS5 Non-HEN",
      "Termasuk Bonus DLC Senjata & Kostum Klasik",
      "Garansi Game Lancar Tanpa Crash"
    ],
    inStock: true
  },
  {
    id: "game-gta5-subindo",
    title: "Grand Theft Auto V: Indonesia Edition (Sub Indo + Mod Mobil)",
    slug: "gta-v-sub-indo-ps4-hen",
    platform: ["PS4 HEN", "PS4", "PS5"],
    category: "subindo",
    type: "digital",
    badge: "🔥 BEST SELLER SUB INDO",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 5.0,
    soldCount: 2350,
    releaseYear: 2023,
    size: "85 GB",
    publisher: "Rockstar Games / ALIANSI Mod",
    tagline: "Jelajahi Los Santos dengan Subtitle Indonesia, Cheat Menu & Mod Lokal",
    images: {
      poster: "assets/covers/gta-v.jpg",
      backdrop: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/gta-v.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 180000,
      secondary: 95000,
      original: 429000
    },
    description: "Kisah kriminal Michael, Trevor, dan Franklin di Los Santos kini hadir dengan teks Subtitle Bahasa Indonesia lengkap. Untuk pengguna PS4 HEN, tersedia opsi paket Mod Trainer, Mobil Patroli Indonesia, dan uang tak terbatas.",
    features: [
      "Teks Subtitle Indonesia Misi Cerita Utama & Misi Sampingan",
      "Khusus PS4 HEN: Tersedia Menu Cheat / Mod Trainer Siap Pakai",
      "Pilihan versi Akun Digital Resmi untuk konsol Non-HEN",
      "Grafis jernih 60 FPS di PS4 Pro & PS5",
      "Panduan install PKG sangat mudah"
    ],
    inStock: true
  },
  {
    id: "game-gow-ragnarok-subindo",
    title: "God of War Ragnarök: Valhalla (Full Subtitle Indonesia)",
    slug: "god-of-war-ragnarok-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🏆 MASTERPIECE SUB INDO",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 5.0,
    soldCount: 1680,
    releaseYear: 2023,
    size: "110 GB",
    publisher: "Sony Interactive Entertainment",
    tagline: "Perjalanan Epik Kratos & Atreus Melintasi 9 Alam dengan Bahasa Indonesia",
    images: {
      poster: "assets/covers/gow-ragnarok.jpg",
      backdrop: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/gow-ragnarok.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 310000,
      secondary: 175000,
      original: 879000
    },
    description: "Kratos dan Atreus bertarung menghadapi dewa-dewi mitologi Nordik (Thor, Odin, Freya). Dialog dramatis dan dongeng Mimir kini diterjemahkan utuh ke dalam bahasa Indonesia.",
    features: [
      "Subtitle Bahasa Indonesia Lengkap (Dialog, Lore, Codex Jurnal)",
      "Dukungan PS4 HEN Firmware 9.00 / 11.00 & Konsol Digital Resmi",
      "Termasuk DLC Gratis Valhalla (Mode Roguelite)",
      "Garansi Game Berjalan Sempurna"
    ],
    inStock: true
  },
  {
    id: "game-pes2025-hen",
    title: "eFootball PES 2025 Patch BRI Liga 1 & Timnas Indonesia (PS4 HEN)",
    slug: "efootball-pes-2025-bri-liga-1-ps4-hen",
    platform: ["PS4 HEN"],
    category: "hen",
    type: "game",
    badge: "⚽ UPDATE MUSIM 2024/2025",
    isHen: true,
    isSubIndo: true,
    isSpotlight: true,
    rating: 4.9,
    soldCount: 2890,
    releaseYear: 2024,
    size: "45 GB",
    publisher: "KONAMI / Patch Komunitas Indonesia",
    tagline: "Mainkan Klub BRI Liga 1 & Skuad Timnas Indonesia Wajah Realistis!",
    images: {
      poster: "assets/covers/pes-2025.jpg",
      backdrop: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/pes-2025.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 85000,
      secondary: 85000,
      original: 150000
    },
    description: "Game bola paling dicari untuk pengguna PS4 HEN! Patch update musim terbaru 2024/2025 dengan klub BRI Liga 1 (Persib, Persija, Persebaya, Arema, dll), Timnas Indonesia Senior & U-23 wajah asli, transfer Eropa terbaru (Mbappe di Real Madrid), dan jersey terupdate.",
    features: [
      "18 Klub BRI Liga 1 Indonesia Lengkap Roster 2024/2025",
      "Skuad Lengkap Timnas Indonesia (Jay Idzes, Thom Haye, Maarten Paes, dll)",
      "Transfer Liga Eropa Terbaru (EPL, La Liga, Serie A, UCL)",
      "Format PKG Praktis Khusus Konsol PS4 HEN"
    ],
    inStock: true
  },
  {
    id: "service-hen-1tb",
    title: "Paket Jasa Isi Game PS4 HEN 1TB (Bebas Request 15-25 Game + Sub Indo)",
    slug: "jasa-isi-game-ps4-hen-1tb",
    platform: ["PS4 HEN"],
    category: "service-hen",
    type: "service",
    badge: "⭐ REKOMENDASI 1TB",
    isHen: true,
    isSubIndo: true,
    isSpotlight: false,
    rating: 5.0,
    soldCount: 3120,
    releaseYear: 2024,
    size: "1000 GB",
    publisher: "ALIANSI STORE Workshop",
    tagline: "Koleksi 2.000+ Judul Game PS4 Update Patch & Mod Menu Siap Pakai",
    images: {
      poster: "assets/covers/service-1tb.jpg",
      backdrop: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/service-1tb.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 200000,
      secondary: 200000,
      original: 350000
    },
    description: "Layanan pengisian game harddisk eksternal atau unit PS4 HEN (Firmware 5.05 - 11.00). Anda bebas memilih 15 sampai 25 judul game sesuka hati dari database 2.000+ game kami, termasuk seluruh koleksi Game Subtitle Indonesia dan Patch Bola terbaru.",
    features: [
      "Bebas Request 15 - 25 Judul Game Full 1TB",
      "Bisa Request Game Subtitle Indonesia (GTA V, RE4, GoW, TLOU)",
      "Termasuk Patch eFootball PES 2025 BRI Liga 1 & Timnas",
      "Bisa kirim HDD Eksternal atau bawa langsung unit PS4",
      "Pengerjaan kilat 1 hari kerja bergaransi"
    ],
    inStock: true
  },
  {
    id: "service-hen-500gb",
    title: "Paket Jasa Isi Game PS4 HEN 500GB (Bebas Request 8-12 Game + Sub Indo)",
    slug: "jasa-isi-game-ps4-hen-500gb",
    platform: ["PS4 HEN"],
    category: "service-hen",
    type: "service",
    badge: "HEMAT 500GB",
    isHen: true,
    isSubIndo: true,
    isSpotlight: false,
    rating: 4.9,
    soldCount: 1450,
    releaseYear: 2024,
    size: "500 GB",
    publisher: "ALIANSI STORE Workshop",
    tagline: "Paket Hemat Pengisian Game PS4 HEN Internal / Eksternal 500GB",
    images: {
      poster: "assets/covers/service-500gb.jpg",
      backdrop: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/service-500gb.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1507457379470-08b800bebc67?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 130000,
      secondary: 130000,
      original: 200000
    },
    description: "Paket pengisian game PS4 HEN kapasitas 500GB. Sangat pas untuk harddisk internal PS4 Slim / Fat standar yang ingin diisi game-game petualangan populer dan game subtitle Indonesia.",
    features: [
      "Bebas Request 8 - 12 Judul Game Populer 500GB",
      "Termasuk Game Subtitle Indonesia Pilihan",
      "Update Patch & DLC Terbaru",
      "Garansi Game Normal Lancar"
    ],
    inStock: true
  },
  {
    id: "tool-flashdisk-hen",
    title: "Flashdisk HEN Auto-Exploit PS4 (Plug & Play Firmware 9.00 / 11.00)",
    slug: "flashdisk-hen-auto-exploit-ps4",
    platform: ["PS4 HEN"],
    category: "tool",
    type: "hardware",
    badge: "⚡ ALAT AKTIVASI HEN",
    isHen: true,
    isSpotlight: false,
    rating: 4.9,
    soldCount: 970,
    releaseYear: 2024,
    size: "Flashdisk USB",
    publisher: "ALIANSI STORE Hardware",
    tagline: "Aktivasi HEN 1 Klik Tanpa Ribet Buka Browser Berulang Kali",
    images: {
      poster: "assets/covers/flashdisk-hen.jpg",
      backdrop: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/flashdisk-hen.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 85000,
      secondary: 85000,
      original: 125000
    },
    description: "Flashdisk USB berisi konfigurasi payload jailbreak otomatis untuk PS4 Firmware 9.00 atau Firmware 11.00. Sangat mudah digunakan bagi pemula, tinggal tancap ke port USB konsol dan HEN aktif seketika.",
    features: [
      "Aktivasi HEN Cepat & Stabil (Anti Kernel Panic)",
      "Tersedia Varian Firmware 9.00 dan Firmware 11.00",
      "Flashdisk Original Berkualitas (SanDisk / Kingston)",
      "Disertakan Panduan Video & Bantuan CS WhatsApp"
    ],
    inStock: true
  },
  {
    id: "game-tlou-subindo",
    title: "The Last of Us Part I (Full Subtitle Indonesia)",
    slug: "the-last-of-us-part-1-sub-indo",
    platform: ["PS4 HEN", "PS5"],
    category: "subindo",
    type: "digital",
    badge: "❤️ DRAMA SUB INDO",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 4.9,
    soldCount: 1210,
    releaseYear: 2023,
    size: "79 GB",
    publisher: "Sony Interactive Entertainment",
    tagline: "Kisah Emosional Joel & Ellie dengan Terjemahan Bahasa Indonesia Menyentuh",
    images: {
      poster: "assets/covers/tlou-part1.jpg",
      backdrop: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/tlou-part1.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 320000,
      secondary: 180000,
      original: 879000
    },
    description: "Perjalanan bertahan hidup melintasi Amerika yang hancur akibat jamur Cordyceps. Dengan teks terjemahan bahasa Indonesia, setiap percakapan dan hubungan batin Joel dan Ellie terasa begitu hidup.",
    features: [
      "Full Subtitle Indonesia untuk Cerita Utama & DLC Left Behind",
      "Support Konsol PS4 HEN & Akun Digital PS5",
      "Visual Remake Realistis dengan Detail Ekspresi Menakjubkan",
      "Garansi Bebas Bug & Error"
    ],
    inStock: true
  },
  {
    id: "game-rdr2-subindo",
    title: "Red Dead Redemption 2 (Full Subtitle Indonesia)",
    slug: "red-dead-redemption-2-sub-indo",
    platform: ["PS4 HEN", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🤠 OPEN WORLD SUB INDO",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 5.0,
    soldCount: 1980,
    releaseYear: 2022,
    size: "105 GB",
    publisher: "Rockstar Games",
    tagline: "Dunia Koboi Terbesar Rockstar Games dengan Subtitle Indonesia Lengkap",
    images: {
      poster: "assets/covers/rdr2.jpg",
      backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/rdr2.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 210000,
      secondary: 120000,
      original: 740000
    },
    description: "Kisah Arthur Morgan dan geng penjahat Van der Linde di penghujung era Wild West. Lebih dari 100 jam dialog, surat rahasia, koran lokal, dan misi telah diterjemahkan ke dalam bahasa Indonesia.",
    features: [
      "Full Subtitle Indonesia untuk Semua Dialog & Dokumen Cerita",
      "Kompatibel PS4 HEN (Format PKG Siap Install)",
      "Pilihan Akun Digital Resmi Non-HEN Tersedia",
      "Dunia Open World Paling Imersif Sepanjang Masa"
    ],
    inStock: true
  },
  {
    id: "game-ghostoftsushima-subindo",
    title: "Ghost of Tsushima: Director's Cut (Full Subtitle Indonesia)",
    slug: "ghost-of-tsushima-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "⚔️ SAMURAI SUB INDO",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 4.9,
    soldCount: 1540,
    releaseYear: 2023,
    size: "65 GB",
    publisher: "Sony Interactive Entertainment",
    tagline: "Pertahankan Tanah Tsushima dengan Teks Bahasa Indonesia & Dubbing Jepang",
    images: {
      poster: "assets/covers/ghost-tsushima.jpg",
      backdrop: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/ghost-tsushima.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 280000,
      secondary: 150000,
      original: 879000
    },
    description: "Pertarungan katana epik samurai Jin Sakai mempertahankan pulau Tsushima dari serbuan bangsa Mongol. Teks bahasa Indonesia dipadukan dengan dubbing bahasa Jepang ala bioskop samurai Akira Kurosawa.",
    features: [
      "Full Subtitle Indonesia (Cerita Utama + Ekspansi Pulau Iki)",
      "Support PS4 HEN Firmware 9.00 / 11.00 & Konsol Digital Resmi",
      "Opsi Audio Bahasa Jepang & Lip Sync Sempurna",
      "Mode Foto Sinematik & Grafis Menakjubkan"
    ],
    inStock: true
  },
  {
    id: "game-fc25",
    title: "EA SPORTS FC 25",
    slug: "ea-sports-fc-25",
    platform: ["PS5", "PS4", "PS4 HEN"],
    category: "sports",
    type: "digital",
    badge: "TOP SELLER #1",
    isHen: true,
    isSpotlight: false,
    rating: 4.8,
    soldCount: 1820,
    releaseYear: 2024,
    size: "48 GB",
    publisher: "Electronic Arts",
    tagline: "Klub Pilihanmu, Taktik Modern FC IQ, dan Timnas Indonesia!",
    images: {
      poster: "assets/covers/fc-25.jpg",
      backdrop: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/fc-25.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 385000,
      secondary: 210000,
      original: 799000
    },
    description: "Era baru sepak bola dunia dengan EA SPORTS FC 25! Hadir dengan teknologi HyperMotionV, sistem taktis FC IQ modern, serta update roster musim terbaru 2024/2025.",
    features: [
      "Tersedia Versi Akun Digital Legal & Versi PS4 HEN",
      "FC IQ: Overhaul sistem kecerdasan taktis AI lebih nyata",
      "5v5 Rush Mode: Main seru bareng teman",
      "Garansi Anti-Revoke Selamanya"
    ],
    inStock: true
  },
  {
    id: "game-wukong",
    title: "Black Myth: Wukong",
    slug: "black-myth-wukong",
    platform: ["PS5"],
    category: "rpg",
    type: "digital",
    badge: "GAME OF THE YEAR NOMINEE",
    isSpotlight: false,
    rating: 4.9,
    soldCount: 950,
    releaseYear: 2024,
    size: "130 GB",
    publisher: "Game Science",
    tagline: "Taklukkan Mitologi Barat dengan Kekuatan Monyet Sakti",
    images: {
      poster: "assets/covers/wukong.jpg",
      backdrop: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/wukong.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 420000,
      secondary: 245000,
      original: 829000
    },
    description: "Action RPG berlatar mitologi Tiongkok yang memukau karya Game Science. Anda bertualang sebagai Sang Takdir (The Destined One) untuk mengungkap misteri legenda Kera Sakti.",
    features: [
      "Visual Unreal Engine 5 Photorealistic di PS5",
      "72 Transformasi Mistis & Variasi Tongkat Sakti",
      "DualSense Haptic Feedback & Audio 3D Tempest",
      "Garansi Akun Legal 100% Selamanya"
    ],
    inStock: true
  }
];

// Initial Demo Orders (Updated to reflect actual HEN & Sub Indo sales)
const INITIAL_ORDERS = [
  {
    id: "ALN-20261103-7842",
    createdAt: "2026-11-03T20:15:00Z",
    customerType: "member",
    customerName: "Rian Pratama",
    customerPhone: "081234567890",
    customerEmail: "rian.pratama@gmail.com",
    notes: "Tolong kirim panduan install PKG untuk PS4 HEN ya min",
    items: [
      {
        productId: "game-re4-subindo",
        title: "Resident Evil 4 Remake (Full Subtitle Indonesia)",
        variant: "primary",
        price: 290000,
        qty: 1,
        platform: "PS4 HEN"
      }
    ],
    subtotal: 290000,
    discount: 0,
    total: 290000,
    paymentMethod: "qris",
    paymentStatus: "PAID",
    status: "COMPLETED",
    fulfillment: {
      account: "Link PKG Google Drive Private Server Aliansi",
      password: "Token Akses: ALN-RE4-IND-9912",
      guideLink: "https://aliansistore.com/panduan-install-hen-pkg",
      notes: "PKG Base Game CUSA-33387 + Update 1.10 Sub Indo sudah dipaketkan. Siap instal via Package Installer di PS4 HEN."
    }
  },
  {
    id: "ALN-20261103-9120",
    createdAt: "2026-11-03T21:30:00Z",
    customerType: "member",
    customerName: "Rian Pratama",
    customerPhone: "081234567890",
    customerEmail: "rian.pratama@gmail.com",
    notes: "Tolong pastikan jersey terbaru Persib & Persija sudah update ya",
    items: [
      {
        productId: "game-pes25-subindo",
        title: "eFootball PES 2025 Patch BRI Liga 1 & Timnas Indonesia (PS4 HEN)",
        variant: "primary",
        price: 150000,
        qty: 1,
        platform: "PS4 HEN"
      }
    ],
    subtotal: 150000,
    discount: 15000,
    total: 135000,
    paymentMethod: "qris",
    paymentStatus: "PAID",
    status: "PROCESSING",
    fulfillment: null
  },
  {
    id: "ALN-20261103-6521",
    createdAt: "2026-11-03T18:40:00Z",
    customerType: "member",
    customerName: "Budi Santoso",
    customerPhone: "085712349988",
    customerEmail: "budi.santoso@yahoo.com",
    notes: "Request game GTA V Sub Indo dan PES 2025 BRI Liga 1",
    items: [
      {
        productId: "service-hen-1tb",
        title: "Paket Jasa Isi Game PS4 HEN 1TB (Bebas Request 15-25 Game + Sub Indo)",
        variant: "primary",
        price: 200000,
        qty: 1,
        platform: "PS4 HEN"
      }
    ],
    subtotal: 200000,
    discount: 20000,
    total: 180000,
    paymentMethod: "bca",
    paymentStatus: "PAID",
    status: "COMPLETED",
    fulfillment: {
      account: "order-hen.aliansi@gmail.com",
      password: "AlnPass2026!#",
      guideLink: "https://aliansistore.com/tutorial-install-pkg-ps4-hen",
      notes: "Game pesanan sudah diisi lengkap sesuai list request. File save game dan mod Sub Indo sudah aktif otomatis."
    }
  }
];

// Initial Users Database (Unified Auth for Admin & Customers)
const INITIAL_USERS = [
  {
    id: "usr-admin-01",
    identifier: "admin",
    name: "Admin Aliansi Store",
    phone: "081234567890",
    email: "admin@aliansistore.com",
    pin: "1234",
    role: "admin",
    roleLabel: "Super Admin Toko",
    avatar: "👑"
  },
  {
    id: "usr-cust-01",
    identifier: "081234567890",
    name: "Rian Pratama",
    phone: "081234567890",
    email: "rian.pratama@gmail.com",
    pin: "1234",
    role: "customer",
    roleLabel: "Member VIP",
    avatar: "RP",
    memberSince: "2024"
  },
  {
    id: "usr-cust-02",
    identifier: "085712349988",
    name: "Budi Santoso",
    phone: "085712349988",
    email: "budi.santoso@yahoo.com",
    pin: "1234",
    role: "customer",
    roleLabel: "Member",
    avatar: "BS",
    memberSince: "2025"
  }
];

// Initial Store Config
const INITIAL_CONFIG = {
  storeName: "ALIANSI STORE",
  tagline: "Spesialis Game PS4 HEN, Game Subtitle Indonesia & Akun Digital Terpercaya",
  whatsappNumber: "6281234567890",
  whatsappFormatted: "+62 812-3456-7890",
  adminPin: "1234",
  bankAccounts: [
    { bank: "BCA", number: "8830192831", name: "ALIANSI STORE INDONESIA" },
    { bank: "MANDIRI", number: "1370019283741", name: "ALIANSI STORE INDONESIA" },
    { bank: "BRI", number: "018201002938530", name: "ALIANSI STORE INDONESIA" },
    { bank: "DANA / OVO / GOPAY", number: "0812-3456-7890", name: "ALIANSI STORE" }
  ],
  vouchers: [
    { code: "ALIANSIBARU", discountPercent: 10, minPurchase: 100000, maxDiscount: 30000 },
    { code: "HENHEMAT", discountPercent: 15, minPurchase: 200000, maxDiscount: 50000 }
  ]
};

// Live Recent Activity Data for Social Proof Ticker
const RECENT_PURCHASES = [
  { name: "Rian P.", game: "Resident Evil 4 Remake (Sub Indo)", city: "Jakarta", time: "2 mnt lalu" },
  { name: "Budi S.", game: "Jasa Isi PS4 HEN 1TB (Full Sub Indo)", city: "Surabaya", time: "5 mnt lalu" },
  { name: "Fajar K.", game: "GTA V Indonesia Edition + Mod Mobil", city: "Bandung", time: "10 mnt lalu" },
  { name: "Hendra W.", game: "eFootball PES 2025 BRI Liga 1", city: "Medan", time: "16 mnt lalu" },
  { name: "Aldi T.", game: "God of War Ragnarök (Sub Indo)", city: "Yogyakarta", time: "22 mnt lalu" },
  { name: "Reza M.", game: "Flashdisk Auto-Exploit PS4 HEN 11.00", city: "Makassar", time: "28 mnt lalu" }
];
