/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Package,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Plus,
  TrendingUp,
  Sliders,
  Warehouse,
  History
} from 'lucide-react';

export default function InventoryView() {
  const { products, inventoryMovements, adjustStock, transferStock, currentBranch } = useApp();

  const [productId, setProductId] = useState(products[0]?.id || '');
  const [adjustQty, setAdjustQty] = useState('');
  const [type, setType] = useState<'ADJUST' | 'TRANSFER'>('ADJUST');
  const [notes, setNotes] = useState('');

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(adjustQty);
    if (!productId || isNaN(qty) || qty === 0) return;

    if (type === 'ADJUST') {
      adjustStock(productId, qty, notes || 'Penyesuaian manual stok');
    } else {
      transferStock(productId, Math.abs(qty), notes || `Transfer ke cabang satelit`);
    }

    setAdjustQty('');
    setNotes('');
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Inventori & Gudang</h2>
        <p className="text-xs text-slate-500">Pantau pergerakan masuk-keluar barang, stok opname (FIFO), dan mutasi antar cabang.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Adjustment & Mutasi Form (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-950 mb-4 flex items-center gap-1.5">
              <Sliders className="h-4.5 w-4.5 text-emerald-500" />
              <span>Input Penyesuaian Stok</span>
            </h3>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
              <div>
                <label className="block mb-1">Pilih Produk</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {products.filter(p => !p.isDeleted).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Jenis Operasi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('ADJUST')}
                    className={`py-1.5 text-center font-bold border rounded-lg transition ${
                      type === 'ADJUST'
                        ? 'border-slate-800 bg-slate-900 text-white'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Stok Opname / Adjust
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('TRANSFER')}
                    className={`py-1.5 text-center font-bold border rounded-lg transition ${
                      type === 'TRANSFER'
                        ? 'border-slate-800 bg-slate-900 text-white'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Mutasi Cabang
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1">
                  {type === 'ADJUST' ? 'Kuantitas Penyesuaian (Gunakan minus untuk mengurangi)' : 'Kuantitas Mutasi (Kirim)'}
                </label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold"
                  placeholder="e.g. -5 atau 10"
                />
              </div>

              <div>
                <label className="block mb-1">Catatan Opname / Dokumen Ref</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Kemasan rusak / Retur pecah / Launching"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition"
              >
                Kirim Pergerakan Stok
              </button>
            </form>
          </div>

          {/* Active Warehouses snippet */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
              <Warehouse className="h-4.5 w-4.5 text-emerald-500" />
              <span>Lokasi Gudang Terdaftar</span>
            </h4>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Gudang Utama Core</span>
                  <span className="text-[10px] text-slate-400">Pusat Hub Logistik Cikutra</span>
                </div>
                <span className="font-bold font-mono text-emerald-600">AKTIF</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs opacity-75">
                <div>
                  <span className="font-bold text-slate-800 block">Gudang Satelit Jakarta</span>
                  <span className="text-[10px] text-slate-400">Gudang transit kwarnas</span>
                </div>
                <span className="font-bold font-mono text-emerald-600">AKTIF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History Stock Movement Log (Col span 8) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-emerald-500" />
                <span>Riwayat Mutasi & Pergerakan Stok (Audit FIFO)</span>
              </h3>
              <p className="text-xs text-slate-400">Log mutasi masuk-keluar real-time</p>
            </div>
            <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-xl text-slate-600 font-bold font-mono">
              {inventoryMovements.length} logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/40">
                  <th className="py-2.5 px-3">Tanggal & Waktu</th>
                  <th className="py-2.5 px-3">Nama Produk</th>
                  <th className="py-2.5 px-3">Tipe</th>
                  <th className="py-2.5 px-3 text-center">Qty Mutasi</th>
                  <th className="py-2.5 px-3">Ref Dokumen</th>
                  <th className="py-2.5 px-3">Keterangan Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {inventoryMovements.map((mvt) => (
                  <tr key={mvt.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      {new Date(mvt.date).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{mvt.productName}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        mvt.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        mvt.type === 'OUT' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {mvt.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold font-mono text-slate-900">
                      {mvt.qty > 0 ? `+${mvt.qty}` : mvt.qty}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-400">{mvt.referenceNo}</td>
                    <td className="py-3 px-3 text-slate-500">{mvt.notes}</td>
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
