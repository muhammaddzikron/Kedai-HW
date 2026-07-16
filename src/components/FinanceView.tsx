/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Plus,
  Coins,
  History,
  X,
  CreditCard
} from 'lucide-react';

export default function FinanceView() {
  const { accountCodes, addFinanceTransaction, financeTransactions } = useApp();

  const [showModal, setShowModal] = useState(false);

  // Form states
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accountCodes[9]?.id || 'coa-10'); // Default salary expense

  // Log summary
  const summary = useMemo(() => {
    let assets = 0;
    let liabilities = 0;
    let income = 0;
    let expenses = 0;

    accountCodes.forEach((coa) => {
      if (coa.type === 'ASSET') assets += coa.balance;
      else if (coa.type === 'LIABILITY') liabilities += coa.balance;
      else if (coa.type === 'INCOME') income += coa.balance;
      else if (coa.type === 'EXPENSE') expenses += coa.balance;
    });

    return {
      assets,
      liabilities,
      netIncome: income - expenses,
      cashBookTotal: assets - liabilities
    };
  }, [accountCodes]);

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!description || isNaN(amt) || amt <= 0) return;

    addFinanceTransaction(description, category, amt, accountId);
    setShowModal(false);
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Kas & Arus Kas (Finance)</h2>
          <p className="text-xs text-slate-500">Mencatat beban biaya operasional (listrik, gaji), pemasukan eksternal, dan mengelola saldo kas laci.</p>
        </div>

        <button
          onClick={() => {
            setDescription('');
            setAmount('');
            setCategory('EXPENSE');
            setShowModal(true);
          }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Catat Kas Keluar/Masuk</span>
        </button>
      </div>

      {/* Finance totals summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-semibold">Total Aset (Kas & Bank)</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">Rp {summary.assets.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-semibold">Total Kewajiban (Hutang)</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">Rp {summary.liabilities.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-semibold">Laba Rugi Tahun Berjalan</span>
            <span className={`text-sm font-extrabold font-mono ${summary.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              Rp {summary.netIncome.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-semibold">Ekuitas Buku Kas Bersih</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">Rp {summary.cashBookTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart of Accounts Roster Table (Col span 7) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-950 mb-3.5 flex items-center gap-1.5">
            <BookOpen className="h-4.5 w-4.5 text-emerald-500" />
            <span>Chart of Accounts (COA) / Saldo Neraca Rekening</span>
          </h3>
          <p className="text-[11px] text-slate-500 mb-4 font-medium">Buku besar akun standar akuntansi PSAK.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-3">Kode Akun</th>
                  <th className="py-2.5 px-3">Nama Akun COA</th>
                  <th className="py-2.5 px-3">Klasifikasi</th>
                  <th className="py-2.5 px-3 text-right">Saldo Saat Ini (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {accountCodes.map((coa) => (
                  <tr key={coa.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{coa.code}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{coa.name}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        coa.type === 'ASSET' ? 'bg-emerald-50 text-emerald-600' :
                        coa.type === 'LIABILITY' ? 'bg-rose-50 text-rose-500' :
                        coa.type === 'INCOME' ? 'bg-indigo-50 text-indigo-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {coa.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                      Rp {coa.balance.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash flow transactions logs visualization (Col span 5) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5 border-b pb-2">
            <History className="h-4.5 w-4.5 text-emerald-500" />
            <span>Aliran Kas Terakhir (Mutasi Cash Book)</span>
          </h3>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {financeTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Belum ada transaksi kas.</p>
            ) : (
              financeTransactions.map((tx) => (
                <div key={tx.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs space-y-1 text-left">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">{tx.description}</span>
                    <span className={`${tx.category === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'} font-mono`}>
                      {tx.category === 'INCOME' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Rek: {tx.accountName}</span>
                    <span>{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* DIALOG TRANSACTION ENTRY */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleTransactionSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Catat Transaksi Kas Manual</h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div>
                <label className="block mb-1">Jenis Arus Kas</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('EXPENSE')}
                    className={`py-1.5 text-center font-bold border rounded-lg transition ${
                      category === 'EXPENSE'
                        ? 'border-rose-500 bg-rose-500 text-white'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Beban / Kas Keluar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('INCOME')}
                    className={`py-1.5 text-center font-bold border rounded-lg transition ${
                      category === 'INCOME'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Pemasukan / Kas Masuk
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1">Deskripsi Transaksi</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Pembelian galon air kedai"
                />
              </div>

              <div>
                <label className="block mb-1">Pilih Rekening Akun (COA)</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {accountCodes.map((coa) => (
                    <option key={coa.id} value={coa.id}>
                      [{coa.code}] {coa.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Nominal Tunai (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-slate-400 font-bold">Rp</span>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition"
            >
              Simpan & Posting Ledger Jurnal
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
