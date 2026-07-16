/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function AccountingView() {
  const { accountCodes } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'JOURNAL' | 'TRIAL_BALANCE' | 'PROFIT_LOSS'>('JOURNAL');

  const journalEntries = [
    {
      id: 'je-1',
      date: '2026-07-15T08:15:00Z',
      description: 'Penjualan Retail Pos - Cashier',
      reference: 'INV-20260715-001',
      debits: [{ name: 'Kas Utama Kedai', amount: 58250 }],
      credits: [{ name: 'Pendapatan Penjualan Retail', amount: 55000 }, { name: 'Kewajiban Pajak Keluaran (PB1)', amount: 3250 }]
    },
    {
      id: 'je-2',
      date: '2026-07-15T10:30:00Z',
      description: 'Penjualan Retail Pos - QRIS',
      reference: 'INV-20260715-002',
      debits: [{ name: 'Bank BCA Operasional', amount: 228000 }],
      credits: [{ name: 'Pendapatan Penjualan Retail', amount: 228000 }]
    },
    {
      id: 'je-3',
      date: '2026-07-14T09:00:00Z',
      description: 'Pembayaran Hutang Restock Produk',
      reference: 'PAY-SPL-01',
      debits: [{ name: 'Hutang Dagang Supplier', amount: 1500000 }],
      credits: [{ name: 'Kas Utama Kedai', amount: 1500000 }]
    }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Akuntansi & Jurnal Umum (GL)</h2>
          <p className="text-xs text-slate-500">Buku jurnal double-entry otomatis, trial balance, dan laporan laba rugi terstandarisasi.</p>
        </div>

        {/* Sub-navigation buttons */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border">
          {[
            { id: 'JOURNAL', label: 'Jurnal Umum' },
            { id: 'TRIAL_BALANCE', label: 'Trial Balance' },
            { id: 'PROFIT_LOSS', label: 'Laba Rugi (P&L)' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === t.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'JOURNAL' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Buku Jurnal Umum Double-Entry</h3>
              <p className="text-xs text-slate-400">Pencatatan akun debit-kredit otomatis dari POS dan stok</p>
            </div>
            <button className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 border rounded-lg hover:bg-slate-200 transition flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export Excel</span>
            </button>
          </div>

          <div className="space-y-4">
            {journalEntries.map((je) => (
              <div key={je.id} className="border border-slate-150/80 rounded-xl p-4 bg-slate-50/40 text-xs">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <span className="font-bold text-slate-850 block">{je.description}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Ref Doc: {je.reference}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {new Date(je.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold">
                  <div className="col-span-6 text-slate-400 font-bold uppercase tracking-wider">Rekening Akun</div>
                  <div className="col-span-3 text-right text-slate-400 font-bold uppercase tracking-wider">Debit (Rp)</div>
                  <div className="col-span-3 text-right text-slate-400 font-bold uppercase tracking-wider">Kredit (Rp)</div>

                  {/* Debits listing */}
                  {je.debits.map((db, idx) => (
                    <React.Fragment key={`db-${idx}`}>
                      <div className="col-span-6 py-1 text-slate-850 font-bold flex items-center gap-1">
                        <ChevronRight className="h-3 w-3 text-emerald-500" />
                        <span>{db.name}</span>
                      </div>
                      <div className="col-span-3 py-1 text-right font-mono font-extrabold text-emerald-600">
                        {db.amount.toLocaleString()}
                      </div>
                      <div className="col-span-3 py-1 text-right font-mono text-slate-300">-</div>
                    </React.Fragment>
                  ))}

                  {/* Credits listing */}
                  {je.credits.map((cr, idx) => (
                    <React.Fragment key={`cr-${idx}`}>
                      <div className="col-span-6 py-1 pl-4 text-slate-700 italic font-medium flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 text-slate-300" />
                        <span>{cr.name}</span>
                      </div>
                      <div className="col-span-3 py-1 text-right font-mono text-slate-300">-</div>
                      <div className="col-span-3 py-1 text-right font-mono font-extrabold text-slate-800">
                        {cr.amount.toLocaleString()}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeSubTab === 'TRIAL_BALANCE' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Neraca Percobaan (Trial Balance)</h3>
            <p className="text-xs text-slate-400 font-medium">Buku saldo penutup penyesuaian per 15 Juli 2026.</p>
          </div>

          <div className="overflow-x-auto border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs font-semibold text-slate-600">
              <thead>
                <tr className="border-b border-slate-150 text-slate-500 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-4">Kode Akun</th>
                  <th className="py-2.5 px-4">Nama Rekening Buku Besar</th>
                  <th className="py-2.5 px-4 text-right">Debit (Rp)</th>
                  <th className="py-2.5 px-4 text-right">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accountCodes.map((coa) => {
                  const isDebitSide = coa.type === 'ASSET' || coa.type === 'EXPENSE';
                  return (
                    <tr key={coa.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-2.5 px-4 font-mono text-slate-800">{coa.code}</td>
                      <td className="py-2.5 px-4 text-slate-850 font-bold">{coa.name}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {isDebitSide ? `Rp ${coa.balance.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {!isDebitSide ? `Rp ${coa.balance.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Profit & Loss statement */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 max-w-xl mx-auto space-y-5">
          <div className="text-center space-y-1 pb-3 border-b border-dashed">
            <h3 className="text-base font-extrabold text-slate-950">Laporan Laba Rugi Komprehensif</h3>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">KASIR KEDAI KEPANDUAN</p>
            <p className="text-[10px] text-slate-400">Periode Berjalan: 1 Juli 2026 s/d 15 Juli 2026</p>
          </div>

          <div className="space-y-4 text-xs font-semibold text-slate-700">
            {/* Income */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm border-b pb-1">1. PENDAPATAN OPERASIONAL</h4>
              <div className="flex justify-between pl-3 text-slate-600">
                <span>Pendapatan Penjualan Retail</span>
                <span className="font-mono">Rp 35,820,000</span>
              </div>
              <div className="flex justify-between pl-3 text-slate-600">
                <span>Pendapatan Komisi Layanan Digital PPOB</span>
                <span className="font-mono">Rp 345,000</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1.5 font-extrabold text-slate-950 pl-2">
                <span>TOTAL PENDAPATAN</span>
                <span className="font-mono">Rp 36,165,000</span>
              </div>
            </div>

            {/* COGS */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm border-b pb-1">2. HARGA POKOK PENJUALAN (HPP)</h4>
              <div className="flex justify-between pl-3 text-slate-600">
                <span>HPP Bahan Baku Minuman & Makanan</span>
                <span className="font-mono">Rp 12,410,000</span>
              </div>
              <div className="flex justify-between pl-3 text-slate-600">
                <span>HPP Atribut & Merchandise Pramuka</span>
                <span className="font-mono">Rp 3,800,000</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1.5 font-extrabold text-slate-950 pl-2">
                <span>TOTAL BEBAN HPP (COGS)</span>
                <span className="font-mono text-rose-600">Rp 16,210,000</span>
              </div>
            </div>

            {/* Gross margin */}
            <div className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center text-xs font-extrabold text-slate-950">
              <span>LABA KOTOR (GROSS PROFIT MARGIN)</span>
              <span className="font-mono">Rp 19,955,000</span>
            </div>

            {/* Expenses */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm border-b pb-1">3. BEBAN OPERASIONAL KEDAI</h4>
              <div className="flex justify-between pl-3 text-slate-600">
                <span>Beban Gaji & Honor Staff</span>
                <span className="font-mono">Rp 4,800,000</span>
              </div>
              <div className="flex justify-between pl-3 text-slate-600">
                <span>Beban Operasional Air/Listrik/Wifi</span>
                <span className="font-mono">Rp 1,250,000</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1.5 font-extrabold text-slate-950 pl-2">
                <span>TOTAL BEBAN OPERASIONAL</span>
                <span className="font-mono text-rose-600">Rp 6,050,000</span>
              </div>
            </div>

            {/* Net profit */}
            <div className="p-3.5 bg-emerald-500 text-white rounded-xl flex justify-between items-center text-sm font-extrabold shadow-lg shadow-emerald-500/15">
              <span>LABA BERSIH (NET PROFIT AFTER TAX)</span>
              <span className="font-mono">Rp 13,905,000</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
