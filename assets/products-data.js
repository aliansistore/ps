// ALIANSI STORE - Official Products Catalog Database
// Spesialis: Game PS4 HEN, Subtitle Indonesia & Softfile Digital Google Drive

const INITIAL_PRODUCTS = [
  {
    id: "game-it-takes-two-subindo",
    title: "It Takes Two (Full Subtitle Indonesia)",
    slug: "it-takes-two-sub-indo-ps4-hen",
    cusa: "CUSA-16982",
    platform: ["PS4 HEN", "PS4", "PS5"],
    category: "family",
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
      backdrop: "assets/backdrops/it-takes-two.jpg",
      cover: "assets/covers/it-takes-two.jpg",
      screenshots: [
        "assets/backdrops/it-takes-two.jpg"
      ]
    },
    prices: {
      primary: 120000,
      secondary: 120000,
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
    driveLink: "https://drive.google.com/drive/folders/1Pw4Fe24O0LAAsV6Affwp_Ef4C0isK6JQ?usp=sharing",
    inStock: true,
    updatedAt: "2026-11-09T05:30:00.000Z"
  },
  {
    id: "game-gow-ragnarok-subindo",
    title: "God of War Ragnarök (Full Subtitle Indonesia)",
    slug: "god-of-war-ragnarok-sub-indo",
    cusa: "CUSA-34384",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "action",
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
      backdrop: "assets/backdrops/gow-ragnarok.jpg",
      cover: "assets/covers/gow-ragnarok.jpg",
      screenshots: [
        "assets/backdrops/gow-ragnarok.jpg"
      ]
    },
    prices: {
      primary: 250000,
      secondary: 250000,
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
    driveLink: "https://drive.google.com/drive/folders/18C_gowragnarok_subindo_ps4pkg",
    inStock: true
  },
  {
    id: "game-ghost-tsushima-subindo",
    title: "Ghost of Tsushima: Director's Cut (Full Subtitle Indonesia)",
    slug: "ghost-of-tsushima-sub-indo",
    cusa: "CUSA-11456",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "action",
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
      backdrop: "assets/backdrops/ghost-tsushima.jpg",
      cover: "assets/covers/ghost-tsushima.jpg",
      screenshots: [
        "assets/backdrops/ghost-tsushima.jpg"
      ]
    },
    prices: {
      primary: 195000,
      secondary: 195000,
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
    driveLink: "https://drive.google.com/drive/folders/1P0VCc2I_vcNbOnFz7WbK6UaL6a9PRJlZ?usp=drive_link",
    inStock: true,
    updatedAt: "2026-11-09T05:30:00.000Z"
  },
  {
    id: "game-tlou-part2-subindo",
    title: "The Last of Us Part II (Full Subtitle Indonesia)",
    slug: "the-last-of-us-part-2-sub-indo",
    cusa: "CUSA-07820",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "horror",
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
      backdrop: "assets/backdrops/tlou-part2.jpg",
      cover: "assets/covers/tlou-part2.jpg",
      screenshots: [
        "assets/backdrops/tlou-part2.jpg"
      ]
    },
    prices: {
      primary: 180000,
      secondary: 180000,
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
    driveLink: "https://drive.google.com/drive/folders/1uxBTDu14Dez9CDB1H6UTDBJjc1vU25Id?usp=drive_link",
    inStock: true,
    updatedAt: "2026-11-09T05:30:00.000Z"
  },
  {
    id: "game-gta5-subindo",
    title: "GTA V MOD (Full Subtitle Indonesia)",
    slug: "gta-v-mod-subtitle-indonesia-ps4-hen",
    cusa: "CUSA-00411",
    platform: ["PS4 HEN", "PS4"],
    category: "action",
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
      backdrop: "assets/backdrops/gta-v.jpg",
      cover: "assets/covers/gta-v.jpg",
      screenshots: [
        "assets/backdrops/gta-v.jpg"
      ]
    },
    prices: {
      primary: 140000,
      secondary: 140000,
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
    driveLink: "https://drive.google.com/drive/folders/21F_gta5mod_subindo_ps4pkg",
    inStock: true
  },
  {
    id: "game-mk11-subindo",
    title: "Mortal Kombat 11 Ultimate (Full Subtitle Indonesia)",
    slug: "mortal-kombat-11-ultimate-sub-indo",
    cusa: "CUSA-11395",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "fighting",
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
      backdrop: "assets/backdrops/mortal-kombat-11.jpg",
      cover: "assets/covers/mortal-kombat-11.jpg",
      screenshots: [
        "assets/backdrops/mortal-kombat-11.jpg"
      ]
    },
    prices: {
      primary: 135000,
      secondary: 135000,
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
    driveLink: "https://drive.google.com/drive/folders/22G_mk11ultimate_subindo_ps4pkg",
    inStock: true
  },
  {
    id: "game-hogwarts-legacy-subindo",
    title: "Hogwarts Legacy (Full Subtitle Indonesia)",
    slug: "hogwarts-legacy-sub-indo-ps4-hen",
    cusa: "CUSA-12967",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "rpg",
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
      backdrop: "assets/backdrops/hogwarts-legacy.jpg",
      cover: "assets/covers/hogwarts-legacy.jpg",
      screenshots: [
        "assets/backdrops/hogwarts-legacy.jpg"
      ]
    },
    prices: {
      primary: 210000,
      secondary: 210000,
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
    driveLink: "https://drive.google.com/drive/folders/23H_hogwartslegacy_subindo_ps4pkg",
    inStock: true
  },
  {
    id: "game-uncharted-4-subindo",
    title: "Uncharted 4: A Thief's End (Full Subtitle Indonesia)",
    slug: "uncharted-4-sub-indo",
    cusa: "CUSA-00341",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "action",
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
      backdrop: "assets/backdrops/uncharted-4.jpg",
      cover: "assets/covers/uncharted-4.jpg",
      screenshots: [
        "assets/backdrops/uncharted-4.jpg"
      ]
    },
    prices: {
      primary: 110000,
      secondary: 110000,
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
    driveLink: "https://drive.google.com/drive/folders/24I_uncharted4_subindo_ps4pkg",
    inStock: true
  },
  {
    id: "game-stray-subindo",
    title: "Stray (Full Subtitle Indonesia)",
    slug: "stray-sub-indo-ps4-hen",
    cusa: "CUSA-24899",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "adventure",
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
      backdrop: "assets/backdrops/stray.jpg",
      cover: "assets/covers/stray.jpg",
      screenshots: [
        "assets/backdrops/stray.jpg"
      ]
    },
    prices: {
      primary: 90000,
      secondary: 90000,
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
    driveLink: "https://drive.google.com/drive/folders/25J_stray_subindo_ps4pkg",
    inStock: true
  },
  {
    id: "game-ac-odyssey-subindo",
    title: "Assassin's Creed Odyssey (Full Subtitle Indonesia)",
    slug: "assassins-creed-odyssey-sub-indo",
    cusa: "CUSA-09303",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "rpg",
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
      backdrop: "assets/backdrops/ac-odyssey.jpg",
      cover: "assets/covers/ac-odyssey.jpg",
      screenshots: [
        "assets/backdrops/ac-odyssey.jpg"
      ]
    },
    prices: {
      primary: 150000,
      secondary: 150000,
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
    driveLink: "https://drive.google.com/drive/folders/26K_acodyssey_subindo_ps4pkg",
    inStock: true
  },
  {
    id: "game-one-piece-odyssey-subindo",
    title: "One Piece Odyssey (Full Subtitle Indonesia)",
    slug: "one-piece-odyssey-sub-indo",
    cusa: "CUSA-30048",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "rpg",
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
      backdrop: "assets/backdrops/one-piece-odyssey.jpg",
      cover: "assets/covers/one-piece-odyssey.jpg",
      screenshots: [
        "assets/backdrops/one-piece-odyssey.jpg"
      ]
    },
    prices: {
      primary: 175000,
      secondary: 175000,
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
    driveLink: "https://drive.google.com/drive/folders/27L_onepieceodyssey_subindo_ps4pkg",
    inStock: true
  },
  {
    id: "game-watch-dogs-subindo",
    title: "Watch Dogs (Full Subtitle Indonesia)",
    slug: "watch-dogs-sub-indo-ps4-hen",
    cusa: "CUSA-04460",
    platform: ["PS4 HEN", "PS4", "PS5"],
    category: "action",
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
      backdrop: "assets/backdrops/watch-dogs.jpg",
      cover: "assets/covers/watch-dogs.jpg",
      screenshots: [
        "assets/backdrops/watch-dogs.jpg"
      ]
    },
    prices: {
      primary: 95000,
      secondary: 95000,
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
    driveLink: "https://drive.google.com/drive/folders/28M_watchdogs_subindo_ps4pkg",
    inStock: true
  },
  {
    id: "game-spiderman-subindo",
    title: "Marvel's Spider-Man (Full Subtitle Indonesia)",
    slug: "marvels-spider-man-sub-indo",
    cusa: "CUSA-02299",
    platform: ["PS4 HEN", "PS5", "PS4"],
    category: "action",
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
      backdrop: "assets/backdrops/spiderman.jpg",
      cover: "assets/covers/spiderman.jpg",
      screenshots: [
        "assets/backdrops/spiderman.jpg"
      ]
    },
    prices: {
      primary: 160000,
      secondary: 160000,
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
    driveLink: "https://drive.google.com/drive/folders/29N_spiderman_subindo_ps4pkg",
    inStock: true
  },
  {
    id: "game-pes-2027-bitbox",
    title: "PES 2027 Bitbox Summer Update",
    slug: "pes-2027-bitbox-summer-update-ps4-hen",
    cusa: "CUSA-14917",
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
      backdrop: "assets/backdrops/pes-2027.jpg",
      cover: "assets/covers/pes-2027.jpg",
      screenshots: [
        "assets/backdrops/pes-2027.jpg"
      ]
    },
    prices: {
      primary: 135000,
      secondary: 135000,
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
    driveLink: "https://drive.google.com/drive/folders/30O_pes2027bitbox_subindo_ps4pkg",
    inStock: true
  }
];

// Initial Categories for Filter Navigation & Genre PlayStation
const INITIAL_CATEGORIES = [
  { id: "all", name: "Semua Game", icon: "layout-grid" },
  { id: "subindo", name: "Subtitle Indonesia", icon: "languages" },
  { id: "hen", name: "PS4 HEN PKG", icon: "disc" },
  { id: "action", name: "Action & Adventure", icon: "sword" },
  { id: "rpg", name: "RPG & Open World", icon: "sparkles" },
  { id: "horror", name: "Horror & Survival", icon: "skull" },
  { id: "sports", name: "Olahraga & Balap", icon: "trophy" },
  { id: "fighting", name: "Fighting / Tarung", icon: "flame" },
  { id: "family", name: "Co-op & Family", icon: "users" },
  { id: "shooter", name: "Shooter & FPS", icon: "crosshair" },
  { id: "digital", name: "Game Digital", icon: "gamepad-2" }
];

// Initial Orders Database (Fresh / Ready for Live Orders)
const INITIAL_ORDERS = [];

// Initial Users Database (Unified Auth for Admin & Customers)
const INITIAL_USERS = [
  {
    id: "usr-admin-01",
    identifier: "admin",
    name: "Admin Aliansi Store",
    phone: "081234567890",
    email: "aliansistoreofficial@gmail.com",
    pin: "1234",
    role: "admin",
    roleLabel: "Super Admin Toko",
    avatar: "👑"
  }
];

// Initial Store Config
const INITIAL_CONFIG = {
  storeName: "ALIANSI STORE",
  tagline: "Spesialis Game PS4 HEN, Game Subtitle Indonesia & File PKG Google Drive Terpercaya",
  whatsappNumber: "6281234567890",
  whatsappFormatted: "+62 812-3456-7890",
  adminEmail: "aliansistoreofficial@gmail.com",
  adminPin: "1234",
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbzRbjQSYGQ6Z3BRrjAT-dGYtT_XhV9N9uXm2NXPJtLRF2ZH0SOcK34VBPsWcuNrrJ1uGw/exec",
  bankAccounts: [
    { bank: "BCA", number: "8830192831", name: "ALIANSI STORE INDONESIA" },
    { bank: "MANDIRI", number: "1370019283741", name: "ALIANSI STORE INDONESIA" },
    { bank: "BRI", number: "018201002938530", name: "ALIANSI STORE INDONESIA" },
    { bank: "DANA / OVO / GOPAY", number: "0812-3456-7890", name: "ALIANSI STORE" }
  ],
  vouchers: [
    {
      code: "ALIANSIBARU",
      name: "Diskon Pelanggan Baru",
      type: "percent",
      discountPercent: 10,
      discountAmount: 0,
      minPurchase: 100000,
      maxDiscount: 30000,
      expiryDate: "",
      quota: 0,
      usedCount: 0,
      isActive: true,
      description: "Diskon 10% untuk transaksi perdana min. belanja Rp 100.000 (Maks. potongan Rp 30.000)"
    },
    {
      code: "HENHEMAT",
      name: "Spesial Game HEN",
      type: "percent",
      discountPercent: 15,
      discountAmount: 0,
      minPurchase: 200000,
      maxDiscount: 50000,
      expiryDate: "",
      quota: 0,
      usedCount: 0,
      isActive: true,
      description: "Diskon 15% untuk pembelian game min. belanja Rp 200.000 (Maks. potongan Rp 50.000)"
    }
  ]
};

// Live Recent Activity Data for Social Proof Ticker
const RECENT_PURCHASES = [
  { name: "Rian P.", game: "God of War Ragnarök (Sub Indo)", city: "Jakarta Selatan", time: "2 mnt lalu" },
  { name: "Budi S.", game: "PES 2027 Bitbox Summer Update", city: "Surabaya", time: "5 mnt lalu" },
  { name: "Fajar K.", game: "GTA V MOD Subtitle Indonesia", city: "Bandung", time: "9 mnt lalu" },
  { name: "Hendra W.", game: "Ghost of Tsushima (Sub Indo)", city: "Medan", time: "14 mnt lalu" },
  { name: "Aldi T.", game: "The Last of Us Part II (Sub Indo)", city: "Yogyakarta", time: "21 mnt lalu" },
  { name: "Reza M.", game: "Marvel's Spider-Man (Sub Indo)", city: "Makassar", time: "27 mnt lalu" },
  { name: "Dimas A.", game: "Hogwarts Legacy (Sub Indo)", city: "Semarang", time: "33 mnt lalu" },
  { name: "Satria N.", game: "Stray (Sub Indo)", city: "Denpasar", time: "42 mnt lalu" },
  { name: "Wahyu K.", game: "Resident Evil 4 Remake (Full Sub Indo)", city: "Palembang", time: "48 mnt lalu" },
  { name: "Kevin L.", game: "Black Myth: Wukong (Sub Indo)", city: "Tangerang", time: "54 mnt lalu" },
  { name: "Bayu P.", game: "EA Sports FC 25", city: "Bekasi", time: "1 jam lalu" },
  { name: "Gilang R.", game: "Elden Ring + DLC Shadow of the Erdtree", city: "Malang", time: "1 jam lalu" },
  { name: "Aditya R.", game: "Red Dead Redemption 2 (Sub Indo)", city: "Depok", time: "1 jam lalu" },
  { name: "Rizky M.", game: "Sekiro: Shadows Die Twice (Sub Indo)", city: "Balikpapan", time: "2 jam lalu" },
  { name: "Aris T.", game: "It Takes Two (Sub Indo)", city: "Bogor", time: "2 jam lalu" },
  { name: "Denny H.", game: "Cyberpunk 2077: Phantom Liberty", city: "Samarinda", time: "2 jam lalu" },
  { name: "Doni K.", game: "Uncharted 4: A Thief's End (Sub Indo)", city: "Banjarmasin", time: "3 jam lalu" },
  { name: "Ilham F.", game: "Assassin's Creed Mirage", city: "Pontianak", time: "3 jam lalu" },
  { name: "Yoga P.", game: "Monster Hunter World: Iceborne", city: "Pekanbaru", time: "3 jam lalu" },
  { name: "Teguh S.", game: "Horizon Forbidden West (Sub Indo)", city: "Bandar Lampung", time: "4 jam lalu" },
  { name: "Bagus P.", game: "Tekken 8", city: "Cimahi", time: "4 jam lalu" },
  { name: "Rahmat H.", game: "Need for Speed Unbound", city: "Surakarta", time: "4 jam lalu" },
  { name: "Fikri M.", game: "Mortal Kombat 1", city: "Padang", time: "5 jam lalu" },
  { name: "Farhan A.", game: "Death Stranding Director's Cut", city: "Batam", time: "5 jam lalu" },
  { name: "Tommy W.", game: "Gran Turismo 7", city: "Cirebon", time: "6 jam lalu" },
  { name: "Yudha S.", game: "Final Fantasy VII Remake Intergrade", city: "Sukabumi", time: "6 jam lalu" },
  { name: "Hafiz B.", game: "The Witcher 3: Wild Hunt (Sub Indo)", city: "Purwokerto", time: "7 jam lalu" },
  { name: "Agung S.", game: "Resident Evil Village Gold Edition", city: "Mataram", time: "7 jam lalu" },
  { name: "Naufal R.", game: "Watch Dogs 2", city: "Manado", time: "8 jam lalu" },
  { name: "Galih P.", game: "God of War Ragnarök (Sub Indo)", city: "Kupang", time: "8 jam lalu" },
  { name: "Fandi K.", game: "PES 2027 Bitbox Summer Update", city: "Ambon", time: "9 jam lalu" },
  { name: "Syahrul M.", game: "GTA V MOD Subtitle Indonesia", city: "Jayapura", time: "10 jam lalu" }
];

// Initial Demo Game Requests from Customers (Clean Slate - Empty for live store)
const INITIAL_GAME_REQUESTS = [];

// Initial Two-Way Live Chat Messages between Admin & Customers (Clean Slate - Empty for live store)
const INITIAL_CHATS = [];

// Initial High-Quality Verified Testimonials & Reviews (Fallback when no customer reviews yet)
const INITIAL_REVIEWS = [
  {
    id: "rev-101",
    customerName: "Rian Dewantara",
    city: "Bandung, Jawa Barat",
    gameTitle: "Ghost of Tsushima & GoW Ragnarok (Sub Indo)",
    rating: 5,
    comment: "Link Google Drive otomatis langsung terkirim ke Gmail dalam 5 detik setelah bayar QRIS. Download full speed tanpa limit, file PKG diekstrak lancar tanpa ada yang korup. Subtitle Indonesianya rapi banget, terjemahannya enak dibaca. Mantap pol Aliansi Store!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-11-10T14:20:00.000Z"
  },
  {
    id: "rev-102",
    customerName: "Budi Santoso",
    city: "Surabaya, Jawa Timur",
    gameTitle: "The Last of Us Part II (Sub Indo)",
    rating: 5,
    comment: "Awalnya agak ragu beli digital HEN, pas coba ternyata beneran work 100% di PS4 HEN firmware 9.00 saya. Panduan cara instalnya sangat jelas buat yang baru pertama kali coba pasang PKG. Admin fast respon banget pas nanya via WA. Recommended seller!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-11-09T18:45:00.000Z"
  },
  {
    id: "rev-103",
    customerName: "Hendra Kusuma",
    city: "Jakarta Barat, DKI Jakarta",
    gameTitle: "PES 2027 Bitbox + BRI Liga 1 Update",
    rating: 5,
    comment: "Patch PES paling update yang pernah saya coba. Jersey dan klub Liga Indonesia lengkap, komentator dan rumputnya jernih. Anak-anak di rumah seneng banget. Layanan otomatisnya canggih, faktur dan link langsung masuk email!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-11-08T09:12:00.000Z"
  },
  {
    id: "rev-104",
    customerName: "Dimas Pratama",
    city: "Medan, Sumatera Utara",
    gameTitle: "GTA V MOD Subtitle Indonesia",
    rating: 5,
    comment: "Gokil ini store, harganya ramah di kantong tapi kualitas pelayanannya bintang lima. Otomasi sistem Drive-nya juara, gak perlu nunggu admin bangun tidur buat dapetin link. Mod bahasa Indonesianya lucu dan seru!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-11-07T11:30:00.000Z"
  },
  {
    id: "rev-105",
    customerName: "Fajar Nugroho",
    city: "Yogyakarta, DIY",
    gameTitle: "Red Dead Redemption 2 (Sub Indo)",
    rating: 5,
    comment: "RDR2 ukuran file gede banget tapi diparting dengan sangat rapi dan diberi label jelas di Drive. Gak ada part yang missing. Main lancar jaya sampai tamat. Terima kasih Aliansi Store atas dedikasinya buat gamers PS4 Indonesia!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-11-06T16:05:00.000Z"
  },
  {
    id: "rev-106",
    customerName: "Kevin Sanjaya",
    city: "Semarang, Jawa Tengah",
    gameTitle: "Elden Ring (Shadow of the Erdtree Ready)",
    rating: 5,
    comment: "Proses serba instan tanpa ribet. Habis transfer langsung kebuka akses download Google Drive. Dapet bonus panduan lengkap dan tips install GoldHEN. Pasti bakal repeat order judul lain di sini!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-11-05T20:10:00.000Z"
  },
  {
    id: "rev-107",
    customerName: "Arif Hidayat",
    city: "Makassar, Sulawesi Selatan",
    gameTitle: "Marvel's Spider-Man: Miles Morales (Sub Indo)",
    rating: 5,
    comment: "Mantap betul! Game lancar jaya di PS4 Fat HEN 11.00. Subtitle Indonesia bikin makin paham alur cerita dan misi sampingan. Adminnya juga ramah dan sabar bimbing pas ditanya cara extract PKG.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-11-04T13:40:00.000Z"
  },
  {
    id: "rev-108",
    customerName: "Reza Pahlevi",
    city: "Tangerang Selatan, Banten",
    gameTitle: "Resident Evil 4 Remake (Sub Indo)",
    rating: 5,
    comment: "Kualitas grafis dan audio mantap, mod bahasa Indonesianya rapi dan natural. Sistem invoice dan riwayat order di web ini juga sangat canggih dan rapi. Best game store!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-11-03T10:15:00.000Z"
  },
  {
    id: "rev-109",
    customerName: "Bayu Wicaksono",
    city: "Malang, Jawa Timur",
    gameTitle: "Hogwarts Legacy (Sub Indo)",
    rating: 5,
    comment: "Gak nyangka bisa main Hogwarts Legacy full bahasa Indonesia di PS4 HEN. Mantra sihir dan dialog ceritanya diterjemahkan pas banget tanpa kaku. Link Google Drive super kenceng, 40GB kelar 45 menit!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-11-02T16:20:00.000Z"
  },
  {
    id: "rev-110",
    customerName: "Aditya Rahman",
    city: "Bekasi, Jawa Barat",
    gameTitle: "Assassin's Creed Odyssey (Sub Indo)",
    rating: 5,
    comment: "Adminnya ramah dan fast respon pas diajarin cara gabung part PKG via WhatsApp. Gamenya lancar jaya di firmware 9.00 GoldHEN. Koleksi game sub indo di sini beneran paling lengkap dan terpercaya!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-11-01T11:45:00.000Z"
  },
  {
    id: "rev-111",
    customerName: "Satria Bimantara",
    city: "Denpasar, Bali",
    gameTitle: "Stray (Sub Indo)",
    rating: 5,
    comment: "Kucing oren petualangannya seru abis, anak saya suka banget ceritanya. Subtitle Indonesianya bikin alur cerita makin asik diikutin. Pelayanan serba otomatis dan aman!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-31T09:10:00.000Z"
  },
  {
    id: "rev-112",
    customerName: "Farhan Kurnia",
    city: "Palembang, Sumatera Selatan",
    gameTitle: "Mortal Kombat 11 Ultimate (Sub Indo)",
    rating: 5,
    comment: "Story modenya epik banget pas pake sub Indo. Fatal blow dan jurusnya kebaca jelas. File PKG gak ada yang korup pas diinstall ke flashdisk. Mantap Aliansi Store!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-30T14:30:00.000Z"
  },
  {
    id: "rev-113",
    customerName: "Ilham Dwi",
    city: "Bogor, Jawa Barat",
    gameTitle: "It Takes Two (Sub Indo)",
    rating: 5,
    comment: "Beli game ini buat mabar sama istri pas weekend, seru banget! Dialognya lucu dan terjemahannya pas. Habis bayar QRIS langsung otomatis dapet link Drive tanpa nunggu admin.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-29T20:15:00.000Z"
  },
  {
    id: "rev-114",
    customerName: "Gilang Pratama",
    city: "Solo, Jawa Tengah",
    gameTitle: "Uncharted 4: A Thief's End (Sub Indo)",
    rating: 5,
    comment: "Grafis petualangan Nathan Drake juara, subtitle Indonesianya kelas bioskop! Aliansi Store emang spesialis game PS4 HEN terbaik se-Indonesia.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-28T15:40:00.000Z"
  },
  {
    id: "rev-115",
    customerName: "Bagus Triyanto",
    city: "Samarinda, Kalimantan Timur",
    gameTitle: "One Piece Odyssey (Sub Indo)",
    rating: 5,
    comment: "Buat pecinta anime One Piece wajib punya! Petualangan Luffy dkk kerasa banget emosinya pas baca bahasa Indonesia. Download di Drive gak pake ribet shortlink iklan.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-27T18:05:00.000Z"
  },
  {
    id: "rev-116",
    customerName: "Wahyu Nugraha",
    city: "Cirebon, Jawa Barat",
    gameTitle: "Watch Dogs (Sub Indo)",
    rating: 5,
    comment: "Mod bahasa Indonesianya sangat detail sampai ke SMS dan profil NPC kota. Toko terpercaya, faktur pembayarannya resmi dan rapi banget.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-26T12:20:00.000Z"
  },
  {
    id: "rev-117",
    customerName: "Danang Wibowo",
    city: "Balikpapan, Kalimantan Timur",
    gameTitle: "God of War III Remastered (Sub Indo)",
    rating: 5,
    comment: "Nostalgia main Kratos bantai dewa Olympus dengan subtitle Indonesia makin greget! Link cepat tanpa limit kuota. Terima kasih Aliansi Store.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-25T17:50:00.000Z"
  },
  {
    id: "rev-118",
    customerName: "Eko Prasetyo",
    city: "Bandar Lampung, Lampung",
    gameTitle: "PES 2027 Bitbox Summer Update",
    rating: 5,
    comment: "Update transfer pemain musim panas beneran paling baru. Gameplay smooth di PS4 HEN. Komentator dan stadion lokal bikin makin betah main berjam-jam.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-24T21:10:00.000Z"
  },
  {
    id: "rev-119",
    customerName: "Rizky Maulana",
    city: "Depok, Jawa Barat",
    gameTitle: "Cyberpunk 2077 (Sub Indo)",
    rating: 5,
    comment: "Night City versi Sub Indo gokil parah! Ceritanya jadi paham 100%. File PKG tinggal colok USB langsung install di GoldHEN tanpa ribet setting ini itu.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-23T13:35:00.000Z"
  },
  {
    id: "rev-120",
    customerName: "Taufik Hidayat",
    city: "Banjarmasin, Kalimantan Selatan",
    gameTitle: "Resident Evil Village (Sub Indo)",
    rating: 5,
    comment: "Seremnya dapet, teka-tekinya jadi gampang diselesain karena petunjuknya udah bahasa Indonesia. Adminnya responsif pas ditanya via WA.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-22T19:00:00.000Z"
  },
  {
    id: "rev-121",
    customerName: "Ghani Ramadhan",
    city: "Padang, Sumatera Barat",
    gameTitle: "Need for Speed Heat (Sub Indo)",
    rating: 5,
    comment: "Balapan liar seru, alur ceritanya ngalir. Mantap Aliansi Store, bayar hitungan detik langsung dikasih akses Google Drive dedicated tanpa antre.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-21T10:45:00.000Z"
  },
  {
    id: "rev-122",
    customerName: "Tommy Lie",
    city: "Batam, Kepulauan Riau",
    gameTitle: "Monster Hunter World (Sub Indo)",
    rating: 5,
    comment: "Nama monster dan crafting senjatanya jelas banget. Gak perlu buka google translate lagi pas main. Recomended pol buat gamers PS4 HEN!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-20T16:15:00.000Z"
  },
  {
    id: "rev-123",
    customerName: "Fikri Naufal",
    city: "Tasikmalaya, Jawa Barat",
    gameTitle: "Sekiro: Shadows Die Twice (Sub Indo)",
    rating: 5,
    comment: "Game susah tapi pas ada sub Indo jadi ngerti lore dan strategi lawan bosnya. File bersih dan bebas virus. Sukses terus buat Aliansi Store!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-19T14:50:00.000Z"
  },
  {
    id: "rev-124",
    customerName: "Yoga Pangestu",
    city: "Kediri, Jawa Timur",
    gameTitle: "Horizon Forbidden West (Sub Indo)",
    rating: 5,
    comment: "Visual Aloy mantap, cerita suku-sukunya seru dibaca pake bahasa kita sendiri. Download Google Drive kenceng pol di speed 100Mbps.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-18T18:25:00.000Z"
  },
  {
    id: "rev-125",
    customerName: "Faisal Reza",
    city: "Pekanbaru, Riau",
    gameTitle: "Tekken 7 All DLC (Sub Indo)",
    rating: 5,
    comment: "Karakter DLC komplit, kostum kebuka semua. Anak tongkrongan seneng banget buat turnamen kecil-kecilan di rental PS kami. Terima kasih!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-17T20:40:00.000Z"
  },
  {
    id: "rev-126",
    customerName: "Galih Wardhana",
    city: "Pontianak, Kalimantan Barat",
    gameTitle: "Batman: Arkham Knight (Sub Indo)",
    rating: 5,
    comment: "Gotham City kelam banget, teka-teki Riddler kebaca jelas. PKG ukuran gede terbagi rapi tanpa error pas ekstrak di PC.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-16T11:15:00.000Z"
  },
  {
    id: "rev-127",
    customerName: "Surya Darmawan",
    city: "Manado, Sulawesi Utara",
    gameTitle: "Final Fantasy VII Remake (Sub Indo)",
    rating: 5,
    comment: "Cloud dan Tifa dialognya romantis dan keren pas sub Indo. Aliansi Store pelayanannya no debat, 100% amanah dan memuaskan.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-15T15:30:00.000Z"
  },
  {
    id: "rev-128",
    customerName: "Doni Kusuma",
    city: "Kudus, Jawa Tengah",
    gameTitle: "Ghost of Tsushima: Iki Island DLC (Sub Indo)",
    rating: 5,
    comment: "Ekspansi Iki Island seru parah. Jin Sakai suaranya mantap ditambah terjemahan Indonesia yang puitis layaknya samurai sejati.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-14T17:05:00.000Z"
  },
  {
    id: "rev-129",
    customerName: "Prasetyo Hadi",
    city: "Sukabumi, Jawa Barat",
    gameTitle: "Crash Bandicoot N. Sane Trilogy",
    rating: 5,
    comment: "Game nostalgia masa kecil, anak-anak seneng banget mainin bareng di ruang keluarga. Pengiriman file instan tanpa basa-basi.",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-13T09:40:00.000Z"
  },
  {
    id: "rev-130",
    customerName: "Bramantyo Kusuma",
    city: "Jakarta Selatan, DKI Jakarta",
    gameTitle: "The Witcher 3: Wild Hunt (Sub Indo)",
    rating: 5,
    comment: "Salah satu game terbaik sepanjang masa makin sempurna dengan full Sub Indo. Pilihan dialog cerita jadi gak salah pilih lagi. Aliansi Store juaranya!",
    isVerified: true,
    platform: "PS4 HEN",
    createdAt: "2026-10-12T19:55:00.000Z"
  }
];

// Initial Frequently Asked Questions (FAQ)
const INITIAL_FAQS = [
  {
    id: "faq-01",
    category: "Pemesanan & Drive",
    question: "Bagaimana cara menerima file game setelah pembayaran berhasil?",
    answer: "Link Google Drive dedicated otomatis dikirimkan ke alamat email Gmail Anda dalam hitungan detik setelah pembayaran QRIS atau Transfer Bank terverifikasi sistem. Selain itu, tautan download dan panduan instalasi juga langsung terbuka di layar faktur resmi Anda.",
    order: 1,
    isActive: true
  },
  {
    id: "faq-02",
    category: "Kompatibilitas",
    question: "Apakah seluruh game di katalog kompatibel dengan konsol PS4 HEN saya?",
    answer: "Ya, 100% kompatibel! Seluruh koleksi game kami mendukung PS4 HEN dengan firmware 5.05, 6.72, 7.55, 9.00, hingga 11.00. Game disediakan dalam format file .PKG resmi yang siap dipasang langsung melalui menu Package Installer di konsol Anda.",
    order: 2,
    isActive: true
  },
  {
    id: "faq-03",
    category: "Kualitas Game",
    question: "Apakah game Subtitle Indonesia ini aman dan tidak mudah crash?",
    answer: "Sangat aman dan teruji. Seluruh game Subtitle Indonesia kami telah melewati pengujian menyeluruh di konsol PS4 Fat, Slim, dan Pro hingga tamat tanpa kendala crash. Terjemahan bahasa Indonesia dikerjakan dengan rapi, mencakup seluruh dialog percakapan cerita, menu, dan misi sampingan.",
    order: 3,
    isActive: true
  },
  {
    id: "faq-04",
    category: "Google Drive",
    question: "Bagaimana jika kuota download Google Drive limit atau tautan membutuhkan refresh?",
    answer: "Anda tidak perlu khawatir! Server Google Drive kami menggunakan penyimpanan cloud berkecepatan tinggi dengan akses permanen. Jika sewaktu-waktu tautan membutuhkan pembaruan, tombol 'Kirim Ulang Link' otomatis tersedia di invoice atau Anda dapat menghubungi CS WhatsApp kami untuk bantuan kilat.",
    order: 4,
    isActive: true
  },
  {
    id: "faq-05",
    category: "Instalasi",
    question: "Bagaimana langkah mudah memasang file PKG ke dalam PS4 HEN?",
    answer: "Cukup 3 langkah praktis:\n1. Download file game dari Google Drive ke flashdisk atau HDD eksternal berformat exFAT.\n2. Tancapkan ke port USB PS4, lalu buka menu GoldHEN > Package Installer.\n3. Klik pasang (install) file game dan update patch secara berurutan. Panduan lengkap juga terlampir di invoice pembelian.",
    order: 5,
    isActive: true
  },
  {
    id: "faq-06",
    category: "Garansi & Bantuan",
    question: "Apakah tersedia garansi file dan bantuan jika saya masih pemula?",
    answer: "Tentu saja! Kami memberikan Garansi File Anti-Korup 100%. Jika ada part yang gagal diekstrak karena kendala internet Anda, tim Customer Support kami siap memberikan tautan part cadangan dan memandu proses instalasi langkah demi langkah via WhatsApp.",
    order: 6,
    isActive: true
  }
];
