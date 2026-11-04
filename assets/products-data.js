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
      "Kompatibel PS4 HEN (Firmware 5.05 - 11.00) & Akun Digital",
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
    description: "Babak penutup epik saga Nordik Kratos dan Atreus kini hadir dengan terjemahan Bahasa Indonesia terlengkap. Nikmati setiap kutipan puitis Kratos, pertarungan brutal dewa Nordik Thor & Odin, dan eksplorasi 9 Realm tanpa hambatan bahasa.",
    features: [
      "Full Subtitle Bahasa Indonesia Lengkap Misi & Lore Kodex",
      "Mendukung DLC Valhalla Terintegrasi",
      "Tampilan 60 FPS Sangat Halus di PS4 Pro & PS5",
      "Kompatibel PS4 HEN Firmware 5.05 hingga 11.00",
      "Full Part Google Drive Super Cepat"
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
    title: "GTA V MOD Subtitle Indonesia",
    slug: "gta-v-mod-sub-indo-ps4-hen",
    platform: ["PS4 HEN", "PS4", "PS5"],
    category: "subindo",
    type: "digital",
    badge: "🚗 MOD INDONESIA",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 5.0,
    soldCount: 3120,
    releaseYear: 2023,
    size: "85 GB",
    publisher: "Rockstar Games / ALIANSI Mod Team",
    tagline: "Jelajahi Los Santos dengan Subtitle Indonesia, Cheat Menu Trainer & Mod Lokal",
    images: {
      poster: "assets/covers/gta-v.jpg",
      backdrop: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/gta-v.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 150000,
      secondary: 85000,
      original: 429000
    },
    description: "Kisah tiga serangkai Michael, Franklin, dan Trevor kini dilengkapi Subtitle Indonesia lengkap, Menu Cheat Trainer bawaan (uang tak terbatas, teleportasi, kebal), serta modifikasi kendaraan patroli khas Indonesia.",
    features: [
      "100% Subtitle Indonesia Misi Cerita Utama & Percakapan Telepon",
      "Dilengkapi Menu Mod Trainer Siap Pakai di PS4 HEN",
      "Bonus Opsi Kendaraan Lokal Indonesia",
      "Gameplay Sangat Stabil Bebas Error",
      "Akses Link Google Drive Selamanya"
    ],
    inStock: true
  },
  {
    id: "game-mk11-subindo",
    title: "Mortal Kombat 11 Ultimate (Full Subtitle Indonesia)",
    slug: "mortal-kombat-11-ultimate-sub-indo",
    platform: ["PS4 HEN", "PS4", "PS5"],
    category: "subindo",
    type: "digital",
    badge: "🥊 ALL DLC UNLOCKED",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 4.9,
    soldCount: 1420,
    releaseYear: 2020,
    size: "68 GB",
    publisher: "Warner Bros. Games / NetherRealm",
    tagline: "Edisi Terlengkap Termasuk Aftermath & Kombat Pack dengan Story Mode Sub Indo",
    images: {
      poster: "assets/covers/mortal-kombat-11.jpg",
      backdrop: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/mortal-kombat-11.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 140000,
      secondary: 80000,
      original: 499000
    },
    description: "Versi puncak dari game fighting terpopuler dengan grafik sinematik spektakuler. Mencakup Story Mode utama dan ekspansi Aftermath dalam Subtitle Bahasa Indonesia, serta 37 karakter petarung lengkap.",
    features: [
      "Subtitle Indonesia untuk Story Mode Sinematik & Aftermath",
      "Karakter Lengkap: Rambo, Terminator, Robocop, Spawn, Joker",
      "Fatality & Brutality Unlocked",
      "Mode 2 Pemain Versus Seru Bersama Teman",
      "Support PS4 HEN Semua Versi"
    ],
    inStock: true
  },
  {
    id: "game-hogwarts-legacy-subindo",
    title: "Hogwarts Legacy (Full Subtitle Indonesia)",
    slug: "hogwarts-legacy-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🪄 OPEN WORLD RPG",
    isSubIndo: true,
    isHen: true,
    isSpotlight: true,
    rating: 4.9,
    soldCount: 1890,
    releaseYear: 2023,
    size: "75 GB",
    publisher: "Warner Bros. Games / Avalanche",
    tagline: "Jadilah Penyihir di Dunia Harry Potter Abad ke-19 dengan Subtitle Indonesia Rapi",
    images: {
      poster: "assets/covers/hogwarts-legacy.jpg",
      backdrop: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/hogwarts-legacy.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 230000,
      secondary: 130000,
      original: 799000
    },
    description: "Petualangan RPG aksi dunia terbuka di dunia sihir Hogwarts tahun 1800-an. Eksplorasi kastil Hogwarts, Hogsmeade, dan Hutan Terlarang sambil mempelajari mantra sihir kuno dengan terjemahan Bahasa Indonesia yang mudah dipahami.",
    features: [
      "100% Subtitle Indonesia Misi Cerita, Dialog Guru & Mantra",
      "Bebas Buat Karakter Penyihir & Masuk Asrama Impian",
      "Eksplorasi Dunia Sihir Terbuka yang Sangat Luas",
      "Format PKG PS4 HEN Siap Pasang",
      "Kecepatan Download Maksimal Google Drive"
    ],
    inStock: true
  },
  {
    id: "game-uncharted-4-subindo",
    title: "Uncharted 4: A Thief's End (Full Subtitle Indonesia)",
    slug: "uncharted-4-a-thiefs-end-sub-indo",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "subindo",
    type: "digital",
    badge: "🧭 ACTION ADVENTURE",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 5.0,
    soldCount: 2210,
    releaseYear: 2021,
    size: "55 GB",
    publisher: "PlayStation Studios / Naughty Dog",
    tagline: "Petualangan Terakhir Nathan Drake Mencari Harta Karun Bajak Laut Henry Avery",
    images: {
      poster: "assets/covers/uncharted-4.jpg",
      backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/uncharted-4.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 130000,
      secondary: 75000,
      original: 379000
    },
    description: "Ikuti aksi petualangan mendebarkan Nathan Drake dan sang kakak Sam mencari kota koloni bajak laut Libertalia di Madagaskar. Grafis spektakuler kelas Hollywood kini tersaji dalam Full Subtitle Bahasa Indonesia.",
    features: [
      "Full Subtitle Indonesia untuk Semua Dialog & Buku Catatan Drake",
      "Aksi Tembak-Menembak & Parkour Sinematik Memukau",
      "Teka-teki Misteri Bajak Laut Menantang",
      "Mendukung Konsol PS4 HEN Semua Firmware",
      "File Game Lengkap Bersih dari Corrupt"
    ],
    inStock: true
  },
  {
    id: "game-stray-subindo",
    title: "Stray (Full Subtitle Indonesia)",
    slug: "stray-sub-indo-ps4-hen",
    platform: ["PS4 HEN", "PS4", "PS5"],
    category: "subindo",
    type: "digital",
    badge: "🐱 KUCING CYBERPUNK",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 4.9,
    soldCount: 1650,
    releaseYear: 2022,
    size: "15 GB",
    publisher: "Annapurna Interactive / BlueTwelve",
    tagline: "Eksplorasi Kota Cyberpunk Penuh Robot sebagai Kucing Oren Pintar dengan Teks Indonesia",
    images: {
      poster: "assets/covers/stray.jpg",
      backdrop: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/stray.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 110000,
      secondary: 65000,
      original: 349000
    },
    description: "Game unik peraih penghargaan di mana Anda mengendalikan kucing oren tersesat di dalam kota futuristik bawah tanah yang dihuni robot. Berteman dengan drone B-12 dan pecahkan misteri kota dengan Subtitle Indonesia lengkap.",
    features: [
      "Full Teks & Subtitle Bahasa Indonesia Dialog Robot & Drone B-12",
      "Ukuran Ringan (Hanya 15 GB), Cepat Didownload",
      "Visual Cyberpunk Bernuansa Neon Sangat Cantik",
      "Support PS4 HEN 5.05 hingga 11.00",
      "Link Google Drive Praktis & Cepat"
    ],
    inStock: true
  },
  {
    id: "game-ac-odyssey-subindo",
    title: "Assassin's Creed Odyssey (Full Subtitle Indonesia)",
    slug: "assassins-creed-odyssey-sub-indo",
    platform: ["PS4 HEN", "PS4", "PS5"],
    category: "subindo",
    type: "digital",
    badge: "🏛️ YUNANI KUNO RPG",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 4.8,
    soldCount: 1720,
    releaseYear: 2020,
    size: "80 GB",
    publisher: "Ubisoft",
    tagline: "Pilih Alexios atau Kassandra dan Taklukkan Yunani Kuno dalam Bahasa Indonesia",
    images: {
      poster: "assets/covers/ac-odyssey.jpg",
      backdrop: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85",
      cover: "assets/covers/ac-odyssey.jpg",
      screenshots: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
      ]
    },
    prices: {
      primary: 145000,
      secondary: 85000,
      original: 589000
    },
    description: "Jadilah pahlawan Sparta legendaris di era Perang Peloponnesos. Jelajahi laut Aegea yang biru, lawan monster mitologi Yunani seperti Medusa dan Minotaur, dengan seluruh pilihan dialog cerita bersubtitle Bahasa Indonesia.",
    features: [
      "Subtitle Bahasa Indonesia untuk Seluruh Quest Utama & Percabangan Cerita",
      "Pilihan Karakter Alexios atau Kassandra",
      "Pertempuran Kolosal Perang 300 Prajurit & Perang Kapal Laut",
      "Kompatibel PS4 HEN Semua Versi",
      "Garansi File PKG Bebas Rusak"
    ],
    inStock: true
  },
  {
    id: "game-one-piece-odyssey-subindo",
    title: "One Piece Odyssey (Full Subtitle Indonesia)",
    slug: "one-piece-odyssey-sub-indo",
    platform: ["PS4 HEN", "PS4", "PS5"],
    category: "subindo",
    type: "digital",
    badge: "🏴‍☠️ ANIME RPG",
    isSubIndo: true,
    isHen: true,
    isSpotlight: false,
    rating: 4.8,
    soldCount: 1390,
    releaseYear: 2023,
    size: "35 GB",
    publisher: "Bandai Namco / ILCA",
    tagline: "Petualangan Kru Bajak Laut Topi Jerami di Pulau Misterius Waford dengan Subtitle Indonesia",
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
  { id: "sports", name: "Olahraga & Bola", icon: "trophy" }
];
