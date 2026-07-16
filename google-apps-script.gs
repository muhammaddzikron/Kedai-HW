/**
 * KEDAI KEPANDUAN - GOOGLE APPS SCRIPT INTEGRATION (Code.gs)
 * ------------------------------------------------------------------
 * Skrip ini dipasang di Google Apps Script (Extensions -> Apps Script)
 * pada Google Spreadsheet Anda untuk memfasilitasi integrasi dua arah.
 * 
 * Fitur:
 * 1. Membuat Menu Kustom di Google Sheets untuk sinkronisasi.
 * 2. Menyediakan API Endpoint (doGet) untuk menarik data produk/pelanggan ke Aplikasi.
 * 3. Menyediakan API Endpoint (doPost) untuk menyimpan/menghapus/mengedit data secara real-time.
 */

// Konfigurasi Header Kolom sesuai template data user
var PRODUCT_HEADERS = [
  "Gambar produk",
  "Tindakan",
  "Produk",
  "Lokasi Bisnis",
  "Harga Pembelian Satuan",
  "Harga penjualan",
  "Stok saat ini",
  "Jenis Produk",
  "Kategori",
  "Merek",
  "Pajak",
  "SKU"
];

var CUSTOMER_HEADERS = [
  "ID Pelanggan",
  "Nama",
  "Telepon",
  "Email",
  "Grup",
  "Tingkatan",
  "Poin Reward",
  "Saldo Cashback",
  "Alamat",
  "Tanggal Terdaftar"
];

/**
 * 1. TRIGGER ON OPEN: Membuat menu kustom saat spreadsheet dibuka
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Kedai Kepanduan Sync')
      .addItem('Inisialisasi Semua Sheet', 'initializeAllSheets')
      .addSeparator()
      .addItem('Sinkronkan Data Baru', 'syncConfirmation')
      .addToUi();
}

/**
 * Membuat baris header secara otomatis jika belum ada
 */
function initializeAllSheets() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreateSheet(spreadsheet, "Produk", PRODUCT_HEADERS);
  getOrCreateSheet(spreadsheet, "Pelanggan", CUSTOMER_HEADERS);
  SpreadsheetApp.getUi().alert("Inisialisasi Sukses: Sheet 'Produk' dan 'Pelanggan' berhasil disiapkan dengan struktur yang benar.");
}

function syncConfirmation() {
  SpreadsheetApp.getUi().alert(
    "Informasi Sinkronisasi", 
    "Data Google Sheet Anda sekarang aktif dan dapat diakses oleh sistem e-commerce secara langsung melalui URL Spreadsheet publik (Anyone with Link can view).\n\nSilakan klik tombol 'Sinkronkan Sheets' di dalam dashboard manajemen produk aplikasi Anda untuk menarik perubahan terbaru.", 
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Helper untuk membuat atau mengambil sheet
 */
function getOrCreateSheet(spreadsheet, name, headers) {
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e0f2fe");
  }
  return sheet;
}

/**
 * Helper untuk membuat respon JSON dengan CORS header
 */
function createJSONResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2. API ENDPOINT GET: Mengembalikan data dari Spreadsheet dalam format JSON
 * Mendukung parameter: type = "produk" atau "pelanggan"
 */
function doGet(e) {
  try {
    var type = (e && e.parameter && e.parameter.type) || "produk";
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet;
    
    if (type === "pelanggan" || type === "customers") {
      sheet = getOrCreateSheet(spreadsheet, "Pelanggan", CUSTOMER_HEADERS);
    } else {
      sheet = getOrCreateSheet(spreadsheet, "Produk", PRODUCT_HEADERS);
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return createJSONResponse({
        status: "success",
        message: "Sheet kosong",
        data: []
      });
    }
    
    var headers = data[0];
    var jsonArray = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var record = {};
      for (var j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j];
      }
      jsonArray.push(record);
    }
    
    return createJSONResponse({
      status: "success",
      count: jsonArray.length,
      data: jsonArray
    });
    
  } catch (err) {
    return createJSONResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * 3. API ENDPOINT POST: Menerima aksi (sync_all, add, delete, edit) dari Aplikasi
 */
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // --- AKSI 1: Sinkronisasi Massal Semua Produk ---
    if (postData.action === "sync_all_products" && Array.isArray(postData.products)) {
      var sheet = getOrCreateSheet(spreadsheet, "Produk", PRODUCT_HEADERS);
      
      // Hapus semua data lama (baris 2 ke bawah)
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      
      // Masukkan semua data produk baru
      postData.products.forEach(function(product) {
        var newRow = [];
        newRow.push(product.image || "");               // Gambar produk
        newRow.push("TindakanToggle");                   // Tindakan
        newRow.push(product.name || "");                // Produk
        newRow.push(product.brand || "Kedai HW");       // Lokasi Bisnis
        newRow.push(product.costPrice || 0);            // Harga Pembelian Satuan
        newRow.push(product.sellingPrice || 0);         // Harga penjualan
        newRow.push((product.stock || 0) + " Pieces");  // Stok saat ini
        newRow.push("Tunggal");                          // Jenis Produk
        newRow.push(product.category || "Atribut HW");  // Kategori
        newRow.push(product.brand || "Kedai HW");       // Merek
        newRow.push("");                                 // Pajak
        newRow.push(product.sku || "");                 // SKU
        sheet.appendRow(newRow);
      });
      
      return createJSONResponse({
        status: "success",
        message: "Berhasil menyinkronkan " + postData.products.length + " produk ke Google Sheets!"
      });
    }
    
    // --- AKSI 2: Sinkronisasi Massal Semua Pelanggan ---
    if (postData.action === "sync_all_customers" && Array.isArray(postData.customers)) {
      var sheet = getOrCreateSheet(spreadsheet, "Pelanggan", CUSTOMER_HEADERS);
      
      // Hapus semua data lama (baris 2 ke bawah)
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      
      // Masukkan semua data pelanggan baru
      postData.customers.forEach(function(customer) {
        var newRow = [];
        newRow.push(customer.customId || customer.id);  // ID Pelanggan
        newRow.push(customer.name || "");               // Nama
        newRow.push(customer.phone || "");              // Telepon
        newRow.push(customer.email || "");              // Email
        newRow.push(customer.group || "RETAIL");        // Grup
        newRow.push(customer.tier || "SILVER");         // Tingkatan
        newRow.push(customer.membershipPoints || 0);    // Poin Reward
        newRow.push(customer.cashbackBalance || 0);     // Saldo Cashback
        newRow.push(customer.address || "");            // Alamat
        newRow.push(customer.createdAt || "");          // Tanggal Terdaftar
        sheet.appendRow(newRow);
      });
      
      return createJSONResponse({
        status: "success",
        message: "Berhasil menyinkronkan " + postData.customers.length + " pelanggan ke Google Sheets!"
      });
    }
    
    // --- DEFAULT LEGACY BEHAVIOR: Tambah Produk Tunggal ---
    var sheet = getOrCreateSheet(spreadsheet, "Produk", PRODUCT_HEADERS);
    var newRow = [];
    newRow.push(postData.image || "");               // Gambar produk
    newRow.push("TindakanToggle");                   // Tindakan
    newRow.push(postData.name || "");                // Produk
    newRow.push(postData.brand || "Kedai HW");       // Lokasi Bisnis
    newRow.push(postData.costPrice || 0);            // Harga Pembelian Satuan
    newRow.push(postData.sellingPrice || 0);         // Harga penjualan
    newRow.push((postData.stock || 0) + " Pieces");  // Stok saat ini
    newRow.push("Tunggal");                          // Jenis Produk
    newRow.push(postData.category || "Atribut HW");  // Kategori
    newRow.push(postData.brand || "Kedai HW");       // Merek
    newRow.push("");                                 // Pajak
    newRow.push(postData.sku || "");                 // SKU
    
    sheet.appendRow(newRow);
    
    return createJSONResponse({
      status: "success",
      message: "Produk '" + postData.name + "' berhasil ditambahkan ke Spreadsheet!"
    });
    
  } catch (err) {
    return createJSONResponse({
      status: "error",
      message: err.toString()
    });
  }
}
