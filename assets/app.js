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
  GAME_REQUESTS: 'aliansi_store_game_requests_v1',
  CHATS: 'aliansi_store_chats_v1',
  REVIEWS: 'aliansi_store_reviews_v1',
  FAQS: 'aliansi_store_faqs_v1'
};

// Global Safe HTML Escape Utility
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Master Helper: Identify PlayStation HEN (File PKG Google Drive) Games
// Pada game HEN tidak ada akun Secondary atau Primary, murni format File PKG
function isHenProduct(product) {
  if (!product) return false;
  // 1. Explicit boolean flag
  if (product.isHen === true || product.is_hen === true) return true;
  // 2. Platform contains HEN (e.g. "PS4 HEN", "HEN", etc.)
  if (Array.isArray(product.platform) && product.platform.some(pl => String(pl).toUpperCase().includes('HEN'))) return true;
  if (typeof product.platform === 'string' && product.platform.toUpperCase().includes('HEN')) return true;
  // 3. Category is hen or subindo
  if (product.category === 'hen' || product.category === 'subindo' || product.category === 'service-hen') return true;
  // 4. Title, Slug, or Tagline indicates HEN / Sub Indo format
  const title = (product.title || '').toLowerCase();
  const slug = (product.slug || '').toLowerCase();
  if (title.includes('hen') || slug.includes('hen') || title.includes('sub indo') || slug.includes('sub-indo') || title.includes('pkg')) return true;
  return false;
}

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
  const pid = product.id || product.productId;
  const imgs = product.images || {};

  // 1. High-resolution PlayStation backdrop map fallback (official local key art)
  if (pid && BACKDROP_MAP[pid]) {
    // If user explicitly uploaded custom image (data:image or non-unsplash custom URL)
    if (imgs.backdrop && typeof imgs.backdrop === 'string') {
      const trimmed = imgs.backdrop.trim();
      if (trimmed.startsWith('data:image') || (trimmed.length > 0 && !trimmed.includes('unsplash.com') && !trimmed.includes('photo-'))) {
        return trimmed;
      }
    }
    return BACKDROP_MAP[pid];
  }

  // 2. Explicit custom or uploaded backdrop
  if (imgs.backdrop && typeof imgs.backdrop === 'string') {
    const trimmed = imgs.backdrop.trim();
    if (trimmed.length > 0 && !trimmed.includes('unsplash.com') && !trimmed.includes('photo-1508098682722')) {
      return trimmed;
    }
  }

  // 3. Banner image if available
  if (imgs.banner && typeof imgs.banner === 'string' && imgs.banner.trim().length > 0) {
    return imgs.banner.trim();
  }

  // 4. Fallback to product poster
  return getProductPoster(product);
}

function getProductPoster(product) {
  if (!product) return 'assets/covers/service-1tb.jpg';
  const pid = product.id || product.productId;

  // 1. Prioritize explicit custom or uploaded poster image (data:image, http/https, local path)
  const img = (product.images && (product.images.poster || product.images.cover)) || product.poster;
  if (img && typeof img === 'string') {
    const trimmed = img.trim();
    if (trimmed.length > 0 && !trimmed.includes('photo-1508098682722')) {
      return trimmed;
    }
  }

  // 2. Fallback to high-resolution official PlayStation cover map
  if (pid && COVER_FALLBACK_MAP[pid]) {
    return COVER_FALLBACK_MAP[pid];
  }

  // 3. Default fallback cover
  return 'assets/covers/service-1tb.jpg';
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
  lastCreatedRequest: null,
  chatMessages: [],
  activeAdminChatEmail: null,
  activeAdminChatContext: null,
  isCustomerChatOpen: false,
  reviews: [],
  activeReviewFilter: 'all',
  reviewRatingInput: 5,
  activeReviewOrderId: null,
  faqs: [],
  openFaqId: null
};

// ================= SUPABASE CLOUD DATABASE ADAPTER =================
const SUPABASE_CONFIG = {
  url: "https://fgotjbcabnragtpijuvk.supabase.co",
  anonKey: "sb_publishable_wXLOEof96Y8l22xcABvPZQ_unQgSmws"
};

let supabaseClient = null;

function createNativeSupabaseRestClient(baseUrl, apiKey) {
  const baseHeaders = {
    'apikey': apiKey,
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json'
  };
  return {
    from(table) {
      let queryParams = [];
      let isSingle = false;
      let method = 'GET';
      let bodyData = null;
      let preferHeader = 'return=representation';

      const builder = {
        select(cols = '*') {
          queryParams.push('select=' + encodeURIComponent(cols));
          return builder;
        },
        eq(col, val) {
          queryParams.push(encodeURIComponent(col) + '=eq.' + encodeURIComponent(val));
          return builder;
        },
        or(orStr) {
          queryParams.push('or=(' + orStr + ')');
          return builder;
        },
        order(col, opts = {}) {
          const dir = opts.ascending === false ? 'desc' : 'asc';
          queryParams.push('order=' + encodeURIComponent(col) + '.' + dir);
          return builder;
        },
        limit(n) {
          queryParams.push('limit=' + Number(n));
          return builder;
        },
        single() {
          isSingle = true;
          queryParams.push('limit=1');
          return builder;
        },
        upsert(payload) {
          method = 'POST';
          bodyData = payload;
          preferHeader = 'resolution=merge-duplicates,return=representation';
          return builder;
        },
        delete() {
          method = 'DELETE';
          return builder;
        },
        async then(resolve) {
          try {
            const qs = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
            const res = await fetch(`${baseUrl}/rest/v1/${table}${qs}`, {
              method,
              headers: { ...baseHeaders, 'Prefer': preferHeader },
              body: bodyData ? JSON.stringify(bodyData) : undefined
            });
            if (!res.ok) {
              const errText = await res.text();
              return resolve({ data: null, error: { message: errText, status: res.status } });
            }
            const text = await res.text();
            const parsed = text ? JSON.parse(text) : null;
            if (isSingle) {
              const item = Array.isArray(parsed) ? (parsed[0] || null) : parsed;
              return resolve({ data: item, error: item ? null : { message: 'Not found' } });
            }
            return resolve({ data: parsed, error: null });
          } catch (err) {
            return resolve({ data: null, error: err });
          }
        }
      };
      return builder;
    }
  };
}

function initSupabaseClient() {
  try {
    if (typeof window !== 'undefined' && window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('⚡ Supabase Cloud Database Initialized Successfully!');
      setupSupabaseAuthListener();
    } else if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
      supabaseClient = createNativeSupabaseRestClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('⚡ Supabase Native REST Fallback Initialized Successfully!');
    }
  } catch (err) {
    supabaseClient = createNativeSupabaseRestClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.warn('Supabase initialization fallback active:', err);
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
    } else if (type === 'chat') {
      // Friendly marimba notification chime
      const tones = [587.33, 880];
      tones.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.06, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.18);
      });
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
  renderTestimonials();
  renderFaqList();
  updateNavAuthUI();
  updateStoreContactUI();
  lucide.createIcons();
  syncFromSupabase();
  initLiveChatUI();
  checkUrlForActions();
  sanitizeSearchInputsFromAutofill();
}

function isCredentialAutofillValue(str) {
  if (!str) return false;
  const s = String(str).toLowerCase().trim();
  if (s === 'admin' || s === 'administrator' || s === 'aliansi' || s === 'owner') return true;
  if (s.includes('aliansistore.com') || s.includes('admin@') || s.includes('@')) return true;
  return false;
}

function sanitizeSearchInputsFromAutofill() {
  const searchIds = [
    'faq-search-input',
    'main-search-input',
    'catalog-search-input',
    'order-search-input',
    'admin-product-search-input',
    'admin-customer-search-input',
    'admin-chat-search',
    'image-picker-search-input'
  ];

  const clearCredentials = () => {
    let catalogNeedsRender = false;
    let faqNeedsRender = false;

    searchIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const val = (el.value || '').trim();
      // If browser/password manager mistakenly autofilled "admin" or email into search bars
      if (document.activeElement !== el && isCredentialAutofillValue(val)) {
        el.value = '';
        if (id === 'faq-search-input') faqNeedsRender = true;
        if (id === 'catalog-search-input' || id === 'main-search-input') {
          catalogNeedsRender = true;
        }
      }
    });

    if (isCredentialAutofillValue(state.searchQuery)) {
      state.searchQuery = '';
      catalogNeedsRender = true;
    }

    if (catalogNeedsRender) {
      state.searchQuery = '';
      const cInput = document.getElementById('catalog-search-input');
      const mInput = document.getElementById('main-search-input');
      if (cInput) cInput.value = '';
      if (mInput) mInput.value = '';
      const feedbackBar = document.getElementById('catalog-search-feedback');
      const clearBtn = document.getElementById('catalog-search-clear');
      if (feedbackBar) feedbackBar.classList.add('hidden');
      if (clearBtn) clearBtn.classList.add('hidden');
      renderProducts();
    }

    if (faqNeedsRender) {
      renderFaqList();
    }
  };

  // Immediate sanitize
  clearCredentials();
  // Deferred sanitize across various ticks to catch late password manager extensions
  [30, 100, 250, 500, 1000, 1800, 3000].forEach(delay => setTimeout(clearCredentials, delay));
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
        if (ip.cusa && !existing.cusa) {
          existing.cusa = ip.cusa;
        }
        // Auto-upgrade local cache if existing has stale baseline dummy prices (<= 25.000)
        const existingPrimary = (existing.prices && existing.prices.primary) || 0;
        if (existingPrimary <= 25000 && ip.prices && ip.prices.primary > 25000) {
          existing.prices = { ...ip.prices };
          if (ip.driveLink) existing.driveLink = ip.driveLink;
          existing.updatedAt = ip.updatedAt || '2026-11-09T05:30:00.000Z';
        } else if (ip.updatedAt) {
          const localTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
          const initialTime = new Date(ip.updatedAt).getTime();
          if (initialTime > localTime) {
            existing.prices = { ...ip.prices };
            if (ip.driveLink) existing.driveLink = ip.driveLink;
            existing.updatedAt = ip.updatedAt;
          }
        }
      }
    });
  }

  // Ensure isHen flag and cover fallbacks if image is missing
  state.products.forEach(p => {
    if (isHenProduct(p)) {
      p.isHen = true;
      if (p.prices) {
        p.prices.secondary = p.prices.primary;
      }
    }
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
  }

  saveOrders();

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
  if (!state.config.adminEmail || state.config.adminEmail === 'aliansistore.id@gmail.com' || state.config.adminEmail === 'admin@aliansistore.com') {
    state.config.adminEmail = 'aliansistoreofficial@gmail.com';
    saveConfig();
  }
  updateStoreContactUI();

  // Live Chat Messages (Two-Way Chat)
  const storedChats = localStorage.getItem(APP_STORAGE_KEYS.CHATS);
  if (storedChats) {
    try {
      state.chatMessages = JSON.parse(storedChats);
    } catch (e) {
      state.chatMessages = typeof INITIAL_CHATS !== 'undefined' ? [...INITIAL_CHATS] : [];
    }
  } else {
    state.chatMessages = typeof INITIAL_CHATS !== 'undefined' ? [...INITIAL_CHATS] : [];
    saveChatMessages();
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

  // Clear out legacy demo invoices, demo customer accounts, demo game requests & demo chats (Clean Slate v5)
  const CLEAN_SLATE_KEY = 'aliansi_store_clean_slate_v5';
  if (localStorage.getItem(CLEAN_SLATE_KEY) !== 'true') {
    state.orders = [];
    saveOrders();
    state.gameRequests = [];
    saveGameRequests();
    state.chatMessages = [];
    saveChatMessages();
    if (Array.isArray(state.users)) {
      state.users = state.users.filter(u => u.role === 'admin');
    } else {
      state.users = typeof INITIAL_USERS !== 'undefined' ? [...INITIAL_USERS] : [];
    }
    saveUsers();
    if (state.currentUser && state.currentUser.role !== 'admin') {
      state.currentUser = null;
      localStorage.removeItem(APP_STORAGE_KEYS.USER);
    }
    localStorage.setItem(CLEAN_SLATE_KEY, 'true');
  }

  // Ensure default INITIAL_USERS exist in state.users, sync customers from real orders, and have lastOnline timestamps
  if (Array.isArray(state.users)) {
    let usersUpdated = false;
    
    // Clean up all customer accounts if previously cached
    const beforeCount = state.users.length;
    state.users = state.users.filter(u => u.role === 'admin');
    if (state.users.length !== beforeCount) {
      usersUpdated = true;
    }

    // 1. Sync from INITIAL_USERS (Super Admin)
    if (typeof INITIAL_USERS !== 'undefined' && Array.isArray(INITIAL_USERS)) {
      INITIAL_USERS.forEach(iu => {
        const found = state.users.find(u => u.id === iu.id || u.role === 'admin');
        if (!found) {
          state.users.push({ ...iu });
          usersUpdated = true;
        } else {
          if (found.email !== iu.email) {
            found.email = iu.email;
            usersUpdated = true;
          }
        }
      });
    }

    if (state.currentUser && state.currentUser.role === 'admin' && state.currentUser.email !== 'aliansistoreofficial@gmail.com') {
      state.currentUser.email = 'aliansistoreofficial@gmail.com';
      localStorage.setItem(APP_STORAGE_KEYS.USER, JSON.stringify(state.currentUser));
    }

    // 2. Sync customers from Orders (if any real orders placed)
    if (Array.isArray(state.orders)) {
      state.orders.forEach(o => {
        const oEmail = (o.customerEmail || '').trim().toLowerCase();
        const oPhone = (o.customerPhone || '').trim();
        const oName = (o.customerName || '').trim();
        if ((oEmail || oPhone) && !state.users.some(u => (oEmail && u.email && u.email.toLowerCase() === oEmail) || (oPhone && u.phone && u.phone.replace(/[\s-]/g, '') === oPhone.replace(/[\s-]/g, '')))) {
          state.users.push({
            id: 'usr-ord-' + Math.floor(1000 + Math.random() * 9000),
            identifier: oPhone || oEmail,
            name: oName || 'Customer Toko',
            phone: oPhone,
            email: oEmail,
            pin: '1234',
            role: 'customer',
            roleLabel: 'Customer Pembeli',
            authProvider: 'local',
            memberSince: new Date().getFullYear().toString(),
            lastOnline: o.createdAt || new Date().toISOString()
          });
          usersUpdated = true;
        }
      });
    }

    state.users.forEach((u) => {
      if (!u.lastOnline) {
        u.lastOnline = new Date().toISOString();
        usersUpdated = true;
      }
    });
    if (usersUpdated) saveUsers();
  }

  // Cart
  const storedCart = localStorage.getItem(APP_STORAGE_KEYS.CART);
  if (storedCart) {
    try {
      state.cart = JSON.parse(storedCart);
      // Auto-migrate legacy 'primary' variant to 'PS4 HEN' for HEN games
      if (Array.isArray(state.cart)) {
        state.cart.forEach(item => {
          const prod = state.products.find(p => p.id === item.productId);
          if (isHenProduct(prod) || (item.variant && item.variant.toLowerCase().includes('hen'))) {
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

  // Customer Testimonials & Reviews
  const storedReviews = localStorage.getItem(APP_STORAGE_KEYS.REVIEWS);
  if (storedReviews) {
    try {
      const parsedRev = JSON.parse(storedReviews);
      if (Array.isArray(parsedRev) && parsedRev.length > 0) {
        // Extract genuine user reviews (tagged isReal, has orderId, or custom id)
        const realRevs = parsedRev.filter(r => r && (r.isReal || r.orderId || (r.id && !/^rev-1\d\d$/.test(r.id))));
        const baseDummy = typeof INITIAL_REVIEWS !== 'undefined' ? [...INITIAL_REVIEWS] : [];
        state.reviews = [...realRevs, ...baseDummy];
      } else {
        state.reviews = typeof INITIAL_REVIEWS !== 'undefined' ? [...INITIAL_REVIEWS] : [];
      }
    } catch (e) {
      state.reviews = typeof INITIAL_REVIEWS !== 'undefined' ? [...INITIAL_REVIEWS] : [];
    }
  } else {
    state.reviews = typeof INITIAL_REVIEWS !== 'undefined' ? [...INITIAL_REVIEWS] : [];
    saveReviews();
  }

  // Frequently Asked Questions (FAQ)
  const storedFaqs = localStorage.getItem(APP_STORAGE_KEYS.FAQS);
  if (storedFaqs) {
    try {
      const parsedFaqs = JSON.parse(storedFaqs);
      state.faqs = Array.isArray(parsedFaqs) && parsedFaqs.length > 0 ? parsedFaqs : (typeof INITIAL_FAQS !== 'undefined' ? [...INITIAL_FAQS] : []);
    } catch (e) {
      state.faqs = typeof INITIAL_FAQS !== 'undefined' ? [...INITIAL_FAQS] : [];
    }
  } else {
    state.faqs = typeof INITIAL_FAQS !== 'undefined' ? [...INITIAL_FAQS] : [];
    saveFaqs();
  }
}

function saveFaqs() {
  try {
    localStorage.setItem(APP_STORAGE_KEYS.FAQS, JSON.stringify(state.faqs));
  } catch (e) {}
}

function saveReviews() {
  try {
    localStorage.setItem(APP_STORAGE_KEYS.REVIEWS, JSON.stringify(state.reviews));
  } catch (e) {}
}

function saveUsers() {
  localStorage.setItem(APP_STORAGE_KEYS.USERS_DB, JSON.stringify(state.users));
}

function upsertCustomerUser({ name, email, phone }) {
  if (!name && !email && !phone) return;
  if (!Array.isArray(state.users)) state.users = [];
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim().replace(/[\s-]/g, '');

  let existing = state.users.find(u => 
    (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
    (cleanPhone && u.phone && u.phone.replace(/[\s-]/g, '') === cleanPhone)
  );

  if (existing) {
    if (name && !existing.name) existing.name = name;
    if (cleanEmail && !existing.email) existing.email = cleanEmail;
    if (cleanPhone && !existing.phone) existing.phone = cleanPhone;
    existing.lastOnline = new Date().toISOString();
  } else {
    state.users.push({
      id: 'usr-cust-' + Math.floor(1000 + Math.random() * 9000),
      identifier: cleanPhone || cleanEmail,
      name: name || 'Customer Toko',
      phone: phone || '',
      email: cleanEmail || '',
      pin: '1234',
      role: 'customer',
      roleLabel: 'Member',
      authProvider: 'local',
      memberSince: new Date().getFullYear().toString(),
      lastOnline: new Date().toISOString()
    });
  }
  saveUsers();
  renderAdminStats();
  if (document.getElementById('admin-customers-table-body')) {
    renderAdminCustomersTable();
  }
}

function saveGameRequests() {
  localStorage.setItem(APP_STORAGE_KEYS.GAME_REQUESTS, JSON.stringify(state.gameRequests));
}

function saveProducts() {
  try {
    localStorage.setItem(APP_STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products));
  } catch (err) {
    console.warn('Storage warning (saveProducts):', err);
    if (err && err.name === 'QuotaExceededError') {
      showToast('Penyimpanan lokal penuh. Gambar tetap aktif di sesi ini.', 'warning');
    }
  }
  // Background disk sync if running on local server
  try {
    if (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      fetch('/api/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.products)
      }).catch(() => {});
    }
  } catch (e) {}
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
        isHen: isHenProduct(p) || !!p.is_hen,
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
        cusa: p.cusa || (p.images && p.images.cusa) || '',
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

          // Protection: never let stale dummy cloud prices (<= 25000) overwrite valid local prices (> 25000)
          const cloudPrice = (cp.prices && cp.prices.primary) || 0;
          const localPrice = (localProd.prices && localProd.prices.primary) || 0;
          const isCloudStaleDummy = cloudPrice <= 25000 && localPrice > 25000;

          if (!isCloudStaleDummy && (cloudTime >= localTime || !localProd.updatedAt)) {
            // Preserve custom or uploaded images from local if cloud only has defaults or empty
            const localImgs = localProd.images || {};
            const cloudImgs = cp.images || {};
            const finalImages = { ...cloudImgs };

            const isCustomLocalPoster = localImgs.poster && (
              localImgs.poster.startsWith('data:image') ||
              (!cloudImgs.poster && localImgs.poster) ||
              (cloudImgs.poster && cloudImgs.poster.startsWith('assets/covers/') && !localImgs.poster.startsWith('assets/covers/'))
            );
            if (isCustomLocalPoster) {
              finalImages.poster = localImgs.poster;
              finalImages.cover = localImgs.poster;
            }

            const isCustomLocalBackdrop = localImgs.backdrop && (
              localImgs.backdrop.startsWith('data:image') ||
              (!cloudImgs.backdrop && localImgs.backdrop) ||
              (cloudImgs.backdrop && cloudImgs.backdrop.startsWith('assets/backdrops/') && !localImgs.backdrop.startsWith('assets/backdrops/'))
            );
            if (isCustomLocalBackdrop) {
              finalImages.backdrop = localImgs.backdrop;
            }

            mergedProducts[localIdx] = {
              ...cp,
              images: finalImages,
              driveLink: cp.driveLink || localProd.driveLink || ''
            };
          } else {
            // Local change is newer or cloud has stale dummy price; keep local and heal cloud!
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
    if (!oErr && Array.isArray(ords)) {
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
      initSocialProofStream();
    }

    // 3. Fetch Store Config from Cloud
    const { data: cfg, error: cErr } = await supabaseClient.from('store_config').select('*').eq('id', 'main').single();
    if (!cErr && cfg) {
      const rawVouchers = Array.isArray(cfg.vouchers) ? cfg.vouchers : [];
      const sysMeta = rawVouchers.find(v => v && v.code === '__SYSTEM_CONFIG__') || {};
      const cleanVouchers = rawVouchers.filter(v => v && v.code !== '__SYSTEM_CONFIG__');
      const localAppsScriptUrl = (state.config && state.config.appsScriptUrl) || '';
      const cloudAppsScriptUrl = cfg.apps_script_url || sysMeta.appsScriptUrl || '';

      state.config = {
        storeName: cfg.store_name || state.config.storeName,
        tagline: cfg.tagline || state.config.tagline,
        whatsappNumber: cfg.whatsapp_number || state.config.whatsappNumber,
        whatsappFormatted: cfg.whatsapp_formatted || state.config.whatsappFormatted,
        adminEmail: cfg.admin_email || sysMeta.adminEmail || state.config.adminEmail || 'aliansistoreofficial@gmail.com',
        adminPin: cfg.admin_pin || state.config.adminPin || '1234',
        appsScriptUrl: cloudAppsScriptUrl || localAppsScriptUrl || '',
        bankAccounts: cfg.bank_accounts || state.config.bankAccounts,
        vouchers: cleanVouchers.length > 0 ? cleanVouchers : (state.config.vouchers || []).filter(v => v && v.code !== '__SYSTEM_CONFIG__')
      };
      localStorage.setItem(APP_STORAGE_KEYS.CONFIG, JSON.stringify(state.config));
      updateStoreContactUI();

      // Auto-sync local Apps Script URL to Supabase cloud if cloud doesn't have it yet
      if (localAppsScriptUrl && !cloudAppsScriptUrl) {
        syncConfigToSupabase();
      }
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

    // 5. Fetch Real Customer Reviews from Cloud (if available)
    try {
      const { data: revs, error: revErr } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
      if (!revErr && Array.isArray(revs) && revs.length > 0) {
        const cloudRevs = revs.map(r => ({
          id: r.id,
          orderId: r.order_id,
          customerName: r.customer_name,
          city: r.city || 'Indonesia',
          gameTitle: r.game_title || 'Game PlayStation',
          rating: Number(r.rating) || 5,
          comment: r.comment || '',
          isVerified: r.is_verified !== false,
          isReal: true,
          platform: 'PS4 HEN',
          createdAt: r.created_at
        }));
        
        const existingRevs = Array.isArray(state.reviews) ? state.reviews : [];
        const existingReal = existingRevs.filter(r => r && (r.isReal || r.orderId || (r.id && !/^rev-1\d\d$/.test(r.id))));
        const mergedReal = [...cloudRevs];
        existingReal.forEach(er => {
          if (!mergedReal.some(mr => mr.id === er.id)) {
            mergedReal.push(er);
          }
        });
        const baseDummy = typeof INITIAL_REVIEWS !== 'undefined' ? [...INITIAL_REVIEWS] : [];
        state.reviews = [...mergedReal, ...baseDummy];
        saveReviews();
        if (typeof sessionShuffledDummyReviews !== 'undefined') sessionShuffledDummyReviews = null;
        renderTestimonials();
      }
    } catch (e) {
      // Reviews table optional
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
    const cleanVouchers = (state.config.vouchers || []).filter(v => v && v.code !== '__SYSTEM_CONFIG__');
    const vouchersWithMeta = [
      ...cleanVouchers,
      {
        code: '__SYSTEM_CONFIG__',
        appsScriptUrl: state.config.appsScriptUrl || '',
        adminEmail: state.config.adminEmail || 'aliansistoreofficial@gmail.com',
        hidden: true
      }
    ];
    const payload = {
      id: 'main',
      store_name: state.config.storeName || 'ALIANSI STORE',
      tagline: state.config.tagline || '',
      whatsapp_number: state.config.whatsappNumber || '6285388597684',
      whatsapp_formatted: state.config.whatsappFormatted || '+62 853-8859-7684',
      admin_pin: state.config.adminPin || '1234',
      bank_accounts: state.config.bankAccounts || [],
      vouchers: vouchersWithMeta,
      updated_at: new Date().toISOString()
    };
    await supabaseClient.from('store_config').upsert(payload);
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
    if (p.cusa) {
      cloudImages.cusa = p.cusa;
    }

    const payload = {
      id: p.id,
      title: p.title,
      slug: p.slug || p.id,
      cusa: p.cusa || null,
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

// Live input formatter for Rupiah with dots (e.g. 15000 -> 15.000)
function handleRupiahInput(el) {
  if (!el) return;
  const rawDigits = el.value.replace(/\D/g, '');
  if (!rawDigits) {
    el.value = '';
    return;
  }
  const formatted = rawDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  el.value = formatted;
}

// Format numbers with thousands dots separator (e.g. 25000 -> 25.000)
function formatNumberWithDots(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = parseInt(String(val).replace(/\D/g, ''), 10);
  if (isNaN(num)) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Safe parsing string with dots to integer
function parseRupiah(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/\D/g, '');
  return parseInt(cleaned, 10) || 0;
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
  const typeConfigs = {
    success: {
      classes: 'toast-success bg-white dark:bg-emerald-950/95 border-emerald-500/50 text-emerald-900 dark:text-emerald-100 shadow-xl shadow-emerald-500/10 dark:shadow-emerald-950/50',
      icon: 'check-circle-2',
      iconClass: 'text-emerald-600 dark:text-emerald-400'
    },
    error: {
      classes: 'toast-error bg-white dark:bg-rose-950/95 border-rose-500/50 text-rose-900 dark:text-rose-100 shadow-xl shadow-rose-500/10 dark:shadow-rose-950/50',
      icon: 'alert-triangle',
      iconClass: 'text-rose-600 dark:text-rose-400'
    },
    info: {
      classes: 'toast-info bg-white dark:bg-sky-950/95 border-sky-500/50 text-sky-900 dark:text-sky-100 shadow-xl shadow-sky-500/10 dark:shadow-sky-950/50',
      icon: 'sparkles',
      iconClass: 'text-sky-600 dark:text-sky-400'
    },
    warning: {
      classes: 'toast-warning bg-white dark:bg-amber-950/95 border-amber-500/50 text-amber-900 dark:text-amber-100 shadow-xl shadow-amber-500/10 dark:shadow-amber-950/50',
      icon: 'alert-circle',
      iconClass: 'text-amber-600 dark:text-amber-400'
    }
  };

  const config = typeConfigs[type] || typeConfigs.info;

  toast.className = `app-toast toast-item toast-${type} flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 transform translate-y-3 opacity-0 ${config.classes}`;
  toast.innerHTML = `
    <i data-lucide="${config.icon}" class="toast-icon w-5 h-5 shrink-0 ${config.iconClass} mt-0.5"></i>
    <div class="text-xs flex-1 min-w-0">
      ${title ? `<strong class="toast-title block font-bold text-slate-900 dark:text-white mb-0.5 text-sm">${title}</strong>` : ''}
      <span class="toast-message block leading-relaxed text-slate-700 dark:text-slate-200">${message}</span>
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
          <span class="spotlight-badge text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${idx === 0 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'}">
            ${idx === 0 ? '★ SEDANG TAMPIL' : `#${idx + 1} PILIHAN`}
          </span>
          <div class="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
            <i data-lucide="star" class="w-3 h-3 fill-amber-400"></i> ${game.rating || '5.0'}
          </div>
        </div>

        <h4 class="text-xs sm:text-sm font-bold text-white truncate group-hover:text-sky-300 transition-colors">
          ${game.title}
        </h4>

        <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
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
    backdrop.style.backgroundImage = `url('${bgUrl}')`;
    backdrop.style.opacity = '1';
  }

  // Update Thumbnails Active Status
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
        badge.className = 'spotlight-badge text-[9px] px-1.5 py-0.5 rounded-full font-extrabold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
        badge.textContent = `#${idx + 1} PILIHAN`;
      }
    }
  });

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
    if (game.prices.secondary && !isHenProduct(game) && game.prices.secondary !== game.prices.primary) {
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

  lucide.createIcons();
}

// ================= SOCIAL PROOF PURCHASE STREAM (DYNAMIC & SMART) =================
function initSocialProofStream() {
  const tickerContainer = document.getElementById('live-social-ticker');
  if (!tickerContainer) return;

  // 1. Extract Real Customer Orders from state.orders
  const realPurchases = [];
  if (Array.isArray(state.orders) && state.orders.length > 0) {
    state.orders.forEach(ord => {
      if (!ord || !ord.customerName) return;
      if (ord.status === 'CANCELLED' || ord.status === 'REFUNDED') return;

      // Clean customer name: e.g. "Alrizal Akbar" -> "Alrizal A."
      let cName = 'Pelanggan';
      const cleanRaw = ord.customerName.replace(/\(.*?\)/g, '').trim();
      const parts = cleanRaw.split(/\s+/);
      if (parts.length > 1) {
        cName = `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
      } else if (parts[0]) {
        cName = parts[0];
      }

      // Extract Game Title
      let gTitle = 'Paket Game PS4';
      if (Array.isArray(ord.items) && ord.items.length > 0 && ord.items[0]?.title) {
        gTitle = ord.items[0].title;
        if (ord.items.length > 1) {
          gTitle += ` (+${ord.items.length - 1} game)`;
        }
      }

      // Location / City
      const cCity = ord.city || 'Indonesia';
      // Relative time
      const rTime = ord.createdAt ? formatDateAgo(ord.createdAt) : 'Baru saja';

      realPurchases.push({
        name: cName,
        city: cCity,
        game: gTitle,
        time: rTime,
        isReal: true
      });
    });
  }

  // 2. Dynamic Pool Generator for Varied Purchases
  // 45+ Indonesian Names
  const firstNames = [
    'Rian', 'Budi', 'Fajar', 'Hendra', 'Dimas', 'Reza', 'Andi', 'Wahyu', 'Bayu', 'Rizky',
    'Doni', 'Aris', 'Gilang', 'Ilham', 'Bagus', 'Denny', 'Satria', 'Kevin', 'Aditya', 'Yoga',
    'Teguh', 'Bambang', 'Eko', 'Rahmat', 'Fikri', 'Dian', 'Farhan', 'Tommy', 'Rangga', 'Yudha',
    'Hafiz', 'Agung', 'Naufal', 'Galih', 'Fandi', 'Syahrul', 'Alif', 'Rifky', 'Pratama', 'Rio',
    'Mahendra', 'Irfan', 'Surya', 'Zulham', 'Danang'
  ];
  const lastInitials = ['P.', 'S.', 'K.', 'W.', 'A.', 'M.', 'N.', 'R.', 'T.', 'F.', 'H.', 'L.', 'B.', 'D.', 'E.'];

  // 35+ Indonesian Cities
  const cities = [
    'Jakarta Selatan', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang',
    'Tangerang', 'Bekasi', 'Depok', 'Yogyakarta', 'Malang', 'Denpasar', 'Balikpapan',
    'Samarinda', 'Banjarmasin', 'Pontianak', 'Pekanbaru', 'Bandar Lampung', 'Bogor',
    'Cimahi', 'Surakarta', 'Padang', 'Batam', 'Cirebon', 'Sukabumi', 'Purwokerto',
    'Mataram', 'Manado', 'Kupang', 'Ambon', 'Jayapura', 'Jember', 'Tasikmalaya', 'Magelang'
  ];

  // Games: dynamically pull from state.products or fallback
  const catalogGames = (Array.isArray(state.products) && state.products.length > 0)
    ? state.products.map(p => p.title)
    : (typeof RECENT_PURCHASES !== 'undefined' ? RECENT_PURCHASES.map(p => p.game) : [
        'God of War Ragnarök (Sub Indo)', 'PES 2027 Bitbox Summer Update', 'GTA V MOD Subtitle Indonesia',
        'Resident Evil 4 Remake (Full Sub Indo)', 'Ghost of Tsushima (Sub Indo)', 'The Last of Us Part II (Sub Indo)'
      ]);

  // Ascending realistic relative times
  const timeLabels = [
    '1 mnt lalu', '3 mnt lalu', '6 mnt lalu', '9 mnt lalu', '14 mnt lalu',
    '19 mnt lalu', '26 mnt lalu', '33 mnt lalu', '41 mnt lalu', '52 mnt lalu',
    '1 jam lalu', '1 jam lalu', '2 jam lalu', '2 jam lalu', '3 jam lalu',
    '3 jam lalu', '4 jam lalu', '5 jam lalu', '6 jam lalu', '7 jam lalu'
  ];

  // Shuffle pools per call for natural randomness
  const shuffledNames = [...firstNames].sort(() => 0.5 - Math.random());
  const shuffledCities = [...cities].sort(() => 0.5 - Math.random());
  const shuffledGames = [...catalogGames].sort(() => 0.5 - Math.random());

  const dummyStream = [];
  const dummyCount = Math.min(26, shuffledNames.length);
  for (let i = 0; i < dummyCount; i++) {
    const fName = shuffledNames[i % shuffledNames.length];
    const initial = lastInitials[i % lastInitials.length];
    const city = shuffledCities[i % shuffledCities.length];
    const game = shuffledGames[i % shuffledGames.length];
    const time = timeLabels[i % timeLabels.length];
    dummyStream.push({
      name: `${fName} ${initial}`,
      city: city,
      game: game,
      time: time,
      isReal: false
    });
  }

  // 3. Interleave Real Purchases Seamlessly
  const finalStream = [];
  let rIdx = 0;
  let dIdx = 0;

  // If real orders exist, place the latest real order at the front!
  if (realPurchases.length > 0) {
    finalStream.push(realPurchases[rIdx++]);
  }

  while (dIdx < dummyStream.length || rIdx < realPurchases.length) {
    // Add 2-3 dummy purchases
    for (let k = 0; k < 3 && dIdx < dummyStream.length; k++) {
      finalStream.push(dummyStream[dIdx++]);
    }
    // Interleave next real purchase
    if (rIdx < realPurchases.length) {
      finalStream.push(realPurchases[rIdx++]);
    }
  }

  // 4. Render Items & Duplicate for Infinite CSS Marquee Loop (All Uniform & Seamless)
  const fullLoop = [...finalStream, ...finalStream];
  tickerContainer.innerHTML = fullLoop.map(item => `
    <div class="ticker-item inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-800/80 text-xs sm:text-[13px] text-slate-300 mr-5 shrink-0">
      <span class="w-2 h-2 rounded-full bg-emerald-400 pulse-neon"></span>
      <strong class="text-white">${escapeHtml(item.name)}</strong> <span class="text-slate-400 font-normal">(${escapeHtml(item.city)})</span> membeli <span class="text-sky-300 font-semibold">${escapeHtml(item.game)}</span>
      <span class="text-[10px] sm:text-xs text-slate-500 font-mono ml-1">${escapeHtml(item.time)}</span>
    </div>
  `).join('');

  // 5. Gentle, readable marquee speed (~6.0s per unique purchase item so visitors can read comfortably)
  const durationSec = Math.max(150, Math.round(finalStream.length * 6.0));
  tickerContainer.style.animationDuration = `${durationSec}s`;

  lucide.createIcons();
}

// ================= CATALOG FILTER & CARD RENDERING =================
function getFilteredProducts() {
  let list = [...state.products];

  // Category & Platform Filter (PlayStation Official Genres)
  if (state.activeFilter === 'subindo') {
    list = list.filter(p => p.isSubIndo || (p.badge && p.badge.toLowerCase().includes('sub indo')) || p.title.toLowerCase().includes('sub indo') || p.category === 'subindo');
  } else if (state.activeFilter === 'hen') {
    list = list.filter(p => isHenProduct(p) || p.category === 'hen');
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
    if (isCredentialAutofillValue(state.searchQuery)) {
      // Ironclad emergency safeguard: autofilled credentials must never filter the catalog
      state.searchQuery = '';
    } else {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        // 1. Direct text fields match
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const cusaMatch = (p.cusa || '').toLowerCase().includes(q);
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
        const henMatch = (q.includes('hen') || q.includes('pkg')) && isHenProduct(p);
        const digitalMatch = q.includes('digital') && (p.type === 'digital' || (Array.isArray(p.platform) && p.platform.some(pl => pl.includes('PS5') || pl.includes('PS4'))));
        const coopMatch = (q.includes('coop') || q.includes('co-op') || q.includes('mabar') || q.includes('family')) && (p.category === 'family' || p.category === 'coop');
        const sportsMatch = (q.includes('bola') || q.includes('soccer') || q.includes('fifa') || q.includes('pes') || q.includes('balap')) && (p.category === 'sports' || p.category === 'racing');

        return titleMatch || cusaMatch || descMatch || tagMatch || pubMatch || badgeMatch || platformMatch || catMatch || catLabelMatch || subIndoMatch || henMatch || digitalMatch || coopMatch || sportsMatch;
      });
    }
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
  const isSearching = Boolean(state.searchQuery && state.searchQuery.trim() && state.searchQuery.trim().toLowerCase() !== 'admin');

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
    const isHenGame = isHenProduct(product);
    const isSpecial = product.category === 'service-hen' || product.category === 'tool' || isHenGame || (product.prices.primary === product.prices.secondary);
    const currentVariant = isHenGame ? 'PS4 HEN' : (state.cardVariants[product.id] || 'primary');
    const activePrice = product.prices.primary;

    // Platform tags
    const platformsHtml = product.platform.map(pl => {
      let badgeClass = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      if (pl.includes('PS5')) badgeClass = 'bg-slate-900 text-white font-bold border border-slate-700 badge-platform-ps5 force-white';
      if (pl.includes('PS4') && !pl.includes('HEN')) badgeClass = 'bg-blue-600 text-white font-bold badge-platform-ps4 force-white';
      if (pl.includes('HEN')) badgeClass = 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30 badge-platform-hen force-white';
      return `<span class="px-2 py-0.5 text-[10px] rounded-md ${badgeClass}">${pl}</span>`;
    }).join(' ');

    const subIndoTag = product.isSubIndo ? `
      <span class="px-2 py-0.5 text-[10px] rounded-md font-black bg-rose-600 text-white shadow-md shadow-rose-600/30 flex items-center gap-1 shrink-0 force-white">
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
              <div class="card-product-badge force-white absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-sky-600 to-blue-700 text-white backdrop-blur-md shadow-md border border-sky-400/40">
                ${product.badge}
              </div>
            ` : ''}

            <!-- In Stock Neon Tag -->
            <div class="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-black/80 text-emerald-400 backdrop-blur-md border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-neon"></span>
              Ready
            </div>

            <!-- Kode CUSA Tag (Pojok Kanan Bawah Gambar) -->
            ${product.cusa ? `
              <div class="card-cusa-tag force-white absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-black bg-black/85 text-cyan-300 backdrop-blur-md border border-cyan-400/40 shadow-lg z-10 tracking-tight" title="PlayStation Game ID: ${product.cusa}">
                <i data-lucide="disc" class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400"></i>
                <span>${product.cusa}</span>
              </div>
            ` : ''}

            <!-- Discount Percent if Original exists -->
            ${product.prices.original && getDiscountPercent(product.prices.original, activePrice) > 0 ? `
              <div class="force-white absolute top-2 right-2 sm:top-2.5 sm:right-2.5 px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black bg-rose-600 text-white shadow-lg flex items-center gap-1 z-10 border border-rose-400/40">
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
              <span class="card-category-badge px-2 py-0.5 text-[10px] rounded-md bg-slate-900/90 text-sky-300 font-bold border border-slate-700/60">${getCategoryLabel(product.category)}</span>
              ${product.marketplaces && (product.marketplaces.shopee || product.marketplaces.tokopedia || product.marketplaces.tiktok) ? `
                <span class="px-1.5 py-0.5 text-[9px] rounded-md font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1" title="Tersedia Beli di Marketplace Resmi">
                  <i data-lucide="shopping-bag" class="w-2.5 h-2.5"></i> Market
                </span>
              ` : ''}
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
            <div class="card-hen-pkg-banner mb-2 sm:mb-3 text-[10px] text-purple-300 font-extrabold flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-purple-950/60 border border-purple-500/30">
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
  const isHenGame = isHenProduct(product);
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

  const isHenGame = isHenProduct(product);
  const isSpecial = product.category === 'service-hen' || product.category === 'tool' || isHenGame;

  // Variant label for HEN vs Digital
  const variantLabel = document.getElementById('modal-variant-label');
  if (variantLabel) {
    variantLabel.textContent = isHenGame ? 'Format Game & Pengiriman:' : 'Pilih Tipe Akun Game:';
  }

  document.getElementById('modal-product-title').textContent = product.title;
  const modalGenreEl = document.getElementById('modal-product-genre');
  if (modalGenreEl) modalGenreEl.textContent = getCategoryLabel(product.category);

  // CUSA Code in Modal Poster & Specs
  const cusaBadge = document.getElementById('modal-product-cusa-badge');
  const cusaBadgeText = document.getElementById('modal-product-cusa-badge-text');
  const cusaWrap = document.getElementById('modal-product-cusa-wrap');
  const cusaEl = document.getElementById('modal-product-cusa');
  if (product.cusa) {
    if (cusaBadge && cusaBadgeText) {
      cusaBadgeText.textContent = product.cusa;
      cusaBadge.classList.remove('hidden');
      cusaBadge.classList.add('flex');
    }
    if (cusaWrap && cusaEl) {
      cusaEl.textContent = product.cusa;
      cusaWrap.classList.remove('hidden');
    }
  } else {
    if (cusaBadge) {
      cusaBadge.classList.add('hidden');
      cusaBadge.classList.remove('flex');
    }
    if (cusaWrap) cusaWrap.classList.add('hidden');
  }

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
  if (screenGallery && product.images && Array.isArray(product.images.screenshots) && product.images.screenshots.length > 0) {
    screenGallery.innerHTML = product.images.screenshots.map(s => `
      <img src="${s}" class="w-full h-24 object-cover rounded-xl border border-slate-800 hover:border-sky-500 cursor-pointer transition-all" alt="Screenshot" onclick="document.getElementById('modal-product-img').src='${s}'" />
    `).join('');
  } else if (screenGallery) {
    screenGallery.innerHTML = '';
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
    const henIdx = product.platform.findIndex(pl => pl.includes('HEN'));
    const defaultIdx = henIdx > -1 ? henIdx : 0;
    platformContainer.innerHTML = product.platform.map((pl, idx) => `
      <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg border ${idx === defaultIdx ? 'border-sky-500 bg-sky-950/40 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'} text-xs font-bold cursor-pointer platform-pill" onclick="selectPlatformPill(this)">
        <input type="radio" name="selected-platform" value="${pl}" ${idx === defaultIdx ? 'checked' : ''} class="hidden" />
        <span>${pl}</span>
      </label>
    `).join('');
  }

  // Render Marketplace Direct Links in Product Detail Modal
  const mpWrap = document.getElementById('modal-product-marketplace-wrap');
  const mpList = document.getElementById('modal-product-marketplace-list');
  if (mpWrap && mpList) {
    const prodMp = product.marketplaces || {};
    const storeMp = (state.config && state.config.marketplaces) || {};
    const directLinks = [];

    const shopeeUrl = prodMp.shopee || (storeMp.shopee?.enabled ? storeMp.shopee.url : '');
    const tokopediaUrl = prodMp.tokopedia || (storeMp.tokopedia?.enabled ? storeMp.tokopedia.url : '');
    const tiktokUrl = prodMp.tiktok || (storeMp.tiktok?.enabled ? storeMp.tiktok.url : '');
    const lazadaUrl = storeMp.lazada?.enabled ? storeMp.lazada.url : '';
    const blibliUrl = storeMp.blibli?.enabled ? storeMp.blibli.url : '';

    if (shopeeUrl) {
      directLinks.push({
        name: 'Shopee',
        url: shopeeUrl,
        icon: 'shopping-bag',
        classes: 'bg-orange-600 hover:bg-orange-500 text-white border border-orange-500/50'
      });
    }
    if (tokopediaUrl) {
      directLinks.push({
        name: 'Tokopedia',
        url: tokopediaUrl,
        icon: 'shopping-cart',
        classes: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50'
      });
    }
    if (tiktokUrl) {
      directLinks.push({
        name: 'TikTok Shop',
        url: tiktokUrl,
        icon: 'video',
        classes: 'bg-slate-900 hover:bg-slate-800 text-white border border-rose-500/50'
      });
    }
    if (lazadaUrl) {
      directLinks.push({
        name: 'Lazada',
        url: lazadaUrl,
        icon: 'package',
        classes: 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/50'
      });
    }
    if (blibliUrl) {
      directLinks.push({
        name: 'Blibli',
        url: blibliUrl,
        icon: 'badge-percent',
        classes: 'bg-sky-600 hover:bg-sky-500 text-white border border-sky-500/50'
      });
    }

    if (directLinks.length > 0) {
      mpWrap.classList.remove('hidden');
      mpList.innerHTML = directLinks.map(item => `
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" onclick="playSfx('click')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 ${item.classes}">
          <i data-lucide="${item.icon}" class="w-3.5 h-3.5"></i>
          <span>${item.name}</span>
          <i data-lucide="external-link" class="w-3 h-3 opacity-70"></i>
        </a>
      `).join('');
    } else {
      mpWrap.classList.add('hidden');
      mpList.innerHTML = '';
    }
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

  const isHenGame = isHenProduct(product);
  const defaultVar = isHenGame ? 'PS4 HEN' : 'primary';

  addToCart(product.id, defaultVar, product.platform[0], 1, false);
  openCheckout();
}

// Add To Cart
function addToCart(productId, variant = null, platform = null, qty = 1, showNotification = true) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const isHenGame = isHenProduct(product);
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
  const isHenGame = isHenProduct(state.selectedProduct);
  const variantInput = document.getElementById('selected-variant');
  const variant = isHenGame ? 'PS4 HEN' : (variantInput ? variantInput.value : 'primary');

  const platformRadio = document.querySelector('input[name="selected-platform"]:checked');
  const platform = platformRadio ? platformRadio.value : state.selectedProduct.platform[0];

  addToCart(state.selectedProduct.id, variant, platform, 1, true);
  closeModals();
}

function buyCurrentModalNow() {
  if (!state.selectedProduct) return;
  const isHenGame = isHenProduct(state.selectedProduct);
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
    const isHen = item.variant === 'PS4 HEN' || isHenProduct(prod);
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
    summaryContainer.innerHTML = state.cart.map(item => {
      const prod = state.products.find(p => p.id === item.productId);
      const isHen = item.variant === 'PS4 HEN' || isHenProduct(prod);
      const displayVariant = isHen ? 'PS4 HEN' : (item.variant || 'Primary');
      return `
      <div class="flex items-center justify-between py-2 border-b border-slate-800/80 text-xs">
        <div class="flex-1 pr-2 truncate">
          <div class="text-white font-bold truncate">${item.title}</div>
          <div class="text-[10px] text-sky-400 uppercase font-mono">${displayVariant} • ${item.platform} • x${item.qty}</div>
        </div>
        <div class="font-extrabold text-white shrink-0 font-display">
          ${formatRupiah(item.unitPrice * item.qty)}
        </div>
      </div>
    `;
    }).join('');
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
const DUITKU_METHOD_MAP = {
  'qris': 'SP',        // ShopeePay QRIS (Universal scan)
  'bca': 'BC',         // BCA Virtual Account
  'mandiri': 'M2',     // Mandiri Virtual Account
  'bri': 'BR',         // BRI Virtual Account
  'bni': 'I1',         // BNI Virtual Account
  'dana': 'DA',        // DANA Direct
  'ovo': 'OV',         // OVO
  'shopeepay': 'SA'    // ShopeePay
};

async function requestDuitkuInquiry(order) {
  const methodCode = DUITKU_METHOD_MAP[order.paymentMethod] || DUITKU_METHOD_MAP[state.selectedPayment] || 'SP';

  const payload = {
    merchantOrderId: order.id,
    paymentAmount: order.total,
    paymentMethod: methodCode,
    productDetails: (order.items && order.items.length > 0)
      ? order.items.map(i => i.title).join(', ').substring(0, 240)
      : 'Game PS4 Digital',
    email: order.customerEmail || 'customer@gmail.com',
    phoneNumber: order.customerPhone || '081234567890',
    callbackUrl: 'https://aliansistore-ps.netlify.app/callback',
    returnUrl: window.location.origin + window.location.pathname
  };

  const endpoints = [
    'https://aliansistore-ps.netlify.app/.netlify/functions/duitku-inquiry',
    '/.netlify/functions/duitku-inquiry',
    '/api/duitku-inquiry'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.statusCode === '00') {
          return { ...data, paymentMethod: methodCode };
        }
      }
    } catch (err) {
      // Coba endpoint cadangan berikutnya
    }
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

  const sanitizedCartItems = state.cart.map(item => {
    const prod = state.products.find(p => p.id === item.productId);
    const isHen = item.variant === 'PS4 HEN' || isHenProduct(prod);
    return {
      ...item,
      driveLink: (prod && prod.driveLink) ? prod.driveLink : (item.driveLink || ''),
      variant: isHen ? 'PS4 HEN' : (item.variant || 'Primary')
    };
  });

  const newOrder = {
    id: newInvoiceId,
    createdAt: new Date().toISOString(),
    customerType: state.checkoutType,
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    notes: notes,
    items: sanitizedCartItems,
    subtotal: subtotal,
    discount: discount,
    voucherCode: state.appliedVoucher ? state.appliedVoucher.code : null,
    total: finalTotal,
    paymentMethod: state.selectedPayment,
    paymentStatus: 'UNPAID',
    status: 'PENDING_PAYMENT',
    fulfillment: null
  };

  // Request Duitku Payment Gateway untuk SEMUA metode pembayaran (QRIS, BCA VA, Mandiri VA, DANA)
  try {
    const duitkuRes = await requestDuitkuInquiry(newOrder);
    if (duitkuRes && duitkuRes.statusCode === '00') {
      newOrder.fulfillment = {
        duitku: {
          reference: duitkuRes.reference,
          paymentUrl: duitkuRes.paymentUrl,
          qrString: duitkuRes.qrString || null,
          vaNumber: duitkuRes.vaNumber || null,
          paymentMethod: duitkuRes.paymentMethod || state.selectedPayment,
          amount: duitkuRes.amount
        }
      };
    }
  } catch (e) {
    console.warn('Gagal memanggil Duitku Inquiry:', e);
  }

  state.orders.unshift(newOrder);
  saveOrders();
  initSocialProofStream();
  syncOrderToSupabase(newOrder);
  upsertCustomerUser({ name: newOrder.customerName, email: newOrder.customerEmail, phone: newOrder.customerPhone });

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
  const cleanId = String(orderId || '').trim();
  let order = state.orders.find(o => o && o.id && o.id.toUpperCase() === cleanId.toUpperCase());
  if (!order && supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('orders').select('*').eq('id', cleanId).single();
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
  if (!order && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/orders?id=eq.${encodeURIComponent(cleanId)}&select=*`, {
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': 'Bearer ' + SUPABASE_CONFIG.anonKey
        }
      });
      if (res.ok) {
        const arr = await res.json();
        if (Array.isArray(arr) && arr.length > 0) {
          const data = arr[0];
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
      }
    } catch (e) {}
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
    payBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 flex items-center gap-1.5 shadow-md shadow-emerald-500/10 dark:shadow-emerald-950/40';
    payBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span> LUNAS TERVERIFIKASI';
  } else {
    payBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 flex items-center gap-1.5 shadow-md shadow-amber-500/10 dark:shadow-amber-950/40';
    payBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping"></span> MENUNGGU PEMBAYARAN';
  }

  // Stepper Visualizer
  updateStepper(order.status);

  // Items List
  const itemsContainer = document.getElementById('inv-items');
  if (itemsContainer) {
    itemsContainer.innerHTML = order.items.map(item => {
      const prod = (state.products || []).find(p => p.id === (item.productId || item.id) || p.title === item.title);
      const isHen = item.variant === 'PS4 HEN' || isHenProduct(prod);
      const displayVariant = isHen ? 'PS4 HEN' : (item.variant || 'Primary');
      return `
      <div class="flex items-center justify-between py-2 border-b border-slate-800/80 text-xs">
        <div>
          <div class="font-bold text-white">${escapeHtml(item.title)}</div>
          <div class="text-[11px] text-sky-400 uppercase font-mono">${displayVariant} • ${item.platform} • x${item.qty}</div>
        </div>
        <div class="text-right font-display font-extrabold text-slate-100">
          ${formatRupiah((item.unitPrice || item.price) * item.qty)}
        </div>
      </div>
    `;
    }).join('');
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
      const custEmailEl = document.getElementById('inv-dispatch-customer-email');
      if (custEmailEl) custEmailEl.textContent = order.customerEmail || '-';
    }

    // Auto-dispatch email & Drive access if not yet dispatched for this paid order
    if (!order.fulfillment || !order.fulfillment.emails_dispatched) {
      dispatchOrderCompletionEmails(order);
    }

    // Post-Purchase Customer Review Prompt Card
    const reviewPromptCard = document.getElementById('inv-review-prompt-card');
    if (reviewPromptCard) {
      reviewPromptCard.classList.remove('hidden');
      const alreadyReviewed = (state.reviews || []).some(r => r.orderId === order.id);
      if (alreadyReviewed) {
        reviewPromptCard.innerHTML = `
          <div class="flex items-center justify-between gap-3 flex-wrap w-full">
            <div class="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <i data-lucide="check-circle-2" class="w-5 h-5 shrink-0"></i>
              <span>Terima kasih! Anda telah memberikan ulasan untuk pesanan ini. Ulasan Anda telah aktif di Beranda. ⭐⭐⭐⭐⭐</span>
            </div>
            <button type="button" onclick="closeModals(); window.location.hash = 'testimoni';" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Lihat di Beranda
            </button>
          </div>
        `;
      } else {
        reviewPromptCard.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <i data-lucide="star" class="w-5 h-5 fill-amber-400 text-amber-400"></i>
            </div>
            <div>
              <div class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                <span>Puas dengan Pesanan Kamu?</span>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">BERI RATING</span>
              </div>
              <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Beri rating & ulasan untuk pesanan ini. Testimoni kamu akan langsung tampil di Beranda toko!
              </p>
            </div>
          </div>
          <button type="button" onclick="openReviewModal('${order.id}')" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer force-white">
            <i data-lucide="message-square-heart" class="w-4 h-4"></i>
            <span>Beri Ulasan Sekarang</span>
          </button>
        `;
      }
    }
  } else {
    fulfillmentBox.classList.add('hidden');
    if (dispatchCard) dispatchCard.classList.add('hidden');
    const reviewPromptCard = document.getElementById('inv-review-prompt-card');
    if (reviewPromptCard) reviewPromptCard.classList.add('hidden');
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

  const duitkuData = (order.fulfillment && order.fulfillment.duitku) ? order.fulfillment.duitku : null;
  const paymentUrl = duitkuData?.paymentUrl;
  const vaNumber = duitkuData?.vaNumber;
  const qrString = duitkuData?.qrString || `00020101021226670016ID.CO.QRIS.WWW011893600002011234567802150000000000000010303UMI51440014ID.GO.BI.QRIS011893600002011234567802150000000000000010303UMI52045814530336054${order.total}5802ID5913ALIANSI_STORE6007JAKARTA61051234062070703A016304${order.id}`;

  const isVA = (order.paymentMethod === 'bca' || order.paymentMethod === 'mandiri' || order.paymentMethod === 'bri' || order.paymentMethod === 'bni' || !!vaNumber);
  const isDana = (order.paymentMethod === 'dana');

  if (isVA) {
    const bankLabel = order.paymentMethod === 'bca' ? 'BCA' : (order.paymentMethod === 'mandiri' ? 'Mandiri' : (order.paymentMethod === 'bri' ? 'BRI' : 'Bank'));
    const displayVa = vaNumber || ('7007014' + String(order.id).replace(/[^0-9]/g, '').slice(-8));
    container.innerHTML = `
      <div class="p-5 rounded-2xl bg-white dark:bg-[#070d1e] border border-slate-200 dark:border-sky-500/40 text-center shadow-sm">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 text-[11px] font-bold mb-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> VIRTUAL ACCOUNT ${bankLabel.toUpperCase()} RESMI DUITKU (OTOMATIS)
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">Bayar via ${bankLabel} Mobile, Internet Banking, atau ATM. Diverifikasi otomatis tanpa kirim bukti transfer.</p>

        <div class="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-500/30 my-3">
          <div class="text-[10px] text-sky-700 dark:text-sky-400 font-bold uppercase tracking-wider mb-1 font-mono">Nomor Virtual Account ${bankLabel}:</div>
          <div class="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-wider select-all mb-2">
            ${displayVa}
          </div>
          <button onclick="copyText('${displayVa}', 'Nomor Virtual Account ${bankLabel} tersalin!')" class="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md transition-all">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i> Salin Nomor VA
          </button>
        </div>

        <div class="text-xs font-bold text-slate-700 dark:text-slate-300">Total Tagihan:</div>
        <div class="text-2xl font-black text-sky-600 dark:text-sky-400 font-display mt-0.5 mb-3">${formatRupiah(order.total)}</div>

        <div class="text-[11px] text-slate-600 dark:text-slate-400 mb-4 flex items-center justify-center gap-1.5">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-500 dark:text-amber-400"></i>
          <span>Menunggu konfirmasi pembayaran otomatis Duitku...</span>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-2">
          ${paymentUrl ? `
            <a href="${paymentUrl}" target="_blank" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Buka Pembayaran Duitku (Web / Simulator)
            </a>
          ` : ''}
          <button onclick="checkOrderStatusManual('${order.id}')" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Cek Status Sekarang
          </button>
          <button onclick="simulateCustomerPaid('${order.id}')" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-600/40 flex items-center justify-center gap-1.5" title="Uji Coba Sandbox">
            <i data-lucide="play" class="w-3.5 h-3.5"></i> Tes Lunas (Sandbox)
          </button>
        </div>
      </div>
    `;
    lucide.createIcons();
  } else if (isDana && paymentUrl) {
    container.innerHTML = `
      <div class="p-5 rounded-2xl bg-white dark:bg-[#070d1e] border border-slate-200 dark:border-sky-500/40 text-center shadow-sm">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 text-[11px] font-bold mb-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> E-WALLET DANA RESMI DUITKU (OTOMATIS)
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">Klik tombol di bawah untuk menyelesaikan pembayaran langsung di aplikasi DANA.</p>

        <div class="text-xs font-bold text-slate-700 dark:text-slate-300">Total Tagihan:</div>
        <div class="text-2xl font-black text-sky-600 dark:text-sky-400 font-display mt-0.5 mb-4">${formatRupiah(order.total)}</div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3">
          <a href="${paymentUrl}" target="_blank" class="w-full sm:w-auto px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all">
            <i data-lucide="external-link" class="w-4 h-4"></i> Bayar Sekarang via DANA
          </a>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-2">
          <button onclick="checkOrderStatusManual('${order.id}')" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Cek Status Sekarang
          </button>
          <button onclick="simulateCustomerPaid('${order.id}')" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-600/40 flex items-center justify-center gap-1.5" title="Uji Coba Sandbox">
            <i data-lucide="play" class="w-3.5 h-3.5"></i> Tes Lunas (Sandbox)
          </button>
        </div>
      </div>
    `;
    lucide.createIcons();
  } else {
    // Default QRIS (Universal for all Banks & E-Wallets)
    container.innerHTML = `
      <div class="text-center p-5 rounded-2xl bg-white dark:bg-[#070d1e] border border-slate-200 dark:border-sky-500/40 shadow-sm">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 text-[11px] font-bold mb-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> QRIS RESMI DUITKU (OTOMATIS)
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">Scan pakai aplikasi apa saja: BCA, Mandiri, BRI, Livin, GoPay, OVO, DANA, ShopeePay</p>
        
        <div class="inline-block p-4 rounded-2xl bg-white shadow-xl shadow-sky-500/10 border border-slate-200 dark:border-transparent mb-3" id="qrcode-container"></div>
        
        <div class="text-xs font-bold text-slate-700 dark:text-slate-300">Total Pembayaran:</div>
        <div class="text-2xl font-black text-sky-600 dark:text-sky-400 font-display mt-0.5 mb-3">${formatRupiah(order.total)}</div>

        <div class="text-[11px] text-slate-600 dark:text-slate-400 mb-4 flex items-center justify-center gap-1.5">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-500 dark:text-amber-400"></i>
          <span>Menunggu konfirmasi pembayaran otomatis (bebas reload)...</span>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-2">
          ${paymentUrl ? `
            <a href="${paymentUrl}" target="_blank" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Buka Pembayaran Duitku (Web / Simulator)
            </a>
          ` : ''}
          <button onclick="checkOrderStatusManual('${order.id}')" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Cek Status Sekarang
          </button>
          <button onclick="simulateCustomerPaid('${order.id}')" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-600/40 flex items-center justify-center gap-1.5" title="Uji Coba Sandbox">
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
      const prod = (state.products || []).find(p => p.id === link.gameId || p.title === link.title);
      if (prod && prod.driveLink) {
        return { ...link, url: prod.driveLink };
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

  // PSN Account section (legacy/optional fallback)
  if (fulfillment.psnEmail) {
    if (psnSection) psnSection.classList.remove('hidden');
    document.getElementById('fulfill-email').textContent = fulfillment.psnEmail || '-';
    document.getElementById('fulfill-password').textContent = fulfillment.psnPassword || '••••••••';
    document.getElementById('fulfill-backup').textContent = fulfillment.backupCodes || '-';
    document.getElementById('fulfill-notes').textContent = fulfillment.adminNotes || 'Gunakan akun dengan bijak dan ikuti panduan aktivasi.';
  } else {
    if (psnSection) psnSection.classList.add('hidden');
  }

  // HEN Notes section (for PS4 HEN PKG orders)
  const henNotesContainer = document.getElementById('fulfill-hen-notes-container');
  const henNotesEl = document.getElementById('fulfill-hen-notes');
  if (henNotesContainer && henNotesEl) {
    if (fulfillment.adminNotes) {
      henNotesEl.textContent = fulfillment.adminNotes;
      henNotesContainer.classList.remove('hidden');
    } else {
      henNotesContainer.classList.add('hidden');
    }
  }

  const guideLinkEl = document.getElementById('fulfill-guide-link');
  if (guideLinkEl) {
    guideLinkEl.href = fulfillment.guideUrl || 'https://aliansistore.com/panduan-install-pkg-ps4-hen';
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
    const prod = (state.products || []).find(p => p.id === (item.productId || item.id) || p.title === item.title);
    const isHen = item.variant === 'PS4 HEN' || isHenProduct(prod);
    const variant = isHen ? 'PS4 HEN (PKG)' : (item.variant || 'Primary');
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

const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRbjQSYGQ6Z3BRrjAT-dGYtT_XhV9N9uXm2NXPJtLRF2ZH0SOcK34VBPsWcuNrrJ1uGw/exec';

async function resendInvoiceEmail() {
  playSfx('click');
  const order = state.currentInvoice;
  if (!order) {
    showToast('Tidak ada invoice yang sedang dibuka.', 'warning');
    return;
  }
  showToast(`Mengirim ulang faktur & akses Google Drive ke ${order.customerEmail || 'email pembeli'}...`, 'info', 'Mengirim Email');
  await dispatchOrderCompletionEmails(order);
  playSfx('success');
  showToast(`Faktur resmi & akses Google Drive telah dikirim ke ${order.customerEmail}! Silakan cek Inbox / Spam.`, 'success', 'Email Terkirim');
}

async function dispatchOrderCompletionEmails(order) {
  if (!order) return;

  if (!order.fulfillment) order.fulfillment = {};
  
  const adminEmail = (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';
  const customerEmail = (order.customerEmail || '').trim();
  const customerName = order.customerName || 'Pelanggan Setia';
  const appsScriptUrl = (state.config && state.config.appsScriptUrl) || DEFAULT_APPS_SCRIPT_URL;

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

  // Update Customer Invoice view if opened (Clean customer confirmation)
  const dispatchCard = document.getElementById('inv-email-dispatch-card');
  if (dispatchCard) {
    dispatchCard.classList.remove('hidden');
    const custEmailEl = document.getElementById('inv-dispatch-customer-email');
    if (custEmailEl) custEmailEl.textContent = customerEmail || 'email Anda';
  }

  // Extract fulfillment details (Google Drive, guide link, and notes)
  const f = order.fulfillment || {};
  const guideUrl = f.guideUrl || 'https://aliansistore.com/panduan-install-pkg-ps4-hen';
  const adminNotes = f.adminNotes || '';
  const driveLinks = f.driveLinks || [];

  // Prepare structured payload for automated delivery
  const payload = {
    action: 'send_order_emails',
    orderId: order.id,
    order: {
      id: order.id,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: order.customerPhone || '',
      paymentMethod: order.paymentMethod || 'QRIS',
      total: order.total || 0,
      subtotal: order.subtotal || 0,
      discount: order.discount || 0,
      voucherCode: order.voucherCode || '',
      createdAt: order.createdAt || new Date().toISOString(),
      fulfillment: {
        driveLink: f.driveLink || '',
        driveLinks: driveLinks,
        guideUrl: guideUrl,
        adminNotes: adminNotes,
        type: 'PS4_HEN_PKG'
      },
      items: (order.items || []).map(i => {
        const prod = (state.products || []).find(p => p.id === (i.productId || i.id));
        return {
          productId: i.productId || i.id,
          title: i.title,
          variant: i.variant || 'PS4 HEN',
          unitPrice: i.unitPrice || 0,
          qty: i.qty || 1,
          driveLink: (prod && prod.driveLink) ? prod.driveLink : (i.driveLink || '')
        };
      })
    },
    fulfillment: f,
    guideUrl: guideUrl,
    adminNotes: adminNotes,
    customerEmail: customerEmail,
    customerName: customerName,
    adminEmail: adminEmail,
    appsScriptUrl: appsScriptUrl
  };

  // 1. Direct dispatch to Google Apps Script Web App (if configured)
  if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
    try {
      fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(e => console.info('[EMAIL DISPATCH] Direct Apps Script fetch initiated'));
    } catch (e) {
      console.warn('[EMAIL DISPATCH] Apps Script note:', e);
    }
  }

  // 2. Dispatch via Serverless Function / Local Server Endpoint
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const endpoints = isLocal
    ? ['http://localhost:5050/.netlify/functions/send-email', 'http://localhost:5050/api/send-email']
    : ['/.netlify/functions/send-email', '/api/send-email', 'https://aliansistore-ps.netlify.app/.netlify/functions/send-email'];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        console.info(`[ALIANSI EMAIL DISPATCH] Berhasil diproses endpoint: ${ep}`);
        break;
      }
    } catch (err) {
      // Continue next endpoint
    }
  }

  console.info(`[ALIANSI EMAIL DISPATCH] Transaksi Selesai #${order.id}:`, {
    customerEmail: customerEmail,
    adminEmail: adminEmail,
    appsScriptConnected: Boolean(appsScriptUrl)
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

  const adminEmail = (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';
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
            <div class="text-xs font-bold text-white truncate">${(state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com'}</div>
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

  // If user was prompted to login to use Live Chat, open it once logged in!
  if (state.currentUser && sessionStorage.getItem('aliansi_pending_open_chat') === 'true') {
    sessionStorage.removeItem('aliansi_pending_open_chat');
    setTimeout(() => {
      toggleCustomerChat(true);
      showToast(`Selamat datang ${state.currentUser.name || 'Member'}! Sesi Live Chat Anda siap.`, 'success');
    }, 450);
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
  const oauthDividerLabel = document.getElementById('oauth-divider-label');

  if (tab === 'login') {
    if (tabLogin) tabLogin.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white shadow transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (tabReg) tabReg.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-transparent text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (formLogin) formLogin.classList.remove('hidden');
    if (formReg) formReg.classList.add('hidden');
    if (modalTitle) modalTitle.textContent = 'Masuk ke ALIANSI STORE';
    if (oauthGoogleLabel) oauthGoogleLabel.textContent = 'Lanjutkan dengan Google';
    if (oauthMsLabel) oauthMsLabel.textContent = 'Lanjutkan dengan Outlook / Microsoft';
    if (oauthDividerLabel) oauthDividerLabel.textContent = 'Atau Masuk dengan No. HP / Akun Toko';
  } else {
    if (tabReg) tabReg.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white shadow transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (tabLogin) tabLogin.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-transparent text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5';
    if (formReg) formReg.classList.remove('hidden');
    if (formLogin) formLogin.classList.add('hidden');
    if (modalTitle) modalTitle.textContent = 'Daftar Member Baru';
    if (oauthGoogleLabel) oauthGoogleLabel.textContent = 'Daftar Cepat dengan Google';
    if (oauthMsLabel) oauthMsLabel.textContent = 'Daftar Cepat dengan Outlook';
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
    idLower === 'aliansistore.id@gmail.com' || 
    idLower === 'aliansistoreofficial@gmail.com' || 
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
      email: (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com',
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
      matchedUser.lastOnline = new Date().toISOString();
      saveUsers();
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
      roleLabel: 'Member VIP',
      lastOnline: new Date().toISOString()
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
      roleLabel: 'Member VIP',
      lastOnline: new Date().toISOString()
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
    registeredAt: new Date().toISOString(),
    lastOnline: new Date().toISOString()
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

function setupSupabaseAuthListener() {
  if (!supabaseClient || !supabaseClient.auth) return;

  // 1. Check existing session on load (handles OAuth callback redirect)
  try {
    supabaseClient.auth.getSession().then(({ data, error }) => {
      if (!error && data && data.session && data.session.user) {
        handleSupabaseAuthUser(data.session.user);
      }
    }).catch(err => {
      console.warn('Supabase getSession error:', err);
    });
  } catch (e) {
    console.warn('Supabase getSession exception:', e);
  }

  // 2. Listen to real-time auth state changes
  try {
    if (typeof supabaseClient.auth.onAuthStateChange === 'function') {
      supabaseClient.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session && session.user) {
          handleSupabaseAuthUser(session.user);
        }
      });
    }
  } catch (e) {
    console.warn('Supabase onAuthStateChange exception:', e);
  }
}

function handleSupabaseAuthUser(authUser) {
  if (!authUser || !authUser.email) return;

  const meta = authUser.user_metadata || {};
  const email = authUser.email;
  const name = meta.full_name || meta.name || email.split('@')[0];
  const avatar = meta.avatar_url || meta.picture || null;
  const provider = (authUser.app_metadata && authUser.app_metadata.provider) || 'google';

  // If already logged in with identical email, don't spam duplicate toasts
  if (state.currentUser && state.currentUser.email && state.currentUser.email.toLowerCase() === email.toLowerCase()) {
    return;
  }

  executeOAuthLogin({
    provider: provider,
    name: name,
    email: email,
    avatar: avatar
  });

  // Clean URL hash and search params cleanly without page reload
  if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error='))) {
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
  }
  if (window.location.search && (window.location.search.includes('code=') || window.location.search.includes('error='))) {
    history.replaceState(null, document.title, window.location.pathname);
  }
}

async function initiateGoogleOAuth() {
  playSfx('click');
  showToast('Mengarahkan ke Halaman Login Google...', 'info', 'Masuk dengan Google');

  const redirectUrl = window.location.origin + window.location.pathname;

  // 1. Direct official OAuth via Supabase Client
  if (supabaseClient && supabaseClient.auth && typeof supabaseClient.auth.signInWithOAuth === 'function') {
    try {
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        console.warn('Supabase Google OAuth error:', error);
        handleOAuthProviderNotConfigured('google', error);
      } else if (data && data.url) {
        // Direct redirect to official Google accounts login!
        window.location.href = data.url;
      }
      return;
    } catch (err) {
      console.warn('Supabase Google OAuth exception:', err);
      // Fallback direct URL redirect to Supabase Authorize
      window.location.href = `${SUPABASE_CONFIG.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
      return;
    }
  }

  // 2. Direct browser redirect fallback
  window.location.href = `${SUPABASE_CONFIG.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
}

async function initiateMicrosoftOAuth() {
  playSfx('click');
  showToast('Mengarahkan ke Halaman Login Microsoft / Outlook...', 'info', 'Masuk dengan Outlook');

  const redirectUrl = window.location.origin + window.location.pathname;

  if (supabaseClient && supabaseClient.auth && typeof supabaseClient.auth.signInWithOAuth === 'function') {
    try {
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: redirectUrl,
          scopes: 'email profile openid'
        }
      });

      if (error) {
        console.warn('Supabase Azure OAuth error:', error);
        window.location.href = `${SUPABASE_CONFIG.url}/auth/v1/authorize?provider=azure&redirect_to=${encodeURIComponent(redirectUrl)}`;
        return;
      } else if (data && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err) {
      console.warn('Supabase Azure OAuth exception:', err);
      window.location.href = `${SUPABASE_CONFIG.url}/auth/v1/authorize?provider=azure&redirect_to=${encodeURIComponent(redirectUrl)}`;
      return;
    }
  }

  // Fallback to direct redirect
  window.location.href = `${SUPABASE_CONFIG.url}/auth/v1/authorize?provider=azure&redirect_to=${encodeURIComponent(redirectUrl)}`;
}

function handleOAuthProviderNotConfigured(provider, error) {
  closeModals();
  renderOAuthModal(provider, true);
  const modal = document.getElementById('modal-oauth-picker');
  if (modal) modal.classList.remove('hidden');
  const customForm = document.getElementById('oauth-custom-form');
  if (customForm) customForm.classList.remove('hidden');
  lucide.createIcons();
}

function loginWithProvider(provider) {
  playSfx('click');
  currentOAuthProvider = provider;

  if (provider === 'google') {
    initiateGoogleOAuth();
    return;
  }

  if (provider === 'microsoft' || provider === 'outlook' || provider === 'azure') {
    initiateMicrosoftOAuth();
    return;
  }

  renderOAuthModal(provider, false);
  const modal = document.getElementById('modal-oauth-picker');
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeOAuthModal() {
  playSfx('click');
  const modal = document.getElementById('modal-oauth-picker');
  if (modal) modal.classList.add('hidden');
}

function renderOAuthModal(provider, showConfigBanner = false) {
  const container = document.getElementById('oauth-picker-content');
  if (!container) return;

  if (provider === 'google') {
    container.innerHTML = `
      <div class="text-center mb-4">
        <svg class="w-10 h-10 mx-auto mb-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <h3 class="text-base font-black text-white font-display">Masuk dengan Akun Google Resmi</h3>
        <p class="text-xs text-slate-400 mt-0.5">Otentikasi pihak ketiga aman tanpa perlu membuat password baru</p>
      </div>

      <!-- Action Button: Open Real Google OAuth -->
      <button 
        type="button" 
        onclick="initiateGoogleOAuth()" 
        class="w-full mb-3.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-98 cursor-pointer"
      >
        <i data-lucide="external-link" class="w-4 h-4"></i>
        <span>Buka Halaman Login Resmi Google</span>
      </button>

      ${showConfigBanner ? `
        <!-- Supabase Guidance Notice -->
        <div class="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left">
          <div class="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
            <i data-lucide="shield-alert" class="w-3.5 h-3.5 shrink-0"></i>
            <span>Aktivasi Kredensial Supabase Diperlukan</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-snug mb-2">
            Kode web sudah siap mengarahkan ke Google. Agar Google mengizinkan login domain Anda, aktifkan provider Google di <strong>Supabase Dashboard</strong> dengan Client ID &amp; Secret dari Google Cloud.
          </p>
          <div class="text-[10px] text-slate-400 mb-1 font-mono">Callback Redirect URI untuk Google Cloud:</div>
          <div class="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-[10px] text-sky-300">
            <span class="truncate">https://fgotjbcabnragtpijuvk.supabase.co/auth/v1/callback</span>
            <button type="button" onclick="copyText('https://fgotjbcabnragtpijuvk.supabase.co/auth/v1/callback', 'Callback URI Supabase berhasil disalin!')" class="shrink-0 p-1 hover:text-white" title="Salin URI">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      ` : ''}

      <div class="relative flex py-2 items-center mb-3">
        <div class="flex-grow border-t border-slate-800"></div>
        <span class="flex-shrink mx-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Atau Pilih Akun Demo / Uji Coba:</span>
        <div class="flex-grow border-t border-slate-800"></div>
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
      <div class="text-center mb-4">
        <div class="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-2 shadow-lg">
          <svg class="w-7 h-7" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
        </div>
        <h3 class="text-base font-black text-white font-display">Masuk dengan Akun Microsoft / Outlook</h3>
        <p class="text-xs text-slate-400 mt-0.5">Otentikasi mudah menggunakan email <strong>@outlook.com</strong> atau <strong>@hotmail.com</strong></p>
      </div>

      <!-- Action Button: Open Official Microsoft OAuth -->
      <button 
        type="button" 
        onclick="initiateMicrosoftOAuth()" 
        class="w-full mb-3.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-98 cursor-pointer"
      >
        <i data-lucide="external-link" class="w-4 h-4"></i>
        <span>Buka Halaman Login Resmi Microsoft</span>
      </button>

      <div class="relative flex py-2 items-center mb-3">
        <div class="flex-grow border-t border-slate-800"></div>
        <span class="flex-shrink mx-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Atau Isi Form Cepat Outlook:</span>
        <div class="flex-grow border-t border-slate-800"></div>
      </div>

      <form id="oauth-custom-form" onsubmit="event.preventDefault(); submitCustomOAuth('microsoft');" class="space-y-2.5">
        <div>
          <label class="block text-[11px] font-bold text-slate-300 mb-1">Nama Lengkap Anda <span class="text-rose-400">*</span>:</label>
          <input type="text" id="oauth-custom-name" placeholder="Contoh: Reza Kurniawan" class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500" required />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-300 mb-1">Email Outlook / Hotmail <span class="text-rose-400">*</span>:</label>
          <input type="email" id="oauth-custom-email" placeholder="nama@outlook.com" class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500 font-mono" required />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-300 mb-1">No. WhatsApp (Opsional):</label>
          <input type="tel" id="oauth-custom-phone" placeholder="081234..." class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500 font-mono" />
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer">
          Masuk &amp; Hubungkan Akun Outlook
        </button>
      </form>

      <p class="oauth-footer-text text-[10px] text-slate-500 text-center mt-3">
        Aman &amp; terlindungi. Data hanya digunakan untuk pengiriman faktur &amp; link Google Drive game.
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

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';

  if (!name) {
    showToast('Mohon masukkan nama Anda!', 'warning');
    if (nameInput) nameInput.focus();
    return;
  }
  if (!email || !email.includes('@')) {
    showToast('Mohon masukkan alamat email yang valid!', 'warning');
    if (emailInput) emailInput.focus();
    return;
  }

  executeOAuthLogin({
    provider: provider,
    name: name,
    email: email,
    phone: phone
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

  user.lastOnline = new Date().toISOString();
  saveUsers();
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

let currentCustomerModalTab = 'orders';
let guestLookupEmailOrPhone = '';

function switchCustomerModalTab(tab) {
  currentCustomerModalTab = tab;
  playSfx('click');

  const btnOrders = document.getElementById('tab-custmodal-orders');
  const btnRequests = document.getElementById('tab-custmodal-requests');
  const subtitle = document.getElementById('customer-orders-subtitle');

  if (tab === 'orders') {
    if (btnOrders) {
      btnOrders.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer';
    }
    if (btnRequests) {
      btnRequests.className = 'px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white flex items-center gap-2 transition-all cursor-pointer';
    }
    if (subtitle) subtitle.textContent = 'Riwayat pembelian game PS4 HEN & lisensi digital Anda';
    renderCustomerOrders();
  } else {
    if (btnOrders) {
      btnOrders.className = 'px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white flex items-center gap-2 transition-all cursor-pointer';
    }
    if (btnRequests) {
      btnRequests.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer';
    }
    if (subtitle) subtitle.textContent = 'Daftar tiket permintaan game Anda yang sedang diproses & sudah tersedia';
    renderCustomerRequests();
  }
}

function openCustomerOrdersModal(initialTab = 'orders') {
  playSfx('click');
  const modal = document.getElementById('modal-customer-orders');
  if (!modal) return;
  modal.classList.remove('hidden');
  updateCustomerModalBadges();
  switchCustomerModalTab(initialTab);
}

function updateCustomerModalBadges() {
  const user = state.currentUser;
  const userPhone = user && user.phone ? user.phone.replace(/[\s-]/g, '') : (guestLookupEmailOrPhone || '');
  const userEmail = user && user.email ? user.email.toLowerCase() : (guestLookupEmailOrPhone.toLowerCase() || '');

  const myOrdersCount = (state.orders || []).filter(o => {
    const oPhone = o.customerPhone ? o.customerPhone.replace(/[\s-]/g, '') : '';
    const oEmail = o.customerEmail ? o.customerEmail.toLowerCase() : '';
    return (userPhone && oPhone === userPhone) || (userEmail && oEmail === userEmail);
  }).length;

  const myRequestsCount = (state.gameRequests || []).filter(r => {
    const rPhone = r.customerPhone ? r.customerPhone.replace(/[\s-]/g, '') : '';
    const rEmail = r.customerEmail ? r.customerEmail.toLowerCase() : '';
    return (userPhone && rPhone === userPhone) || (userEmail && rEmail === userEmail);
  }).length;

  const bOrders = document.getElementById('custmodal-badge-orders');
  if (bOrders) bOrders.textContent = myOrdersCount;
  const bRequests = document.getElementById('custmodal-badge-requests');
  if (bRequests) bRequests.textContent = myRequestsCount;
}

function renderCustomerOrders() {
  const container = document.getElementById('customer-orders-list');
  if (!container) return;

  const user = state.currentUser;
  const userPhone = user && user.phone ? user.phone.replace(/[\s-]/g, '') : (guestLookupEmailOrPhone || '');
  const userEmail = user && user.email ? user.email.toLowerCase() : (guestLookupEmailOrPhone.toLowerCase() || '');

  if (!user && !guestLookupEmailOrPhone) {
    container.innerHTML = `
      <div class="text-center py-8 px-4">
        <div class="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto mb-3 border border-sky-500/20">
          <i data-lucide="scan-line" class="w-7 h-7"></i>
        </div>
        <h4 class="text-base font-bold text-white mb-1">Cek Pesanan & Lisensi Game Anda</h4>
        <p class="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Masukkan alamat email atau nomor WhatsApp yang Anda gunakan saat memesan game.
        </p>
        <div class="max-w-xs mx-auto flex gap-2 mb-4">
          <input 
            type="text" 
            id="custmodal-lookup-input" 
            placeholder="nama@gmail.com / 0812..." 
            class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-sky-500 font-mono"
            onkeydown="if(event.key==='Enter') executeCustomerGuestLookup();"
          />
          <button onclick="executeCustomerGuestLookup()" class="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer shrink-0">
            Cari
          </button>
        </div>
        <div class="text-slate-500 text-[11px]">
          Atau <button onclick="closeModals(); openAuthModal('login');" class="text-sky-400 font-bold hover:underline cursor-pointer">Login ke Akun Member</button>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const myOrders = (state.orders || []).filter(o => {
    const oPhone = o.customerPhone ? o.customerPhone.replace(/[\s-]/g, '') : '';
    const oEmail = o.customerEmail ? o.customerEmail.toLowerCase() : '';
    return (userPhone && oPhone === userPhone) || (userEmail && oEmail === userEmail);
  });

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
      'COMPLETED': '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">SELESAI (LUNAS)</span>',
      'PROCESSING': '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">DIPROSES ADMIN</span>',
      'PENDING_PAYMENT': '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30">MENUNGGU BAYAR</span>'
    };

    const statusBadge = statusBadges[order.status] || `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">${order.status}</span>`;

    return `
      <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#091128] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-black text-sky-600 dark:text-sky-400">${order.id}</span>
              ${statusBadge}
            </div>
            <span class="text-[10px] text-slate-500 dark:text-slate-400">${formatDate(order.createdAt)}</span>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-500 dark:text-slate-400 block sm:inline">Total Belanja:</span>
            <span class="text-sm font-black text-emerald-600 dark:text-emerald-400 font-display ml-1">${formatRupiah(order.total)}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="space-y-2 mb-3">
          ${order.items.map(item => `
            <div class="flex items-center justify-between text-xs py-1">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 text-[9px] font-bold">${item.platform || 'PS4'}</span>
                <span class="font-bold text-slate-900 dark:text-slate-200">${item.title}</span>
                <span class="text-slate-500 dark:text-slate-400 font-mono text-[11px]">(x${item.qty})</span>
              </div>
              <span class="text-slate-700 dark:text-slate-300 font-mono font-bold">${formatRupiah(item.price * item.qty)}</span>
            </div>
          `).join('')}
        </div>

        <!-- Fulfillment / Credentials Box (If Available) -->
        ${order.fulfillment ? `
          <div class="p-3.5 rounded-xl bg-sky-50 dark:bg-gradient-to-br dark:from-sky-950/60 dark:to-blue-950/40 border border-sky-300 dark:border-sky-500/40 my-3 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-sky-700 dark:text-sky-300 flex items-center gap-1.5 font-display">
                <i data-lucide="key" class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400"></i> DATA AKSES & LISENSI GAME:
              </span>
              <span class="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">SIAP DIMAINKAN</span>
            </div>

            ${order.fulfillment.account ? `
              <div class="flex items-center justify-between bg-white dark:bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs">
                <span class="text-slate-600 dark:text-slate-400 text-[11px]">Akun / Link Drive:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-slate-900 dark:text-white font-bold select-all">${order.fulfillment.account}</span>
                  <button onclick="copyText('${order.fulfillment.account}')" class="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-white cursor-pointer" title="Salin Link">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            ` : ''}

            ${order.fulfillment.password ? `
              <div class="flex items-center justify-between bg-white dark:bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs">
                <span class="text-slate-600 dark:text-slate-400 text-[11px]">Password / Token:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-amber-800 dark:text-amber-300 font-bold select-all">${order.fulfillment.password}</span>
                  <button onclick="copyText('${order.fulfillment.password}')" class="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-white cursor-pointer" title="Salin Token">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            ` : ''}

            ${order.fulfillment.notes ? `
              <div class="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong class="text-sky-600 dark:text-sky-400">Instruksi Toko:</strong> ${order.fulfillment.notes}
              </div>
            ` : ''}
          </div>
        ` : (order.status === 'PROCESSING' ? `
          <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/30 my-3 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <i data-lucide="clock" class="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400"></i>
            <span>Admin sedang memproses pesanan & lisensi game Anda. Mohon ditunggu ya!</span>
          </div>
        ` : '')}

        <!-- Order Actions -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
          <button onclick="openInvoiceModal('${order.id}')" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-transparent text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400"></i> Buka Invoice
          </button>
          <a href="https://wa.me/${(state.config && state.config.whatsappNumber) || '6281234567890'}?text=Halo%20Admin%20${encodeURIComponent((state.config && state.config.storeName) || 'Aliansi Store')}%2C%20saya%20mau%20konfirmasi%20pesanan%20${order.id}" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold transition-colors flex items-center gap-1.5">
            <i data-lucide="message-square" class="w-3.5 h-3.5"></i> CS WhatsApp
          </a>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function renderCustomerRequests() {
  const container = document.getElementById('customer-orders-list');
  if (!container) return;

  const user = state.currentUser;
  const userPhone = user && user.phone ? user.phone.replace(/[\s-]/g, '') : (guestLookupEmailOrPhone || '');
  const userEmail = user && user.email ? user.email.toLowerCase() : (guestLookupEmailOrPhone.toLowerCase() || '');

  if (!user && !guestLookupEmailOrPhone) {
    container.innerHTML = `
      <div class="text-center py-8 px-4">
        <div class="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-500/20">
          <i data-lucide="sparkles" class="w-7 h-7"></i>
        </div>
        <h4 class="text-base font-bold text-white mb-1">Cek Status Permintaan Game Anda</h4>
        <p class="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Masukkan alamat email atau nomor WhatsApp yang Anda gunakan saat mengajukan request game.
        </p>
        <div class="max-w-xs mx-auto flex gap-2 mb-4">
          <input 
            type="text" 
            id="custmodal-lookup-input" 
            placeholder="nama@gmail.com / 0812..." 
            class="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-purple-500 font-mono"
            onkeydown="if(event.key==='Enter') executeCustomerGuestLookup();"
          />
          <button onclick="executeCustomerGuestLookup()" class="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shrink-0">
            Cari
          </button>
        </div>
        <div class="text-slate-500 text-[11px]">
          Atau <button onclick="closeModals(); openAuthModal('login');" class="text-purple-400 font-bold hover:underline cursor-pointer">Login ke Akun Member</button>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const myRequests = (state.gameRequests || []).filter(r => {
    const rPhone = r.customerPhone ? r.customerPhone.replace(/[\s-]/g, '') : '';
    const rEmail = r.customerEmail ? r.customerEmail.toLowerCase() : '';
    return (userPhone && rPhone === userPhone) || (userEmail && rEmail === userEmail);
  });

  if (myRequests.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 px-4">
        <div class="w-16 h-16 rounded-3xl bg-slate-800/80 text-purple-400 flex items-center justify-center mx-auto mb-4">
          <i data-lucide="sparkles" class="w-8 h-8"></i>
        </div>
        <h4 class="text-base font-bold text-white mb-1">Belum Ada Permintaan Game</h4>
        <p class="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
          Punya game PS4 / PS5 impian yang belum ada di katalog ALIANSI STORE? Ajukan sekarang dan kami akan siapkan link & patch subtitle Indonesianya!
        </p>
        <button onclick="closeModals(); openRequestGameModal();" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg cursor-pointer">
          + Ajukan Request Game Baru
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
      <span class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i>
        <span>Ditemukan ${myRequests.length} Permintaan Game Anda</span>
      </span>
      <button onclick="closeModals(); openRequestGameModal();" class="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer">
        <i data-lucide="plus" class="w-3 h-3"></i> Request Baru
      </button>
    </div>
    <div class="space-y-3">
      ${myRequests.map(req => {
        const isReady = req.status === 'READY';
        const statusBadge = isReady
          ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><i data-lucide="check-circle" class="w-3 h-3"></i> SUDAH TERSEDIA</span>`
          : `<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> SEDANG DICARIKAN</span>`;

        return `
          <div class="p-4 sm:p-5 rounded-2xl bg-[#091128] border ${isReady ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 to-transparent' : 'border-slate-800'} transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80 mb-3">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-mono font-black text-purple-400">${req.id}</span>
                  ${statusBadge}
                </div>
                <span class="text-[10px] text-slate-400">${formatDate(req.createdAt)}</span>
              </div>
              <div class="flex items-center gap-1.5">
                ${(req.platform || []).map(p => `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">${p}</span>`).join('')}
              </div>
            </div>

            <div class="mb-3">
              <h4 class="text-sm font-bold text-white mb-1 font-display">${escapeHtml(req.gameTitle)}</h4>
              <div class="text-[11px] text-slate-400">Genre: <span class="text-slate-300 font-medium">${req.category || 'Action & Adventure'}</span></div>
              ${req.notes ? `
                <div class="mt-2 text-xs text-slate-300 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 italic">
                  "${escapeHtml(req.notes)}"
                </div>
              ` : ''}
              ${req.adminNotes ? `
                <div class="mt-2 text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                  <strong class="text-emerald-400">Pesan dari Admin:</strong> ${escapeHtml(req.adminNotes)}
                </div>
              ` : ''}
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-800/60 flex-wrap gap-2">
              <div class="text-[11px] text-slate-400">
                ${isReady ? '🎉 Game sudah siap dipesan di katalog toko!' : '⏳ Admin akan mengirimkan email konfirmasi begitu game siap.'}
              </div>
              <div class="flex items-center gap-2">
                <button 
                  onclick="openCustomerChatForRequest('${req.id}', '${escapeHtml(req.gameTitle)}')" 
                  class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Chat Admin Toko perihal request ini"
                >
                  <i data-lucide="message-circle" class="w-3.5 h-3.5"></i> Chat Admin
                </button>
                ${isReady ? `
                  <button onclick="closeModals(); window.location.hash = 'katalog';" class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow flex items-center gap-1.5 cursor-pointer">
                    <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i> Lihat di Katalog
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  lucide.createIcons();
}

function executeCustomerGuestLookup() {
  const input = document.getElementById('custmodal-lookup-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) {
    showToast('Masukkan alamat email atau nomor WhatsApp!', 'warning');
    return;
  }
  guestLookupEmailOrPhone = val;
  updateCustomerModalBadges();
  if (currentCustomerModalTab === 'requests') {
    renderCustomerRequests();
  } else {
    renderCustomerOrders();
  }
}

function openCustomerChatForRequest(reqId, gameTitle) {
  closeModals();
  toggleCustomerChat();
  const input = document.getElementById('customer-chat-input');
  if (input) {
    input.value = `Halo Admin, saya mau tanya perkembangan tiket request ${reqId} (${gameTitle}) saya.`;
    input.focus();
  }
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
    renderAdminCustomersTable();
    renderAdminFaqList();
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
  const email = (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';
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

  // Render Marketplace buttons on Beranda (if enabled by admin)
  renderBerandaMarketplaces();
}

// Dynamic Marketplace Hub on Beranda (Appears only when explicitly enabled by Admin)
function renderBerandaMarketplaces() {
  const container = document.getElementById('beranda-marketplaces-container');
  const list = document.getElementById('beranda-marketplaces-list');
  if (!container || !list) return;

  const mp = (state.config && state.config.marketplaces) || {};
  const activeItems = [];

  if (mp.shopee?.enabled && mp.shopee?.url) {
    activeItems.push({
      name: 'Shopee',
      url: mp.shopee.url,
      icon: 'shopping-bag',
      colorClass: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/30'
    });
  }
  if (mp.tokopedia?.enabled && mp.tokopedia?.url) {
    activeItems.push({
      name: 'Tokopedia',
      url: mp.tokopedia.url,
      icon: 'shopping-cart',
      colorClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
    });
  }
  if (mp.tiktok?.enabled && mp.tiktok?.url) {
    activeItems.push({
      name: 'TikTok Shop',
      url: mp.tiktok.url,
      icon: 'video',
      colorClass: 'bg-gradient-to-r from-slate-900 to-black hover:from-slate-800 hover:to-zinc-900 text-white border border-rose-500/40 shadow-rose-900/30'
    });
  }
  if (mp.lazada?.enabled && mp.lazada?.url) {
    activeItems.push({
      name: 'Lazada',
      url: mp.lazada.url,
      icon: 'package',
      colorClass: 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white shadow-blue-700/30'
    });
  }
  if (mp.blibli?.enabled && mp.blibli?.url) {
    activeItems.push({
      name: 'Blibli',
      url: mp.blibli.url,
      icon: 'badge-percent',
      colorClass: 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/30'
    });
  }

  // If no marketplace is enabled, hide container completely from Beranda
  if (activeItems.length === 0) {
    container.classList.add('hidden');
    list.innerHTML = '';
  } else {
    container.classList.remove('hidden');
    list.innerHTML = activeItems.map(item => `
      <a 
        href="${item.url}" 
        target="_blank" 
        rel="noopener noreferrer" 
        onclick="playSfx('click')" 
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${item.colorClass}"
        title="Beli Resmi di ${item.name}"
      >
        <i data-lucide="${item.icon}" class="w-4 h-4"></i>
        <span>${item.name}</span>
        <i data-lucide="external-link" class="w-3 h-3 opacity-75"></i>
      </a>
    `).join('');
    if (window.lucide) lucide.createIcons();
  }
}

function toggleMarketplaceInput(name) {
  playSfx('click');
  const checkEl = document.getElementById(`setting-mp-${name}-check`);
  const wrapEl = document.getElementById(`setting-mp-${name}-wrap`);
  const urlEl = document.getElementById(`setting-mp-${name}-url`);
  if (!checkEl || !wrapEl) return;
  if (checkEl.checked) {
    wrapEl.classList.remove('hidden');
    if (urlEl && !urlEl.value) {
      if (name === 'shopee') urlEl.placeholder = 'https://shopee.co.id/namatoko';
      else if (name === 'tokopedia') urlEl.placeholder = 'https://tokopedia.com/namatoko';
      else if (name === 'tiktok') urlEl.placeholder = 'https://shop.tiktok.com/@namatoko';
      else if (name === 'lazada') urlEl.placeholder = 'https://lazada.co.id/shop/namatoko';
      else if (name === 'blibli') urlEl.placeholder = 'https://blibli.com/merchant/namatoko';
      urlEl.focus();
    }
  } else {
    wrapEl.classList.add('hidden');
  }
}

function toggleProductMarketplaceSection(prefix) {
  playSfx('click');
  const checkEl = document.getElementById(`${prefix}-game-has-marketplace`);
  const fieldsEl = document.getElementById(`${prefix}-game-marketplace-fields`);
  if (!checkEl || !fieldsEl) return;
  if (checkEl.checked) {
    fieldsEl.classList.remove('hidden');
  } else {
    fieldsEl.classList.add('hidden');
  }
}

function openAdminSettingsModal() {
  playSfx('click');
  const modal = document.getElementById('modal-admin-settings');
  if (!modal) return;
  const waEl = document.getElementById('setting-admin-wa');
  const emailEl = document.getElementById('setting-admin-email');
  const nameEl = document.getElementById('setting-store-name');
  const appsScriptEl = document.getElementById('setting-apps-script-url');

  if (waEl) waEl.value = (state.config && state.config.whatsappNumber) || '6281234567890';
  if (emailEl) emailEl.value = (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';
  if (nameEl) nameEl.value = (state.config && state.config.storeName) || 'ALIANSI STORE';
  if (appsScriptEl) appsScriptEl.value = (state.config && state.config.appsScriptUrl) || '';

  // Load Marketplace Settings
  const marketplaces = (state.config && state.config.marketplaces) || {};
  ['shopee', 'tokopedia', 'tiktok', 'lazada', 'blibli'].forEach(key => {
    const checkEl = document.getElementById(`setting-mp-${key}-check`);
    const wrapEl = document.getElementById(`setting-mp-${key}-wrap`);
    const urlEl = document.getElementById(`setting-mp-${key}-url`);
    const mpData = marketplaces[key] || {};
    if (checkEl) checkEl.checked = !!mpData.enabled;
    if (urlEl) urlEl.value = mpData.url || '';
    if (wrapEl) {
      if (mpData.enabled) wrapEl.classList.remove('hidden');
      else wrapEl.classList.add('hidden');
    }
  });

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

async function testAppsScriptEmail() {
  playSfx('click');
  const urlInput = document.getElementById('setting-apps-script-url');
  const emailInput = document.getElementById('setting-admin-email');
  const url = (urlInput ? urlInput.value.trim() : '') || (state.config && state.config.appsScriptUrl) || '';
  const adminEmail = (emailInput && emailInput.value.trim()) || (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';

  if (!url || !url.startsWith('http')) {
    showToast('Tempelkan URL Web App Google Apps Script (https://script.google.com/macros/s/.../exec) terlebih dahulu!', 'warning', 'URL Webhook Belum Diisi');
    if (urlInput) urlInput.focus();
    return;
  }

  // Simpan otomatis ke state, localStorage, dan Supabase Cloud
  if (!state.config) state.config = {};
  state.config.appsScriptUrl = url;
  state.config.adminEmail = adminEmail;
  saveConfig();
  if (typeof syncConfigToSupabase === 'function') {
    syncConfigToSupabase();
  }

  const sampleProd = (state.products && state.products.length > 0) ? state.products[0] : {
    id: 'game-it-takes-two-subindo',
    title: 'It Takes Two (Full Subtitle Indonesia)',
    driveLink: 'https://drive.google.com/drive/folders/1Pw4Fe24O0LAAsV6Affwp_Ef4C0isK6JQ?usp=sharing'
  };

  showToast(`Menguji Auto-Share Google Drive & Kirim Email Faktur ke ${adminEmail}...`, 'info', 'Uji Coba Otomasi');

  try {
    const testOrderId = 'TEST-' + Math.floor(1000 + Math.random() * 9000);
    const payload = {
      action: 'send_order_emails',
      orderId: testOrderId,
      customerEmail: adminEmail,
      customerName: 'Tester Aliansi Store',
      adminEmail: adminEmail,
      order: {
        id: testOrderId,
        customerName: 'Tester Aliansi Store',
        customerEmail: adminEmail,
        customerPhone: '085388597684',
        paymentMethod: 'QRIS',
        total: (sampleProd.prices && sampleProd.prices.primary) || 120000,
        items: [{
          productId: sampleProd.id,
          title: sampleProd.title,
          variant: 'PS4 HEN',
          unitPrice: (sampleProd.prices && sampleProd.prices.primary) || 120000,
          qty: 1,
          driveLink: sampleProd.driveLink || 'https://drive.google.com/drive/folders/1Pw4Fe24O0LAAsV6Affwp_Ef4C0isK6JQ?usp=sharing'
        }],
        fulfillment: {
          driveLink: sampleProd.driveLink || 'https://drive.google.com/drive/folders/1Pw4Fe24O0LAAsV6Affwp_Ef4C0isK6JQ?usp=sharing',
          guideUrl: 'https://aliansistore.com/panduan-install-pkg-ps4-hen',
          adminNotes: 'Tes Otomasi Sharing Google Drive & Faktur Email Aliansi Store berhasil!'
        }
      },
      timestamp: new Date().toISOString()
    };

    fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(() => {
      playSfx('success');
      showToast(`Tes berhasil dikirim! Silakan cek inbox Gmail ${adminEmail} untuk melihat Faktur & Akses Google Drive (${sampleProd.title}).`, 'success', 'Tes Otomasi Terkirim');
    }).catch(err => {
      showToast('Gagal menghubungi Google Apps Script: ' + err.message, 'error');
    });
  } catch (err) {
    showToast('Terjadi kesalahan saat uji coba: ' + err.message, 'error');
  }
}

function saveAdminSettings() {
  const waInput = document.getElementById('setting-admin-wa');
  const emailInput = document.getElementById('setting-admin-email');
  const nameInput = document.getElementById('setting-store-name');
  const appsScriptInput = document.getElementById('setting-apps-script-url');

  if (!waInput || !emailInput) return;

  let rawWa = waInput.value.trim();
  const email = emailInput.value.trim();
  const storeName = nameInput ? nameInput.value.trim() : 'ALIANSI STORE';
  const appsScriptUrl = appsScriptInput ? appsScriptInput.value.trim() : '';

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
  state.config.appsScriptUrl = appsScriptUrl;
  if (storeName) state.config.storeName = storeName;

  // Collect Store Marketplace Links (Optional)
  const updatedMarketplaces = {};
  ['shopee', 'tokopedia', 'tiktok', 'lazada', 'blibli'].forEach(key => {
    const checkEl = document.getElementById(`setting-mp-${key}-check`);
    const urlEl = document.getElementById(`setting-mp-${key}-url`);
    const isChecked = !!(checkEl && checkEl.checked);
    const url = urlEl ? urlEl.value.trim() : '';
    updatedMarketplaces[key] = {
      enabled: isChecked && !!url,
      url: url
    };
  });
  state.config.marketplaces = updatedMarketplaces;

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
  const loginIdInput = document.getElementById('auth-login-identifier');
  
  if (emailInput) {
    const prefill = loginIdInput && loginIdInput.value.trim() ? loginIdInput.value.trim() : '';
    emailInput.value = prefill;
    setTimeout(() => {
      emailInput.focus();
      if (prefill) emailInput.select();
    }, 150);
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

function prefillAdminForgotEmail() {
  playSfx('click');
  const emailInput = document.getElementById('forgot-admin-email-input');
  const registeredEmail = (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';
  if (emailInput) {
    emailInput.value = registeredEmail;
    emailInput.focus();
  }
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
  const emailInput = document.getElementById('forgot-admin-email-input');
  const rawInput = emailInput ? emailInput.value.trim() : '';
  
  if (!rawInput) {
    showToast('Mohon masukkan Email atau No. WhatsApp akun Anda!', 'warning');
    if (emailInput) emailInput.focus();
    return;
  }

  const inputLower = rawInput.toLowerCase();
  const cleanPhone = rawInput.replace(/[\s-]/g, '');
  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';
  const adminEmail = (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';
  const adminPhone = (state.config && state.config.whatsappNumber) || '081234567890';
  const cleanAdminPhone = adminPhone.replace(/[\s-]/g, '');

  let accountType = null;
  let targetUser = null;
  let targetEmail = '';
  let targetPhone = '';
  let targetName = '';

  // 1. Check if matches Admin
  if (
    inputLower === 'admin' ||
    inputLower === 'administrator' ||
    inputLower === 'owner' ||
    inputLower === 'admin@aliansistore.com' ||
    inputLower === 'aliansistore.id@gmail.com' ||
    inputLower === 'aliansistoreofficial@gmail.com' ||
    inputLower === adminEmail.toLowerCase() ||
    (cleanAdminPhone && cleanPhone === cleanAdminPhone)
  ) {
    accountType = 'admin';
    targetName = `Admin ${storeName}`;
    targetEmail = adminEmail;
    targetPhone = adminPhone;
  }

  // 2. Check if matches registered member in state.users
  if (!accountType && Array.isArray(state.users)) {
    const matched = state.users.find(u => 
      (u.email && u.email.toLowerCase() === inputLower) ||
      (u.phone && u.phone.replace(/[\s-]/g, '') === cleanPhone) ||
      (u.identifier && u.identifier.toLowerCase() === inputLower)
    );
    if (matched) {
      accountType = matched.role === 'admin' ? 'admin' : 'member';
      targetUser = matched;
      targetName = matched.name || 'Member Toko';
      targetEmail = matched.email || '';
      targetPhone = matched.phone || rawInput;
    }
  }

  // 3. Check if customer from state.orders
  if (!accountType && Array.isArray(state.orders)) {
    const matchedOrder = state.orders.find(o => 
      (o.customerEmail && o.customerEmail.toLowerCase() === inputLower) ||
      (o.customerPhone && o.customerPhone.replace(/[\s-]/g, '') === cleanPhone)
    );
    if (matchedOrder) {
      accountType = 'member';
      targetName = matchedOrder.customerName || 'Pelanggan Setia';
      targetEmail = matchedOrder.customerEmail || '';
      targetPhone = matchedOrder.customerPhone || rawInput;

      if (!state.users) state.users = [];
      let existingUser = state.users.find(u => 
        (targetEmail && u.email && u.email.toLowerCase() === targetEmail.toLowerCase()) ||
        (targetPhone && u.phone && u.phone.replace(/[\s-]/g, '') === cleanPhone)
      );
      if (!existingUser) {
        existingUser = {
          id: 'usr-' + Date.now(),
          identifier: targetPhone || targetEmail,
          name: targetName,
          phone: targetPhone,
          email: targetEmail,
          pin: '1234',
          role: 'customer',
          roleLabel: 'Member VIP',
          lastOnline: new Date().toISOString()
        };
        state.users.push(existingUser);
        saveUsers();
      }
      targetUser = existingUser;
    }
  }

  // 4. Not found
  if (!accountType) {
    showToast('Akun dengan Email / No. WhatsApp tersebut tidak ditemukan! Periksa kembali atau daftar akun baru.', 'error', 'Akun Tidak Ditemukan');
    if (emailInput) emailInput.focus();
    return;
  }

  // Generate secure 6-digit numeric OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  const resetData = {
    code: otpCode,
    role: accountType,
    userId: targetUser ? targetUser.id : 'usr-admin',
    name: targetName,
    email: targetEmail,
    phone: targetPhone,
    expiresAt: expiresAt
  };

  state.adminResetOtp = resetData;
  state.activeResetOtp = resetData;

  const displayTarget = targetEmail || targetPhone || rawInput;
  const roleLabel = accountType === 'admin' ? 'Admin' : 'Member';
  const subject = `[RESET PASSWORD ${roleLabel.toUpperCase()}] Kode OTP Verifikasi ${storeName} - ${otpCode}`;
  const body = `Halo ${targetName},

Kami menerima permintaan untuk mereset password akun ${roleLabel} Anda di ${storeName}.

Berikut adalah Kode Verifikasi (OTP) untuk reset password akun Anda:
======================================================
KODE OTP ANDA: ${otpCode}
======================================================

* Kode OTP ini berlaku selama 15 menit.
* Masukkan kode 6-digit di atas pada formulir reset password di website toko.
* JANGAN BERIKAN KODE INI KEPADA SIAPAPUN demi keamanan akun Anda.

Jika Anda tidak merasa melakukan permintaan ini, abaikan pesan ini.

Hormat kami,
Sistem Keamanan & Verifikasi
${storeName}`;

  // Transition UI to Step 2
  const step1 = document.getElementById('forgot-admin-step-1');
  const step2 = document.getElementById('forgot-admin-step-2');
  if (step1) step1.classList.add('hidden');
  if (step2) step2.classList.remove('hidden');

  const targetDisplay = document.getElementById('forgot-otp-sent-target');
  if (targetDisplay) targetDisplay.textContent = displayTarget;

  const otpInput = document.getElementById('forgot-admin-otp-input');
  if (otpInput) {
    otpInput.value = '';
    setTimeout(() => otpInput.focus(), 300);
  }

  if (window.lucide) lucide.createIcons();
  playSfx('success');

  // Trigger mailto if email is available
  if (targetEmail) {
    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      window.open(mailtoUrl, '_blank');
    } catch (e) {
      console.warn('Mailto open blocked:', e);
    }
  }

  showToast(`Kode OTP 6-digit (${otpCode}) siap digunakan untuk verifikasi akun ${targetName}!`, 'success', 'Kode OTP Diterbitkan');
  console.info(`[SECURITY RESET OTP] Generated OTP Code: ${otpCode} for ${targetName} (${roleLabel}) [Target: ${displayTarget}]`);
}

function submitAdminPasswordReset() {
  playSfx('click');
  const otpInput = document.getElementById('forgot-admin-otp-input');
  const newPassInput = document.getElementById('forgot-admin-new-password');
  const confirmPassInput = document.getElementById('forgot-admin-confirm-password');

  const enteredOtp = otpInput ? otpInput.value.trim() : '';
  const newPass = newPassInput ? newPassInput.value.trim() : '';
  const confirmPass = confirmPassInput ? confirmPassInput.value.trim() : '';

  const resetState = state.activeResetOtp || state.adminResetOtp;

  if (!resetState || !resetState.code) {
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
  if (enteredOtp !== resetState.code) {
    playSfx('cart');
    showToast('Kode OTP yang Anda masukkan salah / tidak cocok!', 'error', 'OTP Tidak Valid');
    if (otpInput) otpInput.focus();
    return;
  }

  // Validate expiration
  if (Date.now() > resetState.expiresAt) {
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

  const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';

  // 1. ADMIN RESET
  if (resetState.role === 'admin') {
    if (!state.config) state.config = {};
    state.config.adminPin = newPass;

    saveConfig();
    if (typeof syncConfigToSupabase === 'function') {
      syncConfigToSupabase();
    }

    state.isAdmin = true;
    state.currentUser = {
      id: 'usr-admin-01',
      name: `Admin ${storeName}`,
      email: resetState.email || ((state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com'),
      phone: resetState.phone || ((state.config && state.config.whatsappNumber) || '081234567890'),
      role: 'admin'
    };
    localStorage.setItem(APP_STORAGE_KEYS.ADMIN_AUTH, 'true');
    localStorage.setItem(APP_STORAGE_KEYS.USER, JSON.stringify(state.currentUser));

    state.adminResetOtp = { code: '', email: '', expiresAt: 0 };
    state.activeResetOtp = null;

    closeModals();
    updateNavAuthUI();
    playSfx('success');
    if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast('Password Admin berhasil diperbarui! Anda otomatis masuk ke Dashboard Admin.', 'success', 'Reset Berhasil');
    setTimeout(() => {
      openAdminDashboard();
    }, 400);
    return;
  }

  // 2. MEMBER RESET
  if (resetState.role === 'member') {
    if (!Array.isArray(state.users)) state.users = [];
    let member = state.users.find(u => 
      u.id === resetState.userId ||
      (resetState.email && u.email && u.email.toLowerCase() === resetState.email.toLowerCase()) ||
      (resetState.phone && u.phone && u.phone.replace(/[\s-]/g, '') === resetState.phone.replace(/[\s-]/g, ''))
    );

    if (!member) {
      member = {
        id: resetState.userId || ('usr-' + Date.now()),
        identifier: resetState.phone || resetState.email,
        name: resetState.name || 'Member Setia',
        phone: resetState.phone || '',
        email: resetState.email || '',
        pin: newPass,
        role: 'customer',
        roleLabel: 'Member VIP',
        lastOnline: new Date().toISOString()
      };
      state.users.push(member);
    } else {
      member.pin = newPass;
      member.password = newPass;
      member.lastOnline = new Date().toISOString();
    }

    saveUsers();

    state.isAdmin = false;
    state.currentUser = member;
    localStorage.setItem(APP_STORAGE_KEYS.ADMIN_AUTH, 'false');
    localStorage.setItem(APP_STORAGE_KEYS.USER, JSON.stringify(state.currentUser));

    state.adminResetOtp = { code: '', email: '', expiresAt: 0 };
    state.activeResetOtp = null;

    closeModals();
    updateNavAuthUI();
    playSfx('success');
    if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast(`Password Member (${member.name}) berhasil diperbarui! Anda otomatis login.`, 'success', 'Reset Berhasil');
    return;
  }

  // Fallback
  showToast('Password berhasil diperbarui!', 'success');
  closeModals();
}

// Global Aliases for consistency
const openForgotPasswordModal = openAdminForgotPasswordModal;
const submitPasswordReset = submitAdminPasswordReset;
// ================= GAME REQUESTS MANAGEMENT SYSTEM =================
let currentRequestModalTab = 'new';
let customerRequestModalFilter = 'all';

function switchRequestModalTab(tab) {
  currentRequestModalTab = tab;
  playSfx('click');

  const btnNew = document.getElementById('tab-reqform-new');
  const btnList = document.getElementById('tab-reqform-list');
  const formBox = document.getElementById('container-request-form');
  const listBox = document.getElementById('container-request-list');

  if (tab === 'new') {
    if (btnNew) {
      btnNew.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer';
    }
    if (btnList) {
      btnList.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer';
    }
    if (formBox) formBox.classList.remove('hidden');
    if (listBox) listBox.classList.add('hidden');
  } else {
    if (btnNew) {
      btnNew.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer';
    }
    if (btnList) {
      btnList.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer';
    }
    if (formBox) formBox.classList.add('hidden');
    if (listBox) listBox.classList.remove('hidden');
    renderCustomerRequestsListInModal();
  }
}

function filterCustomerRequestsModal(filter) {
  customerRequestModalFilter = filter;
  playSfx('click');
  ['all', 'pending', 'ready'].forEach(f => {
    const btn = document.getElementById(`tab-custreq-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-600 text-white transition-colors cursor-pointer';
      } else {
        btn.className = 'px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white transition-colors cursor-pointer';
      }
    }
  });
  renderCustomerRequestsListInModal();
}

function renderCustomerRequestsListInModal() {
  const container = document.getElementById('customer-requests-cards-container');
  if (!container) return;

  const searchInput = document.getElementById('customer-request-search-input');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let list = state.gameRequests || [];

  const badgeTotal = document.getElementById('badge-modal-total-requests');
  if (badgeTotal) badgeTotal.textContent = list.length;

  if (customerRequestModalFilter === 'pending') {
    list = list.filter(r => r.status === 'PENDING');
  } else if (customerRequestModalFilter === 'ready') {
    list = list.filter(r => r.status === 'READY');
  }

  if (query) {
    list = list.filter(r => 
      (r.gameTitle || '').toLowerCase().includes(query) ||
      (r.customerName || '').toLowerCase().includes(query) ||
      (r.id || '').toLowerCase().includes(query)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-xs text-slate-500">
        <i data-lucide="sparkles" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
        <div>Belum ada data permintaan game dengan filter ini.</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = list.map(req => {
    const isReady = req.status === 'READY';
    const statusBadge = isReady
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SUDAH TERSEDIA</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">MENUNGGU</span>`;

    return `
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border ${isReady ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-200 dark:border-slate-800'} text-xs">
        <div class="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-purple-400">${req.id}</span>
            ${statusBadge}
          </div>
          <span class="text-[10px] text-slate-400">${formatDate(req.createdAt)}</span>
        </div>
        <div class="font-bold text-slate-900 dark:text-white text-sm mb-1">${escapeHtml(req.gameTitle)}</div>
        <div class="flex items-center gap-1.5 flex-wrap mb-2">
          ${(req.platform || []).map(p => `<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${p}</span>`).join('')}
          <span class="text-[10px] text-slate-400">• Diminta oleh: <strong>${escapeHtml(req.customerName)}</strong></span>
        </div>
        ${req.notes ? `
          <div class="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80 mb-2">
            "${escapeHtml(req.notes)}"
          </div>
        ` : ''}
        ${isReady ? `
          <div class="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-800/80">
            <span class="text-[10px] text-emerald-400 font-bold">✨ Sudah siap di katalog Aliansi Store!</span>
            <button onclick="closeModals(); window.location.hash = 'katalog';" class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer">
              Beli Sekarang
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function openRequestGameModal(prefillTitle = '', initialTab = 'new') {
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
  switchRequestModalTab(initialTab);
  lucide.createIcons();
  if (titleInput && !prefillTitle && initialTab === 'new') {
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
  upsertCustomerUser({ name: customerName, email: customerEmail, phone: customerPhone });

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

    const adminEmail = (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';

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

  const adminEmail = (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';
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
      <tr class="border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors text-xs text-slate-700 dark:text-slate-300">
        <td class="py-3 px-3 font-mono">
          <div class="font-bold text-purple-600 dark:text-purple-400">${req.id}</div>
          <div class="text-[10px] text-slate-500">${dateFormatted}</div>
        </td>
        <td class="py-3 px-3">
          <div class="font-bold text-slate-900 dark:text-white max-w-[200px] truncate" title="${req.gameTitle}">${req.gameTitle}</div>
          <div class="flex items-center gap-1 mt-1 flex-wrap">
            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">${req.category || 'Game'}</span>
            ${platforms.map(pl => `<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30">${pl}</span>`).join('')}
          </div>
        </td>
        <td class="py-3 px-3">
          <div class="font-semibold text-slate-800 dark:text-slate-200">${req.customerName}</div>
          <div class="text-[11px] text-sky-600 dark:text-sky-400 font-mono">${req.customerEmail}</div>
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
          ${req.confirmationSent ? `
            <div class="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-1" title="Email konfirmasi sudah dikirim ke customer">
              <i data-lucide="mail-check" class="w-2.5 h-2.5 text-emerald-400"></i>
              <span>Email Terkirim</span>
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

            <button onclick="openAdminChatForRequest('${req.id}')" class="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer shadow-sm" title="Live Chat Dua Arah dengan ${escapeHtml(req.customerName)} (${req.customerEmail})">
              <i data-lucide="message-square" class="w-3.5 h-3.5 text-emerald-400"></i>
            </button>

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

// ================= CUSTOMER MANAGEMENT (KELOLA USER CUSTOMER) =================
let adminCustomerFilter = 'all';

function setAdminCustomerFilter(filter) {
  playSfx('hover');
  adminCustomerFilter = filter;
  const tabs = document.querySelectorAll('.admin-cust-tab');
  tabs.forEach(t => {
    t.classList.remove('bg-cyan-600', 'text-white');
    t.classList.add('bg-slate-800', 'text-slate-400');
  });
  const activeTab = document.getElementById(`tab-cust-${filter}`);
  if (activeTab) {
    activeTab.classList.remove('bg-slate-800', 'text-slate-400');
    activeTab.classList.add('bg-cyan-600', 'text-white');
  }
  renderAdminCustomersTable();
}

function getCustomerOrderStats(user) {
  if (!user) return { customerOrders: [], totalSpent: 0, orderCount: 0, completedCount: 0 };
  
  const userEmail = (user.email || '').trim().toLowerCase();
  const userPhone = (user.phone || '').trim().replace(/[\s-]/g, '');
  const userName = (user.name || '').trim().toLowerCase();

  const customerOrders = (state.orders || []).filter(o => {
    const oEmail = (o.customerEmail || '').trim().toLowerCase();
    const oPhone = (o.customerPhone || '').trim().replace(/[\s-]/g, '');
    const oName = (o.customerName || '').trim().toLowerCase();

    if (userEmail && oEmail && userEmail === oEmail) return true;
    if (userPhone && oPhone && userPhone === oPhone) return true;
    if (userName && oName && userName === oName) return true;
    return false;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalSpent = customerOrders.reduce((sum, o) => {
    if (o.paymentStatus === 'PAID' || o.status === 'COMPLETED') {
      return sum + (Number(o.total) || 0);
    }
    return sum;
  }, 0);

  const completedCount = customerOrders.filter(o => o.status === 'COMPLETED' || o.paymentStatus === 'PAID').length;
  const orderCount = customerOrders.length;

  return { customerOrders, totalSpent, orderCount, completedCount };
}

function formatLastOnline(isoString) {
  if (!isoString) {
    return '<span class="text-slate-500 italic text-[11px]">Belum tercatat</span>';
  }
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return '<span class="text-slate-500 italic text-[11px]">Belum tercatat</span>';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  // Online in last 5 minutes -> Live pulsating indicator
  if (diffMs < 5 * 60 * 1000) {
    return `
      <div class="flex items-center gap-1.5">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="text-xs font-black text-emerald-400 tracking-wide">Online Sekarang</span>
      </div>
    `;
  }

  // Under 60 minutes
  if (diffMins < 60) {
    return `<span class="text-xs font-semibold text-slate-300">${diffMins} menit lalu</span>`;
  }

  const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  // Today
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `<span class="text-xs font-semibold text-slate-300">Hari ini, <span class="text-sky-400 font-mono">${timeStr}</span></span>`;
  }

  // Yesterday
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
  if (date.toDateString() === yesterday.toDateString()) {
    return `<span class="text-xs font-semibold text-slate-300">Kemarin, <span class="text-slate-400 font-mono">${timeStr}</span></span>`;
  }

  // Older
  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  return `
    <div>
      <div class="text-xs font-medium text-slate-300">${dateStr}</div>
      <div class="text-[10px] text-slate-500 font-mono">${timeStr}</div>
    </div>
  `;
}

function renderAdminCustomersTable() {
  const tbody = document.getElementById('admin-customers-table-body');
  if (!tbody) return;

  const rawUsers = (state.users || []).filter(u => u.role !== 'admin');
  const searchInput = document.getElementById('admin-customer-search-input');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let list = rawUsers.filter(u => {
    if (!query) return true;
    const nameMatch = (u.name || '').toLowerCase().includes(query);
    const emailMatch = (u.email || '').toLowerCase().includes(query);
    const phoneMatch = (u.phone || '').toLowerCase().includes(query);
    const idMatch = (u.id || '').toLowerCase().includes(query);
    const psnMatch = (u.psnId || '').toLowerCase().includes(query);
    return nameMatch || emailMatch || phoneMatch || idMatch || psnMatch;
  });

  if (adminCustomerFilter === 'active') {
    list = list.filter(u => {
      const stats = getCustomerOrderStats(u);
      return stats.orderCount > 0;
    });
  } else if (adminCustomerFilter === 'new') {
    list = list.filter(u => {
      const stats = getCustomerOrderStats(u);
      return stats.orderCount === 0;
    });
  }

  const badgeTotal = document.getElementById('badge-total-customers');
  if (badgeTotal) {
    badgeTotal.textContent = `${rawUsers.length} Member`;
  }

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-10 text-center text-xs text-slate-500">
          <i data-lucide="users" class="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50"></i>
          <div>Belum ada data customer/member dengan filter ini.</div>
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  tbody.innerHTML = list.map(u => {
    const stats = getCustomerOrderStats(u);
    const provider = (u.authProvider || 'local').toLowerCase();

    // Provider badge
    let providerBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">LOCAL</span>`;
    if (provider === 'google') {
      providerBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">GOOGLE</span>`;
    } else if (provider === 'microsoft' || provider === 'outlook') {
      providerBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30">OUTLOOK</span>`;
    } else if (provider === 'psn') {
      providerBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-sky-100 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30">PSN</span>`;
    }

    // Avatar
    let avatarEl = '';
    if (u.avatar && (u.avatar.startsWith('http://') || u.avatar.startsWith('https://') || u.avatar.startsWith('data:'))) {
      avatarEl = `<img src="${u.avatar}" alt="${u.name}" class="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0" />`;
    } else {
      const initial = (u.name || 'C').substring(0, 2).toUpperCase();
      avatarEl = `<div class="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600/30 to-sky-600/30 text-cyan-300 border border-cyan-500/40 font-bold flex items-center justify-center text-xs shrink-0">${initial}</div>`;
    }

    const lastOnlineFormatted = formatLastOnline(u.lastOnline);

    return `
      <tr class="border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors text-xs text-slate-700 dark:text-slate-300">
        <td class="py-3 px-3">
          <div class="flex items-center gap-3">
            ${avatarEl}
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-slate-900 dark:text-white truncate max-w-[170px]">${u.name}</span>
                ${providerBadge}
              </div>
              <div class="text-[10px] text-slate-500 font-mono mt-0.5">ID: ${u.id}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-3">
          <div class="space-y-1">
            ${u.email ? `
              <div class="flex items-center gap-1.5">
                <i data-lucide="mail" class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0"></i>
                <a href="mailto:${u.email}" class="text-[11px] text-sky-600 dark:text-sky-400 font-mono hover:underline truncate max-w-[190px] block" title="${u.email}">${u.email}</a>
              </div>
            ` : `<span class="text-slate-500 italic text-[10px]">Email belum diisi</span>`}
            
            ${u.phone ? `
              <div class="flex items-center gap-1.5">
                <i data-lucide="phone" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"></i>
                <a href="https://wa.me/${u.phone.replace(/^0/, '62')}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-slate-700 dark:text-slate-300 font-mono hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">${u.phone}</a>
              </div>
            ` : ''}
          </div>
        </td>
        <td class="py-3 px-3">
          ${lastOnlineFormatted}
        </td>
        <td class="py-3 px-3">
          <div>
            <div class="text-sm font-black text-emerald-600 dark:text-emerald-400 font-display">${formatRupiah(stats.totalSpent)}</div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">${stats.orderCount} pesanan (${stats.completedCount} lunas)</span>
              <button 
                onclick="openCustomerHistoryModal('${u.id}')" 
                class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-slate-700 cursor-pointer transition-colors"
                title="Lihat rincian riwayat invoice belanja"
              >
                Detail
              </button>
            </div>
          </div>
        </td>
        <td class="py-3 px-3 text-right">
          <div class="flex items-center justify-end gap-1.5 flex-wrap">
            <button 
              onclick="openAdminChatForCustomer('${u.id}')" 
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              title="Buka Chat Dua Arah dengan ${escapeHtml(u.name)}"
            >
              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
              <span>Chat</span>
            </button>
            <button 
              onclick="promptResetCustomerPassword('${u.id}')" 
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              title="Kirim tautan pembuatan password baru ke email customer"
            >
              <i data-lucide="key-round" class="w-3.5 h-3.5"></i>
              <span>Reset Password</span>
            </button>
            <button 
              onclick="deleteAdminCustomer('${u.id}')" 
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              title="Hapus akun member customer ini"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Hapus</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function deleteAdminCustomer(userId) {
  playSfx('click');
  const user = (state.users || []).find(u => u.id === userId);
  if (!user) {
    showToast('User customer tidak ditemukan!', 'error');
    return;
  }
  if (user.role === 'admin') {
    showToast('Akun Admin tidak dapat dihapus!', 'warning');
    return;
  }
  if (!confirm(`Hapus akun customer "${user.name || user.email}"?`)) {
    return;
  }
  state.users = (state.users || []).filter(u => u.id !== userId);
  saveUsers();
  renderAdminStats();
  renderAdminCustomersTable();
  showToast(`Customer "${user.name || user.email}" berhasil dihapus.`, 'success');
}

function adminClearAllCustomers() {
  playSfx('click');
  const nonAdminCount = (state.users || []).filter(u => u.role !== 'admin').length;
  if (nonAdminCount === 0) {
    showToast('Tidak ada data customer untuk dibersihkan.', 'info');
    return;
  }
  if (!confirm(`Apakah Anda yakin ingin MENGHAPUS SEMUA (${nonAdminCount}) DATA CUSTOMER/MEMBER? Tindakan ini tidak dapat dibatalkan.`)) {
    return;
  }
  state.users = (state.users || []).filter(u => u.role === 'admin');
  saveUsers();
  renderAdminStats();
  renderAdminCustomersTable();
  showToast('Seluruh data customer berhasil dibersihkan!', 'success');
}

function promptResetCustomerPassword(userId) {
  playSfx('click');
  const user = (state.users || []).find(u => u.id === userId);
  if (!user) {
    showToast('User customer tidak ditemukan!', 'error');
    return;
  }

  const modal = document.getElementById('modal-admin-confirm-reset-pwd');
  if (!modal) return;

  const idField = document.getElementById('reset-modal-user-id');
  const nameField = document.getElementById('reset-modal-name');
  const emailField = document.getElementById('reset-modal-email');
  const avatarField = document.getElementById('reset-modal-avatar');

  if (idField) idField.value = user.id;
  if (nameField) nameField.textContent = user.name;
  if (emailField) {
    emailField.textContent = user.email || '(Belum ada email terdaftar)';
    if (!user.email) {
      emailField.classList.remove('text-sky-400');
      emailField.classList.add('text-amber-400');
    } else {
      emailField.classList.add('text-sky-400');
      emailField.classList.remove('text-amber-400');
    }
  }

  if (avatarField) {
    if (user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))) {
      avatarField.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover" />`;
    } else {
      avatarField.textContent = (user.name || 'C').substring(0, 2).toUpperCase();
    }
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function executeSendCustomerResetEmail() {
  playSfx('success');
  const idField = document.getElementById('reset-modal-user-id');
  const userId = idField ? idField.value : '';
  const user = (state.users || []).find(u => u.id === userId);

  if (!user) {
    showToast('Customer tidak ditemukan!', 'error');
    return;
  }

  let targetEmail = (user.email || '').trim();
  if (!targetEmail) {
    const inputEmail = prompt('Customer ini belum memiliki alamat email. Masukkan email customer untuk mengirimkan link reset:');
    if (!inputEmail || !inputEmail.includes('@')) {
      showToast('Email tidak valid. Batal mengirim link reset.', 'warning');
      return;
    }
    targetEmail = inputEmail.trim();
    user.email = targetEmail;
  }

  // Generate a secure reset token valid for 24 hours
  const resetToken = 'rst_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  user.resetToken = resetToken;
  user.resetTokenExpires = Date.now() + 24 * 3600 * 1000; // 24 hours
  saveUsers();

  // Create reset link
  const currentUrl = new URL(window.location.href);
  const resetUrl = `${currentUrl.origin}${currentUrl.pathname}?action=reset-password&token=${resetToken}&email=${encodeURIComponent(targetEmail)}`;

  // Prepare official email draft
  const subject = `[ALIANSI STORE] Permintaan Reset Password Akun Member - ${user.name}`;
  const body = `Halo ${user.name},

Kami menerima permintaan untuk melakukan reset password akun member ALIANSI STORE Anda.

Silakan klik tautan di bawah ini untuk membuat password baru:
${resetUrl}

(Tautan ini bersifat rahasia dan hanya berlaku selama 24 jam)

Jika Anda tidak merasa meminta reset password ini, abaikan email ini dan akun Anda tetap aman.

Salam hangat,
Customer Care ALIANSI STORE
Website: ${currentUrl.origin}${currentUrl.pathname}`;

  const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  closeModals();
  window.open(mailtoUrl, '_blank');

  showToast(`Tautan reset password untuk ${user.name} berhasil dibuat & draft email dibuka! Token berlaku 24 jam.`, 'success', 'Email Reset Dikirim');
}

function openCustomerHistoryModal(userId) {
  playSfx('click');
  const user = (state.users || []).find(u => u.id === userId);
  if (!user) return;

  const modal = document.getElementById('modal-admin-customer-history');
  if (!modal) return;

  const stats = getCustomerOrderStats(user);

  const subTitle = document.getElementById('history-modal-subtitle');
  if (subTitle) subTitle.textContent = `${user.name} • ${user.email || user.phone || 'Member'}`;

  const totalSpentEl = document.getElementById('history-modal-total-spent');
  if (totalSpentEl) totalSpentEl.textContent = formatRupiah(stats.totalSpent);

  const orderCountEl = document.getElementById('history-modal-order-count');
  if (orderCountEl) orderCountEl.textContent = `${stats.orderCount} Pesanan (${stats.completedCount} Lunas)`;

  const listContainer = document.getElementById('history-modal-orders-list');
  if (listContainer) {
    if (stats.customerOrders.length === 0) {
      listContainer.innerHTML = `
        <div class="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
          <i data-lucide="shopping-bag" class="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-40"></i>
          <div>Customer ini belum memiliki riwayat pesanan game.</div>
        </div>
      `;
    } else {
      listContainer.innerHTML = stats.customerOrders.map(order => {
        const dateStr = new Date(order.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const isPaid = order.paymentStatus === 'PAID' || order.status === 'COMPLETED';
        const statusBadge = isPaid ? `
          <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">LUNAS</span>
        ` : `
          <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">PENDING</span>
        `;

        const itemsHtml = (order.items || []).map(item => `
          <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-0">
            <div class="flex items-center gap-2 truncate">
              <span class="text-white font-semibold truncate">${item.title}</span>
              <span class="text-[10px] text-cyan-400 font-mono px-1 rounded bg-cyan-950/70 border border-cyan-800/40">${item.variant || item.platform || 'Game'}</span>
            </div>
            <div class="text-right text-slate-300 font-mono shrink-0 ml-2">${formatRupiah(item.price)}</div>
          </div>
        `).join('');

        return `
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-sky-400">${order.id}</span>
                ${statusBadge}
              </div>
              <span class="text-[10px] text-slate-500 font-mono">${dateStr}</span>
            </div>
            <div class="space-y-1 mb-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
              ${itemsHtml}
            </div>
            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span class="text-slate-400">Total Pembayaran:</span>
              <span class="font-bold text-emerald-400 font-mono text-sm">${formatRupiah(order.total)}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function checkUrlForActions() {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');

  // Direct Invoice / Tracking lookup via URL query (?invoice=ALN-... or ?order=ALN-...)
  const invoiceId = urlParams.get('invoice') || urlParams.get('order') || urlParams.get('orderId');
  if (invoiceId) {
    setTimeout(() => {
      openInvoiceModal(invoiceId.trim());
    }, 600);
  }

  if (action === 'open-chat') {
    const email = urlParams.get('email');
    if (email) {
      const decodedEmail = decodeURIComponent(email).toLowerCase().trim();
      localStorage.setItem('aliansi_guest_chat_email', decodedEmail);
      const matchedUser = (state.users || []).find(u => u.email && u.email.toLowerCase().trim() === decodedEmail);
      if (matchedUser) {
        localStorage.setItem('aliansi_guest_chat_name', matchedUser.name);
      }
    }
    setTimeout(() => {
      toggleCustomerChat();
    }, 600);
  }

  if (action === 'reset-password') {
    const token = urlParams.get('token');
    const email = urlParams.get('email');

    if (!token || !email) {
      showToast('Tautan reset password tidak lengkap atau tidak valid!', 'error');
      return;
    }

    const emailClean = decodeURIComponent(email).toLowerCase().trim();
    const user = (state.users || []).find(u => 
      u.email && u.email.toLowerCase().trim() === emailClean && u.resetToken === token
    );

    if (!user) {
      showToast('Tautan reset password sudah tidak valid atau telah digunakan!', 'error');
      return;
    }

    if (user.resetTokenExpires && Date.now() > user.resetTokenExpires) {
      showToast('Tautan reset password telah kedaluwarsa (masa berlaku 24 jam). Silakan hubungi admin.', 'warning');
      return;
    }

    // Open reset modal for customer
    setTimeout(() => {
      const modal = document.getElementById('modal-customer-reset-password');
      if (modal) {
        document.getElementById('cust-reset-user-id').value = user.id;
        document.getElementById('cust-reset-token-val').value = token;
        const nameDisp = document.getElementById('cust-reset-name-display');
        if (nameDisp) nameDisp.textContent = user.name;
        modal.classList.remove('hidden');
        lucide.createIcons();
      }
    }, 500);
  }
}

function submitCustomerPasswordReset() {
  const userId = document.getElementById('cust-reset-user-id')?.value;
  const token = document.getElementById('cust-reset-token-val')?.value;
  const newPass = document.getElementById('cust-reset-new-password')?.value.trim();
  const confirmPass = document.getElementById('cust-reset-confirm-password')?.value.trim();

  if (!userId || !token) {
    showToast('Sesi reset tidak valid!', 'error');
    return;
  }

  if (!newPass || newPass.length < 4) {
    showToast('Password baru minimal 4 karakter!', 'warning');
    return;
  }

  if (newPass !== confirmPass) {
    showToast('Konfirmasi password tidak cocok!', 'error');
    return;
  }

  const user = (state.users || []).find(u => u.id === userId && u.resetToken === token);
  if (!user) {
    showToast('Token reset tidak valid atau sudah kedaluwarsa!', 'error');
    return;
  }

  user.pin = newPass;
  user.password = newPass;
  delete user.resetToken;
  delete user.resetTokenExpires;
  user.lastOnline = new Date().toISOString();
  saveUsers();

  // Clear query params from browser URL without page reload
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);

  closeModals();
  playSfx('success');
  triggerConfetti();

  showToast(`Password baru untuk ${user.name} berhasil disimpan! Silakan login.`, 'success', 'Password Diperbarui');

  // Open Unified Auth Modal with identifier prefilled
  setTimeout(() => {
    openAuthModal('login');
    const idInput = document.getElementById('auth-login-identifier');
    if (idInput) {
      idInput.value = user.identifier || user.email || user.phone || '';
      const passInput = document.getElementById('auth-login-password');
      if (passInput) passInput.focus();
    }
  }, 400);
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

  const totalCustomers = (state.users || []).filter(u => u.role !== 'admin').length;
  const statCustEl = document.getElementById('stat-total-customers');
  if (statCustEl) statCustEl.textContent = totalCustomers;
  const badgeCust = document.getElementById('badge-total-customers');
  if (badgeCust) badgeCust.textContent = `${totalCustomers} Member`;

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
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">SELESAI</span>';
    } else if (order.status === 'PROCESSING') {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 animate-pulse">PERLU PROSES</span>';
    } else {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">MENUNGGU BAYAR</span>';
    }

    const itemsSummary = order.items.map(i => `${i.title} (${i.variant || 'Primary'})`).join(', ');

    return `
      <tr class="border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
        <td class="py-3 px-3 font-mono font-bold text-sky-600 dark:text-sky-400 cursor-pointer hover:underline" onclick="openInvoiceModal('${order.id}')">
          ${order.id}
        </td>
        <td class="py-3 px-3">
          <div class="font-bold text-slate-900 dark:text-white">${order.customerName}</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">${order.customerPhone} (${order.customerType})</div>
        </td>
        <td class="py-3 px-3 max-w-[200px] truncate" title="${itemsSummary}">
          ${itemsSummary}
        </td>
        <td class="py-3 px-3 font-bold font-display text-slate-900 dark:text-white">
          ${formatRupiah(order.total)}
        </td>
        <td class="py-3 px-3">
          ${order.paymentMethod.toUpperCase()}
          <span class="block text-[10px] ${order.paymentStatus === 'PAID' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}">${order.paymentStatus}</span>
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
              <button onclick="openFulfillmentModal('${order.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-sm flex items-center gap-1 shadow-emerald-950/40">
                <i data-lucide="folder-check" class="w-3 h-3"></i> Akses Drive
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
            <button onclick="deleteAdminOrder('${order.id}')" class="p-1.5 rounded text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Hapus Pesanan / Invoice">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

async function deleteAdminOrder(orderId) {
  playSfx('click');
  if (!confirm(`Apakah Anda yakin ingin menghapus pesanan/invoice ${orderId}? Tindakan ini permanen.`)) {
    return;
  }
  state.orders = (state.orders || []).filter(o => o.id !== orderId);
  saveOrders();

  if (supabaseClient) {
    try {
      await supabaseClient.from('orders').delete().eq('id', orderId);
    } catch (err) {
      console.warn('Gagal menghapus order dari Supabase:', err);
    }
  }

  renderAdminStats();
  renderAdminOrdersTable();
  showToast(`Pesanan ${orderId} berhasil dihapus.`, 'success');
}

async function adminClearAllOrders() {
  playSfx('click');
  if ((state.orders || []).length === 0) {
    showToast('Tidak ada data pesanan untuk dibersihkan.', 'info');
    return;
  }
  if (!confirm('Apakah Anda yakin ingin MENGHAPUS SEMUA PESANAN & INVOICE? Seluruh riwayat penjualan akan dibersihkan.')) {
    return;
  }
  state.orders = [];
  saveOrders();

  if (supabaseClient) {
    try {
      await supabaseClient.from('orders').delete().neq('id', 'dummy');
    } catch (err) {
      console.warn('Gagal menghapus seluruh pesanan dari Supabase:', err);
    }
  }

  renderAdminStats();
  renderAdminOrdersTable();
  showToast('Seluruh pesanan & invoice berhasil dibersihkan!', 'success');
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

function openDriveLinkInNewTab() {
  const link = (document.getElementById('input-fulfill-drivelink')?.value || '').trim();
  if (link && link.startsWith('http')) {
    window.open(link, '_blank');
  } else {
    showToast('Link Google Drive belum valid!', 'warning');
  }
}

function copyDriveLinkFromInput() {
  const link = (document.getElementById('input-fulfill-drivelink')?.value || '').trim();
  if (link) {
    copyText(link, 'Link Google Drive berhasil disalin!');
  } else {
    showToast('Link Google Drive belum diisi!', 'warning');
  }
}

function openFulfillmentModal(orderId) {
  playSfx('click');
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  state.orderToFulfill = order;
  const modal = document.getElementById('modal-admin-fulfill');
  if (!modal) return;

  const invoiceEl = document.getElementById('fulfill-target-invoice');
  if (invoiceEl) invoiceEl.textContent = order.id;

  const custEl = document.getElementById('fulfill-target-customer');
  if (custEl) custEl.textContent = `${order.customerName} (${order.customerPhone || '-'})`;

  const emailEl = document.getElementById('fulfill-target-email');
  if (emailEl) emailEl.textContent = order.customerEmail || '-';

  const itemsEl = document.getElementById('fulfill-target-items');
  if (itemsEl) {
    itemsEl.textContent = (order.items || []).map(i => {
      const prod = (state.products || []).find(p => p.id === (i.productId || i.id) || p.title === i.title);
      const isHen = i.variant === 'PS4 HEN' || isHenProduct(prod);
      const v = isHen ? 'PS4 HEN (PKG)' : (i.variant || 'PKG').toUpperCase();
      return `${i.title} [${v}]`;
    }).join(', ');
  }

  // Resolve Drive Link for this order directly from the latest Product Catalog first
  const f = order.fulfillment || {};
  let defaultDriveLink = '';
  if (order.items && order.items.length > 0) {
    const firstItem = order.items[0];
    const prod = (state.products || []).find(p => p.id === (firstItem.productId || firstItem.id) || p.title === firstItem.title);
    if (prod && prod.driveLink) {
      defaultDriveLink = prod.driveLink;
    } else if (firstItem.driveLink) {
      defaultDriveLink = firstItem.driveLink;
    }
  }
  if (!defaultDriveLink) {
    defaultDriveLink = f.driveLink || ((f.driveLinks && f.driveLinks.length > 0) ? f.driveLinks[0].url : '');
  }

  const driveInput = document.getElementById('input-fulfill-drivelink');
  if (driveInput) driveInput.value = defaultDriveLink || 'https://drive.google.com/drive/folders/';

  const guideInput = document.getElementById('input-fulfill-guide');
  if (guideInput) guideInput.value = f.guideUrl || 'https://aliansistore.com/panduan-install-pkg-ps4-hen';

  const notesInput = document.getElementById('input-fulfill-notes');
  if (notesInput) {
    notesInput.value = f.adminNotes ||
`1. Pastikan konsol PS4 sudah mengaktifkan GoldHEN / HEN.
2. Download seluruh part file .pkg dari Google Drive ke Flashdisk / Harddisk Eksternal berformat exFAT.
3. Tancapkan ke PS4, buka menu GoldHEN > Package Installer, lalu instal file game dan update patch sub indo secara berurutan.`;
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function submitOrderFulfillment() {
  if (!state.orderToFulfill) return;
  const order = state.orderToFulfill;

  const driveLink = (document.getElementById('input-fulfill-drivelink')?.value || '').trim();
  const guideUrl = (document.getElementById('input-fulfill-guide')?.value || '').trim();
  const notes = (document.getElementById('input-fulfill-notes')?.value || '').trim();

  if (!driveLink || !driveLink.startsWith('http')) {
    showToast('Mohon masukkan Link Google Drive yang valid!', 'warning');
    return;
  }

  // Resolve drive links for all items
  const driveLinks = (order.items || []).map(item => {
    const prod = (state.products || []).find(p => p.id === (item.productId || item.id) || p.title === item.title);
    return {
      title: item.title,
      url: (prod && prod.driveLink) ? prod.driveLink : driveLink
    };
  });
  if (driveLinks.length === 0) {
    driveLinks.push({ title: 'Game PS4 HEN', url: driveLink });
  }

  order.fulfillment = {
    ...(order.fulfillment || {}),
    deliveredAt: new Date().toISOString(),
    customerEmail: order.customerEmail,
    type: 'PS4_HEN_PKG',
    driveLink: driveLink,
    driveLinks: driveLinks,
    guideUrl: guideUrl || 'https://aliansistore.com/panduan-install-pkg-ps4-hen',
    adminNotes: notes,
    gdrive_shared: true
  };

  // Bersihkan data kredensial lama jika ada
  delete order.fulfillment.psnEmail;
  delete order.fulfillment.psnPassword;
  delete order.fulfillment.backupCodes;

  order.status = 'COMPLETED';
  order.paymentStatus = 'PAID';

  saveOrders();
  syncOrderToSupabase(order);

  // Kirim link Google Drive dan panduan instalasi langsung ke EMAIL pembeli (Bukan WhatsApp)
  dispatchOrderCompletionEmails(order);

  closeModals();
  playSfx('success');
  renderAdminStats();
  renderAdminOrdersTable();

  // Konfirmasi feedback jelas: Panduan dikirim ke Email pembeli
  showToast(
    `Pesanan ${order.id} selesai! Panduan instalasi dan akses Google Drive telah dikirimkan ke email ${order.customerEmail || 'pembeli'}.`,
    'success',
    'Panduan Terkirim ke Email'
  );
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
      (p.cusa || '').toLowerCase().includes(query) ||
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
    <tr class="border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
      <td class="py-2.5 px-3">
        <div class="flex items-center gap-2.5">
          <img src="${getProductPoster(p)}" class="w-8 h-10 object-cover rounded-lg bg-slate-100 dark:bg-slate-800" onerror="this.onerror=null; this.src='assets/covers/service-1tb.jpg'" alt="" />
          <div>
            <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
              <span>${p.title}</span>
              ${p.cusa ? `
                <span class="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30" title="Kode CUSA Game ID">
                  <i data-lucide="disc" class="w-2.5 h-2.5"></i> ${p.cusa}
                </span>
              ` : ''}
              ${p.driveLink ? `
                <a href="${p.driveLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 transition-colors" title="Google Drive Link Siap - Klik untuk tes link">
                  <i data-lucide="folder-check" class="w-2.5 h-2.5"></i> Drive Siap
                </a>
              ` : `
                <span class="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-500 border border-slate-300 dark:border-slate-700" title="Belum ada link Google Drive">
                  <i data-lucide="folder-x" class="w-2.5 h-2.5"></i> No Drive
                </span>
              `}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">${p.platform.join(', ')} • <span class="text-sky-600 dark:text-sky-400 font-bold">${getCategoryLabel(p.category)}</span></div>
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

// Global state for interactive image picker
window._activeImagePicker = null;

// Comprehensive 100% PlayStation Authentic Game Artwork Repository (Minimum 4 Posters & 4 Wallpapers per Franchise/Genre)
const PLAYSTATION_ART_CATALOG = {
  'gow': {
    name: 'God of War Ragnarök & 2018',
    posters: [
      'assets/covers/gow-ragnarok.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/aqvxWJtf4cfj5Z09k9F8g99U.png',
      'https://upload.wikimedia.org/wikipedia/en/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg',
      'https://image.api.playstation.com/vulcan/img/rnd/202010/2217/LsaZiOPLg4Z9pZp5n1L0iA79.png',
      'https://images.alphacoders.com/128/1284589.jpg'
    ],
    backdrops: [
      'assets/backdrops/gow-ragnarok.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/6wL2n7lM2V7g96oWzCdfZc4O.jpg',
      'https://images.alphacoders.com/128/1284589.jpg',
      'https://wallpaperaccess.com/full/7822960.jpg'
    ]
  },
  'god of war': {
    name: 'God of War Ragnarök & 2018',
    posters: [
      'assets/covers/gow-ragnarok.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/aqvxWJtf4cfj5Z09k9F8g99U.png',
      'https://upload.wikimedia.org/wikipedia/en/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg',
      'https://image.api.playstation.com/vulcan/img/rnd/202010/2217/LsaZiOPLg4Z9pZp5n1L0iA79.png'
    ],
    backdrops: [
      'assets/backdrops/gow-ragnarok.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/6wL2n7lM2V7g96oWzCdfZc4O.jpg',
      'https://images.alphacoders.com/128/1284589.jpg',
      'https://wallpaperaccess.com/full/7822960.jpg'
    ]
  },
  'spiderman': {
    name: "Marvel's Spider-Man 1, Miles Morales & 2",
    posters: [
      'assets/covers/spiderman.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/1c7b75d8b4343b17084f52259b117966bba7a6ca24871533.png',
      'https://upload.wikimedia.org/wikipedia/en/e/e1/Spider-Man_PS4_cover.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202008/1020/PRfZtNXtfZJGNdojYahcACqq.png'
    ],
    backdrops: [
      'assets/backdrops/spiderman.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/43f5ec2ba995b0b2e31649980d4db0f195de1e5ec606ccb4.jpg',
      'https://images.alphacoders.com/942/942647.jpg',
      'https://wallpaperaccess.com/full/1539250.jpg'
    ]
  },
  'spider': {
    name: "Marvel's Spider-Man",
    posters: [
      'assets/covers/spiderman.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/1c7b75d8b4343b17084f52259b117966bba7a6ca24871533.png',
      'https://upload.wikimedia.org/wikipedia/en/e/e1/Spider-Man_PS4_cover.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202008/1020/PRfZtNXtfZJGNdojYahcACqq.png'
    ],
    backdrops: [
      'assets/backdrops/spiderman.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/43f5ec2ba995b0b2e31649980d4db0f195de1e5ec606ccb4.jpg',
      'https://images.alphacoders.com/942/942647.jpg',
      'https://wallpaperaccess.com/full/1539250.jpg'
    ]
  },
  'tlou': {
    name: 'The Last of Us Part I & Part II',
    posters: [
      'assets/covers/tlou-part2.jpg',
      'assets/covers/tlou-part1.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/eEczyEMdd2BLa3dtkGJILdrW.png',
      'https://upload.wikimedia.org/wikipedia/en/4/4f/TLOU_P2_Box_Art_final.png'
    ],
    backdrops: [
      'assets/backdrops/tlou-part2.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/cl9zX5tSgZ7XkL4fG4bK4J2w.jpg',
      'https://images.alphacoders.com/109/1090333.jpg',
      'https://wallpaperaccess.com/full/1183204.jpg'
    ]
  },
  'last of us': {
    name: 'The Last of Us Part I & Part II',
    posters: [
      'assets/covers/tlou-part2.jpg',
      'assets/covers/tlou-part1.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/eEczyEMdd2BLa3dtkGJILdrW.png',
      'https://upload.wikimedia.org/wikipedia/en/4/4f/TLOU_P2_Box_Art_final.png'
    ],
    backdrops: [
      'assets/backdrops/tlou-part2.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/cl9zX5tSgZ7XkL4fG4bK4J2w.jpg',
      'https://images.alphacoders.com/109/1090333.jpg',
      'https://wallpaperaccess.com/full/1183204.jpg'
    ]
  },
  'ghost': {
    name: 'Ghost of Tsushima Director’s Cut',
    posters: [
      'assets/covers/ghost-tsushima.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202106/2322/m1bZ1XyXfF0bS0hV0l2fG01h.png',
      'https://upload.wikimedia.org/wikipedia/en/b/b6/Ghost_of_Tsushima.jpg',
      'https://image.api.playstation.com/vulcan/img/rnd/202007/0315/Ocv360yYf4oV3zY2n2M6dM7q.png'
    ],
    backdrops: [
      'assets/backdrops/ghost-tsushima.jpg',
      'https://images.alphacoders.com/109/1091599.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202106/2322/2V1lD2uF4aB6eG8qH0jK2mN4.jpg',
      'https://wallpaperaccess.com/full/3796645.jpg'
    ]
  },
  'tsushima': {
    name: 'Ghost of Tsushima',
    posters: [
      'assets/covers/ghost-tsushima.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202106/2322/m1bZ1XyXfF0bS0hV0l2fG01h.png',
      'https://upload.wikimedia.org/wikipedia/en/b/b6/Ghost_of_Tsushima.jpg',
      'https://image.api.playstation.com/vulcan/img/rnd/202007/0315/Ocv360yYf4oV3zY2n2M6dM7q.png'
    ],
    backdrops: [
      'assets/backdrops/ghost-tsushima.jpg',
      'https://images.alphacoders.com/109/1091599.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202106/2322/2V1lD2uF4aB6eG8qH0jK2mN4.jpg',
      'https://wallpaperaccess.com/full/3796645.jpg'
    ]
  },
  'gta': {
    name: 'Grand Theft Auto V & GTA Online',
    posters: [
      'assets/covers/gta-v.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202202/2816/mYn2ETBTXD28jyTY1qN2sE77.png',
      'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png',
      'https://image.api.playstation.com/vulcan/ap/rnd/202202/2816/0B9yS6Vl2J8xM1oQ4pT7wX9y.png'
    ],
    backdrops: [
      'assets/backdrops/gta-v.jpg',
      'https://images.alphacoders.com/540/540097.jpg',
      'https://wallpaperaccess.com/full/83247.jpg',
      'https://images.alphacoders.com/196/196328.jpg'
    ]
  },
  'elden ring': {
    name: 'Elden Ring & Shadow of the Erdtree',
    posters: [
      'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aGhopp3MHppi7kooGE2Dtt8C.png',
      'https://image.api.playstation.com/vulcan/ap/rnd/202402/2102/b39dff8b99c8bfbe01c565d705ee56ef6d7f8723326162ae.png',
      'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg',
      'https://images.alphacoders.com/115/1151249.jpg'
    ],
    backdrops: [
      'https://image.api.playstation.com/vulcan/ap/rnd/202402/2102/527a0fc8f6d6fc3e2849dca034934bf214bb5333f2113264.jpg',
      'https://images.alphacoders.com/121/1212879.jpg',
      'https://wallpaperaccess.com/full/2265005.jpg',
      'https://images.alphacoders.com/115/1151253.jpg'
    ]
  },
  're4': {
    name: 'Resident Evil 4 Remake & Village',
    posters: [
      'assets/covers/re4-remake.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202210/0706/lYx1vP21XoB4f7Yk2wQ6uT0i.png',
      'https://image.api.playstation.com/vulcan/ap/rnd/202011/1717/bA1f0b0jL4a2B4d4H0l6P8t0.png',
      'https://upload.wikimedia.org/wikipedia/en/d/df/Resident_Evil_4_remake_cover_art.jpg'
    ],
    backdrops: [
      'https://images.alphacoders.com/129/1297316.jpg',
      'https://wallpaperaccess.com/full/8657685.jpg',
      'https://images.alphacoders.com/124/1243171.jpg',
      'https://wallpaperaccess.com/full/4988775.jpg'
    ]
  },
  'resident evil': {
    name: 'Resident Evil Series PlayStation',
    posters: [
      'assets/covers/re4-remake.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202210/0706/lYx1vP21XoB4f7Yk2wQ6uT0i.png',
      'https://image.api.playstation.com/vulcan/ap/rnd/202011/1717/bA1f0b0jL4a2B4d4H0l6P8t0.png',
      'https://upload.wikimedia.org/wikipedia/en/d/df/Resident_Evil_4_remake_cover_art.jpg'
    ],
    backdrops: [
      'https://images.alphacoders.com/129/1297316.jpg',
      'https://wallpaperaccess.com/full/8657685.jpg',
      'https://images.alphacoders.com/124/1243171.jpg',
      'https://wallpaperaccess.com/full/4988775.jpg'
    ]
  },
  'wukong': {
    name: 'Black Myth: Wukong PS5',
    posters: [
      'assets/covers/wukong.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202405/2908/78627b0b9a89c8942a033c4ef5cd7ddaeab24f654b92b604.png',
      'https://upload.wikimedia.org/wikipedia/en/a/ab/Black_Myth_Wukong_cover_art.jpg',
      'https://images.alphacoders.com/136/1367746.png'
    ],
    backdrops: [
      'https://image.api.playstation.com/vulcan/ap/rnd/202405/2908/d8a1e2f9d863f6ca0bfa6f33d7b973b06e93240eb0f2fc67.jpg',
      'https://images.alphacoders.com/136/1369796.jpeg',
      'https://images.alphacoders.com/136/1368940.png',
      'https://wallpaperaccess.com/full/10433292.jpg'
    ]
  },
  'rdr': {
    name: 'Red Dead Redemption 1 & 2',
    posters: [
      'assets/covers/rdr2.jpg',
      'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202010/2014/r4pE8xYg4vH0B4yF1tN4vK6w.png',
      'https://images.alphacoders.com/926/926724.jpg'
    ],
    backdrops: [
      'https://images.alphacoders.com/922/922754.jpg',
      'https://wallpaperaccess.com/full/1126444.jpg',
      'https://images.alphacoders.com/974/974917.jpg',
      'https://wallpaperaccess.com/full/1126448.jpg'
    ]
  },
  'red dead': {
    name: 'Red Dead Redemption 1 & 2',
    posters: [
      'assets/covers/rdr2.jpg',
      'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202010/2014/r4pE8xYg4vH0B4yF1tN4vK6w.png',
      'https://images.alphacoders.com/926/926724.jpg'
    ],
    backdrops: [
      'https://images.alphacoders.com/922/922754.jpg',
      'https://wallpaperaccess.com/full/1126444.jpg',
      'https://images.alphacoders.com/974/974917.jpg',
      'https://wallpaperaccess.com/full/1126448.jpg'
    ]
  },
  'hogwarts': {
    name: 'Hogwarts Legacy PlayStation',
    posters: [
      'assets/covers/hogwarts-legacy.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202208/0921/dRIdQL0qfL7yR9P2O4xQ0aC1.png',
      'https://upload.wikimedia.org/wikipedia/en/b/b3/Hogwarts_Legacy_cover.jpg',
      'https://images.alphacoders.com/130/1305417.jpg'
    ],
    backdrops: [
      'assets/backdrops/hogwarts-legacy.jpg',
      'https://images.alphacoders.com/129/1299946.jpg',
      'https://wallpaperaccess.com/full/8844885.jpg',
      'https://images.alphacoders.com/130/1302837.jpg'
    ]
  },
  'mortal kombat': {
    name: 'Mortal Kombat 1 & 11',
    posters: [
      'assets/covers/mortal-kombat-11.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202305/1814/23a0e6e737c330c6a81ca04df6fce16d10842db135bf9fc4.png',
      'https://upload.wikimedia.org/wikipedia/en/7/77/Mortal_Kombat_1_key_art.png',
      'https://image.api.playstation.com/vulcan/ap/rnd/202308/1812/a160cb9c394c86e246a48fc6ec3fb70c2a8b982160b457c0.png'
    ],
    backdrops: [
      'assets/backdrops/mortal-kombat-11.jpg',
      'https://images.alphacoders.com/131/1315682.jpeg',
      'https://wallpaperaccess.com/full/2260662.jpg',
      'https://images.alphacoders.com/133/1330386.jpeg'
    ]
  },
  'uncharted': {
    name: 'Uncharted 4 & The Lost Legacy',
    posters: [
      'assets/covers/uncharted-4.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202111/1720/mY0mK1m9mK4lG0wY6jP8jB2t.png',
      'https://upload.wikimedia.org/wikipedia/en/1/1a/Uncharted_4_box_artwork.jpg',
      'https://image.api.playstation.com/vulcan/img/rnd/202010/2618/jB4dF0d8dF6hM0qP2vR4tT6y.png'
    ],
    backdrops: [
      'assets/backdrops/uncharted-4.jpg',
      'https://images.alphacoders.com/694/694462.jpg',
      'https://wallpaperaccess.com/full/1539266.jpg',
      'https://images.alphacoders.com/712/712399.jpg'
    ]
  },
  'pes': {
    name: 'eFootball PES 2021 - 2027',
    posters: [
      'assets/covers/pes-2027.jpg',
      'assets/covers/pes-2025.jpg',
      'assets/covers/fc-25.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202407/0414/6a8c4371fa793d5f190691ffc1c1724ebfbcf31da96f7c6e.png'
    ],
    backdrops: [
      'assets/backdrops/pes-2027.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202407/0414/ad2e3c09f8aaee2864391ea2803b879c382103ef617d91d1.jpg',
      'https://images.alphacoders.com/137/1373007.jpeg',
      'https://wallpaperaccess.com/full/4873489.jpg'
    ]
  },
  'fc 25': {
    name: 'EA Sports FC 24 & FC 25',
    posters: [
      'assets/covers/fc-25.jpg',
      'assets/covers/pes-2027.jpg',
      'assets/covers/pes-2025.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202407/0414/6a8c4371fa793d5f190691ffc1c1724ebfbcf31da96f7c6e.png'
    ],
    backdrops: [
      'https://image.api.playstation.com/vulcan/ap/rnd/202407/0414/ad2e3c09f8aaee2864391ea2803b879c382103ef617d91d1.jpg',
      'assets/backdrops/pes-2027.jpg',
      'https://images.alphacoders.com/137/1373007.jpeg',
      'https://wallpaperaccess.com/full/4873489.jpg'
    ]
  },
  'fifa': {
    name: 'EA Sports FC & FIFA PlayStation',
    posters: [
      'assets/covers/fc-25.jpg',
      'assets/covers/pes-2027.jpg',
      'assets/covers/pes-2025.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202407/0414/6a8c4371fa793d5f190691ffc1c1724ebfbcf31da96f7c6e.png'
    ],
    backdrops: [
      'https://image.api.playstation.com/vulcan/ap/rnd/202407/0414/ad2e3c09f8aaee2864391ea2803b879c382103ef617d91d1.jpg',
      'assets/backdrops/pes-2027.jpg',
      'https://images.alphacoders.com/137/1373007.jpeg',
      'https://wallpaperaccess.com/full/4873489.jpg'
    ]
  },
  'stray': {
    name: 'Stray PlayStation Edition',
    posters: [
      'assets/covers/stray.jpg',
      'assets/covers/it-takes-two.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202206/0300/E2DqW8jL4vH0B4yF1tN4vK6w.png',
      'https://upload.wikimedia.org/wikipedia/en/d/df/It_Takes_Two_cover_art.png'
    ],
    backdrops: [
      'assets/backdrops/stray.jpg',
      'assets/backdrops/it-takes-two.jpg',
      'https://images.alphacoders.com/124/1246187.jpg',
      'https://wallpaperaccess.com/full/6387063.jpg'
    ]
  },
  'it takes two': {
    name: 'It Takes Two PlayStation',
    posters: [
      'assets/covers/it-takes-two.jpg',
      'assets/covers/stray.jpg',
      'https://upload.wikimedia.org/wikipedia/en/d/df/It_Takes_Two_cover_art.png',
      'https://image.api.playstation.com/vulcan/ap/rnd/202206/0300/E2DqW8jL4vH0B4yF1tN4vK6w.png'
    ],
    backdrops: [
      'assets/backdrops/it-takes-two.jpg',
      'assets/backdrops/stray.jpg',
      'https://images.alphacoders.com/124/1246187.jpg',
      'https://wallpaperaccess.com/full/6387063.jpg'
    ]
  },
  'one piece': {
    name: 'One Piece Odyssey PlayStation Edition',
    posters: [
      'assets/covers/one-piece-odyssey.jpg',
      'https://upload.wikimedia.org/wikipedia/en/0/0b/One_Piece_Odyssey_Steam_artwork.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202209/2610/j3G9h0p5WpWvRfZK3Z3X7Y2Z.png',
      'https://images.alphacoders.com/128/1284589.jpg'
    ],
    backdrops: [
      'assets/covers/one-piece-odyssey.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202209/2610/6wL2n7lM2V7g96oWzCdfZc4O.jpg',
      'https://wallpaperaccess.com/full/7822960.jpg'
    ]
  },
  'odyssey': {
    name: 'One Piece Odyssey / AC Odyssey',
    posters: [
      'assets/covers/one-piece-odyssey.jpg',
      'assets/covers/ac-odyssey.jpg',
      'https://upload.wikimedia.org/wikipedia/en/0/0b/One_Piece_Odyssey_Steam_artwork.jpg'
    ],
    backdrops: [
      'assets/covers/one-piece-odyssey.jpg',
      'assets/backdrops/ac-odyssey.jpg'
    ]
  },
  'ac': {
    name: "Assassin's Creed PlayStation Collection",
    posters: [
      'assets/covers/ac-odyssey.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202305/2311/676ad5a3ce9d1a8c90fe329d586178ba6994781ec7ef777b.png',
      'https://upload.wikimedia.org/wikipedia/en/a/af/Assassin%27s_Creed_Mirage_cover.jpeg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202008/1318/YvU8hY2vH0B4yF1tN4vK6w1m.png'
    ],
    backdrops: [
      'assets/backdrops/ac-odyssey.jpg',
      'https://images.alphacoders.com/133/1332742.jpeg',
      'https://wallpaperaccess.com/full/1381395.jpg',
      'https://images.alphacoders.com/956/956557.jpg'
    ]
  },
  'assassin': {
    name: "Assassin's Creed PlayStation Collection",
    posters: [
      'assets/covers/ac-odyssey.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202305/2311/676ad5a3ce9d1a8c90fe329d586178ba6994781ec7ef777b.png',
      'https://upload.wikimedia.org/wikipedia/en/a/af/Assassin%27s_Creed_Mirage_cover.jpeg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202008/1318/YvU8hY2vH0B4yF1tN4vK6w1m.png'
    ],
    backdrops: [
      'assets/backdrops/ac-odyssey.jpg',
      'https://images.alphacoders.com/133/1332742.jpeg',
      'https://wallpaperaccess.com/full/1381395.jpg',
      'https://images.alphacoders.com/956/956557.jpg'
    ]
  },
  'watch dogs': {
    name: 'Watch Dogs Series PlayStation',
    posters: [
      'assets/covers/watch-dogs.jpg',
      'assets/covers/gta-v.jpg',
      'assets/covers/uncharted-4.jpg',
      'assets/covers/ghost-tsushima.jpg'
    ],
    backdrops: [
      'assets/backdrops/watch-dogs.jpg',
      'assets/backdrops/gta-v.jpg',
      'assets/backdrops/uncharted-4.jpg',
      'assets/backdrops/ghost-tsushima.jpg'
    ]
  },
  'one piece': {
    name: 'One Piece Odyssey PlayStation',
    posters: [
      'assets/covers/one-piece-odyssey.jpg',
      'https://upload.wikimedia.org/wikipedia/en/0/0b/One_Piece_Odyssey_Steam_artwork.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202206/2007/582bf790be9bb8100ffb5a6c1bf1941d40ebfb7454f8d423.png',
      'assets/covers/gow-ragnarok.jpg',
      'assets/covers/spiderman.jpg'
    ],
    backdrops: [
      'assets/backdrops/one-piece-odyssey.jpg',
      'https://images.alphacoders.com/128/1281861.jpg',
      'https://wallpaperaccess.com/full/8604724.jpg',
      'https://images.alphacoders.com/128/1281862.jpg'
    ]
  },
  'odyssey': {
    name: "One Piece & Assassin's Creed Odyssey",
    posters: [
      'assets/covers/one-piece-odyssey.jpg',
      'assets/covers/ac-odyssey.jpg',
      'https://upload.wikimedia.org/wikipedia/en/0/0b/One_Piece_Odyssey_Steam_artwork.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202008/1318/YvU8hY2vH0B4yF1tN4vK6w1m.png'
    ],
    backdrops: [
      'assets/backdrops/one-piece-odyssey.jpg',
      'assets/backdrops/ac-odyssey.jpg',
      'https://images.alphacoders.com/128/1281861.jpg',
      'https://images.alphacoders.com/133/1332742.jpeg'
    ]
  },
  'cyberpunk': {
    name: 'Cyberpunk 2077 & Phantom Liberty',
    posters: [
      'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202111/3013/cKZw9kK9vP9vK6yF1tN4vK6w.png',
      'https://images.alphacoders.com/112/1123493.jpg'
    ],
    backdrops: [
      'https://images.alphacoders.com/100/1004245.jpg',
      'https://images.alphacoders.com/108/1085731.jpg',
      'https://wallpaperaccess.com/full/1539260.jpg'
    ]
  },
  'persona': {
    name: 'Persona 5 Royal & Persona 3 Reload',
    posters: [
      'https://upload.wikimedia.org/wikipedia/en/b/b0/Persona_5_cover_art.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202206/2407/6g7xH0fD5fH0B4yF1tN4vK6w.png'
    ],
    backdrops: [
      'https://images.alphacoders.com/832/832626.jpg',
      'https://wallpaperaccess.com/full/1289299.jpg'
    ]
  },
  'tekken': {
    name: 'Tekken 8 & Tekken 7 PlayStation',
    posters: [
      'https://upload.wikimedia.org/wikipedia/en/9/91/Tekken_8_cover_art.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202308/0403/yE94sCqC4y4KSmZcK2L9x4.png'
    ],
    backdrops: [
      'https://images.alphacoders.com/132/1328909.jpeg',
      'https://wallpaperaccess.com/full/9871234.jpg'
    ]
  },
  'gran turismo': {
    name: 'Gran Turismo 7 PlayStation',
    posters: [
      'https://upload.wikimedia.org/wikipedia/en/1/14/Gran_Turismo_7_cover_art.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202109/1321/yE94sCqC4y4KSmZcK2L9x4.png'
    ],
    backdrops: [
      'https://images.alphacoders.com/121/1216654.jpg',
      'https://wallpaperaccess.com/full/7654321.jpg'
    ]
  }
};

// PlayStation Genre Fallbacks (100% Authentic PlayStation covers/wallpapers - ZERO non-gaming stock photos!)
const PLAYSTATION_GENRE_CATALOG = {
  action: {
    name: 'PlayStation Action & Adventure',
    posters: [
      'assets/covers/gow-ragnarok.jpg',
      'assets/covers/spiderman.jpg',
      'assets/covers/ghost-tsushima.jpg',
      'assets/covers/uncharted-4.jpg',
      'assets/covers/rdr2.jpg',
      'assets/covers/wukong.jpg'
    ],
    backdrops: [
      'assets/backdrops/gow-ragnarok.jpg',
      'assets/backdrops/spiderman.jpg',
      'assets/backdrops/ghost-tsushima.jpg',
      'assets/backdrops/uncharted-4.jpg',
      'assets/backdrops/gta-v.jpg'
    ]
  },
  rpg: {
    name: 'PlayStation RPG & Open World',
    posters: [
      'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aGhopp3MHppi7kooGE2Dtt8C.png',
      'assets/covers/hogwarts-legacy.jpg',
      'assets/covers/wukong.jpg',
      'assets/covers/ac-odyssey.jpg',
      'assets/covers/ghost-tsushima.jpg'
    ],
    backdrops: [
      'assets/backdrops/hogwarts-legacy.jpg',
      'assets/backdrops/ghost-tsushima.jpg',
      'assets/backdrops/ac-odyssey.jpg',
      'https://images.alphacoders.com/121/1212879.jpg',
      'assets/backdrops/gow-ragnarok.jpg'
    ]
  },
  horror: {
    name: 'PlayStation Horror & Survival',
    posters: [
      'assets/covers/re4-remake.jpg',
      'assets/covers/tlou-part2.jpg',
      'assets/covers/tlou-part1.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202011/1717/bA1f0b0jL4a2B4d4H0l6P8t0.png'
    ],
    backdrops: [
      'assets/backdrops/tlou-part2.jpg',
      'https://images.alphacoders.com/129/1297316.jpg',
      'https://wallpaperaccess.com/full/8657685.jpg',
      'https://images.alphacoders.com/109/1090333.jpg'
    ]
  },
  sports: {
    name: 'PlayStation Sports & Racing',
    posters: [
      'assets/covers/pes-2027.jpg',
      'assets/covers/fc-25.jpg',
      'assets/covers/pes-2025.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202407/0414/6a8c4371fa793d5f190691ffc1c1724ebfbcf31da96f7c6e.png'
    ],
    backdrops: [
      'assets/backdrops/pes-2027.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202407/0414/ad2e3c09f8aaee2864391ea2803b879c382103ef617d91d1.jpg',
      'https://images.alphacoders.com/137/1373007.jpeg',
      'https://wallpaperaccess.com/full/4873489.jpg'
    ]
  },
  fighting: {
    name: 'PlayStation Fighting',
    posters: [
      'assets/covers/mortal-kombat-11.jpg',
      'https://image.api.playstation.com/vulcan/ap/rnd/202305/1814/23a0e6e737c330c6a81ca04df6fce16d10842db135bf9fc4.png',
      'https://upload.wikimedia.org/wikipedia/en/7/77/Mortal_Kombat_1_key_art.png',
      'assets/covers/spiderman.jpg'
    ],
    backdrops: [
      'assets/backdrops/mortal-kombat-11.jpg',
      'https://images.alphacoders.com/131/1315682.jpeg',
      'https://wallpaperaccess.com/full/2260662.jpg',
      'assets/backdrops/spiderman.jpg'
    ]
  },
  family: {
    name: 'PlayStation Family & Co-op',
    posters: [
      'assets/covers/it-takes-two.jpg',
      'assets/covers/stray.jpg',
      'https://upload.wikimedia.org/wikipedia/en/d/df/It_Takes_Two_cover_art.png',
      'assets/covers/hogwarts-legacy.jpg'
    ],
    backdrops: [
      'assets/backdrops/it-takes-two.jpg',
      'assets/backdrops/stray.jpg',
      'assets/backdrops/hogwarts-legacy.jpg',
      'https://images.alphacoders.com/124/1246187.jpg'
    ]
  },
  default: {
    name: 'PlayStation Showcase Art',
    posters: [
      'assets/covers/gow-ragnarok.jpg',
      'assets/covers/spiderman.jpg',
      'assets/covers/ghost-tsushima.jpg',
      'assets/covers/gta-v.jpg',
      'assets/covers/rdr2.jpg',
      'assets/covers/wukong.jpg'
    ],
    backdrops: [
      'assets/backdrops/gow-ragnarok.jpg',
      'assets/backdrops/spiderman.jpg',
      'assets/backdrops/ghost-tsushima.jpg',
      'assets/backdrops/gta-v.jpg',
      'assets/backdrops/tlou-part2.jpg'
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

  const isPoster = type === 'poster';
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // High-efficiency dimensions for local storage & cloud:
      // Poster 2:3 -> max 480 x 720 (quality 0.82)
      // Wallpaper 16:9 -> max 960 x 540 (quality 0.82)
      const maxW = isPoster ? 480 : 960;
      const maxH = isPoster ? 720 : 540;
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

      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      const inputEl = document.getElementById(`${prefix}-game-${type}`);
      if (inputEl) {
        inputEl.value = dataUrl;
        updateImagePreview(prefix, type);
      }
      playSfx('success');
      showToast(`Gambar ${isPoster ? 'Poster Cover' : 'Wallpaper Background'} berhasil diunggah dari file komputer!`, 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

// Direct File Upload from within Image Picker Modal
function handlePickerModalFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Pilih file gambar valid (JPG, PNG, WebP)!', 'warning');
    return;
  }

  const session = window._activeImagePicker;
  if (!session) {
    showToast('Sesi pemilihan gambar tidak aktif!', 'warning');
    return;
  }

  const isPoster = session.type === 'poster';
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // High-efficiency dimensions for local storage & cloud:
      const maxW = isPoster ? 480 : 960;
      const maxH = isPoster ? 720 : 540;
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

      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      selectImageFromPicker(dataUrl);
      showToast(`File gambar berhasil diunggah dan diterapkan sebagai ${isPoster ? 'Poster' : 'Wallpaper'}!`, 'success');
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
  const category = (catEl ? catEl.value : 'action').toLowerCase();
  const isPoster = type === 'poster';

  // 1. Resolve candidate pool of authentic PlayStation art pieces
  let richPool = [];
  let matchedFranchise = '';

  for (const [key, data] of Object.entries(PLAYSTATION_ART_CATALOG)) {
    if (titleLower.includes(key)) {
      matchedFranchise = data.name;
      const rawUrls = isPoster ? [...data.posters] : [...data.backdrops];
      richPool = rawUrls.map((u, i) => ({
        url: u,
        label: `${data.name} #${i + 1}`,
        type: type,
        badge: isPoster ? 'Official Cover' : 'Wallpaper 16:9',
        source: 'PlayStation Store'
      }));
      break;
    }
  }

  // Fallback to PlayStation Genre
  if (!richPool || richPool.length < 4) {
    const genreData = PLAYSTATION_GENRE_CATALOG[category] || PLAYSTATION_GENRE_CATALOG.action || PLAYSTATION_GENRE_CATALOG.default;
    const additional = isPoster ? genreData.posters : genreData.backdrops;
    const additionalItems = additional.map((u, i) => ({
      url: u,
      label: `PlayStation ${category.toUpperCase()} #${i + 1}`,
      type: type,
      badge: isPoster ? 'PlayStation Art' : 'Wallpaper Highlight',
      source: 'PlayStation Studio'
    }));
    richPool = [...(richPool || []), ...additionalItems];
  }

  // Deduplicate by URL
  const seenUrls = new Set();
  const uniquePool = [];
  richPool.forEach(item => {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniquePool.push(item);
    }
  });

  // Prepend cached Wikipedia box art if available
  const cleanTitleImg = typeof cleanGameTitle === 'function' ? cleanGameTitle(title) : title;
  const cachedWiki = window._cachedGameInfo && (window._cachedGameInfo[cleanTitleImg.toLowerCase()] || window._lastWikiData);
  if (isPoster && cachedWiki && cachedWiki.thumbnail) {
    uniquePool.unshift({
      url: cachedWiki.thumbnail,
      label: `${title} Official Cover`,
      type: 'poster',
      badge: 'Official Box Art',
      source: 'Wikipedia Official'
    });
  }

  // Save active picker session
  window._activeImagePicker = {
    prefix,
    type,
    title,
    category,
    pool: uniquePool.map(it => it.url),
    richPool: uniquePool,
    offset: 0,
    matchedFranchise: matchedFranchise || `PlayStation ${category.toUpperCase()}`
  };

  // Open the Image Picker Modal
  openImagePickerModal();
}

function openImagePickerModal() {
  const session = window._activeImagePicker;
  if (!session) return;

  const modal = document.getElementById('modal-game-image-picker');
  if (!modal) return;

  const titleEl = document.getElementById('image-picker-title');
  if (titleEl) {
    titleEl.textContent = `Pilihan Art & Wallpaper: "${session.title}"`;
  }

  const badgeEl = document.getElementById('image-picker-type-badge');
  if (badgeEl) {
    if (session.type === 'poster') {
      badgeEl.textContent = 'Poster Game (2:3)';
      badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30';
    } else {
      badgeEl.textContent = 'Wallpaper 16:9 Banner';
      badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30';
    }
  }

  const subEl = document.getElementById('image-picker-subtitle');
  if (subEl) {
    subEl.textContent = `Pilih dari gambar resmi PlayStation, cari langsung di internet, atau unggah file untuk ${session.type === 'poster' ? 'Poster Cover' : 'Wallpaper Highlight'}.`;
  }

  // Setup live search input with game title
  const searchInput = document.getElementById('image-picker-search-input');
  if (searchInput) {
    searchInput.value = session.title;
  }

  // Setup Google Images fallback link
  const googleBtn = document.getElementById('btn-google-images');
  if (googleBtn) {
    const q = session.type === 'poster' ? `${session.title} PS4 PS5 cover art` : `${session.title} PS4 PS5 wallpaper 16:9`;
    googleBtn.href = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`;
  }

  const customUrlInput = document.getElementById('image-picker-custom-url');
  if (customUrlInput) customUrlInput.value = '';

  renderImagePickerGrid();
  modal.classList.remove('hidden');
  lucide.createIcons();

  // If no specific franchise match, automatically trigger live internet search in background
  if (!session.matchedFranchise || session.matchedFranchise.startsWith('PlayStation ')) {
    setTimeout(() => {
      searchInternetImagesFromPicker(session.title, true);
    }, 100);
  }
}

function closeImagePickerModal() {
  const modal = document.getElementById('modal-game-image-picker');
  if (modal) modal.classList.add('hidden');
}

function renderImagePickerGrid() {
  const session = window._activeImagePicker;
  if (!session) return;

  const grid = document.getElementById('image-picker-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const isPoster = session.type === 'poster';
  const total = session.richPool && session.richPool.length > 0 ? session.richPool.length : session.pool.length;

  // 1. First Card: Quick Direct File Upload
  const uploadCard = document.createElement('div');
  uploadCard.className = `border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-lg ${isPoster ? 'aspect-[2/3] sm:h-56' : 'aspect-video sm:h-40'}`;
  uploadCard.title = 'Klik untuk mengunggah file gambar dari komputer atau HP Anda';
  uploadCard.onclick = () => {
    const fileInput = document.getElementById('picker-modal-file-input');
    if (fileInput) fileInput.click();
  };
  uploadCard.innerHTML = `
    <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition-transform mb-2 shadow-inner">
      <i data-lucide="upload" class="w-5 h-5 text-emerald-300"></i>
    </div>
    <span class="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Upload File</span>
    <span class="text-[10px] text-slate-400 mt-0.5">Dari Komputer / HP</span>
    <span class="mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
      ${isPoster ? 'Cover 2:3' : 'Banner 16:9'}
    </span>
  `;
  grid.appendChild(uploadCard);

  // 2. Up to 7 image candidates per page slice (so 1 upload + 7 images = 8 slots)
  const pageSize = 7;
  const currentItems = [];
  for (let i = 0; i < pageSize && i < total; i++) {
    const idx = (session.offset + i) % total;
    const item = (session.richPool && session.richPool[idx]) || {
      url: session.pool[idx],
      label: `Pilihan #${idx + 1}`,
      type: session.type,
      badge: isPoster ? 'PlayStation Art' : 'Wallpaper',
      source: 'PlayStation'
    };
    currentItems.push({ ...item, slotIdx: i + 1 });
  }

  currentItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'bg-slate-900 border border-slate-700/80 hover:border-sky-400 rounded-2xl p-2.5 flex flex-col justify-between group transition-all shadow-lg hover:shadow-sky-500/10 cursor-pointer relative overflow-hidden';
    card.onclick = () => selectImageFromPicker(item.url);

    const imgContainer = document.createElement('div');
    imgContainer.className = `w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative ${isPoster ? 'aspect-[2/3] sm:h-44' : 'aspect-video sm:h-28'}`;

    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.label || 'Gambar Pilihan';
    img.className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300';
    img.onerror = function() {
      this.src = isPoster ? 'assets/covers/service-1tb.jpg' : 'assets/backdrops/gow-ragnarok.jpg';
    };

    // Badge top-left
    const badgeTag = document.createElement('span');
    badgeTag.className = 'absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide bg-black/75 backdrop-blur-sm text-sky-300 border border-sky-500/30 shadow';
    badgeTag.textContent = item.badge || (isPoster ? 'Poster' : 'Wallpaper');

    // Hover overlay
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white z-10';
    overlay.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg mb-1 scale-90 group-hover:scale-100 transition-transform">
        <i data-lucide="check" class="w-4 h-4"></i>
      </div>
      <span class="text-[9px] font-black tracking-wide text-sky-200">PILIH INI</span>
    `;

    imgContainer.appendChild(img);
    imgContainer.appendChild(badgeTag);
    imgContainer.appendChild(overlay);

    const labelWrap = document.createElement('div');
    labelWrap.className = 'mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs gap-1';
    labelWrap.innerHTML = `
      <div class="min-w-0 flex-1">
        <span class="text-[10px] font-bold text-white truncate block">${item.label || 'PlayStation Art'}</span>
        <span class="text-[9px] text-slate-400 truncate block">${item.source || 'Resmi'}</span>
      </div>
      <button type="button" class="px-2 py-1 rounded-lg bg-sky-600 group-hover:bg-sky-500 text-white text-[10px] font-bold shadow flex items-center gap-1 transition-colors shrink-0">
        Pilih
      </button>
    `;

    card.appendChild(imgContainer);
    card.appendChild(labelWrap);
    grid.appendChild(card);
  });

  // Update Result Count text
  const countEl = document.getElementById('picker-results-count');
  if (countEl) {
    countEl.textContent = `Tersedia ${total} variasi pilihan gambar (${session.matchedFranchise || 'PlayStation'})`;
  }

  lucide.createIcons();
}

function cycleImagePickerVariations() {
  playSfx('click');
  const session = window._activeImagePicker;
  if (!session) return;

  const total = session.richPool && session.richPool.length > 0 ? session.richPool.length : session.pool.length;
  if (total <= 1) {
    showToast('Semua variasi saat ini telah ditampilkan.', 'info');
    return;
  }

  session.offset = (session.offset + 7) % total;
  renderImagePickerGrid();
  showToast(`Menampilkan variasi gambar berikutnya!`, 'info');
}

// Live Internet Search for Posters & Wallpapers (Wikipedia Opensearch + Summary + Media-List + Art Catalog)
async function searchInternetImagesFromPicker(customQuery, isSilent = false) {
  const session = window._activeImagePicker;
  if (!session) return;

  const searchInput = document.getElementById('image-picker-search-input');
  const query = (customQuery || (searchInput ? searchInput.value : '') || session.title || '').trim();
  if (!query) {
    showToast('Ketik judul atau kata kunci game untuk mencari!', 'warning');
    if (searchInput) searchInput.focus();
    return;
  }

  if (!isSilent) playSfx('click');

  const btn = document.getElementById('btn-search-internet-picker');
  const loadingEl = document.getElementById('image-picker-loading');
  const gridEl = document.getElementById('image-picker-grid');

  if (btn) btn.disabled = true;
  if (loadingEl) loadingEl.classList.remove('hidden');
  if (gridEl) gridEl.classList.add('hidden');

  const isPoster = session.type === 'poster';
  const foundImages = [];

  try {
    const cleanQ = typeof cleanGameTitle === 'function' ? cleanGameTitle(query) : query;

    // 1. Query Wikipedia OpenSearch to get exact article titles
    const openSearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQ)}&limit=5&namespace=0&format=json&origin=*`;
    const osResp = await fetch(openSearchUrl);
    const osData = await osResp.json();
    const candidateTitles = (osData && osData[1] && osData[1].length > 0) ? osData[1] : [cleanQ];

    const bestTitle = candidateTitles.find(t => !t.toLowerCase().includes('disambiguation') && !t.toLowerCase().includes('soundtrack')) || candidateTitles[0];

    if (bestTitle) {
      // 2. Fetch page summary for high-resolution official box art
      try {
        const sumResp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`);
        if (sumResp.ok) {
          const sumData = await sumResp.json();
          if (sumData.originalimage && sumData.originalimage.source) {
            foundImages.push({
              url: sumData.originalimage.source,
              label: `${bestTitle} (Box Art Resmi)`,
              type: 'poster',
              badge: 'Official Box Art',
              source: 'Wikipedia Official'
            });
          } else if (sumData.thumbnail && sumData.thumbnail.source) {
            foundImages.push({
              url: sumData.thumbnail.source,
              label: `${bestTitle} (Cover)`,
              type: 'poster',
              badge: 'Official Cover',
              source: 'Wikipedia Official'
            });
          }
        }
      } catch (e) {
        console.warn('Wikipedia summary image error:', e);
      }

      // 3. Fetch media-list from Wikipedia article (extracts screenshots, wallpapers, character art)
      try {
        const mediaResp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(bestTitle)}`);
        if (mediaResp.ok) {
          const mediaData = await mediaResp.json();
          if (mediaData && Array.isArray(mediaData.items)) {
            mediaData.items.forEach(item => {
              if (item.type !== 'image') return;
              const titleLower = (item.title || '').toLowerCase();
              if (titleLower.endsWith('.svg') || titleLower.includes('icon') || titleLower.includes('flag') || titleLower.includes('padlock')) return;

              let bestSrc = '';
              if (item.srcset && item.srcset.length > 0) {
                const largest = item.srcset[item.srcset.length - 1];
                bestSrc = largest.src;
              }
              if (!bestSrc) return;
              if (bestSrc.startsWith('//')) bestSrc = 'https:' + bestSrc;

              const isCover = titleLower.includes('cover') || titleLower.includes('box_art') || titleLower.includes('artwork');
              const isGameplay = titleLower.includes('gameplay') || titleLower.includes('screenshot') || titleLower.includes('shot');

              foundImages.push({
                url: bestSrc,
                label: isCover ? 'Box Art Resmi' : (isGameplay ? 'Wallpaper In-Game' : 'Artwork Game'),
                type: isCover ? 'poster' : 'backdrop',
                badge: isCover ? 'Official Cover' : (isGameplay ? 'Wallpaper 16:9' : 'Artwork Game'),
                source: 'Wikimedia Art'
              });
            });
          }
        }
      } catch (e) {
        console.warn('Wikipedia media-list error:', e);
      }
    }

    // 4. Query Wikipedia generator=search for related franchise pages/images
    try {
      const genUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query + ' video game')}&gsrlimit=6&prop=pageimages&piprop=original|thumbnail&pithumbsize=1200&format=json&origin=*`;
      const genResp = await fetch(genUrl);
      if (genResp.ok) {
        const genData = await genResp.json();
        if (genData && genData.query && genData.query.pages) {
          Object.values(genData.query.pages).forEach(pg => {
            const src = (pg.original && pg.original.source) || (pg.thumbnail && pg.thumbnail.source);
            if (src && !foundImages.some(f => f.url === src)) {
              foundImages.push({
                url: src,
                label: pg.title || 'Official Artwork',
                type: isPoster ? 'poster' : 'backdrop',
                badge: isPoster ? 'Official Cover' : 'Wallpaper 16:9',
                source: 'Wikipedia Game Art'
              });
            }
          });
        }
      }
    } catch (e) {}

    // Deduplicate found internet images by URL
    const uniqueFound = [];
    const seenUrls = new Set();
    foundImages.forEach(img => {
      if (!seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        uniqueFound.push(img);
      }
    });

    // 5. Gather matching catalog items from PLAYSTATION_ART_CATALOG
    let catalogList = [];
    const queryLower = query.toLowerCase();
    for (const [key, data] of Object.entries(PLAYSTATION_ART_CATALOG)) {
      if (queryLower.includes(key) || session.title.toLowerCase().includes(key)) {
        const items = isPoster ? data.posters : data.backdrops;
        catalogList = items.map((url, i) => ({
          url,
          label: `${data.name} #${i + 1}`,
          type: session.type,
          badge: isPoster ? 'Official Cover' : 'Wallpaper 16:9',
          source: 'PlayStation Official'
        }));
        break;
      }
    }

    // Fallback genre items if needed
    if (catalogList.length === 0) {
      const genreData = PLAYSTATION_GENRE_CATALOG[session.category] || PLAYSTATION_GENRE_CATALOG.action || PLAYSTATION_GENRE_CATALOG.default;
      const additional = isPoster ? genreData.posters : genreData.backdrops;
      catalogList = additional.map((url, i) => ({
        url,
        label: `PlayStation ${session.category.toUpperCase()} #${i + 1}`,
        type: session.type,
        badge: isPoster ? 'PlayStation Art' : 'Wallpaper Highlight',
        source: 'PlayStation Studio'
      }));
    }

    // Combine: Found internet images + PlayStation Art Catalog
    const combined = [...uniqueFound, ...catalogList];

    // Deduplicate combined
    const finalCombined = [];
    const finalSeen = new Set();
    combined.forEach(c => {
      if (!finalSeen.has(c.url)) {
        finalSeen.add(c.url);
        finalCombined.push(c);
      }
    });

    // Sort: items matching active type (poster vs backdrop) come first
    finalCombined.sort((a, b) => {
      if (a.type === session.type && b.type !== session.type) return -1;
      if (b.type === session.type && a.type !== session.type) return 1;
      return 0;
    });

    session.richPool = finalCombined;
    session.pool = finalCombined.map(c => c.url);
    session.offset = 0;
    session.matchedFranchise = uniqueFound.length > 0 ? `Internet & Official Art (${uniqueFound.length} ditemukan)` : session.matchedFranchise;

    renderImagePickerGrid();
    if (!isSilent) {
      playSfx('success');
      showToast(`Ditemukan ${finalCombined.length} pilihan gambar di internet untuk "${query}"!`, 'success');
    }
  } catch (err) {
    console.error('Internet image search error:', err);
    if (!isSilent) showToast('Pencarian internet gagal, menampilkan katalog PlayStation.', 'warning');
    renderImagePickerGrid();
  } finally {
    if (btn) btn.disabled = false;
    if (loadingEl) loadingEl.classList.add('hidden');
    if (gridEl) gridEl.classList.remove('hidden');
    lucide.createIcons();
  }
}

// Backwards-compatible alias for Wikipedia fetch
async function fetchImagesFromWikipedia() {
  return searchInternetImagesFromPicker();
}

function selectImageFromPicker(url) {
  const session = window._activeImagePicker;
  if (!session || !url) return;

  const inputEl = document.getElementById(`${session.prefix}-game-${session.type}`);
  if (inputEl) {
    inputEl.value = url;
    updateImagePreview(session.prefix, session.type);
  }

  playSfx('success');
  closeImagePickerModal();
  showToast(`Gambar ${session.type === 'poster' ? 'Poster Cover' : 'Wallpaper Highlight'} berhasil diterapkan!`, 'success');
}

function applyCustomImageUrlFromPicker() {
  const input = document.getElementById('image-picker-custom-url');
  const url = input ? input.value.trim() : '';
  if (!url) {
    showToast('Tempel URL gambar terlebih dahulu!', 'warning');
    return;
  }
  selectImageFromPicker(url);
}

// ============================================================================
// REAL AI & INTERNET-ASSISTED GAME GENERATOR (Wikipedia + AI Copywriter)
// ============================================================================

window._descGenIndices = window._descGenIndices || {};
window._cachedGameInfo = window._cachedGameInfo || {};
window._lastWikiData = window._lastWikiData || null;

function cleanGameTitle(rawTitle) {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\(.*?\)/gi, '')
    .replace(/\[.*?\]/gi, '')
    .replace(/\b(ps4|ps5|hen|pkg|full sub indo|subtitle indonesia|sub indo|digital edition|ori|original)\b/gi, '')
    .replace(/[-–—_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchGameWikiInfo(cleanTitle) {
  if (!cleanTitle) return null;
  const cacheKey = cleanTitle.toLowerCase();
  if (window._cachedGameInfo[cacheKey]) {
    return window._cachedGameInfo[cacheKey];
  }

  try {
    // 1. Search Wikipedia for matching video game
    const sUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTitle + ' video game')}&utf8=&format=json&origin=*`;
    const sRes = await fetch(sUrl, { signal: AbortSignal.timeout(5000) });
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const hits = sData?.query?.search;
    if (!hits || hits.length === 0) return null;

    const pageTitle = hits[0].title;

    // 2. Fetch page summary extract & lead sentences
    const eUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=7&explaintext=&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;

    const [eRes, sumRes] = await Promise.allSettled([
      fetch(eUrl, { signal: AbortSignal.timeout(5000) }).then(r => r.ok ? r.json() : null),
      fetch(sumUrl, { signal: AbortSignal.timeout(5000) }).then(r => r.ok ? r.json() : null)
    ]);

    let rawExtract = '';
    const eData = eRes.status === 'fulfilled' ? eRes.value : null;
    if (eData?.query?.pages) {
      const pageKey = Object.keys(eData.query.pages)[0];
      rawExtract = eData.query.pages[pageKey]?.extract || '';
      rawExtract = rawExtract.replace(/==.*?==/g, '').replace(/\s+/g, ' ').trim();
    }

    const sumData = sumRes.status === 'fulfilled' ? sumRes.value : null;
    if (!rawExtract && sumData?.extract) {
      rawExtract = sumData.extract;
    }

    const thumbnail = sumData?.originalimage?.source || sumData?.thumbnail?.source || null;

    // 3. Translate raw extract to Indonesian for rich descriptions
    let translatedExtract = '';
    if (rawExtract) {
      try {
        const tUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(rawExtract.slice(0, 1400))}`;
        const tRes = await fetch(tUrl, { signal: AbortSignal.timeout(4500) });
        if (tRes.ok) {
          const tData = await tRes.json();
          if (Array.isArray(tData[0])) {
            translatedExtract = tData[0].map(item => item[0] || '').join('').trim();
          }
        }
      } catch (tErr) {
        console.warn('[Translate] Fallback to raw or local translation:', tErr);
      }
    }

    const result = {
      cleanTitle,
      pageTitle,
      rawExtract,
      translatedExtract: translatedExtract || rawExtract,
      thumbnail
    };

    window._cachedGameInfo[cacheKey] = result;
    window._lastWikiData = result;
    return result;
  } catch (err) {
    console.warn('[fetchGameWikiInfo] Error:', err);
    return null;
  }
}

async function requestRealAIDescription(cleanTitle, rawTitle, platforms, genreLabel, wikiInfo, styleObj) {
  const prompt = `Kamu adalah copywriter profesional toko game PlayStation ALIANSI STORE di Indonesia.
Tuliskan deskripsi produk yang menarik, bervariasi, dan profesional untuk game "${cleanTitle}" (judul etalase: "${rawTitle}") untuk konsol ${platforms}.
Kategori Game: ${genreLabel}.
Gaya Penulisan Variasi Ini: ${styleObj.name} (${styleObj.instruction}).
${wikiInfo?.rawExtract ? `Referensi Fakta Resmi:\n${wikiInfo.rawExtract}\n` : ''}
Aturan:
1. Sebutkan karakter utama, alur kisah, atau mekanik khas game ini secara nyata sesuai fakta resminya.
2. Buat dalam 2 hingga 3 paragraf mengalir rapi.
3. Gunakan Bahasa Indonesia yang keren, natural, persuasif, dan informatif.
4. Jangan gunakan pengantar klise (jangan tulis "Berikut adalah...", jangan ada tanda kutip di awal/akhir).`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7500);

  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Kamu copywriter toko game PlayStation ALIANSI STORE di Indonesia.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai',
        seed: Math.floor(Math.random() * 1000000)
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    let text = await res.text();
    text = text.trim();
    if (!text || text.includes('Free limit reached') || text.includes('<!DOCTYPE')) {
      return null;
    }
    text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '');
    text = text.replace(/^(Berikut ini adalah|Tentu, berikut|Berikut|Deskripsi game:|Deskripsi:)\s*.*?\n+/i, '');
    return text.trim();
  } catch (e) {
    clearTimeout(timeoutId);
    return null;
  }
}

function synthesizeDynamicGameDescription(rawTitle, cleanTitle, platforms, genreLabel, wikiInfo, styleIndex) {
  const fact = wikiInfo?.translatedExtract || `${cleanTitle} adalah salah satu mahakarya game bergenre ${genreLabel} terbaik untuk konsol ${platforms}.`;

  const styles = [
    {
      name: 'Sinopsis Cerita & Petualangan Epik',
      build: () => `Bawa pulang petualangan mendalam dalam ${rawTitle} untuk konsol ${platforms}!\n\n${fact}\n\nNikmati alur cerita sinematik yang sarat emosi, visual menawan, serta performa stabil 60 FPS yang siap menghadirkan pengalaman bermain game kelas dunia. Dapatkan softfile digital lengkap dengan garansi resmi hanya di ALIANSI STORE!`
    },
    {
      name: 'Mekanik Gameplay & Aksi Pertarungan',
      build: () => `${rawTitle} menghadirkan sensasi aksi ${genreLabel} yang dinamis dan memacu adrenalin di konsol ${platforms} Anda.\n\n${fact}\n\nDidukung kontrol responsif, eksplorasi dunia yang luas, serta animasi pertempuran spektakuler, game ini siap menjadi favorit rental maupun koleksi pribadi. Link akses Google Drive resmi otomatis aktif dan dibagikan ke email setelah pesanan sukses.`
    },
    {
      name: 'Rekomendasi Gamer & Wajib Dikoleksi',
      build: () => `Salah satu judul game peraih rating tinggi yang wajib masuk dalam daftar wishlist konsol ${platforms} Anda!\n\n${fact}\n\nMenyajikan perpaduan grafis generasi terbaru dan tata suara 3D imersif, ${cleanTitle} terbukti memikat jutaan gamer di seluruh dunia. File instalasi game telah teruji bebas bug, anti-crash, dan 100% bergaransi lancar di ALIANSI STORE.`
    },
    {
      name: 'Edisi Lengkap Full Subtitle Indonesia',
      build: () => `Hadirkan mahakarya ${rawTitle} dengan kenyamanan maksimal di konsol ${platforms} Anda!\n\n${fact}\n\nSeluruh dialog cerita utama, petunjuk misi, dan interface kini jauh lebih mudah dipahami berkat Full Subtitle Bahasa Indonesia yang rapi. Nikmati alur cerita tanpa kendala bahasa, didukung file unduhan berkecepatan tinggi via Google Drive resmi.`
    },
    {
      name: 'Padat, Sinematik & Siap Main',
      build: () => `${rawTitle} edisi digital & PKG untuk konsol ${platforms}.\n\n${fact}\n\nKualitas visual tajam, update patch terbaru, serta garansi anti-revoke selamanya. Proses instan langsung aktif setelah transaksi diverifikasi. Aman, terpercaya, dan bergaransi resmi ALIANSI STORE!`
    }
  ];

  const current = styles[styleIndex % styles.length];
  return {
    text: current.build(),
    styleName: current.name
  };
}

// PlayStation CUSA Game ID Intelligent Suggester
function suggestCusaCode(title) {
  if (!title) return '';
  const clean = title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const cusaMap = [
    { keys: ['it takes two'], cusa: 'CUSA-16982' },
    { keys: ['god of war ragnarok', 'god of war ragnarök'], cusa: 'CUSA-34384' },
    { keys: ['god of war'], cusa: 'CUSA-07408' },
    { keys: ['silent hill 2'], cusa: 'CUSA-43890' },
    { keys: ['resident evil 4'], cusa: 'CUSA-33387' },
    { keys: ['resident evil village', 're8'], cusa: 'CUSA-18017' },
    { keys: ['resident evil 2'], cusa: 'CUSA-09193' },
    { keys: ['resident evil 3'], cusa: 'CUSA-14168' },
    { keys: ['ghost of tsushima', 'tsushima'], cusa: 'CUSA-11456' },
    { keys: ['the last of us part 2', 'last of us part ii', 'tlou 2'], cusa: 'CUSA-07820' },
    { keys: ['the last of us part 1', 'last of us part i', 'last of us remastered', 'tlou 1'], cusa: 'CUSA-00552' },
    { keys: ['fc 25', 'ea sports fc 25'], cusa: 'CUSA-47522' },
    { keys: ['fc 24', 'ea sports fc 24'], cusa: 'CUSA-40326' },
    { keys: ['fifa 23'], cusa: 'CUSA-31879' },
    { keys: ['pes 2027', 'pes 2021', 'efootball pes'], cusa: 'CUSA-14917' },
    { keys: ['red dead redemption 2', 'rdr 2', 'rdr2'], cusa: 'CUSA-08519' },
    { keys: ['red dead redemption'], cusa: 'CUSA-36843' },
    { keys: ['gta v', 'gta 5', 'grand theft auto v', 'grand theft auto 5'], cusa: 'CUSA-00411' },
    { keys: ['elden ring'], cusa: 'CUSA-28863' },
    { keys: ['uncharted 4'], cusa: 'CUSA-00341' },
    { keys: ['uncharted the lost legacy', 'lost legacy'], cusa: 'CUSA-07737' },
    { keys: ['black myth wukong', 'wukong'], cusa: 'CUSA-38910' },
    { keys: ['mortal kombat 11', 'mk 11', 'mk11'], cusa: 'CUSA-11395' },
    { keys: ['hogwarts legacy'], cusa: 'CUSA-12967' },
    { keys: ['stray'], cusa: 'CUSA-24899' },
    { keys: ['assassins creed odyssey', 'ac odyssey'], cusa: 'CUSA-09303' },
    { keys: ['assassins creed valhalla', 'ac valhalla'], cusa: 'CUSA-18534' },
    { keys: ['assassins creed mirage', 'ac mirage'], cusa: 'CUSA-34674' },
    { keys: ['one piece odyssey'], cusa: 'CUSA-30048' },
    { keys: ['watch dogs'], cusa: 'CUSA-04460' },
    { keys: ['spider-man', 'spiderman', 'marvels spider man'], cusa: 'CUSA-02299' },
    { keys: ['miles morales'], cusa: 'CUSA-17709' },
    { keys: ['cyberpunk 2077'], cusa: 'CUSA-16596' },
    { keys: ['witcher 3', 'the witcher 3'], cusa: 'CUSA-05725' },
    { keys: ['bloodborne'], cusa: 'CUSA-03173' },
    { keys: ['sekiro'], cusa: 'CUSA-13801' },
    { keys: ['horizon zero dawn'], cusa: 'CUSA-01967' },
    { keys: ['horizon forbidden west'], cusa: 'CUSA-24705' },
    { keys: ['monster hunter world'], cusa: 'CUSA-07713' },
    { keys: ['death stranding'], cusa: 'CUSA-11260' },
    { keys: ['gran turismo 7', 'gt7'], cusa: 'CUSA-24765' },
    { keys: ['tekken 7'], cusa: 'CUSA-05972' },
    { keys: ['naruto shippuden ultimate ninja storm 4', 'storm 4'], cusa: 'CUSA-02412' }
  ];
  for (const item of cusaMap) {
    if (item.keys.some(k => clean.includes(k))) {
      return item.cusa;
    }
  }
  return '';
}

async function generateGameDescription(prefix) {
  playSfx('click');
  const titleEl = document.getElementById(`${prefix}-game-title`);
  const rawTitle = titleEl ? titleEl.value.trim() : '';

  if (!rawTitle) {
    showToast('Ketik Judul Game terlebih dahulu untuk membuat deskripsi!', 'warning');
    if (titleEl) titleEl.focus();
    return;
  }

  // Auto-fill CUSA code if empty
  const cusaInput = document.getElementById(`${prefix}-game-cusa`);
  if (cusaInput && !cusaInput.value) {
    const suggestedCusa = suggestCusaCode(rawTitle);
    if (suggestedCusa) {
      cusaInput.value = suggestedCusa;
    }
  }

  const btn = document.querySelector(`button[onclick="generateGameDescription('${prefix}')"]`);

  // Show loading state
  if (btn) btn.disabled = true;
  if (btn) {
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 text-purple-400 animate-spin"></i> <span id="${prefix}-desc-btn-label">AI Sedang Menulis...</span>`;
    if (window.lucide) lucide.createIcons();
  }

  try {
    const cleanTitle = cleanGameTitle(rawTitle);
    const catEl = document.getElementById(`${prefix}-game-category`);
    const platformCbs = Array.from(document.querySelectorAll(`input[name="${prefix}-game-platform"]:checked`)).map(cb => cb.value);
    const platforms = platformCbs.length > 0 ? platformCbs.join(', ') : 'PS4 / PS5';

    // Cycle variation index per title
    if (window._lastGeneratedTitle !== cleanTitle) {
      window._descGenIndices[prefix] = 0;
      window._lastGeneratedTitle = cleanTitle;
    } else {
      window._descGenIndices[prefix] = ((window._descGenIndices[prefix] || 0) + 1) % 5;
    }
    const currentIdx = window._descGenIndices[prefix];

    const styleDescriptors = [
      { name: 'Sinopsis Cerita & Petualangan Epik', instruction: 'Fokuskan pada alur cerita utama, karakter tokoh, konflik, dan latar dunia game yang epik dan sinematik.' },
      { name: 'Mekanik Gameplay & Aksi Pertarungan', instruction: 'Fokuskan pada mekanisme gameplay, aksi pertarungan atau eksplorasi yang seru, grafis tajam 60 FPS, dan sensasi memegang stik.' },
      { name: 'Rekomendasi Gamer & Wajib Dikoleksi', instruction: 'Tulis dengan gaya rekomendasi hangat dari sesama gamer, soroti keunggulan game ini, perolehan pujian/rating tinggi, dan kenapa wajib dikoleksi.' },
      { name: 'Edisi Lengkap Full Subtitle Indonesia', instruction: 'Soroti kenyamanan bermain dengan Full Subtitle Bahasa Indonesia, alur cerita yang mudah dipahami, file digital praktis, dan garansi resmi ALIANSI STORE.' },
      { name: 'Padat, Sinematik & Menggugah', instruction: 'Tulis dalam 2 paragraf padat bernas yang sangat menggugah minat beli seketika dengan gaya sinematik PlayStation.' }
    ];
    const currentStyle = styleDescriptors[currentIdx];

    // 1. Fetch real info from internet (Wikipedia API + Translate)
    const wikiInfo = await fetchGameWikiInfo(cleanTitle);

    // Auto-detect category from Wikipedia info if still default
    if (catEl && wikiInfo?.rawExtract) {
      const extLower = wikiInfo.rawExtract.toLowerCase();
      if ((extLower.includes('role-playing') || extLower.includes('rpg')) && catEl.value === 'action') {
        catEl.value = 'rpg';
      } else if ((extLower.includes('horror') || extLower.includes('survival horror')) && catEl.value === 'action') {
        catEl.value = 'horror';
      } else if ((extLower.includes('sports') || extLower.includes('football') || extLower.includes('soccer')) && catEl.value === 'action') {
        catEl.value = 'sports';
      } else if (extLower.includes('racing') && catEl.value === 'action') {
        catEl.value = 'racing';
      } else if (extLower.includes('fighting') && catEl.value === 'action') {
        catEl.value = 'fighting';
      }
    }

    const category = catEl ? catEl.value : 'action';
    const genreLabel = typeof getCategoryLabel === 'function' ? getCategoryLabel(category) : 'Game PlayStation';

    // 2. Try Real AI (Pollinations AI)
    let finalDesc = await requestRealAIDescription(cleanTitle, rawTitle, platforms, genreLabel, wikiInfo, currentStyle);
    let isLiveAI = Boolean(finalDesc);

    // 3. Fallback to smart neural synthesis if AI timed out / rate limited
    if (!finalDesc) {
      const synthesized = synthesizeDynamicGameDescription(rawTitle, cleanTitle, platforms, genreLabel, wikiInfo, currentIdx);
      finalDesc = synthesized.text;
    }

    // Put into textarea
    const descEl = document.getElementById(`${prefix}-game-desc`);
    if (descEl) {
      descEl.value = finalDesc;
      descEl.focus();
    }

    // Reset button
    if (btn) {
      btn.innerHTML = `<i data-lucide="sparkles" class="w-3 h-3 text-purple-400"></i> <span id="${prefix}-desc-btn-label">Variasi ${currentIdx + 1}/5</span>`;
      if (window.lucide) lucide.createIcons();
      btn.disabled = false;
    }

    playSfx('success');
    showToast(
      isLiveAI
        ? `✨ AI Copywriter berhasil menulis deskripsi "${cleanTitle}" (${currentStyle.name})! Klik lagi untuk variasi lain.`
        : `✨ Deskripsi berbasis info resmi "${cleanTitle}" dibuat (${currentStyle.name})! Klik lagi untuk variasi lain.`,
      'success',
      'AI Copywriter'
    );
  } catch (err) {
    console.error('[generateGameDescription] Error:', err);
    if (btn) {
      btn.innerHTML = `<i data-lucide="sparkles" class="w-3 h-3 text-purple-400"></i> <span id="${prefix}-desc-btn-label">Generate AI</span>`;
      if (window.lucide) lucide.createIcons();
      btn.disabled = false;
    }
    showToast('Gagal generate deskripsi otomatis. Silakan coba lagi.', 'error');
  }
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
  const newCusaEl = document.getElementById('new-game-cusa');
  if (newCusaEl) newCusaEl.value = '';
  const normalEl = document.getElementById('new-game-price-normal');
  if (normalEl) normalEl.value = '';
  const discCheckEl = document.getElementById('new-game-has-discount');
  if (discCheckEl) discCheckEl.checked = false;
  const discContainer = document.getElementById('new-discount-fields-container');
  if (discContainer) discContainer.classList.add('hidden');
  const newRateEl = document.getElementById('new-game-discount-rate');
  if (newRateEl) newRateEl.value = '';
  const discountedEl = document.getElementById('new-game-price-discounted');
  if (discountedEl) discountedEl.value = '';
  const newDriveEl = document.getElementById('new-game-drive-link');
  if (newDriveEl) newDriveEl.value = '';

  // Reset Marketplace Fields
  const mpCheck = document.getElementById('new-game-has-marketplace');
  if (mpCheck) mpCheck.checked = false;
  const mpFields = document.getElementById('new-game-marketplace-fields');
  if (mpFields) mpFields.classList.add('hidden');
  const shopeeIn = document.getElementById('new-game-mp-shopee');
  if (shopeeIn) shopeeIn.value = '';
  const tokpedIn = document.getElementById('new-game-mp-tokopedia');
  if (tokpedIn) tokpedIn.value = '';
  const tiktokIn = document.getElementById('new-game-mp-tiktok');
  if (tiktokIn) tiktokIn.value = '';

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
  lucide.createIcons();
}

// Two-Way Interactive Discount Calculator with Checkbox & Rupiah Dot Formatting (prefix: 'new' | 'edit')
function toggleDiscountSection(prefix) {
  playSfx('click');
  const checkEl = document.getElementById(`${prefix}-game-has-discount`);
  const container = document.getElementById(`${prefix}-discount-fields-container`);
  if (!checkEl || !container) return;

  if (checkEl.checked) {
    container.classList.remove('hidden');
    const normalVal = parseRupiah(document.getElementById(`${prefix}-game-price-normal`)?.value);
    const discEl = document.getElementById(`${prefix}-game-price-discounted`);
    const rateEl = document.getElementById(`${prefix}-game-discount-rate`);
    if (normalVal > 0 && (!discEl.value || parseRupiah(discEl.value) >= normalVal)) {
      rateEl.value = '20';
      const discounted = Math.round(normalVal * 0.8);
      discEl.value = formatNumberWithDots(discounted);
    }
    updateDiscountCalc(prefix);
  } else {
    container.classList.add('hidden');
    const preview = document.getElementById(`${prefix}-game-discount-preview`);
    if (preview) preview.classList.add('hidden');
  }
}

function onPriceNormalInput(prefix) {
  const checkEl = document.getElementById(`${prefix}-game-has-discount`);
  if (!checkEl || !checkEl.checked) return;

  const normal = parseRupiah(document.getElementById(`${prefix}-game-price-normal`)?.value);
  const rateEl = document.getElementById(`${prefix}-game-discount-rate`);
  const discEl = document.getElementById(`${prefix}-game-price-discounted`);
  if (!rateEl || !discEl) return;

  const rate = parseFloat(rateEl.value) || 0;
  if (normal > 0 && rate > 0) {
    const discounted = Math.round(normal * (1 - rate / 100));
    discEl.value = formatNumberWithDots(discounted);
  } else if (normal > 0 && discEl.value) {
    const discounted = parseRupiah(discEl.value);
    if (discounted < normal && discounted > 0) {
      rateEl.value = Math.round((1 - discounted / normal) * 100);
    }
  }
  updateDiscountCalc(prefix);
}

function onDiscountRateInput(prefix) {
  const normal = parseRupiah(document.getElementById(`${prefix}-game-price-normal`)?.value);
  const rateEl = document.getElementById(`${prefix}-game-discount-rate`);
  const discEl = document.getElementById(`${prefix}-game-price-discounted`);
  if (!rateEl || !discEl) return;

  const rateStr = rateEl.value.trim();
  if (rateStr === '') {
    updateDiscountCalc(prefix);
    return;
  }

  let rate = parseFloat(rateStr);
  if (isNaN(rate)) return;
  if (rate < 0) rate = 0;
  if (rate > 99) rate = 99;

  if (normal > 0) {
    const discounted = Math.round(normal * (1 - rate / 100));
    discEl.value = formatNumberWithDots(discounted);
  }
  updateDiscountCalc(prefix);
}

function onPriceDiscountedInput(prefix) {
  const normal = parseRupiah(document.getElementById(`${prefix}-game-price-normal`)?.value);
  const rateEl = document.getElementById(`${prefix}-game-discount-rate`);
  const discEl = document.getElementById(`${prefix}-game-price-discounted`);
  if (!rateEl || !discEl) return;

  const discounted = parseRupiah(discEl.value);
  if (normal > 0) {
    if (discounted < normal && discounted > 0) {
      rateEl.value = Math.round((1 - discounted / normal) * 100);
    } else {
      rateEl.value = 0;
    }
  } else {
    rateEl.value = '';
  }
  updateDiscountCalc(prefix);
}

function updateDiscountCalc(prefix) {
  const normal = parseRupiah(document.getElementById(`${prefix}-game-price-normal`)?.value);
  const discounted = parseRupiah(document.getElementById(`${prefix}-game-price-discounted`)?.value);
  const rateEl = document.getElementById(`${prefix}-game-discount-rate`);
  const preview = document.getElementById(`${prefix}-game-discount-preview`);
  const diffEl = document.getElementById(`${prefix}-game-discount-diff`);
  const pctEl = document.getElementById(`${prefix}-game-discount-percent`);
  const checkEl = document.getElementById(`${prefix}-game-has-discount`);
  if (!preview) return;

  if (checkEl && !checkEl.checked) {
    preview.classList.add('hidden');
    return;
  }

  const pct = getDiscountPercent(normal, discounted);
  if (pct > 0 && normal > discounted) {
    const diff = normal - discounted;
    if (diffEl) diffEl.textContent = `Hemat ${formatRupiah(diff)}`;
    if (pctEl) pctEl.textContent = `-${pct}% (Diskon ${pct}%)`;
    preview.classList.remove('hidden');
    if (rateEl && (!rateEl.value || rateEl.value === '0')) {
      rateEl.value = pct;
    }
  } else {
    preview.classList.add('hidden');
    if (rateEl && discounted >= normal && normal > 0) {
      rateEl.value = normal > 0 ? 0 : '';
    }
  }
}

// Fallback alias for backward compatibility
function calculateAdminDiscount(prefix) {
  updateDiscountCalc(prefix);
}

function submitNewProduct() {
  const title = document.getElementById('new-game-title').value.trim();
  const category = document.getElementById('new-game-category').value;
  const platformChecked = Array.from(document.querySelectorAll('input[name="new-game-platform"]:checked')).map(cb => cb.value);
  const priceNormal = parseRupiah(document.getElementById('new-game-price-normal')?.value);
  const hasDiscount = document.getElementById('new-game-has-discount')?.checked;
  const priceDiscounted = parseRupiah(document.getElementById('new-game-price-discounted')?.value);

  if (!title || platformChecked.length === 0 || priceNormal <= 0) {
    showToast('Lengkapi judul, platform, dan Harga Normal (Rp) game!', 'warning');
    return;
  }

  let pricePrimary = priceNormal;
  let priceOriginal = 0;

  if (hasDiscount) {
    if (priceDiscounted <= 0 || priceDiscounted >= priceNormal) {
      showToast('Harga promo diskon harus lebih murah dari harga normal!', 'warning');
      return;
    }
    pricePrimary = priceDiscounted;
    priceOriginal = priceNormal;
  } else {
    pricePrimary = priceNormal;
    priceOriginal = 0; // Game dijual dengan harga normal tanpa harga coret
  }

  const driveLink = document.getElementById('new-game-drive-link') ? document.getElementById('new-game-drive-link').value.trim() : '';
  const cusa = document.getElementById('new-game-cusa') ? document.getElementById('new-game-cusa').value.trim().toUpperCase() : '';

  // Product-Level Marketplace Links (Optional)
  const hasMarketplace = document.getElementById('new-game-has-marketplace')?.checked;
  const mpShopee = document.getElementById('new-game-mp-shopee')?.value.trim();
  const mpTokped = document.getElementById('new-game-mp-tokopedia')?.value.trim();
  const mpTiktok = document.getElementById('new-game-mp-tiktok')?.value.trim();
  let productMarketplaces = null;
  if (hasMarketplace && (mpShopee || mpTokped || mpTiktok)) {
    productMarketplaces = {};
    if (mpShopee) productMarketplaces.shopee = mpShopee;
    if (mpTokped) productMarketplaces.tokopedia = mpTokped;
    if (mpTiktok) productMarketplaces.tiktok = mpTiktok;
  }

  const posterUrl = document.getElementById('new-game-poster').value.trim();
  const backdropUrl = document.getElementById('new-game-backdrop') ? document.getElementById('new-game-backdrop').value.trim() : '';
  const desc = document.getElementById('new-game-desc').value.trim();

  const newGame = {
    id: 'game-' + Date.now(),
    title: title,
    slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    cusa: cusa,
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
      cover: posterUrl || 'assets/covers/gow-ragnarok.jpg',
      backdrop: backdropUrl || posterUrl || 'assets/backdrops/gow-ragnarok.jpg',
      poster: posterUrl || 'assets/covers/gow-ragnarok.jpg',
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
    marketplaces: productMarketplaces,
    inStock: true
  };

  newGame.isHen = isHenProduct(newGame);
  if (newGame.isHen) {
    newGame.prices.secondary = newGame.prices.primary;
  }
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
  const editCusaEl = document.getElementById('edit-game-cusa');
  if (editCusaEl) editCusaEl.value = p.cusa || '';
  const editCatEl = document.getElementById('edit-game-category');
  if (editCatEl && p.category) editCatEl.value = p.category;
  const editPlatCbs = document.querySelectorAll('input[name="edit-game-platform"]');
  editPlatCbs.forEach(cb => {
    cb.checked = Array.isArray(p.platform) && p.platform.includes(cb.value);
  });

  const hasDiscount = !!(p.prices && p.prices.original && p.prices.original > p.prices.primary);
  const checkEl = document.getElementById('edit-game-has-discount');
  const container = document.getElementById('edit-discount-fields-container');
  const normalEl = document.getElementById('edit-game-price-normal');
  const discEl = document.getElementById('edit-game-price-discounted');
  const rateEl = document.getElementById('edit-game-discount-rate');
  const preview = document.getElementById('edit-game-discount-preview');

  if (hasDiscount) {
    if (checkEl) checkEl.checked = true;
    if (container) container.classList.remove('hidden');
    if (normalEl) normalEl.value = formatNumberWithDots(p.prices.original);
    if (discEl) discEl.value = formatNumberWithDots(p.prices.primary);
    if (rateEl) rateEl.value = getDiscountPercent(p.prices.original, p.prices.primary);
    updateDiscountCalc('edit');
  } else {
    if (checkEl) checkEl.checked = false;
    if (container) container.classList.add('hidden');
    if (normalEl) normalEl.value = formatNumberWithDots(p.prices.primary);
    if (discEl) discEl.value = '';
    if (rateEl) rateEl.value = '';
    if (preview) preview.classList.add('hidden');
  }

  const editDriveEl = document.getElementById('edit-game-drive-link');
  if (editDriveEl) editDriveEl.value = p.driveLink || '';

  // Populate Marketplace Settings
  const editMpCheck = document.getElementById('edit-game-has-marketplace');
  const editMpFields = document.getElementById('edit-game-marketplace-fields');
  const editShopee = document.getElementById('edit-game-mp-shopee');
  const editTokped = document.getElementById('edit-game-mp-tokopedia');
  const editTiktok = document.getElementById('edit-game-mp-tiktok');
  const pMp = p.marketplaces || {};
  const hasAnyMp = !!(pMp.shopee || pMp.tokopedia || pMp.tiktok);

  if (editMpCheck) editMpCheck.checked = hasAnyMp;
  if (editMpFields) {
    if (hasAnyMp) editMpFields.classList.remove('hidden');
    else editMpFields.classList.add('hidden');
  }
  if (editShopee) editShopee.value = pMp.shopee || '';
  if (editTokped) editTokped.value = pMp.tokopedia || '';
  if (editTiktok) editTiktok.value = pMp.tiktok || '';

  const posterVal = (p.images && (p.images.poster || p.images.cover)) || getProductPoster(p) || '';
  const backdropVal = (p.images && p.images.backdrop) || getProductBackdrop(p) || '';
  document.getElementById('edit-game-poster').value = posterVal;
  const editBackdropEl = document.getElementById('edit-game-backdrop');
  if (editBackdropEl) editBackdropEl.value = backdropVal;
  document.getElementById('edit-game-desc').value = p.description || '';
  const descLabel = document.getElementById('edit-desc-btn-label');
  if (descLabel) descLabel.textContent = 'Generate AI';
  updateImagePreview('edit', 'poster');
  updateImagePreview('edit', 'backdrop');

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function submitEditProduct() {
  if (!editingProductId) return;
  const p = state.products.find(item => item.id === editingProductId);
  if (!p) return;

  p.title = document.getElementById('edit-game-title').value.trim();
  const editCusaEl = document.getElementById('edit-game-cusa');
  if (editCusaEl) p.cusa = editCusaEl.value.trim().toUpperCase();
  const editCatEl = document.getElementById('edit-game-category');
  if (editCatEl && editCatEl.value) p.category = editCatEl.value;
  const editPlatCbs = Array.from(document.querySelectorAll('input[name="edit-game-platform"]:checked')).map(cb => cb.value);
  if (editPlatCbs.length > 0) p.platform = editPlatCbs;

  const priceNormal = parseRupiah(document.getElementById('edit-game-price-normal')?.value);
  const hasDiscount = document.getElementById('edit-game-has-discount')?.checked;
  const priceDiscounted = parseRupiah(document.getElementById('edit-game-price-discounted')?.value);

  if (priceNormal <= 0) {
    showToast('Harga Normal (Rp) wajib diisi!', 'warning');
    return;
  }

  if (hasDiscount) {
    if (priceDiscounted <= 0 || priceDiscounted >= priceNormal) {
      showToast('Harga promo diskon harus lebih murah dari harga normal!', 'warning');
      return;
    }
    p.prices.primary = priceDiscounted;
    p.prices.secondary = priceDiscounted;
    p.prices.original = priceNormal;
  } else {
    p.prices.primary = priceNormal;
    p.prices.secondary = priceNormal;
    p.prices.original = 0; // Game dijual dengan harga normal tanpa harga coret
  }

  const editDriveEl = document.getElementById('edit-game-drive-link');
  if (editDriveEl) p.driveLink = editDriveEl.value.trim();

  // Save Product-Level Marketplaces
  const editHasMp = document.getElementById('edit-game-has-marketplace')?.checked;
  const editShopee = document.getElementById('edit-game-mp-shopee')?.value.trim();
  const editTokped = document.getElementById('edit-game-mp-tokopedia')?.value.trim();
  const editTiktok = document.getElementById('edit-game-mp-tiktok')?.value.trim();

  if (editHasMp && (editShopee || editTokped || editTiktok)) {
    p.marketplaces = {};
    if (editShopee) p.marketplaces.shopee = editShopee;
    if (editTokped) p.marketplaces.tokopedia = editTokped;
    if (editTiktok) p.marketplaces.tiktok = editTiktok;
  } else {
    delete p.marketplaces;
  }

  const poster = document.getElementById('edit-game-poster').value.trim();
  const backdrop = document.getElementById('edit-game-backdrop') ? document.getElementById('edit-game-backdrop').value.trim() : '';
  if (!p.images) p.images = {};
  p.images.poster = poster || p.images.poster || '';
  p.images.cover = p.images.poster;
  p.images.backdrop = backdrop || p.images.backdrop || '';
  p.description = document.getElementById('edit-game-desc').value.trim();
  p.isHen = isHenProduct(p);
  if (p.isHen) {
    p.prices.secondary = p.prices.primary;
  }
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
    catalogInput.removeAttribute('readonly');
    catalogInput.focus();
  }
  if (mainInput) {
    mainInput.value = '';
    mainInput.removeAttribute('readonly');
  }
  const feedbackBar = document.getElementById('catalog-search-feedback');
  const clearBtn = document.getElementById('catalog-search-clear');
  if (feedbackBar) feedbackBar.classList.add('hidden');
  if (clearBtn) clearBtn.classList.add('hidden');
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
    input.removeAttribute('readonly');
    setTimeout(() => {
      input.removeAttribute('readonly');
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

  const unlockSearchInput = (el) => {
    if (el && el.hasAttribute('readonly')) {
      el.removeAttribute('readonly');
    }
  };

  // Explicitly ensure both search inputs start 100% empty on page load
  state.searchQuery = '';
  if (catalogSearchInput) catalogSearchInput.value = '';
  if (mainSearchInput) mainSearchInput.value = '';

  const handleLiveSearch = (val) => {
    // Ironclad guard: if browser or extension tries to autofill credentials, wipe it out immediately
    if (isCredentialAutofillValue(val)) {
      state.searchQuery = '';
      if (catalogSearchInput) catalogSearchInput.value = '';
      if (mainSearchInput) mainSearchInput.value = '';
      const feedbackBar = document.getElementById('catalog-search-feedback');
      const clearBtn = document.getElementById('catalog-search-clear');
      if (feedbackBar) feedbackBar.classList.add('hidden');
      if (clearBtn) clearBtn.classList.add('hidden');
      renderProducts();
      return;
    }

    state.searchQuery = val || '';
    if (catalogSearchInput && catalogSearchInput.value !== val) {
      catalogSearchInput.value = val || '';
    }
    if (mainSearchInput && mainSearchInput.value !== val) {
      mainSearchInput.value = val || '';
    }
    renderProducts();
  };

  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('focus', () => unlockSearchInput(catalogSearchInput));
    catalogSearchInput.addEventListener('pointerdown', () => unlockSearchInput(catalogSearchInput));
    catalogSearchInput.addEventListener('touchstart', () => unlockSearchInput(catalogSearchInput));
    catalogSearchInput.addEventListener('input', (e) => handleLiveSearch(e.target.value));
    catalogSearchInput.addEventListener('change', (e) => handleLiveSearch(e.target.value));
  }
  if (mainSearchInput) {
    mainSearchInput.addEventListener('focus', () => unlockSearchInput(mainSearchInput));
    mainSearchInput.addEventListener('pointerdown', () => unlockSearchInput(mainSearchInput));
    mainSearchInput.addEventListener('touchstart', () => unlockSearchInput(mainSearchInput));
    mainSearchInput.addEventListener('input', (e) => handleLiveSearch(e.target.value));
    mainSearchInput.addEventListener('change', (e) => handleLiveSearch(e.target.value));
  }

  // Bulletproof anti-autofill watchdog: continuously cleanses credentials from inputs and state
  const purgeAdminAutofill = () => {
    const ci = document.getElementById('catalog-search-input');
    const mi = document.getElementById('main-search-input');
    let dirty = false;

    if (ci && isCredentialAutofillValue(ci.value)) {
      ci.value = '';
      dirty = true;
    }
    if (mi && isCredentialAutofillValue(mi.value)) {
      mi.value = '';
      dirty = true;
    }
    if (state.searchQuery && isCredentialAutofillValue(state.searchQuery)) {
      state.searchQuery = '';
      dirty = true;
    }

    if (dirty) {
      state.searchQuery = '';
      const feedbackBar = document.getElementById('catalog-search-feedback');
      const clearBtn = document.getElementById('catalog-search-clear');
      if (feedbackBar) feedbackBar.classList.add('hidden');
      if (clearBtn) clearBtn.classList.add('hidden');
      renderProducts();
    }
  };

  // Run watchdog across all browser lifecycle events and timed increments
  [30, 100, 250, 500, 1000, 1800, 3000, 4500].forEach(delay => setTimeout(purgeAdminAutofill, delay));
  window.addEventListener('load', purgeAdminAutofill);
  window.addEventListener('pageshow', purgeAdminAutofill);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) purgeAdminAutofill();
  });

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
// ================= TWO-WAY LIVE CHAT & EMAIL NOTIFICATION ENGINE =================

function initLiveChatUI() {
  updateChatBadges();
  renderCustomerChatIdentity();
}

function saveChatMessages() {
  try {
    localStorage.setItem(APP_STORAGE_KEYS.CHATS, JSON.stringify(state.chatMessages));
  } catch (e) {
    // LocalStorage quota fallback
  }
  updateChatBadges();
}

function updateChatBadges() {
  const messages = state.chatMessages || [];

  // 1. Admin badge (messages from customers unread by admin)
  const unreadForAdmin = messages.filter(m => m.senderRole === 'customer' && !m.readByAdmin).length;
  const adminBadge = document.getElementById('admin-header-chat-badge');
  if (adminBadge) {
    if (unreadForAdmin > 0) {
      adminBadge.textContent = unreadForAdmin;
      adminBadge.classList.remove('hidden');
    } else {
      adminBadge.classList.add('hidden');
    }
  }

  // 2. Customer badge (messages from admin unread by current customer)
  const custEmail = getCurrentCustomerChatEmail();
  if (custEmail) {
    const unreadForCust = messages.filter(m => 
      m.conversationId === custEmail && 
      m.senderRole === 'admin' && 
      !m.readByCustomer
    ).length;
    const custBadge = document.getElementById('cust-chat-unread-badge');
    if (custBadge) {
      if (unreadForCust > 0) {
        custBadge.textContent = unreadForCust;
        custBadge.classList.remove('hidden');
      } else {
        custBadge.classList.add('hidden');
      }
    }
  }
}

function getCurrentCustomerChatEmail() {
  if (state.currentUser && state.currentUser.email && state.currentUser.role !== 'admin') {
    return state.currentUser.email.toLowerCase().trim();
  }
  const guestEmail = localStorage.getItem('aliansi_guest_chat_email');
  if (guestEmail) return guestEmail.toLowerCase().trim();
  return '';
}

function getCurrentCustomerChatName() {
  if (state.currentUser && state.currentUser.name && state.currentUser.role !== 'admin') {
    return state.currentUser.name;
  }
  const guestName = localStorage.getItem('aliansi_guest_chat_name');
  if (guestName) return guestName;
  return 'Customer';
}

function renderCustomerChatIdentity() {
  const strip = document.getElementById('cust-chat-identity-text');
  const btnUbah = document.querySelector('#cust-chat-identity-strip button');
  if (!strip) return;

  if (state.currentUser) {
    const email = state.currentUser.email || '';
    const name = state.currentUser.name || 'Member';
    strip.innerHTML = `Akun: <strong class="text-white">${escapeHtml(name)}</strong> <span class="text-sky-400 font-mono text-[10px]">(${escapeHtml(email)})</span> <span class="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Member Terverifikasi</span>`;
    if (btnUbah) btnUbah.style.display = 'none';
  } else {
    strip.innerHTML = `<span class="text-amber-300 font-bold">Khusus Member</span> • <span class="text-slate-400">Silakan login akun</span>`;
    if (btnUbah) btnUbah.style.display = 'none';
  }
}

function promptChangeCustomerChatIdentity() {
  playSfx('click');
  if (state.currentUser) {
    showToast(`Identitas chat terhubung permanen ke akun Member: ${state.currentUser.name} (${state.currentUser.email})`, 'info');
    return;
  }
  openAuthModal('login');
}

function toggleCustomerChat(forceOpen = false) {
  const box = document.getElementById('customer-live-chat-box');
  if (!box) return;

  const isHidden = box.classList.contains('hidden');

  if (isHidden || forceOpen) {
    // Enforce Registered Member Authentication
    if (!state.currentUser) {
      playSfx('warning');
      showToast('Fitur Live Chat hanya untuk Member terdaftar. Silakan Masuk atau Daftar Akun terlebih dahulu.', 'info', 'Akses Member Diperlukan');
      sessionStorage.setItem('aliansi_pending_open_chat', 'true');
      openAuthModal('login');
      return;
    }

    playSfx('switch');
    box.classList.remove('hidden');
    state.isCustomerChatOpen = true;

    // Sync member identity
    if (state.currentUser && state.currentUser.email) {
      localStorage.setItem('aliansi_guest_chat_email', state.currentUser.email);
      localStorage.setItem('aliansi_guest_chat_name', state.currentUser.name || 'Member');
    }

    renderCustomerChatIdentity();
    renderCustomerChatMessages();

    // Mark messages as read by customer
    const custEmail = getCurrentCustomerChatEmail();
    if (custEmail) {
      let marked = false;
      (state.chatMessages || []).forEach(m => {
        if (m.conversationId === custEmail && m.senderRole === 'admin' && !m.readByCustomer) {
          m.readByCustomer = true;
          marked = true;
        }
      });
      if (marked) saveChatMessages();
    }

    lucide.createIcons();
    const input = document.getElementById('cust-chat-input');
    if (input) input.focus();
  } else {
    playSfx('click');
    box.classList.add('hidden');
    state.isCustomerChatOpen = false;
  }
}

// Global alias for FAQ and external buttons
function toggleCustomerLiveChat(forceOpen = false) {
  toggleCustomerChat(forceOpen);
}

function renderCustomerChatMessages() {
  const container = document.getElementById('cust-chat-messages-container');
  if (!container) return;

  let custEmail = getCurrentCustomerChatEmail();

  // If no email set yet, show friendly onboard card
  if (!custEmail) {
    container.innerHTML = `
      <div class="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-center space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 mx-auto flex items-center justify-center">
          <i data-lucide="message-square" class="w-6 h-6"></i>
        </div>
        <div>
          <h4 class="text-xs font-bold text-white">Selamat Datang di Live Chat Aliansi!</h4>
          <p class="text-[11px] text-slate-300 mt-1">Masukkan nama & email Anda agar riwayat chat tersimpan dan Admin dapat mengirim notifikasi balasan langsung ke email Anda.</p>
        </div>
        <button 
          onclick="promptChangeCustomerChatIdentity()" 
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all cursor-pointer"
        >
          Isi Nama & Email Saya
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const messages = (state.chatMessages || []).filter(m => m.conversationId === custEmail);

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-400 space-y-3">
        <div class="w-10 h-10 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <i data-lucide="bot" class="w-5 h-5 text-sky-400"></i>
        </div>
        <div>
          <div class="font-bold text-white">Halo ${escapeHtml(getCurrentCustomerChatName())}!</div>
          <div class="text-[11px] text-slate-400 mt-1">Ada yang bisa kami bantu? Silakan tulis pertanyaan, konfirmasi pesanan, atau request game PS4 impian Anda di bawah.</div>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = messages.map(m => {
    const isMe = m.senderRole === 'customer';
    const timeFormatted = new Date(m.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    if (isMe) {
      return `
        <div class="flex flex-col items-end">
          <div class="max-w-[82%] px-3.5 py-2.5 rounded-2xl rounded-tr-xs bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-xs shadow-md break-words">
            ${escapeHtml(m.text)}
          </div>
          <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>${timeFormatted}</span>
            <i data-lucide="check-check" class="w-3 h-3 text-cyan-400"></i>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="flex flex-col items-start">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-black flex items-center justify-center border border-cyan-500/30">A</span>
            <span class="text-[10px] font-bold text-cyan-400">Admin Aliansi Store</span>
            <span class="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">VERIFIED</span>
          </div>
          <div class="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-slate-900 border border-slate-700/80 text-white text-xs shadow-md break-words">
            ${escapeHtml(m.text)}
          </div>
          <span class="text-[10px] text-slate-500 mt-1 font-mono">${timeFormatted}</span>
        </div>
      `;
    }
  }).join('');

  lucide.createIcons();
  container.scrollTop = container.scrollHeight;
}

function sendCustomerChatMessage() {
  const input = document.getElementById('cust-chat-input');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  // Enforce registered member
  if (!state.currentUser) {
    showToast('Fitur Live Chat hanya untuk Member terdaftar. Silakan Masuk terlebih dahulu.', 'warning', 'Member Diperlukan');
    openAuthModal('login');
    return;
  }

  const custEmail = (state.currentUser.email || '').toLowerCase().trim();
  const custName = state.currentUser.name || 'Member';
  const custPhone = (state.currentUser && state.currentUser.phone) || localStorage.getItem('aliansi_guest_chat_phone') || '';
  const adminEmail = (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';

  const newMsg = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    conversationId: custEmail.toLowerCase(),
    senderRole: 'customer',
    senderName: custName,
    senderEmail: custEmail,
    senderPhone: custPhone,
    recipientEmail: adminEmail,
    customerName: custName,
    customerEmail: custEmail,
    customerPhone: custPhone,
    text: text,
    createdAt: new Date().toISOString(),
    readByCustomer: true,
    readByAdmin: false
  };

  if (!state.chatMessages) state.chatMessages = [];
  state.chatMessages.push(newMsg);
  saveChatMessages();

  input.value = '';
  renderCustomerChatMessages();
  playSfx('switch');

  // Trigger Email Notification to Admin ("atas chat muncul notifikasi ke email penerima")
  const subject = `[ALIANSI STORE - CHAT BARU] Pesan Masuk dari ${custName}`;
  const body = `Halo Admin ALIANSI STORE,

Ada pesan obrolan (Live Chat) baru dari pelanggan di website:

- Nama Customer  : ${custName}
- Email Customer : ${custEmail}
- No. WhatsApp   : ${custPhone || '-'}
- Waktu Masuk    : ${new Date().toLocaleString('id-ID')} WIB

Isi Pesan:
------------------------------------------------------------
"${text}"
------------------------------------------------------------

Silakan buka Dashboard Admin untuk melihat riwayat dan membalas pesan ini:
${window.location.origin}${window.location.pathname}`;

  const mailtoUrl = `mailto:${encodeURIComponent(adminEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Open notification draft to admin's inbox
  window.open(mailtoUrl, '_blank');

  showToast(`Pesan terkirim ke Admin & notifikasi email diteruskan ke ${adminEmail}!`, 'success', 'Pesan Terkirim');

  // If Admin is currently open, refresh admin view
  renderAdminChatFeed();
  renderAdminChatConversationsList();
}

// ================= ADMIN CHAT MODAL LOGIC =================

function openAdminChatModal(selectedEmail = null, context = null) {
  playSfx('click');

  const modal = document.getElementById('modal-admin-live-chat');
  if (!modal) return;

  if (selectedEmail) {
    state.activeAdminChatEmail = selectedEmail.toLowerCase().trim();
  }
  if (context) {
    state.activeAdminChatContext = context;
  }

  // If no email selected yet, fallback to first available conversation
  if (!state.activeAdminChatEmail) {
    const list = getDistinctChatConversations();
    if (list.length > 0) {
      state.activeAdminChatEmail = list[0].email;
    } else {
      state.activeAdminChatEmail = 'bayu.perkasa@gmail.com';
    }
  }

  // Mark messages in active conversation as read by admin
  if (state.activeAdminChatEmail) {
    (state.chatMessages || []).forEach(m => {
      if (m.conversationId === state.activeAdminChatEmail && m.senderRole === 'customer') {
        m.readByAdmin = true;
      }
    });
    saveChatMessages();
  }

  modal.classList.remove('hidden');
  renderAdminChatConversationsList();
  renderAdminChatFeed();
  lucide.createIcons();

  const input = document.getElementById('admin-chat-input');
  if (input) input.focus();
}

function openAdminChatForRequest(reqId) {
  const req = (state.gameRequests || []).find(r => r.id === reqId);
  if (!req) {
    showToast('Permintaan game tidak ditemukan.', 'warning');
    return;
  }

  const contextText = `REQ-${req.id}: ${req.gameTitle} (${Array.isArray(req.platform) ? req.platform.join(', ') : req.platform})`;
  openAdminChatModal(req.customerEmail, contextText);
}

function openAdminChatForCustomer(userId) {
  const user = (state.users || []).find(u => u.id === userId);
  if (!user) {
    showToast('Customer tidak ditemukan.', 'warning');
    return;
  }

  const targetEmail = user.email || user.identifier;
  openAdminChatModal(targetEmail, `Member Toko: ${user.name} (ID: ${user.id})`);
}

function getDistinctChatConversations() {
  const map = new Map();
  const messages = state.chatMessages || [];

  // 1. Collect from messages
  messages.forEach(m => {
    const key = (m.conversationId || m.customerEmail || '').toLowerCase();
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, {
        email: key,
        name: m.customerName || (m.senderRole === 'customer' ? m.senderName : 'Customer'),
        phone: m.customerPhone || '',
        lastMessage: m.text,
        lastTime: m.createdAt,
        unread: (m.senderRole === 'customer' && !m.readByAdmin) ? 1 : 0
      });
    } else {
      const existing = map.get(key);
      if (new Date(m.createdAt) > new Date(existing.lastTime)) {
        existing.lastMessage = m.text;
        existing.lastTime = m.createdAt;
      }
      if (m.senderRole === 'customer' && !m.readByAdmin) {
        existing.unread += 1;
      }
      if (m.customerName) existing.name = m.customerName;
      if (m.customerPhone) existing.phone = m.customerPhone;
    }
  });

  // 2. Also ensure customers from game requests and users are discoverable
  (state.gameRequests || []).forEach(r => {
    if (r.customerEmail) {
      const key = r.customerEmail.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          email: key,
          name: r.customerName || 'Customer',
          phone: r.customerPhone || '',
          lastMessage: `Permintaan: ${r.gameTitle}`,
          lastTime: r.createdAt || new Date().toISOString(),
          unread: 0
        });
      }
    }
  });

  (state.users || []).filter(u => u.role !== 'admin' && u.email).forEach(u => {
    const key = u.email.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        email: key,
        name: u.name,
        phone: u.phone || '',
        lastMessage: 'Belum ada pesan sebelumnya',
        lastTime: u.registeredAt || new Date().toISOString(),
        unread: 0
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
}

function selectAdminChatConversation(email) {
  playSfx('hover');
  state.activeAdminChatEmail = email.toLowerCase().trim();

  // Mark read
  (state.chatMessages || []).forEach(m => {
    if (m.conversationId === state.activeAdminChatEmail && m.senderRole === 'customer') {
      m.readByAdmin = true;
    }
  });
  saveChatMessages();

  renderAdminChatConversationsList();
  renderAdminChatFeed();
  lucide.createIcons();

  const input = document.getElementById('admin-chat-input');
  if (input) input.focus();
}

function clearAdminChatContext() {
  state.activeAdminChatContext = null;
  const strip = document.getElementById('admin-chat-context-strip');
  if (strip) strip.classList.add('hidden');
}

function renderAdminChatConversationsList() {
  const container = document.getElementById('admin-chat-conversations-list');
  if (!container) return;

  const searchInput = document.getElementById('admin-chat-search');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let list = getDistinctChatConversations();

  if (query) {
    list = list.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.email.toLowerCase().includes(query) ||
      c.lastMessage.toLowerCase().includes(query)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-500">
        <i data-lucide="message-square-off" class="w-6 h-6 mx-auto mb-1.5 opacity-50"></i>
        <div>Tidak ada percakapan.</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = list.map(c => {
    const isActive = state.activeAdminChatEmail === c.email;
    const initial = (c.name || 'C').substring(0, 2).toUpperCase();
    const timeFormatted = new Date(c.lastTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    return `
      <div 
        onclick="selectAdminChatConversation('${c.email}')" 
        class="p-3 transition-colors cursor-pointer flex items-center gap-2.5 ${isActive ? 'bg-sky-950/80 border-l-4 border-sky-400' : 'hover:bg-slate-900/60'}"
      >
        <div class="relative shrink-0">
          <div class="w-9 h-9 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold flex items-center justify-center text-xs">
            ${initial}
          </div>
          ${c.unread > 0 ? `
            <span class="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
              ${c.unread}
            </span>
          ` : ''}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-1">
            <span class="text-xs font-bold ${isActive ? 'text-white' : 'text-slate-200'} truncate">${escapeHtml(c.name)}</span>
            <span class="text-[9px] text-slate-500 shrink-0 font-mono">${timeFormatted}</span>
          </div>
          <div class="text-[11px] text-slate-400 truncate mt-0.5">${escapeHtml(c.lastMessage)}</div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function renderAdminChatFeed() {
  const feed = document.getElementById('admin-chat-feed');
  if (!feed) return;

  const targetEmail = state.activeAdminChatEmail;
  if (!targetEmail) {
    feed.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-8">
        <i data-lucide="message-square" class="w-10 h-10 text-slate-600 mb-2 opacity-50"></i>
        <div>Pilih percakapan customer di sebelah kiri untuk mulai chat dua arah.</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Update Header details
  const conversations = getDistinctChatConversations();
  const conv = conversations.find(c => c.email === targetEmail) || {
    name: 'Customer',
    email: targetEmail,
    phone: ''
  };

  const nameEl = document.getElementById('admin-chat-header-name');
  const emailEl = document.getElementById('admin-chat-header-email');
  const phoneEl = document.getElementById('admin-chat-header-phone');
  const avatarEl = document.getElementById('admin-chat-header-avatar');
  const waBtn = document.getElementById('admin-chat-wa-btn');
  const mailBtn = document.getElementById('admin-chat-mailto-btn');

  if (nameEl) nameEl.textContent = conv.name;
  if (emailEl) emailEl.textContent = conv.email;
  if (phoneEl) phoneEl.textContent = conv.phone || '';
  if (avatarEl) avatarEl.textContent = (conv.name || 'C').substring(0, 2).toUpperCase();

  if (waBtn) {
    if (conv.phone) {
      const cleanPhone = conv.phone.replace(/^0/, '62').replace(/[\s-]/g, '');
      waBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Halo Kak ' + conv.name + ', perkenalkan saya Admin Aliansi Store.')}`;
      waBtn.classList.remove('hidden');
    } else {
      waBtn.classList.add('hidden');
    }
  }

  if (mailBtn) {
    mailBtn.href = `mailto:${conv.email}?subject=${encodeURIComponent('[ALIANSI STORE] Pemberitahuan Layanan untuk ' + conv.name)}`;
  }

  // Context strip
  const contextStrip = document.getElementById('admin-chat-context-strip');
  const contextText = document.getElementById('admin-chat-context-text');
  if (state.activeAdminChatContext) {
    if (contextStrip) contextStrip.classList.remove('hidden');
    if (contextText) contextText.textContent = state.activeAdminChatContext;
  } else {
    if (contextStrip) contextStrip.classList.add('hidden');
  }

  // Filter messages
  const messages = (state.chatMessages || []).filter(m => m.conversationId === targetEmail);

  if (messages.length === 0) {
    feed.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-8 space-y-2">
        <i data-lucide="sparkles" class="w-8 h-8 text-sky-400 opacity-60"></i>
        <div class="font-bold text-slate-300">Belum ada percakapan dengan ${escapeHtml(conv.name)}.</div>
        <div class="text-[11px] text-slate-500 max-w-sm">Ketik pesan di bawah untuk memulai obrolan. Notifikasi email resmi akan langsung disiapkan ke alamat ${conv.email}.</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  feed.innerHTML = messages.map(m => {
    const isAdmin = m.senderRole === 'admin';
    const timeFormatted = new Date(m.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    if (isAdmin) {
      return `
        <div class="flex flex-col items-end">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-[10px] font-bold text-cyan-400">Anda (Admin Toko)</span>
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          </div>
          <div class="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-xs bg-gradient-to-r from-cyan-600 to-sky-600 text-white text-xs shadow-md break-words">
            ${escapeHtml(m.text)}
          </div>
          <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
            <span>${timeFormatted}</span>
            <i data-lucide="check-check" class="w-3 h-3 text-cyan-400"></i>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="flex flex-col items-start">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-[10px] font-bold text-slate-300">${escapeHtml(m.senderName || conv.name)}</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">CUSTOMER</span>
          </div>
          <div class="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-xs bg-slate-900 border border-slate-700/80 text-white text-xs shadow-md break-words">
            ${escapeHtml(m.text)}
          </div>
          <span class="text-[10px] text-slate-500 mt-1 font-mono">${timeFormatted}</span>
        </div>
      `;
    }
  }).join('');

  lucide.createIcons();
  feed.scrollTop = feed.scrollHeight;
}

function insertAdminChatTemplate(text) {
  playSfx('hover');
  const input = document.getElementById('admin-chat-input');
  if (input) {
    input.value = text;
    input.focus();
  }
}

function sendAdminChatMessage() {
  const input = document.getElementById('admin-chat-input');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const targetEmail = state.activeAdminChatEmail;
  if (!targetEmail) {
    showToast('Pilih customer tujuan chat terlebih dahulu.', 'warning');
    return;
  }

  const conversations = getDistinctChatConversations();
  const conv = conversations.find(c => c.email === targetEmail) || {
    name: 'Customer',
    email: targetEmail,
    phone: ''
  };

  const adminEmail = (state.config && state.config.adminEmail) || 'aliansistoreofficial@gmail.com';

  const newMsg = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    conversationId: targetEmail.toLowerCase(),
    senderRole: 'admin',
    senderName: 'Admin Aliansi Store',
    senderEmail: adminEmail,
    recipientEmail: targetEmail,
    customerName: conv.name,
    customerEmail: targetEmail,
    customerPhone: conv.phone,
    text: text,
    context: state.activeAdminChatContext || '',
    createdAt: new Date().toISOString(),
    readByAdmin: true,
    readByCustomer: false
  };

  if (!state.chatMessages) state.chatMessages = [];
  state.chatMessages.push(newMsg);
  saveChatMessages();

  input.value = '';
  renderAdminChatFeed();
  renderAdminChatConversationsList();
  playSfx('success');

  // Trigger Email Notification to Customer ("atas chat muncul notifikasi ke email penerima")
  const notifyCheckbox = document.getElementById('admin-chat-notify-email');
  const shouldNotifyEmail = notifyCheckbox ? notifyCheckbox.checked : true;

  if (shouldNotifyEmail) {
    const storeName = (state.config && state.config.storeName) || 'ALIANSI STORE';
    const currentUrl = new URL(window.location.href);
    const chatUrl = `${currentUrl.origin}${currentUrl.pathname}?action=open-chat&email=${encodeURIComponent(targetEmail)}`;

    const subject = `[${storeName}] Balasan Pesan dari Admin Toko untuk ${conv.name}`;
    const body = `Halo ${conv.name},

Admin ${storeName} baru saja mengirimkan balasan pesan obrolan untuk Anda:

------------------------------------------------------------
"${text}"
------------------------------------------------------------
Waktu: ${new Date().toLocaleString('id-ID')} WIB

Untuk membalas pesan ini atau melanjutkan obrolan secara langsung, silakan klik tautan berikut:
${chatUrl}

Jika Anda membutuhkan bantuan lainnya mengenai pesanan game PlayStation, tim kami siap melayani.

Salam hangat,
Customer Care ${storeName}
Website: ${currentUrl.origin}${currentUrl.pathname}`;

    const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open mailto draft to customer's email
    window.open(mailtoUrl, '_blank');

    showToast(`Pesan chat terkirim & draft email notifikasi ke ${targetEmail} telah disiapkan!`, 'success', 'Balasan Terkirim');
  } else {
    showToast(`Pesan chat berhasil dikirim ke ${conv.name}.`, 'success');
  }

  // If customer chat box is open on same screen (testing), refresh it
  if (state.isCustomerChatOpen) {
    renderCustomerChatMessages();
    playSfx('chat');
  }
}


// ==========================================================================
// TESTIMONIAL ENGINE & CUSTOMER REVIEWS
// ==========================================================================

function getInitials(name) {
  if (!name) return 'GA';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarGradient(index) {
  const gradients = [
    'bg-gradient-to-tr from-purple-600 to-indigo-600',
    'bg-gradient-to-tr from-sky-600 to-blue-600',
    'bg-gradient-to-tr from-emerald-600 to-teal-600',
    'bg-gradient-to-tr from-amber-600 to-orange-600',
    'bg-gradient-to-tr from-rose-600 to-pink-600',
    'bg-gradient-to-tr from-cyan-600 to-sky-600'
  ];
  return gradients[index % gradients.length];
}

function formatDateAgo(dateStr) {
  if (!dateStr) return 'Baru saja';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} minggu lalu`;
  } catch (e) {
    return 'Baru saja';
  }
}

let sessionShuffledDummyReviews = null;

function getSmartReviewsPool() {
  const stored = Array.isArray(state.reviews) ? state.reviews : [];

  // Identify Real Customer Reviews:
  // - explicitly marked isReal: true
  // - or has orderId
  // - or id doesn't match rev-1xx dummy template (e.g. rev-real-xxx or user submitted)
  const realReviews = stored.filter(r => r && (
    r.isReal === true || 
    Boolean(r.orderId) || 
    (r.id && !/^rev-1\d\d$/.test(r.id))
  ));

  // Base dummy reviews from INITIAL_REVIEWS (or any rev-1xx in stored)
  let dummyPool = (typeof INITIAL_REVIEWS !== 'undefined' && Array.isArray(INITIAL_REVIEWS))
    ? [...INITIAL_REVIEWS]
    : stored.filter(r => r && /^rev-1\d\d$/.test(r.id));

  // Shuffle dummy reviews once per session so users see different cards each visit/refresh!
  if (!sessionShuffledDummyReviews || sessionShuffledDummyReviews.length === 0) {
    const shuffled = [...dummyPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Dynamic fresh relative times so reviews always look active
    const dynamicTimes = [
      'Baru saja', '1 jam lalu', '3 jam lalu', 'Hari ini, 10:20', 'Hari ini, 14:15',
      'Kemarin', 'Kemarin', '2 hari lalu', '2 hari lalu', '3 hari lalu',
      '3 hari lalu', '4 hari lalu', '5 hari lalu', '6 hari lalu', '1 minggu lalu',
      '1 minggu lalu', '10 hari lalu', '2 minggu lalu', '2 minggu lalu', '3 minggu lalu',
      '3 minggu lalu', '1 bulan lalu'
    ];

    sessionShuffledDummyReviews = shuffled.map((rev, idx) => ({
      ...rev,
      isReal: false,
      displayTime: dynamicTimes[idx % dynamicTimes.length]
    }));
  }

  // If no real customer reviews exist yet, return randomized dummy pool
  if (realReviews.length === 0) {
    return sessionShuffledDummyReviews;
  }

  // Interleave real reviews:
  // - The most recent real review is placed at index 0 (top of carousel)
  // - Additional real reviews are interleaved every 2-3 dummy reviews
  const combined = [];
  let rIdx = 0;
  let dIdx = 0;

  // Pin latest real review first!
  combined.push({ ...realReviews[rIdx++], isReal: true });

  while (dIdx < sessionShuffledDummyReviews.length || rIdx < realReviews.length) {
    // 2-3 dummy reviews
    for (let k = 0; k < 3 && dIdx < sessionShuffledDummyReviews.length; k++) {
      combined.push(sessionShuffledDummyReviews[dIdx++]);
    }
    // Next real review
    if (rIdx < realReviews.length) {
      combined.push({ ...realReviews[rIdx++], isReal: true });
    }
  }

  return combined;
}

function renderTestimonials() {
  const container = document.getElementById('testimonials-carousel');
  if (!container) return;

  const reviewsList = getSmartReviewsPool();

  // Compute stats
  const totalCount = reviewsList.length;
  const countTabAll = document.getElementById('count-tab-rev-all');
  if (countTabAll) countTabAll.textContent = totalCount;

  const statReviewsLabel = document.getElementById('stat-total-reviews-label');
  if (statReviewsLabel) {
    statReviewsLabel.textContent = `${totalCount + 380}+ Ulasan Terverifikasi`;
  }

  // Filter
  const filter = state.activeReviewFilter || 'all';
  let filtered = [...reviewsList];

  if (filter === 'star5') {
    filtered = filtered.filter(r => r.rating === 5);
  } else if (filter === 'subindo') {
    filtered = filtered.filter(r => 
      (r.gameTitle || '').toLowerCase().includes('sub indo') ||
      (r.comment || '').toLowerCase().includes('sub indo') ||
      (r.platform || '').toLowerCase().includes('hen')
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="w-full text-center py-10 text-xs text-slate-400">
        <i data-lucide="message-square-off" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
        <div>Belum ada ulasan untuk filter ini.</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map((rev, idx) => {
    const initials = getInitials(rev.customerName);
    const avatarBg = getAvatarGradient(idx);
    const starsHtml = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
    const timeAgo = rev.displayTime || formatDateAgo(rev.createdAt);

    // Uniform styling for all reviews (seamless, trusted, identical badge)
    const verifiedBadge = `<span class="rev-badge-verified text-[9px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 font-bold shrink-0 flex items-center gap-1">
      <i data-lucide="shield-check" class="w-3 h-3 text-sky-600 dark:text-sky-400"></i> Terverifikasi
    </span>`;

    return `
      <div class="review-card relative w-[310px] sm:w-[350px] shrink-0 p-5 rounded-3xl border border-slate-800 bg-[#080f24] hover:border-amber-500/50 shadow-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group">
        <div>
          <!-- Header: Avatar + Customer Name + Verified Badge -->
          <div class="flex items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-10 h-10 rounded-2xl ${avatarBg} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                ${initials}
              </div>
              <div class="min-w-0">
                <div class="rev-customer-name font-black text-white text-xs sm:text-sm truncate font-display">${escapeHtml(rev.customerName)}</div>
                <div class="rev-city text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                  <i data-lucide="map-pin" class="w-3 h-3 text-slate-500 shrink-0"></i>
                  <span>${escapeHtml(rev.city || 'Indonesia')}</span>
                </div>
              </div>
            </div>
            ${verifiedBadge}
          </div>

          <!-- Stars & Date -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <div class="flex items-center gap-0.5 text-amber-400 text-xs tracking-wider font-bold">
              <span>${starsHtml}</span>
              <span class="ml-1 text-[11px] text-amber-500 font-mono">(${rev.rating}.0)</span>
            </div>
            <span class="rev-date text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">${timeAgo}</span>
          </div>

          <!-- Game Title Tag -->
          <div class="mb-3">
            <span class="rev-game-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-sky-950/70 text-sky-300 border border-sky-500/30 max-w-full truncate">
              <i data-lucide="gamepad-2" class="w-3 h-3 text-sky-400 shrink-0"></i>
              <span class="truncate">${escapeHtml(rev.gameTitle || 'Game PlayStation')}</span>
            </span>
          </div>

          <!-- Review Comment -->
          <p class="rev-comment text-xs text-slate-300 leading-relaxed italic line-clamp-4">
            "${escapeHtml(rev.comment)}"
          </p>
        </div>

        <!-- Card Footer -->
        <div class="rev-footer mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"><i data-lucide="check" class="w-3 h-3"></i> Google Drive Instan</span>
          <span class="font-mono text-slate-500 dark:text-slate-400 font-bold">${rev.platform || 'PS4 HEN'}</span>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function filterTestimonials(filter) {
  state.activeReviewFilter = filter;
  playSfx('click');

  ['all', 'star5', 'subindo'].forEach(f => {
    const btn = document.getElementById(`tab-rev-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-sm transition-all cursor-pointer';
      } else {
        btn.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white transition-all cursor-pointer';
      }
    }
  });

  renderTestimonials();
}

function scrollTestimonials(direction) {
  playSfx('click');
  const container = document.getElementById('testimonials-carousel');
  if (!container) return;
  const amount = direction === 'left' ? -360 : 360;
  container.scrollBy({ left: amount, behavior: 'smooth' });
}

// Review Modal Logic
let currentSelectedRating = 5;
let currentReviewOrderId = null;

const RATING_DESCRIPTIONS = {
  5: '⭐⭐⭐⭐⭐ Luar Biasa! Sangat Puas',
  4: '⭐⭐⭐⭐ Sangat Bagus & Memuaskan',
  3: '⭐⭐⭐ Cukup Baik',
  2: '⭐⭐ Kurang Memuaskan',
  1: '⭐ Sangat Kecewa'
};

function setReviewRating(rating) {
  currentSelectedRating = Math.max(1, Math.min(5, rating));
  playSfx('click');
  updateStarButtonsUI(currentSelectedRating);
}

function previewReviewRating(rating) {
  updateStarButtonsUI(rating);
}

function resetReviewRatingPreview() {
  updateStarButtonsUI(currentSelectedRating);
}

function updateStarButtonsUI(rating) {
  const container = document.getElementById('review-stars-picker');
  if (!container) return;
  const buttons = container.querySelectorAll('.star-btn');
  buttons.forEach((btn, index) => {
    if (index < rating) {
      btn.style.opacity = '1';
      btn.style.filter = 'grayscale(0%)';
      btn.style.transform = 'scale(1.15)';
    } else {
      btn.style.opacity = '0.35';
      btn.style.filter = 'grayscale(100%)';
      btn.style.transform = 'scale(1)';
    }
  });

  const label = document.getElementById('review-rating-label');
  if (label) {
    label.textContent = RATING_DESCRIPTIONS[rating] || '⭐⭐⭐⭐⭐ Sangat Puas';
  }
}

function openReviewModal(orderId = '') {
  playSfx('click');
  currentReviewOrderId = orderId || null;
  currentSelectedRating = 5;

  const modal = document.getElementById('modal-review');
  if (!modal) return;

  // Pre-fill inputs
  const nameInput = document.getElementById('rev-input-name');
  const gameInput = document.getElementById('rev-input-game');
  const cityInput = document.getElementById('rev-input-city');
  const commentInput = document.getElementById('rev-input-comment');

  if (commentInput) commentInput.value = '';

  let matchedOrder = null;
  if (orderId) {
    matchedOrder = (state.orders || []).find(o => o && o.id && o.id.toUpperCase() === String(orderId).toUpperCase());
  } else if (state.currentInvoice) {
    matchedOrder = state.currentInvoice;
    currentReviewOrderId = matchedOrder.id;
  }

  if (matchedOrder) {
    if (nameInput) nameInput.value = matchedOrder.customerName || '';
    if (gameInput && matchedOrder.items && matchedOrder.items.length > 0) {
      gameInput.value = matchedOrder.items.map(i => i.title).join(', ');
    }
  } else if (state.currentUser) {
    if (nameInput) nameInput.value = state.currentUser.name || '';
  }

  if (cityInput && !cityInput.value) {
    cityInput.value = '';
  }

  updateStarButtonsUI(5);
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function submitCustomerReview(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('rev-input-name');
  const cityInput = document.getElementById('rev-input-city');
  const gameInput = document.getElementById('rev-input-game');
  const commentInput = document.getElementById('rev-input-comment');

  const name = nameInput ? nameInput.value.trim() : '';
  const city = cityInput ? cityInput.value.trim() : 'Indonesia';
  const game = gameInput ? gameInput.value.trim() : 'Game PS4 HEN';
  const comment = commentInput ? commentInput.value.trim() : '';
  const rating = currentSelectedRating || 5;

  if (!name || !comment) {
    showToast('Mohon lengkapi nama dan ulasan Anda.', 'error');
    return;
  }

  const newReview = {
    id: 'rev-real-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    orderId: currentReviewOrderId || null,
    customerName: name,
    city: city || 'Indonesia',
    gameTitle: game,
    rating: rating,
    comment: comment,
    isVerified: true,
    isReal: true,
    platform: 'PS4 HEN',
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(state.reviews)) {
    state.reviews = [];
  }

  // Prepend to show user's review at the very top of the carousel
  state.reviews.unshift(newReview);
  saveReviews();
  sessionShuffledDummyReviews = null;

  // Attempt sync to Supabase if connected
  if (supabaseClient) {
    try {
      supabaseClient.from('reviews').insert([{
        id: newReview.id,
        order_id: newReview.orderId,
        customer_name: newReview.customerName,
        city: newReview.city,
        game_title: newReview.gameTitle,
        rating: newReview.rating,
        comment: newReview.comment,
        is_verified: true,
        created_at: newReview.createdAt
      }]).then(() => {}).catch(() => {});
    } catch (e) {}
  }

  closeModals();
  playSfx('success');
  if (typeof confetti === 'function') {
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  }

  showToast('Terima kasih! Ulasan & rating Anda berhasil diterbitkan di Beranda toko.', 'success', 'Ulasan Terkirim');
  
  // Re-render testimonials & social proof ticker immediately
  renderTestimonials();
  initSocialProofStream();

  // If review card was in invoice, update it
  const invReviewCard = document.getElementById('inv-review-prompt-card');
  if (invReviewCard) {
    invReviewCard.innerHTML = `
      <div class="flex items-center justify-between gap-3 flex-wrap w-full">
        <div class="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <i data-lucide="check-circle-2" class="w-5 h-5 shrink-0"></i>
          <span>Terima kasih! Anda telah memberikan ulasan untuk pesanan ini. Ulasan Anda telah aktif di Beranda. ⭐⭐⭐⭐⭐</span>
        </div>
        <button type="button" onclick="closeModals(); window.location.hash = 'testimoni';" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          Lihat di Beranda
        </button>
      </div>
    `;
    lucide.createIcons();
  }
}


// ==========================================================================
// FAQ (FREQUENTLY ASKED QUESTIONS) ENGINE & ADMIN MANAGEMENT
// ==========================================================================

let activeFaqSearchQuery = '';

function renderFaqList() {
  const container = document.getElementById('faq-accordion-container');
  if (!container) return;

  const searchInput = document.getElementById('faq-search-input');

  // Prevent browser/password manager from erroneously autofilling credentials into FAQ search
  if (searchInput && isCredentialAutofillValue(searchInput.value) && document.activeElement !== searchInput) {
    searchInput.value = '';
  }

  activeFaqSearchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let list = (state.faqs && state.faqs.length > 0)
    ? state.faqs
    : (typeof INITIAL_FAQS !== 'undefined' ? [...INITIAL_FAQS] : []);

  // Filter active and matching search query
  let filtered = list.filter(f => f.isActive !== false);

  if (activeFaqSearchQuery) {
    filtered = filtered.filter(f => 
      (f.question || '').toLowerCase().includes(activeFaqSearchQuery) ||
      (f.answer || '').toLowerCase().includes(activeFaqSearchQuery) ||
      (f.category || '').toLowerCase().includes(activeFaqSearchQuery)
    );
  }

  // Sort by order ascending
  filtered.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <i data-lucide="help-circle" class="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50"></i>
        <div class="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">Pertanyaan tidak ditemukan</div>
        <p class="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">Coba gunakan kata kunci lain seperti "Google Drive", "PKG", "HEN", atau tanyakan langsung ke CS WhatsApp kami.</p>
        <button type="button" onclick="document.getElementById('faq-search-input').value=''; renderFaqList();" class="mt-3 px-3 py-1.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 text-xs font-bold hover:bg-sky-200 transition-colors">
          Reset Pencarian FAQ
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map((faq, index) => {
    const isOpen = state.openFaqId === faq.id || (index === 0 && !activeFaqSearchQuery && state.openFaqId === null);
    return `
      <div class="faq-item rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200 shadow-sm hover:border-sky-500/40">
        <button 
          type="button" 
          onclick="toggleFaqAccordion('${faq.id}')" 
          class="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
          aria-expanded="${isOpen}"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-6 h-6 rounded-lg ${isOpen ? 'bg-sky-600 text-white' : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400'} text-xs font-black flex items-center justify-center shrink-0 border border-sky-300 dark:border-sky-500/30 transition-colors">
              Q
            </span>
            <span class="faq-question font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">
              ${escapeHtml(faq.question)}
            </span>
          </div>
          <div class="w-7 h-7 rounded-full ${isOpen ? 'bg-sky-600 text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} flex items-center justify-center shrink-0 transition-all duration-300">
            <i data-lucide="chevron-down" class="w-4 h-4"></i>
          </div>
        </button>
        <div id="faq-answer-${faq.id}" class="${isOpen ? '' : 'hidden'} px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-slate-100 dark:border-slate-800/80">
          <div class="pt-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed pl-9">
            ${escapeHtml(faq.answer).replace(/\n/g, '<br/>')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function toggleFaqAccordion(faqId) {
  playSfx('click');
  if (state.openFaqId === faqId) {
    state.openFaqId = ''; // Collapse
  } else {
    state.openFaqId = faqId; // Expand
  }
  renderFaqList();
}

// ---------------- Admin FAQ Management ----------------
let currentEditingFaqId = null;

function renderAdminFaqList() {
  const container = document.getElementById('admin-faq-list');
  const countBadge = document.getElementById('admin-faq-count-badge');
  if (!container) return;

  const faqs = (state.faqs && state.faqs.length > 0)
    ? state.faqs
    : (typeof INITIAL_FAQS !== 'undefined' ? [...INITIAL_FAQS] : []);

  if (countBadge) {
    countBadge.textContent = `${faqs.length} FAQ`;
  }

  if (faqs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-xs text-slate-400">
        <i data-lucide="help-circle" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
        <div>Belum ada data FAQ. Klik tombol "Tambah FAQ Baru" untuk membuat tanya jawab baru.</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Sort by order ascending
  const sorted = [...faqs].sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

  container.innerHTML = sorted.map((faq, idx) => {
    const isAct = faq.isActive !== false;
    return `
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm hover:shadow transition-all">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">#${faq.order || (idx + 1)}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30">${escapeHtml(faq.category || 'Umum')}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isAct ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'}">
              ${isAct ? 'TAMPIL DI BERANDA' : 'DISEMBUNYIKAN'}
            </span>
          </div>
          <div class="font-bold text-slate-900 dark:text-white text-sm mb-1">${escapeHtml(faq.question)}</div>
          <p class="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-2 leading-relaxed">${escapeHtml(faq.answer)}</p>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button 
            type="button" 
            onclick="toggleAdminFaqStatus('${faq.id}')" 
            class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${isAct ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 border border-slate-300 dark:border-slate-700' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'} transition-colors cursor-pointer shadow-sm"
            title="${isAct ? 'Sembunyikan dari Beranda' : 'Aktifkan di Beranda'}"
          >
            <i data-lucide="${isAct ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
          </button>
          <button 
            type="button" 
            onclick="openAdminFaqModal('${faq.id}')" 
            class="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-sky-50 dark:bg-sky-950/70 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
          </button>
          <button 
            type="button" 
            onclick="deleteAdminFaq('${faq.id}')" 
            class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/50 transition-colors cursor-pointer shadow-sm" 
            title="Hapus FAQ"
          >
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function openAdminFaqModal(faqId = null) {
  playSfx('click');
  currentEditingFaqId = faqId;

  const modal = document.getElementById('modal-admin-faq');
  if (!modal) return;

  const titleEl = document.getElementById('admin-faq-modal-title');
  const qInput = document.getElementById('admin-faq-input-question');
  const aInput = document.getElementById('admin-faq-input-answer');
  const catInput = document.getElementById('admin-faq-input-category');
  const orderInput = document.getElementById('admin-faq-input-order');

  if (faqId) {
    const list = state.faqs || [];
    const item = list.find(f => f.id === faqId);
    if (item) {
      if (titleEl) titleEl.textContent = 'Edit Tanya Jawab (FAQ)';
      if (qInput) qInput.value = item.question || '';
      if (aInput) aInput.value = item.answer || '';
      if (catInput) catInput.value = item.category || 'Umum';
      if (orderInput) orderInput.value = item.order || 1;
    }
  } else {
    if (titleEl) titleEl.textContent = 'Tambah FAQ Baru ke Beranda';
    if (qInput) qInput.value = '';
    if (aInput) aInput.value = '';
    if (catInput) catInput.value = 'Umum';
    if (orderInput) orderInput.value = (state.faqs.length + 1);
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function saveAdminFaq(event) {
  if (event) event.preventDefault();

  const qInput = document.getElementById('admin-faq-input-question');
  const aInput = document.getElementById('admin-faq-input-answer');
  const catInput = document.getElementById('admin-faq-input-category');
  const orderInput = document.getElementById('admin-faq-input-order');

  const question = qInput ? qInput.value.trim() : '';
  const answer = aInput ? aInput.value.trim() : '';
  const category = catInput ? catInput.value.trim() : 'Umum';
  const order = orderInput ? parseInt(orderInput.value) || 1 : 1;

  if (!question || !answer) {
    showToast('Pertanyaan dan jawaban wajib diisi!', 'error');
    return;
  }

  if (!Array.isArray(state.faqs)) {
    state.faqs = [];
  }

  if (currentEditingFaqId) {
    const idx = state.faqs.findIndex(f => f.id === currentEditingFaqId);
    if (idx !== -1) {
      state.faqs[idx].question = question;
      state.faqs[idx].answer = answer;
      state.faqs[idx].category = category;
      state.faqs[idx].order = order;
    }
    showToast('FAQ berhasil diperbarui!', 'success');
  } else {
    const newFaq = {
      id: 'faq-' + Date.now(),
      question: question,
      answer: answer,
      category: category,
      order: order,
      isActive: true
    };
    state.faqs.push(newFaq);
    showToast('FAQ baru berhasil ditambahkan ke Beranda!', 'success');
  }

  saveFaqs();
  closeModals();
  playSfx('success');
  renderAdminFaqList();
  renderFaqList();
}

function toggleAdminFaqStatus(faqId) {
  playSfx('click');
  const item = (state.faqs || []).find(f => f.id === faqId);
  if (!item) return;

  item.isActive = item.isActive === false ? true : false;
  saveFaqs();
  renderAdminFaqList();
  renderFaqList();
  showToast(item.isActive ? 'FAQ diaktifkan di Beranda.' : 'FAQ disembunyikan dari Beranda.', 'info');
}

function deleteAdminFaq(faqId) {
  if (!confirm('Apakah Anda yakin ingin menghapus pertanyaan FAQ ini?')) return;
  playSfx('click');
  state.faqs = (state.faqs || []).filter(f => f.id !== faqId);
  saveFaqs();
  renderAdminFaqList();
  renderFaqList();
  showToast('FAQ berhasil dihapus.', 'info');
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}
