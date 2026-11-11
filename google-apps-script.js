/**
 * ============================================================================
 * ALIANSI STORE - Google Apps Script Webhook (Auto-Share Google Drive & Email)
 * ============================================================================
 * 
 * CARA PAKAI (CUKUP SETTING 1 KALI SAJA SEUMUR HIDUP!):
 * 1. Buka https://script.google.com/ lalu klik "Project Baru" (New Project).
 * 2. Hapus semua kode default, lalu Paste seluruh isi file ini.
 * 3. TIDAK PERLU mengubah kode ini lagi meskipun Anda mengganti Link Google Drive
 *    pada produk atau menambah game baru di Admin Website, karena script ini
 *    SUDAH OTOMATIS membaca Link Google Drive terbaru langsung dari database produk!
 * 4. Klik "Deploy" (Terapkan) di kanan atas > "Deployment baru" (New deployment).
 * 5. Pilih jenis: "Aplikasi Web" (Web app).
 * 6. Konfigurasi:
 *    - Deskripsi: Aliansi Store Webhook
 *    - Jalankan sebagai: Saya (email Anda)
 *    - Yang memiliki akses: Siapa saja (Anyone)
 * 7. Klik "Deploy", beri izin (Grant Access), lalu Salin URL Aplikasi Web yang diberikan:
 *    Contoh: https://script.google.com/macros/s/AKfycb.../exec
 * 8. Tempelkan URL tersebut 1 KALI SAJA di Website Aliansi Store > Admin > Pengaturan Toko.
 *    Selesai selamanya!
 * ============================================================================
 */

// 1. KONFIGURASI DUITKU & SUPABASE
var CONFIG = {
  DUITKU_MERCHANT_CODE: "DS37511",
  DUITKU_API_KEY: "af12edbc311afba784bc7c8bd19a2c61",
  
  SUPABASE_URL: "https://fgotjbcabnragtpijuvk.supabase.co",
  SUPABASE_KEY: "sb_publishable_wXLOEof96Y8l22xcABvPZQ_unQgSmws",
  
  STORE_NAME: "ALIANSI STORE",
  WHATSAPP_CS: "6285388597684" // WhatsApp Admin untuk bantuan pembeli
};

// 2. MAPPING FOLDER GOOGLE DRIVE PER GAME (14 Official Titles)
// Otomatis diambil dari link Google Drive masing-masing produk!
var GDRIVE_FOLDER_MAP = {
  "game-it-takes-two-subindo": "1Pw4Fe24O0LAAsV6Affwp_Ef4C0isK6JQ",
  "game-gow-ragnarok-subindo": "1Z_sKyYSUbLNxbHphQlQnbCe-mpNDL5uI",
  "game-ghost-tsushima-subindo": "1P0VCc2I_vcNbOnFz7WbK6UaL6a9PRJlZ",
  "game-tlou-part2-subindo": "1uxBTDu14Dez9CDB1H6UTDBJjc1vU25Id",
  "game-gta5-subindo": "1JVraSNB9bClkz4xiJK7AxpYkPvAUk7Ch",
  "game-mk11-subindo": "1Ft7-nvhjDiROsH3lJTpIRiRkRJ0WAnKo",
  "game-hogwarts-legacy-subindo": "1fYb7U4P2tBimPkgHbuisnhtrlO3jtClQ",
  "game-uncharted-4-subindo": "1SKdN1zmzK1c93Y_WeJRh50L4gGy3k7p9",
  "game-stray-subindo": "1qjWgZf5LM3KiBQnzZd1XCJneGtedvOhL",
  "game-ac-odyssey-subindo": "1VjZ_0hcRJT2EyhyZ1E7VC5X5F_hTER_4",
  "game-one-piece-odyssey-subindo": "1-64nEr0eZFEOSXKOJ2QXuYSp6_8DTjQX",
  "game-watch-dogs-subindo": "1IVWJXMq1S0gXWTDwpBbKsOuDZIg3NLr8",
  "game-spiderman-subindo": "1flqbyn1edmdGlmXPpjQmBfxK1_2n61Vx",
  "game-pes-2027-bitbox": "1m5KFwedXfdEoIN6BCr4hT07wRN6MkYnO",
  
  // FOLDER DEFAULT / MASTER
  "default": "1P0VCc2I_vcNbOnFz7WbK6UaL6a9PRJlZ"
};

/**
 * Ekstraktor Folder ID Google Drive otomatis dari berbagai format URL / link produk
 */
function extractDriveFolderId(urlOrId) {
  if (!urlOrId) return "";
  var str = String(urlOrId).trim();
  // Jika sudah berupa ID murni (33 karakter base64)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(str)) {
    return str;
  }
  // Ekstrak dari URL format https://drive.google.com/drive/folders/ID...
  var match = str.match(/\/folders\/([a-zA-Z0-9_-]+)/) || str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return "";
}

/**
 * Handle HTTP GET - Untuk uji coba / health check browser
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  if (action === "test") {
    var to = (e && e.parameter && e.parameter.to) || "aliansistoreofficial@gmail.com";
    try {
      GmailApp.sendEmail(to, "[ALIANSI STORE] Tes Integrasi Google Apps Script Webhook Berhasil!", 
        "Halo! Integrasi Webhook Google Apps Script ALIANSI STORE berhasil berjalan dengan baik. Layanan siap mengirimkan bukti transaksi dan laporan penjualan otomatis.");
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Email tes berhasil dikirim ke " + to,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: err.message
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "ALIANSI STORE Payment & Drive Automation Webhook",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST - Menerima Notifikasi Webhook dari Duitku atau Panggilan Langsung dari Website
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Kunci proses 10 detik agar tidak double process jika Duitku retry
    lock.waitLock(10000);
    
    // Parse data (Mendukung Form-URLEncoded dan JSON)
    var params = {};
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      params = e.parameter;
    }
    if (e.postData && e.postData.contents) {
      try {
        var parsed = JSON.parse(e.postData.contents);
        for (var k in parsed) { params[k] = parsed[k]; }
      } catch (err) {
        // Fallback ke parameter bawaan
      }
    }
    
    // ------------------------------------------------------------------------
    // A. Direct API Dispatch dari Website Aliansi Store (Checkout / Fulfillment)
    // ------------------------------------------------------------------------
    var action = params.action || "";
    if (action === "send_order_emails" || action === "send_receipt") {
      var ord = params.order || params;
      var cEmail = (ord.customerEmail || ord.customer_email || params.customerEmail || "").trim();
      var cName = ord.customerName || ord.customer_name || params.customerName || "Pelanggan Setia";
      var aEmail = (params.adminEmail || ord.adminEmail || "aliansistoreofficial@gmail.com").trim();
      
      var items = Array.isArray(ord.items) ? ord.items : [];
      var sharedLinks = [];
      
      // Auto-share Google Drive & Siapkan Link Akses (Otomatis ambil link terbaru dari Produk!)
      if (cEmail && cEmail.indexOf("@") !== -1) {
        var fulfill = ord.fulfillment || params.fulfillment || {};

        items.forEach(function(item) {
          var prodId = item.productId || item.id || "";
          // 1. Cek link terbaru langsung dari tabel products di Supabase (jika Admin baru saja ganti link di produk!)
          var liveDbLink = fetchProductDriveLinkFromSupabase(prodId, item.title);
          // 2. Fallback ke link dari item order atau fulfillment
          var rawLink = liveDbLink || item.driveLink || (item.images && item.images.driveLink) || fulfill.driveLink || "";
          var folderId = extractDriveFolderId(rawLink) || GDRIVE_FOLDER_MAP[prodId] || GDRIVE_FOLDER_MAP["default"];
          
          if (folderId && folderId.indexOf("1ABCxyz") === -1) {
            try {
              var folder = DriveApp.getFolderById(folderId);
              folder.addViewer(cEmail);
            } catch (dErr) {
              Logger.log("Drive share notice: " + dErr.message);
            }
          }
          sharedLinks.push({
            gameId: prodId,
            title: item.title,
            folderId: folderId,
            url: rawLink || ("https://drive.google.com/drive/folders/" + (folderId || ""))
          });
        });

        if (sharedLinks.length === 0 && Array.isArray(fulfill.driveLinks) && fulfill.driveLinks.length > 0) {
          fulfill.driveLinks.forEach(function(dl) {
            var fId = extractDriveFolderId(dl.url);
            if (fId) {
              try {
                DriveApp.getFolderById(fId).addViewer(cEmail);
              } catch (e) {}
            }
            sharedLinks.push({
              title: dl.title,
              url: dl.url
            });
          });
        }
        
        // 1. Kirim Panduan Instalasi & Akses Google Drive ke Gmail Customer
        sendCustomerReceiptEmail(cEmail, cName, ord, sharedLinks);
      }
      
      // 2. Kirim Notifikasi Laporan Hasil Penjualan ke Gmail Admin
      if (aEmail && aEmail.indexOf("@") !== -1) {
        sendAdminSaleNotification(aEmail, ord);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Email transaksi otomatis berhasil dikirim!",
        customerEmail: cEmail,
        adminEmail: aEmail
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ------------------------------------------------------------------------
    // B. Uji Coba Pengiriman Email Tes Langsung dari Admin Settings
    // ------------------------------------------------------------------------
    if (action === "test_email") {
      var testTo = params.to || params.adminEmail || "aliansistoreofficial@gmail.com";
      GmailApp.sendEmail(testTo, "[ALIANSI STORE] Integrasi Otomasi Email Berhasil!", 
        "Halo Admin!\n\nWebhook Google Apps Script untuk ALIANSI STORE telah aktif dan siap digunakan.\n\nSetiap transaksi lunas kini akan otomatis mengirimkan faktur resmi ke pembeli dan salinan laporan penjualan ke admin toko.\n\nSalam,\nTim ALIANSI STORE");
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Email tes berhasil dikirim ke " + testTo
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ------------------------------------------------------------------------
    // C. Notifikasi Webhook IPN dari Duitku Payment Gateway
    // ------------------------------------------------------------------------
    var merchantCode = params.merchantCode || "";
    var amount = params.amount || "";
    var merchantOrderId = params.merchantOrderId || "";
    var signature = params.signature || "";
    var resultCode = params.resultCode || "";
    var reference = params.reference || "";
    
    if (merchantOrderId && signature) {
      Logger.log("Incoming Duitku Webhook: OrderID=" + merchantOrderId + ", Amount=" + amount + ", ResultCode=" + resultCode);
      
      // 1. Verifikasi Signature: MD5(merchantCode + amount + merchantOrderId + apiKey)
      var rawSig = CONFIG.DUITKU_MERCHANT_CODE + amount + merchantOrderId + CONFIG.DUITKU_API_KEY;
      var expectedSig = computeMD5(rawSig);
      
      if (signature.toLowerCase() !== expectedSig.toLowerCase()) {
        Logger.log("Signature MISMATCH! Received: " + signature + ", Expected: " + expectedSig);
        return ContentService.createTextOutput("Bad Signature").setMimeType(ContentService.MimeType.TEXT);
      }
      
      // 2. Cek apakah transaksi Sukses (resultCode == "00")
      if (resultCode !== "00") {
        Logger.log("Payment not successful. ResultCode: " + resultCode);
        return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
      }
      
      // 3. Ambil data pesanan dari Supabase
      var order = fetchOrderFromSupabase(merchantOrderId);
      if (!order) {
        Logger.log("Order ID " + merchantOrderId + " tidak ditemukan di Supabase!");
        return ContentService.createTextOutput("Order Not Found").setMimeType(ContentService.MimeType.TEXT);
      }
      
      // Cek jika pesanan sudah diproses sebelumnya (idempotency)
      if (order.payment_status === "PAID" && order.status === "COMPLETED") {
        Logger.log("Order " + merchantOrderId + " sudah berstatus PAID sebelumnya.");
        return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
      }
      
      var customerEmail = (order.customer_email || "").trim();
      var customerName = order.customer_name || "Pelanggan Setia";
      var orderItems = Array.isArray(order.items) ? order.items : [];
      
      // 4. Bagikan Folder Google Drive ke Email Pembeli (Otomatis ambil link terbaru dari Produk!)
      var sharedLinksDuitku = [];
      if (customerEmail && customerEmail.indexOf("@") !== -1) {
        orderItems.forEach(function(item) {
          var prodId = item.productId || item.id || "";
          var liveDbLink = fetchProductDriveLinkFromSupabase(prodId, item.title);
          var rawLink = liveDbLink || item.driveLink || (item.images && item.images.driveLink) || "";
          var folderId = extractDriveFolderId(rawLink) || GDRIVE_FOLDER_MAP[prodId] || GDRIVE_FOLDER_MAP["default"];
          
          if (folderId && folderId.indexOf("1ABCxyz") === -1) {
            try {
              var folder = DriveApp.getFolderById(folderId);
              folder.addViewer(customerEmail);
            } catch (driveErr) {
              Logger.log("Gagal share folder " + folderId + ": " + driveErr.message);
            }
          }
          var folderUrl = rawLink || ("https://drive.google.com/drive/folders/" + (folderId || ""));
          sharedLinksDuitku.push({
            gameId: prodId,
            title: item.title,
            folderId: folderId,
            url: folderUrl
          });
        });
        
        // 5. Kirim Email Konfirmasi Resmi ke Pembeli & Laporan ke Admin
        sendCustomerReceiptEmail(customerEmail, customerName, order, sharedLinksDuitku);
        sendAdminSaleNotification("aliansistoreofficial@gmail.com", order);
      }
      
      // 6. Update Status Pesanan di Supabase menjadi PAID & COMPLETED
      updateOrderInSupabase(merchantOrderId, {
        payment_status: "PAID",
        status: "COMPLETED",
        fulfillment: {
          gdrive_shared: sharedLinksDuitku.length > 0,
          shared_at: new Date().toISOString(),
          customer_email: customerEmail,
          drive_links: sharedLinksDuitku,
          duitku_reference: reference
        }
      });
      
      Logger.log("Order " + merchantOrderId + " berhasil diselesaikan otomatis!");
      return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "ignored", message: "No actionable parameter" })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    Logger.log("Error in doPost: " + err.message);
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper: Ambil data order dari REST API Supabase
 */
function fetchOrderFromSupabase(orderId) {
  var url = CONFIG.SUPABASE_URL + "/rest/v1/orders?id=eq." + encodeURIComponent(orderId) + "&select=*";
  var options = {
    method: "get",
    headers: {
      "apikey": CONFIG.SUPABASE_KEY,
      "Authorization": "Bearer " + CONFIG.SUPABASE_KEY
    },
    muteHttpExceptions: true
  };
  
  var res = UrlFetchApp.fetch(url, options);
  if (res.getResponseCode() === 200) {
    var arr = JSON.parse(res.getContentText());
    if (arr && arr.length > 0) return arr[0];
  }
  return null;
}

/**
 * Helper: Ambil Link Google Drive TERBARU langsung dari tabel products di Supabase
 * Sehingga jika Admin mengganti link GDrive pada produk di Website, script ini
 * OTOMATIS membaca link baru tersebut tanpa perlu diedit lagi!
 */
function fetchProductDriveLinkFromSupabase(productId, productTitle) {
  try {
    var url = CONFIG.SUPABASE_URL + "/rest/v1/products?select=id,title,images";
    if (productId) {
      url += "&id=eq." + encodeURIComponent(productId);
    } else if (productTitle) {
      url += "&title=eq." + encodeURIComponent(productTitle);
    } else {
      return "";
    }
    var options = {
      method: "get",
      headers: {
        "apikey": CONFIG.SUPABASE_KEY,
        "Authorization": "Bearer " + CONFIG.SUPABASE_KEY
      },
      muteHttpExceptions: true
    };
    var res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200) {
      var arr = JSON.parse(res.getContentText());
      if (arr && arr.length > 0) {
        var prod = arr[0];
        if (prod.images && prod.images.driveLink) {
          return String(prod.images.driveLink).trim();
        }
      }
    }
  } catch (e) {
    Logger.log("fetchProductDriveLinkFromSupabase notice: " + e.message);
  }
  return "";
}

/**
 * Helper: Update status order di Supabase
 */
function updateOrderInSupabase(orderId, updateData) {
  var url = CONFIG.SUPABASE_URL + "/rest/v1/orders?id=eq." + encodeURIComponent(orderId);
  var options = {
    method: "patch",
    headers: {
      "apikey": CONFIG.SUPABASE_KEY,
      "Authorization": "Bearer " + CONFIG.SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    payload: JSON.stringify(updateData),
    muteHttpExceptions: true
  };
  
  var res = UrlFetchApp.fetch(url, options);
  return res.getResponseCode();
}

/**
 * Helper: Kirim Email HTML Panduan Instalasi & Akses Google Drive ke Pembeli
 */
function sendCustomerReceiptEmail(toEmail, customerName, order, sharedLinks) {
  try {
    var subject = "[ALIANSI STORE] Panduan Instalasi & Akses Google Drive Game (" + order.id + ")";
    
    var fulfill = order.fulfillment || {};
    var guideUrl = fulfill.guideUrl || order.guideUrl || "https://aliansistore.com/panduan-install-pkg-ps4-hen";
    var adminNotes = fulfill.adminNotes || order.adminNotes || "";

    var linksHtml = "";
    if (sharedLinks.length > 0) {
      linksHtml = sharedLinks.map(function(link) {
        return '<div style="background:#0f172a; border:1px solid #0284c7; border-radius:12px; padding:16px; margin-bottom:12px;">' +
          '<h3 style="color:#38bdf8; margin:0 0 8px 0; font-size:15px;">🎮 ' + link.title + '</h3>' +
          '<p style="color:#94a3b8; font-size:13px; margin:0 0 12px 0;">Folder Google Drive telah dibagikan dengan hak akses Viewer ke email <b>' + toEmail + '</b>.</p>' +
          '<a href="' + link.url + '" target="_blank" style="display:inline-block; background:#0284c7; color:#ffffff; font-weight:bold; font-size:13px; padding:10px 18px; border-radius:8px; text-decoration:none;">Buka Folder Google Drive &raquo;</a>' +
        '</div>';
      }).join("");
    } else {
      linksHtml = '<p style="color:#94a3b8; font-size:13px;">Folder game Google Drive telah disiapkan. Pastikan login ke Google Drive dengan email <b>' + toEmail + '</b> pada menu "Dibagikan dengan saya".</p>';
    }
    
    var notesHtml = "";
    if (adminNotes) {
      notesHtml = '<div style="background:#052e16; border:1px solid #16a34a; border-radius:10px; padding:14px; margin:20px 0;">' +
        '<strong style="color:#4ade80; font-size:13px; display:block; margin-bottom:6px;">📌 Catatan & Instruksi Khusus:</strong>' +
        '<p style="color:#dcfce7; font-size:13px; line-height:1.6; margin:0; white-space:pre-line;">' + adminNotes + '</p>' +
      '</div>';
    }

    var htmlBody = '<!DOCTYPE html>' +
      '<html><body style="font-family:Arial,sans-serif; background:#020617; color:#e2e8f0; margin:0; padding:25px;">' +
      '<div style="max-width:600px; margin:auto; background:#0b1329; border:1px solid #1e293b; border-radius:16px; padding:30px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">' +
        '<div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #1e293b;">' +
          '<h1 style="color:#38bdf8; margin:0; font-size:24px; letter-spacing:1px;">⚡ ALIANSI STORE</h1>' +
          '<p style="color:#64748b; font-size:12px; margin:5px 0 0 0;">Spesialis Game PS4 HEN & Subtitle Indonesia</p>' +
        '</div>' +
        '<div style="padding:20px 0;">' +
          '<h2 style="color:#22c55e; font-size:18px; margin:0 0 10px 0;">✓ AKSES GOOGLE DRIVE & PANDUAN INSTALASI</h2>' +
          '<p style="color:#cbd5e1; font-size:14px; line-height:1.6;">Halo <b>' + customerName + '</b>, pesanan Anda untuk No. Invoice <b>' + order.id + '</b> telah selesai diproses. Hak akses Google Drive telah dibuka dan panduan instalasi dapat Anda simak di bawah ini:</p>' +
          '<h3 style="color:#f8fafc; font-size:15px; margin:25px 0 12px 0;">📂 Link Download Game (.PKG via Google Drive):</h3>' +
          linksHtml +
          notesHtml +
          '<div style="background:#020617; border-left:4px solid #38bdf8; padding:15px; border-radius:8px; margin:20px 0;">' +
            '<h4 style="color:#38bdf8; margin:0 0 8px 0; font-size:13px;">💡 Panduan Langkah Instalasi Game PS4 HEN:</h4>' +
            '<ol style="color:#94a3b8; font-size:12px; margin:0; padding-left:18px; line-height:1.8;">' +
              '<li>Buka link folder di atas, pastikan login menggunakan Gmail <b>' + toEmail + '</b>.</li>' +
              '<li>Download seluruh file part game (.PKG) dan file subtitle Indonesia.</li>' +
              '<li>Pindahkan file ke Flashdisk atau Harddisk Eksternal dengan format sistem file <b>exFAT</b>.</li>' +
              '<li>Tancapkan ke port USB konsol PS4 HEN, lalu aktifkan GoldHEN / HEN.</li>' +
              '<li>Buka menu <b>GoldHEN &gt; Package Installer</b> di konsol PS4, lalu install file game dan update patch secara berurutan.</li>' +
            '</ol>' +
          '</div>' +
          '<div style="text-align:center; margin:25px 0 15px 0;">' +
            '<a href="' + guideUrl + '" target="_blank" style="display:inline-block; background:#10b981; color:#ffffff; font-weight:bold; font-size:13px; padding:12px 24px; border-radius:10px; text-decoration:none; box-shadow:0 4px 15px rgba(16,185,129,0.3);">' +
              '📖 Buka Halaman Panduan Lengkap & Setup &raquo;' +
            '</a>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:center; padding-top:20px; border-top:1px solid #1e293b; color:#475569; font-size:11px;">' +
          '&copy; ' + new Date().getFullYear() + ' ALIANSI STORE. All rights reserved. (Email Resmi No-Reply)' +
        '</div>' +
      '</div>' +
      '</body></html>';
      
    GmailApp.sendEmail(toEmail, subject, "Panduan instalasi dan akses Google Drive game untuk order " + order.id + ". Buka email ini dalam format HTML untuk melihat link Google Drive game Anda.", {
      name: CONFIG.STORE_NAME,
      htmlBody: htmlBody
    });
    Logger.log("Email panduan berhasil dikirim ke " + toEmail);
  } catch (emailErr) {
    Logger.log("Gagal mengirim email ke " + toEmail + ": " + emailErr.message);
  }
}

/**
 * Helper: Kirim Notifikasi Laporan Hasil Penjualan ke Admin Toko
 */
function sendAdminSaleNotification(adminEmail, order) {
  try {
    var subject = "[ALIANSI STORE - LAPORAN PENJUALAN] Transaksi Lunas #" + order.id + " (" + (order.customerName || "Pelanggan") + ") - Rp " + Number(order.total || 0).toLocaleString('id-ID');
    
    var itemsList = (order.items || []).map(function(item) {
      return '<li style="margin-bottom:6px;"><b>' + item.title + '</b> (' + (item.variant || "Standard") + ') - Rp ' + Number(item.unitPrice || 0).toLocaleString('id-ID') + '</li>';
    }).join("");

    var htmlBody = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif; background:#070d1e; color:#f8fafc; margin:0; padding:20px;">' +
      '<div style="max-width:560px; margin:auto; background:#0b1329; border:1px solid #1e293b; border-radius:14px; padding:25px; box-shadow:0 8px 24px rgba(0,0,0,0.5);">' +
        '<div style="border-bottom:1px solid #1e293b; padding-bottom:15px; margin-bottom:15px;">' +
          '<h2 style="color:#38bdf8; margin:0 0 5px 0; font-size:20px;">⚡ LAPORAN PENJUALAN MASUK</h2>' +
          '<span style="background:#064e3b; color:#34d399; font-size:11px; font-weight:bold; padding:3px 8px; border-radius:6px; border:1px solid #059669;">TRANSAKSI LUNAS (PAID)</span>' +
        '</div>' +
        '<p style="color:#cbd5e1; font-size:13px; line-height:1.6;">Halo Admin ' + CONFIG.STORE_NAME + ', pesanan berikut telah berhasil diselesaikan:</p>' +
        '<table style="width:100%; border-collapse:collapse; font-size:13px; margin:16px 0; background:#0f172a; border-radius:8px; overflow:hidden;">' +
          '<tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 14px; color:#94a3b8; width:130px;">No. Invoice:</td><td style="padding:10px 14px; font-weight:bold; color:#38bdf8;">' + order.id + '</td></tr>' +
          '<tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 14px; color:#94a3b8;">Nama Pembeli:</td><td style="padding:10px 14px; font-weight:bold; color:#ffffff;">' + (order.customerName || "-") + '</td></tr>' +
          '<tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 14px; color:#94a3b8;">Email Pembeli:</td><td style="padding:10px 14px; color:#38bdf8;">' + (order.customerEmail || "-") + '</td></tr>' +
          '<tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 14px; color:#94a3b8;">WhatsApp:</td><td style="padding:10px 14px; color:#4ade80;">' + (order.customerPhone || "-") + '</td></tr>' +
          '<tr style="border-bottom:1px solid #1e293b;"><td style="padding:10px 14px; color:#94a3b8;">Metode Bayar:</td><td style="padding:10px 14px; font-weight:bold; color:#f8fafc;">' + (order.paymentMethod || "QRIS").toUpperCase() + '</td></tr>' +
          '<tr><td style="padding:10px 14px; color:#94a3b8;">Total Omset:</td><td style="padding:10px 14px; font-size:16px; font-weight:black; color:#22c55e;">Rp ' + Number(order.total || 0).toLocaleString('id-ID') + '</td></tr>' +
        '</table>' +
        '<h4 style="color:#f8fafc; font-size:14px; margin:18px 0 8px 0;">🎮 Daftar Game Dipesan:</h4>' +
        '<ul style="color:#cbd5e1; font-size:13px; padding-left:22px; line-height:1.7;">' + itemsList + '</ul>' +
        '<div style="text-align:center; padding-top:16px; margin-top:20px; border-top:1px solid #1e293b; color:#64748b; font-size:11px;">' +
          'Sistem Otomasi Notifikasi &bull; ' + CONFIG.STORE_NAME +
        '</div>' +
      '</div>' +
    '</body></html>';

    GmailApp.sendEmail(adminEmail, subject, "Laporan penjualan pesanan #" + order.id + " senilai Rp " + Number(order.total || 0).toLocaleString('id-ID'), {
      name: CONFIG.STORE_NAME,
      htmlBody: htmlBody
    });
    Logger.log("Laporan penjualan berhasil dikirim ke admin: " + adminEmail);
  } catch (err) {
    Logger.log("Gagal mengirim laporan penjualan ke admin: " + err.message);
  }
}

/**
 * Helper: Menghitung MD5 Hash
 */
function computeMD5(str) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, str, Utilities.Charset.UTF_8);
  var txtHash = "";
  for (var i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) hashVal += 256;
    var byteString = hashVal.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    txtHash += byteString;
  }
  return txtHash;
}

/**
 * UJI COBA MANUAL (Jalankan fungsi ini di Editor Apps Script untuk tes share folder ke email Anda!)
 */
function testManualShare() {
  var testEmail = Session.getActiveUser().getEmail();
  Logger.log("Testing share ke email: " + testEmail);
  
  // Masukkan folder ID Anda yang asli untuk tes
  var sampleFolderId = GDRIVE_FOLDER_MAP["default"];
  if (sampleFolderId && sampleFolderId.indexOf("1ABCxyz") === -1) {
    var folder = DriveApp.getFolderById(sampleFolderId);
    folder.addViewer(testEmail);
    Logger.log("BERHASIL! Folder telah dishare ke " + testEmail);
  } else {
    Logger.log("Silakan masukkan Folder ID asli Anda di GDRIVE_FOLDER_MAP terlebih dahulu.");
  }
}
