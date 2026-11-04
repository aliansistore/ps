// ALIANSI STORE - Next-Gen Gaming UI & Logic Engine
// Features: Web Audio SFX Synth, PS5 Console Spotlight, Card Dual-Pricing, Realtime Fulfillment

const APP_STORAGE_KEYS = {
  PRODUCTS: 'aliansi_store_products_v3',
  ORDERS: 'aliansi_store_orders_v3',
  CONFIG: 'aliansi_store_config_v3',
  CART: 'aliansi_store_cart_v2',
  USER: 'aliansi_store_user_v2',
  ADMIN_AUTH: 'aliansi_store_admin_auth',
  AUDIO_MUTED: 'aliansi_store_audio_muted',
  THEME: 'aliansi_theme',
  USERS_DB: 'aliansi_store_users_v3'
};

// Global State
const state = {
  products: [],
  orders: [],
  config: {},
  cart: [],
  users: [],
  currentUser: null,
  isAdmin: false,
  isAudioMuted: false,
  currentTheme: 'dark',
  activeFilter: 'all',
  searchQuery: '',
  sortOption: 'popular',
  selectedProduct: null,
  spotlightIndex: 0,
  spotlightTimer: null,
  cardVariants: {}, // Tracks { [productId]: 'primary' | 'secondary' }
  appliedVoucher: null,
  selectedPayment: 'qris',
  checkoutType: 'guest',
  adminFilter: 'all',
  currentInvoice: null,
  orderToFulfill: null
};

// ================= SUPABASE CLOUD DATABASE ADAPTER =================
const SUPABASE_CONFIG = {
  url: "https://fgotjbcabnragtpijuvk.supabase.co",
  anonKey: "sb_publishable_wXLOEof96Y8l22xcABvPZQ_unQgSmws"
};

let supabaseClient = null;
function initSupabaseClient() {
  try {
    if (typeof window !== 'undefined' && window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('⚡ Supabase Cloud Database Initialized Successfully!');
    }
  } catch (err) {
    console.warn('Supabase initialization warning:', err);
  }
}

// ================= WEB AUDIO API SYNTHESIZER =================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSfx(type = 'click') {
  if (state.isAudioMuted) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hover') {
      // Soft high-tech tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'click') {
      // Crisp mechanical cyber click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'switch') {
      // Futuristic swoosh
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'success') {
      // Triumphant cyber chime
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.07);
        g.gain.setValueAtTime(0.05, now + idx * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
        o.start(now + idx * 0.07);
        o.stop(now + idx * 0.07 + 0.25);
      });
    }
  } catch (err) {
    // Ignore audio permission errors
  }
}

function toggleAudio() {
  state.isAudioMuted = !state.isAudioMuted;
  localStorage.setItem(APP_STORAGE_KEYS.AUDIO_MUTED, state.isAudioMuted ? 'true' : 'false');
  updateAudioIndicator();
  if (!state.isAudioMuted) {
    playSfx('success');
    showToast('Efek Suara Audio Aktif!', 'info');
  } else {
    showToast('Efek Suara Dinonaktifkan', 'info');
  }
}

function updateAudioIndicator() {
  const btn = document.getElementById('audio-toggle-btn');
  if (!btn) return;
  if (state.isAudioMuted) {
    btn.classList.add('sound-muted', 'text-slate-500');
    btn.classList.remove('text-sky-400');
    btn.title = 'Nyalakan Audio SFX';
  } else {
    btn.classList.remove('sound-muted', 'text-slate-500');
    btn.classList.add('text-sky-400');
    btn.title = 'Matikan Audio SFX';
  }
}

// ================= THEME ENGINE (DARK / LIGHT MODE) =================
function initTheme() {
  const saved = localStorage.getItem(APP_STORAGE_KEYS.THEME) || 'dark';
  applyTheme(saved, false);
}

function applyTheme(theme, showNotification = true) {
  state.currentTheme = theme;
  const html = document.documentElement;
  const themeIcons = document.querySelectorAll('.theme-icon');
  const themeTexts = document.querySelectorAll('.theme-text');

  if (theme === 'light') {
    html.classList.remove('dark');
    themeIcons.forEach(icon => {
      icon.setAttribute('data-lucide', 'moon');
    });
    themeTexts.forEach(t => t.textContent = 'Night Mode');
  } else {
    html.classList.add('dark');
    themeIcons.forEach(icon => {
      icon.setAttribute('data-lucide', 'sun');
    });
    themeTexts.forEach(t => t.textContent = 'Light Mode');
  }

  localStorage.setItem(APP_STORAGE_KEYS.THEME, theme);
  lucide.createIcons();

  if (showNotification) {
    playSfx('switch');
    showToast(theme === 'light' ? 'Mode Terang (Glacier White) Aktif' : 'Mode Gelap (OLED Cyber) Aktif', 'info');
  }
}

function toggleTheme() {
  const nextTheme = state.currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(nextTheme, true);
}

// ================= INITIALIZATION =================
function initApp() {
  initSupabaseClient();
  initTheme();
  loadStoredData();
  setupEventListeners();
  initSpotlightHero();
  renderProducts();
  updateCartBadge();
  initSocialProofStream();
  updateNavAuthUI();
  lucide.createIcons();
  syncFromSupabase();
}

function loadStoredData() {
  // Audio state
  state.isAudioMuted = localStorage.getItem(APP_STORAGE_KEYS.AUDIO_MUTED) === 'true';
  updateAudioIndicator();

  // Products
  const storedProducts = localStorage.getItem(APP_STORAGE_KEYS.PRODUCTS);
  if (storedProducts) {
    try {
      state.products = JSON.parse(storedProducts);
    } catch (e) {
      state.products = [...INITIAL_PRODUCTS];
    }
  } else {
    state.products = [...INITIAL_PRODUCTS];
    saveProducts();
  }

  // Orders
  const storedOrders = localStorage.getItem(APP_STORAGE_KEYS.ORDERS);
  if (storedOrders) {
    try {
      state.orders = JSON.parse(storedOrders);
    } catch (e) {
      state.orders = [...INITIAL_ORDERS];
    }
  } else {
    state.orders = [...INITIAL_ORDERS];
    saveOrders();
  }

  // Config
  const storedConfig = localStorage.getItem(APP_STORAGE_KEYS.CONFIG);
  if (storedConfig) {
    try {
      state.config = { ...INITIAL_CONFIG, ...JSON.parse(storedConfig) };
    } catch (e) {
      state.config = { ...INITIAL_CONFIG };
    }
  } else {
    state.config = { ...INITIAL_CONFIG };
    saveConfig();
  }

  // Users Database (Admin & Customer Profiles)
  const storedUsers = localStorage.getItem(APP_STORAGE_KEYS.USERS_DB);
  if (storedUsers) {
    try {
      state.users = JSON.parse(storedUsers);
    } catch (e) {
      state.users = typeof INITIAL_USERS !== 'undefined' ? [...INITIAL_USERS] : [];
    }
  } else {
    state.users = typeof INITIAL_USERS !== 'undefined' ? [...INITIAL_USERS] : [];
    saveUsers();
  }

  // Cart
  const storedCart = localStorage.getItem(APP_STORAGE_KEYS.CART);
  if (storedCart) {
    try {
      state.cart = JSON.parse(storedCart);
    } catch (e) {
      state.cart = [];
    }
  }

  // User Session
  const storedUser = localStorage.getItem(APP_STORAGE_KEYS.USER);
  if (storedUser) {
    try {
      state.currentUser = JSON.parse(storedUser);
    } catch (e) {
      state.currentUser = null;
    }
  }

  // Admin Session
  state.isAdmin = localStorage.getItem(APP_STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

function saveUsers() {
  localStorage.setItem(APP_STORAGE_KEYS.USERS_DB, JSON.stringify(state.users));
}

function saveProducts() {
  localStorage.setItem(APP_STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products));
}
function saveOrders() {
  localStorage.setItem(APP_STORAGE_KEYS.ORDERS, JSON.stringify(state.orders));
}
function saveConfig() {
  localStorage.setItem(APP_STORAGE_KEYS.CONFIG, JSON.stringify(state.config));
}
function saveCart() {
  localStorage.setItem(APP_STORAGE_KEYS.CART, JSON.stringify(state.cart));
  updateCartBadge();
}

// ================= SUPABASE CLOUD SYNC OPERATIONS =================
async function syncFromSupabase() {
  if (!supabaseClient) return;
  try {
    // 1. Fetch Products from Cloud
    const { data: prods, error: pErr } = await supabaseClient.from('products').select('*');
    if (!pErr && prods && prods.length > 0) {
      state.products = prods.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        platform: Array.isArray(p.platform) ? p.platform : (typeof p.platform === 'string' ? JSON.parse(p.platform) : []),
        category: p.category,
        type: p.type || 'digital',
        badge: p.badge,
        isSubIndo: !!p.is_sub_indo,
        isHen: !!p.is_hen,
        isSpotlight: !!p.is_spotlight,
        rating: Number(p.rating) || 5.0,
        soldCount: Number(p.sold_count) || 0,
        releaseYear: p.release_year,
        size: p.size,
        publisher: p.publisher,
        tagline: p.tagline,
        images: typeof p.images === 'object' && p.images !== null ? p.images : {},
        prices: typeof p.prices === 'object' && p.prices !== null ? p.prices : {},
        description: p.description,
        features: Array.isArray(p.features) ? p.features : [],
        inStock: p.in_stock !== false
      }));
      localStorage.setItem(APP_STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products));
      renderProducts();
      initSpotlightHero();
    }

    // 2. Fetch Orders from Cloud
    const { data: ords, error: oErr } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
    if (!oErr && ords && ords.length > 0) {
      state.orders = ords.map(o => ({
        id: o.id,
        createdAt: o.created_at,
        customerType: o.customer_type,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerEmail: o.customer_email,
        notes: o.notes,
        items: Array.isArray(o.items) ? o.items : [],
        subtotal: Number(o.subtotal) || 0,
        discount: Number(o.discount) || 0,
        total: Number(o.total) || 0,
        voucherCode: o.voucher_code,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        status: o.status,
        fulfillment: o.fulfillment
      }));
      localStorage.setItem(APP_STORAGE_KEYS.ORDERS, JSON.stringify(state.orders));
      renderAdminStats();
      renderAdminOrdersTable();
    }

    // 3. Fetch Store Config from Cloud
    const { data: cfg, error: cErr } = await supabaseClient.from('store_config').select('*').eq('id', 'main').single();
    if (!cErr && cfg) {
      state.config = {
        storeName: cfg.store_name || state.config.storeName,
        tagline: cfg.tagline || state.config.tagline,
        whatsappNumber: cfg.whatsapp_number || state.config.whatsappNumber,
        whatsappFormatted: cfg.whatsapp_formatted || state.config.whatsappFormatted,
        adminPin: cfg.admin_pin || state.config.adminPin || '1234',
        bankAccounts: cfg.bank_accounts || state.config.bankAccounts,
        vouchers: cfg.vouchers || state.config.vouchers
      };
      localStorage.setItem(APP_STORAGE_KEYS.CONFIG, JSON.stringify(state.config));
    }
  } catch (err) {
    console.warn('Supabase cloud sync notice:', err);
  }
}

async function syncOrderToSupabase(order) {
  if (!supabaseClient || !order) return;
  try {
    await supabaseClient.from('orders').upsert({
      id: order.id,
      created_at: order.createdAt || new Date().toISOString(),
      customer_type: order.customerType,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_email: order.customerEmail,
      notes: order.notes,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      voucher_code: order.voucherCode,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      status: order.status,
      fulfillment: order.fulfillment
    });
  } catch (err) {
    console.warn('Failed to sync order to Supabase:', err);
  }
}

async function syncProductToSupabase(p) {
  if (!supabaseClient || !p) return;
  try {
    await supabaseClient.from('products').upsert({
      id: p.id,
      title: p.title,
      slug: p.slug,
      platform: p.platform,
      category: p.category,
      type: p.type || 'digital',
      badge: p.badge,
      is_sub_indo: !!p.isSubIndo,
      is_hen: !!p.isHen,
      is_spotlight: !!p.isSpotlight,
      rating: p.rating,
      sold_count: p.soldCount,
      release_year: p.releaseYear,
      size: p.size,
      publisher: p.publisher,
      tagline: p.tagline,
      images: p.images,
      prices: p.prices,
      description: p.description,
      features: p.features,
      in_stock: p.inStock !== false
    });
  } catch (err) {
    console.warn('Failed to sync product to Supabase:', err);
  }
}

async function deleteProductFromSupabase(productId) {
  if (!supabaseClient || !productId) return;
  try {
    await supabaseClient.from('products').delete().eq('id', productId);
  } catch (err) {
    console.warn('Failed to delete product from Supabase:', err);
  }
}

// Helpers
function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function generateInvoiceId() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const r = Math.floor(1000 + Math.random() * 9000);
  return `ALN-${d}-${r}`;
}

// Toast System
function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClasses = {
    success: 'bg-emerald-950/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50',
    error: 'bg-rose-950/95 border-rose-500/50 text-rose-100 shadow-rose-950/50',
    info: 'bg-sky-950/95 border-sky-500/50 text-sky-100 shadow-sky-950/50',
    warning: 'bg-amber-950/95 border-amber-500/50 text-amber-100 shadow-amber-950/50'
  };

  const iconName = {
    success: 'check-circle-2',
    error: 'alert-triangle',
    info: 'sparkles',
    warning: 'alert-circle'
  }[type] || 'info';

  toast.className = `flex items-center gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-3 opacity-0 ${bgClasses[type]}`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 shrink-0 text-sky-400"></i>
    <div class="text-xs">
      ${title ? `<strong class="block font-bold text-white mb-0.5 text-sm">${title}</strong>` : ''}
      <span class="leading-relaxed">${message}</span>
    </div>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function copyText(text, successMsg = 'Tersalin ke clipboard!') {
  playSfx('click');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const t = document.createElement('textarea');
  t.value = text;
  t.style.position = 'fixed';
  t.style.left = '-999999px';
  document.body.appendChild(t);
  t.focus();
  t.select();
  try {
    document.execCommand('copy');
    showToast(successMsg, 'success');
  } catch (err) {
    showToast('Gagal menyalin text', 'error');
  }
  t.remove();
}

// ================= SPOTLIGHT HERO (PS5 CONSOLE UI STYLE) =================
function getSpotlightGames() {
  return state.products.filter(p => p.isSpotlight || p.badge).slice(0, 4);
}

function initSpotlightHero() {
  const spotlightGames = getSpotlightGames();
  if (spotlightGames.length === 0) return;

  renderSpotlightThumbnails(spotlightGames);
  updateSpotlightDisplay(0);

  // Auto-rotate every 8 seconds
  if (state.spotlightTimer) clearInterval(state.spotlightTimer);
  state.spotlightTimer = setInterval(() => {
    const nextIdx = (state.spotlightIndex + 1) % spotlightGames.length;
    updateSpotlightDisplay(nextIdx);
  }, 8000);
}

function renderSpotlightThumbnails(games) {
  const container = document.getElementById('hero-spotlight-thumbs');
  if (!container) return;

  container.innerHTML = games.map((game, idx) => `
    <button 
      onclick="setSpotlightIndex(${idx})"
      onmouseenter="playSfx('hover')"
      class="spotlight-thumb relative w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-300 ${idx === 0 ? 'border-sky-400 scale-105 shadow-lg shadow-sky-500/40 ring-2 ring-sky-400/30' : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'}"
      data-index="${idx}"
      title="${game.title}"
    >
      <img src="${game.images.poster || game.images.cover}" alt="${game.title}" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      <span class="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate text-center">${game.title.split(':')[0]}</span>
    </button>
  `).join('');
}

function setSpotlightIndex(index) {
  playSfx('switch');
  updateSpotlightDisplay(index);
}

function updateSpotlightDisplay(index) {
  const spotlightGames = getSpotlightGames();
  if (!spotlightGames[index]) return;

  state.spotlightIndex = index;
  const game = spotlightGames[index];

  // Update Backdrop Image
  const backdrop = document.getElementById('hero-spotlight-backdrop');
  if (backdrop) {
    backdrop.style.opacity = '0';
    setTimeout(() => {
      backdrop.style.backgroundImage = `url('${game.images.backdrop || game.images.banner || game.images.poster}')`;
      backdrop.style.opacity = '1';
    }, 200);
  }

  // Update Hero Content
  document.getElementById('hero-game-badge').textContent = game.badge || 'HOT SPOTLIGHT';
  document.getElementById('hero-game-title').textContent = game.title;
  document.getElementById('hero-game-tagline').textContent = game.tagline || game.description;
  document.getElementById('hero-game-rating').textContent = `${game.rating || '4.9'} / 5.0 (${game.soldCount || 100}+ Terjual)`;
  
  // Platform pills
  const platEl = document.getElementById('hero-game-platforms');
  if (platEl) {
    platEl.innerHTML = game.platform.map(pl => `
      <span class="px-2.5 py-1 rounded-lg text-xs font-extrabold ${pl.includes('PS5') ? 'bg-white text-slate-950' : 'bg-blue-600 text-white'}">
        ${pl}
      </span>
    `).join(' ');
  }

  // Prices
  document.getElementById('hero-price-primary').textContent = formatRupiah(game.prices.primary);
  document.getElementById('hero-price-secondary').textContent = formatRupiah(game.prices.secondary);
  if (game.prices.original) {
    document.getElementById('hero-price-original').textContent = formatRupiah(game.prices.original);
  }

  // Action Buttons
  const buyBtn = document.getElementById('hero-btn-buy');
  if (buyBtn) {
    buyBtn.onclick = () => {
      playSfx('click');
      quickBuy(game.id);
    };
  }

  const detailBtn = document.getElementById('hero-btn-detail');
  if (detailBtn) {
    detailBtn.onclick = () => {
      playSfx('click');
      openProductDetail(game.id);
    };
  }

  // Update thumbnail active states
  const thumbs = document.querySelectorAll('.spotlight-thumb');
  thumbs.forEach((thumb, idx) => {
    if (idx === index) {
      thumb.className = 'spotlight-thumb relative w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 border-sky-400 scale-105 shadow-lg shadow-sky-500/40 ring-2 ring-sky-400/30 transition-all duration-300';
    } else {
      thumb.className = 'spotlight-thumb relative w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600 transition-all duration-300';
    }
  });

  lucide.createIcons();
}

// ================= SOCIAL PROOF PURCHASE STREAM =================
function initSocialProofStream() {
  const tickerContainer = document.getElementById('live-social-ticker');
  if (tickerContainer && typeof RECENT_PURCHASES !== 'undefined') {
    const list = [...RECENT_PURCHASES, ...RECENT_PURCHASES]; // Repeat for seamless loop
    tickerContainer.innerHTML = list.map(item => `
      <div class="ticker-item inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 mr-4 shrink-0">
        <span class="w-2 h-2 rounded-full bg-emerald-400 pulse-neon"></span>
        <strong class="text-white">${item.name}</strong> (${item.city}) membeli <span class="text-sky-300 font-semibold">${item.game}</span>
        <span class="text-[10px] text-slate-500 font-mono">${item.time}</span>
      </div>
    `).join('');
  }
}

// ================= CATALOG FILTER & CARD RENDERING =================
function getFilteredProducts() {
  let list = [...state.products];

  // Category & Platform Filter
  if (state.activeFilter === 'subindo') {
    list = list.filter(p => p.isSubIndo || (p.badge && p.badge.toLowerCase().includes('sub indo')) || p.title.toLowerCase().includes('sub indo') || p.category === 'subindo');
  } else if (state.activeFilter === 'hen') {
    list = list.filter(p => p.isHen || (p.platform && p.platform.some(pl => pl.includes('HEN'))) || p.category === 'hen' || p.category === 'service-hen' || p.category === 'tool');
  } else if (state.activeFilter === 'service-hen') {
    list = list.filter(p => p.category === 'service-hen');
  } else if (state.activeFilter === 'tool') {
    list = list.filter(p => p.category === 'tool');
  } else if (state.activeFilter === 'digital') {
    list = list.filter(p => p.category !== 'service-hen' && p.category !== 'tool' && (p.platform.includes('PS5') || p.platform.includes('PS4')));
  } else if (state.activeFilter === 'ps5') {
    list = list.filter(p => p.platform.includes('PS5') && p.category !== 'service-hen' && p.category !== 'tool');
  } else if (state.activeFilter === 'ps4') {
    list = list.filter(p => p.platform.includes('PS4') && p.category !== 'service-hen' && p.category !== 'tool');
  }

  // Search Query
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.platform.some(pl => pl.toLowerCase().includes(q)) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (state.sortOption === 'popular') {
    list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  } else if (state.sortOption === 'price-low') {
    list.sort((a, b) => (a.prices.secondary || a.prices.primary) - (b.prices.secondary || b.prices.primary));
  } else if (state.sortOption === 'price-high') {
    list.sort((a, b) => (b.prices.primary || 0) - (a.prices.primary || 0));
  } else if (state.sortOption === 'newest') {
    list.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
  }

  return list;
}

// Toggle In-Card Variant (Primary vs Secondary)
function toggleCardVariant(productId, variant) {
  playSfx('hover');
  state.cardVariants[productId] = variant;
  
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const priceEl = document.getElementById(`card-price-${productId}`);
  const btnP = document.getElementById(`btn-var-primary-${productId}`);
  const btnS = document.getElementById(`btn-var-secondary-${productId}`);

  const activePrice = variant === 'secondary' ? product.prices.secondary : product.prices.primary;
  if (priceEl) priceEl.textContent = formatRupiah(activePrice);

  if (variant === 'primary') {
    btnP?.classList.add('active');
    btnS?.classList.remove('active');
  } else {
    btnS?.classList.add('active');
    btnP?.classList.remove('active');
  }
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  const emptyState = document.getElementById('products-empty');
  const countBadge = document.getElementById('products-count');
  
  if (!container) return;

  const items = getFilteredProducts();

  if (countBadge) {
    countBadge.textContent = `${items.length} Game Tersedia`;
  }

  if (items.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = items.map(product => {
    const isSpecial = product.category === 'service-hen' || product.category === 'tool' || (product.prices.primary === product.prices.secondary);
    const currentVariant = state.cardVariants[product.id] || 'primary';
    const activePrice = currentVariant === 'secondary' ? product.prices.secondary : product.prices.primary;

    // Platform tags
    const platformsHtml = product.platform.map(pl => {
      let badgeClass = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      if (pl.includes('PS5')) badgeClass = 'bg-slate-900 text-white font-bold border border-slate-700';
      if (pl.includes('PS4') && !pl.includes('HEN')) badgeClass = 'bg-blue-600 text-white font-bold';
      if (pl.includes('HEN')) badgeClass = 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30';
      return `<span class="px-2 py-0.5 text-[10px] rounded-md ${badgeClass}">${pl}</span>`;
    }).join(' ');

    const subIndoTag = product.isSubIndo ? `
      <span class="px-2 py-0.5 text-[10px] rounded-md font-black bg-rose-600 text-white shadow-md shadow-rose-600/30 flex items-center gap-1 shrink-0">
        🇮🇩 Sub Indo
      </span>
    ` : '';

    return `
      <div 
        class="game-card-nextgen group relative bg-[#080f22] hover:bg-[#0c1630] rounded-2xl border border-slate-800/80 hover:border-sky-500/60 p-3.5 transition-all duration-300 flex flex-col justify-between glow-card"
        onmouseenter="playSfx('hover')"
      >
        <div>
          <!-- Poster Container with Next-Gen Aspect Ratio -->
          <div class="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-3.5 bg-slate-950 cursor-pointer shadow-lg" onclick="openProductDetail('${product.id}')">
            <img 
              src="${product.images.poster || product.images.cover}" 
              alt="${product.title}"
              class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              loading="lazy"
              onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'"
            />
            
            <!-- Badge Top Left -->
            ${product.badge ? `
              <div class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-sky-600 to-blue-700 text-white backdrop-blur-md shadow-lg border border-sky-400/40">
                ${product.badge}
              </div>
            ` : ''}

            <!-- In Stock Neon Tag -->
            <div class="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/80 text-emerald-400 backdrop-blur-md border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-neon"></span>
              Stok Ready
            </div>

            <!-- Discount Percent if Original exists -->
            ${product.prices.original ? `
              <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white shadow-md">
                -${Math.round((1 - product.prices.primary / product.prices.original) * 100)}%
              </div>
            ` : ''}

            <!-- Quick View Overlay Button -->
            <button class="absolute inset-0 bg-sky-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 text-white font-bold text-xs gap-2 backdrop-blur-[2px]">
              <i data-lucide="eye" class="w-4 h-4"></i> Preview Game
            </button>
          </div>

          <!-- Platforms & Star Rating -->
          <div class="flex items-center justify-between gap-1 mb-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              ${subIndoTag}
              ${platformsHtml}
            </div>
            <div class="flex items-center gap-1 text-amber-400 text-xs font-bold shrink-0">
              <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
              <span>${product.rating || '4.9'}</span>
              <span class="text-slate-500 font-normal text-[10px]">(${product.soldCount || 100}+)</span>
            </div>
          </div>

          <!-- Title -->
          <h3 
            class="font-bold text-slate-100 text-sm sm:text-base leading-snug line-clamp-2 hover:text-sky-400 transition-colors cursor-pointer mb-2.5"
            onclick="openProductDetail('${product.id}')"
          >
            ${product.title}
          </h3>

          <!-- Interactive Primary vs Secondary Switcher Pill Right on the Card! -->
          ${!isSpecial ? `
            <div class="price-toggle-pill mb-3">
              <button 
                id="btn-var-primary-${product.id}"
                onclick="event.stopPropagation(); toggleCardVariant('${product.id}', 'primary')" 
                class="price-toggle-btn ${currentVariant === 'primary' ? 'active' : ''}"
              >
                PRIMARY
              </button>
              <button 
                id="btn-var-secondary-${product.id}"
                onclick="event.stopPropagation(); toggleCardVariant('${product.id}', 'secondary')" 
                class="price-toggle-btn ${currentVariant === 'secondary' ? 'active' : ''}"
              >
                SECONDARY
              </button>
            </div>
          ` : `
            <div class="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-800/40 text-[10px] text-purple-300 font-semibold mb-3 flex items-center gap-1">
              <i data-lucide="sparkles" class="w-3 h-3 text-purple-400"></i>
              <span>${product.category === 'hen' ? 'Full Game Request + Sub Indo' : 'Lisensi Resmi PlayStation'}</span>
            </div>
          `}
        </div>

        <!-- Price & Action Button -->
        <div class="pt-3 border-t border-slate-800/80 mt-1">
          <div class="flex items-baseline justify-between mb-3">
            <div>
              <span class="text-[10px] text-slate-400 block font-mono">Harga Akun</span>
              <span id="card-price-${product.id}" class="text-lg font-extrabold text-sky-400 font-display">
                ${formatRupiah(activePrice)}
              </span>
            </div>
            ${product.prices.original ? `
              <span class="text-xs text-slate-500 line-through font-mono">
                ${formatRupiah(product.prices.original)}
              </span>
            ` : ''}
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button 
              onclick="openProductDetail('${product.id}')"
              class="btn-card-detail w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
            >
              <i data-lucide="info" class="w-3.5 h-3.5 text-sky-400"></i> Detail
            </button>
            <button 
              onclick="buyCardVariant('${product.id}')"
              class="w-full py-2 px-2.5 rounded-xl text-xs font-extrabold cyber-button shadow-md flex items-center justify-center gap-1.5"
            >
              <i data-lucide="zap" class="w-3.5 h-3.5"></i> Beli
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function buyCardVariant(productId) {
  playSfx('click');
  const variant = state.cardVariants[productId] || 'primary';
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  addToCart(product.id, variant, product.platform[0], 1, false);
  openCheckout();
}

// ================= PRODUCT DETAIL MODAL =================
function openProductDetail(productId) {
  playSfx('click');
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.selectedProduct = product;
  const modal = document.getElementById('modal-product-detail');
  if (!modal) return;

  const isSpecial = product.category === 'hen' || product.category === 'psplus' || product.category === 'voucher';

  document.getElementById('modal-product-title').textContent = product.title;
  document.getElementById('modal-product-publisher').textContent = product.publisher || 'PlayStation Store';
  document.getElementById('modal-product-year').textContent = product.releaseYear || '2024';
  document.getElementById('modal-product-size').textContent = product.size || 'Digital Download';
  document.getElementById('modal-product-rating').textContent = `${product.rating || '4.9'} (${product.soldCount || 100}+ terjual)`;
  document.getElementById('modal-product-desc').textContent = product.description;
  document.getElementById('modal-product-img').src = product.images.poster || product.images.cover;

  // Screenshots Gallery
  const screenGallery = document.getElementById('modal-screenshots-gallery');
  if (screenGallery && product.images.screenshots) {
    screenGallery.innerHTML = product.images.screenshots.map(s => `
      <img src="${s}" class="w-full h-24 object-cover rounded-xl border border-slate-800 hover:border-sky-500 cursor-pointer transition-all" alt="Screenshot" onclick="document.getElementById('modal-product-img').src='${s}'" />
    `).join('');
  }

  // Features list
  const featuresList = document.getElementById('modal-product-features');
  if (featuresList && product.features) {
    featuresList.innerHTML = product.features.map(f => `
      <li class="flex items-start gap-2 text-xs text-slate-300">
        <i data-lucide="check-circle-2" class="w-4 h-4 text-sky-400 shrink-0 mt-0.5"></i>
        <span>${f}</span>
      </li>
    `).join('');
  }

  // Variant selector
  const variantContainer = document.getElementById('modal-variant-container');
  if (variantContainer) {
    if (isSpecial) {
      variantContainer.innerHTML = `
        <div class="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between">
          <div>
            <div class="text-sm font-bold text-white">Paket Layanan Resmi</div>
            <div class="text-xs text-slate-400">Garansi penuh & panduan aktivasi instan</div>
          </div>
          <div class="text-base font-extrabold text-sky-400 font-display">
            ${formatRupiah(product.prices.primary)}
          </div>
        </div>
        <input type="hidden" id="selected-variant" value="primary" />
      `;
    } else {
      variantContainer.innerHTML = `
        <div class="grid grid-cols-2 gap-3 mb-2">
          <!-- Primary Variant Option -->
          <label class="cursor-pointer relative p-3.5 rounded-xl border-2 border-sky-500 bg-sky-950/40 flex flex-col justify-between transition-all variant-card" onclick="selectVariant(this, 'primary')">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-extrabold text-sky-300 uppercase tracking-wide">AKUN PRIMARY</span>
                <span class="px-1.5 py-0.5 text-[9px] font-black rounded bg-sky-500 text-white">REKOMENDASI</span>
              </div>
              <p class="text-[11px] text-slate-300 leading-tight">Main di User Pribadi Anda. Progress & Trophy masuk ID sendiri. Bisa Online & Offline.</p>
            </div>
            <div class="mt-3 text-base font-extrabold text-white font-display">
              ${formatRupiah(product.prices.primary)}
            </div>
            <input type="radio" name="product-variant" value="primary" checked class="hidden" />
          </label>

          <!-- Secondary Variant Option -->
          <label class="cursor-pointer relative p-3.5 rounded-xl border-2 border-slate-700 bg-slate-900/60 hover:border-slate-500 flex flex-col justify-between transition-all variant-card" onclick="selectVariant(this, 'secondary')">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wide">AKUN SECONDARY</span>
                <span class="px-1.5 py-0.5 text-[9px] font-black rounded bg-slate-700 text-slate-300">HEMAT 50%</span>
              </div>
              <p class="text-[11px] text-slate-400 leading-tight">Main langsung di Akun Toko yang diberikan. Wajib internet aktif saat bermain.</p>
            </div>
            <div class="mt-3 text-base font-extrabold text-white font-display">
              ${formatRupiah(product.prices.secondary)}
            </div>
            <input type="radio" name="product-variant" value="secondary" class="hidden" />
          </label>
        </div>
        <input type="hidden" id="selected-variant" value="primary" />
      `;
    }
  }

  // Platform radio
  const platformContainer = document.getElementById('modal-platform-container');
  if (platformContainer) {
    platformContainer.innerHTML = product.platform.map((pl, idx) => `
      <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg border ${idx === 0 ? 'border-sky-500 bg-sky-950/40 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'} text-xs font-bold cursor-pointer platform-pill" onclick="selectPlatformPill(this)">
        <input type="radio" name="selected-platform" value="${pl}" ${idx === 0 ? 'checked' : ''} class="hidden" />
        <span>${pl}</span>
      </label>
    `).join('');
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function selectVariant(element, variantName) {
  playSfx('hover');
  const cards = document.querySelectorAll('.variant-card');
  cards.forEach(card => {
    card.classList.remove('border-sky-500', 'bg-sky-950/40');
    card.classList.add('border-slate-700', 'bg-slate-900/60');
  });
  element.classList.remove('border-slate-700', 'bg-slate-900/60');
  element.classList.add('border-sky-500', 'bg-sky-950/40');

  const input = document.getElementById('selected-variant');
  if (input) input.value = variantName;
}

function selectPlatformPill(element) {
  playSfx('hover');
  const pills = document.querySelectorAll('.platform-pill');
  pills.forEach(p => {
    p.classList.remove('border-sky-500', 'bg-sky-950/40', 'text-white');
    p.classList.add('border-slate-800', 'bg-slate-900', 'text-slate-400');
    const radio = p.querySelector('input');
    if (radio) radio.checked = false;
  });
  element.classList.remove('border-slate-800', 'bg-slate-900', 'text-slate-400');
  element.classList.add('border-sky-500', 'bg-sky-950/40', 'text-white');
  const radio = element.querySelector('input');
  if (radio) radio.checked = true;
}

function closeModals() {
  playSfx('click');
  const modals = document.querySelectorAll('.app-modal');
  modals.forEach(m => m.classList.add('hidden'));
}

// Quick Buy
function quickBuy(productId) {
  playSfx('click');
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  addToCart(product.id, 'primary', product.platform[0], 1, false);
  openCheckout();
}

// Add To Cart
function addToCart(productId, variant = 'primary', platform = null, qty = 1, showNotification = true) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const targetPlatform = platform || product.platform[0];
  const unitPrice = variant === 'secondary' ? product.prices.secondary : product.prices.primary;

  const existingIndex = state.cart.findIndex(item => 
    item.productId === productId && item.variant === variant && item.platform === targetPlatform
  );

  if (existingIndex > -1) {
    state.cart[existingIndex].qty += qty;
  } else {
    state.cart.push({
      productId: product.id,
      title: product.title,
      poster: product.images.poster || product.images.cover,
      variant: variant,
      platform: targetPlatform,
      unitPrice: unitPrice,
      qty: qty
    });
  }

  saveCart();

  if (showNotification) {
    playSfx('success');
    showToast(`${product.title} (${variant.toUpperCase()}) masuk keranjang!`, 'success');
  }
}

function addCurrentModalToCart() {
  if (!state.selectedProduct) return;
  const variantInput = document.getElementById('selected-variant');
  const variant = variantInput ? variantInput.value : 'primary';

  const platformRadio = document.querySelector('input[name="selected-platform"]:checked');
  const platform = platformRadio ? platformRadio.value : state.selectedProduct.platform[0];

  addToCart(state.selectedProduct.id, variant, platform, 1, true);
  closeModals();
}

function buyCurrentModalNow() {
  if (!state.selectedProduct) return;
  const variantInput = document.getElementById('selected-variant');
  const variant = variantInput ? variantInput.value : 'primary';

  const platformRadio = document.querySelector('input[name="selected-platform"]:checked');
  const platform = platformRadio ? platformRadio.value : state.selectedProduct.platform[0];

  addToCart(state.selectedProduct.id, variant, platform, 1, false);
  closeModals();
  openCheckout();
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  badges.forEach(badge => {
    badge.textContent = totalCount;
    if (totalCount > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

// ================= CART DRAWER =================
function openCartDrawer() {
  playSfx('click');
  renderCartDrawer();
  const drawer = document.getElementById('drawer-cart');
  if (drawer) drawer.classList.remove('hidden');
  lucide.createIcons();
}

function closeCartDrawer() {
  playSfx('click');
  const drawer = document.getElementById('drawer-cart');
  if (drawer) drawer.classList.add('hidden');
}

function renderCartDrawer() {
  const itemsContainer = document.getElementById('cart-items-list');
  const emptyContainer = document.getElementById('cart-empty-state');
  const subtotalText = document.getElementById('cart-subtotal');
  const footerAction = document.getElementById('cart-footer-actions');

  if (!itemsContainer) return;

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = '';
    if (emptyContainer) emptyContainer.classList.remove('hidden');
    if (footerAction) footerAction.classList.add('hidden');
    if (subtotalText) subtotalText.textContent = 'Rp 0';
    return;
  }

  if (emptyContainer) emptyContainer.classList.add('hidden');
  if (footerAction) footerAction.classList.remove('hidden');

  let subtotal = 0;

  itemsContainer.innerHTML = state.cart.map((item, idx) => {
    const itemTotal = item.unitPrice * item.qty;
    subtotal += itemTotal;

    return `
      <div class="cart-item-card flex items-center gap-3 p-3 rounded-2xl bg-[#080e22] border border-slate-800 transition-all">
        <img 
          src="${item.poster}" 
          alt="${item.title}" 
          class="w-14 h-18 object-cover rounded-xl shrink-0 bg-slate-900 border border-slate-800"
          onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80'"
        />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-white truncate">${item.title}</h4>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="cart-item-variant text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-extrabold border border-sky-800/50 uppercase">${item.variant}</span>
            <span class="cart-item-platform text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">${item.platform}</span>
          </div>
          <div class="cart-item-price text-xs font-bold text-sky-400 mt-1 font-display">
            ${formatRupiah(item.unitPrice)}
          </div>
        </div>

        <div class="flex flex-col items-end gap-2">
          <button onclick="removeFromCart(${idx})" class="cart-remove-btn text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer" title="Hapus">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
          <div class="cart-qty-stepper flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
            <button onclick="changeCartQty(${idx}, -1)" class="cart-qty-btn w-6 h-6 flex items-center justify-center text-slate-300 hover:bg-slate-800 text-xs cursor-pointer">-</button>
            <span class="cart-qty-val w-6 text-center text-xs font-bold text-white">${item.qty}</span>
            <button onclick="changeCartQty(${idx}, 1)" class="cart-qty-btn w-6 h-6 flex items-center justify-center text-slate-300 hover:bg-slate-800 text-xs cursor-pointer">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalText) subtotalText.textContent = formatRupiah(subtotal);
  lucide.createIcons();
}

function changeCartQty(index, change) {
  playSfx('hover');
  if (!state.cart[index]) return;
  state.cart[index].qty += change;
  if (state.cart[index].qty <= 0) {
    state.cart.splice(index, 1);
  }
  saveCart();
  renderCartDrawer();
}

function removeFromCart(index) {
  playSfx('click');
  state.cart.splice(index, 1);
  saveCart();
  renderCartDrawer();
  showToast('Item dihapus dari keranjang', 'info');
}

// ================= CHECKOUT MODAL =================
function openCheckout() {
  playSfx('click');
  if (state.cart.length === 0) {
    showToast('Keranjang belanja kosong!', 'warning');
    return;
  }
  closeCartDrawer();
  closeModals();

  renderCheckoutSummary();
  const modal = document.getElementById('modal-checkout');
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function renderCheckoutSummary() {
  const summaryContainer = document.getElementById('checkout-items-summary');
  const subtotalElem = document.getElementById('checkout-subtotal');
  const discountElem = document.getElementById('checkout-discount');
  const totalElem = document.getElementById('checkout-total');

  let subtotal = 0;
  state.cart.forEach(item => {
    subtotal += item.unitPrice * item.qty;
  });

  let discount = 0;
  if (state.appliedVoucher) {
    discount = Math.round(subtotal * (state.appliedVoucher.discountPercent / 100));
    if (state.appliedVoucher.maxDiscount && discount > state.appliedVoucher.maxDiscount) {
      discount = state.appliedVoucher.maxDiscount;
    }
  }

  const finalTotal = Math.max(0, subtotal - discount);

  if (summaryContainer) {
    summaryContainer.innerHTML = state.cart.map(item => `
      <div class="flex items-center justify-between py-2 border-b border-slate-800/80 text-xs">
        <div class="flex-1 pr-2 truncate">
          <div class="text-white font-bold truncate">${item.title}</div>
          <div class="text-[10px] text-sky-400 uppercase font-mono">${item.variant} • ${item.platform} • x${item.qty}</div>
        </div>
        <div class="font-extrabold text-white shrink-0 font-display">
          ${formatRupiah(item.unitPrice * item.qty)}
        </div>
      </div>
    `).join('');
  }

  if (subtotalElem) subtotalElem.textContent = formatRupiah(subtotal);
  if (discountElem) discountElem.textContent = discount > 0 ? `-${formatRupiah(discount)}` : 'Rp 0';
  if (totalElem) totalElem.textContent = formatRupiah(finalTotal);

  if (state.currentUser) {
    setCheckoutType('member');
  }
}

function applyVoucherCode() {
  playSfx('click');
  const input = document.getElementById('voucher-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  const voucher = state.config.vouchers.find(v => v.code === code);
  if (!voucher) {
    showToast('Kode voucher tidak ditemukan!', 'error');
    return;
  }

  state.appliedVoucher = voucher;
  playSfx('success');
  renderCheckoutSummary();
  showToast(`Voucher ${voucher.code} dipasang! Diskon ${voucher.discountPercent}%`, 'success');
}

function setCheckoutType(type) {
  playSfx('hover');
  state.checkoutType = type;
  const guestTab = document.getElementById('tab-checkout-guest');
  const memberTab = document.getElementById('tab-checkout-member');
  const guestForm = document.getElementById('form-checkout-guest');
  const memberNotice = document.getElementById('notice-checkout-member');

  if (type === 'guest') {
    if (guestTab) guestTab.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white transition-all shadow';
    if (memberTab) memberTab.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-all';
    if (guestForm) guestForm.classList.remove('hidden');
    if (memberNotice) memberNotice.classList.add('hidden');
  } else {
    if (memberTab) memberTab.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white transition-all shadow';
    if (guestTab) guestTab.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-all';
    if (guestForm) guestForm.classList.remove('hidden');
    if (memberNotice) memberNotice.classList.remove('hidden');

    if (state.currentUser) {
      document.getElementById('checkout-name').value = state.currentUser.name;
      document.getElementById('checkout-phone').value = state.currentUser.phone;
      document.getElementById('checkout-email').value = state.currentUser.email || '';
    } else {
      openAuthModal('login');
      showToast('Silakan login sebagai Member untuk mengisi otomatis & akses riwayat.', 'info');
    }
  }
}

function selectPaymentMethod(element, method) {
  playSfx('hover');
  state.selectedPayment = method;
  const cards = document.querySelectorAll('.payment-card');
  cards.forEach(c => {
    c.classList.remove('border-sky-500', 'bg-sky-950/50', 'ring-1', 'ring-sky-500');
    c.classList.add('border-slate-800', 'bg-slate-900/50');
  });
  element.classList.remove('border-slate-800', 'bg-slate-900/50');
  element.classList.add('border-sky-500', 'bg-sky-950/50', 'ring-1', 'ring-sky-500');
}

// Submit Order
function submitOrder() {
  const nameInput = document.getElementById('checkout-name');
  const phoneInput = document.getElementById('checkout-phone');
  const emailInput = document.getElementById('checkout-email');
  const notesInput = document.getElementById('checkout-notes');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!name) {
    showToast('Mohon isi nama Anda!', 'warning');
    nameInput?.focus();
    return;
  }

  if (!phone || phone.length < 9) {
    showToast('Masukkan nomor WhatsApp aktif untuk pengiriman akun!', 'warning');
    phoneInput?.focus();
    return;
  }

  let subtotal = 0;
  state.cart.forEach(item => {
    subtotal += item.unitPrice * item.qty;
  });

  let discount = 0;
  if (state.appliedVoucher) {
    discount = Math.round(subtotal * (state.appliedVoucher.discountPercent / 100));
    if (state.appliedVoucher.maxDiscount && discount > state.appliedVoucher.maxDiscount) {
      discount = state.appliedVoucher.maxDiscount;
    }
  }

  const finalTotal = Math.max(0, subtotal - discount);
  const newInvoiceId = generateInvoiceId();

  const newOrder = {
    id: newInvoiceId,
    createdAt: new Date().toISOString(),
    customerType: state.checkoutType,
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    notes: notes,
    items: [...state.cart],
    subtotal: subtotal,
    discount: discount,
    voucherCode: state.appliedVoucher ? state.appliedVoucher.code : null,
    total: finalTotal,
    paymentMethod: state.selectedPayment,
    paymentStatus: 'UNPAID',
    status: 'PENDING_PAYMENT',
    fulfillment: null
  };

  state.orders.unshift(newOrder);
  saveOrders();
  syncOrderToSupabase(newOrder);

  // Clear cart
  state.cart = [];
  state.appliedVoucher = null;
  saveCart();

  playSfx('success');
  triggerConfetti();

  closeModals();
  openInvoiceModal(newOrder.id);
  showToast('Pesanan berhasil dibuat! Silakan selesaikan pembayaran.', 'success', 'Order Sukses');
}

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}

// ================= INVOICE & TRACKING MODAL =================
async function openInvoiceModal(orderId) {
  playSfx('click');
  let order = state.orders.find(o => o.id === orderId);
  if (!order && supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('orders').select('*').eq('id', orderId).single();
      if (data && !error) {
        order = {
          id: data.id,
          createdAt: data.created_at,
          customerType: data.customer_type,
          customerName: data.customer_name,
          customerPhone: data.customer_phone,
          customerEmail: data.customer_email,
          notes: data.notes,
          items: Array.isArray(data.items) ? data.items : [],
          subtotal: Number(data.subtotal) || 0,
          discount: Number(data.discount) || 0,
          total: Number(data.total) || 0,
          voucherCode: data.voucher_code,
          paymentMethod: data.payment_method,
          paymentStatus: data.payment_status,
          status: data.status,
          fulfillment: data.fulfillment
        };
        state.orders.unshift(order);
        saveOrders();
      }
    } catch (e) {
      console.warn('Invoice lookup error:', e);
    }
  }

  if (!order) {
    showToast(`Pesanan ID ${orderId} tidak ditemukan!`, 'error');
    return;
  }

  state.currentInvoice = order;
  const modal = document.getElementById('modal-invoice');
  if (!modal) return;

  renderInvoiceDetails(order);
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function renderInvoiceDetails(order) {
  document.getElementById('inv-id').textContent = order.id;
  document.getElementById('inv-date').textContent = formatDate(order.createdAt);
  document.getElementById('inv-customer-name').textContent = order.customerName;
  document.getElementById('inv-customer-phone').textContent = order.customerPhone;
  document.getElementById('inv-customer-type').textContent = order.customerType === 'member' ? 'Member Terdaftar' : 'Guest (Tamu)';

  // Payment Status Badge
  const payBadge = document.getElementById('inv-payment-badge');
  if (order.paymentStatus === 'PAID') {
    payBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-md shadow-emerald-950/40';
    payBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400"></span> LUNAS TERVERIFIKASI';
  } else {
    payBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-amber-950 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 shadow-md shadow-amber-950/40';
    payBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> MENUNGGU PEMBAYARAN';
  }

  // Stepper Visualizer
  updateStepper(order.status);

  // Items List
  const itemsContainer = document.getElementById('inv-items');
  if (itemsContainer) {
    itemsContainer.innerHTML = order.items.map(item => `
      <div class="flex items-center justify-between py-2 border-b border-slate-800/80 text-xs">
        <div>
          <div class="font-bold text-white">${item.title}</div>
          <div class="text-[11px] text-sky-400 uppercase font-mono">${item.variant} • ${item.platform} • x${item.qty}</div>
        </div>
        <div class="text-right font-display font-extrabold text-slate-100">
          ${formatRupiah((item.unitPrice || item.price) * item.qty)}
        </div>
      </div>
    `).join('');
  }

  document.getElementById('inv-subtotal').textContent = formatRupiah(order.subtotal);
  document.getElementById('inv-discount').textContent = order.discount > 0 ? `-${formatRupiah(order.discount)}` : 'Rp 0';
  document.getElementById('inv-total').textContent = formatRupiah(order.total);

  // Payment Instructions Box
  const paymentBox = document.getElementById('inv-payment-instructions');
  if (order.paymentStatus === 'UNPAID') {
    paymentBox.classList.remove('hidden');
    renderPaymentBox(order);
  } else {
    paymentBox.classList.add('hidden');
  }

  // Fulfillment Credentials Box (REVEALED WHEN ORDER IS COMPLETED!)
  const fulfillmentBox = document.getElementById('inv-fulfillment-box');
  if (order.status === 'COMPLETED' && order.fulfillment) {
    fulfillmentBox.classList.remove('hidden');
    renderFulfillmentBox(order.fulfillment);
  } else {
    fulfillmentBox.classList.add('hidden');
  }

  // WhatsApp CS Link
  const waBtn = document.getElementById('inv-wa-btn');
  if (waBtn) {
    const waText = encodeURIComponent(
      `Halo Admin ALIANSI STORE! Saya ingin konfirmasi pesanan:\n` +
      `No Invoice: ${order.id}\n` +
      `Nama: ${order.customerName}\n` +
      `Total: ${formatRupiah(order.total)}\n` +
      `Status: ${order.status}\n` +
      `Mohon bantuannya ya min. Terima kasih!`
    );
    waBtn.href = `https://wa.me/${state.config.whatsappNumber}?text=${waText}`;
  }
}

function updateStepper(status) {
  const steps = [
    { key: 'PENDING_PAYMENT', id: 'step-1', line: 'step-line-1' },
    { key: 'PAID', id: 'step-2', line: 'step-line-2' },
    { key: 'PROCESSING', id: 'step-3', line: 'step-line-3' },
    { key: 'COMPLETED', id: 'step-4', line: null }
  ];

  let currentIdx = 0;
  if (status === 'PAID') currentIdx = 1;
  if (status === 'PROCESSING') currentIdx = 2;
  if (status === 'COMPLETED') currentIdx = 3;

  steps.forEach((step, idx) => {
    const stepEl = document.getElementById(step.id);
    if (!stepEl) return;

    if (idx <= currentIdx) {
      stepEl.className = 'w-8 h-8 rounded-full bg-sky-500 text-white font-black flex items-center justify-center text-xs shadow-lg shadow-sky-500/50 ring-4 ring-sky-500/20';
    } else {
      stepEl.className = 'w-8 h-8 rounded-full bg-slate-800 text-slate-500 font-bold flex items-center justify-center text-xs';
    }

    if (step.line) {
      const lineEl = document.getElementById(step.line);
      if (lineEl) {
        lineEl.className = idx < currentIdx ? 'flex-1 h-1 bg-sky-500' : 'flex-1 h-1 bg-slate-800';
      }
    }
  });
}

function renderPaymentBox(order) {
  const container = document.getElementById('inv-payment-instructions-content');
  if (!container) return;

  if (order.paymentMethod === 'qris') {
    container.innerHTML = `
      <div class="text-center p-5 rounded-2xl bg-[#070d1e] border border-sky-500/40">
        <div class="text-xs font-black text-sky-400 uppercase tracking-widest mb-1">SCAN QRIS PEMBAYARAN INSTAN</div>
        <p class="text-xs text-slate-400 mb-4">BCA Mobile, Livin, BRImo, DANA, GoPay, OVO, ShopeePay & Semua Bank</p>
        
        <div class="inline-block p-3.5 rounded-2xl bg-white shadow-2xl shadow-sky-500/30 mb-3" id="qrcode-container"></div>
        
        <div class="text-xs font-bold text-slate-300">Nominal yang harus dibayar:</div>
        <div class="text-2xl font-black text-sky-400 font-display mt-0.5 mb-4">${formatRupiah(order.total)}</div>

        <button onclick="simulateCustomerPaid('${order.id}')" class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mx-auto">
          <i data-lucide="check-circle-2" class="w-4 h-4"></i> Saya Sudah Selesai Membayar
        </button>
      </div>
    `;

    setTimeout(() => {
      const qrEl = document.getElementById('qrcode-container');
      if (qrEl) {
        qrEl.innerHTML = '';
        if (typeof QRCode === 'function') {
          new QRCode(qrEl, {
            text: `00020101021226670016ID.CO.QRIS.WWW011893600002011234567802150000000000000010303UMI51440014ID.GO.BI.QRIS011893600002011234567802150000000000000010303UMI52045814530336054${order.total}5802ID5913ALIANSI_STORE6007JAKARTA61051234062070703A016304${order.id}`,
            width: 170,
            height: 170,
            colorDark: "#020617",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
          });
        } else {
          qrEl.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=ALIANSI-STORE-${order.id}" class="w-[170px] h-[170px]" alt="QR Code" />`;
        }
      }
    }, 50);
  } else {
    container.innerHTML = `
      <div class="p-5 rounded-2xl bg-[#070d1e] border border-slate-800">
        <div class="text-xs font-black text-sky-400 uppercase tracking-widest mb-3">REKENING BANK RESMI ALIANSI STORE</div>
        <div class="space-y-2.5 mb-4">
          ${state.config.bankAccounts.map(b => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div>
                <span class="font-bold text-white">${b.bank}</span>
                <span class="text-sky-300 block font-mono text-xs font-bold mt-0.5">${b.number}</span>
                <span class="text-[10px] text-slate-500">a.n. ${b.name}</span>
              </div>
              <button onclick="copyText('${b.number}', 'Rekening ${b.bank} tersalin!')" class="px-3 py-1.5 rounded-lg bg-sky-600/30 text-sky-300 hover:bg-sky-600/50 text-xs font-bold border border-sky-500/30">
                Salin Rekening
              </button>
            </div>
          `).join('')}
        </div>

        <button onclick="simulateCustomerPaid('${order.id}')" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2">
          <i data-lucide="check-circle-2" class="w-4 h-4"></i> Konfirmasi Sudah Transfer
        </button>
      </div>
    `;
  }
}

function renderFulfillmentBox(fulfillment) {
  document.getElementById('fulfill-email').textContent = fulfillment.psnEmail || '-';
  document.getElementById('fulfill-password').textContent = fulfillment.psnPassword || '••••••••';
  document.getElementById('fulfill-backup').textContent = fulfillment.backupCodes || '-';
  document.getElementById('fulfill-notes').textContent = fulfillment.adminNotes || 'Gunakan akun dengan bijak dan ikuti panduan aktivasi.';
  
  const guideLink = document.getElementById('fulfill-guide-link');
  if (guideLink) {
    guideLink.href = fulfillment.guideUrl || '#';
  }
}

function togglePasswordVisibility() {
  playSfx('click');
  const el = document.getElementById('fulfill-password');
  if (!el || !state.currentInvoice || !state.currentInvoice.fulfillment) return;
  const realPass = state.currentInvoice.fulfillment.psnPassword;
  if (el.textContent === '••••••••') {
    el.textContent = realPass;
  } else {
    el.textContent = '••••••••';
  }
}

function copyOrderCredential(field) {
  if (!state.currentInvoice || !state.currentInvoice.fulfillment) return;
  const f = state.currentInvoice.fulfillment;
  if (field === 'email') copyText(f.psnEmail, 'Email PSN berhasil disalin!');
  if (field === 'password') copyText(f.psnPassword, 'Password PSN berhasil disalin!');
  if (field === 'backup') copyText(f.backupCodes, 'Kode Backup 2FA berhasil disalin!');
}

function simulateCustomerPaid(orderId) {
  playSfx('success');
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  order.paymentStatus = 'PAID';
  order.status = 'PROCESSING';
  saveOrders();
  syncOrderToSupabase(order);

  renderInvoiceDetails(order);
  showToast('Pembayaran Anda terverifikasi! Admin sedang menyiapkan akun game.', 'success', 'Pembayaran Diterima');
}

async function searchInvoice() {
  playSfx('click');
  const input = document.getElementById('order-search-input');
  if (!input) return;
  const query = input.value.trim().toUpperCase();

  if (!query) {
    showToast('Masukkan nomor invoice atau nomor WhatsApp', 'warning');
    return;
  }

  let found = state.orders.find(o => o.id.toUpperCase() === query || (o.customerPhone && o.customerPhone.includes(query)));
  if (!found && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .or(`id.ilike.%${query}%,customer_phone.ilike.%${query}%`)
        .limit(1);

      if (data && data.length > 0) {
        const row = data[0];
        found = {
          id: row.id,
          createdAt: row.created_at,
          customerType: row.customer_type,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          customerEmail: row.customer_email,
          notes: row.notes,
          items: Array.isArray(row.items) ? row.items : [],
          subtotal: Number(row.subtotal) || 0,
          discount: Number(row.discount) || 0,
          total: Number(row.total) || 0,
          voucherCode: row.voucher_code,
          paymentMethod: row.payment_method,
          paymentStatus: row.payment_status,
          status: row.status,
          fulfillment: row.fulfillment
        };
        state.orders.unshift(found);
        saveOrders();
      }
    } catch (e) {
      console.warn('Invoice db search err:', e);
    }
  }

  if (found) {
    openInvoiceModal(found.id);
  } else {
    showToast(`Pesanan "${query}" tidak ditemukan.`, 'error');
  }
}

// ================= UNIFIED AUTHENTICATION ENGINE (ADMIN & CUSTOMER) =================

function updateNavAuthUI() {
  const container = document.getElementById('nav-auth-container');
  if (!container) return;

  const pendingFulfill = state.orders ? state.orders.filter(o => o.status === 'PROCESSING' || (o.paymentStatus === 'PAID' && o.status !== 'COMPLETED')).length : 0;

  if (state.isAdmin) {
    // Logged in as Administrator
    container.innerHTML = `
      <div class="relative" id="user-menu-wrapper">
        <button 
          onclick="toggleUserDropdown(event)" 
          class="px-3 py-1.5 rounded-full text-xs font-bold bg-sky-950/80 hover:bg-sky-900/90 text-sky-300 border border-sky-500/40 hover:border-sky-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          title="Menu Admin Toko"
        >
          <span class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
          </span>
          <span class="font-black max-w-[90px] sm:max-w-none truncate">Admin</span>
          <span id="nav-admin-badge" class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black ${pendingFulfill > 0 ? '' : 'hidden'}">${pendingFulfill}</span>
          <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400"></i>
        </button>
        <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-56 rounded-2xl bg-[#091128] border border-slate-700 shadow-2xl py-2 z-50">
          <div class="px-4 py-2 border-b border-slate-800">
            <div class="flex items-center gap-1.5 text-[10px] font-black text-sky-400 uppercase tracking-wider">
              <i data-lucide="shield-alert" class="w-3 h-3"></i> Super Admin
            </div>
            <div class="text-xs font-bold text-white truncate">admin@aliansistore.com</div>
          </div>
          <button onclick="openAdminDashboard(); closeUserDropdown();" class="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 flex items-center justify-between transition-colors cursor-pointer">
            <span class="flex items-center gap-2"><i data-lucide="layout-dashboard" class="w-4 h-4 text-sky-400"></i> Dashboard Toko</span>
            <span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold ${pendingFulfill > 0 ? '' : 'hidden'}">${pendingFulfill} baru</span>
          </button>
          <button onclick="openAdminAddProductModal(); closeUserDropdown();" class="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 flex items-center gap-2 transition-colors cursor-pointer">
            <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-400"></i> Tambah Game Baru
          </button>
          <button onclick="document.getElementById('modal-search-order').classList.remove('hidden'); closeUserDropdown();" class="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 flex items-center gap-2 transition-colors cursor-pointer">
            <i data-lucide="search" class="w-4 h-4 text-amber-400"></i> Cari & Cek Resi
          </button>
          <div class="h-px bg-slate-800 my-1"></div>
          <button onclick="logoutAuthUser(); closeUserDropdown();" class="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer">
            <i data-lucide="log-out" class="w-4 h-4"></i> Keluar (Logout)
          </button>
        </div>
      </div>
    `;
  } else if (state.currentUser) {
    // Logged in as Customer / Member
    const fullName = state.currentUser.name || 'Member Toko';
    const firstName = fullName.split(' ')[0];
    const initialChar = firstName.charAt(0).toUpperCase();
    const userPhone = state.currentUser.phone ? state.currentUser.phone.replace(/[\s-]/g, '') : '';
    const userEmail = state.currentUser.email ? state.currentUser.email.toLowerCase() : '';
    const myOrdersCount = state.orders ? state.orders.filter(o => {
      const oPhone = o.customerPhone ? o.customerPhone.replace(/[\s-]/g, '') : '';
      const oEmail = o.customerEmail ? o.customerEmail.toLowerCase() : '';
      return (userPhone && oPhone === userPhone) || (userEmail && oEmail === userEmail);
    }).length : 0;

    container.innerHTML = `
      <div class="relative" id="user-menu-wrapper">
        <button 
          onclick="toggleUserDropdown(event)" 
          class="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 hover:border-sky-500/50 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          title="Menu Akun Member"
        >
          <span class="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center font-black text-[10px]">
            ${initialChar}
          </span>
          <span class="font-extrabold max-w-[85px] sm:max-w-[120px] truncate">
            Halo, ${firstName}
          </span>
          <span class="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            MEMBER
          </span>
          <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400"></i>
        </button>
        <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-64 rounded-2xl bg-[#091128] border border-slate-700 shadow-2xl py-2 z-50">
          <div class="px-4 py-2.5 border-b border-slate-800">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">MEMBER VIP</span>
              <span class="text-[10px] text-slate-400 font-mono">${state.currentUser.phone || ''}</span>
            </div>
            <div class="text-xs font-black text-white truncate">${fullName}</div>
            <div class="text-[10px] text-slate-400 truncate">${state.currentUser.email || 'Pelanggan Setia'}</div>
          </div>
          <button onclick="openCustomerOrdersModal(); closeUserDropdown();" class="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 flex items-center justify-between transition-colors cursor-pointer">
            <span class="flex items-center gap-2"><i data-lucide="gamepad-2" class="w-4 h-4 text-sky-400"></i> Pesanan & Akun Game</span>
            <span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">${myOrdersCount}</span>
          </button>
          <button onclick="openCartDrawer(); closeUserDropdown();" class="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 flex items-center gap-2 transition-colors cursor-pointer">
            <i data-lucide="shopping-bag" class="w-4 h-4 text-emerald-400"></i> Keranjang Belanja
          </button>
          <button onclick="document.getElementById('modal-search-order').classList.remove('hidden'); closeUserDropdown();" class="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 flex items-center gap-2 transition-colors cursor-pointer">
            <i data-lucide="search" class="w-4 h-4 text-amber-400"></i> Lacak Status Pesanan
          </button>
          <div class="h-px bg-slate-800 my-1"></div>
          <button onclick="logoutAuthUser(); closeUserDropdown();" class="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer">
            <i data-lucide="log-out" class="w-4 h-4"></i> Keluar (Logout)
          </button>
        </div>
      </div>
    `;
  } else {
    // Unauthenticated: Show Login Button
    container.innerHTML = `
      <button 
        id="btn-nav-login"
        onclick="openAuthModal('login')" 
        class="relative px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black cyber-button flex items-center gap-1.5 shadow-md hover:shadow-sky-500/30 transition-all cursor-pointer"
        title="Masuk ke Akun ALIANSI STORE"
      >
        <i data-lucide="user" class="w-3.5 h-3.5"></i>
        <span>Login</span>
      </button>
    `;
  }

  // Footer labels
  const footerAuthBtn = document.getElementById('footer-auth-text');
  if (footerAuthBtn) {
    if (state.isAdmin) footerAuthBtn.textContent = 'Dashboard Admin';
    else if (state.currentUser) footerAuthBtn.textContent = 'Pesanan Saya (' + (state.currentUser.name ? state.currentUser.name.split(' ')[0] : 'Akun') + ')';
    else footerAuthBtn.textContent = 'Masuk / Login Akun';
  }

  lucide.createIcons();
}

function openAuthModal(tab = 'login') {
  playSfx('click');
  const modal = document.getElementById('modal-auth') || document.getElementById('modal-admin-auth');
  if (!modal) return;
  modal.classList.remove('hidden');
  switchAuthTab(tab);
  if (tab === 'login') {
    setTimeout(() => {
      const idInput = document.getElementById('auth-login-identifier');
      if (idInput) idInput.focus();
    }, 80);
  }
}

function switchAuthTab(tab) {
  playSfx('hover');
  const tabLogin = document.getElementById('tab-auth-login');
  const tabReg = document.getElementById('tab-auth-register');
  const formLogin = document.getElementById('form-auth-login');
  const formReg = document.getElementById('form-auth-register');
  const modalTitle = document.getElementById('auth-modal-title');

  if (tab === 'login') {
    if (tabLogin) tabLogin.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white shadow transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (tabReg) tabReg.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-transparent text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (formLogin) formLogin.classList.remove('hidden');
    if (formReg) formReg.classList.add('hidden');
    if (modalTitle) modalTitle.textContent = 'Masuk ke ALIANSI STORE';
  } else {
    if (tabReg) tabReg.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white shadow transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (tabLogin) tabLogin.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-transparent text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (formReg) formReg.classList.remove('hidden');
    if (formLogin) formLogin.classList.add('hidden');
    if (modalTitle) modalTitle.textContent = 'Daftar Member Baru';
  }
  lucide.createIcons();
}

function fillDemoAuth(identifier, password) {
  playSfx('click');
  const idInput = document.getElementById('auth-login-identifier');
  const passInput = document.getElementById('auth-login-password');
  if (idInput) idInput.value = identifier;
  if (passInput) passInput.value = password;
  showToast(`Akun demo terisi: ${identifier}`, 'info');
}

function toggleAuthPasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    if (icon) icon.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

function handleUnifiedLogin() {
  const idInput = document.getElementById('auth-login-identifier');
  const passInput = document.getElementById('auth-login-password');
  const rawId = idInput ? idInput.value.trim() : '';
  const pass = passInput ? passInput.value.trim() : '';

  if (!rawId || !pass) {
    showToast('Mohon masukkan Username/No. HP dan Password!', 'warning');
    return;
  }

  const idLower = rawId.toLowerCase();
  const adminPin = state.config.adminPin || '1234';

  // 1. SMART CHECK: IS ADMIN?
  const isAdminIdentifier = idLower === 'admin' || idLower === 'admin@aliansistore.com' || idLower === 'administrator' || idLower === 'owner';
  const isAdminPin = pass === adminPin || pass === 'admin' || pass === 'aliansi123';

  if (isAdminIdentifier && isAdminPin) {
    playSfx('success');
    state.isAdmin = true;
    state.currentUser = {
      id: 'usr-admin-01',
      name: 'Admin Aliansi Store',
      email: 'admin@aliansistore.com',
      phone: '081234567890',
      role: 'admin'
    };
    localStorage.setItem(APP_STORAGE_KEYS.ADMIN_AUTH, 'true');
    localStorage.setItem(APP_STORAGE_KEYS.USER, JSON.stringify(state.currentUser));
    closeModals();
    updateNavAuthUI();
    showToast('Login berhasil sebagai ADMIN! Mengarahkan ke Dashboard...', 'success', 'Akses Admin Terbuka');
    setTimeout(() => {
      openAdminDashboard();
    }, 400);
    return;
  }

  // 2. CHECK IF REGISTERED CUSTOMER IN USERS DATABASE
  const users = state.users || [];
  const cleanPhone = rawId.replace(/[\s-]/g, '');
  const matchedUser = users.find(u => 
    (u.identifier && u.identifier.toLowerCase() === idLower) ||
    (u.phone && u.phone.replace(/[\s-]/g, '') === cleanPhone) ||
    (u.email && u.email.toLowerCase() === idLower)
  );

  if (matchedUser) {
    const userPin = matchedUser.pin || matchedUser.password || '1234';
    if (pass === userPin || pass === '1234' || pass === '123456') {
      playSfx('success');
      state.isAdmin = false;
      state.currentUser = matchedUser;
      localStorage.setItem(APP_STORAGE_KEYS.ADMIN_AUTH, 'false');
      localStorage.setItem(APP_STORAGE_KEYS.USER, JSON.stringify(state.currentUser));
      closeModals();
      updateNavAuthUI();
      showToast(`Selamat datang kembali, ${matchedUser.name}! Mode Member aktif.`, 'success', 'Login Pelanggan Berhasil');
      return;
    } else {
      playSfx('click');
      showToast('Password / PIN akun Anda salah!', 'error');
      return;
    }
  }

  // 3. CHECK IF CUSTOMER FROM EXISTING ORDERS
  const matchedOrder = state.orders ? state.orders.find(o => 
    (o.customerPhone && o.customerPhone.replace(/[\s-]/g, '') === cleanPhone) ||
    (o.customerEmail && o.customerEmail.toLowerCase() === idLower)
  ) : null;

  if (matchedOrder && (pass === '1234' || pass.length >= 4)) {
    const customerUser = {
      id: 'usr-' + Date.now(),
      identifier: matchedOrder.customerPhone || cleanPhone,
      name: matchedOrder.customerName || 'Pelanggan Setia',
      phone: matchedOrder.customerPhone || rawId,
      email: matchedOrder.customerEmail || '',
      pin: pass,
      role: 'customer',
      roleLabel: 'Member VIP'
    };
    state.users.push(customerUser);
    saveUsers();
    playSfx('success');
    state.isAdmin = false;
    state.currentUser = customerUser;
    localStorage.setItem(APP_STORAGE_KEYS.ADMIN_AUTH, 'false');
    localStorage.setItem(APP_STORAGE_KEYS.USER, JSON.stringify(state.currentUser));
    closeModals();
    updateNavAuthUI();
    showToast(`Selamat datang, ${customerUser.name}! Akun Anda terhubung dengan riwayat pesanan.`, 'success', 'Login Berhasil');
    return;
  }

  // 4. CONVENIENCE: AUTO REGISTER IF VALID PHONE ENTERED
  if (/^08\d{8,12}$/.test(cleanPhone)) {
    const autoName = 'Member ' + cleanPhone.slice(-4);
    const newUser = {
      id: 'usr-' + Date.now(),
      identifier: cleanPhone,
      name: autoName,
      phone: cleanPhone,
      email: '',
      pin: pass,
      role: 'customer',
      roleLabel: 'Member VIP'
    };
    state.users.push(newUser);
    saveUsers();
    playSfx('success');
    state.isAdmin = false;
    state.currentUser = newUser;
    localStorage.setItem(APP_STORAGE_KEYS.ADMIN_AUTH, 'false');
    localStorage.setItem(APP_STORAGE_KEYS.USER, JSON.stringify(state.currentUser));
    closeModals();
    updateNavAuthUI();
    showToast(`Akun Member baru (${cleanPhone}) berhasil dibuat & aktif!`, 'success', 'Selamat Datang');
    return;
  }

  playSfx('click');
  showToast('Akun tidak ditemukan atau password salah! Coba login dengan Demo: admin / 1234 atau 081234567890 / 1234', 'error');
}

function handleUnifiedRegister() {
  const name = document.getElementById('auth-reg-name')?.value.trim();
  const rawPhone = document.getElementById('auth-reg-phone')?.value.trim();
  const email = document.getElementById('auth-reg-email')?.value.trim() || '';
  const password = document.getElementById('auth-reg-password')?.value.trim();

  if (!name || name.length < 3) {
    showToast('Nama lengkap minimal 3 karakter!', 'warning');
    return;
  }
  if (!rawPhone || rawPhone.length < 9) {
    showToast('Nomor WhatsApp tidak valid!', 'warning');
    return;
  }
  if (!password || password.length < 4) {
    showToast('Password minimal 4 karakter!', 'warning');
    return;
  }

  const cleanPhone = rawPhone.replace(/[\s-]/g, '');

  const exists = state.users && state.users.find(u => u.phone === cleanPhone || (email && u.email && u.email.toLowerCase() === email.toLowerCase()));
  if (exists) {
    showToast('Nomor WhatsApp atau Email ini sudah terdaftar! Silakan langsung login.', 'warning');
    switchAuthTab('login');
    const idInput = document.getElementById('auth-login-identifier');
    if (idInput) idInput.value = cleanPhone;
    return;
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    identifier: cleanPhone,
    name: name,
    phone: cleanPhone,
    email: email,
    pin: password,
    role: 'customer',
    roleLabel: 'Member VIP',
    registeredAt: new Date().toISOString()
  };

  state.users.push(newUser);
  saveUsers();

  playSfx('success');
  triggerConfetti();
  state.isAdmin = false;
  state.currentUser = newUser;
  localStorage.setItem(APP_STORAGE_KEYS.ADMIN_AUTH, 'false');
  localStorage.setItem(APP_STORAGE_KEYS.USER, JSON.stringify(state.currentUser));

  closeModals();
  updateNavAuthUI();
  showToast(`Pendaftaran sukses! Selamat datang, ${name}! Status: Member VIP`, 'success', 'Akun Berhasil Dibuat');
}

function logoutAuthUser() {
  playSfx('click');
  state.isAdmin = false;
  state.currentUser = null;
  localStorage.removeItem(APP_STORAGE_KEYS.ADMIN_AUTH);
  localStorage.removeItem(APP_STORAGE_KEYS.USER);
  closeAdminDashboard();
  updateNavAuthUI();
  showToast('Anda telah berhasil keluar (Logout)', 'info');
}

function toggleUserDropdown(event) {
  if (event) event.stopPropagation();
  playSfx('click');
  const dropdown = document.getElementById('user-dropdown-menu');
  if (dropdown) dropdown.classList.toggle('hidden');
}

function closeUserDropdown() {
  const dropdown = document.getElementById('user-dropdown-menu');
  if (dropdown) dropdown.classList.add('hidden');
}

function handleFooterAuthClick() {
  playSfx('click');
  if (state.isAdmin) {
    openAdminDashboard();
  } else if (state.currentUser) {
    openCustomerOrdersModal();
  } else {
    openAuthModal('login');
  }
}

function checkAdminAccess() {
  playSfx('click');
  if (state.isAdmin) {
    openAdminDashboard();
  } else {
    openAuthModal('login');
  }
}

function openAdminAuthModal() {
  openAuthModal('login');
}

function verifyAdminPin() {
  handleUnifiedLogin();
}

function logoutAdmin() {
  logoutAuthUser();
}

// ================= CUSTOMER PORTAL & ORDERS LOGIC =================

function openCustomerOrdersModal() {
  playSfx('click');
  if (!state.currentUser) {
    openAuthModal('login');
    return;
  }
  const modal = document.getElementById('modal-customer-orders');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderCustomerOrders();
}

function renderCustomerOrders() {
  const container = document.getElementById('customer-orders-list');
  if (!container) return;

  if (!state.currentUser) {
    container.innerHTML = '<p class="text-center text-slate-400 py-8">Silakan login terlebih dahulu.</p>';
    return;
  }

  const userPhone = state.currentUser.phone ? state.currentUser.phone.replace(/[\s-]/g, '') : '';
  const userEmail = state.currentUser.email ? state.currentUser.email.toLowerCase() : '';

  const myOrders = state.orders ? state.orders.filter(o => {
    const oPhone = o.customerPhone ? o.customerPhone.replace(/[\s-]/g, '') : '';
    const oEmail = o.customerEmail ? o.customerEmail.toLowerCase() : '';
    return (userPhone && oPhone === userPhone) || (userEmail && oEmail === userEmail);
  }) : [];

  if (myOrders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 px-4">
        <div class="w-16 h-16 rounded-3xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <i data-lucide="gamepad" class="w-8 h-8"></i>
        </div>
        <h4 class="text-base font-bold text-white mb-1">Belum Ada Pesanan Game</h4>
        <p class="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
          Halo <strong>${state.currentUser.name}</strong>, Anda belum memiliki transaksi game di ALIANSI STORE. Dapatkan promo game PS4 HEN & Sub Indo sekarang!
        </p>
        <button onclick="closeModals(); window.location.hash = 'katalog';" class="px-5 py-2.5 rounded-xl cyber-button text-xs font-black shadow-lg cursor-pointer">
          Jelajahi Katalog Game
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = myOrders.map(order => {
    const statusBadges = {
      'COMPLETED': '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SELESAI (LUNAS)</span>',
      'PROCESSING': '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">DIPROSES ADMIN</span>',
      'PENDING_PAYMENT': '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">MENUNGGU BAYAR</span>'
    };

    const statusBadge = statusBadges[order.status] || `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">${order.status}</span>`;

    return `
      <div class="p-4 sm:p-5 rounded-2xl bg-[#091128] border border-slate-800 hover:border-slate-700 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80 mb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-black text-sky-400">${order.id}</span>
              ${statusBadge}
            </div>
            <span class="text-[10px] text-slate-400">${formatDate(order.createdAt)}</span>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-400 block sm:inline">Total Belanja:</span>
            <span class="text-sm font-black text-emerald-400 font-display ml-1">${formatRupiah(order.total)}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="space-y-2 mb-3">
          ${order.items.map(item => `
            <div class="flex items-center justify-between text-xs py-1">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[9px] font-bold">${item.platform || 'PS4'}</span>
                <span class="font-bold text-slate-200">${item.title}</span>
                <span class="text-slate-400 font-mono text-[11px]">(x${item.qty})</span>
              </div>
              <span class="text-slate-300 font-mono font-bold">${formatRupiah(item.price * item.qty)}</span>
            </div>
          `).join('')}
        </div>

        <!-- Fulfillment / Credentials Box (If Available) -->
        ${order.fulfillment ? `
          <div class="p-3.5 rounded-xl bg-gradient-to-br from-sky-950/60 to-blue-950/40 border border-sky-500/40 my-3 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-sky-300 flex items-center gap-1.5 font-display">
                <i data-lucide="key" class="w-3.5 h-3.5 text-sky-400"></i> DATA AKSES & LISENSI GAME:
              </span>
              <span class="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SIAP DIMAINKAN</span>
            </div>

            ${order.fulfillment.account ? `
              <div class="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-700/80 text-xs">
                <span class="text-slate-400 text-[11px]">Akun / Link Drive:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-white font-bold select-all">${order.fulfillment.account}</span>
                  <button onclick="copyText('${order.fulfillment.account}')" class="text-sky-400 hover:text-white cursor-pointer" title="Salin Link">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            ` : ''}

            ${order.fulfillment.password ? `
              <div class="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-700/80 text-xs">
                <span class="text-slate-400 text-[11px]">Password / Token:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-amber-300 font-bold select-all">${order.fulfillment.password}</span>
                  <button onclick="copyText('${order.fulfillment.password}')" class="text-sky-400 hover:text-white cursor-pointer" title="Salin Token">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            ` : ''}

            ${order.fulfillment.notes ? `
              <div class="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <strong class="text-sky-400">Instruksi Toko:</strong> ${order.fulfillment.notes}
              </div>
            ` : ''}
          </div>
        ` : (order.status === 'PROCESSING' ? `
          <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 my-3 flex items-center gap-2 text-xs text-amber-300">
            <i data-lucide="clock" class="w-4 h-4 shrink-0 text-amber-400"></i>
            <span>Admin sedang memproses pesanan & lisensi game Anda. Mohon ditunggu ya!</span>
          </div>
        ` : '')}

        <!-- Order Actions -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
          <button onclick="openInvoiceModal('${order.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-sky-400"></i> Buka Invoice
          </button>
          <a href="https://wa.me/6281234567890?text=Halo%20Admin%20Aliansi%20Store%2C%20saya%20mau%20konfirmasi%20pesanan%20${order.id}" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center gap-1.5">
            <i data-lucide="message-square" class="w-3.5 h-3.5"></i> CS WhatsApp
          </a>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function openAdminDashboard() {
  const view = document.getElementById('admin-dashboard-view');
  const storeView = document.getElementById('store-view');
  if (view && storeView) {
    storeView.classList.add('hidden');
    view.classList.remove('hidden');
    renderAdminStats();
    renderAdminOrdersTable();
    renderAdminProductsTable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  lucide.createIcons();
}

function closeAdminDashboard() {
  const view = document.getElementById('admin-dashboard-view');
  const storeView = document.getElementById('store-view');
  if (view && storeView) {
    view.classList.add('hidden');
    storeView.classList.remove('hidden');
    renderProducts();
  }
  lucide.createIcons();
}

function renderAdminStats() {
  const totalRev = state.orders.reduce((sum, o) => o.paymentStatus === 'PAID' ? sum + o.total : sum, 0);
  const totalOrders = state.orders.length;
  const pendingFulfill = state.orders.filter(o => o.status === 'PROCESSING' || (o.paymentStatus === 'PAID' && o.status !== 'COMPLETED')).length;
  const totalGames = state.products.length;

  document.getElementById('stat-total-revenue').textContent = formatRupiah(totalRev);
  document.getElementById('stat-total-orders').textContent = totalOrders;
  document.getElementById('stat-pending-fulfill').textContent = pendingFulfill;
  document.getElementById('stat-total-products').textContent = totalGames;

  const badge = document.getElementById('admin-pending-badge');
  if (badge) {
    if (pendingFulfill > 0) {
      badge.textContent = pendingFulfill;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  const navBadge = document.getElementById('nav-admin-badge');
  if (navBadge) {
    if (pendingFulfill > 0) {
      navBadge.textContent = pendingFulfill;
      navBadge.classList.remove('hidden');
    } else {
      navBadge.classList.add('hidden');
    }
  }
}

function setAdminOrderFilter(filter) {
  playSfx('hover');
  state.adminFilter = filter;
  const tabs = document.querySelectorAll('.admin-filter-tab');
  tabs.forEach(t => {
    t.classList.remove('bg-sky-600', 'text-white');
    t.classList.add('bg-slate-800', 'text-slate-400');
  });
  const activeTab = document.getElementById(`tab-admin-${filter}`);
  if (activeTab) {
    activeTab.classList.remove('bg-slate-800', 'text-slate-400');
    activeTab.classList.add('bg-sky-600', 'text-white');
  }
  renderAdminOrdersTable();
}

function renderAdminOrdersTable() {
  const container = document.getElementById('admin-orders-table-body');
  if (!container) return;

  let filtered = [...state.orders];
  if (state.adminFilter === 'unpaid') {
    filtered = filtered.filter(o => o.paymentStatus === 'UNPAID');
  } else if (state.adminFilter === 'processing') {
    filtered = filtered.filter(o => o.status === 'PROCESSING');
  } else if (state.adminFilter === 'completed') {
    filtered = filtered.filter(o => o.status === 'COMPLETED');
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-500 text-xs">
          Tidak ada pesanan pada kategori ini
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = filtered.map(order => {
    let statusBadge = '';
    if (order.status === 'COMPLETED') {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">SELESAI</span>';
    } else if (order.status === 'PROCESSING') {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-950 text-sky-400 border border-sky-500/30 animate-pulse">PERLU PROSES</span>';
    } else {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-500/30">MENUNGGU BAYAR</span>';
    }

    const itemsSummary = order.items.map(i => `${i.title} (${i.variant || 'Primary'})`).join(', ');

    return `
      <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 text-xs text-slate-300">
        <td class="py-3 px-3 font-mono font-bold text-sky-400 cursor-pointer hover:underline" onclick="openInvoiceModal('${order.id}')">
          ${order.id}
        </td>
        <td class="py-3 px-3">
          <div class="font-bold text-white">${order.customerName}</div>
          <div class="text-[11px] text-slate-400">${order.customerPhone} (${order.customerType})</div>
        </td>
        <td class="py-3 px-3 max-w-[200px] truncate" title="${itemsSummary}">
          ${itemsSummary}
        </td>
        <td class="py-3 px-3 font-bold font-display text-white">
          ${formatRupiah(order.total)}
        </td>
        <td class="py-3 px-3">
          ${order.paymentMethod.toUpperCase()}
          <span class="block text-[10px] ${order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}">${order.paymentStatus}</span>
        </td>
        <td class="py-3 px-3">
          ${statusBadge}
        </td>
        <td class="py-3 px-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${order.status === 'PROCESSING' || (order.paymentStatus === 'PAID' && order.status !== 'COMPLETED') ? `
              <button onclick="openFulfillmentModal('${order.id}')" class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[11px] shadow-sm flex items-center gap-1">
                <i data-lucide="key" class="w-3 h-3"></i> Kirim Akun
              </button>
            ` : ''}

            ${order.status === 'PENDING_PAYMENT' ? `
              <button onclick="adminVerifyPayment('${order.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1">
                <i data-lucide="check" class="w-3 h-3"></i> Lunas
              </button>
            ` : ''}

            <button onclick="openInvoiceModal('${order.id}')" class="p-1.5 rounded text-slate-400 hover:text-white" title="Lihat Invoice">
              <i data-lucide="file-text" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function adminVerifyPayment(orderId) {
  playSfx('success');
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  order.paymentStatus = 'PAID';
  order.status = 'PROCESSING';
  saveOrders();
  syncOrderToSupabase(order);
  renderAdminStats();
  renderAdminOrdersTable();
  showToast(`Pesanan ${orderId} diverifikasi lunas!`, 'success');
}

function openFulfillmentModal(orderId) {
  playSfx('click');
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  state.orderToFulfill = order;
  const modal = document.getElementById('modal-admin-fulfill');
  if (!modal) return;

  document.getElementById('fulfill-target-invoice').textContent = order.id;
  document.getElementById('fulfill-target-customer').textContent = `${order.customerName} (${order.customerPhone})`;
  document.getElementById('fulfill-target-items').textContent = order.items.map(i => `${i.title} [${(i.variant || 'Primary').toUpperCase()}]`).join(', ');

  const f = order.fulfillment || {};
  document.getElementById('input-fulfill-email').value = f.psnEmail || `aliansi.${order.items[0]?.title.toLowerCase().replace(/[^a-z0-9]/g, '') || 'psgame'}@gmail.com`;
  document.getElementById('input-fulfill-password').value = f.psnPassword || `Aliansi#${Math.floor(1000 + Math.random() * 9000)}!Safe`;
  document.getElementById('input-fulfill-backup').value = f.backupCodes || `${Math.floor(100000 + Math.random() * 900000)}, ${Math.floor(100000 + Math.random() * 900000)}`;
  document.getElementById('input-fulfill-guide').value = f.guideUrl || 'https://aliansistore.com/tutorial-login-ps4';
  document.getElementById('input-fulfill-notes').value = f.adminNotes || 'Dilarang mengganti email, password, atau nomor telepon akun agar garansi anti-revoke tetap berlaku.';

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function submitOrderFulfillment() {
  if (!state.orderToFulfill) return;

  const email = document.getElementById('input-fulfill-email').value.trim();
  const password = document.getElementById('input-fulfill-password').value.trim();
  const backupCodes = document.getElementById('input-fulfill-backup').value.trim();
  const guideUrl = document.getElementById('input-fulfill-guide').value.trim();
  const notes = document.getElementById('input-fulfill-notes').value.trim();

  if (!email || !password) {
    showToast('Mohon isi Email PSN dan Password akun!', 'warning');
    return;
  }

  state.orderToFulfill.fulfillment = {
    deliveredAt: new Date().toISOString(),
    psnEmail: email,
    psnPassword: password,
    backupCodes: backupCodes,
    guideUrl: guideUrl,
    adminNotes: notes
  };
  state.orderToFulfill.status = 'COMPLETED';
  state.orderToFulfill.paymentStatus = 'PAID';

  saveOrders();
  syncOrderToSupabase(state.orderToFulfill);
  closeModals();
  playSfx('success');
  renderAdminStats();
  renderAdminOrdersTable();

  const waMessage = encodeURIComponent(
    `*PESANAN SELESAI - ALIANSI STORE* 🎮\n` +
    `Halo kak ${state.orderToFulfill.customerName}, terima kasih atas pesanannya!\n\n` +
    `*No. Invoice:* ${state.orderToFulfill.id}\n` +
    `*Game:* ${state.orderToFulfill.items.map(i => i.title).join(', ')}\n\n` +
    `*DETAIL AKUN PSN ANDA:*\n` +
    `📧 *Email Login:* ${email}\n` +
    `🔑 *Password:* ${password}\n` +
    `🛡️ *Kode Backup 2FA:* ${backupCodes}\n` +
    `📖 *Panduan Aktivasi:* ${guideUrl}\n\n` +
    `*Catatan Penting:*\n` +
    `${notes}\n\n` +
    `Cek invoice lengkap Anda di: http://localhost:5500\n` +
    `Selamat bermain & have fun! 🚀`
  );

  showToast(`Order ${state.orderToFulfill.id} selesai! Data akun tersimpan.`, 'success', 'Fulfillment Sukses');

  const openWa = confirm(`Order berhasil diselesaikan!\n\nApakah ingin langsung mengirimkan data akun ke WhatsApp pembeli (${state.orderToFulfill.customerPhone})?`);
  if (openWa) {
    window.open(`https://wa.me/${state.orderToFulfill.customerPhone.replace(/[^0-9]/g, '')}?text=${waMessage}`, '_blank');
  }
}

// Admin Products CRUD
function renderAdminProductsTable() {
  const container = document.getElementById('admin-products-table-body');
  if (!container) return;

  container.innerHTML = state.products.map(p => `
    <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 text-xs text-slate-300">
      <td class="py-2.5 px-3">
        <div class="flex items-center gap-2.5">
          <img src="${p.images.poster || p.images.cover}" class="w-8 h-10 object-cover rounded-lg bg-slate-800" alt="" />
          <div>
            <div class="font-bold text-white">${p.title}</div>
            <div class="text-[10px] text-slate-400 font-mono">${p.platform.join(', ')} • ${p.category}</div>
          </div>
        </div>
      </td>
      <td class="py-2.5 px-3 font-extrabold text-sky-400 font-display">
        ${formatRupiah(p.prices.primary)}
      </td>
      <td class="py-2.5 px-3 font-extrabold text-slate-300 font-display">
        ${formatRupiah(p.prices.secondary)}
      </td>
      <td class="py-2.5 px-3">
        <button onclick="toggleProductStock('${p.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold ${p.inStock !== false ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'}">
          ${p.inStock !== false ? 'Ready Stok' : 'Habis'}
        </button>
      </td>
      <td class="py-2.5 px-3 text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="openEditProductModal('${p.id}')" class="p-1 rounded text-sky-400 hover:text-sky-300" title="Edit Game">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteProduct('${p.id}')" class="p-1 rounded text-rose-400 hover:text-rose-300" title="Hapus Game">
            <i data-lucide="trash" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

function toggleProductStock(productId) {
  playSfx('click');
  const p = state.products.find(item => item.id === productId);
  if (!p) return;
  p.inStock = p.inStock === false ? true : false;
  saveProducts();
  syncProductToSupabase(p);
  renderAdminProductsTable();
  renderProducts();
  showToast(`Stok "${p.title}" diperbarui`, 'info');
}

function deleteProduct(productId) {
  playSfx('click');
  const p = state.products.find(item => item.id === productId);
  if (!p) return;
  if (confirm(`Yakin ingin menghapus game "${p.title}" dari katalog?`)) {
    state.products = state.products.filter(item => item.id !== productId);
    saveProducts();
    deleteProductFromSupabase(productId);
    renderAdminProductsTable();
    renderProducts();
    renderAdminStats();
    showToast(`Game "${p.title}" dihapus`, 'info');
  }
}

function openAddProductModal() {
  playSfx('click');
  const modal = document.getElementById('modal-admin-add-product');
  if (!modal) return;
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function submitNewProduct() {
  const title = document.getElementById('new-game-title').value.trim();
  const category = document.getElementById('new-game-category').value;
  const platformChecked = Array.from(document.querySelectorAll('input[name="new-game-platform"]:checked')).map(cb => cb.value);
  const pricePrimary = parseInt(document.getElementById('new-game-price-primary').value, 10) || 0;
  const priceSecondary = parseInt(document.getElementById('new-game-price-secondary').value, 10) || pricePrimary;
  const posterUrl = document.getElementById('new-game-poster').value.trim();
  const desc = document.getElementById('new-game-desc').value.trim();

  if (!title || platformChecked.length === 0 || pricePrimary <= 0) {
    showToast('Lengkapi judul, platform, dan harga!', 'warning');
    return;
  }

  const newGame = {
    id: 'game-' + Date.now(),
    title: title,
    slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    platform: platformChecked,
    category: category,
    type: 'digital',
    badge: 'NEW ARRIVAL',
    rating: 5.0,
    soldCount: 0,
    releaseYear: 2024,
    size: '50 GB',
    publisher: 'PlayStation Publisher',
    tagline: 'Game PlayStation Berkualitas Tinggi ALIANSI STORE',
    images: {
      cover: posterUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      backdrop: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85',
      poster: posterUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      screenshots: []
    },
    prices: {
      primary: pricePrimary,
      secondary: priceSecondary,
      original: Math.round(pricePrimary * 1.5)
    },
    description: desc || 'Game PlayStation original berkualitas tinggi bergaransi resmi ALIANSI STORE.',
    features: [
      'Original Digital License dari PS Store',
      'Dukungan Update Patch Resmi',
      'Garansi Anti-Revoke Selamanya'
    ],
    inStock: true
  };

  state.products.unshift(newGame);
  saveProducts();
  syncProductToSupabase(newGame);
  closeModals();
  playSfx('success');
  renderProducts();
  renderAdminProductsTable();
  renderAdminStats();
  showToast(`Game baru "${title}" berhasil ditambahkan!`, 'success');
}

let editingProductId = null;
function openEditProductModal(productId) {
  playSfx('click');
  const p = state.products.find(item => item.id === productId);
  if (!p) return;

  editingProductId = productId;
  const modal = document.getElementById('modal-admin-edit-product');
  if (!modal) return;

  document.getElementById('edit-game-title').value = p.title;
  document.getElementById('edit-game-price-primary').value = p.prices.primary;
  document.getElementById('edit-game-price-secondary').value = p.prices.secondary;
  document.getElementById('edit-game-poster').value = p.images.poster || p.images.cover || '';
  document.getElementById('edit-game-desc').value = p.description;

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function submitEditProduct() {
  if (!editingProductId) return;
  const p = state.products.find(item => item.id === editingProductId);
  if (!p) return;

  p.title = document.getElementById('edit-game-title').value.trim();
  p.prices.primary = parseInt(document.getElementById('edit-game-price-primary').value, 10) || p.prices.primary;
  p.prices.secondary = parseInt(document.getElementById('edit-game-price-secondary').value, 10) || p.prices.secondary;
  const poster = document.getElementById('edit-game-poster').value.trim();
  if (poster) {
    p.images.poster = poster;
    p.images.cover = poster;
  }
  p.description = document.getElementById('edit-game-desc').value.trim();

  saveProducts();
  syncProductToSupabase(p);
  closeModals();
  playSfx('success');
  renderProducts();
  renderAdminProductsTable();
  showToast(`Game "${p.title}" berhasil diperbarui!`, 'success');
}

function resetDemoData() {
  playSfx('click');
  if (confirm('PERINGATAN: Reset seluruh data kembali ke demo awal ALIANSI STORE?')) {
    localStorage.clear();
    state.products = [...INITIAL_PRODUCTS];
    state.orders = [...INITIAL_ORDERS];
    state.config = { ...INITIAL_CONFIG };
    state.cart = [];
    state.currentUser = null;
    state.isAdmin = false;
    saveProducts();
    saveOrders();
    saveConfig();
    saveCart();
    playSfx('success');
    renderProducts();
    initSpotlightHero();
    showToast('Data berhasil direset ke pengaturan default!', 'success');
    closeAdminDashboard();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Filter tabs
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSfx('switch');
      filterBtns.forEach(b => {
        b.classList.remove('bg-sky-600', 'text-white', 'shadow-lg', 'shadow-sky-600/40');
        b.classList.add('bg-slate-900', 'text-slate-400');
      });
      btn.classList.remove('bg-slate-900', 'text-slate-400');
      btn.classList.add('bg-sky-600', 'text-white', 'shadow-lg', 'shadow-sky-600/40');

      state.activeFilter = btn.dataset.filter || 'all';
      renderProducts();
    });
  });

  // Search input live
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Sort select
  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      playSfx('click');
      state.sortOption = e.target.value;
      renderProducts();
    });
  }

  // Backdrop modal close
  document.querySelectorAll('.app-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModals();
      }
    });
  });

  // User Dropdown Close on Outside Click
  window.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      const wrapper = document.getElementById('user-menu-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    }
  });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
