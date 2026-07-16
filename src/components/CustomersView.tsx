/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Plus,
  Award,
  Smartphone,
  Mail,
  Calendar,
  Gift,
  Coins,
  X,
  Search,
  Download,
  Upload,
  Trash2,
  Edit,
  MessageSquare,
  Eye,
  BookOpen,
  Sparkles,
  CheckCircle,
  FileText,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Filter,
  Check,
  AlertCircle,
  CheckSquare
} from 'lucide-react';

export default function CustomersView() {
  const {
    customers,
    addCustomer,
    editCustomer,
    deleteCustomer,
    deleteCustomers,
    importCustomers,
    konveksiOrders
  } = useApp();

  // Dialog & Modal Control
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  
  // Selection states
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // Reset selected customer IDs on search/filter change
  useEffect(() => {
    setSelectedCustomerIds([]);
  }, [searchQuery, filterGroup, filterTier]);

  // Customer Form states (for Add & Edit)
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGroup, setFormGroup] = useState<'RETAIL' | 'VIP' | 'WHOLESALE' | 'MEMBER'>('MEMBER');
  const [formTier, setFormTier] = useState<'SILVER' | 'GOLD' | 'PLATINUM'>('SILVER');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCustomId, setFormCustomId] = useState('');
  const [formPoints, setFormPoints] = useState<number>(100);
  const [formCashback, setFormCashback] = useState<number>(0);

  // CSV Import States
  const [csvText, setCsvText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parsedCustomers, setParsedCustomers] = useState<Customer[]>([]);
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = customers.length;
    const wholesaleCount = customers.filter(c => c.group === 'WHOLESALE' || c.group === 'VIP').length;
    const totalPoints = customers.reduce((sum, c) => sum + (c.membershipPoints || 0), 0);
    const totalCashback = customers.reduce((sum, c) => sum + (c.cashbackBalance || 0), 0);
    return { total, wholesaleCount, totalPoints, totalCashback };
  }, [customers]);

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchQuery =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.customId && c.customId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGroup = filterGroup === 'ALL' || c.group === filterGroup;
      const matchTier = filterTier === 'ALL' || c.tier === filterTier;

      return matchQuery && matchGroup && matchTier;
    });
  }, [customers, searchQuery, filterGroup, filterTier]);

  // Handle addition of a single customer
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    addCustomer({
      name: formName,
      phone: formPhone || '-',
      email: formEmail || '-',
      group: formGroup,
      tier: formTier,
      membershipPoints: formPoints || 0,
      cashbackBalance: formCashback || 0,
      birthDate: formBirthDate || undefined,
      address: formAddress || undefined,
      customId: formCustomId || `CO${Math.floor(1000 + Math.random() * 9000)}`
    });

    setShowAddModal(false);
    resetForm();
  };

  // Handle editing a customer
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    editCustomer(selectedCustomer.id, {
      name: formName,
      phone: formPhone,
      email: formEmail,
      group: formGroup,
      tier: formTier,
      membershipPoints: formPoints,
      cashbackBalance: formCashback,
      birthDate: formBirthDate || undefined,
      address: formAddress || undefined,
      customId: formCustomId || selectedCustomer.customId
    });

    // Refresh selected customer state
    setSelectedCustomer({
      ...selectedCustomer,
      name: formName,
      phone: formPhone,
      email: formEmail,
      group: formGroup,
      tier: formTier,
      membershipPoints: formPoints,
      cashbackBalance: formCashback,
      birthDate: formBirthDate || undefined,
      address: formAddress || undefined,
      customId: formCustomId || selectedCustomer.customId
    });

    setIsEditing(false);
  };

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormGroup('MEMBER');
    setFormTier('SILVER');
    setFormBirthDate('');
    setFormAddress('');
    setFormCustomId('');
    setFormPoints(100);
    setFormCashback(0);
  };

  const prepareEditForm = (c: Customer) => {
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormEmail(c.email);
    setFormGroup(c.group);
    setFormTier(c.tier);
    setFormBirthDate(c.birthDate || '');
    setFormAddress(c.address || '');
    setFormCustomId(c.customId || '');
    setFormPoints(c.membershipPoints);
    setFormCashback(c.cashbackBalance);
  };

  // CSV parsing core engine
  const parseCsvText = (text: string): Customer[] => {
    if (!text.trim()) return [];

    const lines: string[] = [];
    let currentLine = '';
    let insideQuotes = false;

    // Correctly split lines respecting quotes which contain line breaks
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
    
    // Normalize headers for Indonesian and English
    const headerMapping: { [key: string]: number } = {};
    rawHeaders.forEach((header, index) => {
      const hNorm = header.toLowerCase().replace(/\s+/g, '');
      headerMapping[hNorm] = index;
    });

    const getFieldIndex = (aliases: string[]) => {
      for (const alias of aliases) {
        const normAlias = alias.toLowerCase().replace(/\s+/g, '');
        if (headerMapping[normAlias] !== undefined) {
          return headerMapping[normAlias];
        }
      }
      return -1;
    };

    // Find index for each field
    const idIdx = getFieldIndex(['idkontak', 'contactid', 'id', 'id_kontak', 'customerid']);
    const nameIdx = getFieldIndex(['nama', 'name', 'namalengkap']);
    const bizIdx = getFieldIndex(['namabisnis', 'businessname', 'bisnis', 'perusahaan']);
    const emailIdx = getFieldIndex(['email', 'alamatemail', 'surel']);
    const addressIdx = getFieldIndex(['alamat', 'address', 'alamatpengiriman']);
    const phoneIdx = getFieldIndex(['mobile', 'phone', 'telepon', 'nohp', 'whatsapp', 'telp']);
    const groupIdx = getFieldIndex(['gruppelanggan', 'customergroup', 'grup', 'group']);
    const dateIdx = getFieldIndex(['menambahkan', 'createdat', 'tanggal', 'date']);

    const list: Customer[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const values = parseCsvLine(line).map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

      // Extract raw values
      const rawId = idIdx !== -1 ? values[idIdx] : '';
      const rawName = nameIdx !== -1 ? values[nameIdx] : '';
      const rawBiz = bizIdx !== -1 ? values[bizIdx] : '';
      const rawEmail = emailIdx !== -1 ? values[emailIdx] : '';
      const rawAddress = addressIdx !== -1 ? values[addressIdx] : '';
      const rawPhone = phoneIdx !== -1 ? values[phoneIdx] : '';
      const rawGroup = groupIdx !== -1 ? values[groupIdx] : '';
      const rawDate = dateIdx !== -1 ? values[dateIdx] : '';

      // Business logic: if "Nama" (person) is blank, use "Nama Bisnis" (organization) as the customer name
      let finalName = rawName;
      if (!finalName && rawBiz) {
        finalName = rawBiz;
      }
      if (!finalName) {
        finalName = `Pelanggan Tanpa Nama (${rawId || 'Unknwn'})`;
      }

      // Format Date
      let formattedDate = new Date().toISOString();
      if (rawDate) {
        try {
          const parsed = Date.parse(rawDate);
          if (!isNaN(parsed)) {
            formattedDate = new Date(parsed).toISOString();
          }
        } catch (_) {}
      }

      // Map group to valid union types
      let mappedGroup: 'RETAIL' | 'VIP' | 'WHOLESALE' | 'MEMBER' = 'MEMBER';
      const normGroup = rawGroup.toUpperCase();
      if (normGroup.includes('WHOLESALE') || normGroup.includes('GROSIR') || rawBiz !== '') {
        mappedGroup = 'WHOLESALE';
      } else if (normGroup.includes('VIP')) {
        mappedGroup = 'VIP';
      } else if (normGroup.includes('RETAIL') || normGroup.includes('ECERAN')) {
        mappedGroup = 'RETAIL';
      }

      // Assign custom tier based on group
      let mappedTier: 'SILVER' | 'GOLD' | 'PLATINUM' = 'SILVER';
      if (mappedGroup === 'WHOLESALE') mappedTier = 'PLATINUM';
      else if (mappedGroup === 'VIP') mappedTier = 'GOLD';

      // Clean phone number
      const cleanPhone = rawPhone.replace(/[^0-9+\s-]/g, '') || '-';

      list.push({
        id: rawId || `c-${Date.now()}-${i}`,
        customId: rawId || undefined,
        name: finalName,
        phone: cleanPhone,
        email: rawEmail || '-',
        address: rawAddress || undefined,
        group: mappedGroup,
        tier: mappedTier,
        membershipPoints: mappedGroup === 'WHOLESALE' ? 500 : 100, // starting point rewards
        cashbackBalance: mappedGroup === 'WHOLESALE' ? 50000 : 0,
        createdAt: formattedDate
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

  // Handle copy-pasted CSV input
  const handleParseText = () => {
    try {
      const parsed = parseCsvText(csvText);
      if (parsed.length === 0) {
        setImportFeedback({ type: 'error', message: 'Tidak ada baris data valid yang terdeteksi. Silakan periksa kembali format CSV Anda.' });
        return;
      }
      setParsedCustomers(parsed);
      setImportFeedback({ type: 'success', message: `Berhasil memproses ${parsed.length} baris pelanggan. Silakan pratinjau data di bawah sebelum menyimpan.` });
    } catch (err: any) {
      setImportFeedback({ type: 'error', message: `Gagal membaca CSV: ${err.message}` });
    }
  };

  // Handle drag & drop events
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
    if (!file.name.endsWith('.csv')) {
      setImportFeedback({ type: 'error', message: 'Tipe berkas tidak didukung. Harap unggah berkas berekstensi .csv' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      try {
        const parsed = parseCsvText(text);
        setParsedCustomers(parsed);
        setImportFeedback({ type: 'success', message: `Unggah berkas berhasil. Mendeteksi ${parsed.length} data pelanggan pramuka/sekolah.` });
      } catch (err: any) {
        setImportFeedback({ type: 'error', message: `Gagal mengurai isi berkas CSV: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  // Confirm import and save to AppContext
  const commitImport = () => {
    if (parsedCustomers.length === 0) return;
    importCustomers(parsedCustomers);
    setShowImportModal(false);
    setParsedCustomers([]);
    setCsvText('');
    setImportFeedback(null);
  };

  // Export current customers to formatted CSV
  const triggerExport = () => {
    // Generate headers matching user's custom layout
    const headers = ["Tindakan", "ID Kontak", "Nama Bisnis", "Nama", "Email", "Nomor pajak", "Batas Kredit", "Termin pembayaran", "Opening Balance", "Saldo di Muka", "Menambahkan", "Grup Pelanggan", "Alamat", "Mobile", "Poin Member", "Saldo Cashback"];
    
    const rows = customers.map(c => {
      const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US') : '';
      const escapedAddress = c.address ? `"${c.address.replace(/"/g, '""')}"` : '""';
      const escapedName = c.name ? `"${c.name.replace(/"/g, '""')}"` : '""';
      
      return [
        "", // Tindakan
        c.customId || c.id, // ID Kontak
        c.group === 'WHOLESALE' ? escapedName : '""', // Nama Bisnis
        c.group !== 'WHOLESALE' ? escapedName : '""', // Nama
        c.email || "",
        "", // Nomor pajak
        "Tidak ada batas", // Batas Kredit
        "", // Termin pembayaran
        "Rp 0.00", // Opening Balance
        "Rp 0.00", // Saldo di Muka
        dateStr, // Menambahkan (Date)
        c.group, // Grup Pelanggan
        escapedAddress, // Alamat
        c.phone || "",
        c.membershipPoints,
        `Rp ${c.cashbackBalance}`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Pelanggan_KedaiKepanduan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download raw sample CSV matching the exact user layout
  const downloadTemplate = () => {
    const headers = ["Tindakan", "ID Kontak", "Nama Bisnis", "Nama", "Email", "Nomor pajak", "Batas Kredit", "Termin pembayaran", "Opening Balance", "Saldo di Muka", "Menambahkan", "Grup Pelanggan", "Alamat", "Mobile", "Total Penjualan Jatuh Tempo"];
    const row1 = ["", "CO0583", "", "Ramanda Amannurdian", "", "", "Tidak ada batas", "", "Rp 0.00", "Rp 0.00", "07/13/2026", "MEMBER", "MTs Muhammadiyah 1 Samarinda, Jl. A.W. Syahranaei Rt. 25, Kel. Air Hitam, Kec. Samarinda Ulu, Kota Samarinda, Prov. Kalimantan Timur.", "085217810001", "Rp 0.00"];
    const row2 = ["", "CO0582", "SD Muh Darul Arqam Sawangan", "", "", "", "Tidak ada batas", "", "Rp 0.00", "Rp 0.00", "07/04/2026", "WHOLESALE", "", "089503204404", "Rp 0.00"];
    
    const csvContent = [headers.join(","), row1.join(","), row2.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Template_Pelanggan_KedaiKepanduan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Konveksi orders matching selected customer name
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return konveksiOrders.filter(
      (o) => o.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()
    );
  }, [selectedCustomer, konveksiOrders]);

  const visibleCustomerIds = useMemo(() => filteredCustomers.map((c) => c.id), [filteredCustomers]);

  const allVisibleSelected = useMemo(() => {
    return visibleCustomerIds.length > 0 && visibleCustomerIds.every((id) => selectedCustomerIds.includes(id));
  }, [visibleCustomerIds, selectedCustomerIds]);

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedCustomerIds((prev) => prev.filter((id) => !visibleCustomerIds.includes(id)));
    } else {
      setSelectedCustomerIds((prev) => {
        const union = new Set([...prev, ...visibleCustomerIds]);
        return Array.from(union);
      });
    }
  };

  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedCustomerIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus sekaligus ${selectedCustomerIds.length} pelanggan terpilih?`)) {
      deleteCustomers(selectedCustomerIds);
      setSelectedCustomerIds([]);
    }
  };

  const getTierColor = (t: string) => {
    switch (t) {
      case 'PLATINUM': return 'bg-slate-950 text-slate-100 border border-slate-800';
      case 'GOLD': return 'bg-amber-100 text-amber-800 border border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200'; // Silver
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header and Quick Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-900" />
            <span>Keadgotaan & CRM Kedai Kepanduan</span>
          </h2>
          <p className="text-xs text-slate-500">Kelola database pelanggan grosir sekolah, anggota pramuka, rekap poin reward, dan saldo deposit.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={triggerExport}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Ekspor Pelanggan</span>
          </button>

          <button
            onClick={() => {
              setParsedCustomers([]);
              setCsvText('');
              setImportFeedback(null);
              setShowImportModal(true);
            }}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition shadow-sm"
          >
            <Upload className="h-3.5 w-3.5 text-slate-600" />
            <span>Impor Pelanggan (CSV)</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      {/* CRM Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <Users className="h-5 w-5 text-slate-800" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Total Kontak</span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">{stats.total}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Sekolah / Grosir</span>
            <span className="text-lg font-extrabold text-emerald-700 font-mono">{stats.wholesaleCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Total Poin</span>
            <span className="text-lg font-extrabold text-amber-600 font-mono">{stats.totalPoints.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100">
            <Coins className="h-5 w-5 text-sky-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Total Cashback</span>
            <span className="text-lg font-extrabold text-sky-600 font-mono">Rp {stats.totalCashback.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pelanggan berdasarkan nama, nomor telepon, ID, alamat sekolah..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {filteredCustomers.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSelectAll();
                }}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer h-3.5 w-3.5 border-slate-300"
              />
              <span>Pilih Semua</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 rounded-xl">
            <Filter className="h-3 w-3 text-slate-500" />
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-transparent py-1.5 text-xs text-slate-700 font-bold focus:outline-none"
            >
              <option value="ALL">Semua Grup</option>
              <option value="MEMBER">Grup MEMBER</option>
              <option value="WHOLESALE">Grup WHOLESALE</option>
              <option value="VIP">Grup VIP</option>
              <option value="RETAIL">Grup RETAIL</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 rounded-xl">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-transparent py-1.5 text-xs text-slate-700 font-bold focus:outline-none"
            >
              <option value="ALL">Semua Level</option>
              <option value="SILVER">SILVER</option>
              <option value="GOLD">GOLD</option>
              <option value="PLATINUM">PLATINUM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Selection Banner */}
      {selectedCustomerIds.length > 0 && (
        <div className="px-4 py-3 bg-indigo-50/85 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-indigo-950 transition animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-indigo-600 animate-pulse" />
            <span className="font-bold">{selectedCustomerIds.length} pelanggan terpilih untuk tindakan massal</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedCustomerIds([])}
              className="px-2 py-1 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Batal pilihan
            </button>
            <span className="text-indigo-200 hidden sm:inline">|</span>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-500/10 transition flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Sekaligus</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid List of Customers */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-sm">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold text-sm">Tidak Ada Pelanggan Ditemukan</p>
          <p className="text-slate-400 text-xs mt-1">Gunakan kata kunci pencarian lain atau klik Tambah Pelanggan untuk mendaftarkan manual.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCustomers.map((c) => {
            const isChecked = selectedCustomerIds.includes(c.id);
            return (
              <div
                key={c.id}
                className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow transition flex flex-col justify-between ${
                  isChecked ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Header profile */}
                  <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectCustomer(c.id)}
                        className="rounded text-indigo-650 focus:ring-indigo-500 cursor-pointer h-3.5 w-3.5 border-slate-300"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono font-bold text-slate-400 block tracking-wider uppercase">
                          {c.customId || c.id}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs leading-snug truncate">
                          {c.name}
                        </h3>
                      </div>
                    </div>
                    <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 ${getTierColor(c.tier)}`}>
                      {c.tier}
                    </span>
                  </div>

                {/* Contacts / Address */}
                <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-mono">{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  {c.address && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-left leading-normal">{c.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Loyalty displays & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-50">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px] text-left">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase flex items-center gap-0.5">
                      <Award className="h-2.5 w-2.5 text-amber-500" />
                      Poin Reward
                    </span>
                    <span className="font-mono font-bold text-slate-800">{c.membershipPoints} Pts</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase flex items-center gap-0.5">
                      <Coins className="h-2.5 w-2.5 text-emerald-500" />
                      Saldo Deposit
                    </span>
                    <span className="font-mono font-bold text-slate-800">Rp {c.cashbackBalance.toLocaleString()}</span>
                  </div>
                </div>

                {/* Card Quick Actions */}
                <div className="flex items-center justify-end gap-1.5 mt-3">
                  <button
                    onClick={() => {
                      setSelectedCustomer(c);
                      prepareEditForm(c);
                      setIsEditing(false);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition"
                    title="Lihat Detail & SPK jahit"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  {c.phone && c.phone !== '-' && (
                    <a
                      href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 transition"
                      title="Hubungi WhatsApp"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm(`Apakah Anda yakin ingin menghapus pelanggan "${c.name}"?`)) {
                        deleteCustomer(c.id);
                      }
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition"
                    title="Hapus Pelanggan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* MODAL: EXCEL/CSV BULK IMPORTER */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl relative text-left my-8"
            >
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-5 w-5 text-slate-800" />
                <h3 className="text-base font-bold text-slate-900">Impor Pelanggan secara Massal (CSV)</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Muat berkas CSV Anda atau salin baris teks CSV langsung ke area input. Format unggahan harus menyertakan nama kolom (headers) di baris pertama.
              </p>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer mb-4 transition ${
                  dragActive ? 'border-slate-800 bg-slate-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">Seret & lepas berkas .csv di sini, atau klik untuk memilih berkas</p>
                <p className="text-[10px] text-slate-400 mt-1">Mendukung penyelarasan header "ID Kontak", "Nama", "Nama Bisnis", "Alamat", "Mobile"</p>
              </div>

              {/* Textarea Paste fallback */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                  <label>Atau tempel (paste) baris data CSV di sini:</label>
                  <button
                    onClick={downloadTemplate}
                    className="text-slate-900 hover:underline flex items-center gap-1 font-extrabold"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download Template CSV</span>
                  </button>
                </div>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`ID Kontak,Nama Bisnis,Nama,Alamat,Mobile\nCO0583,,Ramanda Amannurdian,"MTs Muhammadiyah 1 Samarinda, Jl. AW Syahrani",085217810001\nCO0582,SD Muh Darul Arqam Sawangan,,,089503204404`}
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono placeholder-slate-400 focus:outline-none"
                />
              </div>

              {importFeedback && (
                <div className={`mt-3 p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  importFeedback.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                    : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  {importFeedback.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug">{importFeedback.message}</span>
                </div>
              )}

              {/* Live Preview List */}
              {parsedCustomers.length > 0 && (
                <div className="mt-4 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center text-[10px] text-slate-500 font-extrabold uppercase">
                    <span>Pratinjau Impor ({parsedCustomers.length} Pelanggan)</span>
                    <span className="text-emerald-600 font-black">Valid</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs text-slate-700">
                    {parsedCustomers.slice(0, 15).map((pc, idx) => (
                      <div key={idx} className="p-2.5 hover:bg-slate-50 flex items-center justify-between gap-4 font-medium">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{pc.customId || 'NoID'}</span>
                            <span className="font-bold text-slate-900 truncate">{pc.name}</span>
                          </div>
                          {pc.address && <p className="text-[10px] text-slate-400 truncate mt-0.5">{pc.address}</p>}
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{pc.group}</span>
                          <span className="font-mono text-[10px] text-slate-500">{pc.phone}</span>
                        </div>
                      </div>
                    ))}
                    {parsedCustomers.length > 15 && (
                      <div className="p-2 text-center text-[10px] text-slate-400 font-bold bg-slate-50 border-t">
                        ...dan {parsedCustomers.length - 15} pelanggan lainnya
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Import Buttons Actions */}
              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
                {parsedCustomers.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleParseText}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition"
                  >
                    Proses Baris Data
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={commitImport}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    <span>Simpan & Import ({parsedCustomers.length}) Pelanggan</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD SINGLE CUSTOMER */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleAddSubmit}
              className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative text-left"
            >
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-base font-bold text-slate-900 mb-4">Daftarkan Anggota / Sekolah Baru</h3>

              <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">ID Kontak (ID Pelanggan)</label>
                    <input
                      type="text"
                      value={formCustomId}
                      onChange={(e) => setFormCustomId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 placeholder-slate-400"
                      placeholder="Contoh: CO0583"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Nama Anggota/Grup</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      placeholder="Kak Ramanda"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">No. WhatsApp</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                      placeholder="085217810001"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Alamat Email</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      placeholder="ramanda@mts.sch.id"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">Grup Pelanggan</label>
                    <select
                      value={formGroup}
                      onChange={(e) => setFormGroup(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="RETAIL">RETAIL</option>
                      <option value="VIP">VIP</option>
                      <option value="WHOLESALE">WHOLESALE / SEKOLAH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Membership Tier</label>
                    <select
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="SILVER">SILVER (Tanpa Diskon)</option>
                      <option value="GOLD">GOLD (Diskon 5%)</option>
                      <option value="PLATINUM">PLATINUM (Diskon 10%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">Poin Reward Awal</label>
                    <input
                      type="number"
                      value={formPoints}
                      onChange={(e) => setFormPoints(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Saldo Cashback (Rp)</label>
                    <input
                      type="number"
                      value={formCashback}
                      onChange={(e) => setFormCashback(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Alamat Kontak / Alamat Pengiriman Sekolah</label>
                  <textarea
                    rows={2}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 leading-normal"
                    placeholder="Masukkan alamat pengiriman instansi atau alamat rumah"
                  />
                </div>

                <div>
                  <label className="block mb-1">Tanggal Lahir (Promosi)</label>
                  <input
                    type="date"
                    value={formBirthDate}
                    onChange={(e) => setFormBirthDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition"
                >
                  Daftarkan Member (+Poin)
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CUSTOMER DETAIL & EDIT WINDOW */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl relative text-left"
            >
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <Users className="h-5 w-5 text-slate-900" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isEditing ? 'Ubah Informasi Pelanggan' : 'Profil Lengkap Pelanggan & CRM'}
                </h3>
              </div>

              {isEditing ? (
                // EDIT MODE FORM
                <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">ID Kontak</label>
                      <input
                        type="text"
                        value={formCustomId}
                        onChange={(e) => setFormCustomId(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Nama Lengkap / Instansi</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">No. WhatsApp</label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Email</label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Grup Pelanggan</label>
                      <select
                        value={formGroup}
                        onChange={(e) => setFormGroup(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="RETAIL">RETAIL</option>
                        <option value="VIP">VIP</option>
                        <option value="WHOLESALE">WHOLESALE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Membership Level</label>
                      <select
                        value={formTier}
                        onChange={(e) => setFormTier(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                      >
                        <option value="SILVER">SILVER</option>
                        <option value="GOLD">GOLD</option>
                        <option value="PLATINUM">PLATINUM</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Poin Reward</label>
                      <input
                        type="number"
                        value={formPoints}
                        onChange={(e) => setFormPoints(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Saldo Cashback (Rp)</label>
                      <input
                        type="number"
                        value={formCashback}
                        onChange={(e) => setFormCashback(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1">Alamat Lengkap</label>
                    <textarea
                      rows={2}
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 leading-normal"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              ) : (
                // VIEW DETAILS MODE
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic info box */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono bg-slate-200/80 px-2 py-0.5 rounded text-slate-600 font-bold uppercase">
                          {selectedCustomer.customId || selectedCustomer.id}
                        </span>
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 ${getTierColor(selectedCustomer.tier)}`}>
                          {selectedCustomer.tier}
                        </span>
                      </div>
                      
                      <div className="text-left">
                        <h4 className="text-sm font-black text-slate-900">{selectedCustomer.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Terdaftar: {new Date(selectedCustomer.createdAt).toLocaleDateString('id-ID')}</p>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 font-medium pt-2 border-t border-slate-200/50">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">{selectedCustomer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{selectedCustomer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gift className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Grup Pelanggan: <strong className="text-slate-800 font-bold">{selectedCustomer.group}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Loyalty rewards status */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span>Status Reward & Wallet</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-left">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">Poin Akumulatif</span>
                            <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">{selectedCustomer.membershipPoints} Pts</span>
                          </div>
                          <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-left">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">Saldo Cashback</span>
                            <span className="text-sm font-bold text-emerald-600 font-mono mt-0.5 block">Rp {selectedCustomer.cashbackBalance.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {selectedCustomer.address && (
                        <div className="pt-3 border-t border-slate-200/50 mt-3 text-xs text-slate-600">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Alamat Pengiriman Utama:</span>
                          <p className="leading-snug text-left text-slate-800 font-medium">{selectedCustomer.address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Konveksi/Custom Order sewing history for this customer */}
                  <div className="border border-slate-100 rounded-2xl bg-white p-4">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                      <ShoppingBag className="h-4 w-4 text-slate-800" />
                      <span>Riwayat Pesanan Konveksi & Jahit Custom ({customerOrders.length})</span>
                    </h4>

                    {customerOrders.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Belum ada pesanan seragam/atribut konveksi atas nama pelanggan ini.
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl text-xs text-slate-700">
                        {customerOrders.map((co) => (
                          <div key={co.id} className="p-3 hover:bg-slate-50 flex justify-between items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-slate-900">{co.orderNo}</span>
                                <span className="font-bold text-slate-800">{co.itemName}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Qty: <strong className="text-slate-600">{co.quantity} pcs</strong> | Ukuran: <strong className="text-slate-600">{co.size}</strong> | Jatuh Tempo: <strong className="text-slate-600">{co.dueDate}</strong>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase font-mono">
                                {co.status}
                              </span>
                              <p className="text-[10px] font-bold text-slate-900 font-mono mt-1">Rp {co.totalPrice.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer tools */}
                  <div className="flex gap-2 justify-between border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus kontak "${selectedCustomer.name}" dari database?`)) {
                          deleteCustomer(selectedCustomer.id);
                          setSelectedCustomer(null);
                        }
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold text-xs rounded-xl transition flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus Kontak</span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                      >
                        Tutup
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit Profil</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
