/**
 * KEDAI KEPANDUAN - GOOGLE APPS SCRIPT INTEGRATION (Code.gs)
 * ------------------------------------------------------------------
 * Skrip ini dipasang di Google Apps Script (Extensions -> Apps Script)
 * pada Google Spreadsheet Anda untuk memfasilitasi integrasi dua arah.
 * 
 * Fitur:
 * 1. Membuat Menu Kustom di Google Sheets untuk sinkronisasi.
 * 2. Menyediakan API Endpoint (doGet) untuk menarik data produk ke Aplikasi.
 * 3. Menyediakan API Endpoint (doPost) untuk menyimpan produk baru dari Aplikasi.
 */

// Konfigurasi Header Kolom sesuai template data user
var HEADERS = [
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

/**
 * 1. TRIGGER ON OPEN: Membuat menu kustom saat spreadsheet dibuka
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Kedai Kepanduan Sync')
      .addItem('Inisialisasi Header Kolom', 'initializeSheetHeaders')
      .addSeparator()
      .addItem('Sinkronkan Data Produk Baru', 'syncConfirmation')
      .addToUi();
}

/**
 * Membuat baris header secara otomatis jika kosong
 */
function initializeSheetHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Pastikan baris pertama berisi header kolom yang tepat
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#e0f2fe");
    SpreadsheetApp.getUi().alert("Inisialisasi Sukses: Header kolom Kedai Kepanduan berhasil dibuat.");
  } else {
    var response = SpreadsheetApp.getUi().alert(
      "Konfirmasi", 
      "Sheet sudah memiliki isi. Apakah Anda ingin menimpa baris pertama dengan format header Kedai Kepanduan?", 
      SpreadsheetApp.getUi().ButtonSet.YES_NO
    );
    if (response == SpreadsheetApp.getUi().Button.YES) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#e0f2fe");
      SpreadsheetApp.getUi().alert("Header berhasil diperbarui.");
    }
  }
}

function syncConfirmation() {
  SpreadsheetApp.getUi().alert(
    "Informasi Sinkronisasi", 
    "Data Google Sheet Anda sekarang aktif dan dapat diakses oleh sistem e-commerce secara langsung melalui URL Spreadsheet publik (Anyone with Link can view).\n\nSilakan klik tombol 'Sinkronkan Sheets' di dalam dashboard manajemen produk aplikasi Anda untuk menarik perubahan terbaru.", 
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * 2. API ENDPOINT GET: Mengembalikan data dari Spreadsheet dalam format JSON
 * Berguna jika Anda ingin menarik data produk via API Web Service.
 */
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Spreadsheet kosong",
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
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
    
    // Support CORS
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      count: jsonArray.length,
      data: jsonArray
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
  }
}

/**
 * 3. API ENDPOINT POST: Menerima data produk baru dari Aplikasi dan menambahkannya ke Spreadsheet
 */
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Pastikan header diinisialisasi
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
    
    var newRow = [];
    // Petakan nilai dari objek POST ke kolom sheet yang sesuai
    newRow.push(postData.image || "");               // Gambar produk
    newRow.push("TindakanToggle");                   // Tindakan
    newRow.push(postData.name || "");                // Produk
    newRow.push(postData.brand || "Kedai HW");       // Lokasi Bisnis / Merek
    newRow.push(postData.costPrice || 0);            // Harga Pembelian Satuan
    newRow.push(postData.sellingPrice || 0);         // Harga penjualan
    newRow.push((postData.stock || 0) + " Pieces");  // Stok saat ini
    newRow.push("Tunggal");                          // Jenis Produk
    newRow.push(postData.category || "Atribut HW");  // Kategori
    newRow.push(postData.brand || "Kedai HW");       // Merek
    newRow.push("");                                 // Pajak
    newRow.push(postData.sku || "");                 // SKU
    
    sheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Produk '" + postData.name + "' berhasil ditambahkan ke Spreadsheet!"
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
  }
}
