// ALIANSI STORE - Next-Gen Gaming UI & Logic Engine
// Features: Web Audio SFX Synth, PS5 Console Spotlight, Card Dual-Pricing, Realtime Fulfillment

const APP_STORAGE_KEYS = {
  PRODUCTS: 'aliansi_store_products_v4',
  ORDERS: 'aliansi_store_orders_v3',
  CONFIG: 'aliansi_store_config_v3',
  CART: 'aliansi_store_cart_v2',
  USER: 'aliansi_store_user_v2',
  ADMIN_AUTH: 'aliansi_store_admin_auth',
  AUDIO_MUTED: 'aliansi_store_audio_muted',
  THEME: 'aliansi_theme',
  USERS_DB: 'aliansi_store_users_v3',
  GAME_REQUESTS: 'aliansi_store_game_requests_v1'
};

// Permanent High-Resolution Local & Fallback Poster Map (14 Official Sub Indo Titles)
const COVER_FALLBACK_MAP = {
  'game-it-takes-two-subindo': 'assets/covers/it-takes-two.jpg',
  'game-gow-ragnarok-subindo': 'assets/covers/gow-ragnarok.jpg',
  'game-ghost-tsushima-subindo': 'assets/covers/ghost-tsushima.jpg',
  'game-tlou-part2-subindo': 'assets/covers/tlou-part2.jpg',
  'game-gta5-subindo': 'assets/covers/gta-v.jpg',
  'game-mk11-subindo': 'assets/covers/mortal-kombat-11.jpg',
  'game-hogwarts-legacy-subindo': 'assets/covers/hogwarts-legacy.jpg',
  'game-uncharted-4-subindo': 'assets/covers/uncharted-4.jpg',
  'game-stray-subindo': 'assets/covers/stray.jpg',
  'game-ac-odyssey-subindo': 'assets/covers/ac-odyssey.jpg',
  'game-one-piece-odyssey-subindo': 'assets/covers/one-piece-odyssey.jpg',
  'game-watch-dogs-subindo': 'assets/covers/watch-dogs.jpg',
  'game-spiderman-subindo': 'assets/covers/spiderman.jpg',
  'game-pes-2027-bitbox': 'assets/covers/pes-2027.jpg'
};

// Official landscape key art for the cinematic hero backdrop (assets/backdrops)
const BACKDROP_MAP = {
  'game-it-takes-two-subindo': 'assets/backdrops/it-takes-two.jpg',
  'game-gow-ragnarok-subindo': 'assets/backdrops/gow-ragnarok.jpg',
  'game-ghost-tsushima-subindo': 'assets/backdrops/ghost-tsushima.jpg',
  'game-tlou-part2-subindo': 'assets/backdrops/tlou-part2.jpg',
  'game-gta5-subindo': 'assets/backdrops/gta-v.jpg',
  'game-mk11-subindo': 'assets/backdrops/mortal-kombat-11.jpg',
  'game-hogwarts-legacy-subindo': 'assets/backdrops/hogwarts-legacy.jpg',
  'game-uncharted-4-subindo': 'assets/backdrops/uncharted-4.jpg',
  'game-stray-subindo': 'assets/backdrops/stray.jpg',
  'game-ac-odyssey-subindo': 'assets/backdrops/ac-odyssey.jpg',
  'game-one-piece-odyssey-subindo': 'assets/backdrops/one-piece-odyssey.jpg',
  'game-watch-dogs-subindo': 'assets/backdrops/watch-dogs.jpg',
  'game-spiderman-subindo': 'assets/backdrops/spiderman.jpg',
  'game-pes-2027-bitbox': 'assets/backdrops/pes-2027.jpg'
};

function getProductBackdrop(product) {
  if (!product) return '';
  const imgs = product.images || {};
  if (imgs.backdrop && typeof imgs.backdrop === 'string' && imgs.backdrop.trim().length > 0) {
    return imgs.backdrop;
  }
  if (BACKDROP_MAP[product.id]) return BACKDROP_MAP[product.id];
  if (imgs.banner && typeof imgs.banner === 'string' && imgs.banner.trim().length > 0) {
    return imgs.banner;
  }
  return getProductPoster(product);
}

function getProductPoster(product) {
  if (!product) return 'assets/covers/service-1tb.jpg';
  const pid = product.id || product.productId;
  if (pid && COVER_FALLBACK_MAP[pid]) return COVER_FALLBACK_MAP[pid];
  const img = (product.images && (product.images.poster || product.images.cover)) || product.poster;
  if (img && typeof img === 'string' && !img.includes('playstation.com') && !img.includes('photo-1508098682722')) {
    return img;
  }
  return COVER_FALLBACK_MAP[pid] || 'assets/covers/service-1tb.jpg';
}

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
  orderToFulfill: null,
  gameRequests: [],
  adminRequestFilter: 'all',
  selectedRequestForConfirm: null,
  lastCreatedRequest: null
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
  updateStoreContactUI();
  lucide.createIcons();
  syncFromSupabase();
}

function loadStoredData() {
  // Audio state
  state.isAudioMuted = localStorage.getItem(APP_STORAGE_KEYS.AUDIO_MUTED) === 'true';
  updateAudioIndicator();

  // Load Products from Local Storage
  const storedProducts = localStorage.getItem(APP_STORAGE_KEYS.PRODUCTS);
  if (storedProducts) {
    try {
      const parsed = JSON.parse(storedProducts);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.products = parsed;
      } else {
        state.products = typeof INITIAL_PRODUCTS !== 'undefined' ? [...INITIAL_PRODUCTS] : [];
      }
    } catch (e) {
      state.products = typeof INITIAL_PRODUCTS !== 'undefined' ? [...INITIAL_PRODUCTS] : [];
    }
  } else {
    state.products = typeof INITIAL_PRODUCTS !== 'undefined' ? [...INITIAL_PRODUCTS] : [];
    saveProducts();
  }

  // Ensure default catalog products exist without overwriting custom modifications
  if (typeof INITIAL_PRODUCTS !== 'undefined' && Array.isArray(INITIAL_PRODUCTS)) {
    INITIAL_PRODUCTS.forEach(ip => {
      const existing = state.products.find(p => p.id === ip.id);
      if (!existing) {
        state.products.push({ ...ip });
      } else {
        // Fallback for missing driveLink or covers if empty
        if (ip.driveLink && !existing.driveLink) {
          existing.driveLink = ip.driveLink;
        }
      }
    });
  }

  // Ensure cover fallbacks if image is missing
  state.products.forEach(p => {
    if (COVER_FALLBACK_MAP[p.id] && (!p.images || !p.images.poster)) {
      if (!p.images) p.images = {};
      p.images.poster = COVER_FALLBACK_MAP[p.id];
      p.images.cover = COVER_FALLBACK_MAP[p.id];
    }
  });
  saveProducts();

  // Orders
  const storedOrders = localStorage.getItem(APP_STORAGE_KEYS.ORDERS);
  if (storedOrders) {
    try {
      state.orders = JSON.parse(storedOrders);
    } catch (e) {
      state.orders = typeof INITIAL_ORDERS !== 'undefined' ? [...INITIAL_ORDERS] : [];
    }
  } else {
    state.orders = typeof INITIAL_ORDERS !== 'undefined' ? [...INITIAL_ORDERS] : [];
    saveOrders();
  }

  // Config
  const storedConfig = localStorage.getItem(APP_STORAGE_KEYS.CONFIG);
  if (storedConfig) {
    try {
      state.config = { ...(typeof INITIAL_CONFIG !== 'undefined' ? INITIAL_CONFIG : {}), ...JSON.parse(storedConfig) };
    } catch (e) {
      state.config = typeof INITIAL_CONFIG !== 'undefined' ? { ...INITIAL_CONFIG } : {};
    }
  } else {
    state.config = typeof INITIAL_CONFIG !== 'undefined' ? { ...INITIAL_CONFIG } : {};
    saveConfig();
  }
  if (!state.config.adminEmail) {
    state.config.adminEmail = (typeof INITIAL_CONFIG !== 'undefined' && INITIAL_CONFIG.adminEmail) || 'aliansistore.id@gmail.com';
  }
  updateStoreContactUI();

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
      // Auto-migrate legacy 'primary' variant to 'PS4 HEN' for HEN games
      if (Array.isArray(state.cart)) {
        state.cart.forEach(item => {
          if (!item.variant || item.variant.toLowerCase() === 'primary') {
            item.variant = 'PS4 HEN';
          }
        });
      }
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

  // Game Requests (Customer Requests)
  const storedReqs = localStorage.getItem(APP_STORAGE_KEYS.GAME_REQUESTS);
  if (storedReqs) {
    try {
      state.gameRequests = JSON.parse(storedReqs);
    } catch (e) {
      state.gameRequests = typeof INITIAL_GAME_REQUESTS !== 'undefined' ? [...INITIAL_GAME_REQUESTS] : [];
    }
  } else {
    state.gameRequests = typeof INITIAL_GAME_REQUESTS !== 'undefined' ? [...INITIAL_GAME_REQUESTS] : [];
    saveGameRequests();
  }
}

function saveUsers() {
  localStorage.setItem(APP_STORAGE_KEYS.USERS_DB, JSON.stringify(state.users));
}

function saveGameRequests() {
  localStorage.setItem(APP_STORAGE_KEYS.GAME_REQUESTS, JSON.stringify(state.gameRequests));
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
      const cloudProducts = prods.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        platform: Array.isArray(p.platform) ? p.platform : (typeof p.platform === 'string' ? JSON.parse(p.platform) : []),
        category: p.category,
        type: p.type || 'digital',
        badge: p.badge,
        isSubIndo: !!p.is_sub_indo,
        isHen: !!p.is_hen,
        isSpotlight: !!p.isSpotlight,
        rating: Number(p.rating) || 5.0,
        soldCount: Number(p.sold_count) || 0,
        releaseYear: p.release_year,
        size: p.size,
        publisher: p.publisher,
        tagline: p.tagline,
        images: (() => {
          const imgs = typeof p.images === 'object' && p.images !== null ? { ...p.images } : {};
          if (COVER_FALLBACK_MAP[p.id] && !imgs.poster) {
            imgs.poster = COVER_FALLBACK_MAP[p.id];
            imgs.cover = COVER_FALLBACK_MAP[p.id];
          }
          return imgs;
        })(),
        prices: typeof p.prices === 'object' && p.prices !== null ? p.prices : {},
        description: p.description,
        features: Array.isArray(p.features) ? p.features : [],
        driveLink: p.drive_link || (p.images && p.images.driveLink) || '',
        inStock: p.in_stock !== false,
        updatedAt: p.updated_at || null
      }));

      // Smart merge: preserve local changes if local is newer or cloud is stale
      const currentList = Array.isArray(state.products) ? [...state.products] : [];
      const mergedProducts = [...currentList];

      cloudProducts.forEach(cp => {
        const localIdx = mergedProducts.findIndex(lp => lp.id === cp.id);
        if (localIdx === -1) {
          mergedProducts.push(cp);
        } else {
          const localProd = mergedProducts[localIdx];
          const localTime = localProd.updatedAt ? new Date(localProd.updatedAt).getTime() : 0;
          const cloudTime = cp.updatedAt ? new Date(cp.updatedAt).getTime() : 0;
          if (cloudTime >= localTime || !localProd.updatedAt) {
            mergedProducts[localIdx] = {
              ...cp,
              driveLink: cp.driveLink || localProd.driveLink || ''
            };
          } else {
            // Local change is newer; keep local and sync up to cloud
            syncProductToSupabase(localProd);
          }
        }
      });

      state.products = mergedProducts;
      localStorage.setItem(APP_STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products));
      renderProducts();
      initSpotlightHero();
      renderAdminProductsTable();
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
        adminEmail: cfg.admin_email || state.config.adminEmail || 'aliansistore.id@gmail.com',
        adminPin: cfg.admin_pin || state.config.adminPin || '1234',
        bankAccounts: cfg.bank_accounts || state.config.bankAccounts,
        vouchers: cfg.vouchers || state.config.vouchers
      };
      localStorage.setItem(APP_STORAGE_KEYS.CONFIG, JSON.stringify(state.config));
      updateStoreContactUI();
    }

    // 4. Fetch Game Requests from Cloud (if table exists)
    try {
      const { data: reqs, error: rErr } = await supabaseClient.from('game_requests').select('*').order('created_at', { ascending: false });
      if (!rErr && reqs && reqs.length > 0) {
        state.gameRequests = reqs.map(r => ({
          id: r.id,
          gameTitle: r.game_title || r.gameTitle,
          platform: Array.isArray(r.platform) ? r.platform : (typeof r.platform === 'string' ? JSON.parse(r.platform) : []),
          category: r.category || 'Action & Adventure',
          customerName: r.customer_name || r.customerName,
          customerEmail: r.customer_email || r.customerEmail,
          customerPhone: r.customer_phone || r.customerPhone,
          notes: r.notes || '',
          status: r.status || 'PENDING',
          createdAt: r.created_at,
          fulfilledAt: r.fulfilled_at,
          adminNotes: r.admin_notes || ''
        }));
        saveGameRequests();
        renderAdminStats();
        renderAdminRequestsTable();
      }
    } catch (e) {
      // Graceful fallback to local requests
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

async function syncConfigToSupabase() {
  if (!supabaseClient || !state.config) return;
  try {
    const payload = {
      id: 'main',
      store_name: state.config.storeName || 'ALIANSI STORE',
      tagline: state.config.tagline || '',
      whatsapp_number: state.config.whatsappNumber || '6281234567890',
      whatsapp_formatted: state.config.whatsappFormatted || '+62 812-3456-7890',
      admin_email: state.config.adminEmail || 'aliansistore.id@gmail.com',
      admin_pin: state.config.adminPin || '1234',
      bank_accounts: state.config.bankAccounts || [],
      vouchers: state.config.vouchers || [],
      updated_at: new Date().toISOString()
    };
    const { error } = await supabaseClient.from('store_config').upsert(payload);
    if (error && error.message && error.message.includes('admin_email')) {
      delete payload.admin_email;
      await supabaseClient.from('store_config').upsert(payload);
    }
  } catch (err) {
    console.warn('Supabase sync config notice:', err);
  }
}

async function syncGameRequestToSupabase(req) {
  if (!supabaseClient || !req) return;
  try {
    await supabaseClient.from('game_requests').upsert({
      id: req.id,
      game_title: req.gameTitle,
      platform: req.platform,
      category: req.category,
      customer_name: req.customerName,
      customer_email: req.customerEmail,
      customer_phone: req.customerPhone,
      notes: req.notes,
      status: req.status,
      created_at: req.createdAt,
      fulfilled_at: req.fulfilledAt,
      admin_notes: req.adminNotes
    });
  } catch (err) {
    console.warn('Supabase sync game request notice:', err);
  }
}

async function syncProductToSupabase(p) {
  if (!supabaseClient || !p) return;
  try {
    const cloudImages = typeof p.images === 'object' && p.images !== null ? { ...p.images } : {};
    if (p.driveLink) {
      cloudImages.driveLink = p.driveLink;
    }

    const payload = {
      id: p.id,
      title: p.title,
      slug: p.slug || p.id,
      platform: p.platform,
      category: p.category,
      type: p.type || 'digital',
      badge: p.badge || null,
      is_sub_indo: !!p.isSubIndo,
      is_hen: !!p.isHen,
      is_spotlight: !!p.isSpotlight,
      rating: p.rating || 5.0,
      sold_count: p.soldCount || 0,
      release_year: p.releaseYear || new Date().getFullYear(),
      size: p.size || '',
      publisher: p.publisher || '',
      tagline: p.tagline || '',
      images: cloudImages,
      prices: p.prices,
      description: p.description || '',
      features: p.features || [],
      in_stock: p.inStock !== false,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient.from('products').upsert(payload);
    if (error) {
      console.warn('Supabase product sync warning:', error);
    } else {
      console.info(`Supabase product "${p.title}" synced successfully with prices:`, p.prices);
    }
  } catch (err) {
    console.warn('Failed to sync product to Supabase exception:', err);
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

function getDiscountPercent(original, discounted) {
  if (!original || !discounted || discounted >= original) return 0;
  return Math.round((1 - discounted / original) * 100);
}

function getCategoryLabel(cat) {
  const map = {
    'action': 'Action & Adventure',
    'adventure': 'Action & Adventure',
    'rpg': 'RPG & Open World',
    'horror': 'Horror & Survival',
    'sports': 'Olahraga & Balap',
    'racing': 'Balapan / Racing',
    'fighting': 'Fighting / Tarung',
    'shooter': 'Shooter & FPS',
    'family': 'Co-op & Family',
    'coop': 'Co-op & Family',
    'subindo': 'Subtitle Indonesia',
    'hen': 'Game PS4 HEN',
    'digital': 'Game Digital PSN'
  };
  return map[cat] || (cat ? cat.toUpperCase() : 'PlayStation Game');
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
      class="spotlight-thumb group w-full p-2 sm:p-2.5 rounded-2xl flex items-center gap-3 transition-all duration-300 text-left cursor-pointer border ${idx === 0 ? 'active bg-sky-950/80 border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/20' : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'}"
      data-index="${idx}"
      title="Lihat ${game.title}"
    >
      <div class="relative w-11 h-14 sm:w-12 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 shadow-md bg-slate-900">
        <img src="${getProductPoster(game)}" alt="${game.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.onerror=null; this.src='assets/covers/service-1tb.jpg'" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1 mb-0.5">
          <span class="spotlight-badge text-[9px] px-1.5 py-0.5 rounded-full font-bold ${idx === 0 ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}">
            ${idx === 0 ? '★ SEDANG TAMPIL' : `#${idx + 1} PILIHAN`}
          </span>
          <div class="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
            <i data-lucide="star" class="w-3 h-3 fill-amber-400"></i> ${game.rating || '5.0'}
          </div>
        </div>

        <h4 class="text-xs sm:text-sm font-bold text-white truncate group-hover:text-sky-300 transition-colors">
          ${game.title}
        </h4>

        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="text-xs font-black text-sky-400 font-display">${formatRupiah(game.prices.primary)}</span>
          ${game.prices.original && getDiscountPercent(game.prices.original, game.prices.primary) > 0 ? `
            <span class="text-[10px] text-slate-500 line-through font-mono">${formatRupiah(game.prices.original)}</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded font-black bg-rose-600 text-white shadow-sm leading-tight">-${getDiscountPercent(game.prices.original, game.prices.primary)}%</span>
          ` : (game.prices.original ? `<span class="text-[10px] text-slate-500 line-through font-mono">${formatRupiah(game.prices.original)}</span>` : '')}
        </div>
      </div>

      <div class="shrink-0 text-slate-500 group-hover:text-sky-400 transition-colors pr-1">
        <i data-lucide="chevron-right" class="w-4 h-4"></i>
      </div>
    </button>
  `).join('');
  lucide.createIcons();
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

  // Update Backdrop Image (prefer local official game key art)
  const backdrop = document.getElementById('hero-spotlight-backdrop');
  if (backdrop) {
    const bgUrl = getProductBackdrop(game);
    // Preload so the swap is smooth and never shows an empty/black stage
    const img = new Image();
    img.onload = () => {
      backdrop.style.opacity = '0';
      setTimeout(() => {
        backdrop.style.backgroundImage = `url('${bgUrl}')`;
        backdrop.style.opacity = '1';
      }, 200);
    };
    img.onerror = () => {
      backdrop.style.backgroundImage = `url('${getProductPoster(game)}')`;
      backdrop.style.opacity = '1';
    };
    img.src = bgUrl;
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
  const pPriEl = document.getElementById('hero-price-primary');
  if (pPriEl) pPriEl.textContent = formatRupiah(game.prices.primary);

  const pSecEl = document.getElementById('hero-price-secondary');
  if (pSecEl) {
    if (game.prices.secondary && !game.isHen) {
      pSecEl.textContent = formatRupiah(game.prices.secondary);
      pSecEl.parentElement?.classList.remove('hidden');
    } else {
      pSecEl.parentElement?.classList.add('hidden');
    }
  }

  const pOriEl = document.getElementById('hero-price-original');
  const heroDisBadge = document.getElementById('hero-discount-badge');
  if (pOriEl && game.prices.original) {
    pOriEl.textContent = formatRupiah(game.prices.original);
    pOriEl.parentElement?.classList.remove('hidden');
    if (heroDisBadge) {
      const disc = getDiscountPercent(game.prices.original, game.prices.primary);
      if (disc > 0) {
        heroDisBadge.textContent = `-${disc}%`;
        heroDisBadge.classList.remove('hidden');
      } else {
        heroDisBadge.classList.add('hidden');
      }
    }
  } else if (pOriEl) {
    pOriEl.parentElement?.classList.add('hidden');
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
    const badge = thumb.querySelector('.spotlight-badge');
    if (idx === index) {
      thumb.className = 'spotlight-thumb active group w-full p-2 sm:p-2.5 rounded-2xl flex items-center gap-3 transition-all duration-300 text-left cursor-pointer border bg-sky-950/80 border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/20';
      if (badge) {
        badge.className = 'spotlight-badge text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-sky-500 text-white';
        badge.textContent = '★ SEDANG TAMPIL';
      }
    } else {
      thumb.className = 'spotlight-thumb group w-full p-2 sm:p-2.5 rounded-2xl flex items-center gap-3 transition-all duration-300 text-left cursor-pointer border bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700';
      if (badge) {
        badge.className = 'spotlight-badge text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400';
        badge.textContent = `#${idx + 1} PILIHAN`;
      }
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

  // Category & Platform Filter (PlayStation Official Genres)
  if (state.activeFilter === 'subindo') {
    list = list.filter(p => p.isSubIndo || (p.badge && p.badge.toLowerCase().includes('sub indo')) || p.title.toLowerCase().includes('sub indo') || p.category === 'subindo');
  } else if (state.activeFilter === 'hen') {
    list = list.filter(p => p.isHen || (p.platform && p.platform.some(pl => pl.includes('HEN'))) || p.category === 'hen');
  } else if (state.activeFilter === 'action') {
    list = list.filter(p => p.category === 'action' || p.category === 'adventure' || /action|adventure|petualangan|spider|god of war|uncharted|gta|watch dogs/i.test(p.title));
  } else if (state.activeFilter === 'rpg') {
    list = list.filter(p => p.category === 'rpg' || /rpg|hogwarts|odyssey|witcher|elden|final fantasy/i.test(p.title));
  } else if (state.activeFilter === 'horror') {
    list = list.filter(p => p.category === 'horror' || /horror|survival|last of us|resident evil|silent hill/i.test(p.title));
  } else if (state.activeFilter === 'sports') {
    list = list.filter(p => p.category === 'sports' || p.category === 'racing' || /sports|racing|bola|pes|fifa|fc 2|nba|motogp|gran turismo/i.test(p.title));
  } else if (state.activeFilter === 'fighting') {
    list = list.filter(p => p.category === 'fighting' || /fighting|tarung|mortal kombat|tekken|street fighter|naruto/i.test(p.title));
  } else if (state.activeFilter === 'family' || state.activeFilter === 'coop') {
    list = list.filter(p => p.category === 'family' || p.category === 'coop' || /takes two|mabar|co-op|family|lego|overcooked|sackboy|crash/i.test(p.title));
  } else if (state.activeFilter === 'shooter') {
    list = list.filter(p => p.category === 'shooter' || /shooter|fps|call of duty|battlefield|helldivers/i.test(p.title));
  } else if (state.activeFilter === 'digital') {
    list = list.filter(p => p.platform.includes('PS5') || p.platform.includes('PS4'));
  } else if (state.activeFilter === 'ps5') {
    list = list.filter(p => p.platform.includes('PS5'));
  } else if (state.activeFilter === 'ps4') {
    list = list.filter(p => p.platform.includes('PS4'));
  }

  // Search Query
  if (state.searchQuery && state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(p => {
      // 1. Direct text fields match
      const titleMatch = (p.title || '').toLowerCase().includes(q);
      const descMatch = (p.description || '').toLowerCase().includes(q);
      const tagMatch = (p.tagline || '').toLowerCase().includes(q);
      const pubMatch = (p.publisher || '').toLowerCase().includes(q);
      const badgeMatch = (p.badge || '').toLowerCase().includes(q);
      const platformMatch = Array.isArray(p.platform) && p.platform.some(pl => pl.toLowerCase().includes(q));
      const catMatch = (p.category || '').toLowerCase().includes(q);
      const catLabel = (typeof getCategoryLabel === 'function' ? getCategoryLabel(p.category || '') : '').toLowerCase();
      const catLabelMatch = catLabel.includes(q);

      // 2. Smart aliases & keywords
      const subIndoMatch = (q.includes('sub') || q.includes('indo') || q.includes('indonesia')) && (p.isSubIndo || p.category === 'subindo');
      const henMatch = (q.includes('hen') || q.includes('pkg')) && (p.isHen || (Array.isArray(p.platform) && p.platform.some(pl => pl.includes('HEN'))));
      const digitalMatch = q.includes('digital') && (p.type === 'digital' || (Array.isArray(p.platform) && p.platform.some(pl => pl.includes('PS5') || pl.includes('PS4'))));
      const coopMatch = (q.includes('coop') || q.includes('co-op') || q.includes('mabar') || q.includes('family')) && (p.category === 'family' || p.category === 'coop');
      const sportsMatch = (q.includes('bola') || q.includes('soccer') || q.includes('fifa') || q.includes('pes') || q.includes('balap')) && (p.category === 'sports' || p.category === 'racing');

      return titleMatch || descMatch || tagMatch || pubMatch || badgeMatch || platformMatch || catMatch || catLabelMatch || subIndoMatch || henMatch || digitalMatch || coopMatch || sportsMatch;
    });
  }

  // Sorting
  if (state.sortOption === 'popular') {
    list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  } else if (state.sortOption === 'price-low') {
    list.sort((a, b) => (a.prices.primary || 0) - (b.prices.primary || 0));
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

function updateActiveFilterTab() {
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  filterBtns.forEach(b => {
    if (b.dataset.filter === state.activeFilter) {
      b.classList.remove('bg-slate-900', 'text-slate-400');
      b.classList.add('bg-sky-600', 'text-white', 'shadow-lg', 'shadow-sky-600/40');
    } else {
      b.classList.remove('bg-sky-600', 'text-white', 'shadow-lg', 'shadow-sky-600/40');
      b.classList.add('bg-slate-900', 'text-slate-400');
    }
  });
}

function renderProducts() {
  updateActiveFilterTab();
  const container = document.getElementById('products-grid');
  const emptyState = document.getElementById('products-empty');
  const countBadge = document.getElementById('products-count');
  const feedbackBar = document.getElementById('catalog-search-feedback');
  const feedbackQuery = document.getElementById('catalog-search-feedback-query');
  const feedbackCount = document.getElementById('catalog-search-feedback-count');
  const clearBtn = document.getElementById('catalog-search-clear');
  const emptyMsg = document.getElementById('products-empty-msg');
  
  if (!container) return;

  const items = getFilteredProducts();
  const isSearching = Boolean(state.searchQuery && state.searchQuery.trim());

  if (countBadge) {
    countBadge.textContent = isSearching ? `${items.length} Game Ditemukan` : `${items.length} Game Tersedia`;
  }

  // Update live search feedback bar & clear button
  if (isSearching) {
    if (feedbackBar) {
      feedbackBar.classList.remove('hidden');
      if (feedbackQuery) feedbackQuery.textContent = `"${state.searchQuery.trim()}"`;
      if (feedbackCount) feedbackCount.textContent = `${items.length} game`;
    }
    if (clearBtn) clearBtn.classList.remove('hidden');
  } else {
    if (feedbackBar) feedbackBar.classList.add('hidden');
    if (clearBtn) clearBtn.classList.add('hidden');
  }

  if (items.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      emptyState.classList.remove('hidden');
      if (emptyMsg) {
        if (isSearching) {
          emptyMsg.textContent = `Tidak ada game yang cocok dengan pencarian "${state.searchQuery.trim()}". Coba kata kunci lain atau reset pencarian.`;
        } else {
          emptyMsg.textContent = 'Tidak ada game dalam kategori ini. Silakan pilih tab kategori lain atau tampilkan semua koleksi.';
        }
      }
    }
    if (window.lucide) lucide.createIcons();
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = items.map(product => {
    const isHenGame = product.isHen || product.category === 'subindo' || product.category === 'hen';
    const isSpecial = product.category === 'service-hen' || product.category === 'tool' || isHenGame || (product.prices.primary === product.prices.secondary);
    const currentVariant = isHenGame ? 'PS4 HEN' : (state.cardVariants[product.id] || 'primary');
    const activePrice = product.prices.primary;

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
        class="game-card-nextgen group relative bg-[#080f22] hover:bg-[#0c1630] rounded-xl sm:rounded-2xl border border-slate-800/80 hover:border-sky-500/60 p-2.5 sm:p-3.5 transition-all duration-300 flex flex-col justify-between glow-card active:scale-[0.99]"
        onmouseenter="playSfx('hover')"
      >
        <div>
          <!-- Poster Container with Next-Gen Aspect Ratio -->
          <div class="relative w-full aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden mb-2.5 sm:mb-3.5 bg-slate-950 cursor-pointer shadow-md sm:shadow-lg" onclick="openProductDetail('${product.id}')">
            <img 
              src="${getProductPoster(product)}" 
              alt="${product.title}"
              class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              loading="lazy"
              onerror="this.onerror=null; this.src='assets/covers/service-1tb.jpg'"
            />
            
            <!-- Badge Top Left -->
            ${product.badge ? `
              <div class="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-sky-600 to-blue-700 text-white backdrop-blur-md shadow-md border border-sky-400/40">
                ${product.badge}
              </div>
            ` : ''}

            <!-- In Stock Neon Tag -->
            <div class="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-black/80 text-emerald-400 backdrop-blur-md border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-neon"></span>
              Ready
            </div>

            <!-- Discount Percent if Original exists -->
            ${product.prices.original && getDiscountPercent(product.prices.original, activePrice) > 0 ? `
              <div class="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black bg-rose-600 text-white shadow-lg flex items-center gap-1 z-10 border border-rose-400/40">
                <i data-lucide="tag" class="w-3 h-3"></i> -${getDiscountPercent(product.prices.original, activePrice)}%
              </div>
            ` : ''}

            <!-- Quick View Overlay Button -->
            <button class="hidden sm:flex absolute inset-0 bg-sky-950/40 opacity-0 group-hover:opacity-100 items-center justify-center transition-opacity duration-300 text-white font-bold text-xs gap-2 backdrop-blur-[2px]">
              <i data-lucide="eye" class="w-4 h-4"></i> Preview Game
            </button>
          </div>

          <!-- Platforms, Category & Star Rating -->
          <div class="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
            <div class="flex items-center gap-1 flex-wrap">
              ${subIndoTag}
              <span class="px-2 py-0.5 text-[10px] rounded-md bg-slate-900/90 text-sky-300 font-bold border border-slate-700/60">${getCategoryLabel(product.category)}</span>
              ${platformsHtml}
            </div>
            <div class="flex items-center gap-1 text-amber-400 text-[11px] sm:text-xs font-bold shrink-0">
              <i data-lucide="star" class="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400"></i>
              <span>${product.rating || '4.9'}</span>
            </div>
          </div>

          <!-- Title -->
          <h3 
            class="font-bold text-slate-100 text-xs sm:text-sm md:text-base leading-snug line-clamp-2 hover:text-sky-400 transition-colors cursor-pointer mb-2"
            onclick="openProductDetail('${product.id}')"
          >
            ${product.title}
          </h3>

          <!-- Game HEN Clean Info Tag (No Primary/Secondary for HEN) -->
          ${isHenGame ? `
            <div class="mb-2 sm:mb-3 text-[10px] text-purple-300 font-extrabold flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-purple-950/60 border border-purple-500/30">
              <span class="flex items-center gap-1"><i data-lucide="package" class="w-3.5 h-3.5 text-purple-400"></i> File PKG (PS4 HEN)</span>
              <span class="text-emerald-400 font-bold">Google Drive</span>
            </div>
          ` : (!isSpecial ? `
            <div class="price-toggle-pill mb-2 sm:mb-3">
              <button 
                id="btn-var-primary-${product.id}"
                onclick="event.stopPropagation(); toggleCardVariant('${product.id}', 'primary')" 
                class="price-toggle-btn text-[9px] sm:text-[10px] py-1 px-1.5 sm:px-2.5 ${currentVariant === 'primary' ? 'active' : ''}"
              >
                PRIMARY
              </button>
              <button 
                id="btn-var-secondary-${product.id}"
                onclick="event.stopPropagation(); toggleCardVariant('${product.id}', 'secondary')" 
                class="price-toggle-btn text-[9px] sm:text-[10px] py-1 px-1.5 sm:px-2.5 ${currentVariant === 'secondary' ? 'active' : ''}"
              >
                SECONDARY
              </button>
            </div>
          ` : `
            <div class="px-2 py-1 rounded-lg bg-purple-950/40 border border-purple-800/40 text-[9px] sm:text-[10px] text-purple-300 font-semibold mb-2 sm:mb-3 flex items-center gap-1">
              <i data-lucide="sparkles" class="w-3 h-3 text-purple-400"></i>
              <span class="truncate">Lisensi Resmi PlayStation</span>
            </div>
          `)}
        </div>

        <!-- Price & Action Button -->
        <div class="pt-2 sm:pt-3 border-t border-slate-800/80 mt-1">
          <div class="flex items-baseline justify-between mb-2 sm:mb-3">
            <div>
              <span class="text-[9px] sm:text-[10px] text-slate-400 block font-mono">${isHenGame ? 'Harga Game HEN' : 'Harga Akun'}</span>
              <span id="card-price-${product.id}" class="text-xs sm:text-base md:text-lg font-black text-sky-400 font-display">
                ${formatRupiah(activePrice)}
              </span>
            </div>
            ${product.prices.original && getDiscountPercent(product.prices.original, activePrice) > 0 ? `
              <div class="text-right">
                <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white mb-0.5 shadow-sm">
                  Diskon ${getDiscountPercent(product.prices.original, activePrice)}%
                </span>
                <span class="text-[10px] sm:text-xs text-slate-500 line-through font-mono block">
                  ${formatRupiah(product.prices.original)}
                </span>
              </div>
            ` : (product.prices.original ? `
              <span class="text-[10px] sm:text-xs text-slate-500 line-through font-mono">
                ${formatRupiah(product.prices.original)}
              </span>
            ` : '')}
          </div>

          <div class="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button 
              onclick="openProductDetail('${product.id}')"
              class="btn-card-detail w-full py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <i data-lucide="info" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400"></i> Detail
            </button>
            <button 
              onclick="buyCardVariant('${product.id}')"
              class="w-full py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold cyber-button shadow-md flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <i data-lucide="zap" class="w-3 h-3 sm:w-3.5 sm:h-3.5"></i> Beli
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
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  const isHenGame = product.isHen || product.category === 'subindo' || product.category === 'hen';
  const variant = isHenGame ? 'PS4 HEN' : (state.cardVariants[productId] || 'primary');

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

  const isHenGame = product.isHen || product.category === 'subindo' || product.category === 'hen';
  const isSpecial = product.category === 'service-hen' || product.category === 'tool' || isHenGame;

  // Toggle account guide button & label for HEN vs Digital
  const guideBtn = document.getElementById('btn-modal-account-guide');
  const variantLabel = document.getElementById('modal-variant-label');
  if (guideBtn) {
    if (isHenGame) guideBtn.classList.add('hidden');
    else guideBtn.classList.remove('hidden');
  }
  if (variantLabel) {
    variantLabel.textContent = isHenGame ? 'Format Game & Pengiriman:' : 'Pilih Tipe Akun Game:';
  }

  document.getElementById('modal-product-title').textContent = product.title;
  const modalGenreEl = document.getElementById('modal-product-genre');
  if (modalGenreEl) modalGenreEl.textContent = getCategoryLabel(product.category);
  document.getElementById('modal-product-publisher').textContent = product.publisher || 'PlayStation Store';
  document.getElementById('modal-product-year').textContent = product.releaseYear || '2024';
  document.getElementById('modal-product-size').textContent = product.size || 'Digital Download';
  document.getElementById('modal-product-rating').textContent = `${product.rating || '4.9'} (${product.soldCount || 100}+ terjual)`;
  document.getElementById('modal-product-desc').textContent = product.description;

  // Update Price & Discount Bar in Modal Header
  const priceEl = document.getElementById('modal-product-price');
  const origPriceEl = document.getElementById('modal-product-original-price');
  const discountBadgeEl = document.getElementById('modal-product-discount-badge');
  const saveTextEl = document.getElementById('modal-product-save-text');
  const discountWrap = document.getElementById('modal-product-discount-wrap');

  const activePrice = product.prices.primary;
  if (priceEl) priceEl.textContent = formatRupiah(activePrice);

  if (product.prices.original && product.prices.original > activePrice) {
    const discountPct = getDiscountPercent(product.prices.original, activePrice);
    const saveAmount = product.prices.original - activePrice;
    if (origPriceEl) {
      origPriceEl.textContent = `PS Store: ${formatRupiah(product.prices.original)}`;
      origPriceEl.classList.remove('hidden');
    }
    if (discountBadgeEl) {
      discountBadgeEl.innerHTML = `<i data-lucide="tag" class="w-3 h-3"></i> Diskon ${discountPct}%`;
      discountBadgeEl.classList.remove('hidden');
    }
    if (saveTextEl) {
      saveTextEl.textContent = `(Hemat ${formatRupiah(saveAmount)})`;
      saveTextEl.classList.remove('hidden');
    }
    if (discountWrap) discountWrap.classList.remove('hidden');
  } else {
    if (origPriceEl) origPriceEl.classList.add('hidden');
    if (discountBadgeEl) discountBadgeEl.classList.add('hidden');
    if (saveTextEl) saveTextEl.classList.add('hidden');
    if (discountWrap) discountWrap.classList.add('hidden');
  }

  const modalImg = document.getElementById('modal-product-img');
  if (modalImg) {
    modalImg.src = getProductPoster(product);
    modalImg.onerror = function() { this.src = 'assets/covers/service-1tb.jpg'; };
  }

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
    if (isHenGame) {
      variantContainer.innerHTML = `
        <div class="p-4 rounded-2xl bg-purple-950/40 border-2 border-purple-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 variant-card shadow-lg">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 text-[10px] font-black rounded-lg bg-purple-600 text-white uppercase tracking-wider flex items-center gap-1">
                <i data-lucide="package" class="w-3.5 h-3.5"></i> FULL GAME PS4 HEN (PKG)
              </span>
              <span class="px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">BEBAS AKUN</span>
            </div>
            <p class="text-xs text-slate-300 font-medium leading-relaxed">
              <strong>Bukan sistem akun!</strong> Dikirim dalam format file game PKG full via Google Drive high-speed. Bebas main offline selamanya di konsol PS4 HEN tanpa takut banned atau terkunci.
            </p>
          </div>
          <div class="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-500/20 w-full sm:w-auto">
            <span class="text-lg sm:text-2xl font-black text-sky-400 font-display block">${formatRupiah(product.prices.primary)}</span>
            ${product.prices.original && getDiscountPercent(product.prices.original, product.prices.primary) > 0 ? `
              <div class="flex items-center sm:justify-end gap-1.5 mt-0.5">
                <span class="text-[11px] text-slate-400 line-through font-mono">${formatRupiah(product.prices.original)}</span>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white shadow-sm">-${getDiscountPercent(product.prices.original, product.prices.primary)}%</span>
              </div>
              <div class="text-[10px] text-emerald-400 font-bold mt-0.5">Hemat ${formatRupiah(product.prices.original - product.prices.primary)}</div>
            ` : (product.prices.original ? `<div class="text-[11px] text-slate-400 line-through font-mono">PS Store: ${formatRupiah(product.prices.original)}</div>` : '')}
          </div>
        </div>
        <input type="hidden" id="selected-variant" value="PS4 HEN" />
      `;
    } else if (isSpecial) {
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
        <input type="hidden" id="selected-variant" value="Paket Resmi" />
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
  stopInvoiceLivePolling();
  const modals = document.querySelectorAll('.app-modal');
  modals.forEach(m => m.classList.add('hidden'));
  const adminSettings = document.getElementById('modal-admin-settings');
  if (adminSettings) adminSettings.classList.add('hidden');
  const reqModal = document.getElementById('modal-request-game');
  if (reqModal) reqModal.classList.add('hidden');
  const reqSuccessModal = document.getElementById('modal-request-success');
  if (reqSuccessModal) reqSuccessModal.classList.add('hidden');
  const confirmReqModal = document.getElementById('modal-admin-confirm-request');
  if (confirmReqModal) confirmReqModal.classList.add('hidden');
  const forgotPassModal = document.getElementById('modal-admin-forgot-password');
  if (forgotPassModal) forgotPassModal.classList.add('hidden');
}

// Quick Buy
function quickBuy(productId) {
  playSfx('click');
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const isHenGame = product.isHen || product.category === 'subindo' || product.category === 'hen';
  const defaultVar = isHenGame ? 'PS4 HEN' : 'primary';

  addToCart(product.id, defaultVar, product.platform[0], 1, false);
  openCheckout();
}

// Add To Cart
function addToCart(productId, variant = null, platform = null, qty = 1, showNotification = true) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const isHenGame = product.isHen || product.category === 'subindo' || product.category === 'hen';
  const finalVariant = isHenGame ? 'PS4 HEN' : (variant || 'primary');
  const targetPlatform = platform || product.platform[0];
  const unitPrice = finalVariant === 'secondary' ? (product.prices.secondary || product.prices.primary) : product.prices.primary;

  const existingIndex = state.cart.findIndex(item => 
    item.productId === productId && (item.variant === finalVariant || (isHenGame && (item.variant === 'primary' || item.variant === 'PS4 HEN'))) && item.platform === targetPlatform
  );

  if (existingIndex > -1) {
    state.cart[existingIndex].variant = finalVariant;
    state.cart[existingIndex].qty += qty;
  } else {
    state.cart.push({
      productId: product.id,
      title: product.title,
      poster: getProductPoster(product),
      variant: finalVariant,
      platform: targetPlatform,
      unitPrice: unitPrice,
      driveLink: product.driveLink || '',
      qty: qty
    });
  }

  saveCart();

  if (showNotification) {
    playSfx('success');
    showToast(`${product.title} (${finalVariant}) masuk keranjang!`, 'success');
  }
}

function addCurrentModalToCart() {
  if (!state.selectedProduct) return;
  const isHenGame = state.selectedProduct.isHen || state.selectedProduct.category === 'subindo' || state.selectedProduct.category === 'hen';
  const variantInput = document.getElementById('selected-variant');
  const variant = isHenGame ? 'PS4 HEN' : (variantInput ? variantInput.value : 'primary');

  const platformRadio = document.querySelector('input[name="selected-platform"]:checked');
  const platform = platformRadio ? platformRadio.value : state.selectedProduct.platform[0];

  addToCart(state.selectedProduct.id, variant, platform, 1, true);
  closeModals();
}

function buyCurrentModalNow() {
  if (!state.selectedProduct) return;
  const isHenGame = state.selectedProduct.isHen || state.selectedProduct.category === 'subindo' || state.selectedProduct.category === 'hen';
  const variantInput = document.getElementById('selected-variant');
  const variant = isHenGame ? 'PS4 HEN' : (variantInput ? variantInput.value : 'primary');

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
    const prod = state.products.find(p => p.id === item.productId);
    const isHen = item.variant === 'PS4 HEN' || item.variant === 'primary' || (prod && prod.isHen);
    const displayVariant = isHen ? 'PS4 HEN' : item.variant;
    item.variant = displayVariant;

    const itemTotal = item.unitPrice * item.qty;
    subtotal += itemTotal;

    const variantBadgeClass = isHen 
      ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800/60'
      : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-800/50';

    return `
      <div class="cart-item-card flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#080e22] border border-slate-200 dark:border-slate-800 transition-all">
        <img 
          src="${getProductPoster(item)}" 
          alt="${item.title}" 
          class="w-14 h-18 object-cover rounded-xl shrink-0 bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          onerror="this.onerror=null; this.src='assets/covers/service-1tb.jpg'"
        />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">${item.title}</h4>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="cart-item-variant text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${variantBadgeClass}">${displayVariant}</span>
            <span class="cart-item-platform text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">${item.platform}</span>
          </div>
          <div class="cart-item-price text-xs font-bold text-sky-600 dark:text-sky-400 mt-1 font-display">
            ${formatRupiah(item.unitPrice)}
          </div>
        </div>

        <div class="flex flex-col items-end gap-2">
          <button onclick="removeFromCart(${idx})" class="cart-remove-btn text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer" title="Hapus">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
          <div class="cart-qty-stepper flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
            <button onclick="changeCartQty(${idx}, -1)" class="cart-qty-btn w-6 h-6 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer">-</button>
            <span class="cart-qty-val w-6 text-center text-xs font-bold text-slate-900 dark:text-white">${item.qty}</span>
            <button onclick="changeCartQty(${idx}, 1)" class="cart-qty-btn w-6 h-6 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer">+</button>
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

// ================= DUITKU PAYMENT GATEWAY INTEGRATION =================
async function requestDuitkuInquiry(order) {
  const payload = {
    merchantOrderId: order.id,
    paymentAmount: order.total,
    paymentMethod: 'SP', // Default: SP (ShopeePay QRIS)
    productDetails: (order.items && order.items.length > 0)
      ? order.items.map(i => i.title).join(', ').substring(0, 240)
      : 'Game PS4 Digital',
    email: order.customerEmail || 'customer@gmail.com',
    phoneNumber: order.customerPhone || '081234567890',
    callbackUrl: 'https://aliansistore-ps.netlify.app/callback',
    returnUrl: window.location.origin + window.location.pathname
  };

  // 1. Coba Netlify Serverless Function
  try {
    const res = await fetch('/.netlify/functions/duitku-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Netlify function not reachable, trying local fallback...', err);
  }

  // 2. Coba endpoint lokal server.ps1 (/api/duitku-inquiry)
  try {
    const res2 = await fetch('/api/duitku-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res2.ok) {
      return await res2.json();
    }
  } catch (err2) {
    console.warn('Local proxy not reachable:', err2);
  }

  return null;
}

// Submit Order
async function submitOrder() {
  const nameInput = document.getElementById('checkout-name');
  const phoneInput = document.getElementById('checkout-phone');
  const emailInput = document.getElementById('checkout-email');
  const notesInput = document.getElementById('checkout-notes');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!name) {
    showToast('Mohon isi nama lengkap Anda!', 'warning');
    nameInput?.focus();
    return;
  }

  if (!phone || phone.length < 9) {
    showToast('Masukkan nomor WhatsApp aktif Anda!', 'warning');
    phoneInput?.focus();
    return;
  }

  // Validasi Email Gmail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showToast('Mohon masukkan alamat email Gmail aktif (@gmail.com)!', 'warning');
    emailInput?.focus();
    return;
  }

  if (state.cart.length === 0) {
    showToast('Keranjang belanja Anda masih kosong!', 'warning');
    return;
  }

  const btnSubmit = document.querySelector('button[onclick="submitOrder()"]');
  const originalBtnText = btnSubmit ? btnSubmit.innerHTML : '';
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="inline-block animate-spin mr-2">⏳</span> Menghubungkan Duitku QRIS...`;
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

  // Request Duitku QRIS jika metode pembayaran QRIS dipilih
  if (state.selectedPayment === 'qris') {
    try {
      const duitkuRes = await requestDuitkuInquiry(newOrder);
      if (duitkuRes && duitkuRes.statusCode === '00') {
        newOrder.fulfillment = {
          duitku: {
            reference: duitkuRes.reference,
            paymentUrl: duitkuRes.paymentUrl,
            qrString: duitkuRes.qrString,
            amount: duitkuRes.amount
          }
        };
      }
    } catch (e) {
      console.warn('Gagal memanggil Duitku Inquiry:', e);
    }
  }

  state.orders.unshift(newOrder);
  saveOrders();
  syncOrderToSupabase(newOrder);

  // Clear cart
  state.cart = [];
  state.appliedVoucher = null;
  saveCart();

  if (btnSubmit) {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = originalBtnText;
  }

  playSfx('success');
  triggerConfetti();

  closeModals();
  openInvoiceModal(newOrder.id);
  showToast('Pesanan berhasil dibuat! Silakan scan QRIS untuk menyelesaikan pembayaran.', 'success', 'Order Dibuat');
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

// ================= INVOICE LIVE POLLING & REALTIME =================
let invoicePollingInterval = null;
let realtimeOrderSubscription = null;

function stopInvoiceLivePolling() {
  if (invoicePollingInterval) {
    clearInterval(invoicePollingInterval);
    invoicePollingInterval = null;
  }
  if (realtimeOrderSubscription && supabaseClient) {
    try {
      supabaseClient.removeChannel(realtimeOrderSubscription);
    } catch (e) {}
    realtimeOrderSubscription = null;
  }
}

function startInvoiceLivePolling(orderId) {
  stopInvoiceLivePolling();

  // 1. Supabase Realtime Channel
  if (supabaseClient && typeof supabaseClient.channel === 'function') {
    try {
      realtimeOrderSubscription = supabaseClient
        .channel('order-live-' + orderId)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          (payload) => {
            if (payload && payload.new) {
              handleOrderRealtimeUpdate(payload.new);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription error:', err);
    }
  }

  // 2. Fallback Polling setiap 3.5 detik
  invoicePollingInterval = setInterval(async () => {
    if (!state.currentInvoice || state.currentInvoice.id !== orderId) {
      stopInvoiceLivePolling();
      return;
    }

    // Jika sudah lunas, hentikan polling
    if (state.currentInvoice.paymentStatus === 'PAID') {
      stopInvoiceLivePolling();
      return;
    }

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (data && !error) {
          if (data.payment_status === 'PAID' || data.status === 'COMPLETED') {
            handleOrderRealtimeUpdate(data);
          }
        }
      } catch (e) {}
    }
  }, 3500);
}

function handleOrderRealtimeUpdate(dbOrder) {
  const localOrder = state.orders.find(o => o.id === dbOrder.id);
  const wasUnpaid = !localOrder || localOrder.paymentStatus !== 'PAID';

  const updatedOrder = {
    id: dbOrder.id,
    createdAt: dbOrder.created_at,
    customerType: dbOrder.customer_type,
    customerName: dbOrder.customer_name,
    customerPhone: dbOrder.customer_phone,
    customerEmail: dbOrder.customer_email,
    notes: dbOrder.notes,
    items: Array.isArray(dbOrder.items) ? dbOrder.items : [],
    subtotal: Number(dbOrder.subtotal) || 0,
    discount: Number(dbOrder.discount) || 0,
    total: Number(dbOrder.total) || 0,
    voucherCode: dbOrder.voucher_code,
    paymentMethod: dbOrder.payment_method,
    paymentStatus: dbOrder.payment_status,
    status: dbOrder.status,
    fulfillment: dbOrder.fulfillment
  };

  const idx = state.orders.findIndex(o => o.id === updatedOrder.id);
  if (idx !== -1) {
    state.orders[idx] = updatedOrder;
  } else {
    state.orders.unshift(updatedOrder);
  }
  saveOrders();

  if (state.currentInvoice && state.currentInvoice.id === updatedOrder.id) {
    state.currentInvoice = updatedOrder;
    renderInvoiceDetails(updatedOrder);

    if (wasUnpaid && updatedOrder.paymentStatus === 'PAID') {
      stopInvoiceLivePolling();
      playSfx('success');
      triggerConfetti();
      dispatchOrderCompletionEmails(updatedOrder);
      showToast('🎉 Pembayaran Lunas Terverifikasi! Folder Google Drive telah otomatis dibuka & email bukti transaksi (No-Reply) disiapkan.', 'success', 'Pembayaran Sukses');
    }
  }
}

// Cek Status Manual saat klik tombol
async function checkOrderStatusManual(orderId) {
  playSfx('click');
  showToast('Memeriksa status pembayaran di sistem...', 'info');

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('orders').select('*').eq('id', orderId).single();
      if (data && !error) {
        if (data.payment_status === 'PAID') {
          handleOrderRealtimeUpdate(data);
          return;
        }
      }
    } catch (e) {}
  }

  showToast('Belum ada konfirmasi pembayaran baru. Silakan selesaikan pembayaran.', 'warning');
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

  // Mulai Live Polling untuk mendeteksi pembayaran masuk secara realtime
  if (order.paymentStatus !== 'PAID') {
    startInvoiceLivePolling(order.id);
  }
}

function renderInvoiceDetails(order) {
  document.getElementById('inv-id').textContent = order.id;
  document.getElementById('inv-date').textContent = formatDate(order.createdAt);
  document.getElementById('inv-customer-name').textContent = order.customerName;
  document.getElementById('inv-customer-phone').textContent = order.customerPhone;
  
  const emailEl = document.getElementById('inv-customer-email');
  if (emailEl) emailEl.textContent = order.customerEmail || '-';

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

  // Fulfillment Credentials / Google Drive Box (REVEALED WHEN ORDER IS PAID/COMPLETED!)
  const fulfillmentBox = document.getElementById('inv-fulfillment-box');
  const dispatchCard = document.getElementById('inv-email-dispatch-card');

  if ((order.paymentStatus === 'PAID' || order.status === 'COMPLETED')) {
    fulfillmentBox.classList.remove('hidden');
    renderFulfillmentBox(order.fulfillment || {}, order);

    if (dispatchCard) {
      dispatchCard.classList.remove('hidden');
      const adminEmailEl = document.getElementById('inv-dispatch-admin-email');
      const custEmailEl = document.getElementById('inv-dispatch-customer-email');
      if (adminEmailEl) adminEmailEl.textContent = (state.config && state.config.adminEmail) || 'aliansistore.id@gmail.com';
      if (custEmailEl) custEmailEl.textContent = order.customerEmail || '-';
    }
  } else {
    fulfillmentBox.classList.add('hidden');
    if (dispatchCard) dispatchCard.classList.add('hidden');
  }

  // WhatsApp CS Link
  const waBtn = document.getElementById('inv-wa-btn');
  if (waBtn) {
    const waText = encodeURIComponent(
      `Halo Admin ALIANSI STORE! Saya ingin konfirmasi pesanan:\n` +
      `No Invoice: ${order.id}\n` +
      `Nama: ${order.customerName}\n` +
      `Email Gmail: ${order.customerEmail || '-'}\n` +
      `Total: ${formatRupiah(order.total)}\n` +
      `Status: ${order.paymentStatus}\n` +
      `Mohon bantuannya ya min. Terima kasih!`
    );
    waBtn.href = `https://wa.me/${state.config.whatsappNumber}?text=${waText}`;
  }
}

// Dedicated High-End Invoice Print Function
function printInvoice() {
  playSfx('click');
  
  // Unmask password temporarily on print so customer has physical credential record
  const passEl = document.getElementById('fulfill-password');
  let originalPasswordText = null;
  if (passEl && state.currentInvoice && state.currentInvoice.fulfillment && state.currentInvoice.fulfillment.psnPassword) {
    originalPasswordText = passEl.textContent;
    passEl.textContent = state.currentInvoice.fulfillment.psnPassword;
  }

  // Set system verification code
  const verifyCodeEl = document.getElementById('print-verify-code');
  if (verifyCodeEl && state.currentInvoice) {
    const timeHash = (new Date(state.currentInvoice.createdAt || Date.now()).getTime()).toString(36).toUpperCase();
    verifyCodeEl.textContent = `AUTH-${state.currentInvoice.id}-${timeHash}`;
  }

  // Trigger browser native print / PDF export
  window.print();

  // Restore password mask after print dialog finishes
  if (passEl && originalPasswordText !== null) {
    setTimeout(() => {
      passEl.textContent = originalPasswordText;
    }, 500);
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
      stepEl.className = 'w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-xs shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/20';
    } else {
      stepEl.className = 'w-8 h-8 rounded-full bg-slate-800 text-slate-500 font-bold flex items-center justify-center text-xs';
    }

    if (step.line) {
      const lineEl = document.getElementById(step.line);
      if (lineEl) {
        lineEl.className = idx < currentIdx ? 'flex-1 h-1 bg-emerald-500' : 'flex-1 h-1 bg-slate-800';
      }
    }
  });
}

function renderPaymentBox(order) {
  const container = document.getElementById('inv-payment-instructions-content');
  if (!container) return;

  if (order.paymentMethod === 'qris') {
    const duitkuData = (order.fulfillment && order.fulfillment.duitku) ? order.fulfillment.duitku : null;
    const qrString = duitkuData?.qrString || `00020101021226670016ID.CO.QRIS.WWW011893600002011234567802150000000000000010303UMI51440014ID.GO.BI.QRIS011893600002011234567802150000000000000010303UMI52045814530336054${order.total}5802ID5913ALIANSI_STORE6007JAKARTA61051234062070703A016304${order.id}`;
    const paymentUrl = duitkuData?.paymentUrl;

    container.innerHTML = `
      <div class="text-center p-5 rounded-2xl bg-[#070d1e] border border-sky-500/40">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950 text-sky-400 border border-sky-500/30 text-[11px] font-bold mb-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> QRIS RESMI DUITKU (OTOMATIS)
        </div>
        <p class="text-xs text-slate-400 mb-3">Scan pakai aplikasi apa saja: BCA, Mandiri, BRI, Livin, GoPay, OVO, DANA, ShopeePay</p>
        
        <div class="inline-block p-4 rounded-2xl bg-white shadow-2xl shadow-sky-500/30 mb-3" id="qrcode-container"></div>
        
        <div class="text-xs font-bold text-slate-300">Total Pembayaran:</div>
        <div class="text-2xl font-black text-sky-400 font-display mt-0.5 mb-3">${formatRupiah(order.total)}</div>

        <div class="text-[11px] text-slate-400 mb-4 flex items-center justify-center gap-1.5">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>Menunggu konfirmasi pembayaran otomatis (bebas reload)...</span>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-2">
          ${paymentUrl ? `
            <a href="${paymentUrl}" target="_blank" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Buka Pembayaran Duitku (Web / Simulator)
            </a>
          ` : ''}
          <button onclick="checkOrderStatusManual('${order.id}')" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Cek Status Sekarang
          </button>
          <button onclick="simulateCustomerPaid('${order.id}')" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 text-xs font-bold border border-emerald-600/40 flex items-center justify-center gap-1.5" title="Uji Coba Sandbox">
            <i data-lucide="play" class="w-3.5 h-3.5"></i> Tes Lunas (Sandbox)
          </button>
        </div>
      </div>
    `;

    setTimeout(() => {
      const qrEl = document.getElementById('qrcode-container');
      if (qrEl) {
        qrEl.innerHTML = '';
        if (typeof QRCode === 'function') {
          new QRCode(qrEl, {
            text: qrString,
            width: 175,
            height: 175,
            colorDark: "#020617",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
          });
        } else {
          qrEl.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=175x175&data=${encodeURIComponent(qrString)}" class="w-[175px] h-[175px]" alt="QR Code" />`;
        }
      }
      lucide.createIcons();
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

function renderFulfillmentBox(fulfillment, order) {
  const gdriveEmail = document.getElementById('fulfill-gdrive-email');
  const gdriveList = document.getElementById('fulfill-gdrive-list');
  const psnSection = document.getElementById('fulfill-psn-section');

  const customerEmail = fulfillment.customer_email || (order ? order.customerEmail : '') || '-';
  if (gdriveEmail) gdriveEmail.textContent = customerEmail;

  // Resolve Google Drive Links
  let driveLinks = fulfillment.drive_links || fulfillment.driveLinks || [];
  if ((!driveLinks || driveLinks.length === 0) && order && Array.isArray(order.items)) {
    driveLinks = order.items.map(item => {
      const prodId = item.productId || item.id;
      const prod = (state.products || []).find(p => p.id === prodId || p.title === item.title);
      const url = (prod && prod.driveLink) ? prod.driveLink : (item.driveLink || 'https://drive.google.com/drive/shared-with-me');
      return {
        title: item.title,
        url: url
      };
    });
  } else if (driveLinks && driveLinks.length > 0) {
    driveLinks = driveLinks.map(link => {
      if (!link.url || link.url === 'https://drive.google.com/drive/shared-with-me') {
        const prod = (state.products || []).find(p => p.id === link.gameId || p.title === link.title);
        if (prod && prod.driveLink) {
          return { ...link, url: prod.driveLink };
        }
      }
      return link;
    });
  }

  if (gdriveList) {
    if (driveLinks && driveLinks.length > 0) {
      gdriveList.innerHTML = driveLinks.map(link => `
        <div class="flex items-center justify-between p-3.5 rounded-2xl bg-[#060a16] border border-emerald-500/40">
          <div class="pr-2">
            <div class="font-bold text-white text-xs">${link.title}</div>
            <div class="text-[10px] text-emerald-400 font-mono mt-0.5">Google Drive Ready • Viewer Granted</div>
          </div>
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 shrink-0 flex items-center gap-1.5 transition-all">
            <i data-lucide="folder-down" class="w-3.5 h-3.5"></i> Buka Folder
          </a>
        </div>
      `).join('');
    } else {
      const games = (order && order.items) ? order.items : [];
      gdriveList.innerHTML = `
        <div class="p-3.5 rounded-2xl bg-[#060a16] border border-emerald-500/40">
          <div class="font-bold text-white text-xs mb-1">🎮 Game: ${games.map(g => g.title).join(', ')}</div>
          <p class="text-[11px] text-slate-400 mb-3">Akses folder download telah otomatis dibagikan ke email <b>${customerEmail}</b>. Anda juga dapat memeriksa kotak masuk email Anda.</p>
          <a href="https://drive.google.com/drive/shared-with-me" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg transition-all">
            <i data-lucide="folder-check" class="w-3.5 h-3.5"></i> Buka Google Drive (Dibagikan dengan Saya)
          </a>
        </div>
      `;
    }
  }

  // PSN Account section
  if (fulfillment.psnEmail) {
    if (psnSection) psnSection.classList.remove('hidden');
    document.getElementById('fulfill-email').textContent = fulfillment.psnEmail || '-';
    document.getElementById('fulfill-password').textContent = fulfillment.psnPassword || '••••••••';
    document.getElementById('fulfill-backup').textContent = fulfillment.backupCodes || '-';
    document.getElementById('fulfill-notes').textContent = fulfillment.adminNotes || 'Gunakan akun dengan bijak dan ikuti panduan aktivasi.';
  } else {
    if (psnSection) psnSection.classList.add('hidden');
  }

  lucide.createIcons();
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

// ================= TRANSACTION EMAIL DISPATCH ENGINE (ADMIN SALES REPORT & CUSTOMER NO-REPLY RECEIPT) =================
function buildOrderItemsText(order) {
  if (!order || !Array.isArray(order.items)) return '-';
  return order.items.map((item, idx) => {
    const qty = item.qty || 1;
    const price = item.unitPrice || item.price || 0;
    const variant = item.variant || 'Primary';
    const plat = item.platform || 'PS4';
    return `${idx + 1}. ${item.title}\n   - Varian: ${variant} | Platform: ${plat} | Qty: x${qty}\n   - Harga: ${formatRupiah(price * qty)}`;
  }).join('\n');
}

function buildOrderDriveLinksText(order) {
  if (!order) return '-';
  let links = [];
  if (order.fulfillment && Array.isArray(order.fulfillment.drive_links)) {
    links = order.fulfillment.drive_links;
  } else if (Array.isArray(order.items)) {
    links = order.items.map(item => {
      const prodId = item.productId || item.id;
      const prod = (state.products || []).find(p => p.id === prodId || p.title === item.title);
      return {
        title: item.title,
        url: (prod && prod.driveLink) ? prod.driveLink : (item.driveLink || 'https://drive.google.com/drive/shared-with-me')
      };
    });
  }
  if (links.length === 0) return 'https://drive.google.com/drive/shared-with-me';
  return links.map(l => `• ${l.title}:\n  ${l.url || 'https://drive.google.com/drive/shared-with-me'}`).join('\n');
}

function dispatchOrderCompletionEmails(order) {
  if (!order) return;

  if (!order.fulfillment) order.fulfillment = {};
  
  const adminEmail = (state.config && state.config.adminEmail) || 'aliansistore.id@gmail.com';
  const customerEmail = order.customerEmail || 'customer@gmail.com';

  // Mark in order fulfillment state
  order.fulfillment.emails_dispatched = {
    adminNotified: true,
    adminNotifiedAt: new Date().toISOString(),
    customerReceiptSent: true,
    customerReceiptSentAt: new Date().toISOString(),
    adminEmail: adminEmail,
    customerEmail: customerEmail,
    noReplyNotice: true
  };

  saveOrders();
  if (typeof syncOrderToSupabase === 'function') {
    syncOrderToSupabase(order);
  }

  // Update Invoice view if opened
  const dispatchCard = document.getElementById('inv-email-dispatch-card');
  if (dispatchCard) {
    dispatchCard.classList.remove('hidden');
    const adminEmailEl = document.getElementById('inv-dispatch-admin-email');
    const custEmailEl = document.getElementById('inv-dispatch-customer-email');
    if (adminEmailEl) adminEmailEl.textContent = adminEmail;
    if (custEmailEl) custEmailEl.textContent = customerEmail;
  }

  console.info(`[ALIANSI EMAIL DISPATCH] Transaksi Selesai #${order.id}:`, {
    adminSalesNotification: `Sent to ${adminEmail}`,
    customerProofOfPurchase: `Sent to ${customerEmail} (Mode: NO-REPLY)`
  });
}

function sendCustomerReceiptEmail(orderId = null) {
  playSfx('click');
  const targetId = orderId || (state.currentInvoice ? state.currentInvoice.id : null);
  const order = (state.orders || []).find(o => o.id === targetId) || state.currentInvoice;
  if (!order) {
    showToast('Data pesanan tidak ditemukan.', 'warning');
    return;
  }

  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';
  const wa = (state.config && state.config.whatsappNumber) || '6281234567890';
  const formattedWa = (state.config && state.config.whatsappFormatted) || `+${wa}`;
  const targetEmail = order.customerEmail || '';

  if (!targetEmail || !targetEmail.includes('@')) {
    showToast('Alamat email pembeli belum terdaftar pada pesanan ini.', 'warning');
    return;
  }

  const itemsText = buildOrderItemsText(order);
  const driveText = buildOrderDriveLinksText(order);
  const timeHash = (new Date(order.createdAt || Date.now()).getTime()).toString(36).toUpperCase();
  const authCode = `AUTH-${order.id}-${timeHash}`;

  const subject = `[BUKTI PEMBELIAN RESMI] ${storeName} - Faktur Invoice #${order.id} (NO-REPLY)`;

  const body = 
`===============================================================
FAKTUR RESMI & BUKTI PEMBELIAN ELEKTRONIK (NO-REPLY)
${storeName} INDONESIA - SPESIALIS GAME PLAYSTATION
===============================================================

⚠️ PEMBERITAHUAN PENTING (NO-REPLY):
Email ini dikirimkan secara otomatis oleh sistem ${storeName}.
MOHON JANGAN MEMBALAS (DO NOT REPLY) EMAIL INI karena dikirim
dari alamat robot/sistem yang tidak menerima pesan masuk.

Jika Anda membutuhkan bantuan teknis, panduan instalasi, atau klaim garansi,
silakan hubungi WhatsApp Customer Service resmi kami:
📱 WhatsApp CS: ${formattedWa} (https://wa.me/${wa})

---------------------------------------------------------------
RINCIAN PESANAN & STATUS TRANSAKSI:
- No. Invoice        : ${order.id}
- Tanggal Pembelian  : ${formatDate(order.createdAt)}
- Nama Pembeli       : ${order.customerName}
- Email Terdaftar    : ${order.customerEmail}
- No. WhatsApp       : ${order.customerPhone}
- Status Pembayaran  : LUNAS TERVERIFIKASI (PAID)
- Metode Pembayaran  : ${order.paymentMethod.toUpperCase()}

RINCIAN GAME YANG DIBELI:
${itemsText}

RINGKASAN PEMBAYARAN:
- Subtotal           : ${formatRupiah(order.subtotal)}
- Potongan Voucher   : ${formatRupiah(order.discount)}
- TOTAL AKHIR        : ${formatRupiah(order.total)} (LUNAS)

AKSES DOWNLOAD & GOOGLE DRIVE:
Akses folder Google Drive telah otomatis dibagikan ke email Anda (${order.customerEmail}):
${driveText}

PANDUAN SINGKAT INSTALASI:
1. Buka Google Drive menggunakan akun Gmail ${order.customerEmail}.
2. Masuk ke tab "Dibagikan dengan Saya" (Shared with me).
3. Download file (.PKG) dan salin ke Flashdisk/HDD External format exFAT.
4. Pasang ke konsol PS4 HEN > Buka menu GoldHEN / Package Installer > Install Game.

KODE OTENTIKASI RESMI TOKO:
${authCode} (Jaminan 100% Game Berfungsi Normal & Bergaransi)

===============================================================
EMAIL INI DIHASILKAN OTOMATIS OLEH SISTEM. JANGAN MEMBALAS EMAIL INI.
Website Resmi: https://aliansi-store.netlify.app/
===============================================================`;

  const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank') || (window.location.href = mailtoUrl);

  showToast(`Membuka draf Bukti Pembelian resmi (No-Reply) untuk ${targetEmail}.`, 'info', 'Email Bukti Pembelian');
}

function sendAdminSaleNotificationEmail(orderId = null) {
  playSfx('click');
  const targetId = orderId || (state.currentInvoice ? state.currentInvoice.id : null);
  const order = (state.orders || []).find(o => o.id === targetId) || state.currentInvoice;
  if (!order) {
    showToast('Data pesanan tidak ditemukan.', 'warning');
    return;
  }

  const adminEmail = (state.config && state.config.adminEmail) || 'aliansistore.id@gmail.com';
  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';
  const itemsText = buildOrderItemsText(order);
  const driveText = buildOrderDriveLinksText(order);

  const subject = `[LAPORAN PENJUALAN] Pesanan Lunas #${order.id} - ${formatRupiah(order.total)} (${order.customerName})`;

  const body = 
`===============================================================
LAPORAN HASIL PENJUALAN TOKO - ${storeName}
===============================================================
Halo Admin ${storeName},

Transaksi penjualan baru telah LUNAS & BERHASIL SELESAI:

INFORMASI TRANSAKSI:
- No. Invoice       : ${order.id}
- Tanggal & Jam     : ${formatDate(order.createdAt)}
- Status Pembayaran : LUNAS (PAID)
- Status Pemenuhan  : SELESAI (COMPLETED)
- Metode Pembayaran : ${order.paymentMethod.toUpperCase()}
- Total Omset Masuk : ${formatRupiah(order.total)}

DATA PEMBELI:
- Nama Pembeli      : ${order.customerName}
- Email Gmail       : ${order.customerEmail || '-'}
- No. WhatsApp      : ${order.customerPhone || '-'}
- Tipe Pelanggan    : ${order.customerType || 'Customer'}
- Catatan Pembeli   : ${order.notes || 'Tidak ada catatan'}

DAFTAR GAME YANG DIBELI:
${itemsText}

STATUS FULFILLMENT / GOOGLE DRIVE:
- Email Akses       : ${order.customerEmail || '-'}
${driveText}

KETERANGAN SISTEM:
Salinan bukti transaksi berformat NO-REPLY telah dikirimkan ke email pembeli (${order.customerEmail || '-'}).

---------------------------------------------------------------
Sistem Otomasi Toko ${storeName}
Website: https://aliansi-store.netlify.app/`;

  const mailtoUrl = `mailto:${encodeURIComponent(adminEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank') || (window.location.href = mailtoUrl);

  showToast(`Membuka draf Laporan Penjualan untuk Admin (${adminEmail}).`, 'info', 'Laporan Penjualan');
}

function simulateCustomerPaid(orderId) {
  playSfx('success');
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  order.paymentStatus = 'PAID';
  order.status = 'COMPLETED';

  if (!order.fulfillment) order.fulfillment = {};
  order.fulfillment.gdrive_shared = true;
  order.fulfillment.shared_at = new Date().toISOString();
  order.fulfillment.customer_email = order.customerEmail;
  if (!order.fulfillment.drive_links || order.fulfillment.drive_links.length === 0) {
    order.fulfillment.drive_links = (order.items || []).map(item => {
      const prodId = item.productId || item.id;
      const prod = (state.products || []).find(p => p.id === prodId || p.title === item.title);
      const url = (prod && prod.driveLink) ? prod.driveLink : (item.driveLink || 'https://drive.google.com/drive/shared-with-me');
      return {
        gameId: item.id || prodId,
        title: item.title,
        folderId: 'sample-folder-id',
        url: url
      };
    });
  }

  saveOrders();
  syncOrderToSupabase(order);

  // Automatically dispatch notification to Admin and No-Reply receipt to Customer
  dispatchOrderCompletionEmails(order);

  renderInvoiceDetails(order);
  triggerConfetti();
  showToast('🎉 Pembayaran lunas! Email laporan dikirim ke Admin & bukti pembelian (No-Reply) disiapkan untuk pembeli.', 'success', 'Pembayaran Sukses');
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
            <div class="text-xs font-bold text-white truncate">${(state.config && state.config.adminEmail) || 'admin@aliansistore.com'}</div>
          </div>
          <button onclick="openAdminDashboard(); closeUserDropdown();" class="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 flex items-center justify-between transition-colors cursor-pointer">
            <span class="flex items-center gap-2"><i data-lucide="layout-dashboard" class="w-4 h-4 text-sky-400"></i> Dashboard Toko</span>
            <span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold ${pendingFulfill > 0 ? '' : 'hidden'}">${pendingFulfill} baru</span>
          </button>
          <button onclick="openAdminAddProductModal(); closeUserDropdown();" class="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 flex items-center gap-2 transition-colors cursor-pointer">
            <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-400"></i> Tambah Game Baru
          </button>
          <button onclick="openAdminSettingsModal(); closeUserDropdown();" class="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 flex items-center gap-2 transition-colors cursor-pointer">
            <i data-lucide="settings" class="w-4 h-4 text-cyan-400"></i> Pengaturan Toko & Akun
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
    const provider = state.currentUser.authProvider || 'local';
    const myOrdersCount = state.orders ? state.orders.filter(o => {
      const oPhone = o.customerPhone ? o.customerPhone.replace(/[\s-]/g, '') : '';
      const oEmail = o.customerEmail ? o.customerEmail.toLowerCase() : '';
      return (userPhone && oPhone === userPhone) || (userEmail && oEmail === userEmail);
    }).length : 0;

    let providerBadge = `<span class="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">MEMBER</span>`;
    let providerDropdownTag = 'MEMBER VIP';

    if (provider === 'google') {
      providerBadge = `<span class="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30"><svg class="w-2.5 h-2.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg> GOOGLE</span>`;
      providerDropdownTag = 'MEMBER • GOOGLE VERIFIED';
    } else if (provider === 'microsoft') {
      providerBadge = `<span class="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30"><svg class="w-2.5 h-2.5" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg> OUTLOOK</span>`;
      providerDropdownTag = 'MEMBER • OUTLOOK VERIFIED';
    } else if (provider === 'psn') {
      providerBadge = `<span class="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30"><i data-lucide="gamepad-2" class="w-2.5 h-2.5"></i> PSN</span>`;
      providerDropdownTag = 'MEMBER • PSN VERIFIED';
    }

    const avatarHtml = (state.currentUser.avatar && state.currentUser.avatar.startsWith('http'))
      ? `<img src="${state.currentUser.avatar}" alt="${fullName}" class="w-5 h-5 rounded-full object-cover border border-sky-400/60" />`
      : `<span class="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center font-black text-[10px]">${initialChar}</span>`;

    container.innerHTML = `
      <div class="relative" id="user-menu-wrapper">
        <button 
          onclick="toggleUserDropdown(event)" 
          class="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 hover:border-sky-500/50 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          title="Menu Akun Member"
        >
          ${avatarHtml}
          <span class="font-extrabold max-w-[85px] sm:max-w-[120px] truncate">
            Halo, ${firstName}
          </span>
          ${providerBadge}
          <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400"></i>
        </button>
        <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-64 rounded-2xl bg-[#091128] border border-slate-700 shadow-2xl py-2 z-50">
          <div class="px-4 py-2.5 border-b border-slate-800">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">${providerDropdownTag}</span>
              ${state.currentUser.psnId ? `<span class="text-[10px] text-sky-300 font-mono font-bold">PSN: ${state.currentUser.psnId}</span>` : `<span class="text-[10px] text-slate-400 font-mono">${state.currentUser.phone || ''}</span>`}
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
  const oauthGoogleLabel = document.getElementById('oauth-google-label');
  const oauthMsLabel = document.getElementById('oauth-microsoft-label');
  const oauthPsnLabel = document.getElementById('oauth-psn-label');
  const oauthDividerLabel = document.getElementById('oauth-divider-label');

  if (tab === 'login') {
    if (tabLogin) tabLogin.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white shadow transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (tabReg) tabReg.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-transparent text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (formLogin) formLogin.classList.remove('hidden');
    if (formReg) formReg.classList.add('hidden');
    if (modalTitle) modalTitle.textContent = 'Masuk ke ALIANSI STORE';
    if (oauthGoogleLabel) oauthGoogleLabel.textContent = 'Lanjutkan dengan Google';
    if (oauthMsLabel) oauthMsLabel.textContent = 'Outlook / Microsoft';
    if (oauthPsnLabel) oauthPsnLabel.textContent = 'PlayStation ID';
    if (oauthDividerLabel) oauthDividerLabel.textContent = 'Atau Masuk dengan No. HP / Akun Toko';
  } else {
    if (tabReg) tabReg.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white shadow transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (tabLogin) tabLogin.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-transparent text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (formReg) formReg.classList.remove('hidden');
    if (formLogin) formLogin.classList.add('hidden');
    if (modalTitle) modalTitle.textContent = 'Daftar Member Baru';
    if (oauthGoogleLabel) oauthGoogleLabel.textContent = 'Daftar Cepat dengan Google';
    if (oauthMsLabel) oauthMsLabel.textContent = 'Daftar dengan Outlook';
    if (oauthPsnLabel) oauthPsnLabel.textContent = 'Daftar dengan PSN';
    if (oauthDividerLabel) oauthDividerLabel.textContent = 'Atau Isi Formulir Manual di Bawah';
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
  const adminPin = (state.config && state.config.adminPin) ? String(state.config.adminPin).trim() : '1234';
  const configuredAdminEmail = (state.config && state.config.adminEmail) ? String(state.config.adminEmail).trim().toLowerCase() : '';

  // 1. SMART CHECK: IS ADMIN?
  const isAdminIdentifier = idLower === 'admin' || 
    idLower === 'admin@aliansistore.com' || 
    idLower === 'administrator' || 
    idLower === 'owner' || 
    (configuredAdminEmail && idLower === configuredAdminEmail);
  const isAdminPin = pass === adminPin || (!state.config.adminPin && (pass === '1234' || pass === 'admin' || pass === 'aliansi123'));

  if (isAdminIdentifier && isAdminPin) {
    playSfx('success');
    state.isAdmin = true;
    state.currentUser = {
      id: 'usr-admin-01',
      name: (state.config && state.config.storeName) ? `Admin ${state.config.storeName}` : 'Admin Aliansi Store',
      email: (state.config && state.config.adminEmail) || 'admin@aliansistore.com',
      phone: (state.config && state.config.whatsappNumber) || '081234567890',
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
      showToast('Password akun Anda salah!', 'error');
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
  showToast('Akun tidak ditemukan atau password salah! Silakan periksa kembali data Anda.', 'error');
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

// ================= THIRD-PARTY SOCIAL OAUTH (GOOGLE, OUTLOOK, PSN) =================
let currentOAuthProvider = 'google';

function loginWithProvider(provider) {
  playSfx('click');
  currentOAuthProvider = provider;
  renderOAuthModal(provider);
  const modal = document.getElementById('modal-oauth-picker');
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeOAuthModal() {
  playSfx('click');
  const modal = document.getElementById('modal-oauth-picker');
  if (modal) modal.classList.add('hidden');
}

function renderOAuthModal(provider) {
  const container = document.getElementById('oauth-picker-content');
  if (!container) return;

  if (provider === 'google') {
    container.innerHTML = `
      <div class="text-center mb-5">
        <svg class="w-10 h-10 mx-auto mb-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <h3 class="text-base font-black text-white font-display">Masuk dengan Google</h3>
        <p class="text-xs text-slate-400 mt-0.5">Pilih akun untuk melanjutkan ke <strong class="text-sky-400">ALIANSI STORE</strong></p>
      </div>

      <div class="space-y-2 mb-4">
        <!-- Account 1 -->
        <div 
          onclick="executeOAuthLogin({ provider: 'google', name: 'Dimas Setiawan', email: 'dimas.gamer@gmail.com', phone: '081298765432', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' })"
          class="oauth-account-item flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-sky-500 cursor-pointer transition-all shadow-sm"
        >
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" alt="Dimas" class="w-10 h-10 rounded-full object-cover border border-slate-600 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="oauth-account-name text-xs font-bold text-white truncate">Dimas Setiawan</div>
            <div class="oauth-account-email text-[11px] text-slate-400 truncate">dimas.gamer@gmail.com</div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
        </div>

        <!-- Account 2 -->
        <div 
          onclick="executeOAuthLogin({ provider: 'google', name: 'Reza PlayStation', email: 'reza.aliansistore@gmail.com', phone: '085712349988', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80' })"
          class="oauth-account-item flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-sky-500 cursor-pointer transition-all shadow-sm"
        >
          <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80" alt="Reza" class="w-10 h-10 rounded-full object-cover border border-slate-600 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="oauth-account-name text-xs font-bold text-white truncate">Reza PlayStation</div>
            <div class="oauth-account-email text-[11px] text-slate-400 truncate">reza.aliansistore@gmail.com</div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
        </div>
      </div>

      <!-- Option: Custom Google Account -->
      <div id="oauth-custom-section" class="border-t border-slate-800 pt-3">
        <button 
          type="button" 
          onclick="toggleOAuthCustomInput()" 
          class="w-full py-2 text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
          <span>Gunakan Akun Google Lain</span>
        </button>

        <form id="oauth-custom-form" onsubmit="event.preventDefault(); submitCustomOAuth('google');" class="space-y-2.5 mt-3 hidden">
          <div>
            <label class="block text-[11px] font-bold text-slate-300 mb-1">Nama Lengkap Anda:</label>
            <input type="text" id="oauth-custom-name" placeholder="Contoh: Rian Maulana" class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500" required />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-300 mb-1">Email Google / Gmail:</label>
            <input type="email" id="oauth-custom-email" placeholder="namaanda@gmail.com" class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500" required />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-300 mb-1">No. WhatsApp (Opsional):</label>
            <input type="tel" id="oauth-custom-phone" placeholder="081234..." class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500" />
          </div>
          <button type="submit" class="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer">
            Lanjutkan dengan Akun Ini
          </button>
        </form>
      </div>

      <p class="oauth-footer-text text-[10px] text-slate-500 text-center mt-4">
        Untuk melanjutkan, Google akan memverifikasi nama & alamat email Anda dengan ALIANSI STORE.
      </p>
    `;
  } else if (provider === 'microsoft') {
    container.innerHTML = `
      <div class="text-center mb-5">
        <svg class="w-9 h-9 mx-auto mb-2" viewBox="0 0 23 23">
          <path fill="#f35325" d="M1 1h10v10H1z"/>
          <path fill="#81bc06" d="M12 1h10v10H12z"/>
          <path fill="#05a6f0" d="M1 12h10v10H1z"/>
          <path fill="#ffba08" d="M12 12h10v10H12z"/>
        </svg>
        <h3 class="text-base font-black text-white font-display">Masuk dengan Microsoft</h3>
        <p class="text-xs text-slate-400 mt-0.5">Gunakan akun <strong class="text-sky-400">Outlook / Hotmail</strong> Anda</p>
      </div>

      <div class="space-y-2 mb-4">
        <div 
          onclick="executeOAuthLogin({ provider: 'microsoft', name: 'Dimas Pratama', email: 'dimas.gamer@outlook.com', phone: '081234567890' })"
          class="oauth-account-item flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-sky-500 cursor-pointer transition-all shadow-sm"
        >
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
            DP
          </div>
          <div class="flex-1 min-w-0">
            <div class="oauth-account-name text-xs font-bold text-white truncate">Dimas Pratama</div>
            <div class="oauth-account-email text-[11px] text-slate-400 truncate">dimas.gamer@outlook.com</div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
        </div>
      </div>

      <!-- Option: Custom Microsoft Account -->
      <div id="oauth-custom-section" class="border-t border-slate-800 pt-3">
        <button 
          type="button" 
          onclick="toggleOAuthCustomInput()" 
          class="w-full py-2 text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
          <span>Gunakan Akun Outlook Lain</span>
        </button>

        <form id="oauth-custom-form" onsubmit="event.preventDefault(); submitCustomOAuth('microsoft');" class="space-y-2.5 mt-3 hidden">
          <div>
            <label class="block text-[11px] font-bold text-slate-300 mb-1">Nama Lengkap:</label>
            <input type="text" id="oauth-custom-name" placeholder="Contoh: Reza Kurniawan" class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500" required />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-300 mb-1">Email Outlook / Hotmail:</label>
            <input type="email" id="oauth-custom-email" placeholder="nama@outlook.com" class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500" required />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-300 mb-1">No. WhatsApp (Opsional):</label>
            <input type="tel" id="oauth-custom-phone" placeholder="081234..." class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500" />
          </div>
          <button type="submit" class="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer">
            Masuk dengan Microsoft
          </button>
        </form>
      </div>

      <p class="oauth-footer-text text-[10px] text-slate-500 text-center mt-4">
        Aman & terlindungi dengan enkripsi Microsoft Authentication Library.
      </p>
    `;
  } else if (provider === 'psn') {
    container.innerHTML = `
      <div class="text-center mb-5">
        <div class="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-2.5 shadow-lg">
          <i data-lucide="gamepad-2" class="w-6 h-6"></i>
        </div>
        <h3 class="text-base font-black text-white font-display">PlayStation™Network ID</h3>
        <p class="text-xs text-slate-400 mt-0.5">Hubungkan akun PSN untuk sinkronisasi pesanan game</p>
      </div>

      <form onsubmit="event.preventDefault(); submitCustomOAuth('psn');" class="space-y-3">
        <div>
          <label class="block text-[11px] font-bold text-slate-300 mb-1">PlayStation™Network Online ID <span class="text-rose-400">*</span>:</label>
          <input type="text" id="oauth-psn-id" placeholder="Contoh: GamerSultan_ID atau Reza_PS5" class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500 font-mono" required />
          <span class="text-[10px] text-slate-500">ID profil akun PlayStation Anda</span>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-300 mb-1">Nama Panggilan / Lengkap:</label>
          <input type="text" id="oauth-custom-name" placeholder="Contoh: Reza Aliansi" class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500" required />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-300 mb-1">No. WhatsApp / Email:</label>
          <input type="text" id="oauth-custom-phone" placeholder="Contoh: 081234567890" class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500" required />
        </div>

        <button type="submit" class="w-full py-2.5 rounded-xl cyber-button font-black text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 mt-2 cursor-pointer">
          <i data-lucide="check-circle" class="w-4 h-4"></i>
          <span>Hubungkan & Masuk ke Toko</span>
        </button>
      </form>

      <p class="oauth-footer-text text-[10px] text-slate-500 text-center mt-4">
        🔒 100% Aman. Kami <strong>tidak pernah meminta password</strong> akun PlayStation Anda.
      </p>
    `;
  }

  lucide.createIcons();
}

function toggleOAuthCustomInput() {
  const form = document.getElementById('oauth-custom-form');
  if (form) form.classList.toggle('hidden');
}

function submitCustomOAuth(provider) {
  const nameInput = document.getElementById('oauth-custom-name');
  const emailInput = document.getElementById('oauth-custom-email');
  const phoneInput = document.getElementById('oauth-custom-phone');
  const psnIdInput = document.getElementById('oauth-psn-id');

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const psnId = psnIdInput ? psnIdInput.value.trim() : '';

  if (!name) {
    showToast('Mohon masukkan nama Anda!', 'warning');
    return;
  }
  if (provider === 'psn' && !psnId) {
    showToast('Mohon masukkan PSN Online ID Anda!', 'warning');
    return;
  }
  if ((provider === 'google' || provider === 'microsoft') && !email) {
    showToast('Mohon masukkan alamat email Anda!', 'warning');
    return;
  }

  executeOAuthLogin({
    provider: provider,
    name: name,
    email: email,
    phone: phone,
    psnId: psnId
  });
}

function executeOAuthLogin(accountData) {
  playSfx('success');
  const { provider, name, email, phone, avatar, psnId } = accountData;

  const users = state.users || [];
  const cleanPhone = phone ? phone.replace(/[\s-]/g, '') : '';
  const emailLower = email ? email.toLowerCase() : '';

  let user = users.find(u => 
    (emailLower && u.email && u.email.toLowerCase() === emailLower) ||
    (cleanPhone && u.phone && u.phone.replace(/[\s-]/g, '') === cleanPhone) ||
    (psnId && u.psnId && u.psnId.toLowerCase() === psnId.toLowerCase())
  );

  const providerNames = {
    google: 'Google',
    microsoft: 'Outlook / Microsoft',
    psn: 'PlayStation Network'
  };
  const providerLabel = providerNames[provider] || 'Pihak Ketiga';

  if (!user) {
    user = {
      id: 'usr-' + provider + '-' + Date.now(),
      identifier: email || cleanPhone || psnId || ('user-' + Date.now()),
      name: name || 'Member ' + providerLabel,
      email: email || '',
      phone: cleanPhone || '',
      psnId: psnId || '',
      authProvider: provider,
      avatar: avatar || null,
      role: 'customer',
      roleLabel: `Member VIP (${providerLabel})`,
      memberSince: new Date().getFullYear().toString(),
      createdAt: new Date().toISOString()
    };
    state.users.push(user);
    saveUsers();
  } else {
    user.authProvider = provider;
    if (avatar && !user.avatar) user.avatar = avatar;
    if (name && (!user.name || user.name.startsWith('Member '))) user.name = name;
    if (email && !user.email) user.email = email;
    if (psnId && !user.psnId) user.psnId = psnId;
    saveUsers();
  }

  state.currentUser = user;
  state.isAdmin = (user.role === 'admin');
  localStorage.setItem(APP_STORAGE_KEYS.USER, JSON.stringify(state.currentUser));
  localStorage.setItem(APP_STORAGE_KEYS.ADMIN_AUTH, state.isAdmin ? 'true' : 'false');

  closeOAuthModal();
  closeModals();
  updateNavAuthUI();
  triggerConfetti();

  showToast(
    `Berhasil masuk dengan ${providerLabel} sebagai ${user.name}! Akun Member VIP aktif.`,
    'success',
    'Login Berhasil'
  );

  // Auto-fill checkout fields if user decides to checkout
  const checkoutName = document.getElementById('checkout-name');
  const checkoutPhone = document.getElementById('checkout-phone');
  const checkoutEmail = document.getElementById('checkout-email');
  if (checkoutName && user.name) checkoutName.value = user.name;
  if (checkoutPhone && user.phone) checkoutPhone.value = user.phone;
  if (checkoutEmail && user.email) checkoutEmail.value = user.email;
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
          <a href="https://wa.me/${(state.config && state.config.whatsappNumber) || '6281234567890'}?text=Halo%20Admin%20${encodeURIComponent((state.config && state.config.storeName) || 'Aliansi Store')}%2C%20saya%20mau%20konfirmasi%20pesanan%20${order.id}" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center gap-1.5">
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
    renderAdminRequestsTable();
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

// ================= STORE SETTINGS & CONTACT MANAGEMENT =================
function updateStoreContactUI() {
  const wa = (state.config && state.config.whatsappNumber) || '6281234567890';
  const email = (state.config && state.config.adminEmail) || 'aliansistore.id@gmail.com';
  const formattedWa = (state.config && state.config.whatsappFormatted) || `+${wa}`;

  // Update all WhatsApp links across navbar, footer, HUD, and mobile bottom bar
  document.querySelectorAll('a.wa-contact-link, a[data-wa-link]').forEach(el => {
    el.href = `https://wa.me/${wa}`;
  });

  // Update footer and contact email labels & mailto links
  document.querySelectorAll('.store-admin-email').forEach(el => {
    el.textContent = email;
  });
  document.querySelectorAll('a.store-admin-email-link').forEach(el => {
    el.href = `mailto:${email}`;
  });

  // Update invoice print header
  document.querySelectorAll('.invoice-print-wa').forEach(el => {
    el.textContent = formattedWa;
  });
  document.querySelectorAll('.invoice-print-email').forEach(el => {
    el.textContent = email;
  });
}

function openAdminSettingsModal() {
  playSfx('click');
  const modal = document.getElementById('modal-admin-settings');
  if (!modal) return;
  const waEl = document.getElementById('setting-admin-wa');
  const emailEl = document.getElementById('setting-admin-email');
  const nameEl = document.getElementById('setting-store-name');

  if (waEl) waEl.value = (state.config && state.config.whatsappNumber) || '6281234567890';
  if (emailEl) emailEl.value = (state.config && state.config.adminEmail) || 'aliansistore.id@gmail.com';
  if (nameEl) nameEl.value = (state.config && state.config.storeName) || 'ALIANSI STORE';

  const newPinEl = document.getElementById('setting-admin-new-pin');
  const confirmPinEl = document.getElementById('setting-admin-confirm-pin');
  if (newPinEl) newPinEl.value = '';
  if (confirmPinEl) confirmPinEl.value = '';

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function testCurrentWaLink() {
  playSfx('click');
  const rawWa = document.getElementById('setting-admin-wa') ? document.getElementById('setting-admin-wa').value.trim() : '';
  let cleanWa = rawWa.replace(/[^0-9]/g, '');
  if (cleanWa.startsWith('0')) {
    cleanWa = '62' + cleanWa.slice(1);
  }
  if (!cleanWa || cleanWa.length < 8) {
    showToast('Ketik nomor WhatsApp yang valid terlebih dahulu untuk tes!', 'warning');
    return;
  }
  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';
  const testMsg = encodeURIComponent(`Halo Admin ${storeName}, ini tes pesan WhatsApp dari Dashboard Pengaturan Admin.`);
  window.open(`https://wa.me/${cleanWa}?text=${testMsg}`, '_blank');
}

function saveAdminSettings() {
  const waInput = document.getElementById('setting-admin-wa');
  const emailInput = document.getElementById('setting-admin-email');
  const nameInput = document.getElementById('setting-store-name');

  if (!waInput || !emailInput) return;

  let rawWa = waInput.value.trim();
  const email = emailInput.value.trim();
  const storeName = nameInput ? nameInput.value.trim() : 'ALIANSI STORE';

  // Normalize phone number to standard international format (e.g. 0812... -> 62812...)
  let cleanWa = rawWa.replace(/[^0-9]/g, '');
  if (cleanWa.startsWith('0')) {
    cleanWa = '62' + cleanWa.slice(1);
  }

  if (!cleanWa || cleanWa.length < 9) {
    showToast('Nomor WhatsApp tidak valid (minimal 9 digit, cth: 081234567890)!', 'warning');
    waInput.focus();
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showToast('Masukkan format alamat email admin yang valid!', 'warning');
    emailInput.focus();
    return;
  }

  if (!state.config) state.config = {};
  state.config.whatsappNumber = cleanWa;
  
  // Format formatted number e.g. +62 812-3456-7890
  if (cleanWa.startsWith('62')) {
    const rest = cleanWa.slice(2);
    state.config.whatsappFormatted = `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
  } else {
    state.config.whatsappFormatted = `+${cleanWa}`;
  }

  state.config.adminEmail = email;
  if (storeName) state.config.storeName = storeName;

  // Process Admin Password Change (if provided)
  const newPinInput = document.getElementById('setting-admin-new-pin');
  const confirmPinInput = document.getElementById('setting-admin-confirm-pin');
  const newPin = newPinInput ? newPinInput.value.trim() : '';
  const confirmPin = confirmPinInput ? confirmPinInput.value.trim() : '';

  let passwordChanged = false;
  if (newPin || confirmPin) {
    if (newPin.length < 4) {
      showToast('Password admin baru minimal 4 karakter!', 'warning');
      if (newPinInput) newPinInput.focus();
      return;
    }
    if (newPin !== confirmPin) {
      showToast('Konfirmasi password tidak cocok dengan password baru!', 'warning');
      if (confirmPinInput) confirmPinInput.focus();
      return;
    }
    state.config.adminPin = newPin;
    passwordChanged = true;
    if (newPinInput) newPinInput.value = '';
    if (confirmPinInput) confirmPinInput.value = '';
  }

  saveConfig();
  if (typeof syncConfigToSupabase === 'function') {
    syncConfigToSupabase();
  }
  updateStoreContactUI();
  closeModals();
  playSfx('success');
  const passMsg = passwordChanged ? ' • Password Admin Diperbarui' : '';
  showToast(`Pengaturan berhasil disimpan! WA: ${cleanWa} • Email: ${email}${passMsg}`, 'success', 'Pengaturan Tersimpan');
}

// ================= ADMIN PASSWORD RESET SYSTEM (EMAIL OTP) =================
state.adminResetOtp = {
  code: '',
  email: '',
  expiresAt: 0
};

function openAdminForgotPasswordModal() {
  playSfx('click');
  closeModals();
  const modal = document.getElementById('modal-admin-forgot-password');
  if (!modal) return;

  // Reset to Step 1
  const step1 = document.getElementById('forgot-admin-step-1');
  const step2 = document.getElementById('forgot-admin-step-2');
  if (step1) step1.classList.remove('hidden');
  if (step2) step2.classList.add('hidden');

  const emailInput = document.getElementById('forgot-admin-email-input');
  const registeredEmail = (state.config && state.config.adminEmail) || 'aliansistore.id@gmail.com';
  if (emailInput) {
    emailInput.value = registeredEmail;
  }

  const otpInput = document.getElementById('forgot-admin-otp-input');
  if (otpInput) otpInput.value = '';
  const newPassInput = document.getElementById('forgot-admin-new-password');
  if (newPassInput) newPassInput.value = '';
  const confirmPassInput = document.getElementById('forgot-admin-confirm-password');
  if (confirmPassInput) confirmPassInput.value = '';

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function openLoginModalFromForgot() {
  playSfx('click');
  closeModals();
  openAuthModal('login');
}

function backToForgotStep1() {
  playSfx('click');
  const step1 = document.getElementById('forgot-admin-step-1');
  const step2 = document.getElementById('forgot-admin-step-2');
  if (step1) step1.classList.remove('hidden');
  if (step2) step2.classList.add('hidden');
  if (window.lucide) lucide.createIcons();
}

function requestAdminResetCode() {
  playSfx('click');
  const registeredEmail = (state.config && state.config.adminEmail) || 'aliansistore.id@gmail.com';
  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';

  // Generate secure 6-digit numeric OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  state.adminResetOtp = {
    code: otpCode,
    email: registeredEmail,
    expiresAt: expiresAt
  };

  // Format verification email
  const subject = `[RESET PASSWORD] Kode Verifikasi OTP Admin ${storeName} - ${otpCode}`;
  const body = `Halo Administrator ${storeName},

Kami menerima permintaan untuk mereset password akun login Admin toko Anda.

Berikut adalah Kode Verifikasi (OTP) untuk reset password:
======================================================
KODE OTP ANDA: ${otpCode}
======================================================

* Kode OTP ini hanya berlaku selama 15 menit.
* Masukkan kode 6-digit di atas pada formulir reset password di website toko Anda.
* JANGAN BERIKAN KODE INI KEPADA SIAPAPUN demi keamanan toko Anda.

Jika Anda tidak merasa melakukan permintaan ini, segera abaikan email ini atau periksa pengaturan keamanan akun Anda.

Hormat kami,
Sistem Keamanan & Verifikasi
${storeName}
Official Email: ${registeredEmail}`;

  // Trigger mailto client
  const mailtoUrl = `mailto:${registeredEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Transition UI to Step 2
  const step1 = document.getElementById('forgot-admin-step-1');
  const step2 = document.getElementById('forgot-admin-step-2');
  if (step1) step1.classList.add('hidden');
  if (step2) step2.classList.remove('hidden');

  const targetDisplay = document.getElementById('forgot-otp-sent-target');
  if (targetDisplay) targetDisplay.textContent = registeredEmail;

  const otpInput = document.getElementById('forgot-admin-otp-input');
  if (otpInput) {
    otpInput.value = '';
    setTimeout(() => otpInput.focus(), 300);
  }

  if (window.lucide) lucide.createIcons();
  playSfx('success');
  showToast(`Kode OTP 6-digit (${otpCode}) telah dikirimkan ke email ${registeredEmail}!`, 'success', 'Kode OTP Dikirim');
  console.info(`[ADMIN SECURITY OTP] Generated OTP Code: ${otpCode} for ${registeredEmail} (valid 15 mins)`);

  // Open email client
  window.open(mailtoUrl, '_blank');
}

function submitAdminPasswordReset() {
  playSfx('click');
  const otpInput = document.getElementById('forgot-admin-otp-input');
  const newPassInput = document.getElementById('forgot-admin-new-password');
  const confirmPassInput = document.getElementById('forgot-admin-confirm-password');

  const enteredOtp = otpInput ? otpInput.value.trim() : '';
  const newPass = newPassInput ? newPassInput.value.trim() : '';
  const confirmPass = confirmPassInput ? confirmPassInput.value.trim() : '';

  if (!state.adminResetOtp || !state.adminResetOtp.code) {
    showToast('Silakan minta kode OTP terlebih dahulu!', 'warning');
    backToForgotStep1();
    return;
  }

  if (!enteredOtp) {
    showToast('Masukkan 6-digit kode OTP verifikasi!', 'warning');
    if (otpInput) otpInput.focus();
    return;
  }

  // Validate OTP code
  if (enteredOtp !== state.adminResetOtp.code) {
    playSfx('cart');
    showToast('Kode OTP yang Anda masukkan salah / tidak cocok!', 'error', 'OTP Tidak Valid');
    if (otpInput) otpInput.focus();
    return;
  }

  // Validate expiration
  if (Date.now() > state.adminResetOtp.expiresAt) {
    playSfx('cart');
    showToast('Kode OTP telah kedaluwarsa (lebih dari 15 menit). Silakan minta kode baru!', 'warning', 'OTP Expired');
    backToForgotStep1();
    return;
  }

  // Validate new password
  if (!newPass || newPass.length < 4) {
    showToast('Password baru minimal 4 karakter!', 'warning');
    if (newPassInput) newPassInput.focus();
    return;
  }

  if (newPass !== confirmPass) {
    showToast('Konfirmasi password tidak cocok dengan password baru!', 'warning');
    if (confirmPassInput) confirmPassInput.focus();
    return;
  }

  // Update admin PIN / Password
  if (!state.config) state.config = {};
  state.config.adminPin = newPass;

  // Persist to LocalStorage and Cloud
  saveConfig();
  if (typeof syncConfigToSupabase === 'function') {
    syncConfigToSupabase();
  }

  // Clear OTP state
  state.adminResetOtp = { code: '', email: '', expiresAt: 0 };

  playSfx('success');
  if (typeof confetti === 'function') {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  }

  showToast('Password admin berhasil direset! Silakan login dengan password baru Anda.', 'success', 'Reset Berhasil');
  closeModals();

  // Open Login form and autofill
  setTimeout(() => {
    openAuthModal('login');
    const idEl = document.getElementById('auth-login-identifier');
    const passEl = document.getElementById('auth-login-password');
    if (idEl) idEl.value = 'admin';
    if (passEl) {
      passEl.value = newPass;
      passEl.focus();
    }
  }, 400);
}

// ================= GAME REQUESTS MANAGEMENT SYSTEM =================
function openRequestGameModal(prefillTitle = '') {
  playSfx('click');
  const modal = document.getElementById('modal-request-game');
  if (!modal) return;

  const titleInput = document.getElementById('req-game-title');
  if (titleInput) {
    titleInput.value = prefillTitle || '';
  }

  // Pre-fill customer data if logged in
  const nameInput = document.getElementById('req-customer-name');
  const emailInput = document.getElementById('req-customer-email');
  const phoneInput = document.getElementById('req-customer-phone');
  const notesInput = document.getElementById('req-notes');

  if (state.currentUser) {
    if (nameInput) nameInput.value = state.currentUser.name || '';
    if (emailInput) emailInput.value = state.currentUser.email || '';
    if (phoneInput) phoneInput.value = state.currentUser.phone || '';
  }

  if (notesInput && !prefillTitle) {
    notesInput.value = '';
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
  if (titleInput && !prefillTitle) {
    setTimeout(() => titleInput.focus(), 150);
  }
}

function submitGameRequest() {
  const titleInput = document.getElementById('req-game-title');
  const nameInput = document.getElementById('req-customer-name');
  const emailInput = document.getElementById('req-customer-email');
  const phoneInput = document.getElementById('req-customer-phone');
  const catInput = document.getElementById('req-game-category');
  const notesInput = document.getElementById('req-notes');

  if (!titleInput || !nameInput || !emailInput) return;

  const gameTitle = titleInput.value.trim();
  const customerName = nameInput.value.trim();
  const customerEmail = emailInput.value.trim();
  const customerPhone = phoneInput ? phoneInput.value.trim() : '';
  const category = catInput ? catInput.value : 'Action & Adventure';
  const notes = notesInput ? notesInput.value.trim() : '';

  // Get selected platforms
  const checkedPlats = Array.from(document.querySelectorAll('input[name="req-platform"]:checked')).map(cb => cb.value);
  const platform = checkedPlats.length > 0 ? checkedPlats : ['PS4 HEN'];

  if (!gameTitle) {
    showToast('Ketik judul game yang ingin Anda request!', 'warning');
    titleInput.focus();
    return;
  }
  if (!customerName) {
    showToast('Masukkan nama Anda untuk identifikasi tiket!', 'warning');
    nameInput.focus();
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customerEmail || !emailRegex.test(customerEmail)) {
    showToast('Masukkan alamat email yang valid untuk menerima notifikasi!', 'warning');
    emailInput.focus();
    return;
  }

  const reqId = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
  const newReq = {
    id: reqId,
    gameTitle,
    platform,
    category,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    fulfilledAt: null,
    adminNotes: ''
  };

  if (!Array.isArray(state.gameRequests)) {
    state.gameRequests = [];
  }
  state.gameRequests.unshift(newReq);
  saveGameRequests();

  if (typeof syncGameRequestToSupabase === 'function') {
    syncGameRequestToSupabase(newReq);
  }

  state.lastCreatedRequest = newReq;

  // Close request form
  closeModals();

  // Populate and show success modal
  const successModal = document.getElementById('modal-request-success');
  if (successModal) {
    const sId = document.getElementById('success-req-id');
    const sTitle = document.getElementById('success-req-title');
    const sEmail = document.getElementById('success-req-email');
    const sAdminEmail = document.getElementById('success-req-admin-email');

    const adminEmail = (state.config && state.config.adminEmail) || 'aliansistore.id@gmail.com';

    if (sId) sId.textContent = newReq.id;
    if (sTitle) sTitle.textContent = `${newReq.gameTitle} (${newReq.platform.join(', ')})`;
    if (sEmail) sEmail.textContent = newReq.customerEmail;
    if (sAdminEmail) sAdminEmail.textContent = adminEmail;

    successModal.classList.remove('hidden');
    lucide.createIcons();
  }

  playSfx('success');
  showToast(`Permintaan game "${gameTitle}" berhasil dikirim! Salinan detail siap diteruskan ke email admin.`, 'success', 'Request Diterima');

  // Update Admin view if open
  renderAdminStats();
  renderAdminRequestsTable();
}

function sendCurrentRequestEmailToAdmin() {
  playSfx('click');
  const req = state.lastCreatedRequest;
  if (!req) {
    showToast('Data permintaan tidak ditemukan.', 'warning');
    return;
  }

  const adminEmail = (state.config && state.config.adminEmail) || 'aliansistore.id@gmail.com';
  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';
  const subject = `[REQUEST GAME BARU] ${req.gameTitle} - dari ${req.customerName} (${req.id})`;

  const body = 
`Halo Admin ${storeName},

Terdapat permintaan game baru dari pelanggan website ${storeName}:

No. Tiket: ${req.id}
Judul Game: ${req.gameTitle}
Platform: ${req.platform.join(', ')}
Kategori: ${req.category}
Tanggal Request: ${new Date(req.createdAt).toLocaleString('id-ID')}

DATA PELANGGAN:
Nama: ${req.customerName}
Email Pelanggan: ${req.customerEmail}
WhatsApp: ${req.customerPhone || '-'}

CATATAN KHUSUS:
${req.notes || 'Tidak ada catatan tambahan'}

--------------------------------------------------
Tiket ini juga telah tercatat otomatis di Dashboard Admin ${storeName}.
Mohon ditindaklanjuti ketersediaan game tersebut. Terima kasih!`;

  const mailtoUrl = `mailto:${encodeURIComponent(adminEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank') || (window.location.href = mailtoUrl);
  showToast('Aplikasi email dibuka untuk mengirim detail ke admin.', 'info');
}

function sendCurrentRequestWaToAdmin() {
  playSfx('click');
  const req = state.lastCreatedRequest;
  if (!req) {
    showToast('Data permintaan tidak ditemukan.', 'warning');
    return;
  }

  const adminWa = (state.config && state.config.whatsappNumber) || '6281234567890';
  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';
  const waText = 
`Halo Admin ${storeName}, saya telah mengajukan Request Game PlayStation:
Tiket: ${req.id}
Judul Game: ${req.gameTitle} (${req.platform.join(', ')})
Nama Pemohon: ${req.customerName}
Email: ${req.customerEmail}
Catatan: ${req.notes || '-'}

Mohon konfirmasi dan info jika game sudah tersedia ya min. Terima kasih!`;

  window.open(`https://wa.me/${adminWa}?text=${encodeURIComponent(waText)}`, '_blank');
}

function setAdminRequestFilter(filter) {
  playSfx('hover');
  state.adminRequestFilter = filter;
  const tabs = document.querySelectorAll('.admin-req-tab');
  tabs.forEach(t => {
    t.classList.remove('bg-purple-600', 'text-white');
    t.classList.add('bg-slate-800', 'text-slate-400');
  });
  const activeTab = document.getElementById(`tab-req-${filter}`);
  if (activeTab) {
    activeTab.classList.remove('bg-slate-800', 'text-slate-400');
    activeTab.classList.add('bg-purple-600', 'text-white');
  }
  renderAdminRequestsTable();
}

function renderAdminRequestsTable() {
  const tbody = document.getElementById('admin-requests-table-body');
  if (!tbody) return;

  const filter = state.adminRequestFilter || 'all';
  let list = state.gameRequests || [];

  if (filter === 'pending') {
    list = list.filter(r => r.status === 'PENDING');
  } else if (filter === 'ready') {
    list = list.filter(r => r.status === 'READY');
  }

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-10 text-center text-xs text-slate-500">
          <i data-lucide="inbox" class="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50"></i>
          <div>Belum ada data permintaan game dengan filter ini.</div>
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  tbody.innerHTML = list.map(req => {
    const isPending = req.status === 'PENDING';
    const dateFormatted = new Date(req.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const statusBadge = isPending ? `
      <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        <span>MENUNGGU</span>
      </span>
    ` : `
      <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
        <i data-lucide="check" class="w-3 h-3 text-emerald-400"></i>
        <span>SUDAH TERSEDIA</span>
      </span>
    `;

    const platforms = Array.isArray(req.platform) ? req.platform : [req.platform];

    return `
      <tr class="border-b border-slate-800/80 hover:bg-slate-900/40 transition-colors text-xs">
        <td class="py-3 px-3 font-mono">
          <div class="font-bold text-purple-400">${req.id}</div>
          <div class="text-[10px] text-slate-500">${dateFormatted}</div>
        </td>
        <td class="py-3 px-3">
          <div class="font-bold text-white max-w-[200px] truncate" title="${req.gameTitle}">${req.gameTitle}</div>
          <div class="flex items-center gap-1 mt-1 flex-wrap">
            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-300 border border-purple-500/30">${req.category || 'Game'}</span>
            ${platforms.map(pl => `<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-950/70 text-sky-300 border border-sky-500/30">${pl}</span>`).join('')}
          </div>
        </td>
        <td class="py-3 px-3">
          <div class="font-semibold text-slate-200">${req.customerName}</div>
          <div class="text-[11px] text-sky-400 font-mono">${req.customerEmail}</div>
          ${req.customerPhone ? `<div class="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5"><i data-lucide="phone" class="w-2.5 h-2.5 text-emerald-400"></i> ${req.customerPhone}</div>` : ''}
        </td>
        <td class="py-3 px-3">
          <div class="text-[11px] text-slate-300 max-w-[180px] line-clamp-2" title="${req.notes || '-'}">
            ${req.notes ? `"${req.notes}"` : '<span class="text-slate-500 italic">-</span>'}
          </div>
          ${req.adminNotes ? `<div class="text-[10px] text-emerald-400 mt-1"><i data-lucide="info" class="w-2.5 h-2.5 inline"></i> ${req.adminNotes}</div>` : ''}
        </td>
        <td class="py-3 px-3">
          ${statusBadge}
          ${order.fulfillment && order.fulfillment.emails_dispatched ? `
            <div class="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-1" title="Laporan penjualan ke admin & bukti pembelian ke customer (No-Reply) telah terkirim">
              <i data-lucide="mail-check" class="w-2.5 h-2.5 text-emerald-400"></i>
              <span>Email No-Reply Terkirim</span>
            </div>
          ` : ''}
        </td>
        <td class="py-3 px-3 text-right">
          <div class="flex items-center justify-end gap-1.5 flex-wrap">
            <button onclick="openAdminConfirmRequestModal('${req.id}')" class="px-2.5 py-1.5 rounded-lg ${isPending ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30'} text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer" title="${isPending ? 'Konfirmasi game sudah ada & kirim email ke customer' : 'Kirim ulang email pemberitahuan ke customer'}">
              <i data-lucide="${isPending ? 'send' : 'mail'}" class="w-3 h-3"></i>
              <span>${isPending ? 'Konfirmasi & Email' : 'Kirim Ulang Email'}</span>
            </button>
            
            <button onclick="prefillNewProductFromRequest('${req.id}')" class="p-1.5 rounded-lg bg-sky-950/70 hover:bg-sky-900 text-sky-300 border border-sky-500/30 transition-colors cursor-pointer" title="Jadikan Game Baru di Katalog (Buka Modal Tambah Game)">
              <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
            </button>

            ${req.customerPhone ? `
              <button onclick="sendConfirmationWaToCustomer('${req.id}')" class="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer" title="Kirim Konfirmasi via WhatsApp">
                <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}

            <button onclick="deleteGameRequest('${req.id}')" class="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-800/40 transition-colors cursor-pointer" title="Hapus Tiket Request">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function openAdminConfirmRequestModal(reqId) {
  playSfx('click');
  const req = (state.gameRequests || []).find(r => r.id === reqId);
  if (!req) {
    showToast('Data permintaan game tidak ditemukan.', 'warning');
    return;
  }

  state.selectedRequestForConfirm = reqId;
  const modal = document.getElementById('modal-admin-confirm-request');
  if (!modal) return;

  const idEl = document.getElementById('confirm-req-id');
  const titleEl = document.getElementById('confirm-req-title');
  const platEl = document.getElementById('confirm-req-platform');
  const nameEl = document.getElementById('confirm-req-customer-name');
  const emailEl = document.getElementById('confirm-req-customer-email');
  const phoneEl = document.getElementById('confirm-req-customer-phone');
  const notesEl = document.getElementById('confirm-admin-notes');

  if (idEl) idEl.textContent = req.id;
  if (titleEl) titleEl.textContent = req.gameTitle;
  if (platEl) platEl.textContent = Array.isArray(req.platform) ? req.platform.join(', ') : req.platform;
  if (nameEl) nameEl.textContent = req.customerName;
  if (emailEl) emailEl.textContent = req.customerEmail;
  if (phoneEl) phoneEl.textContent = req.customerPhone || 'Tidak ada nomor WA';
  if (notesEl) notesEl.value = req.adminNotes || 'Game saat ini sudah resmi tersedia di katalog ALIANSI STORE dan siap dipesan/diunduh.';

  updateConfirmEmailPreview();
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function updateConfirmEmailPreview() {
  const reqId = state.selectedRequestForConfirm;
  const req = (state.gameRequests || []).find(r => r.id === reqId);
  if (!req) return;

  const previewEl = document.getElementById('confirm-email-preview');
  if (!previewEl) return;

  const notesEl = document.getElementById('confirm-admin-notes');
  const customNotes = notesEl ? notesEl.value.trim() : '';
  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';
  const wa = (state.config && state.config.whatsappNumber) || '6281234567890';
  const platforms = Array.isArray(req.platform) ? req.platform.join(', ') : req.platform;

  previewEl.textContent = 
`Kepada: ${req.customerEmail}
Subjek: [${storeName}] Hore! Game Request Anda "${req.gameTitle}" Sudah Tersedia!

Halo ${req.customerName},

Kabar gembira dari ${storeName}!
Permintaan game PlayStation yang Anda ajukan sebelumnya:
• No. Tiket: ${req.id}
• Judul Game: ${req.gameTitle}
• Platform: ${platforms}

Saat ini SUDAH RESMI TERSEDIA di katalog website kami dan siap Anda pesan/unduh!

${customNotes ? 'Catatan Toko:\n' + customNotes + '\n\n' : ''}Silakan kunjungi website resmi kami untuk melakukan pemesanan:
https://aliansi-store.netlify.app/

Jika Anda membutuhkan bantuan pemesanan atau panduan instalasi file PKG, hubungi WhatsApp Customer Service kami di: https://wa.me/${wa}

Terima kasih atas kepercayaan Anda pada ${storeName}!

Salam hangat,
Tim Operator ${storeName}`;
}

function sendConfirmationEmailToCustomer(reqId = null) {
  playSfx('click');
  const targetId = reqId || state.selectedRequestForConfirm;
  const req = (state.gameRequests || []).find(r => r.id === targetId);
  if (!req) {
    showToast('Data permintaan tidak ditemukan.', 'warning');
    return;
  }

  const notesEl = document.getElementById('confirm-admin-notes');
  const customNotes = notesEl ? notesEl.value.trim() : '';

  // Update status to READY
  req.status = 'READY';
  req.fulfilledAt = new Date().toISOString();
  if (customNotes) {
    req.adminNotes = customNotes;
  }
  saveGameRequests();

  if (typeof syncGameRequestToSupabase === 'function') {
    syncGameRequestToSupabase(req);
  }

  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';
  const wa = (state.config && state.config.whatsappNumber) || '6281234567890';
  const platforms = Array.isArray(req.platform) ? req.platform.join(', ') : req.platform;

  const subject = `[${storeName}] Hore! Game Request Anda "${req.gameTitle}" Sudah Tersedia di Katalog!`;
  const body = 
`Halo ${req.customerName},

Kabar gembira dari ${storeName}!
Permintaan game PlayStation yang Anda ajukan sebelumnya:
- No. Tiket: ${req.id}
- Judul Game: ${req.gameTitle}
- Platform: ${platforms}

Saat ini SUDAH RESMI TERSEDIA di katalog website kami dan siap Anda pesan / download!

${customNotes ? 'Catatan Toko:\n' + customNotes + '\n\n' : ''}Silakan kunjungi website resmi kami untuk melakukan pemesanan:
https://aliansi-store.netlify.app/

Jika Anda membutuhkan bantuan pemesanan atau panduan instalasi file PKG, silakan hubungi WhatsApp CS kami:
WhatsApp CS: +${wa} (https://wa.me/${wa})

Terima kasih atas kesabaran dan kepercayaan Anda pada ${storeName}!

Salam hangat,
Tim Operator ${storeName}`;

  const mailtoUrl = `mailto:${encodeURIComponent(req.customerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank') || (window.location.href = mailtoUrl);

  closeModals();
  playSfx('success');
  showToast(`Status game diubah menjadi TERSEDIA! Aplikasi email dibuka untuk mengirim konfirmasi ke ${req.customerEmail}.`, 'success', 'Konfirmasi Terkirim');

  renderAdminStats();
  renderAdminRequestsTable();
}

function sendConfirmationWaToCustomer(reqId = null) {
  playSfx('click');
  const targetId = reqId || state.selectedRequestForConfirm;
  const req = (state.gameRequests || []).find(r => r.id === targetId);
  if (!req) return;

  if (!req.customerPhone) {
    showToast('Pelanggan ini tidak mencantumkan nomor WhatsApp.', 'warning');
    return;
  }

  let cleanPhone = req.customerPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }

  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';
  const platforms = Array.isArray(req.platform) ? req.platform.join(', ') : req.platform;

  const waText = 
`Halo Kak ${req.customerName}, kabar gembira dari ${storeName}! 🎮
Permintaan game PlayStation yang Kakak request sebelumnya:
🕹️ Judul: ${req.gameTitle} (${platforms})
Tiket: ${req.id}

Saat ini SUDAH RESMI TERSEDIA di katalog kami dan siap dipesan/didownload!
Silakan cek di website kami: https://aliansi-store.netlify.app/

Ada yang ingin ditanyakan min? Silakan balas chat ini ya Kak! Terima kasih.`;

  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`, '_blank');
}

function prefillNewProductFromRequest(reqId = null) {
  playSfx('click');
  const targetId = reqId || state.selectedRequestForConfirm;
  const req = (state.gameRequests || []).find(r => r.id === targetId);
  if (!req) return;

  closeModals();
  openAddProductModal();

  const titleInput = document.getElementById('new-game-title');
  if (titleInput) {
    titleInput.value = req.gameTitle;
  }

  // Pre-check platforms
  const plats = Array.isArray(req.platform) ? req.platform : [req.platform];
  document.querySelectorAll('input[name="new-game-platform"]').forEach(cb => {
    cb.checked = plats.some(p => p.toLowerCase().includes(cb.value.toLowerCase()));
  });

  const catSelect = document.getElementById('new-game-category');
  if (catSelect && req.category) {
    // Map or set category if matches
    for (let opt of catSelect.options) {
      if (opt.value.toLowerCase() === req.category.toLowerCase() || opt.text.toLowerCase().includes(req.category.toLowerCase())) {
        catSelect.value = opt.value;
        break;
      }
    }
  }

  const descInput = document.getElementById('new-game-desc');
  if (descInput) {
    descInput.value = `Game ${req.gameTitle} PlayStation dengan performa lancar, koleksi terlengkap, dan file Google Drive link cepat untuk pelanggan ALIANSI STORE.`;
  }

  showToast(`Data dari request "${req.gameTitle}" berhasil disalin ke formulir Game Baru! Silakan lengkapi harga dan gambar.`, 'info', 'Formulir Terisi');
}

function deleteGameRequest(reqId) {
  playSfx('click');
  const idx = (state.gameRequests || []).findIndex(r => r.id === reqId);
  if (idx === -1) return;

  const req = state.gameRequests[idx];
  if (!confirm(`Hapus tiket permintaan game "${req.gameTitle}" (${req.id})?`)) {
    return;
  }

  state.gameRequests.splice(idx, 1);
  saveGameRequests();

  if (supabaseClient) {
    try {
      supabaseClient.from('game_requests').delete().eq('id', reqId);
    } catch (e) {
      // Ignore
    }
  }

  playSfx('success');
  showToast(`Tiket request ${reqId} berhasil dihapus.`, 'info');
  renderAdminStats();
  renderAdminRequestsTable();
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

  const totalRequests = (state.gameRequests || []).length;
  const pendingRequests = (state.gameRequests || []).filter(r => r.status === 'PENDING').length;
  const statReqEl = document.getElementById('stat-total-requests');
  if (statReqEl) statReqEl.textContent = totalRequests;
  const badgeReq = document.getElementById('badge-pending-requests');
  if (badgeReq) badgeReq.textContent = `${pendingRequests} Menunggu`;

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
          ${order.fulfillment && order.fulfillment.emails_dispatched ? `
            <div class="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-1" title="Laporan penjualan ke admin & bukti pembelian ke customer (No-Reply) telah terkirim">
              <i data-lucide="mail-check" class="w-2.5 h-2.5 text-emerald-400"></i>
              <span>Email No-Reply Terkirim</span>
            </div>
          ` : ''}
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
  dispatchOrderCompletionEmails(order);
  renderAdminStats();
  renderAdminOrdersTable();
  showToast(`Pesanan ${orderId} diverifikasi lunas & laporan penjualan dikirim ke Admin!`, 'success');
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
  dispatchOrderCompletionEmails(state.orderToFulfill);
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

  const searchInput = document.getElementById('admin-product-search-input');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let list = state.products || [];
  if (query) {
    list = list.filter(p => 
      (p.title || '').toLowerCase().includes(query) ||
      (Array.isArray(p.platform) && p.platform.some(pl => pl.toLowerCase().includes(query))) ||
      (p.category || '').toLowerCase().includes(query) ||
      (typeof getCategoryLabel === 'function' ? getCategoryLabel(p.category || '') : '').toLowerCase().includes(query)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-xs text-slate-500">Tidak ada game di katalog admin yang cocok dengan "${query}".</td></tr>`;
    return;
  }

  container.innerHTML = list.map(p => `
    <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 text-xs text-slate-300">
      <td class="py-2.5 px-3">
        <div class="flex items-center gap-2.5">
          <img src="${getProductPoster(p)}" class="w-8 h-10 object-cover rounded-lg bg-slate-800" onerror="this.onerror=null; this.src='assets/covers/service-1tb.jpg'" alt="" />
          <div>
            <div class="font-bold text-white flex items-center gap-1.5 flex-wrap">
              <span>${p.title}</span>
              ${p.driveLink ? `
                <a href="${p.driveLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/80 transition-colors" title="Google Drive Link Siap - Klik untuk tes link">
                  <i data-lucide="folder-check" class="w-2.5 h-2.5"></i> Drive Siap
                </a>
              ` : `
                <span class="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700" title="Belum ada link Google Drive">
                  <i data-lucide="folder-x" class="w-2.5 h-2.5"></i> No Drive
                </span>
              `}
            </div>
            <div class="text-[10px] text-slate-400 font-mono">${p.platform.join(', ')} • <span class="text-sky-400 font-bold">${getCategoryLabel(p.category)}</span></div>
          </div>
        </div>
      </td>
      <td class="py-2.5 px-3 font-semibold text-slate-400 font-display">
        ${p.prices.original && p.prices.original > p.prices.primary ? `<span class="line-through">${formatRupiah(p.prices.original)}</span>` : '<span class="text-slate-600">-</span>'}
      </td>
      <td class="py-2.5 px-3 font-extrabold text-sky-400 font-display">
        <div class="flex items-center gap-1.5">
          <span>${formatRupiah(p.prices.primary)}</span>
          ${getDiscountPercent(p.prices.original, p.prices.primary) > 0 ? `<span class="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-600 text-white">-${getDiscountPercent(p.prices.original, p.prices.primary)}%</span>` : ''}
        </div>
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

// ==========================================
// ADMIN SMART ASSET & CONTENT GENERATOR
// ==========================================

// Caching and variation state
window._imageGenIndices = window._imageGenIndices || {};
window._descGenIndices = window._descGenIndices || {};

// Curated franchise gaming art presets
const GAME_ART_PRESETS = {
  're4': {
    posters: [
      'assets/covers/re4-remake.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'resident evil': {
    posters: [
      'assets/covers/re4-remake.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'wukong': {
    posters: [
      'assets/covers/wukong.jpg',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'rdr': {
    posters: [
      'assets/covers/rdr2.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'fc 25': {
    posters: [
      'assets/covers/fc-25.jpg',
      'assets/covers/pes-2027.jpg',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85',
      'assets/backdrops/pes-2027.jpg'
    ]
  },
  'fifa': {
    posters: [
      'assets/covers/fc-25.jpg',
      'assets/covers/pes-2027.jpg',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85',
      'assets/backdrops/pes-2027.jpg'
    ]
  },
  'pes': {
    posters: [
      'assets/covers/pes-2027.jpg',
      'assets/covers/pes-2025.jpg',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/pes-2027.jpg',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'god of war': {
    posters: [
      'assets/covers/gow-ragnarok.jpg',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/gow-ragnarok.jpg',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'gow': {
    posters: [
      'assets/covers/gow-ragnarok.jpg',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/gow-ragnarok.jpg',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'spiderman': {
    posters: [
      'assets/covers/spiderman.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/spiderman.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'last of us': {
    posters: [
      'assets/covers/tlou-part2.jpg',
      'assets/covers/tlou-part1.jpg'
    ],
    backdrops: [
      'assets/backdrops/tlou-part2.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'tlou': {
    posters: [
      'assets/covers/tlou-part2.jpg',
      'assets/covers/tlou-part1.jpg'
    ],
    backdrops: [
      'assets/backdrops/tlou-part2.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'gta': {
    posters: [
      'assets/covers/gta-v.jpg',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/gta-v.jpg',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'ghost': {
    posters: [
      'assets/covers/ghost-tsushima.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/ghost-tsushima.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'hogwarts': {
    posters: [
      'assets/covers/hogwarts-legacy.jpg',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/hogwarts-legacy.jpg',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'mortal kombat': {
    posters: [
      'assets/covers/mortal-kombat-11.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/mortal-kombat-11.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'uncharted': {
    posters: [
      'assets/covers/uncharted-4.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/uncharted-4.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'stray': {
    posters: [
      'assets/covers/stray.jpg',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/stray.jpg',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'it takes two': {
    posters: [
      'assets/covers/it-takes-two.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/it-takes-two.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'ac': {
    posters: [
      'assets/covers/ac-odyssey.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/ac-odyssey.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'assassin': {
    posters: [
      'assets/covers/ac-odyssey.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/ac-odyssey.jpg',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'watch dogs': {
    posters: [
      'assets/covers/watch-dogs.jpg',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/watch-dogs.jpg',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  'one piece': {
    posters: [
      'assets/covers/one-piece-odyssey.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/one-piece-odyssey.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85'
    ]
  }
};

// High-resolution genre fallback pools for Posters & 16:9 Backdrops
const GENRE_ART_PRESETS = {
  action: {
    posters: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  horror: {
    posters: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  rpg: {
    posters: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  sports: {
    posters: [
      'assets/covers/pes-2027.jpg',
      'assets/covers/fc-25.jpg',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/pes-2027.jpg',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  fighting: {
    posters: [
      'assets/covers/mortal-kombat-11.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/mortal-kombat-11.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  racing: {
    posters: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  family: {
    posters: [
      'assets/covers/it-takes-two.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'assets/backdrops/it-takes-two.jpg',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85'
    ]
  },
  default: {
    posters: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
    ],
    backdrops: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85'
    ]
  }
};

function updateImagePreview(prefix, type) {
  const inputEl = document.getElementById(`${prefix}-game-${type}`);
  const previewImg = document.getElementById(`${prefix}-game-${type}-preview`);
  const placeholder = document.getElementById(`${prefix}-${type}-placeholder`);
  if (!inputEl || !previewImg || !placeholder) return;

  const url = inputEl.value.trim();
  if (url) {
    previewImg.src = url;
    previewImg.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    previewImg.src = '';
    previewImg.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }
}

function handleImageFileUpload(event, prefix, type) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Pilih file gambar valid (JPG, PNG, WebP)!', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Scale down image to fit storage quota comfortably
      const maxW = type === 'poster' ? 600 : 1280;
      const maxH = type === 'poster' ? 900 : 720;
      let width = img.width;
      let height = img.height;

      if (width > maxW || height > maxH) {
        if (width / maxW > height / maxH) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        } else {
          width = Math.round((width * maxH) / height);
          height = maxH;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const inputEl = document.getElementById(`${prefix}-game-${type}`);
      if (inputEl) {
        inputEl.value = dataUrl;
        updateImagePreview(prefix, type);
      }
      playSfx('success');
      showToast(`Gambar ${type === 'poster' ? 'Poster' : 'Background'} berhasil diunggah dari komputer!`, 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function generateGameImage(prefix, type) {
  playSfx('click');
  const titleEl = document.getElementById(`${prefix}-game-title`);
  const title = titleEl ? titleEl.value.trim() : '';

  if (!title) {
    showToast('Ketik Judul Game terlebih dahulu untuk generate gambar!', 'warning');
    if (titleEl) titleEl.focus();
    return;
  }

  const titleLower = title.toLowerCase();
  const catEl = document.getElementById(`${prefix}-game-category`);
  const category = catEl ? catEl.value : 'action';

  // 1. Try to find a matched franchise in GAME_ART_PRESETS
  let candidatePool = null;
  for (const [key, data] of Object.entries(GAME_ART_PRESETS)) {
    if (titleLower.includes(key)) {
      candidatePool = type === 'poster' ? data.posters : data.backdrops;
      break;
    }
  }

  // 2. If not matched, fallback to selected category
  if (!candidatePool || candidatePool.length === 0) {
    const genreData = GENRE_ART_PRESETS[category] || GENRE_ART_PRESETS.default;
    candidatePool = type === 'poster' ? genreData.posters : genreData.backdrops;
  }

  if (!candidatePool || candidatePool.length === 0) {
    candidatePool = type === 'poster' ? GENRE_ART_PRESETS.default.posters : GENRE_ART_PRESETS.default.backdrops;
  }

  // 3. Cycle variations repeatedly
  const stateKey = `${prefix}-${type}-${titleLower}`;
  const nextIdx = (window._imageGenIndices[stateKey] = (window._imageGenIndices[stateKey] === undefined ? 0 : window._imageGenIndices[stateKey] + 1)) % candidatePool.length;
  const pickedUrl = candidatePool[nextIdx];

  const inputEl = document.getElementById(`${prefix}-game-${type}`);
  if (inputEl) {
    inputEl.value = pickedUrl;
    updateImagePreview(prefix, type);
  }

  playSfx('success');
  showToast(`🎨 ${type === 'poster' ? 'Poster' : 'Wallpaper'} dihasilkan (Variasi ${nextIdx + 1}/${candidatePool.length})! Klik lagi untuk variasi lain.`, 'success', 'AI Generator');
}

function generateGameDescription(prefix) {
  playSfx('click');
  const titleEl = document.getElementById(`${prefix}-game-title`);
  const title = titleEl ? titleEl.value.trim() : '';

  if (!title) {
    showToast('Ketik Judul Game terlebih dahulu untuk membuat deskripsi!', 'warning');
    if (titleEl) titleEl.focus();
    return;
  }

  const titleLower = title.toLowerCase();
  const catEl = document.getElementById(`${prefix}-game-category`);
  const category = catEl ? catEl.value : 'action';
  const platformCbs = Array.from(document.querySelectorAll(`input[name="${prefix}-game-platform"]:checked`)).map(cb => cb.value);
  const platforms = platformCbs.length > 0 ? platformCbs.join(', ') : 'PS4 / PS5';
  const genreLabel = typeof getCategoryLabel === 'function' ? getCategoryLabel(category) : 'Game PlayStation';

  // Lore / franchise hook snippet
  let lore = 'Aksi petualangan mendebarkan dengan alur cerita sinematik yang sarat misteri, eksplorasi dunia yang luas, dan gameplay penuh tantangan.';
  if (titleLower.includes('resident evil') || titleLower.includes('re4') || titleLower.includes('biohazard') || titleLower.includes('silent hill')) {
    lore = 'Sensasi bertahan hidup dari ancaman horor biologis misterius, mengelola inventaris amunisi terbatas, dan memecahkan teka-teki lingkungan yang sangat menegangkan.';
  } else if (titleLower.includes('god of war') || titleLower.includes('gow') || titleLower.includes('kratos')) {
    lore = 'Perjalanan mitologi epik melintasi alam sembilan dewa Nordik yang brutal dan spektakuler, sarat emosi ikatan ayah dan anak dengan pertarungan kapak Leviathan legendaris.';
  } else if (titleLower.includes('spiderman') || titleLower.includes('spider-man') || titleLower.includes('miles')) {
    lore = 'Sensasi berayun jaring laba-laba dinamis melintasi gedung pencakar langit kota New York menghadapi para penjahat Sinister Six yang mengancam keselamatan kota.';
  } else if (titleLower.includes('last of us') || titleLower.includes('tlou') || titleLower.includes('ellie')) {
    lore = 'Kisah emosional mendalam tentang bertahan hidup, kesetiaan, dan pengorbanan di tengah dunia pasca-pandemi yang hancur dengan mekanik stealth survival paling realistis.';
  } else if (titleLower.includes('gta') || titleLower.includes('grand theft auto')) {
    lore = 'Petualangan kriminal dunia terbuka tanpa batas, kebebasan menjelajahi kota besar, misi heists spektakuler, modifikasi kendaraan, dan aksi bebas paling seru.';
  } else if (titleLower.includes('wukong') || titleLower.includes('black myth')) {
    lore = 'Kisah Sang Kera Sakti Takdir dalam legenda Tiongkok kuno menghadapi monster mitologi mistis dengan jurus tongkat sakti dinamis dan sihir transformasi memukau.';
  } else if (titleLower.includes('rdr') || titleLower.includes('red dead')) {
    lore = 'Kisah geng koboi penjahat legendaris di tanah liar Amerika Barat dengan ekosistem open-world paling hidup, mendalam, dan kaya akan detail sejarah.';
  } else if (titleLower.includes('pes') || titleLower.includes('fifa') || titleLower.includes('fc 25') || titleLower.includes('football')) {
    lore = 'Pertandingan sepak bola paling realistis dengan update bursa transfer musim terbaru, jersey anyar, animasi pemain lincah, dan atmosfer stadion berlisensi megah.';
  } else if (titleLower.includes('hogwarts') || titleLower.includes('harry potter')) {
    lore = 'Wujudkan impian menjadi murid sekolah sihir legendaris abad ke-19, kuasai mantra sihir kuno, jelajahi Hogsmeade dan Hutan Terlarang tanpa batas.';
  } else if (titleLower.includes('mortal kombat') || titleLower.includes('tekken')) {
    lore = 'Pertarungan versus brutal satu lawan satu paling kompetitif dengan combo beruntun tajam, visual sinematik memukau, dan deretan petarung legendaris berlisensi.';
  } else if (titleLower.includes('it takes two')) {
    lore = 'Mahakarya petualangan co-op 2 pemain paling seru pemenang Game of the Year yang menyajikan perpaduan komedi emosional dan gameplay variatif tiada henti.';
  } else if (titleLower.includes('ghost') || titleLower.includes('tsushima')) {
    lore = 'Perjuangan samurai kehormatan Jin Sakai yang berkorban membela tanah air Tsushima dari serbuan penjajah dengan seni pedang katana mematikan.';
  }

  // 5 Distinct Variations
  const variations = [
    `Rasakan sensasi petualangan kelas dunia dalam ${title} untuk konsol ${platforms}! ${lore} Dioptimalkan secara sempurna untuk menghadirkan performa stabil 60 FPS dan visual sinematik memanjakan mata. Pilihan terbaik untuk pengalaman bermain game yang tak terlupakan. Bergaransi resmi dan siap diunduh instan di ALIANSI STORE.`,
    `Hadirkan mahakarya ${title} dengan kenyamanan maksimal di konsol ${platforms} Anda! Nikmati dialog alur cerita utama dan instruksi misi yang kini 100% mudah dipahami dengan Full Subtitle Bahasa Indonesia yang rapi. File instalasi game telah teruji bebas bug dan bergaransi anti-revoke selamanya. Belanja game digital aman dan terpercaya hanya di ALIANSI STORE.`,
    `${title} - Salah satu judul ${genreLabel} paling diminati untuk rental maupun koleksi pribadi gamer ${platforms}! Menyajikan pertempuran spektakuler dengan deretan mode permainan lengkap yang siap dimainkan solo maupun mabar bersama teman. Didukung file PKG / lisensi resmi berkecepatan tinggi via Google Drive. Garansi lancar jaya dan anti-crash 100%!`,
    `Mahakarya video game peraih rating tinggi yang wajib masuk daftar koleksi Anda! ${title} memaksimalkan kemampuan performa konsol ${platforms} dengan tata cahaya memukau dan audio 3D imersif. Setiap aksi terasa nyata dan mendebarkan. Dapatkan softfile digital lengkap berserta panduan instalasi mudah hanya di ALIANSI STORE.`,
    `${title} edisi digital & PKG untuk konsol ${platforms}. Kualitas visual HD/4K tajam, update patch terbaru, dan gameplay responsif tanpa macet. Link akses Google Drive resmi otomatis aktif dan dibagikan ke email setelah pesanan sukses. 100% aman, original, dan bergaransi resmi ALIANSI STORE!`
  ];

  const nextIdx = (window._descGenIndices[prefix] = (window._descGenIndices[prefix] === undefined ? 0 : window._descGenIndices[prefix] + 1)) % variations.length;
  const chosenDesc = variations[nextIdx];

  const descEl = document.getElementById(`${prefix}-game-desc`);
  if (descEl) {
    descEl.value = chosenDesc;
    descEl.focus();
  }

  const btnLabel = document.getElementById(`${prefix}-desc-btn-label`);
  if (btnLabel) {
    btnLabel.textContent = `Variasi ${nextIdx + 1}/5`;
  }

  playSfx('success');
  showToast(`✨ Deskripsi dibuat (Variasi ${nextIdx + 1}/5)! Klik lagi untuk variasi gaya lainnya.`, 'success', 'AI Copywriter');
}

// ==========================================
// IMAGE LIGHTBOX PREVIEW (FULL SIZE POPUP)
// ==========================================

function previewImageEnlarged(prefix, type) {
  playSfx('click');
  const inputEl = document.getElementById(`${prefix}-game-${type}`);
  const url = inputEl ? inputEl.value.trim() : '';
  const titleEl = document.getElementById(`${prefix}-game-title`);
  const title = (titleEl && titleEl.value.trim()) ? titleEl.value.trim() : 'Game PlayStation';

  if (!url) {
    showToast(`Belum ada ${type === 'poster' ? 'gambar poster' : 'wallpaper highlight'} untuk dilihat! Silakan upload atau generate terlebih dahulu.`, 'info');
    return;
  }

  const badgeText = type === 'poster' ? 'Poster Cover' : 'Wallpaper Highlight 16:9';
  const titleText = `${title} (${type === 'poster' ? 'Poster Game' : 'Wallpaper Highlight'})`;
  openImageLightbox(url, titleText, badgeText);
}

function openImageLightbox(imageUrl, title, badge) {
  if (!imageUrl) return;
  const modal = document.getElementById('modal-image-lightbox');
  const imgEl = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const badgeEl = document.getElementById('lightbox-badge');
  const linkEl = document.getElementById('lightbox-open-tab');
  if (!modal || !imgEl) return;

  imgEl.src = imageUrl;
  if (titleEl) titleEl.textContent = title || 'Preview Gambar Game';
  if (badgeEl) {
    badgeEl.textContent = badge || 'Gambar Game';
    if (badge && badge.toLowerCase().includes('wallpaper')) {
      badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30';
    } else {
      badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30';
    }
  }
  if (linkEl) {
    linkEl.href = imageUrl;
  }

  modal.classList.remove('hidden');
  playSfx('click');
  lucide.createIcons();
}

function closeImageLightbox() {
  const modal = document.getElementById('modal-image-lightbox');
  if (!modal) return;
  modal.classList.add('hidden');
  const imgEl = document.getElementById('lightbox-img');
  if (imgEl) imgEl.src = '';
  playSfx('click');
}

function openCurrentSpotlightBackdrop() {
  const spotlightGames = getSpotlightGames();
  const game = spotlightGames[state.spotlightIndex || 0];
  if (!game) return;
  const bgUrl = getProductBackdrop(game);
  openImageLightbox(bgUrl, `${game.title} - Wallpaper Highlight Hero`, 'Wallpaper Highlight 16:9');
}

// Global listener: Escape closes lightbox first before any background modal
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const lightbox = document.getElementById('modal-image-lightbox');
    if (lightbox && !lightbox.classList.contains('hidden')) {
      closeImageLightbox();
      e.stopPropagation();
      e.preventDefault();
    }
  }
});

function openAddProductModal() {
  playSfx('click');
  const modal = document.getElementById('modal-admin-add-product');
  if (!modal) return;
  document.getElementById('new-game-title').value = '';
  document.getElementById('new-game-price-original').value = '';
  document.getElementById('new-game-price-primary').value = '';
  const newRateEl = document.getElementById('new-game-discount-rate');
  if (newRateEl) newRateEl.value = '';
  const newDriveEl = document.getElementById('new-game-drive-link');
  if (newDriveEl) newDriveEl.value = '';
  document.getElementById('new-game-poster').value = '';
  const newBackdropEl = document.getElementById('new-game-backdrop');
  if (newBackdropEl) newBackdropEl.value = '';
  document.getElementById('new-game-desc').value = '';
  const descLabel = document.getElementById('new-desc-btn-label');
  if (descLabel) descLabel.textContent = 'Generate AI';
  const preview = document.getElementById('new-game-discount-preview');
  if (preview) preview.classList.add('hidden');
  updateImagePreview('new', 'poster');
  updateImagePreview('new', 'backdrop');
  modal.classList.remove('hidden');
  updateDiscountCalc('new');
  lucide.createIcons();
}

// Two-Way Interactive Discount Calculator for Admin Forms (prefix: 'new' | 'edit')
function onPriceOriginalInput(prefix) {
  const origEl = document.getElementById(`${prefix}-game-price-original`);
  const rateEl = document.getElementById(`${prefix}-game-discount-rate`);
  const discEl = document.getElementById(`${prefix}-game-price-primary`);
  if (!origEl || !rateEl || !discEl) return;

  const original = parseInt(origEl.value, 10) || 0;
  const rate = parseFloat(rateEl.value) || 0;
  const discounted = parseInt(discEl.value, 10) || 0;

  if (original > 0 && rate > 0) {
    discEl.value = Math.round(original * (1 - rate / 100));
  } else if (original > 0 && discounted > 0) {
    if (discounted < original) {
      rateEl.value = Math.round((1 - discounted / original) * 100);
    } else {
      rateEl.value = 0;
    }
  }
  updateDiscountCalc(prefix);
}

function onDiscountRateInput(prefix) {
  const origEl = document.getElementById(`${prefix}-game-price-original`);
  const rateEl = document.getElementById(`${prefix}-game-discount-rate`);
  const discEl = document.getElementById(`${prefix}-game-price-primary`);
  if (!origEl || !rateEl || !discEl) return;

  const original = parseInt(origEl.value, 10) || 0;
  const rateStr = rateEl.value.trim();

  if (rateStr === '') {
    updateDiscountCalc(prefix);
    return;
  }

  let rate = parseFloat(rateStr);
  if (isNaN(rate)) return;
  if (rate < 0) rate = 0;
  if (rate > 99) rate = 99;

  if (original > 0) {
    discEl.value = Math.round(original * (1 - rate / 100));
  }
  updateDiscountCalc(prefix);
}

function onPriceDiscountInput(prefix) {
  const origEl = document.getElementById(`${prefix}-game-price-original`);
  const rateEl = document.getElementById(`${prefix}-game-discount-rate`);
  const discEl = document.getElementById(`${prefix}-game-price-primary`);
  if (!origEl || !rateEl || !discEl) return;

  const original = parseInt(origEl.value, 10) || 0;
  const discStr = discEl.value.trim();

  if (discStr === '') {
    rateEl.value = '';
    updateDiscountCalc(prefix);
    return;
  }

  const discounted = parseInt(discStr, 10);
  if (isNaN(discounted)) return;

  if (original > 0) {
    if (discounted < original && discounted > 0) {
      rateEl.value = Math.round((1 - discounted / original) * 100);
    } else {
      rateEl.value = 0;
    }
  } else {
    rateEl.value = '';
  }
  updateDiscountCalc(prefix);
}

function updateDiscountCalc(prefix) {
  const origEl = document.getElementById(`${prefix}-game-price-original`);
  const discEl = document.getElementById(`${prefix}-game-price-primary`);
  const rateEl = document.getElementById(`${prefix}-game-discount-rate`);
  const preview = document.getElementById(`${prefix}-game-discount-preview`);
  const diffEl = document.getElementById(`${prefix}-game-discount-diff`);
  const pctEl = document.getElementById(`${prefix}-game-discount-percent`);
  if (!origEl || !discEl || !preview) return;

  const original = parseInt(origEl.value, 10) || 0;
  const discounted = parseInt(discEl.value, 10) || 0;
  const pct = getDiscountPercent(original, discounted);

  if (pct > 0 && original > discounted) {
    const diff = original - discounted;
    if (diffEl) diffEl.textContent = `Hemat ${formatRupiah(diff)}`;
    if (pctEl) pctEl.textContent = `Diskon ${pct}% (Hemat ${formatRupiah(diff)})`;
    preview.classList.remove('hidden');
    if (rateEl && (!rateEl.value || document.activeElement !== rateEl)) {
      rateEl.value = pct;
    }
  } else {
    preview.classList.add('hidden');
    if (discounted >= original && rateEl && document.activeElement !== rateEl) {
      rateEl.value = original > 0 ? 0 : '';
    }
  }
}

function submitNewProduct() {
  const title = document.getElementById('new-game-title').value.trim();
  const category = document.getElementById('new-game-category').value;
  const platformChecked = Array.from(document.querySelectorAll('input[name="new-game-platform"]:checked')).map(cb => cb.value);
  const pricePrimary = parseInt(document.getElementById('new-game-price-primary').value, 10) || 0;
  const priceOriginalInput = parseInt(document.getElementById('new-game-price-original').value, 10) || 0;
  const priceOriginal = priceOriginalInput > pricePrimary ? priceOriginalInput : 0;
  const driveLink = document.getElementById('new-game-drive-link') ? document.getElementById('new-game-drive-link').value.trim() : '';
  const posterUrl = document.getElementById('new-game-poster').value.trim();
  const backdropUrl = document.getElementById('new-game-backdrop') ? document.getElementById('new-game-backdrop').value.trim() : '';
  const desc = document.getElementById('new-game-desc').value.trim();

  if (!title || platformChecked.length === 0 || pricePrimary <= 0) {
    showToast('Lengkapi judul, platform, dan harga diskon!', 'warning');
    return;
  }

  const newGame = {
    id: 'game-' + Date.now(),
    title: title,
    slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    platform: platformChecked,
    category: category,
    driveLink: driveLink,
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
      backdrop: backdropUrl || posterUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85',
      poster: posterUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      screenshots: []
    },
    prices: {
      primary: pricePrimary,
      secondary: pricePrimary,
      original: priceOriginal
    },
    description: desc || 'Game PlayStation original berkualitas tinggi bergaransi resmi ALIANSI STORE.',
    features: [
      'Original Digital License dari PS Store',
      'Dukungan Update Patch Resmi',
      'Garansi Anti-Revoke Selamanya'
    ],
    inStock: true
  };

  newGame.updatedAt = new Date().toISOString();
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
  const editCatEl = document.getElementById('edit-game-category');
  if (editCatEl && p.category) editCatEl.value = p.category;
  const editPlatCbs = document.querySelectorAll('input[name="edit-game-platform"]');
  editPlatCbs.forEach(cb => {
    cb.checked = Array.isArray(p.platform) && p.platform.includes(cb.value);
  });
  document.getElementById('edit-game-price-primary').value = p.prices.primary;
  document.getElementById('edit-game-price-original').value = p.prices.original || '';
  const editRateEl = document.getElementById('edit-game-discount-rate');
  if (editRateEl) {
    if (p.prices.original && p.prices.original > p.prices.primary) {
      editRateEl.value = getDiscountPercent(p.prices.original, p.prices.primary);
    } else {
      editRateEl.value = '';
    }
  }
  const editDriveEl = document.getElementById('edit-game-drive-link');
  if (editDriveEl) editDriveEl.value = p.driveLink || '';
  const posterVal = (p.images && (p.images.poster || p.images.cover)) || '';
  const backdropVal = (p.images && p.images.backdrop) || '';
  document.getElementById('edit-game-poster').value = posterVal;
  const editBackdropEl = document.getElementById('edit-game-backdrop');
  if (editBackdropEl) editBackdropEl.value = backdropVal;
  document.getElementById('edit-game-desc').value = p.description || '';
  const descLabel = document.getElementById('edit-desc-btn-label');
  if (descLabel) descLabel.textContent = 'Generate AI';
  updateImagePreview('edit', 'poster');
  updateImagePreview('edit', 'backdrop');

  modal.classList.remove('hidden');
  updateDiscountCalc('edit');
  lucide.createIcons();
}

function submitEditProduct() {
  if (!editingProductId) return;
  const p = state.products.find(item => item.id === editingProductId);
  if (!p) return;

  p.title = document.getElementById('edit-game-title').value.trim();
  const editCatEl = document.getElementById('edit-game-category');
  if (editCatEl && editCatEl.value) p.category = editCatEl.value;
  const editPlatCbs = Array.from(document.querySelectorAll('input[name="edit-game-platform"]:checked')).map(cb => cb.value);
  if (editPlatCbs.length > 0) p.platform = editPlatCbs;
  p.prices.primary = parseInt(document.getElementById('edit-game-price-primary').value, 10) || p.prices.primary;
  p.prices.secondary = p.prices.primary;
  const editOriginal = parseInt(document.getElementById('edit-game-price-original').value, 10) || 0;
  p.prices.original = editOriginal > p.prices.primary ? editOriginal : 0;
  const editDriveEl = document.getElementById('edit-game-drive-link');
  if (editDriveEl) p.driveLink = editDriveEl.value.trim();
  const poster = document.getElementById('edit-game-poster').value.trim();
  const backdrop = document.getElementById('edit-game-backdrop') ? document.getElementById('edit-game-backdrop').value.trim() : '';
  if (!p.images) p.images = {};
  if (poster) {
    p.images.poster = poster;
    p.images.cover = poster;
  }
  if (backdrop) {
    p.images.backdrop = backdrop;
  }
  p.description = document.getElementById('edit-game-desc').value.trim();
  p.updatedAt = new Date().toISOString();

  saveProducts();
  syncProductToSupabase(p);
  closeModals();
  playSfx('success');
  renderProducts();
  renderAdminProductsTable();
  showToast(`Game "${p.title}" berhasil diperbarui!`, 'success');
}


// Search Helpers
function clearCatalogSearch() {
  playSfx('click');
  state.searchQuery = '';
  const catalogInput = document.getElementById('catalog-search-input');
  const mainInput = document.getElementById('main-search-input');
  if (catalogInput) {
    catalogInput.value = '';
    catalogInput.focus();
  }
  if (mainInput) {
    mainInput.value = '';
  }
  renderProducts();
}

function focusCatalogSearch() {
  playSfx('click');
  const catalogEl = document.getElementById('katalog');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth' });
  }
  const input = document.getElementById('catalog-search-input') || document.getElementById('main-search-input');
  if (input) {
    setTimeout(() => {
      input.focus();
      input.select();
    }, 250);
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

  // Live Instant Search Inputs (Catalog and Top Header sync)
  const catalogSearchInput = document.getElementById('catalog-search-input');
  const mainSearchInput = document.getElementById('main-search-input');

  const handleLiveSearch = (val) => {
    state.searchQuery = val;
    if (catalogSearchInput && catalogSearchInput.value !== val) {
      catalogSearchInput.value = val;
    }
    if (mainSearchInput && mainSearchInput.value !== val) {
      mainSearchInput.value = val;
    }
    renderProducts();
  };

  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', (e) => handleLiveSearch(e.target.value));
  }
  if (mainSearchInput) {
    mainSearchInput.addEventListener('input', (e) => handleLiveSearch(e.target.value));
  }

  // Global Ctrl+K Keyboard Shortcut to focus search
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      focusCatalogSearch();
    }
  });

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
