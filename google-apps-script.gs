/**
 * KEDAI KEPANDUAN - MULTI-DATABASE GOOGLE APPS SCRIPT INTEGRATION (Code.gs)
 * ------------------------------------------------------------------
 * Skrip ini dipasang di Google Apps Script (Extensions -> Apps Script)
 * pada Google Spreadsheet Anda untuk memfasilitasi integrasi dua arah.
 * 
 * Mendukung 10 Database:
 * 1. Produk / Stok Gudang
 * 2. Pelanggan / Anggota
 * 3. Pemasok / Supplier
 * 4. Pembelian Stok (Purchase Order)
 * 5. Transaksi POS Kasir (Penjualan)
 * 6. Arus Kas dan Biaya (Finance)
 * 7. Akuntansi dan Jurnal (Accounting)
 * 8. Staff dan Kehadiran (Staffing)
 * 9. Riwayat Mutasi Stok (Warehouse movements)
 * 10. Laporan dan Audit (System audit logs)
 */

// Konfigurasi Header Kolom Database
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

var SUPPLIER_HEADERS = [
  "ID Pemasok",
  "Nama Pemasok",
  "Kode Pemasok",
  "Kontak Person",
  "Telepon",
  "Email",
  "Alamat",
  "Total Pembelian",
  "Sisa Hutang",
  "Tanggal Terdaftar"
];

var PURCHASE_HEADERS = [
  "ID Pembelian",
  "No PO",
  "ID Pemasok",
  "Nama Pemasok",
  "Tanggal PO",
  "Total Belanja",
  "Status PO",
  "Status Pembayaran",
  "Detail Barang",
  "Tanggal Dibuat"
];

var TRANSACTION_HEADERS = [
  "ID Transaksi",
  "No Nota",
  "Tanggal",
  "ID Pelanggan",
  "Nama Pelanggan",
  "Pajak",
  "Service Charge",
  "Ongkir",
  "Diskon",
  "Subtotal",
  "Grand Total",
  "Metode Pembayaran",
  "Status Bayar",
  "Kasir",
  "Detail Barang"
];

var CASHFLOW_HEADERS = [
  "ID Arus Kas",
  "Tanggal",
  "Keterangan",
  "Tipe (Pemasukan/Pengeluaran)",
  "Jumlah (IDR)",
  "Akun Kas",
  "Modul Referensi"
];

var JOURNAL_HEADERS = [
  "ID Jurnal",
  "Tanggal",
  "Keterangan",
  "No Referensi",
  "Debet Akun",
  "Kredit Akun",
  "Jumlah Debet (IDR)",
  "Jumlah Kredit (IDR)"
];

var STAFF_HEADERS = [
  "ID Staff",
  "Nama Staff",
  "Role",
  "Telepon",
  "Email",
  "Komisi (%)",
  "Status Kehadiran",
  "Gaji Pokok",
  "Shift Aktif"
];

var INVENTORY_MOVE_HEADERS = [
  "ID Mutasi",
  "ID Produk",
  "Nama Produk",
  "Tanggal",
  "Tipe Mutasi",
  "Jumlah Qty",
  "No Referensi",
  "Gudang / Cabang",
  "Keterangan"
];

var AUDIT_HEADERS = [
  "ID Audit",
  "Waktu",
  "ID User",
  "Nama User",
  "Role",
  "Aksi",
  "Modul",
  "Keterangan"
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
 * Membuat baris header secara otomatis untuk semua database jika belum ada
 */
function initializeAllSheets() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreateSheet(spreadsheet, "Produk", PRODUCT_HEADERS);
  getOrCreateSheet(spreadsheet, "Pelanggan", CUSTOMER_HEADERS);
  getOrCreateSheet(spreadsheet, "Pemasok", SUPPLIER_HEADERS);
  getOrCreateSheet(spreadsheet, "Pembelian Stok", PURCHASE_HEADERS);
  getOrCreateSheet(spreadsheet, "Transaksi POS", TRANSACTION_HEADERS);
  getOrCreateSheet(spreadsheet, "Arus Kas dan Biaya", CASHFLOW_HEADERS);
  getOrCreateSheet(spreadsheet, "Akuntansi dan Jurnal", JOURNAL_HEADERS);
  getOrCreateSheet(spreadsheet, "Staff dan Kehadiran", STAFF_HEADERS);
  getOrCreateSheet(spreadsheet, "Riwayat Stok", INVENTORY_MOVE_HEADERS);
  getOrCreateSheet(spreadsheet, "Laporan dan Audit", AUDIT_HEADERS);
  SpreadsheetApp.getUi().alert("Inisialisasi Sukses: Semua 10 sheet database berhasil disiapkan dengan struktur yang benar.");
}

function syncConfirmation() {
  SpreadsheetApp.getUi().alert(
    "Informasi Sinkronisasi", 
    "Data Google Sheet Anda sekarang aktif dan terhubung secara real-time.\n\nSetiap perubahan stok, pembelian, pengeluaran kas, jurnal akuntansi, dan kehadiran staf akan langsung terkirim ke sheet masing-masing.", 
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
 */
function doGet(e) {
  try {
    var type = (e && e.parameter && e.parameter.type) || "produk";
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet;
    var headers;
    
    if (type === "pelanggan" || type === "customers") {
      sheet = getOrCreateSheet(spreadsheet, "Pelanggan", CUSTOMER_HEADERS);
      headers = CUSTOMER_HEADERS;
    } else if (type === "suppliers" || type === "pemasok") {
      sheet = getOrCreateSheet(spreadsheet, "Pemasok", SUPPLIER_HEADERS);
      headers = SUPPLIER_HEADERS;
    } else if (type === "purchases" || type === "pembelian") {
      sheet = getOrCreateSheet(spreadsheet, "Pembelian Stok", PURCHASE_HEADERS);
      headers = PURCHASE_HEADERS;
    } else if (type === "transactions" || type === "pos") {
      sheet = getOrCreateSheet(spreadsheet, "Transaksi POS", TRANSACTION_HEADERS);
      headers = TRANSACTION_HEADERS;
    } else if (type === "cashflow" || type === "arus_kas") {
      sheet = getOrCreateSheet(spreadsheet, "Arus Kas dan Biaya", CASHFLOW_HEADERS);
      headers = CASHFLOW_HEADERS;
    } else if (type === "journal" || type === "akuntansi") {
      sheet = getOrCreateSheet(spreadsheet, "Akuntansi dan Jurnal", JOURNAL_HEADERS);
      headers = JOURNAL_HEADERS;
    } else if (type === "staff" || type === "kehadiran") {
      sheet = getOrCreateSheet(spreadsheet, "Staff dan Kehadiran", STAFF_HEADERS);
      headers = STAFF_HEADERS;
    } else if (type === "inventory" || type === "riwayat_stok") {
      sheet = getOrCreateSheet(spreadsheet, "Riwayat Stok", INVENTORY_MOVE_HEADERS);
      headers = INVENTORY_MOVE_HEADERS;
    } else if (type === "audit" || type === "laporan") {
      sheet = getOrCreateSheet(spreadsheet, "Laporan dan Audit", AUDIT_HEADERS);
      headers = AUDIT_HEADERS;
    } else {
      sheet = getOrCreateSheet(spreadsheet, "Produk", PRODUCT_HEADERS);
      headers = PRODUCT_HEADERS;
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return createJSONResponse({
        status: "success",
        message: "Sheet kosong",
        data: []
      });
    }
    
    var sheetHeaders = data[0];
    var jsonArray = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var record = {};
      for (var j = 0; j < sheetHeaders.length; j++) {
        record[sheetHeaders[j]] = row[j];
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
 * 3. API ENDPOINT POST: Menerima aksi penulisan data dari Aplikasi
 */
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // --- AKSI 1: Sinkronisasi Massal Semua Produk / Stok Gudang ---
    if (postData.action === "sync_all_products" && Array.isArray(postData.products)) {
      var sheet = getOrCreateSheet(spreadsheet, "Produk", PRODUCT_HEADERS);
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      postData.products.forEach(function(product) {
        var newRow = [];
        newRow.push(product.image || "");               // Gambar produk
        newRow.push("TindakanToggle");                   // Tindakan
        newRow.push(product.name || "");                // Produk
        newRow.push(product.brand || "Kedai HW");       // Lokasi Bisnis
        newRow.push(product.costPrice || 0);            // Harga Pembelian Satuan
        newRow.push(product.sellingPrice || 0);         // Harga penjualan
        newRow.push(product.stock || 0);                // Stok saat ini
        newRow.push("Tunggal");                          // Jenis Produk
        newRow.push(product.category || "Atribut HW");  // Kategori
        newRow.push(product.brand || "Kedai HW");       // Merek
        newRow.push("");                                 // Pajak
        newRow.push(product.sku || "");                 // SKU
        sheet.appendRow(newRow);
      });
      return createJSONResponse({
        status: "success",
        message: "Berhasil menyinkronkan " + postData.products.length + " data produk ke Google Sheets!"
      });
    }
    
    // --- AKSI 2: Sinkronisasi Massal Semua Pelanggan ---
    if (postData.action === "sync_all_customers" && Array.isArray(postData.customers)) {
      var sheet = getOrCreateSheet(spreadsheet, "Pelanggan", CUSTOMER_HEADERS);
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
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

    // --- AKSI 3: Simpan Transaksi POS Kasir (Real-time append) ---
    if (postData.action === "add_pos_transaction" && postData.order) {
      var sheet = getOrCreateSheet(spreadsheet, "Transaksi POS", TRANSACTION_HEADERS);
      var order = postData.order;
      
      // Ringkasan detail barang
      var itemsSummary = (order.items || []).map(function(item) {
        return item.productName + " (Qty: " + item.quantity + " x Rp" + item.price.toLocaleString('id-ID') + ")";
      }).join(", ");

      var newRow = [
        order.id,
        order.orderNo,
        order.date,
        order.customerId || "GUEST",
        order.customerName || "Pelanggan Umum",
        order.tax || 0,
        order.serviceCharge || 0,
        order.shippingFee || 0,
        order.discount || 0,
        order.subtotal || 0,
        order.total || 0,
        order.paymentMethod,
        order.paymentStatus || "PAID",
        order.cashierName || "Sistem",
        itemsSummary
      ];
      sheet.appendRow(newRow);
      return createJSONResponse({
        status: "success",
        message: "Transaksi " + order.orderNo + " berhasil dicatat di Google Sheets!"
      });
    }

    // --- AKSI 4: Sinkronisasi Supplier ---
    if (postData.action === "sync_all_suppliers" && Array.isArray(postData.suppliers)) {
      var sheet = getOrCreateSheet(spreadsheet, "Pemasok", SUPPLIER_HEADERS);
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      postData.suppliers.forEach(function(supplier) {
        var newRow = [
          supplier.id,
          supplier.name,
          supplier.code,
          supplier.contactName,
          supplier.phone,
          supplier.email,
          supplier.address,
          supplier.totalPurchase || 0,
          supplier.unpaidDebt || 0,
          supplier.createdAt || new Date().toISOString()
        ];
        sheet.appendRow(newRow);
      });
      return createJSONResponse({
        status: "success",
        message: "Berhasil menyinkronkan " + postData.suppliers.length + " pemasok ke Google Sheets!"
      });
    }

    // --- AKSI 5: Sinkronisasi Pembelian Stok ---
    if (postData.action === "sync_all_purchases" && Array.isArray(postData.purchases)) {
      var sheet = getOrCreateSheet(spreadsheet, "Pembelian Stok", PURCHASE_HEADERS);
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      postData.purchases.forEach(function(p) {
        var itemsDetail = (p.items || []).map(function(item) {
          return item.productName + " (Qty: " + item.quantity + " x Rp" + item.costPrice.toLocaleString() + ")";
        }).join(", ");

        var newRow = [
          p.id,
          p.poNo,
          p.supplierId,
          p.supplierName,
          p.date,
          p.total || 0,
          p.status,
          p.paymentStatus || "PAID",
          itemsDetail,
          p.createdAt || p.date
        ];
        sheet.appendRow(newRow);
      });
      return createJSONResponse({
        status: "success",
        message: "Berhasil menyinkronkan " + postData.purchases.length + " pembelian stok ke Google Sheets!"
      });
    }

    // --- AKSI 6: Simpan Mutasi Stok (Real-time append) ---
    if (postData.action === "add_inventory_movement" && postData.movement) {
      var sheet = getOrCreateSheet(spreadsheet, "Riwayat Stok", INVENTORY_MOVE_HEADERS);
      var m = postData.movement;
      var newRow = [
        m.id,
        m.productId,
        m.productName,
        m.date,
        m.type,
        m.qty,
        m.referenceNo,
        m.warehouseName || "Gudang Utama",
        m.notes || ""
      ];
      sheet.appendRow(newRow);
      return createJSONResponse({
        status: "success",
        message: "Mutasi stok tercatat!"
      });
    }

    // --- AKSI 7: Simpan Arus Kas & Biaya (Real-time append) ---
    if (postData.action === "add_finance_transaction" && postData.transaction) {
      var sheet = getOrCreateSheet(spreadsheet, "Arus Kas dan Biaya", CASHFLOW_HEADERS);
      var t = postData.transaction;
      var newRow = [
        t.id,
        t.date || new Date().toISOString(),
        t.description,
        t.category, // INCOME or EXPENSE
        t.amount,
        t.accountId || "1-1100", // Kas Utama / Bank
        t.module || "Manual"
      ];
      sheet.appendRow(newRow);
      return createJSONResponse({
        status: "success",
        message: "Arus kas tercatat!"
      });
    }

    // --- AKSI 8: Simpan Jurnal Akuntansi (Real-time append) ---
    if (postData.action === "add_journal_entry" && postData.journal) {
      var sheet = getOrCreateSheet(spreadsheet, "Akuntansi dan Jurnal", JOURNAL_HEADERS);
      var j = postData.journal;
      
      // we can save debits and credits
      var debitsInfo = (j.debits || []).map(function(d) { return d.accountName + ": Rp" + d.amount.toLocaleString(); }).join(", ");
      var creditsInfo = (j.credits || []).map(function(c) { return c.accountName + ": Rp" + c.amount.toLocaleString(); }).join(", ");
      var totalDebit = (j.debits || []).reduce(function(sum, d) { return sum + d.amount; }, 0);
      var totalCredit = (j.credits || []).reduce(function(sum, c) { return sum + c.amount; }, 0);

      var newRow = [
        j.id,
        j.date,
        j.description,
        j.reference || "POS",
        debitsInfo,
        creditsInfo,
        totalDebit,
        totalCredit
      ];
      sheet.appendRow(newRow);
      return createJSONResponse({
        status: "success",
        message: "Jurnal akuntansi tercatat!"
      });
    }

    // --- AKSI 9: Sinkronisasi Staff & Kehadiran ---
    if (postData.action === "sync_all_staff" && Array.isArray(postData.staff)) {
      var sheet = getOrCreateSheet(spreadsheet, "Staff dan Kehadiran", STAFF_HEADERS);
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      postData.staff.forEach(function(s) {
        var newRow = [
          s.id,
          s.name,
          s.role,
          s.phone,
          s.email,
          s.commissionRate || 0,
          s.attendanceStatus || "OFF",
          s.basicSalary || 0,
          s.currentShiftId || "Tidak Ada Shift"
        ];
        sheet.appendRow(newRow);
      });
      return createJSONResponse({
        status: "success",
        message: "Berhasil menyinkronkan " + postData.staff.length + " staff ke Google Sheets!"
      });
    }

    // --- AKSI 10: Simpan Laporan & Audit (Real-time append) ---
    if (postData.action === "add_audit_log" && postData.log) {
      var sheet = getOrCreateSheet(spreadsheet, "Laporan dan Audit", AUDIT_HEADERS);
      var log = postData.log;
      var newRow = [
        log.id,
        log.timestamp,
        log.userId || "Sistem",
        log.userName || "Sistem",
        log.role || "Sistem",
        log.action,
        log.module,
        log.description
      ];
      sheet.appendRow(newRow);
      return createJSONResponse({
        status: "success",
        message: "Audit log tercatat!"
      });
    }
    
    // --- DEFAULT FALLBACK ---
    return createJSONResponse({
      status: "error",
      message: "Aksi tidak dikenal atau parameter salah."
    });
    
  } catch (err) {
    return createJSONResponse({
      status: "error",
      message: err.toString()
    });
  }
}
