export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT (Code.gs) - KEDAI KEPANDUAN INTEGRASI ONLINE & POS
 * Versi Terbaru: Juli 2026 (Mendukung Ongkir, Update Status, & Rekening Payment)
 * ==============================================================================
 * 
 * CARA PENGGUNAAN:
 * 1. Buka Google Sheets Anda (Spreadsheet Kedai Kepanduan).
 * 2. Klik menu "Ekstensi" > "Apps Script".
 * 3. Hapus semua kode yang ada, lalu Salin & Tempel seluruh kode di bawah ini.
 * 4. Klik "Deploy" (Terapkan) > "Deployment Baru" (New Deployment).
 * 5. Pilih Jenis: "Aplikasi Web" (Web App).
 *    - Jalankan Sebagai: "Saya" (Me)
 *    - Siapa yang memiliki akses: "Siapa Saja" (Anyone)
 * 6. Klik "Terapkan" dan Salin URL Web App yang dihasilkan.
 * 7. Tempelkan URL tersebut ke Pengaturan Kedai Kepanduan > URL Google Apps Script.
 */

function doGet(e) {
  var type = (e && e.parameter && e.parameter.type) ? e.parameter.type : 'produk';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    if (type === 'produk' || type === 'products') {
      return getSheetData(ss, 'Produk', ['ID Produk', 'Nama Produk', 'Kategori', 'Harga Beli', 'Harga Jual', 'Stok', 'Satuan', 'Barcode', 'URL Gambar']);
    } else if (type === 'pelanggan' || type === 'customers') {
      return getSheetData(ss, 'Pelanggan', ['ID Pelanggan', 'Nama', 'Telepon', 'Email', 'Grup', 'Tingkatan', 'Poin Reward', 'Saldo Cashback', 'Alamat']);
    } else if (type === 'staff' || type === 'karyawan') {
      return getSheetData(ss, 'Staff', ['ID Staff', 'Nama Staff', 'Role', 'Telepon', 'Email', 'PIN']);
    } else if (type === 'pos_transactions' || type === 'penjualan_pos' || type === 'transaksi' || type === 'rekap_kasir') {
      return getSheetData(ss, 'Penjualan POS', ['No Invoice', 'Tanggal', 'Nama Pelanggan', 'Kasir', 'Cabang', 'Subtotal', 'Diskon', 'Pajak', 'Grand Total', 'Metode Pembayaran', 'Status Pembayaran', 'Items']);
    } else if (type === 'pesanan_online' || type === 'online_orders') {
      return getSheetData(ss, 'Pesanan Online', ['ID Order', 'No Pesanan', 'Nama Customer', 'No Telepon', 'Tanggal', 'Status', 'Ongkir', 'Total', 'Petugas CS', 'Catatan Pembayaran']);
    }
    
    return jsonResponse({ status: 'error', message: 'Tipe parameter tidak dikenal: ' + type });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: 'error', message: 'Tidak ada data POST yang diterima' });
    }
    
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'sync_all_products') {
      return syncProductsSheet(ss, data.products);
    } else if (action === 'sync_all_customers') {
      return syncCustomersSheet(ss, data.customers);
    } else if (action === 'sync_all_orders') {
      return syncAllOrdersSheet(ss, data.orders);
    } else if (action === 'add_pos_transaction') {
      return addPosTransactionSheet(ss, data.order);
    } else if (action === 'update_online_order' || action === 'add_online_order') {
      return updateOnlineOrderSheet(ss, data.order);
    }
    
    return jsonResponse({ status: 'success', message: 'Aksi ' + action + ' berhasil diproses' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function getSheetData(ss, sheetName, defaultHeaders) {
  var sheet = getOrCreateSheet(ss, sheetName, defaultHeaders);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return jsonResponse({ status: 'success', data: [] });
  }
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return jsonResponse({ status: 'success', data: result });
}

function syncProductsSheet(ss, products) {
  var headers = ['ID Produk', 'Nama Produk', 'Kategori', 'Harga Beli', 'Harga Jual', 'Stok', 'Satuan', 'Barcode', 'URL Gambar'];
  var sheet = getOrCreateSheet(ss, 'Produk', headers);
  sheet.clearContents();
  sheet.appendRow(headers);
  if (products && products.length) {
    products.forEach(function(p) {
      sheet.appendRow([
        p.id || '',
        p.name || '',
        p.category || '',
        p.costPrice || 0,
        p.sellingPrice || 0,
        p.stock || 0,
        p.unit || 'pcs',
        p.barcode || '',
        p.imageUrl || ''
      ]);
    });
  }
  return jsonResponse({ status: 'success', message: 'Sync produk berhasil', count: products ? products.length : 0 });
}

function syncCustomersSheet(ss, customers) {
  var headers = ['ID Pelanggan', 'Nama', 'Telepon', 'Email', 'Grup', 'Tingkatan', 'Poin Reward', 'Saldo Cashback', 'Alamat'];
  var sheet = getOrCreateSheet(ss, 'Pelanggan', headers);
  sheet.clearContents();
  sheet.appendRow(headers);
  if (customers && customers.length) {
    customers.forEach(function(c) {
      sheet.appendRow([
        c.id || '',
        c.name || '',
        c.phone || '',
        c.email || '',
        c.group || 'RETAIL',
        c.tier || 'SILVER',
        c.membershipPoints || 0,
        c.cashbackBalance || 0,
        c.address || ''
      ]);
    });
  }
  return jsonResponse({ status: 'success', message: 'Sync pelanggan berhasil', count: customers ? customers.length : 0 });
}

function syncAllOrdersSheet(ss, orders) {
  var headers = ['No Invoice', 'Tanggal', 'Nama Pelanggan', 'Kasir', 'Cabang', 'Subtotal', 'Diskon', 'Pajak', 'Grand Total', 'Metode Pembayaran', 'Status Pembayaran', 'Items'];
  var sheet = getOrCreateSheet(ss, 'Penjualan POS', headers);
  sheet.clearContents();
  sheet.appendRow(headers);
  if (orders && orders.length) {
    orders.forEach(function(o) {
      sheet.appendRow([
        o.orderNo || '',
        o.date || new Date().toISOString(),
        o.customerName || 'Umum',
        o.cashierName || 'Kasir',
        o.branchName || 'Utama',
        o.subtotal || 0,
        o.discount || 0,
        o.tax || 0,
        o.total || 0,
        o.paymentMethod || 'CASH',
        o.paymentStatus || 'PAID',
        JSON.stringify(o.items || [])
      ]);
    });
  }
  return jsonResponse({ status: 'success', message: 'Sync transaksi POS berhasil', count: orders ? orders.length : 0 });
}

function addPosTransactionSheet(ss, order) {
  var headers = ['No Invoice', 'Tanggal', 'Nama Pelanggan', 'Kasir', 'Cabang', 'Subtotal', 'Diskon', 'Pajak', 'Grand Total', 'Metode Pembayaran', 'Status Pembayaran', 'Items'];
  var sheet = getOrCreateSheet(ss, 'Penjualan POS', headers);
  if (order) {
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == order.orderNo) {
        rowIndex = i + 1;
        break;
      }
    }

    var rowValues = [
      order.orderNo || '',
      order.date || new Date().toISOString(),
      order.customerName || 'Umum',
      order.cashierName || 'Kasir',
      order.branchName || 'Utama',
      order.subtotal || 0,
      order.discount || 0,
      order.tax || 0,
      order.total || 0,
      order.paymentMethod || 'CASH',
      order.paymentStatus || 'PAID',
      JSON.stringify(order.items || [])
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
  }
  return jsonResponse({ status: 'success', message: 'Transaksi POS tersimpan' });
}

function updateOnlineOrderSheet(ss, order) {
  var headers = ['ID Order', 'No Pesanan', 'Nama Customer', 'No Telepon', 'Tanggal', 'Status', 'Ongkir', 'Total', 'Petugas CS', 'Catatan Pembayaran'];
  var sheet = getOrCreateSheet(ss, 'Pesanan Online', headers);
  if (order) {
    sheet.appendRow([
      order.id || '',
      order.orderNo || '',
      order.customerName || '',
      order.customerPhone || '',
      order.date || new Date().toISOString(),
      order.status || 'PENDING',
      order.shippingFee || 0,
      order.total || 0,
      order.processedBy || '',
      order.paymentProofNote || ''
    ]);
  }
  return jsonResponse({ status: 'success', message: 'Pesanan online tersimpan' });
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
