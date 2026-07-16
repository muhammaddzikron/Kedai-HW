/**
 * GOOGLE APPS SCRIPT (GAS) TERBARU - KEDAI KEPANDUAN SYNC ENGINE v2.0
 * 
 * Update Terbaru:
 * - Dukungan sinkronisasi data Karyawan (Staff) lengkap dengan kolom PIN Login.
 * - Auto-formatting header dengan warna-warna estetik & frozen top row.
 * - Auto-adjust column width (fit to content) setelah sinkronisasi selesai.
 * - Log transaksi, mutasi stok, audit logs, dan jurnal finansial real-time.
 * 
 * Cara Penggunaan:
 * 1. Buka Google Sheets baru atau yang sudah ada di akun Google Anda.
 * 2. Pada menu atas, klik "Ekstensi" -> "Apps Script" (Extensions -> Apps Script).
 * 3. Hapus semua baris kode default (kosongkan editor).
 * 4. Salin seluruh kode di bawah ini dan tempel (paste) ke dalam editor Apps Script.
 * 5. Klik ikon Simpan (Save) atau tekan Ctrl+S / Cmd+S.
 * 6. Klik tombol "Terapkan" di kanan atas -> "Penerapan Baru" (Deploy -> New Deployment).
 * 7. Pada jendela popup yang muncul:
 *    - Klik ikon gerigi (Pilih jenis penerapan), pilih "Aplikasi Web" (Web App).
 *    - Deskripsi: POS Kedai Kepanduan Sync v2
 *    - Jalankan sebagai: Saya (Email Google Anda)
 *    - Siapa yang memiliki akses: "Siapa saja" (Anyone) -> SANGAT PENTING agar POS bisa mengirim data!
 * 8. Klik "Terapkan" (Deploy). Google akan meminta otorisasi akses, silakan setujui dan klik "Izinkan" (Allow).
 * 9. Salin "URL Aplikasi Web" (Web App URL) yang dihasilkan (biasanya berakhiran /exec).
 * 10. Buka POS Kedai Kepanduan -> Buka menu "Pengaturan Sistem" -> Tempel URL tersebut ke kolom "URL Google Sheets Sync".
 */

function doPost(e) {
  // Dukungan Header CORS lengkap untuk pemicuan API lintas domain (cross-origin)
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Tidak ada data payload yang diterima" }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var responseData = handleAction(action, payload);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Sinkronisasi berhasil", data: responseData }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Menghandle request preflight OPTIONS untuk browser/CORS
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}

// Menghandle request GET sederhana untuk mengecek status online
function doGet(e) {
  return ContentService.createTextOutput("STATUS: ONLINE. Google Apps Script POS Kedai Kepanduan v2 siap digunakan.")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Router utama aksi POS
function handleAction(action, payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  switch (action) {
    case "sync_all_products":
      return syncAllRows(ss, "Products", payload.products, [
        "id", "name", "sku", "barcode", "category", "costPrice", "sellingPrice", "stock", "unit", "brand"
      ], "#ede9fe"); // Light purple theme for products
      
    case "sync_all_customers":
      return syncAllRows(ss, "Customers", payload.customers, [
        "id", "name", "phone", "email", "memberCode", "points", "joinDate", "category", "address"
      ], "#dbeafe"); // Light blue theme for customers
      
    case "sync_all_suppliers":
      return syncAllRows(ss, "Suppliers", payload.suppliers, [
        "id", "name", "contactName", "phone", "email", "address", "totalDebt"
      ], "#ffedd5"); // Light orange theme for suppliers
      
    case "sync_all_purchases":
      return syncAllPurchases(ss, payload.purchases);
      
    case "sync_all_staff":
      return syncAllRows(ss, "Staff", payload.staff, [
        "id", "name", "role", "phone", "email", "commissionRate", "attendanceStatus", "basicSalary", "pin"
      ], "#f3e8ff"); // Light purple-pink for staff
      
    case "add_pos_transaction":
      return appendSingleRow(ss, "Orders", payload.order, function(order) {
        return [
          order.id,
          order.orderNo,
          order.date,
          order.customerId || "Walk-In",
          order.customerName || "Pelanggan Umum",
          order.cashierName,
          order.subtotal,
          order.discount,
          order.tax,
          order.serviceCharge || 0,
          order.shippingFee || 0,
          order.total,
          order.paymentMethod,
          order.paymentStatus,
          order.items ? order.items.map(function(it) {
            return it.productName + " (" + it.quantity + "x @ Rp" + it.price.toLocaleString("id-ID") + ")";
          }).join("\n") : ""
        ];
      }, [
        "ID Transaksi", "No Nota", "Tanggal", "ID Pelanggan", "Nama Pelanggan", "Kasir/Staff",
        "Subtotal", "Diskon", "Pajak", "Service Charge", "Ongkir", "Grand Total", "Metode Bayar", "Status", "Item Belanja"
      ], "#ccfbf1"); // Mint green theme for sales orders
      
    case "add_inventory_movement":
      return appendSingleRow(ss, "InventoryMovements", payload.movement, function(mvt) {
        return [
          mvt.id,
          mvt.productId,
          mvt.productName,
          mvt.date,
          mvt.type,
          mvt.qty,
          mvt.referenceNo,
          mvt.warehouseName || "Main Store",
          mvt.notes || ""
        ];
      }, [
        "ID Log", "ID Produk", "Nama Produk", "Tanggal", "Tipe Gerakan", "Kuantitas", "No Referensi", "Lokasi", "Keterangan"
      ], "#fee2e2"); // Soft red for inventory
      
    case "add_finance_transaction":
      return appendSingleRow(ss, "FinanceTransactions", payload.transaction, function(tx) {
        return [
          tx.id,
          tx.date || new Date().toISOString(),
          tx.description,
          tx.category, // INCOME or EXPENSE
          tx.amount,
          tx.accountId || "1-1100"
        ];
      }, [
        "ID Keuangan", "Tanggal", "Keterangan", "Kategori Arus", "Jumlah (IDR)", "Kode Akun"
      ], "#fef9c3"); // Soft yellow for financial trx
      
    case "add_journal_entry":
      return appendSingleRow(ss, "JournalEntries", payload.journal, function(je) {
        return [
          je.id,
          je.date,
          je.referenceNo,
          je.description,
          je.debitCode,
          je.debitName,
          je.creditCode,
          je.creditName,
          je.amount
        ];
      }, [
        "ID Jurnal", "Tanggal", "No Referensi", "Keterangan", "Kode Debit", "Akun Debit", "Kode Kredit", "Akun Kredit", "Jumlah (IDR)"
      ], "#e0f2fe"); // Soft ice blue for journal entries
      
    case "add_audit_log":
      return appendSingleRow(ss, "AuditLogs", payload.log, function(log) {
        return [
          log.id,
          log.timestamp,
          log.userName,
          log.role,
          log.action,
          log.module,
          log.description
        ];
      }, [
        "ID Log", "Timestamp", "Pengguna", "Role", "Aksi", "Modul", "Keterangan"
      ], "#f1f5f9"); // Slate gray for logs
      
    default:
      throw new Error("Aksi '" + action + "' tidak didukung oleh sistem Google Apps Script.");
  }
}

// Helper untuk mengambil atau membuat sheet baru dengan custom header & formatting
function getOrCreateSheet(ss, sheetName, headers, headerBgColor) {
  var sheet = ss.getSheetByName(sheetName);
  var bg = headerBgColor || "#ede9fe";
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var range = sheet.getRange(1, 1, 1, headers.length);
      range.setFontWeight("bold");
      range.setBackground(bg);
      range.setFontColor("#1e293b");
      range.setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

// Sinkronisasi penuh satu tab master data (Overwrite & Auto-fit)
function syncAllRows(ss, sheetName, dataArray, keys, headerColor) {
  if (!dataArray) return "Tidak ada data untuk disinkronkan";
  
  var sheet = getOrCreateSheet(ss, sheetName, keys, headerColor);
  sheet.clear();
  sheet.appendRow(keys);
  
  var range = sheet.getRange(1, 1, 1, keys.length);
  range.setFontWeight("bold");
  range.setBackground(headerColor || "#ede9fe");
  range.setFontColor("#1e293b");
  sheet.setFrozenRows(1);
  
  if (dataArray.length === 0) return "Lembar disetel ulang dengan tajuk kolom";
  
  var rows = dataArray.map(function(item) {
    return keys.map(function(key) {
      return item[key] !== undefined && item[key] !== null ? item[key] : "";
    });
  });
  
  sheet.getRange(2, 1, rows.length, keys.length).setValues(rows);
  
  // Auto fit lebar kolom agar rapi
  try {
    sheet.autoResizeColumns(1, keys.length);
  } catch(e) {}
  
  return "Berhasil sinkronisasi " + rows.length + " data di tab " + sheetName;
}

// Sinkronisasi khusus tab Pembelian (Purchase Orders) yang berelasi kompleks
function syncAllPurchases(ss, purchases) {
  var keys = ["id", "purchaseNo", "date", "supplierId", "supplierName", "totalAmount", "status", "paymentStatus", "items"];
  var sheet = getOrCreateSheet(ss, "Purchases", keys, "#fef3c7");
  sheet.clear();
  sheet.appendRow(keys);
  
  var range = sheet.getRange(1, 1, 1, keys.length);
  range.setFontWeight("bold");
  range.setBackground("#fef3c7"); // Light gold
  range.setFontColor("#1e293b");
  sheet.setFrozenRows(1);
  
  if (!purchases || purchases.length === 0) return "Pembelian kosong";
  
  var rows = purchases.map(function(p) {
    return [
      p.id,
      p.purchaseNo,
      p.date,
      p.supplierId,
      p.supplierName,
      p.totalAmount,
      p.status,
      p.paymentStatus,
      p.items ? p.items.map(function(it) {
        return it.productName + " (" + it.quantity + "x @ Rp" + it.costPrice.toLocaleString("id-ID") + ")";
      }).join("\n") : ""
    ];
  });
  
  sheet.getRange(2, 1, rows.length, keys.length).setValues(rows);
  
  try {
    sheet.autoResizeColumns(1, keys.length);
  } catch(e) {}
  
  return "Berhasil sinkronisasi " + rows.length + " pesanan pembelian.";
}

// Menambahkan baris tunggal secara real-time append (Ujung baris baru)
function appendSingleRow(ss, sheetName, dataObject, formatFn, headers, headerColor) {
  if (!dataObject) return "Tidak ada data objek untuk ditambahkan";
  
  var sheet = getOrCreateSheet(ss, sheetName, headers, headerColor);
  var rowData = formatFn(dataObject);
  sheet.appendRow(rowData);
  
  // Format data baris baru agar rapi dan lurus
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(lastRow, 1, 1, rowData.length);
  range.setFontSize(10);
  
  try {
    sheet.autoResizeColumns(1, rowData.length);
  } catch(e) {}
  
  return "Berhasil menambahkan 1 baris ke " + sheetName;
}
