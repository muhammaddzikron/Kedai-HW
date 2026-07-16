/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  CalendarCheck
} from 'lucide-react';

export default function StaffView() {
  const { staffList, addStaff, updateStaffCommission, addAuditLog } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CASHIER' | 'OWNER' | 'MANAGER'>('CASHIER');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('2'); // default 2%
  const [salary, setSalary] = useState('1800000'); // default basic salary

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStaff({
      name,
      role,
      phone,
      commissionRate: parseFloat(commissionRate) || 0,
      basicSalary: parseFloat(salary) || 0,
      isLogged: false
    });
    setShowAddModal(false);
  };

  const handleUpdateComm = (id: string, rate: number) => {
    updateStaffCommission(id, rate);
    alert('Komisi sukses diperbaharui!');
  };

  const attendanceLogs = [
    { name: 'Kak Kak Adhyaksa', date: '2026-07-15', checkIn: '07:45', checkOut: '16:05', status: 'ON_TIME' },
    { name: 'Siti Aminah', date: '2026-07-15', checkIn: '08:02', checkOut: '16:00', status: 'LATE' },
    { name: 'Kak Atalia', date: '2026-07-14', checkIn: '07:50', checkOut: '16:10', status: 'ON_TIME' }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Karyawan & Komisi Kehadiran</h2>
          <p className="text-xs text-slate-500">Kelola roster akun karyawan, atur komisi per penjualan kasir, dan pantau log absensi RFID/Pin.</p>
        </div>

        <button
          onClick={() => {
            setName('');
            setPhone('');
            setRole('CASHIER');
            setCommissionRate('2');
            setSalary('1800000');
            setShowAddModal(true);
          }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Staff Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Staff cards roster list (Col span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-emerald-500" />
            <span>Roster & Akun Login Karyawan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staffList.map((s) => (
              <div key={s.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-3">
                <div className="flex justify-between items-start gap-2 border-b pb-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs leading-none">{s.name}</h4>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1">{s.phone}</span>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                    s.role === 'OWNER' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                    s.role === 'ADMIN' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                    {s.role}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Gaji Pokok:</span>
                    <span className="font-mono font-bold text-slate-800">Rp {s.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Komisi Kasir:</span>
                    <span className="font-mono font-bold text-emerald-600">{s.commissionRate}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t flex gap-1">
                  <input
                    type="number"
                    placeholder="Rate %"
                    defaultValue={s.commissionRate}
                    onBlur={(e) => handleUpdateComm(s.id, parseFloat(e.target.value) || 0)}
                    className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-center text-[10px] font-mono font-bold"
                  />
                  <button className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded">
                    Atur Komisi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance log table (Col span 5) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5 border-b pb-2">
            <CalendarCheck className="h-4.5 w-4.5 text-emerald-500" />
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
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
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="08xxxxxxxxxx"
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
                  </select>
                </div>
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

            <button
              type="submit"
              className="w-full mt-6 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition"
            >
              Simpan & Daftarkan Staff
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
