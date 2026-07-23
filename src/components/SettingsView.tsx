/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/appsScriptCode';
import {
  Settings,
  Printer,
  Percent,
  Database,
  RefreshCw,
  X,
  CheckCircle,
  FileText,
  Copy,
  Code,
  Check
} from 'lucide-react';

export default function SettingsView() {
  const { addAuditLog, googleSheetUrl, googleDriveUrl, googleAppsScriptUrl, updateGoogleConfig } = useApp();

  const [receiptHeader, setReceiptHeader] = useState('KASIR KEDAI KEPANDUAN');
  const [receiptFooter, setReceiptFooter] = useState('Terima kasih Kak! Bakti Pramuka Untuk Indonesia.');
  const [taxPercent, setTaxPercent] = useState('11');
  const [servicePercent, setServicePercent] = useState('0');
  
  const [sheetUrl, setSheetUrl] = useState(googleSheetUrl);
  const [driveUrl, setDriveUrl] = useState(googleDriveUrl);
  const [appsScriptUrl, setAppsScriptUrl] = useState(googleAppsScriptUrl || '');

  const [showScriptModal, setShowScriptModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoogleConfig(sheetUrl, driveUrl, appsScriptUrl);
    addAuditLog('UPDATE_SETTINGS', 'SETTINGS', `Updated receipt footer: ${receiptFooter}, tax to ${taxPercent}%, and Google config`);
    alert('Konfigurasi Pengaturan Kasir Berhasil Disimpan!');
  };

  const handleBackup = () => {
    addAuditLog('BACKUP_DATABASE', 'SETTINGS', 'Performed manual cloud database snapshot replication');
    alert('Simulasi Backup Sukses!\nFile "kasir-backup-20260715.json" berhasil diunggah ke Supabase Cloud Storage.');
  };

  return (
    <div className="space-y-6 text-left max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pengaturan Sistem Kasir</h2>
        <p className="text-xs text-slate-500">Konfigurasikan tarif pajak penjualan daerah (PB1), cetak teks struk belanja, dan kelola database.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        
        {/* Print Struk customizer */}
        <div className="space-y-3.5 border-b pb-5">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
            <Printer className="h-4.5 w-4.5 text-emerald-500" />
            <span>Kustomisasi Struk Cetak POS</span>
          </h3>

          <div className="space-y-3 text-xs font-semibold text-slate-600">
            <div>
              <label className="block mb-1">Header Struk Belanja</label>
              <input
                type="text"
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
              />
            </div>

            <div>
              <label className="block mb-1">Footer Struk Belanja (Greeting)</label>
              <textarea
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Taxes & service charge configuration */}
        <div className="space-y-3.5 border-b pb-5">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
            <Percent className="h-4.5 w-4.5 text-emerald-500" />
            <span>Pajak & Biaya Tambahan (Surcharge)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
            <div>
              <label className="block mb-1">Pajak Pertambahan Nilai / PB1 (%)</label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block mb-1">Biaya Layanan Service Charge (%)</label>
              <input
                type="number"
                value={servicePercent}
                onChange={(e) => setServicePercent(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Google Workspace Integration Settings */}
        <div className="space-y-3.5 border-b pb-5">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
            <RefreshCw className="h-4.5 w-4.5 text-emerald-500 animate-spin-slow" />
            <span>Koneksi Katalog Google Sheets & Drive</span>
          </h3>

          <div className="space-y-3 text-xs font-semibold text-slate-600">
            <div>
              <label className="block mb-1">URL Spreadsheet Google Sheets (Katalog Produk)</label>
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px]"
              />
              <span className="text-[10px] font-medium text-slate-400 mt-1 block">Pastikan Spreadsheet diatur akses publik: "Siapa saja dengan link dapat melihat".</span>
            </div>

            <div>
              <label className="block mb-1">URL Google Drive Folder (Penyimpanan Gambar)</label>
              <input
                type="text"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px]"
              />
            </div>

            <div>
              <label className="block mb-1">URL Google Apps Script Web App (Sinkronisasi API)</label>
              <input
                type="text"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px]"
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] font-medium text-slate-400 block">
                  Digunakan untuk sinkronisasi dua arah (katalog, order online & status ongkir).
                </span>
                <button
                  type="button"
                  onClick={() => setShowScriptModal(true)}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-lg border border-indigo-200 flex items-center gap-1 transition shrink-0"
                >
                  <Code className="h-3 w-3 text-indigo-600" />
                  <span>Lihat Kode Code.gs Terbaru</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Code.gs */}
        {showScriptModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl relative flex flex-col max-h-[85vh]">
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Code className="h-4 w-4 text-indigo-600" />
                  <span>Kode Google Apps Script Terbaru (Code.gs)</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  Salin kode di bawah ini lalu tempelkan ke Extensions &gt; Apps Script pada Spreadsheet Google Anda.
                </p>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col bg-slate-900 rounded-2xl p-3 border border-slate-800">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-slate-400">Code.gs</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2500);
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition shadow-sm"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Kode Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Seluruh Kode</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  readOnly
                  value={GOOGLE_APPS_SCRIPT_CODE}
                  className="flex-1 w-full bg-transparent text-emerald-400 font-mono text-[11px] leading-relaxed resize-none focus:outline-none scrollbar-thin overflow-y-auto"
                />
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400 font-medium">Setelah simpan, pilih Deploy &gt; Web App &gt; Access: Anyone</span>
                <button
                  type="button"
                  onClick={() => setShowScriptModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Database replication */}
        <div className="space-y-3.5">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
            <Database className="h-4.5 w-4.5 text-emerald-500" />
            <span>Replikasi & Cloud Database Backup</span>
          </h3>

          <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Backup Terakhir</span>
              <span className="text-[10px] text-slate-400">Replikasi Terjadwal: 15 Juli 2026 23:00 WIB</span>
            </div>
            <button
              type="button"
              onClick={handleBackup}
              className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-[10px] rounded-lg transition"
            >
              Backup Sekarang
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/15 transition"
        >
          Simpan Semua Pengaturan
        </button>

      </form>
    </div>
  );
}
