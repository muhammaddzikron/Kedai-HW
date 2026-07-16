/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Tag,
  Plus,
  Gift,
  Ticket,
  Calendar,
  X,
  Sparkles
} from 'lucide-react';

export default function PromotionsView() {
  const { addAuditLog } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [type, setType] = useState<'DISCOUNT' | 'BUY_X_GET_Y'>('DISCOUNT');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [minPurchase, setMinPurchase] = useState('50000');
  const [validUntil, setValidUntil] = useState('2026-12-31');

  // Local promos list
  const [promos, setPromos] = useState([
    { id: '1', code: 'PRAMUKABERSATU', type: 'DISCOUNT', val: 'Diskon 10%', minBuy: 30000, valid: '2026-08-31', status: 'AKTIF' },
    { id: '2', code: 'KOPIJUMAT berkah', type: 'BUY_X_GET_Y', val: 'Beli 2 Kopi Gratis 1 Donat', minBuy: 20000, valid: '2026-09-30', status: 'AKTIF' },
    { id: '3', code: 'HARIPRAMUKA75', type: 'DISCOUNT', val: 'Diskon 15%', minBuy: 75000, valid: '2026-08-15', status: 'DRAFT' }
  ]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPromo = {
      id: `p-${Date.now()}`,
      code: code.toUpperCase(),
      type,
      val: type === 'DISCOUNT' ? `Diskon ${discountPercent}%` : 'Beli 2 Gratis 1',
      minBuy: parseFloat(minPurchase) || 0,
      valid: validUntil,
      status: 'AKTIF'
    };

    setPromos([...promos, newPromo]);
    addAuditLog('CREATE_PROMO', 'PROMOTIONS', `Created promotion voucher: ${newPromo.code}`);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Voucher & Promosi Belanja</h2>
          <p className="text-xs text-slate-500">Buat kupon diskon persentase, promo buy-x-get-y harian, dan pantau masa aktif voucher.</p>
        </div>

        <button
          onClick={() => {
            setCode(`PRAMUKA${Math.floor(10 + Math.random() * 90)}`);
            setType('DISCOUNT');
            setDiscountPercent('10');
            setMinPurchase('30000');
            setShowAddModal(true);
          }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Promo Baru</span>
        </button>
      </div>

      {/* Grid listing of promotions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {promos.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
            
            {/* Ticket cutout notches */}
            <div className="absolute top-1/2 -left-3 h-6 w-6 rounded-full bg-slate-50 border-r" />
            <div className="absolute top-1/2 -right-3 h-6 w-6 rounded-full bg-slate-50 border-l" />

            <div className="space-y-3.5">
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-1.5">
                  <Ticket className="h-4.5 w-4.5 text-emerald-500" />
                  <span className="font-extrabold text-slate-950 text-xs font-mono tracking-wider">{p.code}</span>
                </div>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${p.status === 'AKTIF' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {p.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Skema Promo:</span>
                  <span className="font-extrabold text-slate-800">{p.val}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Min. Belanja:</span>
                  <span className="font-mono">Rp {p.minBuy.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Berlaku S/D:</span>
                  <span className="font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {p.valid}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Tipe: {p.type}</span>
              <button
                onClick={() => {
                  setPromos(promos.filter(item => item.id !== p.id));
                  addAuditLog('DELETE_PROMO', 'PROMOTIONS', `Deactivated promotion voucher: ${p.code}`);
                }}
                className="text-[10px] font-bold text-rose-500 hover:underline"
              >
                Hapus Promo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DIALOG ADD PROMO */}
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

            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-emerald-500" />
              <span>Buat Kupon Promosi Baru</span>
            </h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div>
                <label className="block mb-1">Kode Voucher (Kapital & Unik)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono tracking-wider font-extrabold"
                  placeholder="KODEPROMO"
                />
              </div>

              <div>
                <label className="block mb-1">Kategori Promo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="DISCOUNT">POTONGAN DISKON (%)</option>
                  <option value="BUY_X_GET_Y">BELI X GRATIS Y</option>
                </select>
              </div>

              {type === 'DISCOUNT' && (
                <div>
                  <label className="block mb-1">Persentase Diskon (%)</label>
                  <input
                    type="number"
                    required
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1">Minimum Syarat Belanja (Rp)</label>
                <input
                  type="number"
                  required
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block mb-1">Tanggal Kedaluwarsa</label>
                <input
                  type="date"
                  required
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition"
            >
              Simpan & Aktifkan Voucher
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
