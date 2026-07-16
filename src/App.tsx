/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import PosView from './components/PosView';
import ProductsView from './components/ProductsView';
import InventoryView from './components/InventoryView';
import PurchasesView from './components/PurchasesView';
import SuppliersView from './components/SuppliersView';
import CustomersView from './components/CustomersView';
import FinanceView from './components/FinanceView';
import AccountingView from './components/AccountingView';
import ReportsView from './components/ReportsView';
import StaffView from './components/StaffView';
import SettingsView from './components/SettingsView';
import { X, Printer, Menu } from 'lucide-react';

function AppContent() {
  const { activeTab, setActiveTab, currentBranch } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenReceipt = (order: any) => {
    setSelectedReceipt(order);
  };

  const handleCheckoutSuccess = (order: any) => {
    setSelectedReceipt(order);
  };

  const handlePrintReceipt = (receipt: any) => {
    if (!receipt) return;
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const itemsHtml = receipt.items.map((item: any) => `
      <div style="margin-bottom: 6px; font-size: 10px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>${item.productName}</span>
          <span>Rp ${item.subtotal.toLocaleString('id-ID')}</span>
        </div>
        ${item.variantName ? `<div style="color: #666; font-size: 8px; padding-left: 6px;">- Varian: ${item.variantName}</div>` : ''}
        ${item.modifiers && item.modifiers.length > 0 ? `<div style="color: #666; font-size: 8px; padding-left: 6px;">- Modifiers: ${item.modifiers.join(', ')}</div>` : ''}
        <div style="display: flex; justify-content: space-between; color: #555; padding-left: 6px;">
          <span>${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</span>
        </div>
      </div>
    `).join('');

    const discountHtml = receipt.discount > 0 ? `
      <div style="display: flex; justify-content: space-between; color: #e11d48; font-weight: bold;">
        <span>Diskon Potongan:</span>
        <span>-Rp ${receipt.discount.toLocaleString('id-ID')}</span>
      </div>
    ` : '';

    const receiptContent = `
      <html>
        <head>
          <title>Struk Belanja #${receipt.orderNo}</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 10px;
              line-height: 1.3;
              width: 58mm;
              padding: 8px;
              margin: 0;
              box-sizing: border-box;
              background-color: #fff;
              color: #000;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .text-xs { font-size: 8px; }
            .text-lg { font-size: 12px; }
            .space-y-0.5 > * + * { margin-top: 2px; }
          </style>
        </head>
        <body>
          <div class="text-center" style="margin-bottom: 8px;">
            <div class="font-bold text-lg">KEDAI KEPANDUAN CORE</div>
            <div class="text-xs">Jl. Cikutra No. 276, Bandung</div>
            <div class="text-xs">Tlp: 0812-3456-789</div>
          </div>

          <div class="space-y-0.5 text-xs" style="margin-bottom: 6px;">
            <div class="flex justify-between">
              <span>Struk No:</span>
              <span class="font-bold">${receipt.orderNo}</span>
            </div>
            <div class="flex justify-between">
              <span>Kasir:</span>
              <span>${receipt.cashierName || 'Cashier'}</span>
            </div>
            <div class="flex justify-between">
              <span>Tanggal:</span>
              <span>${new Date(receipt.date).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div>
            ${itemsHtml}
          </div>

          <div class="divider"></div>

          <div class="space-y-0.5">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span class="font-bold">Rp ${receipt.subtotal.toLocaleString('id-ID')}</span>
            </div>
            ${discountHtml}
            <div class="flex justify-between">
              <span>Pajak (PB1 10%):</span>
              <span>Rp ${receipt.tax.toLocaleString('id-ID')}</span>
            </div>
            <div class="flex justify-between">
              <span>Service Charge (5%):</span>
              <span>Rp ${(receipt.serviceCharge || 0).toLocaleString('id-ID')}</span>
            </div>
            <div class="flex justify-between font-bold" style="font-size: 11px; margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px;">
              <span>GRAND TOTAL:</span>
              <span>Rp ${receipt.total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="space-y-0.5 text-xs">
            <div class="flex justify-between">
              <span>Metode Bayar:</span>
              <span class="font-bold">${receipt.paymentMethod}</span>
            </div>
            <div class="flex justify-between">
              <span>Dibayar:</span>
              <span>Rp ${(receipt.amountPaid || 0).toLocaleString('id-ID')}</span>
            </div>
            <div class="flex justify-between font-bold" style="color: #16a34a;">
              <span>Kembalian:</span>
              <span>Rp ${(receipt.change || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="text-center text-xs" style="margin-top: 8px; font-style: italic;">
            Terima kasih Kak!<br>Bakti Pramuka Untuk Indonesia.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.frameElement.remove();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(receiptContent);
    doc.close();
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onOpenReceipt={handleOpenReceipt} />;
      case 'pos':
        return <PosView onCheckoutSuccess={handleCheckoutSuccess} />;
      case 'products':
        return <ProductsView />;
      case 'inventory':
        return <InventoryView />;
      case 'purchases':
        return <PurchasesView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'customers':
        return <CustomersView />;
      case 'finance':
        return <FinanceView />;
      case 'accounting':
        return <AccountingView />;
      case 'reports':
        return <ReportsView />;
      case 'staff':
        return <StaffView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onOpenReceipt={handleOpenReceipt} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Overlay background on mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden flex items-center justify-center"
              title="Buka Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-slate-100 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-700">Cabang: {currentBranch.name}</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">{activeTab.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab('pos')}
              className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center gap-1"
            >
              <span>+</span>
              <span className="hidden sm:inline">Transaksi Baru (F2)</span>
              <span className="sm:hidden">Transaksi</span>
            </button>
          </div>
        </header>

        {/* View panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 scrollbar-thin">
          {renderActiveView()}
        </div>

        {/* FOOTER STATUS BAR */}
        <footer className="h-8 bg-slate-800 text-[10px] text-slate-400 flex items-center px-4 sm:px-6 justify-between flex-shrink-0 select-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Sistem: Operasional <span className="hidden sm:inline">(Server Online)</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-4">
              Database: PostgreSQL v16.1 <span className="hidden sm:inline">(Supabase)</span>
            </div>
          </div>
          <div className="flex items-center gap-4 uppercase font-bold tracking-tighter">
            <span>v1.0.4-PROD</span>
            <span className="text-slate-500 hidden sm:inline">2026 © KASIR KEDAI KEPANDUAN</span>
          </div>
        </footer>
      </main>

      {/* COMPREHENSIVE THERMAL RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 border border-slate-200 shadow-2xl relative text-center flex flex-col items-center">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Simulated Thermal Paper Struk */}
            <div className="w-full bg-amber-50/20 border border-amber-100 p-4 rounded-xl text-left font-mono text-[10px] text-slate-800 space-y-3 shadow-inner">
              <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-2">
                <span className="font-extrabold text-xs block text-slate-950">KEDAI KEPANDUAN CORE</span>
                <span className="block text-slate-400">Jl. Cikutra No. 276, Bandung</span>
                <span className="block text-slate-400">Tlp: 0812-3456-789</span>
              </div>

              <div className="space-y-0.5 text-slate-500">
                <div className="flex justify-between">
                  <span>Struk No:</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{selectedReceipt.cashierName || 'Cashier'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{new Date(selectedReceipt.date).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Items divider */}
              <div className="border-b border-dashed border-slate-300 py-1" />

              <div className="space-y-2">
                {selectedReceipt.items.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{item.productName}</span>
                      <span>Rp {item.subtotal.toLocaleString()}</span>
                    </div>
                    {item.variantName && (
                      <span className="text-slate-400 block pl-2">- Varian: {item.variantName}</span>
                    )}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <span className="text-slate-400 block pl-2">- Modifiers: {item.modifiers.join(', ')}</span>
                    )}
                    <div className="flex justify-between text-slate-500 pl-2">
                      <span>{item.quantity} x Rp {item.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-300 py-1" />

              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">Rp {selectedReceipt.subtotal.toLocaleString()}</span>
                </div>
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Diskon Potongan:</span>
                    <span>-Rp {selectedReceipt.discount.toLocaleString()}</span>
                  </div>
                )}
                {selectedReceipt.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak (PB1 10%):</span>
                    <span>Rp {selectedReceipt.tax.toLocaleString()}</span>
                  </div>
                )}
                {selectedReceipt.serviceCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Service Charge (5%):</span>
                    <span>Rp {selectedReceipt.serviceCharge.toLocaleString()}</span>
                  </div>
                )}
                {selectedReceipt.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Ongkos Kirim:</span>
                    <span>Rp {selectedReceipt.shippingFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-slate-950 text-xs pt-1 border-t border-dashed">
                  <span>GRAND TOTAL:</span>
                  <span>Rp {selectedReceipt.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300 py-1" />

              <div className="space-y-0.5 text-slate-500">
                <div className="flex justify-between">
                  <span>Metode Bayar:</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dibayar:</span>
                  <span className="font-mono">Rp {selectedReceipt.amountPaid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Kembalian:</span>
                  <span className="font-mono">Rp {selectedReceipt.change?.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-400 leading-tight">
                <span>Terima kasih Kak!<br />Bakti Pramuka Untuk Indonesia.</span>
              </div>
            </div>

            {/* Print action simulation */}
            <button
              onClick={() => {
                handlePrintReceipt(selectedReceipt);
              }}
              className="w-full mt-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 transition"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Struk Transaksi (Thermal 58mm)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
