/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OnlineOrder, Product } from '../types';
import {
  Search,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Truck,
  X,
  Plus,
  Minus,
  Check,
  Smartphone,
  Wallet,
  Coins,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  MapPin,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronRight
} from 'lucide-react';

export default function MarketplacePortal() {
  const {
    products,
    onlineOrders,
    addOnlineOrder,
    updateOnlineOrderStatus,
    orders,
    currentBranch,
    isLocked
  } = useApp();

  // Mode state: 'CUSTOMER' (storefront) or 'STAFF' (approvals queue)
  const [activePortalMode, setActivePortalMode] = useState<'CUSTOMER' | 'STAFF'>('CUSTOMER');
  const effectivePortalMode = isLocked ? 'CUSTOMER' : activePortalMode;

  // CUSTOMER STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [customerCart, setCustomerCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('GrabExpress Instant');
  const [selectedPayment, setSelectedPayment] = useState<'MIDTRANS' | 'WHATSAPP_COD'>('WHATSAPP_COD');
  
  // Modals / Success states
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OnlineOrder | null>(null);

  // STAFF STATE
  const [staffFilterStatus, setStaffFilterStatus] = useState<OnlineOrder['status'] | 'ALL'>('ALL');
  const [selectedStaffOrder, setSelectedStaffOrder] = useState<OnlineOrder | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const list = new Set<string>();
    products.forEach((p) => {
      if (!p.isDeleted) list.add(p.category);
    });
    return ['Semua', ...Array.from(list)];
  }, [products]);

  // Online available products
  const onlineProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.isDeleted) return false;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart actions
  const addToCustomerCart = (product: Product) => {
    setCustomerCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCustomerCartQty = (productId: string, amount: number) => {
    setCustomerCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + amount;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCustomerCart = () => {
    setCustomerCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
  };

  const cartTotal = useMemo(() => {
    return customerCart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  }, [customerCart]);

  // Handle Customer Checkout Submit
  const handleCustomerCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerCart.length === 0) return;
    if (!customerName || !customerPhone || !deliveryAddress) {
      alert('Silakan isi seluruh informasi pemesanan Anda.');
      return;
    }

    const orderItems = customerCart.map((item) => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.sellingPrice,
      subtotal: item.product.sellingPrice * item.quantity
    }));

    // Submit online order
    const payload = {
      customerName,
      customerPhone,
      items: orderItems,
      total: cartTotal,
      status: 'PENDING' as const,
      shippingAddress: deliveryAddress,
      shippingCourier: selectedCourier,
      paymentGateway: selectedPayment
    };

    addOnlineOrder(payload);

    // Capture newest created order to show success screen
    const generatedOrderNo = `ONL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(onlineOrders.length + 1).padStart(4, '0')}`;
    const confirmedOrder: OnlineOrder = {
      ...payload,
      id: `oo-new-${Date.now()}`,
      orderNo: generatedOrderNo,
      date: new Date().toISOString()
    };

    setSubmittedOrder(confirmedOrder);
    clearCustomerCart();
    setShowCartDrawer(false);
  };

  // Filtered Online Orders for Staff
  const filteredStaffOrders = useMemo(() => {
    return onlineOrders.filter((o) => {
      if (staffFilterStatus === 'ALL') return true;
      return o.status === staffFilterStatus;
    });
  }, [onlineOrders, staffFilterStatus]);

  // Helpers
  const getStatusBadgeClass = (status: OnlineOrder['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getStatusTranslation = (status: OnlineOrder['status']) => {
    switch (status) {
      case 'PENDING': return 'Menunggu Persetujuan';
      case 'PROCESSING': return 'Diproses & Dikemas';
      case 'SHIPPED': return 'Dalam Pengiriman';
      case 'DELIVERED': return 'Selesai Terkirim';
      case 'CANCELLED': return 'Dibatalkan';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
      {/* Top Selector Panel: Dual-Mode Switcher */}
      <div className="bg-slate-55 bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-600" />
            <span>Portal Marketplace Mandiri</span>
          </h3>
          <p className="text-xs text-slate-500">
            Simulasi transaksi mandiri bagi pelanggan & persetujuan invoice instan oleh Admin.
          </p>
        </div>

        {/* Custom Segmented Controller Tab */}
        {!isLocked && (
          <div className="flex bg-slate-200/60 p-1 rounded-xl self-stretch sm:self-auto">
            <button
              id="mode-customer-btn"
              onClick={() => setActivePortalMode('CUSTOMER')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePortalMode === 'CUSTOMER'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Mode Pelanggan (Store)</span>
            </button>
            <button
              id="mode-staff-btn"
              onClick={() => setActivePortalMode('STAFF')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
                activePortalMode === 'STAFF'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Persetujuan Admin</span>
              {onlineOrders.filter(o => o.status === 'PENDING').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] h-4.5 min-w-4.5 px-1.5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-bounce shadow-sm">
                  {onlineOrders.filter(o => o.status === 'PENDING').length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* PORTAL BODY */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* =======================================================
            MODE 1: CUSTOMER VIEW (STOREFRONT & CATALOG)
            ======================================================= */}
        {effectivePortalMode === 'CUSTOMER' && (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar: Category Selector and Search Bar */}
            <div className="p-4 bg-slate-50/40 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
              {/* Category buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari produk kedai..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                />
              </div>

              {/* Cart Summary Header on mobile */}
              {customerCart.length > 0 && (
                <button
                  onClick={() => setShowCartDrawer(true)}
                  className="sm:hidden py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Keranjang Belanja ({customerCart.reduce((sum, i) => sum + i.quantity, 0)})</span>
                </button>
              )}
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              {onlineProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {onlineProducts.map((prod) => {
                    const cartItem = customerCart.find(i => i.product.id === prod.id);
                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          {/* Image Placeholder */}
                          <div className="aspect-video w-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 font-bold text-lg select-none mb-2 overflow-hidden relative border border-slate-100">
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span>⛺ KK</span>
                            )}
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-650 bg-indigo-600 text-[9px] font-bold text-white uppercase rounded shadow-xs">
                              {prod.category}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {prod.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-150 border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-semibold uppercase">Harga Unit</span>
                            <span className="text-xs font-extrabold text-slate-950">
                              Rp {prod.sellingPrice.toLocaleString('id-ID')}
                            </span>
                          </div>

                          {prod.stock <= 0 ? (
                            <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-[10px] font-bold">Stok Habis</span>
                          ) : cartItem ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateCustomerCartQty(prod.id, -1)}
                                className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-bold text-slate-800 w-4 text-center">{cartItem.quantity}</span>
                              <button
                                onClick={() => addToCustomerCart(prod)}
                                className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition"
                                disabled={cartItem.quantity >= prod.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCustomerCart(prod)}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition shadow-xs"
                            >
                              Tambah +
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-xs font-semibold">Tidak menemukan produk yang cocok.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Silakan gunakan kata kunci pencarian atau kategori lain.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer Sidebar: Cart Drawer on Desktop */}
        {effectivePortalMode === 'CUSTOMER' && (
          <div className="hidden lg:flex w-80 bg-slate-50 border-l border-slate-200 p-5 flex-col justify-between">
            {customerCart.length > 0 ? (
              <form onSubmit={handleCustomerCheckout} className="flex-1 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingBag className="h-4 w-4 text-emerald-500" />
                      <span>Keranjang Belanja</span>
                    </h4>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {customerCart.reduce((sum, item) => sum + item.quantity, 0)} Item
                    </span>
                  </div>

                  {/* Basket Items List */}
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {customerCart.map((item) => (
                      <div key={item.product.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <div className="truncate max-w-[150px]">
                          <span className="font-bold text-slate-800 block truncate leading-tight">{item.product.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Rp {item.product.sellingPrice.toLocaleString('id-ID')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateCustomerCartQty(item.product.id, -1)}
                            className="h-5 w-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-800 w-3 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCustomerCartQty(item.product.id, 1)}
                            className="h-5 w-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 flex items-center justify-center font-bold"
                            disabled={item.quantity >= item.product.stock}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Form fields */}
                  <div className="space-y-2.5 border-t border-slate-200 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Informasi Pengiriman</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block">NAMA LENGKAP</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block">NOMOR WHATSAPP</label>
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 08123456789"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block">ALAMAT PENGIRIMAN</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Tulis alamat rumah lengkap..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block">KURIR</label>
                        <select
                          value={selectedCourier}
                          onChange={(e) => setSelectedCourier(e.target.value)}
                          className="w-full p-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                        >
                          <option>GrabExpress Instant</option>
                          <option>Gojek Send Sameday</option>
                          <option>J&T Express (Regular)</option>
                          <option>JNE Regular</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block">PEMBAYARAN</label>
                        <select
                          value={selectedPayment}
                          onChange={(e) => setSelectedPayment(e.target.value as any)}
                          className="w-full p-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="WHATSAPP_COD">WhatsApp COD</option>
                          <option value="MIDTRANS">Instant QRIS / Bank</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">Total Belanja:</span>
                    <span className="font-extrabold text-base text-slate-900">Rp {cartTotal.toLocaleString('id-ID')}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition"
                  >
                    Kirim Pesanan Saya
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 px-4">
                <ShoppingBag className="h-10 w-10 mb-2 stroke-1" />
                <p className="text-xs font-semibold">Keranjang Belanja Kosong</p>
                <p className="text-[10px] text-slate-500 mt-1">Silakan klik tombol "Tambah" di sebelah produk yang Anda inginkan.</p>
              </div>
            )}
          </div>
        )}

        {/* =======================================================
            MODE 2: STAFF VIEW (APPROVAL QUEUE)
            ======================================================= */}
        {effectivePortalMode === 'STAFF' && (
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Orders list left pane */}
            <div className="flex-1 border-r border-slate-200 flex flex-col">
              {/* Filter tabs */}
              <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {(['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStaffFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        staffFilterStatus === status
                          ? 'bg-slate-800 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {status === 'ALL' ? 'Semua' : getStatusTranslation(status as any)}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  {filteredStaffOrders.length} Pesanan
                </span>
              </div>

              {/* List body */}
              <div className="flex-1 overflow-y-auto max-h-[500px]">
                {filteredStaffOrders.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {filteredStaffOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedStaffOrder(order)}
                        className={`p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          selectedStaffOrder?.id === order.id ? 'bg-indigo-50/50 hover:bg-indigo-50' : ''
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">{order.orderNo}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeClass(order.status)}`}>
                              {getStatusTranslation(order.status)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{order.customerName}</span>
                            <span>•</span>
                            <span>{new Date(order.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                          </div>

                          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[300px]">
                            {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 sm:text-right">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Tagihan</span>
                            <span className="text-xs font-black text-indigo-700">
                              Rp {order.total.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 hidden sm:block" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <Clock className="h-10 w-10 mx-auto mb-2 stroke-1" />
                    <p className="text-xs font-semibold">Tidak Ada Pesanan</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Tidak ada pesanan online dengan filter status ini.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected order detail pane */}
            <div className="w-full lg:w-96 p-5 bg-slate-50 flex flex-col justify-between">
              {selectedStaffOrder ? (
                <div className="flex flex-col justify-between h-full">
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                      <div>
                        <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight">Detail Pesanan</h4>
                        <span className="text-[10px] font-mono text-slate-400 font-bold block mt-0.5">{selectedStaffOrder.orderNo}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeClass(selectedStaffOrder.status)}`}>
                        {getStatusTranslation(selectedStaffOrder.status)}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Penerima & Alamat</span>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-bold text-slate-800">{selectedStaffOrder.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                          <a
                            href={`https://wa.me/${selectedStaffOrder.customerPhone.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-emerald-600 hover:underline"
                          >
                            {selectedStaffOrder.customerPhone} (WhatsApp COD)
                          </a>
                        </div>
                        <div className="flex items-start gap-1.5 pt-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-600 font-medium leading-relaxed">
                            {selectedStaffOrder.shippingAddress} <br />
                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 inline-block bg-slate-100 px-1.5 py-0.2 rounded">
                              Kurir: {selectedStaffOrder.shippingCourier}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ordered items */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Item Pembelian</span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {selectedStaffOrder.items.map((item, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-800 block">{item.productName}</span>
                              <span className="text-[10px] text-slate-400">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</span>
                            </div>
                            <span className="font-extrabold text-slate-900">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total invoice & payment status */}
                    <div className="bg-slate-200/50 p-3.5 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600 font-semibold">
                        <span>Pintu Gerbang Pembayaran:</span>
                        <span className="font-bold text-slate-800">
                          {selectedStaffOrder.paymentGateway === 'MIDTRANS' ? 'M-QRIS Midtrans' : 'COD WhatsApp'}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-extrabold text-slate-950 border-t border-slate-200/60 pt-1.5 mt-1.5">
                        <span>Grand Total:</span>
                        <span>Rp {selectedStaffOrder.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Integration status link */}
                    {orders.some(o => o.holdName === selectedStaffOrder.orderNo) && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <div className="font-medium">
                          <span>Terhubung ke POS Kasir!</span>
                          <span className="block text-[10px] text-slate-500 font-bold mt-0.5">
                            Invoice: {orders.find(o => o.holdName === selectedStaffOrder.orderNo)?.orderNo}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-4 border-t border-slate-200 mt-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider mb-2.5">Perbarui Alur Kerja</span>
                    
                    {selectedStaffOrder.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            updateOnlineOrderStatus(selectedStaffOrder.id, 'CANCELLED');
                            setSelectedStaffOrder({ ...selectedStaffOrder, status: 'CANCELLED' });
                          }}
                          className="flex-1 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-200 transition"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => {
                            updateOnlineOrderStatus(selectedStaffOrder.id, 'PROCESSING');
                            setSelectedStaffOrder({ ...selectedStaffOrder, status: 'PROCESSING' });
                            alert('Pesanan berhasil disetujui! Stok telah dipotong otomatis dan tercatat dalam invoice kasir.');
                          }}
                          className="flex-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/15 transition"
                        >
                          Setujui & Proses (Dipotong Stok)
                        </button>
                      </div>
                    )}

                    {selectedStaffOrder.status === 'PROCESSING' && (
                      <button
                        onClick={() => {
                          updateOnlineOrderStatus(selectedStaffOrder.id, 'SHIPPED');
                          setSelectedStaffOrder({ ...selectedStaffOrder, status: 'SHIPPED' });
                          alert('Kurir pengiriman berhasil dipanggil!');
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
                      >
                        Kirim Pesanan (Siap Diantar)
                      </button>
                    )}

                    {selectedStaffOrder.status === 'SHIPPED' && (
                      <button
                        onClick={() => {
                          updateOnlineOrderStatus(selectedStaffOrder.id, 'DELIVERED');
                          setSelectedStaffOrder({ ...selectedStaffOrder, status: 'DELIVERED' });
                          alert('Pesanan online sukses diselesaikan!');
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                      >
                        Selesaikan Pengiriman (Lunas)
                      </button>
                    )}

                    {(selectedStaffOrder.status === 'DELIVERED' || selectedStaffOrder.status === 'CANCELLED') && (
                      <div className="text-center p-2.5 bg-slate-100 rounded-xl text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        Siklus Pesanan Telah Selesai
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <FileText className="h-10 w-10 mb-2 stroke-1" />
                  <p className="text-xs font-semibold">Pilih Pesanan</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Silakan pilih pesanan dari kolom kiri untuk melihat rincian.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SUCCESS CONFIRMATION MODAL FOR CUSTOMER */}
      {submittedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl text-center relative">
            <button
              onClick={() => setSubmittedOrder(null)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <Check className="h-6 w-6 stroke-2" />
            </div>

            <h3 className="text-sm font-extrabold text-slate-950 mb-1">Pemesanan Mandiri Berhasil!</h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-4 leading-relaxed">
              Pesanan Anda dengan nomor <br />
              <span className="text-indigo-600 font-black">{submittedOrder.orderNo}</span> telah kami daftarkan di antrean persetujuan Kedai.
            </p>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left space-y-2 text-xs mb-5 font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Pelanggan:</span>
                <span className="font-bold text-slate-800">{submittedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Metode Pembayaran:</span>
                <span className="font-bold text-slate-800">
                  {submittedOrder.paymentGateway === 'MIDTRANS' ? 'Instant QRIS Midtrans' : 'WhatsApp COD'}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Metode Pengiriman:</span>
                <span className="font-bold text-slate-800">{submittedOrder.shippingCourier}</span>
              </div>
              <div className="flex justify-between text-slate-950 font-extrabold pt-2 border-t border-slate-200">
                <span>Total Tagihan:</span>
                <span>Rp {submittedOrder.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Simulated CTA Link to WhatsApp */}
            <a
              href={`https://wa.me/628123456789?text=Halo%20Kedai%20Kepanduan!%20Saya%20ingin%20mengonfirmasi%20order%20marketplace%20dengan%20Nomor%20${submittedOrder.orderNo}%20atas%20nama%20${submittedOrder.customerName}%20sebesar%20Rp%20${submittedOrder.total.toLocaleString('id-ID')}.%20Tolong%20disetujui%20ya!`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition mb-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Konfirmasi via WhatsApp</span>
            </a>

            <button
              onClick={() => setSubmittedOrder(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
            >
              Belanja Kembali
            </button>
          </div>
        </div>
      )}

      {/* MOBILE CART DRAWER */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end lg:hidden">
          <div className="bg-white w-full max-w-sm h-full p-5 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h4 className="font-extrabold text-sm text-slate-950 flex items-center gap-1.5">
                <ShoppingBag className="h-4.5 w-4.5 text-emerald-500" />
                <span>Keranjang Belanja ({customerCart.length})</span>
              </h4>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile form and lists */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {customerCart.map((item) => (
                <div key={item.product.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-250/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block leading-tight">{item.product.name}</span>
                    <span className="text-[10px] text-slate-400">Rp {item.product.sellingPrice.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCustomerCartQty(item.product.id, -1)}
                      className="h-5 w-5 bg-white border border-slate-200 rounded text-slate-600 flex items-center justify-center font-bold shadow-xs"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-800 w-3 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCustomerCartQty(item.product.id, 1)}
                      className="h-5 w-5 bg-white border border-slate-200 rounded text-slate-600 flex items-center justify-center font-bold shadow-xs"
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="space-y-2.5 border-t border-slate-100 pt-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Informasi Pengiriman</span>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold block">NAMA LENGKAP</label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold block">NOMOR WHATSAPP</label>
                  <input
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold block">ALAMAT LENGKAP</label>
                  <textarea
                    rows={2}
                    placeholder="Tulis alamat rumah lengkap..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block">KURIR</label>
                    <select
                      value={selectedCourier}
                      onChange={(e) => setSelectedCourier(e.target.value)}
                      className="w-full p-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                    >
                      <option>GrabExpress Instant</option>
                      <option>Gojek Send Sameday</option>
                      <option>J&T Express (Regular)</option>
                      <option>JNE Regular</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block">PEMBAYARAN</label>
                    <select
                      value={selectedPayment}
                      onChange={(e) => setSelectedPayment(e.target.value as any)}
                      className="w-full p-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="WHATSAPP_COD">WhatsApp COD</option>
                      <option value="MIDTRANS">Instant QRIS / Bank</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Total Tagihan:</span>
                <span className="font-extrabold text-base text-slate-900">Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>

              <button
                onClick={handleCustomerCheckout}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Kirim Pesanan Saya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
