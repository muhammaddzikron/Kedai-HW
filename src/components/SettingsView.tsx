/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Printer,
  Percent,
  Database,
  RefreshCw,
  X,
  CheckCircle,
  FileText
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
              <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                Digunakan untuk sinkronisasi dua arah yang lancar (mengambil katalog dan menyinkronkan produk baru secara real-time).
              </span>
            </div>
          </div>
        </div>

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
