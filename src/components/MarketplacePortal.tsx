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
  ChevronRight,
  Lock,
  LogIn,
  Compass,
  Copy,
  Building2,
  CreditCard,
  Send
} from 'lucide-react';

export const BANK_ACCOUNTS = [
  {
    bankName: 'Bank Mandiri',
    accountNumber: '1380006964113',
    accountHolder: 'Kedai Kepanduan',
    badgeBg: 'bg-blue-600 text-amber-300',
    border: 'border-blue-200',
    iconText: 'MANDIRI'
  },
  {
    bankName: 'Bank BRI',
    accountNumber: '003501040803502',
    accountHolder: 'Kedai Kepanduan',
    badgeBg: 'bg-blue-700 text-white',
    border: 'border-blue-200',
    iconText: 'BRI'
  },
  {
    bankName: 'Bank BCA',
    accountNumber: '0300616488',
    accountHolder: 'Kedai Kepanduan',
    badgeBg: 'bg-indigo-900 text-cyan-300',
    border: 'border-indigo-200',
    iconText: 'BCA'
  },
  {
    bankName: 'Bank BNI',
    accountNumber: '0407113037',
    accountHolder: 'Kedai Kepanduan',
    badgeBg: 'bg-teal-700 text-orange-300',
    border: 'border-teal-200',
    iconText: 'BNI'
  },
  {
    bankName: 'Bank BSI',
    accountNumber: '7123596492',
    accountHolder: 'Kedai Kepanduan',
    badgeBg: 'bg-emerald-700 text-amber-300',
    border: 'border-emerald-200',
    iconText: 'BSI'
  },
  {
    bankName: 'Bank Danamon',
    accountNumber: '903707804252',
    accountHolder: 'Kedai Kepanduan',
    badgeBg: 'bg-orange-600 text-white',
    border: 'border-orange-200',
    iconText: 'DANAMON'
  },
  {
    bankName: 'OVO / Dana / LinkAja',
    accountNumber: '081226854000',
    accountHolder: 'Kedai Kepanduan',
    badgeBg: 'bg-purple-700 text-cyan-200',
    border: 'border-purple-200',
    iconText: 'E-WALLET'
  }
];

interface MarketplacePortalProps {
  onAdminLogin?: () => void;
  showAuthModalExternal?: boolean;
  setShowAuthModalExternal?: (val: boolean) => void;
}

export default function MarketplacePortal({
  onAdminLogin,
  showAuthModalExternal,
  setShowAuthModalExternal
}: MarketplacePortalProps) {
  const {
    products,
    onlineOrders,
    addOnlineOrder,
    updateOnlineOrderStatus,
    orders,
    currentBranch,
    isLocked,
    customers,
    addCustomer,
    editCustomer,
    loggedCustomer,
    setLoggedCustomer,
    currentUser,
    staff
  } = useApp();

  // Mode state: 'CUSTOMER' (storefront) or 'STAFF' (approvals queue)
  const [activePortalMode, setActivePortalMode] = useState<'CUSTOMER' | 'STAFF'>('CUSTOMER');
  const effectivePortalMode = isLocked ? 'CUSTOMER' : activePortalMode;

  // Local state to track customer placed orders (even if guest)
  const [placedOrderIds, setPlacedOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kdp_placed_order_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // CUSTOMER STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [customerCart, setCustomerCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('GrabExpress Instant');
  const [selectedPayment, setSelectedPayment] = useState<'MIDTRANS' | 'WHATSAPP_COD'>('WHATSAPP_COD');

  // Track active customer orders for the rekap pesanan sidebar
  const currentCustomerOrders = useMemo(() => {
    return onlineOrders.filter((o) => {
      const isLoggedMatch = loggedCustomer && (
        o.customerPhone === loggedCustomer.phone || 
        o.customerName === loggedCustomer.name ||
        (loggedCustomer.phone && o.customerPhone && o.customerPhone.replace(/\D/g, '') === loggedCustomer.phone.replace(/\D/g, ''))
      );
      const isLocalPlacedMatch = placedOrderIds.includes(o.id) || placedOrderIds.includes(o.orderNo);
      const isTypedMatch = !loggedCustomer && customerPhone && (
        o.customerPhone === customerPhone || 
        o.customerPhone.replace(/\D/g, '') === customerPhone.replace(/\D/g, '')
      );
      return isLoggedMatch || isLocalPlacedMatch || isTypedMatch;
    });
  }, [onlineOrders, loggedCustomer, placedOrderIds, customerPhone]);
  
  // Modals / Success states
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OnlineOrder | null>(null);

  // Customer Authentication States
  const [showAuthModalInternal, setShowAuthModalInternal] = useState(false);
  const showAuthModal = showAuthModalExternal !== undefined ? showAuthModalExternal : showAuthModalInternal;
  const setShowAuthModal = setShowAuthModalExternal !== undefined ? setShowAuthModalExternal : setShowAuthModalInternal;
  const [authTab, setAuthTab] = useState<'CHOOSE' | 'LOGIN' | 'REGISTER'>('CHOOSE');
  const [authPhoneInput, setAuthPhoneInput] = useState('');
  const [authNameInput, setAuthNameInput] = useState('');
  const [authEmailInput, setAuthEmailInput] = useState('');
  const [authPasswordInput, setAuthPasswordInput] = useState('');
  const [authAddressInput, setAuthAddressInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Prefill when loggedCustomer changes
  React.useEffect(() => {
    if (loggedCustomer) {
      setCustomerName(loggedCustomer.name);
      setCustomerPhone(loggedCustomer.phone);
      if (loggedCustomer.address) {
        setDeliveryAddress(loggedCustomer.address);
      }
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
    }
  }, [loggedCustomer]);

  // Edit Profile States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileError, setProfileError] = useState('');

  // Shipping fee & Payment confirmation states
  const [shippingFeeInput, setShippingFeeInput] = useState<number>(0);
  const [copiedBankNo, setCopiedBankNo] = useState<string | null>(null);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState<OnlineOrder | null>(null);
  const [paymentProofInput, setPaymentProofInput] = useState('');

  const handleOpenEditProfile = () => {
    if (loggedCustomer) {
      setProfileName(loggedCustomer.name);
      setProfilePhone(loggedCustomer.phone);
      setProfileAddress(loggedCustomer.address || '');
      setProfileError('');
      setShowEditProfileModal(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileError('Nama tidak boleh kosong.');
      return;
    }
    if (!profilePhone.trim()) {
      setProfileError('Nomor HP tidak boleh kosong.');
      return;
    }
    
    if (loggedCustomer) {
      editCustomer(loggedCustomer.id, {
        name: profileName.trim(),
        phone: profilePhone.trim(),
        address: profileAddress.trim(),
      });
      setShowEditProfileModal(false);
      alert('Profil Anda berhasil diperbarui!');
    }
  };

  // Reset auth fields when modal state or tab changes
  React.useEffect(() => {
    setAuthPhoneInput('');
    setAuthNameInput('');
    setAuthEmailInput('');
    setAuthPasswordInput('');
    setAuthAddressInput('');
    setAuthError('');
  }, [showAuthModal, authTab]);

  // STAFF STATE
  const [staffFilterStatus, setStaffFilterStatus] = useState<OnlineOrder['status'] | 'ALL'>('ALL');
  const [selectedStaffOrder, setSelectedStaffOrder] = useState<OnlineOrder | null>(null);

  // Sync shippingFeeInput whenever selectedStaffOrder changes
  React.useEffect(() => {
    if (selectedStaffOrder) {
      setShippingFeeInput(selectedStaffOrder.shippingFee || 0);
    }
  }, [selectedStaffOrder?.id]);

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

  const setCustomerCartQty = (productId: string, qty: number) => {
    setCustomerCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: qty }
          : item
      )
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

    setPlacedOrderIds((prev) => {
      const updated = [...prev, generatedOrderNo];
      localStorage.setItem('kdp_placed_order_ids', JSON.stringify(updated));
      return updated;
    });

    setSubmittedOrder(confirmedOrder);
    clearCustomerCart();
    setShowCartDrawer(false);
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = authEmailInput.trim().toLowerCase();
    const password = authPasswordInput;

    if (!identifier) {
      setAuthError('Silakan masukkan Email atau Nomor Handphone Anda.');
      return;
    }
    if (!password) {
      setAuthError('Silakan masukkan Password Anda.');
      return;
    }

    const found = customers.find(c => 
      (c.email && c.email.toLowerCase() === identifier) || 
      (c.phone && c.phone.trim() === identifier)
    );

    if (found) {
      if (found.password && found.password !== password) {
        setAuthError('Password salah. Silakan coba lagi.');
        return;
      }
      if (!found.password) {
        editCustomer(found.id, { password });
        found.password = password;
      }

      setLoggedCustomer(found);
      setShowAuthModal(false);
      setAuthEmailInput('');
      setAuthPhoneInput('');
      setAuthPasswordInput('');
      setAuthError('');
    } else {
      setAuthError('Email atau Nomor Handphone tidak terdaftar. Silakan daftar member baru!');
    }
  };

  const handleCustomerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authNameInput.trim() || !authPhoneInput.trim() || !authEmailInput.trim() || !authPasswordInput) {
      setAuthError('Nama Lengkap, No. HP, Email, dan Password wajib diisi.');
      return;
    }
    const emailLower = authEmailInput.trim().toLowerCase();
    const phoneTrim = authPhoneInput.trim();

    const existsPhone = customers.some(c => c.phone.trim() === phoneTrim);
    if (existsPhone) {
      setAuthError('Nomor handphone sudah terdaftar. Silakan masuk menggunakan nomor ini.');
      return;
    }

    const existsEmail = customers.some(c => c.email.toLowerCase() === emailLower);
    if (existsEmail) {
      setAuthError('Alamat email sudah terdaftar. Silakan masuk menggunakan email ini.');
      return;
    }

    const newCust = {
      name: authNameInput.trim(),
      phone: phoneTrim,
      email: emailLower,
      password: authPasswordInput,
      group: 'MEMBER' as const,
      membershipPoints: 0,
      tier: 'SILVER' as const,
      cashbackBalance: 0,
      address: authAddressInput.trim() || undefined,
    };
    addCustomer(newCust);
    
    const createdCust = {
      ...newCust,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setLoggedCustomer(createdCust);
    setShowAuthModal(false);
    
    setAuthNameInput('');
    setAuthPhoneInput('');
    setAuthEmailInput('');
    setAuthPasswordInput('');
    setAuthAddressInput('');
    setAuthError('');
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
            {/* Customer Auth and Loyalty Status Bar */}
            {loggedCustomer && (
              <div className="px-6 py-4 border-b border-slate-150 bg-slate-50/50">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 rounded-xl border border-emerald-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center shadow-sm">
                      {loggedCustomer.name[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{loggedCustomer.name}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-black rounded-full uppercase tracking-wider">
                          MEMBER {loggedCustomer.tier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-semibold text-slate-600">No. HP: {loggedCustomer.phone}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-indigo-600 flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5 text-indigo-500" /> {loggedCustomer.membershipPoints || 0} Poin Reward
                        </span>
                        {loggedCustomer.cashbackBalance > 0 && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-emerald-600">Saldo Cashback: Rp {loggedCustomer.cashbackBalance.toLocaleString('id-ID')}</span>
                          </>
                        )}
                      </p>
                      {loggedCustomer.address && (
                        <p className="text-[11px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Alamat: {loggedCustomer.address}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={handleOpenEditProfile}
                      className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition duration-150 shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Edit Profil</span>
                    </button>
                    <button
                      onClick={() => setLoggedCustomer(null)}
                      className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 text-xs font-bold rounded-xl transition duration-150 shadow-sm"
                    >
                      Keluar Akun (Logout)
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                              <input
                                type="number"
                                min="1"
                                max={prod.stock}
                                value={cartItem.quantity || ''}
                                onChange={(e) => {
                                  const valStr = e.target.value;
                                  if (valStr === '') {
                                    setCustomerCartQty(prod.id, 0);
                                  } else {
                                    const val = parseInt(valStr, 10);
                                    if (!isNaN(val)) {
                                      const clamped = Math.max(1, Math.min(prod.stock, val));
                                      setCustomerCartQty(prod.id, clamped);
                                    }
                                  }
                                }}
                                onBlur={() => {
                                  if (cartItem.quantity < 1) {
                                    setCustomerCartQty(prod.id, 1);
                                  }
                                }}
                                className="text-xs font-bold text-slate-800 w-10 text-center bg-slate-50 border border-slate-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
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

                  {/* Basket Items List - displays 7 products before scroll */}
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {customerCart.map((item) => (
                      <div key={item.product.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <div className="truncate max-w-[140px]">
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
                          <input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity || ''}
                            onChange={(e) => {
                              const valStr = e.target.value;
                              if (valStr === '') {
                                setCustomerCartQty(item.product.id, 0);
                              } else {
                                const val = parseInt(valStr, 10);
                                if (!isNaN(val)) {
                                  const clamped = Math.max(1, Math.min(item.product.stock, val));
                                  setCustomerCartQty(item.product.id, clamped);
                                }
                              }
                            }}
                            onBlur={() => {
                              if (item.quantity < 1) {
                                setCustomerCartQty(item.product.id, 1);
                              }
                            }}
                            className="text-xs font-bold text-slate-800 w-10 text-center bg-slate-50 border border-slate-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
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
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Informasi Pengiriman</span>
                      {loggedCustomer && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-md uppercase border border-emerald-100 flex items-center gap-1">
                          <Check className="h-2.5 w-2.5 text-emerald-600" /> Member Terhubung
                        </span>
                      )}
                    </div>
                    
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

                    <div className="pt-3 border-t border-slate-150 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-600">Total Belanja:</span>
                        <span className="font-extrabold text-base text-slate-900">Rp {cartTotal.toLocaleString('id-ID')}</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition"
                      >
                        Kirim Pesanan Saya
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : currentCustomerOrders.length > 0 ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="pb-3 border-b border-slate-200 mb-3 flex justify-between items-center">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    <span>Rekap & Status Pesanan</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    {currentCustomerOrders.length} Pesanan
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-4">
                  {currentCustomerOrders.map((order) => (
                    <div key={order.id} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none">Nomor Pesanan</span>
                          <span className="text-xs font-black text-slate-900 leading-tight">{order.orderNo}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusBadgeClass(order.status)}`}>
                          {getStatusTranslation(order.status)}
                        </span>
                      </div>

                      {/* Items preview */}
                      <div className="text-[11px] space-y-1">
                        {order.items.map((it, i) => (
                          <div key={i} className="flex justify-between text-slate-600">
                            <span className="truncate max-w-[150px] font-semibold">{it.productName} <span className="text-slate-400 text-[10px] font-bold">x{it.quantity}</span></span>
                            <span className="font-bold text-slate-800">Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status info details */}
                      {order.status === 'PENDING' ? (
                        <div className="bg-amber-50/75 border border-amber-200/70 p-2.5 rounded-lg text-[10px] space-y-1 text-amber-900">
                          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px]">
                            <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                            <span>Menunggu Persetujuan CS</span>
                          </div>
                          <p className="font-semibold text-slate-600 leading-relaxed text-[10px]">
                            Biaya belum termasuk ongkir. Total transfer dan rekening pembayaran akan dikirim setelah disetujui oleh Customer Service.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-indigo-50/80 border border-indigo-200 p-3 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-extrabold text-indigo-900 uppercase tracking-wider text-[10px]">
                              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                              <span>Pesanan Disetujui!</span>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Siap Ditransfer
                            </span>
                          </div>
                          
                          {/* Display CS who processed the order */}
                          {order.processedBy && (
                            <div className="text-[10px] text-slate-600 bg-white/80 border border-indigo-100 p-2 rounded-lg space-y-0.5">
                              <div className="text-[8px] font-black text-indigo-500 uppercase tracking-wider">Petugas CS Penanggung Jawab</div>
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-slate-900">{order.processedBy} ({order.processedByRole || 'CS'})</span>
                                <a
                                  href={`https://wa.me/${(order.processedByPhone || '6281226854000').replace(/^0/, '62')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-extrabold text-emerald-600 hover:underline flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                                >
                                  <MessageSquare className="h-3 w-3 text-emerald-500 shrink-0" /> Chat WA CS
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Breakdown Subtotal Produk + Ongkir = Total */}
                          <div className="bg-white p-2.5 rounded-xl border border-indigo-150 space-y-1 text-xs">
                            <div className="flex justify-between text-slate-600 font-medium text-[11px]">
                              <span>Subtotal Produk:</span>
                              <span className="font-bold text-slate-800">
                                Rp {order.items.reduce((s, it) => s + (it.price * it.quantity), 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div className="flex justify-between text-indigo-700 font-medium text-[11px]">
                              <span>Ongkos Kirim (Ongkir):</span>
                              <span className="font-extrabold text-indigo-700">
                                Rp {(order.shippingFee || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-black text-slate-950 border-t border-slate-100 pt-1.5 mt-1">
                              <span className="text-[10px] text-indigo-900 uppercase tracking-wider font-extrabold">Total Transfer:</span>
                              <span className="text-sm font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                                Rp {order.total.toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>

                          {/* Bank accounts list with icons */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                                Rekening Bank Transfer (Pilih Salah Satu):
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                              {BANK_ACCOUNTS.map((bank) => (
                                <div
                                  key={bank.bankName}
                                  className={`p-2 bg-white border ${bank.border} rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-indigo-300 transition`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`px-2 py-0.5 rounded-md font-black text-[9px] tracking-wider shrink-0 ${bank.badgeBg}`}>
                                      {bank.iconText}
                                    </span>
                                    <div className="min-w-0">
                                      <span className="text-[10px] font-extrabold text-slate-800 block leading-none truncate">{bank.bankName}</span>
                                      <span className="text-xs font-mono font-black text-slate-950 block leading-tight">{bank.accountNumber}</span>
                                      <span className="text-[9px] text-slate-400 font-semibold block leading-none truncate">a.n. {bank.accountHolder}</span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(bank.accountNumber);
                                      setCopiedBankNo(bank.accountNumber);
                                      setTimeout(() => setCopiedBankNo(null), 2000);
                                    }}
                                    className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition shrink-0 flex items-center gap-1 ${
                                      copiedBankNo === bank.accountNumber
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                                    }`}
                                  >
                                    {copiedBankNo === bank.accountNumber ? (
                                      <>
                                        <Check className="h-3 w-3" />
                                        <span>Tersalin!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3 w-3" />
                                        <span>Salin No.Rek</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tombol Konfirmasi Bukti Pembayaran */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex flex-col sm:flex-row gap-1.5">
                              <a
                                href={`https://wa.me/${(order.processedByPhone || '6281226854000').replace(/^0/, '62')}?text=${encodeURIComponent(
                                  `Halo Kak ${order.processedBy || 'CS'}! Saya ${order.customerName} ingin mengonfirmasi bukti pembayaran transfer untuk Pesanan ${order.orderNo}.\n\n` +
                                  `• Subtotal Produk: Rp ${order.items.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString('id-ID')}\n` +
                                  `• Ongkos Kirim: Rp ${(order.shippingFee || 0).toLocaleString('id-ID')}\n` +
                                  `• TOTAL DITRANSFER: Rp ${order.total.toLocaleString('id-ID')}\n\n` +
                                  `Mohon dicek ya kak, terima kasih!`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                              >
                                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                                <span>Konfirmasi Transfer ke CS</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmingOrder(order);
                                  setPaymentProofInput(order.paymentProofNote || '');
                                  setShowConfirmPaymentModal(true);
                                }}
                                className="py-2 px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                              >
                                <FileText className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                                <span>Catat Bukti</span>
                              </button>
                            </div>

                            {order.paymentProofNote && (
                              <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-[10px] text-emerald-800 flex items-center gap-1.5 font-bold">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span>Bukti Pembayaran: <strong className="font-extrabold underline">{order.paymentProofNote}</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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

                    {/* Petugas Pemroses / CS Standby */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Petugas Pemroses & CS Standby</span>
                      {selectedStaffOrder.status === 'PENDING' ? (
                        <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-black uppercase">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Menunggu CS / Admin Standby</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                            Pesanan ini baru masuk dan belum diproses. Silakan hubungi CS aktif kami yang standby:
                          </p>
                          <div className="space-y-1">
                            {staff.filter(s => s.role === 'CUSTOMER SERVICE' || s.role === 'ADMIN').slice(0, 3).map(s => (
                              <div key={s.id} className="flex justify-between items-center text-xs bg-white border border-amber-100 p-1.5 rounded-lg">
                                <span className="font-bold text-slate-800">{s.name} ({s.role === 'CUSTOMER SERVICE' ? 'CS' : 'Admin'})</span>
                                <a
                                  href={`https://wa.me/${s.phone.replace(/^0/, '62')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-emerald-600 hover:underline flex items-center gap-0.5 text-[10px]"
                                >
                                  <MessageSquare className="h-3 w-3 text-emerald-500 shrink-0" /> {s.phone}
                                </a>
                              </div>
                            ))}
                            {staff.filter(s => s.role === 'CUSTOMER SERVICE' || s.role === 'ADMIN').length === 0 && (
                              <div className="text-center py-2 text-[10px] text-slate-400 font-bold bg-white rounded border border-amber-100">
                                Tidak ada staff CS standby saat ini.
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-indigo-50/60 border border-indigo-200 p-3 rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 text-indigo-800 text-[10px] font-black uppercase">
                            <Check className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Diproses Oleh</span>
                          </div>
                          <div className="flex justify-between items-center text-xs bg-white border border-indigo-100 p-2 rounded-lg">
                            <div>
                              <span className="font-black text-slate-800 block">{selectedStaffOrder.processedBy || currentUser.name}</span>
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase">{selectedStaffOrder.processedByRole || currentUser.role}</span>
                            </div>
                            <a
                              href={`https://wa.me/${(selectedStaffOrder.processedByPhone || currentUser.phone || '08123456789').replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-emerald-600 hover:underline flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md text-[11px]"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 
                              <span>{selectedStaffOrder.processedByPhone || currentUser.phone || '08123456789'}</span>
                            </a>
                          </div>
                        </div>
                      )}
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

                    {/* Total invoice & payment status with Ongkir Input */}
                    <div className="bg-slate-100/80 p-3.5 rounded-xl text-xs space-y-2.5 border border-slate-250">
                      {/* Ongkir Input Field */}
                      {selectedStaffOrder.status === 'PENDING' ? (
                        <div className="bg-white p-3 rounded-xl border border-indigo-200 space-y-2 shadow-2xs">
                          <label className="text-[10px] font-black text-indigo-900 uppercase tracking-wider block">
                            Input Ongkos Kirim (Ongkir) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={shippingFeeInput}
                              onChange={(e) => setShippingFeeInput(Math.max(0, parseInt(e.target.value) || 0))}
                              placeholder="Masukkan nominal ongkir"
                              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-indigo-200 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Ongkir ini akan ditambahkan ke tagihan customer dan ditampilkan beserta daftar rekening bank transfer.
                          </p>
                        </div>
                      ) : (
                        <div className="flex justify-between text-indigo-700 font-bold">
                          <span>Ongkos Kirim (Ongkir):</span>
                          <span>Rp {(selectedStaffOrder.shippingFee || 0).toLocaleString('id-ID')}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-600 font-semibold pt-1 border-t border-slate-200">
                        <span>Pintu Gerbang Pembayaran:</span>
                        <span className="font-bold text-slate-800">
                          {selectedStaffOrder.paymentGateway === 'MIDTRANS' ? 'M-QRIS Midtrans' : 'COD WhatsApp / Transfer Bank'}
                        </span>
                      </div>

                      <div className="flex justify-between text-base font-extrabold text-slate-950 border-t border-slate-200/60 pt-1.5 mt-1.5">
                        <span>Grand Total Tagihan:</span>
                        <span className="text-indigo-700">
                          Rp {(
                            selectedStaffOrder.status === 'PENDING'
                              ? selectedStaffOrder.items.reduce((s, i) => s + i.subtotal, 0) + shippingFeeInput
                              : selectedStaffOrder.total
                          ).toLocaleString('id-ID')}
                        </span>
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
                            updateOnlineOrderStatus(
                              selectedStaffOrder.id,
                              'CANCELLED',
                              currentUser.name,
                              currentUser.phone,
                              currentUser.role,
                              shippingFeeInput
                            );
                            setSelectedStaffOrder({
                              ...selectedStaffOrder,
                              status: 'CANCELLED',
                              shippingFee: shippingFeeInput,
                              processedBy: currentUser.name,
                              processedByPhone: currentUser.phone,
                              processedByRole: currentUser.role
                            });
                          }}
                          className="flex-1 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-200 transition"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => {
                            const subtotal = selectedStaffOrder.items.reduce((s, i) => s + i.subtotal, 0);
                            const finalTotal = subtotal + shippingFeeInput;

                            updateOnlineOrderStatus(
                              selectedStaffOrder.id,
                              'PROCESSING',
                              currentUser.name,
                              currentUser.phone,
                              currentUser.role,
                              shippingFeeInput
                            );

                            setSelectedStaffOrder({
                              ...selectedStaffOrder,
                              status: 'PROCESSING',
                              shippingFee: shippingFeeInput,
                              total: finalTotal,
                              processedBy: currentUser.name,
                              processedByPhone: currentUser.phone,
                              processedByRole: currentUser.role
                            });

                            alert(`Pesanan #${selectedStaffOrder.orderNo} disetujui oleh ${currentUser.name}!\n\n• Subtotal Produk: Rp ${subtotal.toLocaleString('id-ID')}\n• Ongkir: Rp ${shippingFeeInput.toLocaleString('id-ID')}\n• Grand Total: Rp ${finalTotal.toLocaleString('id-ID')}\n\nStok telah dipotong dan tagihan diupdate di tampilan customer!`);
                          }}
                          className="flex-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/15 transition"
                        >
                          Setujui & Proses (Update Ongkir)
                        </button>
                      </div>
                    )}

                    {selectedStaffOrder.status === 'PROCESSING' && (
                      <button
                        onClick={() => {
                          updateOnlineOrderStatus(
                            selectedStaffOrder.id,
                            'SHIPPED',
                            selectedStaffOrder.processedBy || currentUser.name,
                            selectedStaffOrder.processedByPhone || currentUser.phone,
                            selectedStaffOrder.processedByRole || currentUser.role
                          );
                          setSelectedStaffOrder({
                            ...selectedStaffOrder,
                            status: 'SHIPPED',
                            processedBy: selectedStaffOrder.processedBy || currentUser.name,
                            processedByPhone: selectedStaffOrder.processedByPhone || currentUser.phone,
                            processedByRole: selectedStaffOrder.processedByRole || currentUser.role
                          });
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
                          updateOnlineOrderStatus(
                            selectedStaffOrder.id,
                            'DELIVERED',
                            selectedStaffOrder.processedBy || currentUser.name,
                            selectedStaffOrder.processedByPhone || currentUser.phone,
                            selectedStaffOrder.processedByRole || currentUser.role
                          );
                          setSelectedStaffOrder({
                            ...selectedStaffOrder,
                            status: 'DELIVERED',
                            processedBy: selectedStaffOrder.processedBy || currentUser.name,
                            processedByPhone: selectedStaffOrder.processedByPhone || currentUser.phone,
                            processedByRole: selectedStaffOrder.processedByRole || currentUser.role
                          });
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

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left space-y-2 text-xs mb-4 font-medium">
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
                <span>Total Belanja:</span>
                <span>Rp {submittedOrder.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Catatan Penting Pemberitahuan */}
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-left text-[11px] mb-4 space-y-1.5 leading-normal">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-900 uppercase tracking-wide text-[9px]">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Catatan Penting</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-0.5 font-bold">
                <li>Biaya belanja <span className="text-amber-800 font-extrabold underline">belum termasuk</span> ongkos kirim.</li>
                <li>Total pembayaran dan Rekening pembayaran akan dikirim <span className="text-indigo-600 font-extrabold">setelah persetujuan pesanan</span>.</li>
              </ul>
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
                type="button"
                onClick={() => setShowCartDrawer(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCustomerCheckout} className="flex-1 flex flex-col justify-between h-full overflow-hidden">
              {/* Mobile form and lists */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {/* Basket Items List - displays 7 products before scroll */}
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 pb-2">
                  {customerCart.map((item) => (
                    <div key={item.product.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-250/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block leading-tight">{item.product.name}</span>
                        <span className="text-[10px] text-slate-400">Rp {item.product.sellingPrice.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateCustomerCartQty(item.product.id, -1)}
                          className="h-5 w-5 bg-white border border-slate-200 rounded text-slate-600 flex items-center justify-center font-bold shadow-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.product.stock}
                          value={item.quantity || ''}
                          onChange={(e) => {
                            const valStr = e.target.value;
                            if (valStr === '') {
                              setCustomerCartQty(item.product.id, 0);
                            } else {
                              const val = parseInt(valStr, 10);
                              if (!isNaN(val)) {
                                const clamped = Math.max(1, Math.min(item.product.stock, val));
                                setCustomerCartQty(item.product.id, clamped);
                              }
                            }
                          }}
                          onBlur={() => {
                            if (item.quantity < 1) {
                              setCustomerCartQty(item.product.id, 1);
                            }
                          }}
                          className="text-xs font-bold text-slate-800 w-10 text-center bg-white border border-slate-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateCustomerCartQty(item.product.id, 1)}
                          className="h-5 w-5 bg-white border border-slate-200 rounded text-slate-600 flex items-center justify-center font-bold shadow-xs"
                          disabled={item.quantity >= item.product.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 border-t border-slate-150 pt-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Informasi Pengiriman</span>
                    {loggedCustomer && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-md uppercase border border-emerald-100 flex items-center gap-1">
                        <Check className="h-2.5 w-2.5 text-emerald-600" /> Member Terhubung
                      </span>
                    )}
                  </div>
                  
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
                    <label className="text-[10px] text-slate-500 font-bold block">ALAMAT LENGKAP</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Tulis alamat rumah lengkap..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-150 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600">Total Belanja:</span>
                      <span className="font-extrabold text-base text-slate-900">Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition"
                    >
                      Kirim Pesanan Saya
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER LOGIN / REGISTER MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative flex flex-col">
            <button
              onClick={() => { setShowAuthModal(false); setAuthError(''); }}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Tab selector */}
            {authTab !== 'CHOOSE' && (
              <div className="flex border-b border-slate-100 mb-5 mt-2">
                <button
                  onClick={() => { setAuthTab('LOGIN'); setAuthError(''); }}
                  className={`flex-1 pb-2.5 text-xs font-bold transition-all relative ${
                    authTab === 'LOGIN' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span>Masuk Member</span>
                  {authTab === 'LOGIN' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                </button>
                <button
                  onClick={() => { setAuthTab('REGISTER'); setAuthError(''); }}
                  className={`flex-1 pb-2.5 text-xs font-bold transition-all relative ${
                    authTab === 'REGISTER' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span>Daftar Member Baru</span>
                  {authTab === 'REGISTER' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                </button>
              </div>
            )}

            {authError && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authTab === 'CHOOSE' ? (
              <div className="space-y-3.5 mt-2 text-center">
                <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Compass className="h-6 w-6 animate-spin-slow" />
                </div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Akses Portal Kedai</h4>
                <p className="text-[11px] text-slate-500 mb-4 leading-normal px-2">
                  Silakan pilih jenis akses Anda untuk melanjutkan transaksi di Kedai Kepanduan.
                </p>
                
                <button
                  onClick={() => { setAuthTab('LOGIN'); setAuthError(''); }}
                  className="w-full p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl flex items-center gap-3.5 text-left transition duration-150 group"
                >
                  <div className="h-9 w-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Masuk Akun Member</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Cek poin belanja, saldo cashback, dan belanja cepat.</p>
                  </div>
                </button>

                <button
                  onClick={() => { setAuthTab('REGISTER'); setAuthError(''); }}
                  className="w-full p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-2xl flex items-center gap-3.5 text-left transition duration-150 group"
                >
                  <div className="h-9 w-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Daftar Member Baru</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Kumpulkan poin reward gratis & diskon khusus member.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    if (onAdminLogin) {
                      onAdminLogin();
                    }
                  }}
                  className="w-full p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-250 rounded-2xl flex items-center gap-3.5 text-left transition duration-150 group"
                >
                  <div className="h-9 w-9 bg-indigo-150 text-indigo-850 rounded-xl flex items-center justify-center group-hover:bg-indigo-750 group-hover:text-white transition-all shrink-0">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Akses Admin / Karyawan</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Masuk ke kasir POS, kelola inventaris, & lihat laporan.</p>
                  </div>
                </button>
              </div>
            ) : authTab === 'LOGIN' ? (
              <form onSubmit={handleCustomerLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Email atau No. Handphone *</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan Email atau No. HP Anda"
                      value={authEmailInput}
                      onChange={(e) => setAuthEmailInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Masukkan password Anda"
                      value={authPasswordInput}
                      onChange={(e) => setAuthPasswordInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/10 transition mt-6 flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>Masuk ke Akun Saya</span>
                </button>

                <div className="pt-3.5 border-t border-slate-100 text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setAuthTab('CHOOSE'); setAuthError(''); }}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center justify-center gap-1 mx-auto uppercase tracking-wider"
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    <span>Kembali ke Pilihan Akses</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCustomerRegister} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Nama Lengkap *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      value={authNameInput}
                      onChange={(e) => setAuthNameInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-indigo-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Nomor Handphone *</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="Masukkan No. HP aktif (contoh: 08123456789)"
                      value={authPhoneInput}
                      onChange={(e) => setAuthPhoneInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-indigo-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Alamat Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={authEmailInput}
                    onChange={(e) => setAuthEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-indigo-500 shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Buat password untuk login selanjutnya"
                      value={authPasswordInput}
                      onChange={(e) => setAuthPasswordInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-indigo-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Alamat Pengiriman (Opsional)</label>
                  <textarea
                    rows={2}
                    placeholder="Alamat rumah lengkap untuk memudahkan pengiriman"
                    value={authAddressInput}
                    onChange={(e) => setAuthAddressInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-indigo-500 shadow-inner resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/10 transition mt-6 flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>Daftar Member & Masuk</span>
                </button>

                <div className="pt-3.5 border-t border-slate-100 text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setAuthTab('CHOOSE'); setAuthError(''); }}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center justify-center gap-1 mx-auto uppercase tracking-wider"
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    <span>Kembali ke Pilihan Akses</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative flex flex-col">
            <button
              onClick={() => { setShowEditProfileModal(false); setProfileError(''); }}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Edit Profil Pelanggan</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Perbarui nama lengkap, kontak nomor HP, atau alamat utama pengiriman Anda.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Contoh: Elisa Nur"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nomor HP / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="Contoh: 0812345678"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alamat Pengiriman Utama</label>
                <textarea
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="Masukkan alamat pengiriman lengkap Anda..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-semibold leading-relaxed resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/10 transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Bukti Transfer */}
      {showConfirmPaymentModal && confirmingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => {
                setShowConfirmPaymentModal(false);
                setConfirmingOrder(null);
              }}
              className="absolute right-4 top-4 p-1 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Konfirmasi Bukti Transfer</h3>
                <p className="text-[11px] text-slate-500 font-medium">Pesanan #{confirmingOrder.orderNo}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Produk:</span>
                <span className="font-bold">Rp {confirmingOrder.items.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-indigo-700">
                <span>Ongkos Kirim:</span>
                <span className="font-extrabold">Rp {(confirmingOrder.shippingFee || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-950 font-black pt-1 border-t border-slate-200 text-sm">
                <span>Total Ditransfer:</span>
                <span className="text-indigo-700">Rp {confirmingOrder.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!paymentProofInput.trim()) return;

                updateOnlineOrderStatus(
                  confirmingOrder.id,
                  confirmingOrder.status,
                  confirmingOrder.processedBy,
                  confirmingOrder.processedByPhone,
                  confirmingOrder.processedByRole,
                  confirmingOrder.shippingFee,
                  paymentProofInput.trim()
                );

                alert('Catatan bukti pembayaran telah dikirim dan diteruskan ke Petugas CS!');
                setShowConfirmPaymentModal(false);
                setConfirmingOrder(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Catatan Bukti / Nomor Referensi Transfer *
                </label>
                <textarea
                  required
                  rows={3}
                  value={paymentProofInput}
                  onChange={(e) => setPaymentProofInput(e.target.value)}
                  placeholder="Contoh: Sudah transfer Rp 150.000 via BCA a.n. Elisa Nur (Reff #981203)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmPaymentModal(false);
                    setConfirmingOrder(null);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Simpan Catatan Bukti</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
