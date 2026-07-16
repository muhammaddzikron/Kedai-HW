/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Coffee,
  PackageOpen,
  ShoppingBag,
  Truck,
  Users,
  DollarSign,
  BookOpen,
  BarChart3,
  UserCheck,
  Network,
  Percent,
  Globe,
  Store,
  Smartphone,
  Wallet,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  MapPin,
  ChevronDown,
  Scissors,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const {
    activeTab,
    setActiveTab,
    isOnline,
    setIsOnline,
    isSyncing,
    syncCloud,
    currentUser,
    changeRole,
    loginAsUser,
    currentBranch,
    changeBranch,
    branches,
    staff,
    logout
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [pinTargetUser, setPinTargetUser] = useState<any | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'UTAMA' },
    { id: 'pos', label: 'POS Kasir', icon: ShoppingCart, category: 'UTAMA' },
    
    { id: 'products', label: 'Katalog Produk', icon: Coffee, category: 'OPERASIONAL' },
    { id: 'inventory', label: 'Stok & Gudang', icon: PackageOpen, category: 'OPERASIONAL' },
    { id: 'purchases', label: 'Pembelian Stok', icon: ShoppingBag, category: 'OPERASIONAL' },
    
    { id: 'suppliers', label: 'Pemasok / Supplier', icon: Truck, category: 'MITRA & PELANGGAN' },
    { id: 'customers', label: 'Anggota / Pelanggan', icon: Users, category: 'MITRA & PELANGGAN' },
    
    { id: 'finance', label: 'Arus Kas & Biaya', icon: DollarSign, category: 'KEUANGAN' },
    { id: 'accounting', label: 'Akuntansi & Jurnal', icon: BookOpen, category: 'KEUANGAN' },
    { id: 'reports', label: 'Laporan & Audit', icon: BarChart3, category: 'KEUANGAN' },
    
    { id: 'staff', label: 'Staf & Kehadiran', icon: UserCheck, category: 'FITUR SAAS' },
    
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings, category: 'SISTEM' }
  ];

  const categories = ['UTAMA', 'OPERASIONAL', 'MITRA & PELANGGAN', 'KEUANGAN', 'FITUR SAAS', 'SISTEM'];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'MANAGER': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'ACCOUNTANT': return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      case 'WAREHOUSE': return 'bg-teal-50 text-teal-700 border border-teal-200';
      default: return 'bg-indigo-50 text-indigo-700 border border-indigo-200'; // Cashier, Supervisor
    }
  };

  return (
    <aside id="app-sidebar" className={`fixed inset-y-0 left-0 z-40 w-68 bg-white border-r border-slate-200 text-slate-700 flex flex-col h-screen overflow-hidden select-none flex-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center font-extrabold text-white shadow-lg shadow-indigo-600/20">
            KK
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-800 leading-tight">
              KASIR KEDAI
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
              KEPANDUAN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync Status / Offline Indicator */}
          <button
            id="sync-btn"
            onClick={() => isOnline && syncCloud()}
            disabled={isSyncing || !isOnline}
            className={`p-1.5 rounded-lg border text-xs flex items-center justify-center transition-all ${
              !isOnline
                ? 'bg-rose-50 text-rose-600 border-rose-200 cursor-not-allowed'
                : isSyncing
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200 animate-spin'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
            title={!isOnline ? 'Sedang Offline' : isSyncing ? 'Sinkronisasi Cloud...' : 'Sinkronisasi Manual'}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 lg:hidden"
            title="Tutup Menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Network / Active Branch Selector */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
        <div className="w-full flex items-center text-left py-1 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
            <span className="truncate">{currentBranch.name}</span>
          </span>
        </div>
      </div>

      {/* Navigation Menus */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin">
        {categories.map((cat) => {
          const items = menuItems.filter((i) => i.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} className="space-y-1">
              <span className="px-3 text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1 block">
                {cat}
              </span>
              <div className="space-y-[2px]">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-tab-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setShowRoleMenu(false);
                        setShowBranchMenu(false);
                        onClose(); // Auto close on mobile
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Liveness / Connection State */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-medium px-4">
        <span className="text-slate-400 text-[10px] font-bold">KONEKSI SERVER:</span>
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider transition ${
            isOnline
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
          title="Klik untuk simulasi Offline / Online"
        >
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3" />
              ONLINE
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              OFFLINE
            </>
          )}
        </button>
      </div>

      {/* User Session Profile & Role Switcher */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 relative flex items-center gap-1.5">
        <button
          id="user-profile-toggle"
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className="flex-1 flex items-center gap-2 text-left p-1 rounded-xl hover:bg-slate-100 transition min-w-0"
        >
          <div className="h-8 w-8 bg-slate-200 border border-slate-300 rounded-full flex items-center justify-center text-slate-700 font-bold text-xs uppercase shadow-inner flex-shrink-0">
            {currentUser.name.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-800 truncate leading-tight">
              {currentUser.name}
            </h4>
            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full mt-0.5 ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
        </button>

        <button
          onClick={logout}
          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition border border-transparent hover:border-rose-100 flex-shrink-0"
          title="Logout (Kunci Sistem)"
        >
          <LogOut className="h-4 w-4" />
        </button>

        {showRoleMenu && (
          <div className="absolute bottom-16 left-3 right-3 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-3 py-1 border-b border-slate-100 mb-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Pilih Akun Karyawan
              </span>
            </div>
            {staff.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setPinTargetUser(s);
                  setEnteredPin('');
                  setPinError('');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition ${
                  currentUser.id === s.id
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{s.name}</span>
                <span className="text-[9px] opacity-70 bg-slate-100 px-1 py-0.2 rounded-sm border border-slate-200 text-slate-600 font-bold">
                  {s.role}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECURE TOUCH-FRIENDLY NUMPAD PIN MODAL */}
      {pinTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 border border-slate-200 shadow-2xl relative text-center">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">Verifikasi PIN Karyawan</h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-4 leading-normal">
              Masukkan PIN untuk login ke akun <br />
              <span className="text-slate-700 font-black">{pinTargetUser.name}</span>
            </p>

            {/* PIN Dots Indicator */}
            <div className="flex justify-center gap-3 mb-5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-4.5 w-4.5 rounded-full border-2 transition ${
                    enteredPin.length > i
                      ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-100'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-[10px] text-rose-500 font-extrabold mb-4 animate-bounce">{pinError}</p>
            )}

            {/* Grid Numpad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[200px] mx-auto mb-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (enteredPin.length < 4) {
                      setEnteredPin((prev) => prev + num);
                      setPinError('');
                    }
                  }}
                  className="h-11 w-11 rounded-full bg-slate-50 hover:bg-slate-100 active:bg-indigo-100 border border-slate-200/60 font-bold text-slate-700 text-sm transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setEnteredPin((prev) => prev.slice(0, -1));
                  setPinError('');
                }}
                className="h-11 w-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold transition"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => {
                  if (enteredPin.length < 4) {
                    setEnteredPin((prev) => prev + '0');
                    setPinError('');
                  }
                }}
                className="h-11 w-11 rounded-full bg-slate-50 hover:bg-slate-100 active:bg-indigo-100 border border-slate-200/60 font-bold text-slate-700 text-sm transition"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  const success = loginAsUser(pinTargetUser.id, enteredPin);
                  if (success) {
                    setPinTargetUser(null);
                  } else {
                    setPinError('PIN salah. Silakan coba lagi.');
                    setEnteredPin('');
                  }
                }}
                className="h-11 w-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase shadow-sm shadow-indigo-100 transition"
              >
                Masuk
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPinTargetUser(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-xl transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
