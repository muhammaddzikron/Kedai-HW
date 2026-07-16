/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PurchaseOrder } from '../types';
import {
  FileText,
  Plus,
  ShoppingBag,
  Coins,
  History,
  TrendingUp,
  Truck,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function PurchasesView() {
  const { suppliers, products, addAuditLog } = useApp();

  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE'>('LIST');

  // New PO states
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [poItems, setPoItems] = useState<{ productId: string; qty: number; costPrice: number }[]>([
    { productId: products[0]?.id || '', qty: 10, costPrice: products[0]?.costPrice || 5000 }
  ]);

  // Mock Purchase orders logs
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'po-1',
      poNo: 'PO-20260710-01',
      supplierId: 's1',
      supplierName: 'PT Pramuka Atribut Indonesia',
      date: '2026-07-10T10:00:00Z',
      items: [
        { productId: 'p6', productName: 'Setangan Leher Pramuka Premium (Slayer)', quantity: 100, costPrice: 15000, subtotal: 1500000 }
      ],
      total: 1500000,
      status: 'RECEIVED',
      paymentStatus: 'PAID',
      createdAt: '2026-07-10T10:00:00Z'
    },
    {
      id: 'po-2',
      poNo: 'PO-20260714-02',
      supplierId: 's3',
      supplierName: 'Grosir Kopi Nusantara Bandung',
      date: '2026-07-14T11:30:00Z',
      items: [
        { productId: 'p1', productName: 'Kopi Susu Pandan Kepanduan', quantity: 50, costPrice: 9000, subtotal: 450000 },
        { productId: 'p2', productName: 'Manual Brew V60 Flores Bajawa', quantity: 30, costPrice: 11000, subtotal: 330000 }
      ],
      total: 780000,
      status: 'PENDING',
      paymentStatus: 'DEBT',
      createdAt: '2026-07-14T11:30:00Z'
    }
  ]);

  const handleAddPoItem = () => {
    setPoItems([...poItems, { productId: products[0]?.id || '', qty: 10, costPrice: products[0]?.costPrice || 5000 }]);
  };

  const handleRemovePoItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, key: string, val: string | number) => {
    setPoItems(poItems.map((item, i) => {
      if (i === index) {
        if (key === 'productId') {
          const match = products.find(p => p.id === val);
          return {
            ...item,
            productId: val as string,
            costPrice: match ? match.costPrice : 5000
          };
        }
        return { ...item, [key]: val };
      }
      return item;
    }));
  };

  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === supplierId);
    if (!sup) return;

    const finalItems = poItems.map(item => {
      const match = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: match ? match.name : 'Unknown Product',
        quantity: item.qty,
        costPrice: item.costPrice,
        subtotal: item.qty * item.costPrice
      };
    });

    const totalCost = finalItems.reduce((acc, item) => acc + item.subtotal, 0);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNo: `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      date: new Date().toISOString(),
      items: finalItems,
      total: totalCost,
      status: 'PENDING',
      paymentStatus: 'DEBT',
      createdAt: new Date().toISOString()
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    setActiveTab('LIST');
    addAuditLog('CREATE_PO', 'PURCHASES', `Drafted Purchase Order ${newPO.poNo} to supplier ${sup.name}`);
  };

  const handleReceiveGoods = (poId: string) => {
    setPurchaseOrders(prev =>
      prev.map(po => {
        if (po.id === poId) {
          addAuditLog('RECEIVE_GOODS', 'PURCHASES', `Received supplier stock for Purchase Order ${po.poNo}. Products stocked in core warehouse.`);
          return { ...po, status: 'RECEIVED' };
        }
        return po;
      })
    );
  };

  const totalOutstandingDebt = useMemo(() => {
    return purchaseOrders
      .filter(po => po.paymentStatus === 'DEBT' && po.status === 'RECEIVED')
      .reduce((sum, po) => sum + po.total, 0);
  }, [purchaseOrders]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pembelian & Pasokan Supplier</h2>
          <p className="text-xs text-slate-500">Buat Purchase Order (PO), catat barang datang, dan bayar hutang pasok.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
              activeTab === 'LIST'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Daftar PO
          </button>
          <button
            onClick={() => setActiveTab('CREATE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
              activeTab === 'CREATE'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Buat PO Baru
          </button>
        </div>
      </div>

      {activeTab === 'LIST' ? (
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pembelian (PO)</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">Rp {purchaseOrders.reduce((sum, po) => sum + po.total, 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diterima Lunas</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">Rp {purchaseOrders.filter(po=>po.status === 'RECEIVED').reduce((sum, po) => sum + po.total, 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Coins className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Hutang Dagang</span>
                <span className="text-base font-extrabold text-amber-600 font-mono">Rp {totalOutstandingDebt.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* List PO Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                    <th className="py-3 px-4">No PO</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Tanggal Order</th>
                    <th className="py-3 px-4">Item Komponen</th>
                    <th className="py-3 px-4 text-right">Total Biaya (COGS)</th>
                    <th className="py-3 px-4 text-center">Status Barang</th>
                    <th className="py-3 px-4 text-center">Keuangan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{po.poNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{po.supplierName}</td>
                      <td className="py-3.5 px-4">
                        {new Date(po.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="max-w-xs truncate" title={po.items.map(i=>`${i.productName} (x${i.quantity})`).join(', ')}>
                          {po.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold font-mono text-slate-900">
                        Rp {po.total.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          po.status === 'RECEIVED'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-amber-50 text-amber-500 border border-amber-150 animate-pulse'
                        }`}>
                          {po.status === 'RECEIVED' ? 'Diterima' : 'On Process'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          po.paymentStatus === 'PAID' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-500'
                        }`}>
                          {po.paymentStatus === 'PAID' ? 'Lunas' : 'Tempo (Hutang)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {po.status === 'PENDING' && (
                          <button
                            onClick={() => handleReceiveGoods(po.id)}
                            className="px-2.5 py-1 bg-emerald-500 text-white font-bold text-[10px] rounded-lg hover:bg-emerald-600 transition"
                          >
                            Terima Barang
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Create PO form draft screen */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5 border-b pb-2">
            <Truck className="h-4.5 w-4.5 text-emerald-500" />
            <span>Formulir Pembuatan PO Baru</span>
          </h3>

          <form onSubmit={handleCreatePoSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
            <div>
              <label className="block mb-1">Pilih Vendor Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.contactName})</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Daftar Item Restok</label>
              
              {poItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <div className="col-span-6">
                    <label className="block mb-1 text-[10px] uppercase text-slate-400">Produk</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                    >
                      {products.filter(p=>!p.isDeleted).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block mb-1 text-[10px] uppercase text-slate-400">Qty</label>
                    <input
                      type="number"
                      required
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block mb-1 text-[10px] uppercase text-slate-400">Harga Modal (Rp)</label>
                    <input
                      type="number"
                      required
                      value={item.costPrice}
                      onChange={(e) => handleItemChange(idx, 'costPrice', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemovePoItem(idx)}
                      disabled={poItems.length === 1}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded border border-slate-200 disabled:opacity-35"
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddPoItem}
                className="py-1.5 px-3 border border-dashed border-slate-300 hover:bg-slate-50 text-[10px] font-bold text-slate-600 rounded-lg flex items-center gap-1.5"
              >
                + Tambah Item Lainnya
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-black font-bold text-white rounded-xl shadow-lg transition mt-4"
            >
              Simpan & Terbitkan PO (Status Tempo)
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
