/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Plus,
  TrendingUp,
  Coins,
  Store,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function BranchesView() {
  const { currentBranch, changeBranch, addAuditLog } = useApp();

  const branches = [
    { id: 'b1', name: 'Kedai Utama Cikutra', address: 'Jl. Cikutra No. 276, Bandung', manager: 'Kak Kak Adhyaksa', status: 'MAIN', devices: 3, cashDrawer: 1250000 },
    { id: 'b2', name: 'Kantin Kwarda Jabar', address: 'Jl. Jenderal Sudirman No. 40, Bandung', manager: 'Kak Atalia', status: 'SATELLITE', devices: 1, cashDrawer: 840000 },
    { id: 'b3', name: 'Hub Pramuka Kwarnas', address: 'Jl. Medan Merdeka Timur No. 6, Jakarta', manager: 'Ahmad Fauzi', status: 'SATELLITE', devices: 2, cashDrawer: 0 }
  ];

  const handleBranchSwitch = (id: string, name: string) => {
    changeBranch(id);
    addAuditLog('SWITCH_BRANCH', 'BRANCHES', `Switched active POS console focus to branch: ${name}`);
    alert(`Konsol Kasir dialihkan ke: ${name}`);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Multi-Cabang (Branches)</h2>
          <p className="text-xs text-slate-500">Kelola toko fisik satelit, pantau perangkat terminal kasir aktif, dan sinkronkan stok pusat.</p>
        </div>

        <button
          onClick={() => alert('Fitur Enterprise: Pembatasan Lisensi Tambah Cabang Baru!\nSilakan hubungi admin pengembang pusat Kwarda.')}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Daftarkan Cabang Baru</span>
        </button>
      </div>

      {/* Branches List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {branches.map((b) => {
          const isActive = currentBranch.id === b.id;
          return (
            <div
              key={b.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition ${
                isActive ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200 hover:border-slate-350'
              }`}
            >
              <div className="space-y-3">
                {/* Header branch */}
                <div className="flex justify-between items-start gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                      <Building className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-950 text-xs leading-none">{b.name}</h3>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1">Manager: {b.manager}</span>
                    </div>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${b.status === 'MAIN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-600 border'}`}>
                    {b.status}
                  </span>
                </div>

                {/* Info block */}
                <div className="space-y-1.5 text-[11px] text-slate-600 font-semibold">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{b.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Terminal Aktif:</span>
                    <span>{b.devices} POS Terminal</span>
                  </div>
                </div>
              </div>

              {/* Cash Drawer Status */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Laci Kasir (Cash Drawer)</span>
                <span className="font-mono font-bold text-slate-800">Rp {b.cashDrawer.toLocaleString()}</span>
              </div>

              {/* Action active switch */}
              {isActive ? (
                <div className="w-full py-2 bg-emerald-500 text-white font-extrabold text-[10px] uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Sedang Aktif Terpilih</span>
                </div>
              ) : (
                <button
                  onClick={() => handleBranchSwitch(b.id, b.name)}
                  className="w-full py-2 bg-slate-900 hover:bg-black text-white font-extrabold text-[10px] uppercase rounded-xl transition"
                >
                  Pilih Cabang Ini
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
