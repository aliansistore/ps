/**
 * ============================================================================
 * ALIANSI STORE - Google Apps Script Webhook (Auto-Share Google Drive & Email)
 * ============================================================================
 * 
 * CARA PAKAI:
 * 1. Buka https://script.google.com/ lalu klik "Project Baru" (New Project).
 * 2. Hapus semua kode default, lalu Paste seluruh isi file ini.
 * 3. Isi ID Folder Google Drive Anda di bagian "GDRIVE_FOLDER_MAP" di bawah.
 * 4. Klik "Deploy" (Terapkan) di kanan atas > "Deployment baru" (New deployment).
 * 5. Pilih jenis: "Aplikasi Web" (Web app).
 * 6. Konfigurasi:
 *    - Deskripsi: Aliansi Store Duitku Webhook
 *    - Jalankan sebagai: Saya (email Anda)
 *    - Yang memiliki akses: Siapa saja (Anyone) -> SANGAT PENTING agar Duitku bisa kirim notifikasi!
 * 7. Klik "Deploy", beri izin (Grant Access), lalu Salin URL Aplikasi Web yang diberikan:
 *    Contoh: https://script.google.com/macros/s/AKfycb.../exec
 * 8. Masukkan URL tersebut ke Dashboard Duitku > Proyek Anda > Callback URL
 *    (atau otomatis dikirim oleh website Aliansi Store).
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

// 2. MAPPING FOLDER GOOGLE DRIVE PER GAME
// Cara ambil ID folder: Buka folder di drive.google.com, salin kode setelah "/folders/..."
// Contoh URL: https://drive.google.com/drive/folders/1ABCxyz123_456
// Maka ID-nya adalah: 1ABCxyz123_456
var GDRIVE_FOLDER_MAP = {
  // Ganti nilai di bawah ini dengan ID folder Google Drive game Anda masing-masing:
  "game-re4-subindo": "1ABCxyz_RE4_REMAKE_FOLDER_ID",
  "game-gta5-subindo": "1ABCxyz_GTA_V_FOLDER_ID",
  "game-gow-ragnarok-subindo": "1ABCxyz_GOW_RAGNAROK_FOLDER_ID",
  "game-pes-2025-subindo": "1ABCxyz_PES_2025_FOLDER_ID",
  "game-tlou-part1-subindo": "1ABCxyz_TLOU_FOLDER_ID",
  "game-rdr2-subindo": "1ABCxyz_RDR2_FOLDER_ID",
  "game-ghost-tsushima-subindo": "1ABCxyz_GHOST_TSUSHIMA_FOLDER_ID",
  "game-fc25-ps4": "1ABCxyz_FC25_FOLDER_ID",
  "game-wukong-ps5": "1ABCxyz_WUKONG_FOLDER_ID",
  
  // FOLDER DEFAULT / UTAMA (Jika game belum punya folder khusus, folder ini yang dibagikan)
  "default": "1ABCxyz_DEFAULT_MASTER_FOLDER_ID"
};

/**
 * Handle HTTP GET - Untuk uji coba / health check browser
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "ALIANSI STORE Payment & Drive Automation Webhook",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST - Menerima Notifikasi Webhook dari Duitku
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Kunci proses 10 detik agar tidak double process jika Duitku retry
    lock.waitLock(10000);
    
    // Parse data dari Duitku (Mendukung Form-URLEncoded dan JSON)
    var params = {};
    if (e.parameter && e.parameter.merchantOrderId) {
      params = e.parameter;
    } else if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter || {};
      }
    }
    
    var merchantCode = params.merchantCode || "";
    var amount = params.amount || "";
    var merchantOrderId = params.merchantOrderId || "";
    var signature = params.signature || "";
    var resultCode = params.resultCode || "";
    var reference = params.reference || "";
    
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
    var items = Array.isArray(order.items) ? order.items : [];
    
    // 4. Bagikan Folder Google Drive ke Email Pembeli
    var sharedLinks = [];
    if (customerEmail && customerEmail.indexOf("@") !== -1) {
      items.forEach(function(item) {
        var folderId = GDRIVE_FOLDER_MAP[item.id] || GDRIVE_FOLDER_MAP["default"];
        
        // Jangan share jika masih pakai template dummy ID
        if (folderId && folderId.indexOf("1ABCxyz") === -1) {
          try {
            var folder = DriveApp.getFolderById(folderId);
            folder.addViewer(customerEmail);
            var folderUrl = "https://drive.google.com/drive/folders/" + folderId;
            sharedLinks.push({
              gameId: item.id,
              title: item.title,
              folderId: folderId,
              url: folderUrl
            });
            Logger.log("Berhasil share folder " + item.title + " ke " + customerEmail);
          } catch (driveErr) {
            Logger.log("Gagal share folder " + folderId + ": " + driveErr.message);
          }
        }
      });
      
      // 5. Kirim Email Konfirmasi Resmi ke Pembeli
      sendCustomerReceiptEmail(customerEmail, customerName, order, sharedLinks);
    }
    
    // 6. Update Status Pesanan di Supabase menjadi PAID & COMPLETED
    updateOrderInSupabase(merchantOrderId, {
      payment_status: "PAID",
      status: "COMPLETED",
      fulfillment: {
        gdrive_shared: sharedLinks.length > 0,
        shared_at: new Date().toISOString(),
        customer_email: customerEmail,
        drive_links: sharedLinks,
        duitku_reference: reference
      }
    });
    
    Logger.log("Order " + merchantOrderId + " berhasil diselesaikan otomatis!");
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
    
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
 * Helper: Kirim Email HTML Resmi ke Pembeli
 */
function sendCustomerReceiptEmail(toEmail, customerName, order, sharedLinks) {
  try {
    var subject = "[ALIANSI STORE] Pembayaran Berhasil! Akses Google Drive Game Anda Telah Aktif (" + order.id + ")";
    
    var linksHtml = "";
    if (sharedLinks.length > 0) {
      linksHtml = sharedLinks.map(function(link) {
        return '<div style="background:#0f172a; border:1px solid #0284c7; border-radius:10px; padding:15px; margin-bottom:12px;">' +
          '<h3 style="color:#38bdf8; margin:0 0 8px 0; font-size:16px;">🎮 ' + link.title + '</h3>' +
          '<p style="color:#94a3b8; font-size:13px; margin:0 0 12px 0;">Folder Google Drive telah dibagikan dengan hak akses Viewer ke email <b>' + toEmail + '</b>.</p>' +
          '<a href="' + link.url + '" target="_blank" style="display:inline-block; background:#0284c7; color:#ffffff; font-weight:bold; font-size:13px; padding:10px 18px; border-radius:8px; text-decoration:none;">Buka Folder Google Drive &raquo;</a>' +
        '</div>';
      }).join("");
    } else {
      linksHtml = '<p style="color:#94a3b8; font-size:13px;">Admin kami sedang menyiapkan file game khusus untuk pesanan Anda. Hubungi kami via WhatsApp jika ada kendala.</p>';
    }
    
    var htmlBody = '<!DOCTYPE html>' +
      '<html><body style="font-family:Arial,sans-serif; background:#020617; color:#e2e8f0; margin:0; padding:25px;">' +
      '<div style="max-width:600px; margin:auto; background:#0b1329; border:1px solid #1e293b; border-radius:16px; padding:30px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">' +
        '<div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #1e293b;">' +
          '<h1 style="color:#38bdf8; margin:0; font-size:24px; letter-spacing:1px;">⚡ ALIANSI STORE</h1>' +
          '<p style="color:#64748b; font-size:12px; margin:5px 0 0 0;">PlayStation Game Marketplace & Digital Software</p>' +
        '</div>' +
        '<div style="padding:20px 0;">' +
          '<h2 style="color:#22c55e; font-size:18px; margin:0 0 10px 0;">✓ PEMBAYARAN LUNAS TERVERIFIKASI</h2>' +
          '<p style="color:#cbd5e1; font-size:14px; line-height:1.6;">Halo <b>' + customerName + '</b>, terima kasih telah berbelanja di ALIANSI STORE. Pembayaran untuk pesanan <b>' + order.id + '</b> sebesar <b>Rp ' + Number(order.total).toLocaleString('id-ID') + '</b> telah kami terima.</p>' +
          '<h3 style="color:#f8fafc; font-size:15px; margin:25px 0 12px 0;">📂 Akses File Game Google Drive Anda:</h3>' +
          linksHtml +
          '<div style="background:#020617; border-left:4px solid #38bdf8; padding:14px; border-radius:6px; margin:25px 0 15px 0;">' +
            '<h4 style="color:#38bdf8; margin:0 0 6px 0; font-size:13px;">💡 Panduan Singkat Download & Instalasi:</h4>' +
            '<ol style="color:#94a3b8; font-size:12px; margin:0; padding-left:18px; line-height:1.7;">' +
              '<li>Buka link folder di atas, pastikan login menggunakan Gmail <b>' + toEmail + '</b>.</li>' +
              '<li>Download semua part file .PKG game ke PC/Laptop atau Flashdisk/HDD External format exFAT.</li>' +
              '<li>Tancapkan Flashdisk ke PS4, masuk ke menu <b>GoldHEN / HEN &gt; Package Installer</b>.</li>' +
              '<li>Install file game secara berurutan (Base Game &gt; Update Sub Indo &gt; DLC).</li>' +
            '</ol>' +
          '</div>' +
          '<p style="color:#64748b; font-size:12px; text-align:center; margin-top:30px;">Butuh bantuan instalasi? Hubungi WhatsApp CS kami di: <b style="color:#38bdf8;">+' + CONFIG.WHATSAPP_CS + '</b></p>' +
        '</div>' +
        '<div style="text-align:center; padding-top:20px; border-top:1px solid #1e293b; color:#475569; font-size:11px;">' +
          '&copy; ' + new Date().getFullYear() + ' ALIANSI STORE. All rights reserved.' +
        '</div>' +
      '</div>' +
      '</body></html>';
      
    GmailApp.sendEmail(toEmail, subject, "Pembayaran berhasil untuk order " + order.id + ". Buka email ini dalam format HTML untuk melihat link Google Drive game Anda.", {
      name: CONFIG.STORE_NAME,
      htmlBody: htmlBody
    });
    Logger.log("Email konfirmasi berhasil dikirim ke " + toEmail);
  } catch (emailErr) {
    Logger.log("Gagal mengirim email ke " + toEmail + ": " + emailErr.message);
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
