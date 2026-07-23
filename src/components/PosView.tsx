/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductVariant, ProductModifier, Customer, Promotion, Order, PaymentMethod } from '../types';
import {
  Search,
  Filter,
  Trash2,
  Tag,
  Users,
  X,
  Plus,
  Minus,
  Check,
  CreditCard,
  QrCode,
  Smartphone,
  Wallet,
  Coins,
  History,
  Notebook,
  AlertCircle,
  HelpCircle,
  Truck,
  Edit3,
  Printer,
  RotateCcw,
  FileText,
  CheckCircle,
  Package,
  Calendar,
  DollarSign,
  Receipt,
  RefreshCw,
  CloudDownload,
  CloudUpload,
  Database
} from 'lucide-react';

export default function PosView({ onCheckoutSuccess }: { onCheckoutSuccess: (order: any) => void }) {
  const {
    products,
    customers,
    promotions,
    orders,
    updateOrder,
    refundOrder,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartItemDiscount,
    updateCartItemNotes,
    clearCart,
    holdCurrentCart,
    holdOrders,
    restoreHeldCart,
    deleteHeldCart,
    checkoutCart,
    activeShift,
    openShift,
    currentUser,
    currentBranch,
    googleAppsScriptUrl,
    pullOrdersFromGoogleSheets,
    pushAllOrdersToGoogleSheets,
    isSyncing
  } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [customCartDiscount, setCustomCartDiscount] = useState(0); // overall percentage
  const [shippingFee, setShippingFee] = useState<number>(0);
  
  // Modals / Overlays
  const [selectedProductForOptions, setSelectedProductForOptions] = useState<Product | null>(null);
  const [chosenVariant, setChosenVariant] = useState<ProductVariant | undefined>(undefined);
  const [chosenModifiers, setChosenModifiers] = useState<ProductModifier[]>([]);
  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'QRIS' | 'CARD' | 'E-WALLET' | 'TRANSFER'>('CASH');
  const [cashReceived, setCashReceived] = useState('');
  const [cashDifferenceError, setCashDifferenceError] = useState(false);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdName, setHoldName] = useState('');
  
  // Rekap Transaksi & Edit State
  const [showRecentTransactionsModal, setShowRecentTransactionsModal] = useState(false);
  const [recentSearchQuery, setRecentSearchQuery] = useState('');
  const [recentFilterStatus, setRecentFilterStatus] = useState<'ALL' | 'PAID' | 'UNPAID' | 'REFUNDED'>('ALL');

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editFormCustomerName, setEditFormCustomerName] = useState('');
  const [editFormCustomerPhone, setEditFormCustomerPhone] = useState('');
  const [editFormPaymentMethod, setEditFormPaymentMethod] = useState<'CASH' | 'QRIS' | 'CARD' | 'E-WALLET' | 'TRANSFER'>('CASH');
  const [editFormPaymentStatus, setEditFormPaymentStatus] = useState<'PAID' | 'UNPAID' | 'PARTIAL' | 'REFUNDED'>('PAID');
  const [editFormShippingFee, setEditFormShippingFee] = useState<number>(0);
  const [editFormDiscount, setEditFormDiscount] = useState<number>(0);
  const [editFormItems, setEditFormItems] = useState<Order['items']>([]);

  // Image error tracker
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const filteredRecentOrders = useMemo(() => {
    return (orders || [])
      .filter((o) => {
        const q = recentSearchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          o.orderNo.toLowerCase().includes(q) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          (o.cashierName && o.cashierName.toLowerCase().includes(q));

        const matchesStatus =
          recentFilterStatus === 'ALL' || o.paymentStatus === recentFilterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, recentSearchQuery, recentFilterStatus]);

  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePullFromSpreadsheet = async () => {
    setSyncStatusMsg(null);
    try {
      await pullOrdersFromGoogleSheets();
      setSyncStatusMsg({ type: 'success', text: 'Berhasil membaca & menyinkronkan data rekap transaksi dari Google Sheets!' });
    } catch (err: any) {
      setSyncStatusMsg({ type: 'error', text: `Gagal membaca data Spreadsheet: ${err.message || err}` });
    }
  };

  const handlePushToSpreadsheet = async () => {
    setSyncStatusMsg(null);
    try {
      const res = await pushAllOrdersToGoogleSheets();
      if (res) {
        setSyncStatusMsg({ type: 'success', text: 'Berhasil mengunggah seluruh data rekap transaksi ke Google Sheets!' });
      } else {
        setSyncStatusMsg({ type: 'error', text: 'Gagal mengunggah data ke Google Sheets. Pastikan URL Apps Script di Pengaturan sudah dikonfigurasi.' });
      }
    } catch (err: any) {
      setSyncStatusMsg({ type: 'error', text: `Error: ${err.message || err}` });
    }
  };

  const handleStartEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditFormCustomerName(order.customerName || 'Pelanggan Umum');
    setEditFormCustomerPhone(order.customerPhone || '');
    setEditFormPaymentMethod(order.paymentMethod || 'CASH');
    setEditFormPaymentStatus(order.paymentStatus || 'PAID');
    setEditFormShippingFee(order.shippingFee || 0);
    setEditFormDiscount(order.discount || 0);
    setEditFormItems(order.items ? JSON.parse(JSON.stringify(order.items)) : []);
  };

  const handleSaveEditOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const subtotal = editFormItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = Math.max(0, subtotal - editFormDiscount + editFormShippingFee);

    updateOrder(editingOrder.id, {
      customerName: editFormCustomerName,
      customerPhone: editFormCustomerPhone,
      paymentMethod: editFormPaymentMethod,
      paymentStatus: editFormPaymentStatus,
      shippingFee: editFormShippingFee,
      discount: editFormDiscount,
      items: editFormItems,
      subtotal,
      total
    });

    alert(`Data Transaksi #${editingOrder.orderNo} berhasil diperbarui!`);
    setEditingOrder(null);
  };

  const handleUpdateEditItemQty = (index: number, delta: number) => {
    setEditFormItems((prev) => {
      const next = [...prev];
      const item = { ...next[index] };
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== index);
      }
      item.quantity = newQty;
      item.subtotal = item.price * newQty;
      next[index] = item;
      return next;
    });
  };
  
  // Shift Lock Modal State
  const [shiftStartingCash, setShiftStartingCash] = useState('200000');

  // Mobile View Toggle
  const [activeMobileView, setActiveMobileView] = useState<'PRODUCTS' | 'CART'>('PRODUCTS');

  // Categories list
  const categories = useMemo(() => {
    const list = new Set<string>();
    products.forEach((p) => {
      if (!p.isDeleted) list.add(p.category);
    });
    return ['Semua', ...Array.from(list)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.isDeleted) return false;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.barcode.includes(searchQuery);
      const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Filtered Customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return customers;
    const query = customerSearchQuery.toLowerCase();
    return customers.filter((c) => 
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  }, [customers, customerSearchQuery]);

  // Subtotal calculations
  const totals = useMemo(() => {
    let subtotal = 0;
    cart.forEach((item) => {
      const basePrice = item.product.sellingPrice;
      const variantAdd = item.selectedVariant ? item.selectedVariant.priceDifference : 0;
      const modifierAdd = item.selectedModifiers.reduce((acc, m) => acc + m.price, 0);
      const singlePrice = basePrice + variantAdd + modifierAdd;
      
      const itemSubtotal = singlePrice * item.quantity;
      subtotal += itemSubtotal;
    });

    // Discount calculations
    let discountValue = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'DISCOUNT_PERCENT') {
        discountValue = Math.round(subtotal * (appliedPromo.value / 100));
      } else if (appliedPromo.type === 'HAPPY_HOUR') {
        discountValue = appliedPromo.value;
      }
    } else if (customCartDiscount > 0) {
      discountValue = Math.round(subtotal * (customCartDiscount / 100));
    }

    const finalTotal = subtotal - discountValue + shippingFee;

    return {
      subtotal,
      discount: discountValue,
      shippingFee,
      total: finalTotal
    };
  }, [cart, appliedPromo, customCartDiscount, shippingFee]);

  // Cash change calculation
  const cashChange = useMemo(() => {
    const parsed = parseFloat(cashReceived);
    if (isNaN(parsed)) return 0;
    return Math.max(0, parsed - totals.total);
  }, [cashReceived, totals]);

  // QRIS Mock String
  const mockQrisString = useMemo(() => {
    return `00020101021226380010GPN011122233344455502030015111001454320253033605408${totals.total}5802ID5915KEDAI_PRAMUKA6007BANDUNG6304D1A2`;
  }, [totals.total]);

  // Add Item to Cart (Handles popup choice if variant or modifier exists)
  const handleItemClick = (product: Product) => {
    if (product.stock <= 0) {
      alert('Stok produk habis!');
      return;
    }
    if (product.variants.length > 0 || product.modifiers.length > 0) {
      setSelectedProductForOptions(product);
      setChosenVariant(product.variants[0] || undefined);
      setChosenModifiers([]);
    } else {
      addToCart(product);
    }
  };

  const handleApplyPromo = () => {
    const found = promotions.find((p) => p.code.toUpperCase() === promoCode.toUpperCase() && p.isActive);
    if (found) {
      setAppliedPromo(found);
      setCustomCartDiscount(0); // clear custom if promo matches
    } else {
      alert('Kode promo tidak valid atau kadaluarsa');
    }
  };

  const handleCheckoutSubmit = () => {
    const parsedCash = parseFloat(cashReceived);
    if (selectedPaymentMethod === 'CASH' && (isNaN(parsedCash) || parsedCash < totals.total)) {
      setCashDifferenceError(true);
      return;
    }
    
    setCashDifferenceError(false);
    
    // Process order in state
    const createdOrder = checkoutCart(selectedPaymentMethod, selectedPaymentMethod === 'CASH' ? parsedCash : totals.total, {
      customerId: selectedCustomer?.id,
      discount: totals.discount,
      shippingFee: shippingFee
    });

    // Reset local checkout selections
    setShowCheckoutModal(false);
    setSelectedCustomer(null);
    setAppliedPromo(null);
    setPromoCode('');
    setCashReceived('');
    setCustomCartDiscount(0);
    setShippingFee(0);

    onCheckoutSuccess(createdOrder);
  };

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cash = parseFloat(shiftStartingCash);
    if (!isNaN(cash)) {
      openShift(cash);
    }
  };

  // Switch modifier select
  const toggleModifier = (mod: ProductModifier) => {
    if (chosenModifiers.some((m) => m.id === mod.id)) {
      setChosenModifiers(chosenModifiers.filter((m) => m.id !== mod.id));
    } else {
      setChosenModifiers([...chosenModifiers, mod]);
    }
  };

  // Ensure Shift is Opened First
  if (!activeShift) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
            <Coins className="h-8 w-8 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Shift Kasir Belum Dibuka</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Harap isi jumlah modal awal laci uang (Cash Drawer Drawer) untuk membuka shift sebelum memulai transaksi kasir.
          </p>

          <form onSubmit={handleOpenShiftSubmit} className="w-full mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Nama Kasir Aktif
              </label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Modal Awal Cash Drawer (IDR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  required
                  value={shiftStartingCash}
                  onChange={(e) => setShiftStartingCash(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none"
                  placeholder="200,000"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white rounded-xl shadow-lg shadow-emerald-500/10 transition"
            >
              Buka Shift Sekarang
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-100px)] overflow-hidden">
      {/* Mobile view switcher tabs */}
      <div className="lg:hidden flex border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0 p-0.5">
        <button
          onClick={() => setActiveMobileView('PRODUCTS')}
          className={`flex-1 py-2 text-xs font-bold text-center rounded-lg transition-all ${
            activeMobileView === 'PRODUCTS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Katalog Produk
        </button>
        <button
          onClick={() => setActiveMobileView('CART')}
          className={`flex-1 py-2 text-xs font-bold text-center rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeMobileView === 'CART'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>Keranjang Belanja</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold leading-none ${activeMobileView === 'CART' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: PRODUCT GRID (Col span 7) */}
        <div className={`${activeMobileView === 'PRODUCTS' ? 'flex' : 'hidden'} lg:flex lg:col-span-7 flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200/60 overflow-hidden`}>
        
        {/* Top filter + search section */}
        <div className="p-4 bg-white border-b border-slate-100 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari produk berdasarkan Nama, SKU, atau Barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Rekap Transaksi Button */}
            <button
              onClick={() => setShowRecentTransactionsModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs shrink-0"
              title="Lihat & Edit Rekap Transaksi Kasir Terakhir"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Rekap Transaksi</span>
            </button>
          </div>

          {/* Categories Tab list */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid list */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 auto-rows-max gap-3.5 content-start">
          {filteredProducts.map((p) => {
            const isLow = p.stock <= p.minStock;
            const hasErr = imageErrors[p.id];
            return (
              <div
                key={p.id}
                onClick={() => handleItemClick(p)}
                className="bg-white border border-slate-200/90 rounded-2xl p-3 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md cursor-pointer group transition select-none relative h-full overflow-hidden"
              >
                {/* Variant flag indicator */}
                {(p.variants.length > 0 || p.modifiers.length > 0) && (
                  <span className="absolute right-2 top-2 z-10 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                    Opsi
                  </span>
                )}

                <div className="space-y-2">
                  {/* Photo container with fixed aspect/height so it never collapses */}
                  <div className="h-28 sm:h-36 w-full rounded-xl bg-slate-100 overflow-hidden relative border border-slate-100 shrink-0">
                    {p.image && !hasErr ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        onError={() => handleImageError(p.id)}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/80 text-slate-400 p-2 text-center">
                        <Package className="h-7 w-7 text-slate-400 mb-1 shrink-0" />
                        <span className="font-bold text-[9px] text-slate-500 uppercase tracking-wider line-clamp-1">
                          {p.category}
                        </span>
                      </div>
                    )}

                    {/* Stock status overlay */}
                    {p.stock === 0 ? (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[1px] flex items-center justify-center p-1 text-center">
                        <span className="text-rose-400 text-[10px] font-black tracking-widest uppercase bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          STOK HABIS
                        </span>
                      </div>
                    ) : isLow ? (
                      <div className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                        Stok Sisa {p.stock}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-tight truncate">
                        {p.sku || 'SKU-00'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 truncate">
                        {p.category}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors min-h-[2.1rem]">
                      {p.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-black text-indigo-700 font-mono">
                    Rp {p.sellingPrice.toLocaleString('id-ID')}
                  </span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    p.stock === 0 
                      ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                      : isLow 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    Stok: {p.stock}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400 text-center">
              <HelpCircle className="h-10 w-10 mb-2 stroke-1" />
              <p className="text-sm font-bold">Produk tidak ditemukan</p>
              <p className="text-xs">Silakan coba kata kunci lain atau pilih kategori lain.</p>
            </div>
          )}
        </div>
      </div>

        {/* RIGHT COLUMN: SHOPPING CART (Col span 5) */}
        <div className={`${activeMobileView === 'CART' ? 'flex' : 'hidden'} lg:flex lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden`}>
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span>Keranjang Belanja</span>
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </h3>
            <p className="text-[10px] text-slate-500">Invoice: {currentUser.name} (Kasir)</p>
          </div>

          <div className="flex gap-1.5">
            {/* Pending/Hold Orders list trigger */}
            {holdOrders.length > 0 && (
              <button
                onClick={() => setShowHoldModal(true)}
                className="p-1.5 text-xs text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 font-bold flex items-center gap-1"
                title="Tahan Bill Antrian"
              >
                <History className="h-3.5 w-3.5" />
                <span>{holdOrders.length} Bill</span>
              </button>
            )}

            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Kosongkan Keranjang"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Customer Selector Block */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/20">
          <button
            onClick={() => {
              setCustomerSearchQuery('');
              setShowCustomerModal(true);
            }}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-medium">Asosiasi Pelanggan</p>
                <p className="text-xs font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[200px]">
                  {selectedCustomer ? selectedCustomer.name : 'Pelanggan Guest (Umum)'}
                </p>
              </div>
            </div>
            {selectedCustomer ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                  {selectedCustomer.tier}
                </span>
                <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono font-bold">
                  {selectedCustomer.membershipPoints} Pts
                </span>
              </div>
            ) : (
              <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                UMUM (GUEST)
              </span>
            )}
          </button>
        </div>

        {/* Cart Item list */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-thin">
          {cart.map((item) => {
            const basePrice = item.product.sellingPrice;
            const variantAdd = item.selectedVariant ? item.selectedVariant.priceDifference : 0;
            const modifierAdd = item.selectedModifiers.reduce((acc, m) => acc + m.price, 0);
            const price = basePrice + variantAdd + modifierAdd;
            
            return (
              <div key={item.id} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {item.product.name}
                    </h4>
                    
                    {/* Selected Options summary labels */}
                    {item.selectedVariant && (
                      <span className="inline-block bg-slate-200 text-slate-700 text-[8px] font-bold px-1.5 py-0.2 rounded mr-1">
                        Size: {item.selectedVariant.name}
                      </span>
                    )}

                    {item.selectedModifiers.map((m) => (
                      <span key={m.id} className="inline-block bg-emerald-50 text-emerald-600 text-[8px] font-bold px-1.5 py-0.2 rounded border border-emerald-100 mr-1">
                        +{m.name}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-extrabold text-slate-800 font-mono">
                    Rp {(price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Sub-inputs notes and quantity control */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Catatan porsi (e.g. less ice)..."
                    value={item.notes || ''}
                    onChange={(e) => updateCartItemNotes(item.id, e.target.value)}
                    className="flex-1 bg-transparent border-none text-[10px] font-medium text-slate-400 focus:outline-none placeholder-slate-300 pr-2"
                  />

                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-slate-500 hover:text-slate-800"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold font-mono text-slate-800 min-w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-slate-500 hover:text-slate-800"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-16">
              <Notebook className="h-10 w-10 mb-2 stroke-1" />
              <p className="text-xs font-bold">Keranjang kosong</p>
              <p className="text-[10px] text-slate-500">Pilih menu produk di sebelah kiri.</p>
            </div>
          )}
        </div>

        {/* Pricing Summary Block & Voucher discount */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
          
          {/* Promo code input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Kode Promo (e.g. HARIPRAMUKA81)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase placeholder-slate-400 focus:outline-none"
              />
              {appliedPromo && (
                <button
                  onClick={() => setAppliedPromo(null)}
                  className="absolute right-2.5 top-2 text-rose-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={handleApplyPromo}
              className="px-3 bg-slate-800 text-white hover:bg-slate-950 font-bold text-xs rounded-xl transition"
            >
              Pakai
            </button>
          </div>

          {/* Manual Shipping Fee Input */}
          <div className="flex items-center justify-between gap-4 p-2 bg-white border border-slate-200/80 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Truck className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Ongkos Kirim</span>
            </div>
            <div className="relative w-32">
              <span className="absolute left-2.5 top-1 text-[10px] font-bold text-slate-400">Rp</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={shippingFee || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setShippingFee(val >= 0 ? val : 0);
                }}
                className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pricing calculations details list */}
          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono">Rp {totals.subtotal.toLocaleString('id-ID')}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-rose-500 font-medium">
                <span>Diskon Promo {appliedPromo ? `(${appliedPromo.code})` : ''}</span>
                <span className="font-mono">-Rp {totals.discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            {shippingFee > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Ongkos Kirim (Manual)</span>
                <span className="font-mono">Rp {shippingFee.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-dashed border-slate-200">
              <span>Total Tagihan</span>
              <span className="font-mono text-emerald-600 text-base">Rp {totals.total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Checkout action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                if (cart.length === 0) return;
                setHoldName(selectedCustomer ? selectedCustomer.name : 'Pelanggan Guest');
                holdCurrentCart(selectedCustomer ? selectedCustomer.name : `Antrian ${Date.now().toString().slice(-4)}`);
              }}
              disabled={cart.length === 0}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 font-bold text-xs rounded-xl border border-slate-200 transition"
            >
              Tahan Bill / Antri
            </button>
            <button
              onClick={() => {
                if (cart.length === 0) return;
                setCashReceived('');
                setShowCheckoutModal(true);
              }}
              disabled={cart.length === 0}
              className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-40 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition"
            >
              Bayar Transaksi
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* MODAL 1: VARIANT & OPTIONS SELECTOR */}
      {selectedProductForOptions && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedProductForOptions(null)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-bold text-sm text-slate-900 pr-6 leading-snug">
              {selectedProductForOptions.name}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">SKU: {selectedProductForOptions.sku}</p>

            {/* Select size/variant option */}
            {selectedProductForOptions.variants.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pilih Ukuran / Varian:</span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProductForOptions.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setChosenVariant(v)}
                      className={`p-2 rounded-xl text-xs font-semibold border text-left transition ${
                        chosenVariant?.id === v.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{v.name}</span>
                        {v.priceDifference !== 0 && (
                          <span className="text-[9px] font-mono font-bold opacity-80">
                            +{v.priceDifference > 0 ? '' : ''}{v.priceDifference.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Select additions/modifiers */}
            {selectedProductForOptions.modifiers.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tambahan (Add-ons):</span>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                  {selectedProductForOptions.modifiers.map((mod) => {
                    const isSelected = chosenModifiers.some((m) => m.id === mod.id);
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => toggleModifier(mod)}
                        className={`w-full p-2 rounded-xl text-xs font-semibold border flex justify-between items-center transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className={`h-3.5 w-3.5 rounded border flex items-center justify-center text-[8px] font-bold ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                            {isSelected && '✓'}
                          </span>
                          <span>{mod.name}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-600 text-[10px]">
                          +Rp {mod.price.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add button inside option dialog */}
            <button
              onClick={() => {
                addToCart(selectedProductForOptions, chosenVariant, chosenModifiers);
                setSelectedProductForOptions(null);
              }}
              className="w-full mt-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition"
            >
              Tambahkan ke Keranjang (Rp {((selectedProductForOptions.sellingPrice + (chosenVariant?.priceDifference || 0) + chosenModifiers.reduce((s,m)=>s+m.price, 0))).toLocaleString('id-ID')})
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAILED CHECKOUT COMPONENT */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl relative animate-in fade-in duration-200 grid grid-cols-1 md:grid-cols-12 gap-5">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Payment gateway select column (Col span 5) */}
            <div className="md:col-span-5 space-y-4 border-r border-slate-100 pr-1 text-left">
              <h3 className="font-bold text-slate-900 text-sm">Metode Pembayaran</h3>
              
              <div className="space-y-2">
                {[
                  { id: 'CASH', label: 'Uang Tunai (Cash)', icon: Coins },
                  { id: 'QRIS', label: 'Dynamic QRIS', icon: QrCode },
                  { id: 'CARD', label: 'Debit / Kredit Card', icon: CreditCard },
                  { id: 'E-WALLET', label: 'E-Wallet Hub', icon: Smartphone },
                  { id: 'TRANSFER', label: 'Bank Transfer', icon: Wallet }
                ].map((p) => {
                  const PayIcon = p.icon;
                  const isCh = selectedPaymentMethod === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPaymentMethod(p.id as any);
                        setCashDifferenceError(false);
                      }}
                      className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition ${
                        isCh
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <PayIcon className={`h-4.5 w-4.5 ${isCh ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed price / input and change column (Col span 7) */}
            <div className="md:col-span-7 flex flex-col justify-between text-left">
              <div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Konfirmasi Pembayaran
                </span>
                <h3 className="text-xl font-extrabold text-slate-950 mt-1">
                  Rp {totals.total.toLocaleString('id-ID')}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {totals.shippingFee > 0 ? `Termasuk Ongkos Kirim Rp ${totals.shippingFee.toLocaleString('id-ID')}` : 'Harga final transaksi di kasir'}
                </p>
              </div>

              {/* Conditional rendering based on Payment Method */}
              <div className="my-4 flex-1">
                {selectedPaymentMethod === 'CASH' ? (
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Uang Tunai Diterima (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        required
                        autoFocus
                        value={cashReceived}
                        onChange={(e) => {
                          setCashReceived(e.target.value);
                          setCashDifferenceError(false);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                        placeholder="Masukkan nominal tunai..."
                      />
                    </div>

                    {/* Cash short-cut suggestions */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[totals.total, 20000, 50000, 100000].map((v) => {
                        const val = Math.ceil(v / 1000) * 1000;
                        return (
                          <button
                            key={v}
                            onClick={() => {
                              setCashReceived(val.toString());
                              setCashDifferenceError(false);
                            }}
                            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono font-bold text-[10px] rounded"
                          >
                            {(val / 1000).toFixed(0)}k
                          </button>
                        );
                      })}
                    </div>

                    {/* Change calculator display */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500">UANG KEMBALIAN:</span>
                        <span className="font-mono text-xs font-extrabold text-slate-800">
                          Rp {cashChange.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {cashDifferenceError && (
                      <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Uang yang dimasukkan kurang dari total tagihan!
                      </p>
                    )}
                  </div>
                ) : selectedPaymentMethod === 'QRIS' ? (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400">Pindai kode QRIS dinamis di bawah ini:</span>
                    
                    {/* Simulated QRIS code box */}
                    <div className="p-2 border border-slate-200 rounded-2xl bg-white shadow-inner">
                      <div className="w-36 h-36 bg-slate-100 flex items-center justify-center font-bold text-xs border border-dashed border-slate-300 relative">
                        {/* Real dynamic qr generator mock look */}
                        <div className="absolute inset-0 bg-[radial-gradient(#2e3d4d_20%,transparent_20%)] bg-[size:8px_8px] opacity-40" />
                        <div className="h-8 w-8 bg-emerald-500 text-white font-bold rounded flex items-center justify-center text-[10px] shadow z-10">
                          QRIS
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-emerald-600 font-semibold animate-pulse">
                      • Menunggu respons callback webhook transfer...
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-center h-28 text-center text-slate-500">
                    <p className="text-xs font-bold">Lakukan gesek/transfer pada mesin EDC atau terminal.</p>
                    <p className="text-[10px] mt-1">Mencatat referensi otomatis saat checkout disetujui.</p>
                  </div>
                )}
              </div>

              {/* Submit Checkout button */}
              <button
                onClick={handleCheckoutSubmit}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white rounded-xl shadow-lg shadow-emerald-500/10 transition mt-2"
              >
                Konfirmasi Selesai & Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CUSTOMER SELECTION DIALOG */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-left">
            <button
              onClick={() => setShowCustomerModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-bold text-slate-900 text-sm">Pilih Profil Pelanggan</h3>
            <p className="text-[10px] text-slate-400">Hubungkan order ini ke program member loyalty</p>

            {/* Customer Search Input */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, No. Telp, atau email..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
              {customerSearchQuery && (
                <button
                  onClick={() => setCustomerSearchQuery('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Selector list of customers */}
            <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setShowCustomerModal(false);
                }}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left flex justify-between items-center transition ${
                  selectedCustomer === null
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>Pelanggan Umum (Guest)</span>
                {selectedCustomer === null && <Check className="h-4 w-4 text-emerald-600" />}
              </button>

              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomer(c);
                    setShowCustomerModal(false);
                  }}
                  className={`w-full p-3 rounded-xl border text-xs text-left flex justify-between items-center transition ${
                    selectedCustomer?.id === c.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.phone} • {c.membershipPoints} Pts</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] bg-slate-100 font-bold px-1.5 py-0.2 rounded text-slate-500 uppercase">
                      {c.tier}
                    </span>
                    {selectedCustomer?.id === c.id && <Check className="h-4 w-4 text-emerald-600" />}
                  </div>
                </button>
              ))}

              {filteredCustomers.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Tidak ada pelanggan yang cocok.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: HELD BILLS LISTS */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-left">
            <button
              onClick={() => setShowHoldModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-bold text-slate-900 text-sm">Daftar Bill Ditahan / Antrean</h3>
            <p className="text-[10px] text-slate-400">Pilih bill untuk dipulihkan kembali ke kasir aktif</p>

            <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {holdOrders.map((h) => (
                <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{h.name}</h4>
                    {h.tableNo && <span className="text-[10px] text-slate-500 font-semibold block">Meja: {h.tableNo}</span>}
                    <span className="text-[9px] text-slate-400 block">{new Date(h.date).toLocaleTimeString()} • {h.cart.length} item</span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => deleteHeldCart(h.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded border border-slate-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        restoreHeldCart(h.id);
                        setShowHoldModal(false);
                      }}
                      className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-black transition"
                    >
                      Pulihkan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: REKAP TRANSAKSI TERAKHIR & EDIT DATA */}
      {showRecentTransactionsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Rekap Transaksi Kasir Terakhir</h3>
                  <p className="text-xs text-slate-500">Lihat histori, cetak ulang nota, edit data, & sinkron ke Spreadsheet</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handlePullFromSpreadsheet}
                  disabled={isSyncing}
                  title="Membaca & menyinkronkan data rekap transaksi dari Google Sheets"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition disabled:opacity-50"
                >
                  <CloudDownload className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
                  <span>Tarik Data Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={handlePushToSpreadsheet}
                  disabled={isSyncing}
                  title="Menyimpan ulang seluruh rekap transaksi ke Google Sheets"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition disabled:opacity-50"
                >
                  <CloudUpload className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>Upload ke Sheet</span>
                </button>

                <button
                  onClick={() => setShowRecentTransactionsModal(false)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter Controls & Stats Summary */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              {/* Sync status alert if present */}
              {syncStatusMsg && (
                <div
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200 ${
                    syncStatusMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {syncStatusMsg.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    )}
                    <span>{syncStatusMsg.text}</span>
                  </div>
                  <button onClick={() => setSyncStatusMsg(null)} className="text-slate-400 hover:text-slate-600 p-0.5">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Transaksi</span>
                  <span className="text-lg font-black text-slate-900">{filteredRecentOrders.length} Nota</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Omset Rekap</span>
                  <span className="text-lg font-black text-indigo-700">
                    Rp {filteredRecentOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pembayaran Tunai</span>
                  <span className="text-lg font-black text-emerald-600">
                    Rp {filteredRecentOrders.filter(o => o.paymentMethod === 'CASH').reduce((sum, o) => sum + o.total, 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Non-Tunai (QRIS/Bank)</span>
                  <span className="text-lg font-black text-sky-600">
                    Rp {filteredRecentOrders.filter(o => o.paymentMethod !== 'CASH').reduce((sum, o) => sum + o.total, 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Search & Tabs */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari No. Invoice / Pelanggan / Kasir..."
                    value={recentSearchQuery}
                    onChange={(e) => setRecentSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                  {recentSearchQuery && (
                    <button onClick={() => setRecentSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {(['ALL', 'PAID', 'UNPAID', 'REFUNDED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setRecentFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        recentFilterStatus === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'ALL' ? 'Semua Status' : st === 'PAID' ? 'Lunas (Paid)' : st === 'UNPAID' ? 'Belum Lunas' : 'Refunded'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List of Orders */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredRecentOrders.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Receipt className="h-12 w-12 mx-auto stroke-1 text-slate-300" />
                  <p className="font-bold text-sm">Tidak ada transaksi yang ditemukan.</p>
                </div>
              ) : (
                filteredRecentOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-slate-300 transition space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 font-mono">#{order.orderNo}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            order.paymentStatus === 'PAID' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : order.paymentStatus === 'REFUNDED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {order.paymentStatus}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {new Date(order.date).toLocaleString('id-ID')} • Kasir: <span className="font-bold text-slate-700">{order.cashierName}</span> • Pelanggan: <span className="font-bold text-slate-700">{order.customerName || 'Guest'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleStartEditOrder(order)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl flex items-center gap-1 transition"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit Data</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowRecentTransactionsModal(false);
                            onCheckoutSuccess(order);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-1 transition"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Cetak Struk</span>
                        </button>
                        {order.paymentStatus === 'PAID' && (
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin merefund transaksi #${order.orderNo}? Stok akan dikembalikan otomatis.`)) {
                                refundOrder(order.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                            title="Refund Transaksi"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Items Detail */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Daftar Produk:</span>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between font-semibold text-slate-700">
                            <span>{item.quantity}x {item.productName} {item.variantName ? `(${item.variantName})` : ''}</span>
                            <span className="font-mono">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 self-start border border-slate-100">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-mono font-bold">Rp {order.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-rose-600">
                            <span>Diskon:</span>
                            <span className="font-mono font-bold">-Rp {order.discount.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {(order.shippingFee || 0) > 0 && (
                          <div className="flex justify-between text-indigo-700">
                            <span>Ongkir:</span>
                            <span className="font-mono font-bold">+Rp {order.shippingFee?.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-950 font-black pt-1 border-t border-slate-200 text-sm">
                          <span>Grand Total:</span>
                          <span className="text-indigo-700">Rp {order.total.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL: EDIT TRANSACTION FORM */}
      {editingOrder && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 text-left">
            <button
              onClick={() => setEditingOrder(null)}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Edit Data Transaksi</h3>
                <p className="text-xs text-slate-500">Ubah rincian nota #{editingOrder.orderNo}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-4">
              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                    Nama Pelanggan
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormCustomerName}
                    onChange={(e) => setEditFormCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editFormCustomerPhone}
                    onChange={(e) => setEditFormCustomerPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Payment Method & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={editFormPaymentMethod}
                    onChange={(e) => setEditFormPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500"
                  >
                    <option value="CASH">CASH (Tunai)</option>
                    <option value="QRIS">QRIS</option>
                    <option value="TRANSFER">TRANSFER BANK</option>
                    <option value="CARD">KARTU DEBIT / KREDIT</option>
                    <option value="E-WALLET">E-WALLET</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                    Status Pembayaran
                  </label>
                  <select
                    value={editFormPaymentStatus}
                    onChange={(e) => setEditFormPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500"
                  >
                    <option value="PAID">PAID (Lunas)</option>
                    <option value="UNPAID">UNPAID (Belum Lunas)</option>
                    <option value="PARTIAL">PARTIAL (Bayar Sebagian)</option>
                    <option value="REFUNDED">REFUNDED (Dikembalikan)</option>
                  </select>
                </div>
              </div>

              {/* Items List Modification */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                  Edit Item Produk Transaksi
                </label>

                {editFormItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-slate-800">{item.productName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        @ Rp {item.price.toLocaleString('id-ID')} = Rp {item.subtotal.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateEditItemQty(idx, -1)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-bold font-mono px-1.5">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateEditItemQty(idx, 1)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateEditItemQty(idx, -item.quantity)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Inputs */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Potongan Diskon (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormDiscount}
                    onChange={(e) => setEditFormDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Ongkos Kirim / Ongkir (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormShippingFee}
                    onChange={(e) => setEditFormShippingFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-500/15"
                >
                  Simpan Perubahan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
