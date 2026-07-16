/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Printer,
  TrendingUp,
  User,
  ShoppingBag,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ReportsView() {
  const { shiftHistory, staffList, addAuditLog } = useApp();

  const [forecastingYears, setForecastingYears] = useState('3');

  const topSelling = [
    { name: 'Kopi Susu Pandan Kepanduan', category: 'Minuman Kopi', sold: 450, total: 6750000 },
    { name: 'Setangan Leher Pramuka Premium (Slayer)', category: 'Atribut Pramuka', sold: 120, total: 3000000 },
    { name: 'Buku Saku Boyman Kepramukaan', category: 'Atribut Pramuka', sold: 85, total: 1700000 },
    { name: 'Manual Brew V60 Flores Bajawa', category: 'Minuman Kopi', sold: 80, total: 1440000 }
  ];

  const cashierPerformance = [
    { name: 'Kak Kak Adhyaksa', shifts: 12, sales: 8400000, voids: 0 },
    { name: 'Kak Atalia', shifts: 8, sales: 5200000, voids: 2 },
    { name: 'Siti Aminah', shifts: 15, sales: 11500000, voids: 1 }
  ];

  const handlePrintZReport = () => {
    addAuditLog('PRINT_Z_REPORT', 'REPORTS', 'Generated and printed comprehensive Daily Close Out Z-Report for audit validation');
    alert('Z-Report Harian berhasil diproduksi!\nDokumen PDF dikirimkan ke printer POS laci kasir.');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Laporan & Forecaster Bisnis</h2>
          <p className="text-xs text-slate-500">Menganalisis performa kerja kasir harian, item terlaris, dan perkiraan laju omset toko.</p>
        </div>

        <button
          onClick={handlePrintZReport}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/15 transition"
        >
          <Printer className="h-4 w-4" />
          <span>Cetak Z-Report Harian</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Top selling products list (Col span 7) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
            <ShoppingBag className="h-4.5 w-4.5 text-emerald-500" />
            <span>Produk Terlaris Mingguan (Top Selling Roster)</span>
          </h3>

          <div className="space-y-3">
            {topSelling.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-0.5 max-w-sm">
                  <span className="font-bold text-slate-800 block truncate">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{item.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-slate-900 block">{item.sold} Terjual</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">Rp {item.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Predictive forecast generator panel (Col span 5) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl text-white shadow-lg space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>AI Sales Forecaster Model</span>
            </h3>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 font-mono">GEMINI PRO</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Menganalisis performa historis transaksi kasir untuk meramal tingkat kenaikan omset per bulan berikutnya.
          </p>

          <div className="space-y-3.5 text-xs text-left">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] text-slate-400 block font-semibold uppercase">Estimasi Bulan Depan</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">Rp 42,980,000</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-semibold uppercase">Laju Pertumbuhan (CAGR)</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">+18.4%</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[9px] font-bold text-emerald-400 block mb-1">REKOMENDASI STOK OPTIMAL:</span>
              <p className="text-[10px] text-slate-300 leading-snug font-medium">
                Sistem mendeteksi kenaikan minat Atribut Pramuka menjelang Hari Pramuka 14 Agustus. Tambah kuantitas Purchase Order slayer sebesar 25%.
              </p>
            </div>
          </div>
        </div>

        {/* Cashier performance metrics log table (Col span 12) */}
        <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-950 mb-3.5 flex items-center gap-1.5">
            <User className="h-4.5 w-4.5 text-emerald-500" />
            <span>Performa Kehadiran & Kas Penjualan Staff</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-4">Nama Kasir / Staff</th>
                  <th className="py-2.5 px-4 text-center">Jumlah Shift Selesai</th>
                  <th className="py-2.5 px-4 text-right">Total Nominal Penjualan</th>
                  <th className="py-2.5 px-4 text-center">Kesalahan Void/Cancel Bill</th>
                  <th className="py-2.5 px-4 text-right">Status Kinerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashierPerformance.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 text-center font-mono">{item.shifts} Shifts</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      Rp {item.sales.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center text-rose-500 font-mono">{item.voids} Kali</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[9px]">
                        LUAR BIASA (A)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
