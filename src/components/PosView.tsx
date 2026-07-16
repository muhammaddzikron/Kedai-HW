/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductVariant, ProductModifier, Customer, Promotion } from '../types';
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
  HelpCircle
} from 'lucide-react';

export default function PosView({ onCheckoutSuccess }: { onCheckoutSuccess: (order: any) => void }) {
  const {
    products,
    customers,
    promotions,
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
    currentBranch
  } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [customCartDiscount, setCustomCartDiscount] = useState(0); // overall percentage
  const [tableNo, setTableNo] = useState('');
  
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

    const taxValue = Math.round((subtotal - discountValue) * 0.1); // 10% tax
    const serviceValue = Math.round((subtotal - discountValue) * 0.05); // 5% service charge
    const finalTotal = subtotal - discountValue + taxValue + serviceValue;

    return {
      subtotal,
      discount: discountValue,
      tax: taxValue,
      service: serviceValue,
      total: finalTotal
    };
  }, [cart, appliedPromo, customCartDiscount]);

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
      tableNo: tableNo || undefined
    });

    // Reset local checkout selections
    setShowCheckoutModal(false);
    setSelectedCustomer(null);
    setAppliedPromo(null);
    setPromoCode('');
    setTableNo('');
    setCashReceived('');
    setCustomCartDiscount(0);

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
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
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
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {filteredProducts.map((p) => {
            const isLow = p.stock <= p.minStock;
            return (
              <div
                key={p.id}
                onClick={() => handleItemClick(p)}
                className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col justify-between hover:shadow-md cursor-pointer group transition select-none relative overflow-hidden"
              >
                {/* Variant flag indicator */}
                {(p.variants.length > 0 || p.modifiers.length > 0) && (
                  <span className="absolute right-2 top-2 bg-emerald-50 text-emerald-600 text-[8px] font-bold px-1.5 py-0.2 rounded border border-emerald-100 uppercase">
                    Opsi
                  </span>
                )}

                <div className="space-y-2">
                  {/* Photo container */}
                  <div className="aspect-square w-full rounded-xl bg-slate-100 overflow-hidden relative border border-slate-100">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xl uppercase">
                        {p.name.slice(0, 2)}
                      </div>
                    )}

                    {/* Stock status overlay */}
                    {p.stock === 0 ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold tracking-widest uppercase">
                          HABIS
                        </span>
                      </div>
                    ) : isLow ? (
                      <div className="absolute bottom-1.5 left-1.5 bg-amber-500/90 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded">
                        STOK TIPIS
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono leading-none">
                      {p.sku}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-emerald-600">
                      {p.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-extrabold text-slate-900 font-mono">
                    Rp {p.sellingPrice.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">
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

        {/* Table/Table number Selector & Member customer Selector */}
        <div className="p-3 border-b border-slate-100 flex gap-2">
          {/* Customer association */}
          <button
            onClick={() => setShowCustomerModal(true)}
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-between transition"
          >
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">{selectedCustomer ? selectedCustomer.name : 'Pelanggan: Guest'}</span>
            </span>
            {selectedCustomer ? (
              <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                {selectedCustomer.tier}
              </span>
            ) : (
              <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.2 rounded font-bold">
                UMUM
              </span>
            )}
          </button>

          {/* Table number input */}
          <input
            type="text"
            placeholder="No. Meja"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
            className="w-18 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
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

          {/* Pricing calculations details list */}
          <div className="space-y-1.5 text-xs">
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
            <div className="flex justify-between text-slate-500">
              <span>Pajak (PB1 10%)</span>
              <span className="font-mono">Rp {totals.tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Service Charge (5%)</span>
              <span className="font-mono">Rp {totals.service.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1.5 border-t border-dashed border-slate-200">
              <span>Total Tagihan</span>
              <span className="font-mono text-emerald-600">Rp {totals.total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Checkout action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                if (cart.length === 0) return;
                setHoldName(selectedCustomer ? selectedCustomer.name : `Meja ${tableNo || 'Guest'}`);
                holdCurrentCart(selectedCustomer ? selectedCustomer.name : `Antrian ${Date.now().toString().slice(-4)}`, tableNo || undefined);
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
                <p className="text-[10px] text-slate-400 mt-0.5">Sudah termasuk PPN 10% dan Service 5%</p>
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

            {/* Selector list of customers */}
            <div className="mt-4 space-y-2 max-h-[250px] overflow-y-auto pr-1">
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

              {customers.map((c) => (
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

    </div>
  );
}
