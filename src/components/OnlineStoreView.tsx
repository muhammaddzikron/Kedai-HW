/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Globe,
  ShoppingBag,
  RefreshCw,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Calculator,
  MessageCircle,
  Truck,
  Sparkles,
  Info
} from 'lucide-react';

export default function OnlineStoreView() {
  const { products, addAuditLog, onlineOrders } = useApp();

  const [waNumber, setWaNumber] = useState('08123456789');
  const [storeSlug, setStoreSlug] = useState('seragam-sekolah-jaya');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [activeTab, setActiveTab] = useState<'katalog' | 'calculator' | 'orders'>('katalog');

  // Interactive Size Recommendation state
  const [childHeight, setChildHeight] = useState('');
  const [childWeight, setChildWeight] = useState('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  const channels = [
    { name: 'Shopee Indonesia', slug: 'shopee-seragam', status: 'CONNECTED', items: 15, lastSync: '10 menit lalu' },
    { name: 'Tokopedia', slug: 'tokopedia-seragam', status: 'CONNECTED', items: 15, lastSync: '10 menit lalu' },
    { name: 'TikTok Shop', slug: 'tiktok-seragam', status: 'DISCONNECTED', items: 0, lastSync: '-' }
  ];

  const handleSyncAll = () => {
    setIsSyncing(true);
    addAuditLog('SYNC_MARKETPLACE', 'ONLINE_STORE', 'Memicu sinkronisasi katalog seragam sekolah ke Tokopedia & Shopee');
    setTimeout(() => {
      setIsSyncing(false);
      alert('Sinkronisasi Sukses!\nStok & Ukuran Seragam berhasil diposting ulang ke Tokopedia & Shopee secara instan.');
    }, 1200);
  };

  const activeOnlineProducts = products.filter(p => !p.isDeleted && p.isOnline);

  // WhatsApp Order Format Generator (Extremely popular in Indonesia for uniform shops)
  const generateWaFormatText = () => {
    let text = `*KATALOG ONLINE SERAGAM SEKOLAH JAYA*\n`;
    text += `Silakan pilih produk & hubungi kami untuk kustom jahit:\n\n`;
    activeOnlineProducts.slice(0, 5).forEach((p, idx) => {
      text += `${idx + 1}. *${p.name}*\n`;
      text += `   - Harga: Rp ${p.sellingPrice.toLocaleString()}\n`;
      text += `   - Stok standard: ${p.stock} Pcs\n`;
      if (p.variants && p.variants.length > 0) {
        text += `   - Ukuran: ${p.variants.map(v => v.name).join(', ')}\n`;
      }
      text += `\n`;
    });
    text += `*Formulir Pemesanan Seragam Online:*\n`;
    text += `Nama Anak:\n`;
    text += `Sekolah/Kelas:\n`;
    text += `Pilihan Produk & Ukuran:\n`;
    text += `Catatan Ukuran Custom (Tinggi/Berat Anak): \n\n`;
    text += `Pesan instan di: https://kasir.seragam.id/${storeSlug}`;
    return text;
  };

  const handleCopyWaText = () => {
    const text = generateWaFormatText();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    addAuditLog('COPY_WA_CATALOG', 'ONLINE_STORE', 'Exported online school uniforms text catalog to clipboard');
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Interactive Sizing calculator logic for uniforms
  const handleCalculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number(childHeight);
    const w = Number(childWeight);
    if (!h || !w) return;

    // Fast heuristics for school kids sizes S/M/L/XL/XXL
    if (h < 110) {
      setRecommendedSize('S (Anak TK / Kelas 1 SD)');
    } else if (h >= 110 && h < 130) {
      if (w > 35) setRecommendedSize('L (Anak SD Kecil - Lebar)');
      else setRecommendedSize('M (Anak SD Kelas 1-3 Standard)');
    } else if (h >= 130 && h < 150) {
      if (w > 45) setRecommendedSize('XL (Anak SD Besar / SMP S)');
      else setRecommendedSize('L (Anak SD Kelas 4-6 Standard)');
    } else if (h >= 150 && h < 170) {
      if (w > 60) setRecommendedSize('XXL (SMP/SMA Tinggi Lebar)');
      else setRecommendedSize('XL (SMP/SMA Standard)');
    } else {
      setRecommendedSize('XXL atau CUSTOM (Bisa serahkan ke Bagian Konveksi jahit kustom)');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="h-5.5 w-5.5 text-indigo-600" />
            <span>Storefront & Omnichannel Seragam Sekolah</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Kelola link pembelian seragam online oleh orang tua siswa, sync stok ke Shopee/Tokopedia, dan mudahkan pemilihan ukuran online.
          </p>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncing}
          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Roster E-Commerce'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Setup, Domain and WhatsApp Channel (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
              <Globe className="h-4.5 w-4.5 text-emerald-500" />
              <span>Situs Online Storefront Seragam</span>
            </h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div>
                <label className="block mb-1">Domain Toko Seragam</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[10px] text-slate-400 font-bold">seragam.id/</span>
                  <input
                    type="text"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value)}
                    className="w-full pl-20 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">WhatsApp Order Link (Auto-Checkout)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[10px] text-slate-400 font-bold">+62</span>
                  <input
                    type="text"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    className="w-full pl-10 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-emerald-800 block">E-Store Seragam Aktif</span>
                  <span className="text-[9px] text-emerald-600 font-mono">https://seragam.id/{storeSlug}</span>
                </div>
                <a
                  href={`#https://seragam.id/${storeSlug}`}
                  onClick={(e) => { e.preventDefault(); alert('Mengalihkan ke Simulator Portal Order Wali Murid Sekolah...'); }}
                  className="p-1 bg-white hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-150 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Sync Marketplace panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
              <Share2 className="h-4.5 w-4.5 text-emerald-500" />
              <span>Omnichannel Marketplace Seragam</span>
            </h3>

            <div className="space-y-3">
              {channels.map((chan, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100/80 text-xs flex justify-between items-center font-semibold">
                  <div>
                    <span className="font-bold text-slate-800 block">{chan.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">Sync: {chan.items} Seragam • {chan.lastSync}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    chan.status === 'CONNECTED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-150 text-slate-500'
                  }`}>
                    {chan.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Dynamic view switcher (Col span 8) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          {/* Tabs header */}
          <div className="flex border-b pb-1 gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('katalog')}
              className={`pb-2 border-b-2 px-1 transition ${activeTab === 'katalog' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Katalog Sinkron Online
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`pb-2 border-b-2 px-1 transition flex items-center gap-1.5 ${activeTab === 'calculator' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Kalkulator Ukuran Online</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2 border-b-2 px-1 transition flex items-center gap-1.5 ${activeTab === 'orders' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Pesanan Online Masuk ({onlineOrders.length})</span>
            </button>
          </div>

          {/* TAB 1 CONTENT: ONLINE PRODUCTS & WHATSAPP FORMAT ORDER GENERATOR */}
          {activeTab === 'katalog' && (
            <div className="space-y-4 text-left">
              <div className="p-4 bg-slate-50 border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-indigo-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-spin" />
                    <span>FITUR PRAKTIS WA BISNIS</span>
                  </span>
                  <h4 className="font-extrabold text-slate-850 text-xs">WhatsApp Format Text Catalog</h4>
                  <p className="text-[10px] text-slate-400">Generate teks katalog seragam sekolah otomatis dengan format size lengkap untuk di-share ke grup Wali Murid.</p>
                </div>
                <button
                  onClick={handleCopyWaText}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1.5 transition self-start sm:self-center shrink-0"
                >
                  {copiedText ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Berhasil Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Teks Catalog</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {activeOnlineProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="h-12 w-12 bg-slate-100 border rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-slate-300 relative">
                      {p.image ? (
                        <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                      ) : (
                        p.name.slice(0, 2)
                      )}
                    </div>
                    <div className="space-y-0.5 text-xs flex-1 min-w-0">
                      <span className="font-bold text-slate-850 block truncate">{p.name}</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold font-mono">Rp {p.sellingPrice.toLocaleString()}</span>
                      <div className="flex gap-1.5 text-[9px] text-slate-400 mt-1">
                        <span className="font-bold">Stock: {p.stock}</span>
                        <span>•</span>
                        <span className="bg-indigo-50 text-indigo-600 px-1 rounded uppercase font-bold text-[8px]">
                          Online Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: SIZE RECOMENDATION ENGINE FOR PARENTS */}
          {activeTab === 'calculator' && (
            <div className="space-y-4 text-left max-w-md">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Calculator className="h-4.5 w-4.5 text-indigo-500" />
                  <span>Interactive Sizing Assistant (Orang Tua Siswa)</span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  Masukkan estimasi tinggi dan berat badan anak untuk secara otomatis merekomendasikan ukuran seragam sekolah terbaik (S, M, L, XL, atau Custom).
                </p>
              </div>

              <form onSubmit={handleCalculateSize} className="bg-slate-50 border p-4 rounded-2xl space-y-3.5 text-xs font-semibold text-slate-600">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Tinggi Badan Anak (cm)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 135"
                      value={childHeight}
                      onChange={(e) => setChildHeight(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Berat Badan Anak (kg)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 32"
                      value={childWeight}
                      onChange={(e) => setChildWeight(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow"
                >
                  Kalkulasikan Ukuran Seragam Anak
                </button>
              </form>

              {recommendedSize && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <div className="p-2 bg-white rounded-xl text-emerald-600 border border-emerald-100 mt-0.5">
                    <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" />
                  </div>
                  <div className="text-xs">
                    <span className="font-extrabold text-emerald-800 block">Rekomendasi Ukuran Seragam:</span>
                    <span className="text-sm font-black text-emerald-900 block mt-0.5">{recommendedSize}</span>
                    <span className="text-[9px] text-emerald-600 block mt-1 font-medium">
                      *Hasil estimasi di atas disesuaikan dengan pola jahitan konveksi standard sekolah Anda.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3 CONTENT: ONLINE SALES ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-indigo-500" />
                  <span>Portal Sinkronisasi Pesanan Seragam Online</span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  Berikut adalah daftar pesanan yang masuk secara online dari situs storefront yang dipesan oleh Wali Murid.
                </p>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {onlineOrders.map((ord) => (
                  <div key={ord.id} className="p-3 bg-slate-50 border rounded-2xl space-y-2 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-800 block">{ord.customerName}</span>
                        <span className="text-[9px] text-slate-400 font-mono">No. Pesanan: {ord.orderNo}</span>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 border border-emerald-100 rounded-full">
                        {ord.status}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <span className="text-slate-600">{it.productName} (x{it.quantity})</span>
                          <span className="font-mono text-slate-800 font-bold">Rp {it.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-sans">
                        <Truck className="h-3.5 w-3.5" />
                        Courier: {ord.shippingCourier}
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        Total: Rp {ord.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                {onlineOrders.length === 0 && (
                  <div className="h-28 flex flex-col items-center justify-center text-slate-400 text-center">
                    <MessageCircle className="h-8 w-8 mb-1.5 text-slate-300" />
                    <p className="text-xs font-bold">Tidak ada pesanan online masuk</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
