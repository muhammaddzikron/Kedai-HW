/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  Plus,
  Edit2,
  Trash2,
  PlusCircle,
  X,
  Search,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  Coins,
  PackageCheck,
  AlertTriangle,
  Upload,
  Download,
  AlertCircle,
  Check,
  CheckSquare
} from 'lucide-react';

export default function ProductsView() {
  const { 
    products, 
    addProduct, 
    editProduct, 
    deleteProduct, 
    deleteProducts,
    importProducts,
    syncProductsFromGoogleSheets, 
    pushProductsToGoogleSheets,
    googleSheetUrl, 
    googleDriveUrl, 
    isSyncing 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Reset selection when search or category filter changes
  useEffect(() => {
    setSelectedProductIds([]);
  }, [searchQuery, selectedCategory]);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Bulk Import CSV states
  const [csvText, setCsvText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('Cup');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [expiredDate, setExpiredDate] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  // Categories auto list
  const categoriesList = useMemo(() => {
    const list = new Set<string>();
    products.forEach((p) => {
      if (!p.isDeleted) list.add(p.category);
    });
    return Array.from(list);
  }, [products]);

  // Valuation summary stats
  const valuation = useMemo(() => {
    let totalItems = 0;
    let costSum = 0;
    let retailSum = 0;
    let lowCount = 0;

    products.forEach((p) => {
      if (!p.isDeleted) {
        totalItems += 1;
        costSum += p.costPrice * p.stock;
        retailSum += p.sellingPrice * p.stock;
        if (p.stock <= p.minStock) lowCount += 1;
      }
    });

    return {
      totalItems,
      costValuation: costSum,
      retailValuation: retailSum,
      potentialProfit: retailSum - costSum,
      lowCount
    };
  }, [products]);

  // Filtered list
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (p.isDeleted) return false;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.barcode.includes(searchQuery);
      const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const visibleIds = useMemo(() => filtered.map((p) => p.id), [filtered]);

  const allVisibleSelected = useMemo(() => {
    return visibleIds.length > 0 && visibleIds.every((id) => selectedProductIds.includes(id));
  }, [visibleIds, selectedProductIds]);

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => {
        const union = new Set([...prev, ...visibleIds]);
        return Array.from(union);
      });
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (confirm(`Apakah Anda yakin ingin menghapus sekaligus ${selectedProductIds.length} produk terpilih?`)) {
      deleteProducts(selectedProductIds);
      setSelectedProductIds([]);
    }
  };

  const handleOpenAddModal = () => {
    // reset form fields with prefilled suggestions
    setName('');
    setSku(`KDP-${Math.floor(100 + Math.random() * 900)}`);
    setBarcode(`899${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setCategory(categoriesList[0] || 'Atribut Pramuka');
    setBrand('Kedai Kepanduan');
    setUnit('Cup');
    setCostPrice('5000');
    setSellingPrice('10000');
    setStock('50');
    setMinStock('10');
    setBatchNo(`B-${Math.floor(10 + Math.random() * 90)}`);
    setExpiredDate('2026-12-31');
    setIsOnline(true);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setActiveProduct(p);
    setName(p.name);
    setSku(p.sku);
    setBarcode(p.barcode);
    setCategory(p.category);
    setBrand(p.brand);
    setUnit(p.unit);
    setCostPrice(p.costPrice.toString());
    setSellingPrice(p.sellingPrice.toString());
    setStock(p.stock.toString());
    setMinStock(p.minStock.toString());
    setBatchNo(p.batchNo || '');
    setExpiredDate(p.expiredDate || '');
    setIsOnline(p.isOnline);
    setShowEditModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name,
      sku,
      barcode,
      category,
      brand,
      unit,
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      stock: parseInt(stock) || 0,
      minStock: parseInt(minStock) || 0,
      batchNo: batchNo || undefined,
      expiredDate: expiredDate || undefined,
      isOnline,
      variants: [],
      modifiers: [],
      isSynced: false,
      isDeleted: false
    });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    editProduct(activeProduct.id, {
      name,
      sku,
      barcode,
      category,
      brand,
      unit,
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      stock: parseInt(stock) || 0,
      minStock: parseInt(minStock) || 0,
      batchNo: batchNo || undefined,
      expiredDate: expiredDate || undefined,
      isOnline
    });
    setShowEditModal(false);
  };

  const parseCsvText = (text: string): Product[] => {
    if (!text.trim()) return [];

    const lines: string[] = [];
    let currentLine = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine.trim());
        currentLine = '';
        continue;
      }
      currentLine += char;
    }
    if (currentLine) {
      lines.push(currentLine.trim());
    }

    if (lines.length === 0) return [];

    // Parse header to map index
    const headerLine = lines[0];
    const rawHeaders = parseCsvLine(headerLine).map(h => h.trim().replace(/^"|"$/g, ''));
    
    const headerMapping: { [key: string]: number } = {};
    rawHeaders.forEach((header, index) => {
      const hNorm = header.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      headerMapping[hNorm] = index;
    });

    const getFieldIndex = (aliases: string[]) => {
      for (const alias of aliases) {
        const normAlias = alias.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        if (headerMapping[normAlias] !== undefined) {
          return headerMapping[normAlias];
        }
      }
      return -1;
    };

    // Find indices for each field
    const imageIdx = getFieldIndex(['gambarproduk', 'gambar', 'image', 'photo', 'url']);
    const nameIdx = getFieldIndex(['produk', 'nama', 'namaproduk', 'name', 'product', 'title']);
    const costIdx = getFieldIndex(['hargapembeliansatuan', 'hargamodal', 'cogs', 'costprice', 'hargabeli', 'cost', 'modal']);
    const sellIdx = getFieldIndex(['hargapenjualan', 'hargajual', 'sellingprice', 'price', 'jual', 'retail']);
    const stockIdx = getFieldIndex(['stoksaatini', 'stok', 'stock', 'qty', 'stokakhir', 'jumlah']);
    const categoryIdx = getFieldIndex(['kategori', 'category', 'jenisproduk', 'jenis']);
    const brandIdx = getFieldIndex(['merek', 'brand', 'brandname', 'lokasibisnis']);
    const skuIdx = getFieldIndex(['sku', 'koderek', 'kode', 'sku_code']);
    const unitIdx = getFieldIndex(['unit', 'satuan']);

    const list: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const values = parseCsvLine(line).map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

      const rawName = nameIdx !== -1 ? values[nameIdx] : '';
      if (!rawName) continue; // Skip products without a name

      const rawImage = imageIdx !== -1 ? values[imageIdx] : '';
      const rawSku = skuIdx !== -1 ? values[skuIdx] : `KDP-IMP-${Math.floor(100 + Math.random() * 900)}`;
      const rawCategory = categoryIdx !== -1 ? values[categoryIdx] : 'Atribut Pramuka';
      const rawBrand = brandIdx !== -1 ? values[brandIdx] : 'Kedai HW';
      const rawUnit = unitIdx !== -1 ? values[unitIdx] : 'Pieces';

      // Parse price values cleanly removing Currency strings like Rp
      const parseNumeric = (val: string) => {
        if (!val) return 0;
        const clean = val.replace(/[^0-9.-]/g, '');
        return parseFloat(clean) || 0;
      };

      const rawCostPrice = costIdx !== -1 ? parseNumeric(values[costIdx]) : 0;
      const rawSellingPrice = sellIdx !== -1 ? parseNumeric(values[sellIdx]) : 0;
      const rawStock = stockIdx !== -1 ? parseNumeric(values[stockIdx]) : 10;

      list.push({
        id: `p-imp-${Date.now()}-${i}`,
        name: rawName,
        sku: rawSku,
        barcode: rawSku,
        category: rawCategory || 'Atribut HW',
        brand: rawBrand || 'Kedai HW',
        unit: rawUnit || 'Pieces',
        costPrice: rawCostPrice,
        sellingPrice: rawSellingPrice,
        stock: Math.floor(rawStock),
        minStock: 5,
        image: rawImage || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=200',
        variants: [],
        modifiers: [],
        isOnline: true,
        isSynced: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return list;
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      try {
        const parsed = parseCsvText(text);
        if (parsed.length === 0) {
          setImportFeedback({ type: 'error', message: 'Tidak ada baris data valid yang terdeteksi. Silakan periksa kembali format CSV Anda.' });
          return;
        }
        setParsedProducts(parsed);
        setImportFeedback({ type: 'success', message: `Berhasil mendeteksi ${parsed.length} produk siap di-import.` });
      } catch (err: any) {
        setImportFeedback({ type: 'error', message: `Gagal membaca file: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedProducts.length === 0) return;
    importProducts(parsedProducts);
    setImportFeedback({ type: 'success', message: `Berhasil mengimpor ${parsedProducts.length} produk ke dalam sistem!` });
    setTimeout(() => {
      setShowImportModal(false);
      setCsvText('');
      setParsedProducts([]);
      setImportFeedback(null);
    }, 1500);
  };

  const handleExportCSV = () => {
    // Columns to export
    const headers = ['Gambar produk', 'Produk', 'Harga Pembelian Satuan', 'Harga penjualan', 'Stok saat ini', 'Jenis Produk', 'Kategori', 'Merek', 'SKU'];
    
    const csvRows = [headers.join(',')];
    
    products.forEach(p => {
      if (p.isDeleted) return;
      const row = [
        `"${p.image || ''}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.costPrice}"`,
        `"${p.sellingPrice}"`,
        `"${p.stock} ${p.unit}"`,
        `"Tunggal"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.brand || '').replace(/"/g, '""')}"`,
        `"${p.sku}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `katalog_produk_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncSheets = async () => {
    try {
      await syncProductsFromGoogleSheets();
      alert('Katalog Produk Berhasil Disinkronkan dengan Google Sheets!');
    } catch (err: any) {
      alert(`Terjadi kesalahan sinkronisasi: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Katalog Manajemen Produk</h2>
          <p className="text-xs text-slate-500">Kelola daftar persediaan barang dagangan, harga, dan SKU toko.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSyncSheets}
            disabled={isSyncing}
            className={`px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition ${isSyncing ? 'opacity-50' : ''}`}
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sheets'}</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
          >
            <Upload className="h-3.5 w-3.5 text-indigo-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
          >
            <Download className="h-3.5 w-3.5 text-blue-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Google Sheets and Google Drive Connection Info */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Konektor Database Google Workspace Aktif</span>
          </div>
          <div className="text-slate-500 space-y-1">
            <div>
              <span className="font-semibold text-slate-700">Spreadsheet Sumber Produk: </span>
              <a href={googleSheetUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline break-all font-mono">
                {googleSheetUrl}
              </a>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Direktori Gambar Produk (Drive): </span>
              <a href={googleDriveUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline break-all font-mono">
                {googleDriveUrl}
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleSyncSheets}
            disabled={isSyncing}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 transition shadow-sm ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`h-3 w-3 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Tarik Data Produk</span>
          </button>
          
          <button
            onClick={async () => {
              const success = await pushProductsToGoogleSheets();
              if (success) {
                alert("Berhasil mengunggah semua produk lokal ke Google Sheets!");
              } else {
                alert("Gagal mengunggah produk. Pastikan URL Google Apps Script sudah benar.");
              }
            }}
            disabled={isSyncing}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-lg border border-emerald-200 flex items-center justify-center gap-1.5 transition ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Unggah Data Produk</span>
          </button>
        </div>
      </div>

      {/* Summary Valuation stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Jenis Produk</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">{valuation.totalItems} Produk</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valuasi Stok Modal (COGS)</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">Rp {valuation.costValuation.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <RefreshCw className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valuasi Harga Retail</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">Rp {valuation.retailValuation.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stok Menipis / Kosong</span>
            <span className="text-base font-extrabold text-rose-600 font-mono">{valuation.lowCount} Barang</span>
          </div>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filters bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari SKU, Nama Produk, Barcode, atau Brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-emerald-500"
            >
              <option value="Semua">Semua Kategori</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Selection Banner */}
        {selectedProductIds.length > 0 && (
          <div className="px-4 py-3 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-950 transition animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-indigo-600 animate-pulse" />
              <span className="font-bold">{selectedProductIds.length} produk terpilih</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedProductIds([])}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-800 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Sekaligus</span>
              </button>
            </div>
          </div>
        )}

        {/* Data list Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer h-3.5 w-3.5 border-slate-300"
                  />
                </th>
                <th className="py-3 px-4">SKU / Nama</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Modal</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-center">Tingkat Stok</th>
                <th className="py-3 px-4 text-center">Batch / Exp</th>
                <th className="py-3 px-4 text-center">Toko Online</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isLow = p.stock <= p.minStock;
                const isChecked = selectedProductIds.includes(p.id);
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition ${isChecked ? 'bg-indigo-50/30' : ''}`}>
                    <td className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectProduct(p.id)}
                        className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer h-3.5 w-3.5 border-slate-300"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 bg-slate-100 border border-slate-150 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-slate-300">
                          {p.image ? (
                            <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                          ) : (
                            p.name.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">{p.name}</h4>
                          <span className="text-[10px] font-semibold text-slate-400 font-mono">SKU: {p.sku} • Barcode: {p.barcode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-600">{p.category}</td>
                    
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-600">
                      Rp {p.costPrice.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      Rp {p.sellingPrice.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                        p.stock === 0
                          ? 'bg-rose-50 text-rose-500 border border-rose-100 animate-pulse'
                          : isLow
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {p.batchNo ? (
                        <div>
                          <span className="text-[10px] font-bold text-slate-700 font-mono bg-slate-100 px-1.5 py-0.2 rounded border">{p.batchNo}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{p.expiredDate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block h-2 w-2 rounded-full ring-4 ${p.isOnline ? 'bg-emerald-500 ring-emerald-500/10' : 'bg-slate-300 ring-slate-300/10'}`} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus produk "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Tambah Produk Baru</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
              <div className="sm:col-span-2">
                <label className="block mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                  placeholder="Kopi Susu Pandan"
                />
              </div>

              <div>
                <label className="block mb-1">SKU Kode</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Barcode</label>
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Kategori</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                  placeholder="Minuman Kopi"
                />
              </div>

              <div>
                <label className="block mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Harga Modal (COGS)</label>
                <input
                  type="number"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block mb-1">Harga Jual Retail</label>
                <input
                  type="number"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block mb-1">Stok Awal</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block mb-1">Min. Stok Warning</label>
                <input
                  type="number"
                  required
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-mono"
                  placeholder="B-KSP07"
                />
              </div>

              <div>
                <label className="block mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={expiredDate}
                  onChange={(e) => setExpiredDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="add-online-toggle"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-400"
                />
                <label htmlFor="add-online-toggle" className="text-slate-700 font-medium">Tampilkan produk ini di Storefront Online (E-Commerce)</label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 transition"
            >
              Simpan Produk
            </button>
          </form>
        </div>
      )}

      {/* DIALOG EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Produk</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
              <div className="sm:col-span-2">
                <label className="block mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">SKU Kode</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Barcode</label>
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Kategori</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Harga Modal (COGS)</label>
                <input
                  type="number"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block mb-1">Harga Jual Retail</label>
                <input
                  type="number"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block mb-1">Stok</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block mb-1">Min. Stok Warning</label>
                <input
                  type="number"
                  required
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={expiredDate}
                  onChange={(e) => setExpiredDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-online-toggle"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-400"
                />
                <label htmlFor="edit-online-toggle" className="text-slate-700 font-medium">Tampilkan produk ini di Storefront Online (E-Commerce)</label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 transition"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      )}

      {/* DIALOG IMPORT CSV MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setShowImportModal(false);
                setCsvText('');
                setParsedProducts([]);
                setImportFeedback(null);
              }}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Import Produk via CSV</h3>
                <p className="text-xs text-slate-500">Mendukung unggah file CSV atau tempel teks dari Spreadsheet langsung.</p>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-700">Petunjuk Kolom CSV:</p>
              <p>Kolom wajib: <span className="font-mono bg-slate-200 px-1 py-0.2 rounded font-bold text-indigo-700">Produk</span> (Nama produk) dan <span className="font-mono bg-slate-200 px-1 py-0.2 rounded font-bold text-indigo-700">Harga penjualan</span>.</p>
              <p>Kolom opsional lainnya: <span className="font-mono bg-slate-100 px-1 rounded">SKU</span>, <span className="font-mono bg-slate-100 px-1 rounded">Harga Pembelian Satuan</span>, <span className="font-mono bg-slate-100 px-1 rounded">Stok saat ini</span>, <span className="font-mono bg-slate-100 px-1 rounded">Kategori</span>, <span className="font-mono bg-slate-100 px-1 rounded">Merek</span>, <span className="font-mono bg-slate-100 px-1 rounded">Gambar produk</span>.</p>
              <p className="text-[10px] text-slate-400 font-medium">Format Desimal Harga/Stok dibersihkan secara otomatis dari tanda mata uang Rp atau titik desimal.</p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 mb-4 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                dragActive ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-250 hover:border-slate-350 bg-slate-50/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <FileSpreadsheet className="h-10 w-10 text-slate-400 mb-2.5" />
              <p className="text-xs font-bold text-slate-700 mb-1">Tarik & Lepas File CSV di Sini</p>
              <p className="text-[10px] text-slate-400">Atau klik untuk menelusuri file dari komputer Anda</p>
            </div>

            {/* Paste Text Area */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-bold text-slate-700 block">Atau Tempel Teks CSV di Sini:</label>
              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  if (e.target.value.trim()) {
                    try {
                      const parsed = parseCsvText(e.target.value);
                      if (parsed.length > 0) {
                        setParsedProducts(parsed);
                        setImportFeedback({ type: 'success', message: `Mendeteksi ${parsed.length} produk siap di-import.` });
                      } else {
                        setImportFeedback({ type: 'error', message: 'Teks CSV kosong atau tidak ada produk valid yang terdeteksi.' });
                      }
                    } catch (err: any) {
                      setImportFeedback({ type: 'error', message: `Gagal mengurai teks: ${err.message}` });
                    }
                  } else {
                    setParsedProducts([]);
                    setImportFeedback(null);
                  }
                }}
                className="w-full h-24 p-3 bg-slate-50 border border-slate-250 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
                placeholder={`Produk,Harga Pembelian Satuan,Harga penjualan,Stok saat ini,SKU\n"Atasan Seragam HW Pembina Putri",100000,130000,89,20989`}
              />
            </div>

            {/* Feedback Message */}
            {importFeedback && (
              <div className={`p-3 rounded-xl mb-4 flex items-start gap-2 text-xs font-semibold ${
                importFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-rose-50 text-rose-700 border border-rose-150'
              }`}>
                {importFeedback.type === 'success' ? (
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{importFeedback.message}</span>
              </div>
            )}

            {/* Parsed List Preview */}
            {parsedProducts.length > 0 && (
              <div className="mb-6 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">Pratinjau Produk Yang Terdeteksi ({parsedProducts.length}):</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto bg-slate-50/50">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600">
                        <th className="py-2 px-3">Nama Produk</th>
                        <th className="py-2 px-3">SKU</th>
                        <th className="py-2 px-3 text-right">Modal</th>
                        <th className="py-2 px-3 text-right">Jual</th>
                        <th className="py-2 px-3 text-center">Stok</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                      {parsedProducts.slice(0, 10).map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-100/30">
                          <td className="py-1.5 px-3 truncate max-w-[150px] font-bold text-slate-800">{p.name}</td>
                          <td className="py-1.5 px-3 font-mono text-[10px]">{p.sku}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-slate-500">Rp {p.costPrice.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-semibold">Rp {p.sellingPrice.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-center font-mono text-emerald-600 font-bold">{p.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedProducts.length > 10 && (
                  <p className="text-[10px] text-slate-400 italic">Menampilkan 10 dari {parsedProducts.length} produk.</p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setCsvText('');
                  setParsedProducts([]);
                  setImportFeedback(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedProducts.length === 0}
                onClick={handleConfirmImport}
                className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg transition ${
                  parsedProducts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Konfirmasi & Import Semua
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
