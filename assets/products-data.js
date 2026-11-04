// ALIANSI STORE - Official Products Catalog Database
// Spesialis: Game PS4 HEN, Subtitle Indonesia & Softfile Digital Google Drive

const INITIAL_PRODUCTS = [
  {
    id: "game-it-takes-two-subindo",
    title: "It Takes Two (Full Subtitle Indonesia)",
    slug: "it-takes-two-sub-indo-ps4-hen",
    platform: ["PS4 HEN", "PS4", "PS5"],
    category: "subindo",
    type: "digital",
    badge: "👫 GAME OF THE YEAR",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 5.0,
    soldCount: 1350,
    releaseYear: 2021,
    size: "45 GB",
    publisher: "Electronic Arts / Hazelight Studios",
    tagline: "Petualangan Co-op Terbaik Pemenang Game of the Year dengan Subtitle Indonesia Rapi",
    images: {
      poster: "assets/covers/it-takes-two.jpg",
      backdrop: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/it-takes-two.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 120000,
      secondary: 70000,
      original: 479000
    },
    description: "Mainkan mahakarya petualangan co-op 2 pemain paling seru 'It Takes Two' dengan Full Subtitle Bahasa Indonesia. Sangat cocok dimainkan berdua bersama pasangan atau teman dengan jalan cerita komedi emosional yang kini 100% mudah dipahami!",
    features: [
      "100% Subtitle Indonesia (Dialog Cody, May, & Dr. Hakim)",
      "Mendukung Split-screen 2 Pemain Offline & Online",
      "Kompatibel Semua Firmware PS4 HEN (5.05 - 11.00)",
      "Termasuk Panduan Pasang File PKG Mudah",
      "Garansi Game Lancar Bebas Bug"
    ],
    inStock: true
  },
  {
    id: "game-gow-ragnarok-subindo",
    title: "God of War Ragnarök (Full Subtitle Indonesia)",
    slug: "god-of-war-ragnarok-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🏆 MASTERPIECE SUB INDO",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 5.0,
    soldCount: 2680,
    releaseYear: 2022,
    size: "110 GB",
    publisher: "PlayStation Studios / Santa Monica",
    tagline: "Perjalanan Terakhir Kratos & Atreus Menghadapi Takdir 9 Alam dalam Bahasa Indonesia",
    images: {
      poster: "assets/covers/gow-ragnarok.jpg",
      backdrop: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/gow-ragnarok.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 250000,
      secondary: 140000,
      original: 879000
    },
    description: "Mahakarya aksi petualangan mitologi Nordik paling fenomenal. Kratos dan Atreus bertualang ke setiap sembilan alam untuk mencari jawaban saat pasukan Asgard bersiap menghadapi pertempuran besar Ragnarok. Full Subtitle Indonesia teks dialog dan narasi rapi.",
    features: [
      "Full Subtitle Bahasa Indonesia Semua Dialog Utama & Side Quest",
      "Kompatibel Semua Firmware PS4 HEN (5.05 - 11.00)",
      "Termasuk DLC Valhalla Roguelike Update Terbaru",
      "Support Audio Dubbing Inggris Asli dengan Sub Indo Selaras",
      "File Game PKG Lengkap + Panduan Install Anti Gagal"
    ],
    inStock: true
  },
  {
    id: "game-ghost-tsushima-subindo",
    title: "Ghost of Tsushima: Director's Cut (Full Subtitle Indonesia)",
    slug: "ghost-of-tsushima-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "⚔️ SAMURAI EPIC",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 5.0,
    soldCount: 2150,
    releaseYear: 2021,
    size: "60 GB",
    publisher: "PlayStation Studios / Sucker Punch",
    tagline: "Kisah Perjuangan Jin Sakai Menjadi Sang Hantu Tsushima dengan Subtitle Indonesia",
    images: {
      poster: "assets/covers/ghost-tsushima.jpg",
      backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/ghost-tsushima.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 195000,
      secondary: 110000,
      original: 729000
    },
    description: "Rasakan keindahan pulau Tsushima era feodal Jepang dalam kisah Jin Sakai yang berkorban mempertahankan tanah kelahirannya dari invasi Mongol. Lengkap dengan Subtitle Indonesia rapi dan ekspansi Iki Island.",
    features: [
      "Teks & Dialog Cerita Full Subtitle Bahasa Indonesia",
      "Termasuk Ekspansi Pulau Iki & Mode Kurosawa",
      "Audio Dubbing Jepang Asli dengan Lipsync Akurat",
      "Kompatibel PS4 HEN Semua Firmware",
      "File Game PKG Tested 100% Anti Crash"
    ],
    inStock: true
  },
  {
    id: "game-tlou-part2-subindo",
    title: "The Last of Us Part II (Full Subtitle Indonesia)",
    slug: "the-last-of-us-part-2-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🔥 INTENSE DRAMA",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 4.9,
    soldCount: 1980,
    releaseYear: 2020,
    size: "78 GB",
    publisher: "PlayStation Studios / Naughty Dog",
    tagline: "Kisah Balas Dendam Penuh Emosi Ellie & Abby dengan Subtitle Indonesia Lengkap",
    images: {
      poster: "assets/covers/tlou-part2.jpg",
      backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/tlou-part2.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 190000,
      secondary: 105000,
      original: 579000
    },
    description: "Lanjutan perjalanan emosional Ellie melintasi Seattle pasca-pandemi dalam misi membalas dendam. Diterjemahkan secara mendalam ke dalam Bahasa Indonesia sehingga setiap nuansa dilema moral terasa begitu nyata.",
    features: [
      "Full Subtitle Bahasa Indonesia Dialog & File Surat Rahasia",
      "Gameplay Stealth Survival Paling Realistis",
      "Visual Menakjubkan Memaksimalkan Kemampuan PS4",
      "Support PS4 HEN Firmware 5.05 - 11.00",
      "File Google Drive Lengkap Part 1 - Selesai"
    ],
    inStock: true
  },
  {
    id: "game-gta5-subindo",
    title: "GTA V MOD (Full Subtitle Indonesia)",
    slug: "gta-v-mod-subtitle-indonesia-ps4-hen",
    platform: ["PS4 HEN", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🚗 MOD INDONESIA",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 4.9,
    soldCount: 3820,
    releaseYear: 2021,
    size: "68 GB",
    publisher: "Rockstar Games / Aliansi Mod Team",
    tagline: "Grand Theft Auto V Edisi Khusus: Subtitle Indonesia + Mod Kendaraan & Sound Lokal",
    images: {
      poster: "assets/covers/gta-v.jpg",
      backdrop: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/gta-v.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 140000,
      secondary: 80000,
      original: 429000
    },
    description: "Jelajahi Los Santos bersama Michael, Franklin, dan Trevor dalam bahasa Indonesia! Dilengkapi dengan Mod kearifan lokal, kendaraan khas Indonesia, dan terjemahan misi cerita lengkap tanpa sensor.",
    features: [
      "100% Subtitle Indonesia Misi Cerita Utama & Percakapan Bebas",
      "Mod Kendaraan Motor & Mobil Indonesia Pilihan",
      "Cheat Menu Terintegrasi Praktis di Konsol",
      "Khusus Konsol PS4 HEN Semua Tipe (Fat/Slim/Pro)",
      "Tested 100% Anti Hang & Anti Crash"
    ],
    inStock: true
  },
  {
    id: "game-mk11-subindo",
    title: "Mortal Kombat 11 Ultimate (Full Subtitle Indonesia)",
    slug: "mortal-kombat-11-ultimate-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🥊 ALL DLC UNLOCKED",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 4.8,
    soldCount: 1670,
    releaseYear: 2020,
    size: "52 GB",
    publisher: "Warner Bros. / NetherRealm",
    tagline: "Edisi Terlengkap Mortal Kombat 11: Semua Karakter DLC & Story Aftermath Sub Indo",
    images: {
      poster: "assets/covers/mortal-kombat-11.jpg",
      backdrop: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/mortal-kombat-11.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 135000,
      secondary: 75000,
      original: 499000
    },
    description: "Rasakan pertarungan brutal Fatality dan sinematik spektakuler Mortal Kombat 11 Ultimate dengan alur cerita ber-Subtitle Indonesia. Termasuk ekspansi cerita Aftermath dan semua karakter tamu seperti Joker, Terminator, Rambo, dan Spawn.",
    features: [
      "Full Subtitle Indonesia Cerita Utama + Aftermath",
      "Membuka 37 Karakter Petarung Lengkap Termasuk Karakter Tamu",
      "Grafis Sinematik Super Tajam 60 FPS",
      "Mendukung 2 Pemain Versus Lokal Offline",
      "File Game PKG Siap Instal untuk PS4 HEN"
    ],
    inStock: true
  },
  {
    id: "game-hogwarts-legacy-subindo",
    title: "Hogwarts Legacy (Full Subtitle Indonesia)",
    slug: "hogwarts-legacy-sub-indo-ps4-hen",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🪄 OPEN WORLD RPG",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 4.9,
    soldCount: 2420,
    releaseYear: 2023,
    size: "65 GB",
    publisher: "Warner Bros. / Avalanche",
    tagline: "Jadilah Murid Sekolah Sihir Hogwarts Abad ke-19 dengan Subtitle Bahasa Indonesia",
    images: {
      poster: "assets/covers/hogwarts-legacy.jpg",
      backdrop: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/hogwarts-legacy.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 210000,
      secondary: 120000,
      original: 799000
    },
    description: "Rasakan hidup di dunia sihir Harry Potter! Jelajahi Hogwarts, Hogsmeade, Hutan Terlarang, dan kuasai mantra sihir kuno dalam alur cerita RPG mendalam yang kini sepenuhnya berbahasa Indonesia.",
    features: [
      "Full Subtitle Indonesia Dialog, Mantra, & Buku Catatan Misteri",
      "Dunia Sihir Luas Open-World Tanpa Batas",
      "Kustomisasi Karakter, Asrama, & Sapu Terbang Bebas",
      "Support PS4 HEN Semua Firmware (5.05 - 11.00)",
      "File Bersih & Bergaransi Anti Macet"
    ],
    inStock: true
  },
  {
    id: "game-uncharted-4-subindo",
    title: "Uncharted 4: A Thief's End (Full Subtitle Indonesia)",
    slug: "uncharted-4-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🧭 ACTION ADVENTURE",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 4.9,
    soldCount: 2890,
    releaseYear: 2020,
    size: "50 GB",
    publisher: "PlayStation Studios / Naughty Dog",
    tagline: "Petualangan Terakhir Nathan Drake Berburu Harta Karun Bajak Laut dalam Sub Indo",
    images: {
      poster: "assets/covers/uncharted-4.jpg",
      backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/uncharted-4.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 110000,
      secondary: 65000,
      original: 329000
    },
    description: "Petualangan sinematik kelas dunia Nathan Drake melintasi pulau Madagaskar mencari koloni bajak laut Libertalia. Penuh canda, aksi menegangkan, dan emosi keluarga yang disajikan dengan Subtitle Indonesia sempurna.",
    features: [
      "100% Subtitle Indonesia Semua Dialog Nate, Sam, & Sully",
      "Aksi Parkour dan Tembak-Menembak Sinematik Terbaik Naughty Dog",
      "Grafis Sangat Memukau untuk Konsol PS4",
      "Kompatibel Semua Firmware PS4 HEN (5.05 - 11.00)",
      "Pengiriman Link Google Drive Berkecepatan Tinggi"
    ],
    inStock: true
  },
  {
    id: "game-stray-subindo",
    title: "Stray (Full Subtitle Indonesia)",
    slug: "stray-sub-indo-ps4-hen",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🐱 KUCING CYBERPUNK",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 4.8,
    soldCount: 2040,
    releaseYear: 2022,
    size: "15 GB",
    publisher: "Annapurna Interactive / BlueTwelve",
    tagline: "Petualangan Kucing Oranye Menguak Rahasia Kota Cyberpunk dengan Subtitle Indonesia",
    images: {
      poster: "assets/covers/stray.jpg",
      backdrop: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/stray.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 90000,
      secondary: 50000,
      original: 349000
    },
    description: "Kendalikan seekor kucing oranye tersesat di dalam kota futuristik misterius yang hanya dihuni oleh robot. Ditemani drone kecil B-12, pecahkan teka-teki lingkungan dan temukan jalan pulang dalam Subtitle Indonesia.",
    features: [
      "Full Subtitle Indonesia Dialog Drone B-12 & Warga Robot",
      "Ukuran Ringan 15 GB Cepat Diunduh & Dipasang",
      "Suasana Cyberpunk Memukau & Cerita Hangat Menyentuh Hati",
      "Kompatibel PS4 HEN Semua Versi Firmware",
      "Garansi Game Berjalan Sempurna"
    ],
    inStock: true
  },
  {
    id: "game-ac-odyssey-subindo",
    title: "Assassin's Creed Odyssey (Full Subtitle Indonesia)",
    slug: "assassins-creed-odyssey-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🏛️ YUNANI KUNO RPG",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 4.8,
    soldCount: 1840,
    releaseYear: 2020,
    size: "72 GB",
    publisher: "Ubisoft",
    tagline: "Pilih Takdirmu sebagai Alexios atau Kassandra di Yunani Kuno dengan Teks Sub Indo",
    images: {
      poster: "assets/covers/ac-odyssey.jpg",
      backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/ac-odyssey.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 150000,
      secondary: 85000,
      original: 679000
    },
    description: "Dari prajurit bayaran buangan menjadi pahlawan legendaris Yunani. Hadapi Perang Peloponnesos, monster mitologi Medusa & Minotaur, serta konspirasi Cult of Kosmos dengan Full Subtitle Bahasa Indonesia.",
    features: [
      "Subtitle Indonesia Menyeluruh Seluruh Cerita & Dialog Pilihan",
      "Peta Open-World Laut & Darat Yunani Kuno yang Luas",
      "Pertarungan Kapal Perang Laut Epik",
      "Support PS4 HEN Firmware 5.05 - 11.00",
      "Termasuk DLC Paket Tambahan Cerita Atlantis"
    ],
    inStock: true
  },
  {
    id: "game-one-piece-odyssey-subindo",
    title: "One Piece Odyssey (Full Subtitle Indonesia)",
    slug: "one-piece-odyssey-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🏴‍☠️ ANIME RPG",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 4.7,
    soldCount: 1410,
    releaseYear: 2023,
    size: "35 GB",
    publisher: "Bandai Namco",
    tagline: "Petualangan Epik Kru Bajak Laut Topi Jerami di Pulau Misterius dalam Subtitle Indonesia",
    images: {
      poster: "assets/covers/one-piece-odyssey.jpg",
      backdrop: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/one-piece-odyssey.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 175000,
      secondary: 95000,
      original: 649000
    },
    description: "Game RPG turn-based orisinal kreasi Eiichiro Oda. Kendalikan Luffy, Zoro, Nami, Sanji, dan seluruh kru Mugiwara menjelajahi pulau misterius serta kilas balik nostalgia Alabasta & Dressrosa dalam Bahasa Indonesia.",
    features: [
      "100% Subtitle Indonesia Seluruh Dialog & Jurus Spesial Mugiwara",
      "Cerita Orisinal Pengawasan Langsung Eiichiro Oda",
      "Pertarungan Turn-based Strategis Berbasis Area",
      "Support PS4 HEN Semua Versi",
      "Link Download Cepat Tanpa Batas Kuota"
    ],
    inStock: true
  },
  {
    id: "game-watch-dogs-subindo",
    title: "Watch Dogs (Full Subtitle Indonesia)",
    slug: "watch-dogs-sub-indo-ps4-hen",
    platform: ["PS4 HEN", "PS4", "PS5"],
    category: "subindo",
    type: "digital",
    badge: "💻 HACKER OPEN WORLD",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 4.7,
    soldCount: 1540,
    releaseYear: 2020,
    size: "25 GB",
    publisher: "Ubisoft",
    tagline: "Retas Seluruh Kota Chicago sebagai Aiden Pearce dengan Dialog Subtitle Indonesia",
    images: {
      poster: "assets/covers/watch-dogs.jpg",
      backdrop: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/watch-dogs.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 95000,
      secondary: 55000,
      original: 299000
    },
    description: "Gunakan smartphone Anda sebagai senjata terhebat untuk mengendalikan sistem ctOS di kota Chicago. Retas lampu merah, kamera pengawas, dan saluran listrik untuk membalas dendam keluarga dengan Subtitle Indonesia lengkap.",
    features: [
      "Subtitle Bahasa Indonesia Misi Cerita Utama & Audio Log",
      "Mekanik Hacking Kota Open-World Unik",
      "Aksi Tembak dan Stealth yang Solid",
      "Kompatibel PS4 HEN Firmware 5.05 - 11.00",
      "Ukuran Hemat 25 GB Siap Instalasi Cepat"
    ],
    inStock: true
  },
  {
    id: "game-spiderman-subindo",
    title: "Marvel's Spider-Man (Full Subtitle Indonesia)",
    slug: "marvels-spider-man-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🕷️ SUPERHERO HIT",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 5.0,
    soldCount: 3450,
    releaseYear: 2021,
    size: "50 GB",
    publisher: "PlayStation Studios / Insomniac",
    tagline: "Berayun di Kota New York Melawan Sinister Six dengan Terjemahan Sub Indo Lengkap",
    images: {
      poster: "assets/covers/spiderman.jpg",
      backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/spiderman.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 160000,
      secondary: 90000,
      original: 579000
    },
    description: "Rasakan sensasi berayun jaring laba-laba paling dinamis sebagai Peter Parker melintasi gedung pencakar langit New York City. Hadapi Doc Ock, Mister Negative, dan penjahat Sinister Six dalam Full Subtitle Bahasa Indonesia.",
    features: [
      "100% Subtitle Indonesia Dialog Peter, MJ, Miles & Sinister Six",
      "Termasuk Paket 3 DLC Cerita 'The City That Never Sleeps'",
      "Buka Beragam Kostum Ikonik Spider-Man",
      "Support PS4 HEN Semua Firmware",
      "File Game Teruji 100% Working"
    ],
    inStock: true
  },
  {
    id: "game-pes-2027-bitbox",
    title: "PES 2027 Bitbox Summer Update",
    slug: "pes-2027-bitbox-summer-update-ps4-hen",
    platform: ["PS4 HEN", "PS4"],
    category: "sports",
    type: "digital",
    badge: "⚽ LATEST UPDATE 2027",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 5.0,
    soldCount: 4120,
    releaseYear: 2027,
    size: "42 GB",
    publisher: "Konami / Bitbox Patch Team",
    tagline: "Patch Musim Panas Terbaru: Jersey 2026/2027, Bursa Transfer Eropa, BRI Liga 1 & Timnas",
    images: {
      poster: "assets/covers/pes-2027.jpg",
      backdrop: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/pes-2027.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 135000,
      secondary: 75000,
      original: 399000
    },
    description: "Edisi paling dicari untuk rental dan pecinta game bola PS4! Patch Bitbox Summer Edition membawa pembaruan bursa transfer terkini musim 2026/2027, wajah asli pemain muda, jersey anyar, serta BRI Liga 1 dan Timnas Indonesia lengkap.",
    features: [
      "Update Transfer Pemain Musim Panas 2026/2027 Lengkap",
      "BRI Liga 1 Indonesia & Timnas Garuda Full Face Realistis",
      "Komentator Jernih & Stadion Terkenal Eropa Berlisensi",
      "Grafis Tajam & Gameplay Responsif untuk PS4 HEN",
      "Tinggal Pasang File PKG Langsung Main"
    ],
    inStock: true
  }
];

// Initial Categories for Filter Navigation
const INITIAL_CATEGORIES = [
  { id: "all", name: "Semua Game", icon: "layout-grid" },
  { id: "subindo", name: "Subtitle Indonesia", icon: "languages" },
  { id: "hen", name: "PS4 HEN PKG", icon: "disc" },
  { id: "sports", name: "Olahraga & Bola", icon: "trophy" },
  { id: "digital", name: "Game Digital", icon: "gamepad-2" }
];

// Initial Demo Orders
const INITIAL_ORDERS = [
  {
    id: "ALN-20261104-7842",
    createdAt: "2026-11-04T18:15:00Z",
    customerType: "member",
    customerName: "Rian Pratama",
    customerPhone: "081234567890",
    customerEmail: "rian.pratama@gmail.com",
    notes: "Tolong kirim panduan install PKG untuk PS4 HEN ya min",
    items: [
      {
        productId: "game-gow-ragnarok-subindo",
        title: "God of War Ragnarök (Full Subtitle Indonesia)",
        variant: "PS4 HEN",
        price: 250000,
        qty: 1,
        platform: "PS4 HEN"
      }
    ],
    subtotal: 250000,
    discount: 0,
    total: 250000,
    paymentMethod: "qris",
    paymentStatus: "PAID",
    status: "COMPLETED",
    fulfillment: {
      account: "Link PKG Google Drive Private Server Aliansi",
      password: "Token Akses: ALN-GOW-IND-9912",
      guideLink: "https://aliansistore.com/panduan-install-hen-pkg",
      notes: "File Base Game + Update Sub Indo sudah siap diunduh via Google Drive dan diinstal via Package Installer PS4 HEN."
    }
  },
  {
    id: "ALN-20261104-9120",
    createdAt: "2026-11-04T19:30:00Z",
    customerType: "member",
    customerName: "Budi Santoso",
    customerPhone: "085712349988",
    customerEmail: "budi.santoso@yahoo.com",
    notes: "Pastikan transfer musim panas 2026/2027 dan BRI Liga 1 sudah ada ya min",
    items: [
      {
        productId: "game-pes-2027-bitbox",
        title: "PES 2027 Bitbox Summer Update",
        variant: "PS4 HEN",
        price: 135000,
        qty: 1,
        platform: "PS4 HEN"
      }
    ],
    subtotal: 135000,
    discount: 15000,
    total: 120000,
    paymentMethod: "qris",
    paymentStatus: "PAID",
    status: "COMPLETED",
    fulfillment: {
      account: "Google Drive High-Speed Link",
      password: "Token Akses: ALN-PES-BBX-27",
      guideLink: "https://aliansistore.com/panduan-install-hen-pkg",
      notes: "Patch Bitbox Summer 2027 sudah teruji 100% lancar di semua firmware PS4 HEN."
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
    authProvider: "local",
    avatar: "RP",
    memberSince: "2024"
  },
  {
    id: "usr-cust-google-01",
    identifier: "dimas.gamer@gmail.com",
    name: "Dimas Setiawan",
    phone: "081298765432",
    email: "dimas.gamer@gmail.com",
    pin: "1234",
    role: "customer",
    roleLabel: "Member VIP (Google Verified)",
    authProvider: "google",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    memberSince: "2025"
  },
  {
    id: "usr-cust-ms-01",
    identifier: "dimas.gamer@outlook.com",
    name: "Dimas Pratama",
    phone: "081234567890",
    email: "dimas.gamer@outlook.com",
    pin: "1234",
    role: "customer",
    roleLabel: "Member VIP (Outlook Verified)",
    authProvider: "microsoft",
    avatar: null,
    memberSince: "2025"
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
    authProvider: "local",
    avatar: "BS",
    memberSince: "2025"
  }
];

// Initial Store Config
const INITIAL_CONFIG = {
  storeName: "ALIANSI STORE",
  tagline: "Spesialis Game PS4 HEN, Game Subtitle Indonesia & File PKG Google Drive Terpercaya",
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
  { name: "Rian P.", game: "God of War Ragnarök (Sub Indo)", city: "Jakarta", time: "2 mnt lalu" },
  { name: "Budi S.", game: "PES 2027 Bitbox Summer Update", city: "Surabaya", time: "5 mnt lalu" },
  { name: "Fajar K.", game: "GTA V MOD Subtitle Indonesia", city: "Bandung", time: "10 mnt lalu" },
  { name: "Hendra W.", game: "Ghost of Tsushima (Sub Indo)", city: "Medan", time: "16 mnt lalu" },
  { name: "Aldi T.", game: "The Last of Us Part II (Sub Indo)", city: "Yogyakarta", time: "22 mnt lalu" },
  { name: "Reza M.", game: "Marvel's Spider-Man (Sub Indo)", city: "Makassar", time: "28 mnt lalu" },
  { name: "Dimas A.", game: "Hogwarts Legacy (Sub Indo)", city: "Semarang", time: "34 mnt lalu" },
  { name: "Satria N.", game: "Stray (Sub Indo)", city: "Denpasar", time: "41 mnt lalu" }
];