/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  CreditCard,
  PackageCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  ShoppingBag,
  Clock,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function DashboardView({ onOpenReceipt }: { onOpenReceipt: (order: any) => void }) {
  const { orders, products, auditLogs, currentUser, currentBranch } = useApp();

  // Calculate stats for Today (2026-07-15 based on local metadata)
  const stats = useMemo(() => {
    const todayStr = '2026-07-15';
    
    // Filter orders for today
    const todayOrders = orders.filter((o) => o.date.startsWith(todayStr) && o.paymentStatus === 'PAID');
    const yesterdayOrders = orders.filter((o) => o.date.startsWith('2026-07-14') && o.paymentStatus === 'PAID');

    // Today's total sales
    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    // Yesterday's total sales
    const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + o.total, 0);

    // Dynamic sales change percentage
    let salesDiff = 0;
    if (yesterdaySales > 0) {
      salesDiff = Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100);
    } else if (todaySales > 0) {
      salesDiff = 100;
    }

    // Profit Today (Revenue minus cost price of item components)
    let todayProfit = 0;
    todayOrders.forEach((o) => {
      let orderCost = 0;
      o.items.forEach((item) => {
        // match product cost
        const prod = products.find((p) => p.id === item.productId);
        const costPrice = prod ? prod.costPrice : item.price * 0.5; // default 50% margin cost if not found
        orderCost += costPrice * item.quantity;
      });
      todayProfit += (o.total - orderCost);
    });

    // Low stock count
    const lowStockCount = products.filter((p) => !p.isDeleted && p.stock <= p.minStock).length;

    // Today transaction count
    const todayTxCount = todayOrders.length;

    return {
      sales: todaySales,
      salesChange: salesDiff,
      profit: todayProfit,
      txCount: todayTxCount,
      lowStock: lowStockCount,
      todayOrdersList: todayOrders.slice(0, 5) // Recent 5 today
    };
  }, [orders, products]);

  // SVG Chart Calculation for 7 Days Trend
  const chartData = [
    { day: 'Kamis', sales: 1350000 },
    { day: 'Jumat', sales: 2438000 },
    { day: 'Sabtu', sales: 919000 },
    { day: 'Minggu', sales: 1825000 },
    { day: 'Senin', sales: 1120500 },
    { day: 'Selasa', sales: 1539400 },
    { day: 'Rabu (Hari ini)', sales: stats.sales }
  ];

  const maxChartValue = Math.max(...chartData.map((d) => d.sales), 500000) * 1.1;

  // Pie chart calculation (Category distribution)
  const categoryStats = useMemo(() => {
    const cats: Record<string, number> = {};
    products.forEach((p) => {
      if (!p.isDeleted) {
        cats[p.category] = (cats[p.category] || 0) + p.stock;
      }
    });

    const totalStock = Object.values(cats).reduce((a, b) => a + b, 0);

    return Object.entries(cats).map(([name, stock]) => ({
      name,
      stock,
      percentage: totalStock > 0 ? Math.round((stock / totalStock) * 100) : 0
    })).slice(0, 4); // Top 4 categories
  }, [products]);

  // Ring slices coordinates builder for pie chart
  const pieCoordinates = useMemo(() => {
    let accumulatedAngle = 0;
    return categoryStats.map((cat) => {
      const angle = (cat.percentage / 100) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      const x1 = Math.cos((startAngle - 90) * Math.PI / 180) * 50 + 60;
      const y1 = Math.sin((startAngle - 90) * Math.PI / 180) * 50 + 60;
      const x2 = Math.cos((accumulatedAngle - 90) * Math.PI / 180) * 50 + 60;
      const y2 = Math.sin((accumulatedAngle - 90) * Math.PI / 180) * 50 + 60;

      const largeArcFlag = angle > 180 ? 1 : 0;

      return {
        path: `M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
        percentage: cat.percentage,
        name: cat.name
      };
    });
  }, [categoryStats]);

  // List of low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => !p.isDeleted && p.stock <= p.minStock).slice(0, 4);
  }, [products]);

  const colors = ['fill-emerald-500', 'fill-blue-500', 'fill-amber-500', 'fill-rose-500'];
  const borderColors = ['border-emerald-500', 'border-blue-500', 'border-amber-500', 'border-rose-500'];
  const textColors = ['text-emerald-400', 'text-blue-400', 'text-amber-400', 'text-rose-400'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {currentBranch.name}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Selamat Datang, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500">
            Berikut ringkasan aktivitas kedai Anda hari ini, Rabu 15 Juli 2026.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-600 shadow-sm">
          <Clock className="h-4 w-4 text-indigo-500" />
          <span>Sesi Kasir: {currentUser.role}</span>
        </div>
      </div>

      {/* Analytical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div id="stat-revenue" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Penjualan Hari Ini</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Rp {stats.sales.toLocaleString('id-ID')}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              {stats.salesChange >= 0 ? (
                <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +{stats.salesChange}%
                </span>
              ) : (
                <span className="flex items-center text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full">
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                  {stats.salesChange}%
                </span>
              )}
              <span className="text-[10px] text-slate-400">vs kemarin</span>
            </div>
          </div>
        </div>

        {/* Card 2: Profit */}
        <div id="stat-profit" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Laba Kotor</span>
            <div className="p-2 bg-indigo-55 bg-indigo-50 rounded-xl text-indigo-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Rp {stats.profit.toLocaleString('id-ID')}
            </h3>
            <span className="text-[10px] text-slate-400 block mt-2">Margin Kotor: ~51% dari penjualan</span>
          </div>
        </div>

        {/* Card 3: Transaction Count */}
        <div id="stat-transactions" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-medium">Transaksi Selesai</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <PackageCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.txCount} Transaksi
            </h3>
            <span className="text-[10px] text-slate-400 block mt-2">Rata-rata order: Rp {(stats.txCount > 0 ? Math.round(stats.sales / stats.txCount) : 0).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Card 4: Low Stock warning */}
        <div id="stat-low-stock" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Warning Stok Rendah</span>
            <div className={`p-2 rounded-xl ${stats.lowStock > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.lowStock} Produk
            </h3>
            <span className="text-[10px] text-slate-400 block mt-2">Perlu pemesanan ke Supplier segera</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Line Chart (7 Days) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-bold text-slate-950">Tren Penjualan Mingguan</h4>
              <p className="text-xs text-slate-500">Performa transaksi 7 hari terakhir</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
              Utama
            </span>
          </div>

          {/* Pure SVG Line Chart */}
          <div className="w-full h-64 mt-4 relative">
            <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="70" x2="490" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="120" x2="490" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="170" x2="490" y2="170" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="190" x2="490" y2="190" stroke="#e2e8f0" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="5" y="24" className="text-[9px] fill-slate-400 font-medium font-mono">2.5M</text>
              <text x="5" y="74" className="text-[9px] fill-slate-400 font-medium font-mono">1.8M</text>
              <text x="5" y="124" className="text-[9px] fill-slate-400 font-medium font-mono">1.0M</text>
              <text x="5" y="174" className="text-[9px] fill-slate-400 font-medium font-mono">500K</text>

              {/* Data points projection */}
              {(() => {
                const points = chartData.map((d, idx) => {
                  const x = 30 + idx * 75;
                  const y = 190 - (d.sales / maxChartValue) * 160;
                  return { x, y, ...d };
                });

                const pathString = `M ${points[0].x} ${points[0].y} ` + 
                  points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

                const areaString = `${pathString} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`;

                return (
                  <>
                    {/* Shaded Area */}
                    <path d={areaString} fill="url(#chartGradient)" />

                    {/* Bold Line */}
                    <path d={pathString} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Nodes and Hover Indicators */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
                        <text x={p.x} y="205" className="text-[8px] font-semibold fill-slate-500 text-center" textAnchor="middle">
                          {p.day}
                        </text>
                        <text x={p.x} y={p.y - 10} className="text-[8px] font-bold fill-slate-800 text-center" textAnchor="middle">
                          {(p.sales / 1000).toFixed(0)}K
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Ring Pie Chart (Category Distribution) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-950">Persediaan Kategori</h4>
            <p className="text-xs text-slate-500 font-medium">Berdasarkan volume unit stok</p>
          </div>

          <div className="flex items-center justify-center py-6">
            <div className="relative w-36 h-36">
              {categoryStats.length > 0 ? (
                <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                  {pieCoordinates.map((coord, idx) => (
                    <path
                      key={idx}
                      d={coord.path}
                      className={`${colors[idx % colors.length]} hover:opacity-90 transition cursor-pointer`}
                      title={`${coord.name}: ${coord.percentage}%`}
                    />
                  ))}
                  {/* Center punch hole to make it a donut chart */}
                  <circle cx="60" cy="60" r="32" fill="#ffffff" />
                </svg>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-dashed border-slate-100 flex items-center justify-center text-xs text-slate-400">
                  No Data
                </div>
              )}
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-slate-800">{products.filter(p => !p.isDeleted).reduce((a,b) => a+b.stock, 0)}</span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Total Qty</span>
              </div>
            </div>
          </div>

          {/* Legends */}
          <div className="space-y-1.5 mt-2">
            {categoryStats.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${colors[idx % colors.length]}`} />
                  <span className="text-slate-600 font-medium truncate max-w-[120px]">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{cat.percentage}% ({cat.stock} cup)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Split Details Section: Low stock alerts & Recent Transactions Today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Today's Completed Receipts list */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-950">Transaksi Selesai Hari Ini</h4>
              <p className="text-xs text-slate-500">Log order pembayaran lunas</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">{stats.todayOrdersList.length} total</span>
          </div>

          {stats.todayOrdersList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="py-2.5 px-3">No Invoice</th>
                    <th className="py-2.5 px-3">Pelanggan</th>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Metode</th>
                    <th className="py-2.5 px-3 text-right">Total Tagihan</th>
                    <th className="py-2.5 px-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.todayOrdersList.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-semibold text-slate-900">{order.orderNo}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {order.customerName || <span className="text-slate-400">Guest</span>}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(order.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[9px] tracking-wider uppercase bg-slate-100 text-slate-700">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-950">
                        Rp {order.total.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onOpenReceipt(order)}
                          className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 transition text-[10px] font-bold rounded-lg border border-slate-200"
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 mt-2">
              <ShoppingBag className="h-8 w-8 mb-2 stroke-1.5" />
              <p className="text-xs font-semibold">Belum ada penjualan lunas hari ini.</p>
              <p className="text-[10px]">Silakan buka menu POS Cashier untuk mencatat transaksi.</p>
            </div>
          )}
        </div>

        {/* Right Side: Low Stock Alerts widget & Live Audit Log snippet */}
        <div className="space-y-6">
          {/* Low Stock Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="text-sm font-bold text-slate-950 mb-3">Peringatan Menipis</h4>
            <div className="space-y-3">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">
                        {p.name}
                      </h5>
                      <span className="text-[9px] font-semibold text-slate-400 font-mono block">
                        SKU: {p.sku}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${p.stock === 0 ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-amber-50 text-amber-600'}`}>
                        {p.stock} {p.unit}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Min: {p.minStock}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-28 flex flex-col items-center justify-center text-slate-400 text-center bg-emerald-50/20 border border-dashed border-emerald-100 rounded-xl">
                  <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider block">✓ STOK AMAN</span>
                  <p className="text-[10px] text-slate-500 mt-1">Semua produk berada di atas batas minimal stok.</p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="text-sm font-bold text-slate-950 mb-3">Sistem Aktivitas Terakhir</h4>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="flex gap-2 text-[11px] border-l-2 border-slate-200 pl-2.5 relative pb-1">
                  <div className="absolute -left-1.5 top-1 bg-slate-300 h-2.5 w-2.5 rounded-full ring-4 ring-white" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 uppercase tracking-wide text-[9px]">{log.module}</span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-normal">{log.description}</p>
                    <span className="text-[9px] text-slate-400 block">{log.userName} ({log.role})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
