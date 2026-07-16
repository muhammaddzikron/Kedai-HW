/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { KonveksiOrder } from '../types';
import {
  Scissors,
  Plus,
  Search,
  User,
  Clock,
  Shirt,
  Coins,
  CheckCircle,
  TrendingUp,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

export default function KonveksiView() {
  const { konveksiOrders, addKonveksiOrder, updateKonveksiOrderStatus, staff, addAuditLog } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [itemName, setItemName] = useState('Seragam Putih SD Lengan Pendek');
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL' | 'CUSTOM'>('M');
  const [dueDate, setDueDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(120000);
  const [depositPaid, setDepositPaid] = useState(50000);
  const [notes, setNotes] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');

  // Custom measurements state
  const [shoulderWidth, setShoulderWidth] = useState('');
  const [chestCircumference, setChestCircumference] = useState('');
  const [sleeveLength, setSleeveLength] = useState('');
  const [shirtLength, setShirtLength] = useState('');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return konveksiOrders.filter((o) => {
      const matchesSearch =
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.itemName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatusFilter === 'ALL' || o.status === selectedStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [konveksiOrders, searchQuery, selectedStatusFilter]);

  // Production statistics
  const stats = useMemo(() => {
    const total = konveksiOrders.length;
    const queued = konveksiOrders.filter((o) => o.status === 'QUEUED').length;
    const active = konveksiOrders.filter((o) => ['CUTTING', 'SEWING', 'FINISHING'].includes(o.status)).length;
    const ready = konveksiOrders.filter((o) => o.status === 'READY').length;
    const completed = konveksiOrders.filter((o) => o.status === 'DELIVERED').length;
    
    const totalRevenue = konveksiOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalDeposits = konveksiOrders.reduce((sum, o) => sum + o.depositPaid, 0);
    const totalRemaining = konveksiOrders.reduce((sum, o) => sum + o.remainingPayment, 0);

    return { total, queued, active, ready, completed, totalRevenue, totalDeposits, totalRemaining };
  }, [konveksiOrders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !dueDate) {
      alert('Harap isi Nama Pelanggan dan Tenggat Waktu!');
      return;
    }

    const priceNum = Number(totalPrice) || 0;
    const depositNum = Number(depositPaid) || 0;
    const remainingNum = Math.max(0, priceNum - depositNum);

    const measurementsObj = size === 'CUSTOM' ? {
      shoulderWidth: shoulderWidth ? Number(shoulderWidth) : undefined,
      chestCircumference: chestCircumference ? Number(chestCircumference) : undefined,
      sleeveLength: sleeveLength ? Number(sleeveLength) : undefined,
      shirtLength: shirtLength ? Number(shirtLength) : undefined
    } : undefined;

    addKonveksiOrder({
      customerName,
      customerPhone,
      itemName,
      quantity: Number(quantity) || 1,
      size,
      measurements: measurementsObj,
      dueDate,
      status: 'QUEUED',
      notes,
      totalPrice: priceNum,
      depositPaid: depositNum,
      remainingPayment: remainingNum,
      assignedStaff: assignedStaff || undefined
    });

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setItemName('Seragam Putih SD Lengan Pendek');
    setQuantity(1);
    setSize('M');
    setDueDate('');
    setTotalPrice(120000);
    setDepositPaid(50000);
    setNotes('');
    setAssignedStaff('');
    setShoulderWidth('');
    setChestCircumference('');
    setSleeveLength('');
    setShirtLength('');
    setShowAddModal(false);
  };

  const getStatusBadge = (status: KonveksiOrder['status']) => {
    switch (status) {
      case 'QUEUED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'CUTTING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SEWING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse';
      case 'FINISHING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'READY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DELIVERED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-500';
    }
  };

  const getStatusLabel = (status: KonveksiOrder['status']) => {
    switch (status) {
      case 'QUEUED': return 'Menunggu Antrean';
      case 'CUTTING': return 'Pemotongan Kain';
      case 'SEWING': return 'Proses Menjahit';
      case 'FINISHING': return 'Finishing & QC';
      case 'READY': return 'Siap Diambil';
      case 'DELIVERED': return 'Selesai & Diambil';
      default: return status;
    }
  };

  const handlePrintProductionSpk = (order: KonveksiOrder) => {
    addAuditLog('PRINT_SPK', 'KONVEKSI', `Cetak Surat Perintah Kerja (SPK) untuk order ${order.orderNo}`);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up terblokir oleh browser! Harap izinkan pop-up.');
      return;
    }

    const spkHTML = `
      <html>
        <head>
          <title>SPK-${order.orderNo}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: 20px; line-height: 1.4; color: #000; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .title { font-size: 16px; font-weight: bold; text-transform: uppercase; }
            .meta-table, .measure-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .meta-table td { padding: 4px 0; }
            .measure-table th, .measure-table td { border: 1px solid #000; padding: 6px; text-align: center; }
            .section-title { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
            .sign-box { text-align: center; width: 150px; }
            .sign-space { height: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">SURAT PERINTAH KERJA (SPK) KONVEKSI</div>
            <div style="font-size: 10px;">PRODUKSI SERAGAM & ATRIBUT SEKOLAH</div>
            <div style="font-weight: bold;">NO ORDER: ${order.orderNo}</div>
          </div>

          <table class="meta-table">
            <tr>
              <td style="width: 15%;">Pelanggan:</td>
              <td style="width: 35%; font-weight: bold;">${order.customerName} (${order.customerPhone || '-'})</td>
              <td style="width: 15%;">Tgl Selesai:</td>
              <td style="width: 35%; font-weight: bold; color: red;">${new Date(order.dueDate).toLocaleDateString('id-ID')}</td>
            </tr>
            <tr>
              <td>Produk:</td>
              <td style="font-weight: bold;">${order.itemName}</td>
              <td>Jumlah:</td>
              <td style="font-weight: bold;">${order.quantity} Pcs</td>
            </tr>
            <tr>
              <td>Ukuran:</td>
              <td style="font-weight: bold;">${order.size}</td>
              <td>Desainer/Staf:</td>
              <td>${order.assignedStaff || 'Belum ditunjuk'}</td>
            </tr>
          </table>

          ${order.size === 'CUSTOM' && order.measurements ? `
            <div class="section-title">Detail Ukuran Custom (Cm)</div>
            <table class="measure-table">
              <thead>
                <tr>
                  <th>Lebar Bahu</th>
                  <th>Lingkar Dada</th>
                  <th>Panjang Lengan</th>
                  <th>Panjang Baju</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${order.measurements.shoulderWidth || '-'} cm</td>
                  <td>${order.measurements.chestCircumference || '-'} cm</td>
                  <td>${order.measurements.sleeveLength || '-'} cm</td>
                  <td>${order.measurements.shirtLength || '-'} cm</td>
                </tr>
              </tbody>
            </table>
          ` : ''}

          <div class="section-title">Catatan Instruksi Jahit / Khusus</div>
          <div style="min-height: 50px; border: 1px solid #000; padding: 10px; background-color: #fcfcfc;">
            ${order.notes || 'Tidak ada catatan instruksi khusus.'}
          </div>

          <div class="section-title">Rincian Finansial</div>
          <table class="meta-table">
            <tr>
              <td style="width: 25%;">Total Biaya:</td>
              <td style="width: 25%;">Rp ${order.totalPrice.toLocaleString('id-ID')}</td>
              <td style="width: 25%;">DP (Uang Muka):</td>
              <td style="width: 25%;">Rp ${order.depositPaid.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>Sisa Pembayaran:</td>
              <td style="font-weight: bold; color: ${order.remainingPayment > 0 ? 'red' : 'green'};">
                Rp ${order.remainingPayment.toLocaleString('id-ID')} ${order.remainingPayment > 0 ? '(BELUM LUNAS)' : '(LUNAS)'}
              </td>
              <td>Status Produksi:</td>
              <td>${getStatusLabel(order.status).toUpperCase()}</td>
            </tr>
          </table>

          <div class="footer">
            <div class="sign-box">
              <div>Pembuat Perintah</div>
              <div class="sign-space"></div>
              <div style="border-top: 1px solid #000;">( Admin Kasir )</div>
            </div>
            <div class="sign-box">
              <div>Penerima Tugas</div>
              <div class="sign-space"></div>
              <div style="border-top: 1px solid #000;">( ${order.assignedStaff || 'Bagian Produksi'} )</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(spkHTML);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Scissors className="h-5 w-5 text-indigo-600" />
            <span>Manajemen Produksi Konveksi & Custom Uniform</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kelola pesanan jahit kustom seragam sekolah, kelola antrean potong jahit, serta pantau progres penjahit Anda secara realtime.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Pesanan Jahit Baru</span>
        </button>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 rounded-xl border">
            <Layers className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none mb-1">TOTAL ANTRIAN</span>
            <span className="text-lg font-extrabold text-slate-900">{stats.total} Pesanan</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
            <Shirt className="h-5 w-5 text-indigo-600 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-500 font-bold block uppercase leading-none mb-1">AKTIF DIJAHIT</span>
            <span className="text-lg font-extrabold text-indigo-700">{stats.active} Proses</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-500 font-bold block uppercase leading-none mb-1">SIAP DIAMBIL</span>
            <span className="text-lg font-extrabold text-emerald-700">{stats.ready} Pesanan</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <Coins className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none mb-1">PIUTANG ANTREAN</span>
            <span className="text-lg font-extrabold text-slate-900 text-rose-600">Rp {stats.totalRemaining.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Production pipeline visual layout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">Roster Antrean Produksi</span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-150">
              {filteredOrders.length} Order
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, No order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 border rounded-xl text-xs font-semibold focus:outline-none focus:bg-white w-48"
              />
            </div>

            {/* Status dropdown filter */}
            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border">
              {['ALL', 'QUEUED', 'CUTTING', 'SEWING', 'FINISHING', 'READY', 'DELIVERED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-tight transition-all uppercase ${
                    selectedStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st === 'ALL' ? 'Semua' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Kanban Board of Production */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((o) => (
            <div
              key={o.id}
              className="border border-slate-200 hover:border-slate-300 rounded-2xl p-4 bg-slate-50/30 hover:bg-white transition-all space-y-3 flex flex-col justify-between shadow-sm relative group"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 font-mono tracking-wider block">
                      {o.orderNo}
                    </span>
                    <h4 className="font-extrabold text-slate-850 text-xs mt-0.5 leading-snug">
                      {o.customerName}
                    </h4>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getStatusBadge(o.status)}`}>
                    {getStatusLabel(o.status)}
                  </span>
                </div>

                <div className="p-3 bg-slate-100/40 rounded-xl border border-slate-200/50 space-y-1.5 text-[11px] font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Produk Jahit:</span>
                    <span className="text-slate-900 font-bold truncate max-w-[150px]">{o.itemName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jumlah:</span>
                    <span className="text-slate-900 font-bold">{o.quantity} Pcs ({o.size})</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Tenggat Produksi:</span>
                    <span className="font-bold flex items-center gap-1 font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(o.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {o.assignedStaff && (
                    <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100 mt-1">
                      <span>Penjahit Tugas:</span>
                      <span className="text-indigo-600 font-bold flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {o.assignedStaff}
                      </span>
                    </div>
                  )}
                </div>

                {/* Measurements sheet preview if custom size */}
                {o.size === 'CUSTOM' && o.measurements && (
                  <div className="p-2.5 bg-yellow-50/50 border border-yellow-100 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-yellow-800 uppercase tracking-widest block">📝 UKURAN BADAN (CM)</span>
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-mono font-bold text-slate-700">
                      <div className="bg-white p-1 rounded border border-yellow-100/70">
                        <span className="text-[8px] text-slate-400 block font-sans">Bahu</span>
                        {o.measurements.shoulderWidth}
                      </div>
                      <div className="bg-white p-1 rounded border border-yellow-100/70">
                        <span className="text-[8px] text-slate-400 block font-sans">Dada</span>
                        {o.measurements.chestCircumference}
                      </div>
                      <div className="bg-white p-1 rounded border border-yellow-100/70">
                        <span className="text-[8px] text-slate-400 block font-sans">Lengan</span>
                        {o.measurements.sleeveLength}
                      </div>
                      <div className="bg-white p-1 rounded border border-yellow-100/70">
                        <span className="text-[8px] text-slate-400 block font-sans">Baju</span>
                        {o.measurements.shirtLength}
                      </div>
                    </div>
                  </div>
                )}

                {o.notes && (
                  <p className="text-[10px] text-slate-400 italic font-medium leading-tight px-1">
                    "{o.notes}"
                  </p>
                )}
              </div>

              {/* Status workflow triggers */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-left text-[10px] font-bold">
                  <span className="text-slate-400 block leading-none mb-1">SISA BILL</span>
                  <span className={o.remainingPayment > 0 ? 'text-rose-600' : 'text-emerald-600 font-extrabold'}>
                    {o.remainingPayment > 0 ? `Rp ${o.remainingPayment.toLocaleString()}` : 'Lunas'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePrintProductionSpk(o)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Cetak SPK Kerja"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>

                  {/* Status transition dropdown trigger selector */}
                  <select
                    value={o.status}
                    onChange={(e) => updateKonveksiOrderStatus(o.id, e.target.value as any)}
                    className="px-2 py-1 bg-white border text-[10px] font-bold text-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="QUEUED">Antrean</option>
                    <option value="CUTTING">Pemotongan</option>
                    <option value="SEWING">Menjahit</option>
                    <option value="FINISHING">Finishing/QC</option>
                    <option value="READY">Siap Diambil</option>
                    <option value="DELIVERED">Diambil (Lunas)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-400 text-center">
              <Shirt className="h-8 w-8 mb-1.5 text-slate-300 animate-bounce" />
              <p className="text-xs font-bold">Tidak ada antrean pesanan jahit</p>
              <p className="text-[10px] text-slate-400">Silakan buat baru atau ubah status filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE CUSTOM ORDER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Scissors className="h-4.5 w-4.5 text-indigo-600" />
              <span>Formulir SPK Pesanan Jahit Konveksi</span>
            </h3>
            <p className="text-[10px] text-slate-400">Buat pesanan seragam kustom dengan pencatatan ukuran presisi.</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              
              {/* Customer details row */}
              <div className="grid grid-cols-2 gap-3 font-semibold text-slate-600">
                <div>
                  <label className="block mb-1">Nama Pelanggan / Sekolah</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Nomor Telepon WA</label>
                  <input
                    type="text"
                    placeholder="0812345..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Item selection & due date */}
              <div className="grid grid-cols-2 gap-3 font-semibold text-slate-600">
                <div>
                  <label className="block mb-1">Nama Produk Seragam / Atribut</label>
                  <select
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none text-xs"
                  >
                    <option value="Seragam Batik SD Lengan Pendek">Seragam Batik SD Lengan Pendek</option>
                    <option value="Seragam Putih SD Lengan Pendek">Seragam Putih SD Lengan Pendek</option>
                    <option value="Seragam Merah SD Lengan Panjang">Seragam Merah SD Lengan Panjang</option>
                    <option value="Seragam Pramuka Penggalang SMP">Seragam Pramuka Penggalang SMP</option>
                    <option value="Jas Almamater OSIS SMA">Jas Almamater OSIS SMA</option>
                    <option value="Kaos Olahraga Sekolah Custom">Kaos Olahraga Sekolah Custom</option>
                    <option value="Dasi Sablon Logo Sekolah">Dasi Sablon Logo Sekolah</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-rose-600">Tenggat Waktu Selesai (Due Date)</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none font-semibold text-xs text-rose-600"
                  />
                </div>
              </div>

              {/* Quantity, size and custom tailor selection */}
              <div className="grid grid-cols-3 gap-3 font-semibold text-slate-600">
                <div>
                  <label className="block mb-1">Jumlah (Pcs)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Ukuran Standard</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none text-xs"
                  >
                    <option value="S">Ukuran S</option>
                    <option value="M">Ukuran M</option>
                    <option value="L">Ukuran L</option>
                    <option value="XL">Ukuran XL</option>
                    <option value="XXL">Ukuran XXL</option>
                    <option value="CUSTOM">Custom Sendiri</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Penjahit Bertanggungjawab</label>
                  <select
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none text-xs"
                  >
                    <option value="">Pilih Penjahit...</option>
                    <option value="Ahmad Penjahit">Ahmad Penjahit</option>
                    <option value="Siti Aminah">Siti Aminah (Staf)</option>
                    <option value="Bu Retno">Bu Retno</option>
                    <option value="Mesin Bordir Komputer">Mesin Bordir Komputer</option>
                  </select>
                </div>
              </div>

              {/* Conditional custom measurements input form */}
              {size === 'CUSTOM' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200/80 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-yellow-800 tracking-wider block">📐 PENCATATAN UKURAN DETIL BADAN (CM)</span>
                  <div className="grid grid-cols-4 gap-2 font-mono font-bold">
                    <div>
                      <label className="block text-[8px] font-sans text-slate-500 mb-0.5">Lebar Bahu</label>
                      <input
                        type="number"
                        placeholder="cm"
                        value={shoulderWidth}
                        onChange={(e) => setShoulderWidth(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-yellow-200 rounded text-center text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-sans text-slate-500 mb-0.5">Lingkar Dada</label>
                      <input
                        type="number"
                        placeholder="cm"
                        value={chestCircumference}
                        onChange={(e) => setChestCircumference(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-yellow-200 rounded text-center text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-sans text-slate-500 mb-0.5">Pjg Lengan</label>
                      <input
                        type="number"
                        placeholder="cm"
                        value={sleeveLength}
                        onChange={(e) => setSleeveLength(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-yellow-200 rounded text-center text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-sans text-slate-500 mb-0.5">Pjg Baju</label>
                      <input
                        type="number"
                        placeholder="cm"
                        value={shirtLength}
                        onChange={(e) => setShirtLength(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-yellow-200 rounded text-center text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Price estimation & DP block */}
              <div className="grid grid-cols-2 gap-3 font-semibold text-slate-600">
                <div>
                  <label className="block mb-1">Total Harga Produksi (Rp)</label>
                  <input
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">DP / Uang Muka Dibayar (Rp)</label>
                  <input
                    type="number"
                    value={depositPaid}
                    onChange={(e) => setDepositPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none font-bold text-emerald-600"
                  />
                </div>
              </div>

              {/* Special Notes & instructions */}
              <div className="font-semibold text-slate-600">
                <label className="block mb-1">Catatan Khusus Instruksi Produksi</label>
                <textarea
                  rows={2}
                  placeholder="Tambahan bordir logo, model saku, saku bobok, dsb..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/10 transition mt-2"
              >
                Simpan & Terbitkan Surat Perintah Kerja (SPK)
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
