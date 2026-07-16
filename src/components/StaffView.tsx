/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Plus,
  Clock,
  Briefcase,
  TrendingUp,
  Coins,
  X,
  MapPin,
  CalendarCheck,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Key,
  FileSpreadsheet,
  Award,
  ChevronRight,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { Staff, Order } from '../types';

export default function StaffView() {
  const {
    staffList,
    addStaff,
    editStaff,
    deleteStaff,
    updateStaffCommission,
    addAuditLog,
    orders,
    konveksiOrders,
    pullStaffFromGoogleSheets
  } = useApp();

  const [loadingSync, setLoadingSync] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Form states (Add)
  const [name, setName] = useState('');
  const [role, setRole] = useState<Staff['role']>('CASHIER');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [commissionRate, setCommissionRate] = useState('2'); // default 2%
  const [salary, setSalary] = useState('1800000'); // default basic salary
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState<Record<string, boolean>>({});

  // Form states (Edit)
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Staff['role']>('CASHIER');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCommissionRate, setEditCommissionRate] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editPin, setEditPin] = useState('');

  // Individual Staff Turnover Calculations
  const staffStats = useMemo(() => {
    const stats: Record<string, { totalOmset: number; transactionsCount: number; commission: number; recentOrders: Order[] }> = {};

    staffList.forEach((s) => {
      // Filter transactions handled by this employee as Cashier
      const sOrders = orders.filter((o) => o.cashierId === s.id);
      const totalOmset = sOrders.reduce((sum, o) => sum + o.total, 0);
      const transactionsCount = sOrders.length;
      const commission = (totalOmset * s.commissionRate) / 100;

      stats[s.id] = {
        totalOmset,
        transactionsCount,
        commission,
        recentOrders: sOrders.slice(0, 10) // Get top 10 recent orders
      };
    });

    return stats;
  }, [staffList, orders]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStaff({
      name,
      role,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@kepanduan.id`,
      commissionRate: parseFloat(commissionRate) || 0,
      basicSalary: parseFloat(salary) || 0,
      attendanceStatus: 'PRESENT',
      pin: pin || Math.floor(1000 + Math.random() * 9000).toString() // Auto-generate if blank
    });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const original = staffList.find((s) => s.id === editId);
    if (!original) return;

    editStaff({
      ...original,
      name: editName,
      role: editRole,
      phone: editPhone,
      email: editEmail,
      commissionRate: parseFloat(editCommissionRate) || 0,
      basicSalary: parseFloat(editSalary) || 0,
      pin: editPin || '1234'
    });
    setShowEditModal(false);
  };

  const handleDeleteClick = (id: string, staffName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus karyawan "${staffName}"? Semua data shift & riwayat login akan diarsipkan.`)) {
      deleteStaff(id);
    }
  };

  const openEditModal = (s: Staff) => {
    setEditId(s.id);
    setEditName(s.name);
    setEditRole(s.role);
    setEditPhone(s.phone);
    setEditEmail(s.email || '');
    setEditCommissionRate(s.commissionRate.toString());
    setEditSalary((s.basicSalary || 0).toString());
    setEditPin(s.pin || '1234');
    setShowEditModal(true);
  };

  const openDetailModal = (s: Staff) => {
    setSelectedStaff(s);
    setShowDetailModal(true);
  };

  const toggleShowPin = (id: string) => {
    setShowPin((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const attendanceLogs = [
    { name: 'Kak Kak Adhyaksa', date: '2026-07-15', checkIn: '07:45', checkOut: '16:05', status: 'ON_TIME' },
    { name: 'Siti Aminah (Cashier 1)', date: '2026-07-15', checkIn: '08:02', checkOut: '16:00', status: 'LATE' },
    { name: 'Kak Atalia', date: '2026-07-14', checkIn: '07:50', checkOut: '16:10', status: 'ON_TIME' }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Karyawan & Komisi Kehadiran</h2>
          <p className="text-xs text-slate-500">Kelola roster akun karyawan, atur komisi penjualan kasir, otorisasi PIN login, dan pantau log absensi.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={loadingSync}
            onClick={async () => {
              setLoadingSync(true);
              try {
                await pullStaffFromGoogleSheets();
                alert('Berhasil menyinkronkan data karyawan langsung dari Google Sheets!');
              } catch (err: any) {
                alert(`Gagal menyinkronkan data: ${err.message || err}`);
              } finally {
                setLoadingSync(false);
              }
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingSync ? 'animate-spin' : ''}`} />
            <span>{loadingSync ? 'Menyinkronkan...' : 'Sinkron Google Sheet'}</span>
          </button>

          <button
            onClick={() => {
              setName('');
              setPhone('');
              setEmail('');
              setRole('CASHIER');
              setCommissionRate('2');
              setSalary('1800000');
              setPin(Math.floor(1000 + Math.random() * 9000).toString()); // Pre-fill with random 4 digits
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Staff Baru</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Staff cards roster list (Col span 7) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-indigo-500" />
            <span>Roster & Rekapan Omset Karyawan</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.map((s) => {
              const stats = staffStats[s.id] || { totalOmset: 0, transactionsCount: 0, commission: 0 };
              const isPinVisible = showPin[s.id];

              return (
                <div key={s.id} className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-3 relative group">
                  <div className="flex justify-between items-start gap-2 border-b pb-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs leading-none">{s.name}</h4>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1">{s.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                        s.role === 'OWNER' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                        s.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        s.role === 'MANAGER' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {s.role}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Turnover stats (Rekapan Omset) */}
                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 text-[11px] font-medium text-slate-600">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <TrendingUp className="h-3 w-3 text-indigo-500" />
                        Total Omset:
                      </span>
                      <span className="font-bold text-slate-900 font-mono">Rp {stats.totalOmset.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Coins className="h-3 w-3 text-emerald-500" />
                        Komisi Kasir:
                      </span>
                      <span className="font-bold text-emerald-600 font-mono">
                        {s.commissionRate}% (Rp {stats.commission.toLocaleString('id-ID')})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <FileSpreadsheet className="h-3 w-3 text-amber-500" />
                        Transaksi POS:
                      </span>
                      <span className="font-bold text-slate-800 font-mono">{stats.transactionsCount} Nota</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Gaji Pokok:</span>
                      <span className="font-mono font-bold text-slate-700">Rp {(s.basicSalary || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 items-center">
                      <span>PIN Login:</span>
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700">
                        <span>{isPinVisible ? (s.pin || '1234') : '••••'}</span>
                        <button
                          type="button"
                          onClick={() => toggleShowPin(s.id)}
                          className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                          title="Tampilkan PIN"
                        >
                          {isPinVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between gap-1">
                    <button
                      onClick={() => openDetailModal(s)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition flex items-center gap-0.5"
                    >
                      <span>Lihat Rekap</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-100 rounded-lg transition"
                        title="Edit Karyawan"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(s.id, s.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 rounded-lg transition"
                        title="Hapus Karyawan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance log table (Col span 4) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5 border-b pb-2">
            <CalendarCheck className="h-4.5 w-4.5 text-indigo-500" />
            <span>Log Kehadiran Absensi Karyawan</span>
          </h3>

          <div className="space-y-3">
            {attendanceLogs.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold">
                <div>
                  <span className="font-bold text-slate-800 block">{log.name}</span>
                  <span className="text-[10px] text-slate-400">Tanggal: {log.date}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-slate-800 block">In: {log.checkIn} | Out: {log.checkOut}</span>
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.2 rounded-full ${
                    log.status === 'ON_TIME' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {log.status === 'ON_TIME' ? 'On Time' : 'Telat'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* DIALOG ADD STAFF */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Tambah Karyawan Baru</h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div>
                <label className="block mb-1">Nama Lengkap Staff</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ahmad Fauzi"
                />
              </div>

              <div>
                <label className="block mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block mb-1">Email Karyawan (Opsional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                  placeholder="fauzi@kepanduan.id"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Hak Akses Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="CASHIER">CASHIER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="OWNER">OWNER</option>
                    <option value="WAREHOUSE">WAREHOUSE</option>
                    <option value="ACCOUNTANT">ACCOUNTANT</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">PIN Login (4-digit)</label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center font-bold"
                    placeholder="1234"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Rate Komisi (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1">Gaji Pokok Dasar (Rp)</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-sm"
            >
              Simpan & Daftarkan Staff
            </button>
          </form>
        </div>
      )}

      {/* DIALOG EDIT STAFF */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Data Karyawan</h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div>
                <label className="block mb-1">Nama Lengkap Staff</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1">Email Karyawan</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Hak Akses Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="CASHIER">CASHIER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="OWNER">OWNER</option>
                    <option value="WAREHOUSE">WAREHOUSE</option>
                    <option value="ACCOUNTANT">ACCOUNTANT</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">PIN Login (4-digit)</label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Rate Komisi (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editCommissionRate}
                    onChange={(e) => setEditCommissionRate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1">Gaji Pokok Dasar (Rp)</label>
                  <input
                    type="number"
                    required
                    value={editSalary}
                    onChange={(e) => setEditSalary(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-sm"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      )}

      {/* DIALOG DETAIL STAFF REKAPAN OMSET */}
      {showDetailModal && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl relative text-left flex flex-col h-[90vh] sm:h-[80vh]">
            <button
              type="button"
              onClick={() => setShowDetailModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-3.5 border-b pb-4">
              <div className="h-12 w-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-700 font-extrabold text-base shadow-sm">
                {selectedStaff.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-none">{selectedStaff.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedStaff.phone} • {selectedStaff.email}</span>
                  <span className="text-[8px] font-bold px-2 py-0.2 bg-slate-100 border text-slate-600 rounded-full">
                    {selectedStaff.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Summary Bento Grid */}
            {(() => {
              const stats = staffStats[selectedStaff.id] || { totalOmset: 0, transactionsCount: 0, commission: 0, recentOrders: [] };
              const sKonveksi = konveksiOrders.filter((o) => o.assignedStaff === selectedStaff.name);

              return (
                <div className="flex-1 overflow-y-auto pt-4 space-y-5 scrollbar-thin">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-3.5 rounded-2xl border border-indigo-100">
                      <span className="text-[10px] text-indigo-500 font-extrabold tracking-wider block mb-1">TOTAL OMSET (POS)</span>
                      <span className="text-base font-black text-indigo-900 font-mono">Rp {stats.totalOmset.toLocaleString('id-ID')}</span>
                      <span className="text-[9px] text-indigo-500 block mt-1">Total volume transaksi selesai</span>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3.5 rounded-2xl border border-emerald-100">
                      <span className="text-[10px] text-emerald-500 font-extrabold tracking-wider block mb-1">KOMISI TERKUMPUL</span>
                      <span className="text-base font-black text-emerald-900 font-mono">Rp {stats.commission.toLocaleString('id-ID')}</span>
                      <span className="text-[9px] text-emerald-500 block mt-1">Perkiraan bonus rate {selectedStaff.commissionRate}%</span>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-3.5 rounded-2xl border border-amber-100">
                      <span className="text-[10px] text-amber-500 font-extrabold tracking-wider block mb-1">TRANSAKSI DIKASIRKAN</span>
                      <span className="text-base font-black text-amber-900 font-mono">{stats.transactionsCount} Nota</span>
                      <span className="text-[9px] text-amber-500 block mt-1">Rata-rata ticket size: Rp {stats.transactionsCount > 0 ? Math.floor(stats.totalOmset / stats.transactionsCount).toLocaleString('id-ID') : 0}</span>
                    </div>
                  </div>

                  {/* Recent Orders List */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4 text-slate-400" />
                      <span>Daftar Transaksi Kasir Terakhir</span>
                    </h4>

                    {stats.recentOrders.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 border border-dashed rounded-xl">Belum ada riwayat transaksi POS atas nama kasir ini.</p>
                    ) : (
                      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
                        {stats.recentOrders.map((ord) => (
                          <div key={ord.id} className="p-3 hover:bg-slate-50/50 flex justify-between items-center text-xs transition">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 block">{ord.orderNo}</span>
                              <span className="text-[10px] text-slate-400 block">{new Date(ord.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-950 block">Rp {ord.total.toLocaleString('id-ID')}</span>
                              <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{ord.paymentMethod}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assigned Konveksi Orders List */}
                  <div className="space-y-2.5 pb-2">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>Penugasan Konveksi ({sKonveksi.length} Jahitan)</span>
                    </h4>

                    {sKonveksi.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 border border-dashed rounded-xl">Karyawan ini tidak sedang ditugaskan dalam pesanan jahit konveksi.</p>
                    ) : (
                      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
                        {sKonveksi.map((ko) => (
                          <div key={ko.id} className="p-3 hover:bg-slate-50/50 flex justify-between items-center text-xs transition">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 block">{ko.orderNo} • {ko.itemName}</span>
                              <span className="text-[10px] text-slate-400 block">Jatuh Tempo: {ko.dueDate} • Qty: {ko.quantity} pcs (Size: {ko.size})</span>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                ko.status === 'READY' || ko.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                                ko.status === 'SEWING' || ko.status === 'FINISHING' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-slate-50 text-slate-500'
                              }`}>
                                {ko.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
