/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Supplier } from '../types';
import {
  Truck,
  Plus,
  Coins,
  X,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';

export default function SuppliersView() {
  const { suppliers, addSupplier, addSupplierDebtPayment } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Debt Payment States
  const [debtAmount, setDebtAmount] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier({
      name,
      code: code || `SPL-${Math.floor(100 + Math.random() * 900)}`,
      contactName,
      phone,
      email,
      address,
      totalPurchase: 0,
      unpaidDebt: 0
    });
    setShowAddModal(false);
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(debtAmount);
    if (!activeSupplier || isNaN(amount) || amount <= 0) return;

    addSupplierDebtPayment(activeSupplier.id, amount);
    setShowDebtModal(false);
    setDebtAmount('');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Mitra Supplier</h2>
          <p className="text-xs text-slate-500">Kelola rincian vendor penyuplai bahan baku, kopi specialty, atribut, dan hutang dagang.</p>
        </div>

        <button
          onClick={() => {
            setName('');
            setCode(`SPL-${Math.floor(10 + Math.random() * 90)}`);
            setContactName('');
            setPhone('');
            setEmail('');
            setAddress('');
            setShowAddModal(true);
          }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Supplier</span>
        </button>
      </div>

      {/* Grid list of Suppliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
            
            {/* Logo/Avatar */}
            <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
              <div className="h-10 w-10 bg-slate-100 border rounded-xl flex items-center justify-center text-slate-500 font-bold">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm">{s.name}</h3>
                <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-50 border border-slate-100 px-1.5 py-0.2 rounded mt-1 inline-block">CODE: {s.code}</span>
              </div>
            </div>

            {/* Contacts details */}
            <div className="space-y-2 text-[11px] text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Pic:</span>
                <span className="text-slate-800 font-bold">{s.contactName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{s.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{s.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{s.address}</span>
              </div>
            </div>

            {/* Debt status and totals */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100/60 text-xs text-left">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Pembelian</span>
                <span className="font-mono font-bold text-slate-800">Rp {s.totalPurchase.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Hutang Dagang</span>
                <span className={`font-mono font-extrabold block ${s.unpaidDebt > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                  Rp {s.unpaidDebt.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Debt payment trigger */}
            {s.unpaidDebt > 0 && (
              <button
                onClick={() => {
                  setActiveSupplier(s);
                  setDebtAmount(s.unpaidDebt.toString());
                  setShowDebtModal(true);
                }}
                className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[10px] font-bold text-amber-700 rounded-lg transition"
              >
                Bayar Cicilan Hutang
              </button>
            )}
          </div>
        ))}
      </div>

      {/* DIALOG ADD SUPPLIER */}
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

            <h3 className="text-base font-bold text-slate-900 mb-4">Tambah Supplier Baru</h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div>
                <label className="block mb-1">Nama Perusahaan Vendor</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="PT Kopi Kita"
                />
              </div>

              <div>
                <label className="block mb-1">Kode Supplier</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block mb-1">Nama Contact Person (PIC)</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Pak Bambang"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Telepon</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Alamat Kantor / Gudang</label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  rows={2}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition"
            >
              Simpan Supplier
            </button>
          </form>
        </div>
      )}

      {/* DIALOG DEBT PAYMENT */}
      {showDebtModal && activeSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleDebtSubmit} className="bg-white rounded-2xl max-w-xs w-full p-6 border border-slate-200 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowDebtModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 mb-1">Bayar Hutang Dagang</h3>
            <p className="text-[10px] text-slate-400">Vendor: {activeSupplier.name}</p>

            <div className="mt-4 space-y-3.5 text-xs font-semibold text-slate-600">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex justify-between font-mono text-[11px] text-amber-800">
                  <span>OUTSTANDING HUTANG:</span>
                  <span className="font-extrabold">Rp {activeSupplier.unpaidDebt.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block mb-1">Jumlah Pembayaran (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-slate-400 font-bold">Rp</span>
                  <input
                    type="number"
                    required
                    autoFocus
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/10"
            >
              Konfirmasi Cicilan Tunai
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
