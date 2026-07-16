/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Smartphone,
  Zap,
  CreditCard,
  History,
  Coins,
  QrCode,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  X
} from 'lucide-react';

export default function PpobView() {
  const { addFinanceTransaction, addAuditLog } = useApp();

  const [category, setCategory] = useState<'PULSA' | 'PLN' | 'E_WALLET'>('PULSA');
  const [targetNumber, setTargetNumber] = useState('');
  const [selectedDenom, setSelectedDenom] = useState<{ id: string; name: string; cost: number; price: number } | null>(null);

  // Status simulation
  const [isProcessing, setIsProcessing] = useState(false);
  const [successTx, setSuccessTx] = useState<any>(null);

  const denoms = {
    PULSA: [
      { id: 'p1', name: 'Pulsa Telkomsel Rp 10.000', cost: 10100, price: 12000 },
      { id: 'p2', name: 'Pulsa Telkomsel Rp 25.000', cost: 24850, price: 27000 },
      { id: 'p3', name: 'Pulsa Telkomsel Rp 50.000', cost: 49100, price: 51500 },
      { id: 'p4', name: 'Paket Data Internet 10GB', cost: 52000, price: 58000 }
    ],
    PLN: [
      { id: 'e1', name: 'Token Listrik PLN Rp 20.000', cost: 20000, price: 22000 },
      { id: 'e2', name: 'Token Listrik PLN Rp 50.000', cost: 50000, price: 52000 },
      { id: 'e3', name: 'Token Listrik PLN Rp 100.000', cost: 100000, price: 102000 }
    ],
    E_WALLET: [
      { id: 'w1', name: 'Top Up DANA Rp 50.000', cost: 50500, price: 52000 },
      { id: 'w2', name: 'Top Up GoPay Rp 100.000', cost: 100500, price: 102000 },
      { id: 'w3', name: 'Top Up OVO Rp 50.000', cost: 50500, price: 52000 }
    ]
  };

  const activeDenoms = denoms[category];

  // Digital transaction history simulation
  const [digitalHistory, setDigitalHistory] = useState([
    { id: 'dtx-1', date: '2026-07-15T09:12:00Z', target: '08129876543', name: 'Pulsa Telkomsel Rp 50.000', price: 51500, profit: 2400, status: 'SUCCESS' },
    { id: 'dtx-2', date: '2026-07-15T11:45:00Z', target: '14238596001', name: 'Token Listrik PLN Rp 100.000', price: 102000, profit: 2000, status: 'SUCCESS' }
  ]);

  const handleCheckoutPpob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNumber || !selectedDenom) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const profit = selectedDenom.price - selectedDenom.cost;
      const newTx = {
        id: `dtx-${Date.now()}`,
        date: new Date().toISOString(),
        target: targetNumber,
        name: selectedDenom.name,
        price: selectedDenom.price,
        profit,
        status: 'SUCCESS'
      };

      setDigitalHistory([newTx, ...digitalHistory]);
      
      // Post income profit from PPOB to General Ledger
      addFinanceTransaction(`Pendapatan Komisi Digital ${selectedDenom.name} (${targetNumber})`, 'INCOME', profit, 'coa-6'); // Sales account
      addAuditLog('PPOB_TRANSACTION', 'PPOB', `Processed digital prepaid biller payment of ${selectedDenom.name} for target ID: ${targetNumber}`);

      setSuccessTx(newTx);
      setTargetNumber('');
      setSelectedDenom(null);
    }, 1200);
  };

  const totalDigitalCommission = useMemo(() => {
    return digitalHistory.reduce((sum, item) => sum + item.profit, 0);
  }, [digitalHistory]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Prepaid PPOB & Agen Pulsa (Digital)</h2>
          <p className="text-xs text-slate-500">Isi pulsa seluler, paket data internet, e-wallet, token listrik PLN pra-bayar, dan raih komisi instan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Transaction Engine Form (Col span 5) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border">
            <button
              onClick={() => { setCategory('PULSA'); setSelectedDenom(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                category === 'PULSA' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Pulsa & Data</span>
            </button>
            <button
              onClick={() => { setCategory('PLN'); setSelectedDenom(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                category === 'PLN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Token PLN</span>
            </button>
            <button
              onClick={() => { setCategory('E_WALLET'); setSelectedDenom(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                category === 'E_WALLET' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="h-4 w-4 text-indigo-500" />
              <span>E-Wallet</span>
            </button>
          </div>

          <form onSubmit={handleCheckoutPpob} className="space-y-4 text-xs font-semibold text-slate-600">
            <div>
              <label className="block mb-1">
                {category === 'PULSA' ? 'Nomor Handphone WhatsApp' : category === 'PLN' ? 'Nomor Meteran PLN / ID Pelanggan' : 'Nomor HP Terdaftar E-Wallet'}
              </label>
              <input
                type="text"
                required
                value={targetNumber}
                onChange={(e) => setTargetNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold"
                placeholder={category === 'PULSA' ? 'e.g. 08123456789' : category === 'PLN' ? 'e.g. 14238596001' : 'e.g. 08129876543'}
              />
            </div>

            {/* Denomination Picker */}
            <div className="space-y-2">
              <label className="block text-slate-700">Pilih Denominasi Paket</label>
              <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {activeDenoms.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDenom(d)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                      selectedDenom?.id === d.id
                        ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/10'
                        : 'border-slate-150 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold text-[10px] text-slate-800 line-clamp-2 leading-tight">{d.name}</span>
                    <span className="font-mono font-extrabold text-[11px] text-slate-900 mt-2 block">Rp {d.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedDenom && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1.5 text-xs text-emerald-800 font-semibold text-left">
                <div className="flex justify-between">
                  <span>Harga Jual Kasir:</span>
                  <span className="font-mono font-bold">Rp {selectedDenom.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-emerald-600">
                  <span>Komisi Keuntungan Toko:</span>
                  <span className="font-mono font-bold">+Rp {(selectedDenom.price - selectedDenom.cost).toLocaleString()}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || !targetNumber || !selectedDenom}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition disabled:opacity-40"
            >
              {isProcessing ? 'Memproses Transaksi...' : 'Konfirmasi & Bayar Tunai'}
            </button>
          </form>
        </div>

        {/* Right Column: Profit Summary & History Logs (Col span 7) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                  <History className="h-4.5 w-4.5 text-emerald-500" />
                  <span>Riwayat Layanan Digital PPOB</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Keuntungan Komisi Terkumpul</span>
                <span className="font-mono font-extrabold text-emerald-600">Rp {totalDigitalCommission.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[290px] pr-1">
              {digitalHistory.map((tx) => (
                <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <span className="font-bold text-slate-800 block truncate max-w-sm">{tx.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">No: {tx.target}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-slate-900 block">Rp {tx.price.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">+Rp {tx.profit.toLocaleString()} Komisi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* SUCCESS MODAL DIALOG */}
      {successTx && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 border border-slate-200 shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setSuccessTx(null)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Transaksi Digital Berhasil</h3>
              <p className="text-[10px] text-slate-400">Komisi ditambahkan ke laci kasir</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/85 text-xs text-left space-y-1.5 font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Layanan:</span>
                <span className="text-slate-900">{successTx.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Pelanggan:</span>
                <span className="text-slate-900 font-mono">{successTx.target}</span>
              </div>
              <div className="flex justify-between">
                <span>Nilai Tagihan:</span>
                <span className="text-slate-900 font-mono">Rp {successTx.price.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSuccessTx(null)}
              className="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl"
            >
              Kembali ke Menu
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
