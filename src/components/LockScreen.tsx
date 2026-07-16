import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Staff } from '../types';
import { 
  Lock, 
  ShieldCheck, 
  Compass, 
  HelpCircle, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Users,
  Grid
} from 'lucide-react';

interface LockScreenProps {
  onBackToMarketplace?: () => void;
}

export default function LockScreen({ onBackToMarketplace }: LockScreenProps) {
  const { staff, loginAsUser, loginWithEmailPassword } = useApp();
  
  // Tabs: 'PIN' | 'PASSWORD'
  const [activeTab, setActiveTab] = useState<'PIN' | 'PASSWORD'>('PASSWORD');
  
  // PIN Login State
  const [selectedUser, setSelectedUser] = useState<Staff | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  
  // Password Login State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Shared Error and Success States
  const [errorMsg, setErrorMsg] = useState('');
  
  // Guide helper visibility
  const [showGuide, setShowGuide] = useState(false);

  // Quick select for email input from the guide
  const handleQuickSelectEmail = (email: string, isSuperAdmin?: boolean) => {
    if (isSuperAdmin) {
      setEmailInput('admin');
      setPasswordInput('adnimtunimku12**');
    } else {
      setEmailInput(email);
      setPasswordInput(email.split('@')[0] + '123');
    }
    setErrorMsg('');
  };

  // PIN Actions
  const handleNumClick = (num: number) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);
      setErrorMsg('');

      // Auto-submit if pin length reaches 4
      if (newPin.length === 4 && selectedUser) {
        handlePinSubmit(selectedUser.id, newPin);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handlePinSubmit = (staffId: string, pin: string) => {
    const success = loginAsUser(staffId, pin);
    if (success) {
      setSelectedUser(null);
      setEnteredPin('');
      setErrorMsg('');
    } else {
      setErrorMsg('PIN salah. Silakan coba lagi.');
      setEnteredPin('');
    }
  };

  // Email & Password Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setErrorMsg('Harap isi alamat email dan kata sandi Anda.');
      return;
    }
    
    const success = loginWithEmailPassword(emailInput, passwordInput);
    if (success) {
      setEmailInput('');
      setPasswordInput('');
      setErrorMsg('');
    } else {
      setErrorMsg('Email atau kata sandi salah. Silakan coba lagi.');
    }
  };

  const getRoleBadgeColor = (role: Staff['role']) => {
    switch (role) {
      case 'OWNER': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ADMIN': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MANAGER': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CASHIER': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-4 sm:p-8 overflow-y-auto select-none font-sans text-slate-100">
      
      {/* HEADER BAR */}
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div className="text-left">
            <h1 className="text-md font-black text-white tracking-wider uppercase">Kedai Kepanduan</h1>
            <p className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">Core POS Sync System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onBackToMarketplace && (
            <button
              onClick={onBackToMarketplace}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-300 text-[11px] font-bold rounded-xl transition-all duration-200"
            >
              <span>← Kembali ke Marketplace</span>
            </button>
          )}
          <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800">
            <Lock className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sistem Terkunci</span>
          </div>
        </div>
      </div>

      {/* CORE LOGIN WORK AREA */}
      <div className="w-full max-w-lg mx-auto my-auto py-6 flex flex-col items-center">
        
        {/* TAB CONTROLS (Only visible if no user selected in PIN flow) */}
        {!selectedUser && (
          <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 gap-1 mb-8 w-full">
            <button
              onClick={() => {
                setActiveTab('PASSWORD');
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'PASSWORD'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Mail className="h-4 w-4" />
              Email & Sandi
            </button>
            <button
              onClick={() => {
                setActiveTab('PIN');
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'PIN'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Grid className="h-4 w-4" />
              PIN Karyawan
            </button>
          </div>
        )}

        {/* TAB 1: EMAIL & PASSWORD FORM */}
        {activeTab === 'PASSWORD' && (
          <div className="w-full bg-slate-900/40 border border-slate-850 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Masuk Akun</h2>
              <p className="text-xs text-slate-400 mt-1">Gunakan alamat email dan kata sandi karyawan Anda</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Alamat Email Karyawan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="nama@kepanduan.id"
                    className="w-full bg-slate-950 hover:bg-slate-900 focus:bg-slate-900 text-slate-100 placeholder-slate-600 text-xs rounded-2xl pl-10 pr-4 py-3.5 border border-slate-800 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 hover:bg-slate-900 focus:bg-slate-900 text-slate-100 placeholder-slate-600 text-xs rounded-2xl pl-10 pr-11 py-3.5 border border-slate-800 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all font-mono font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold p-3.5 rounded-2xl flex items-center gap-2.5 animate-bounce">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/10 hover:-translate-y-0.5 active:translate-y-0"
              >
                Masuk Sistem POS
              </button>
            </form>

            {/* DEMO ACCOUNTS ACCORDION CHEAT-SHEET */}
            <div className="mt-6 border-t border-slate-800/80 pt-4">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="w-full flex items-center justify-between text-slate-500 hover:text-slate-300 text-[10px] font-black uppercase tracking-widest transition"
              >
                <span className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-indigo-400" />
                  Lihat Akun Uji Coba (Demo)
                </span>
                {showGuide ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showGuide && (
                <div className="mt-3.5 space-y-2 max-h-48 overflow-y-auto pr-1">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-1.5">
                    Klik salah satu akun di bawah untuk mengisi formulir otomatis:
                  </p>
                  
                  {/* Super Admin option explicitly requested by user */}
                  <button
                    type="button"
                    onClick={() => handleQuickSelectEmail('admin', true)}
                    className="w-full bg-slate-950/90 border border-indigo-500/30 hover:border-indigo-500 p-2.5 rounded-xl flex items-center justify-between text-left transition group shadow-md"
                  >
                    <div>
                      <p className="text-[10px] font-extrabold text-indigo-400 group-hover:text-indigo-300 transition truncate max-w-[200px]">
                        👑 Super Admin (Sistem)
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">Username: admin</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-[7px] font-black bg-indigo-900/40 text-indigo-300 uppercase tracking-widest px-1.5 py-0.5 rounded border border-indigo-800/50">
                        SUPER ADMIN
                      </span>
                      <p className="text-[8px] text-slate-400 font-mono mt-1">Sandi: adnimtunimku12**</p>
                    </div>
                  </button>

                  {staff.map((u) => {
                    const defaultPw = u.password || (u.email ? u.email.split('@')[0] + '123' : 'admin123');
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickSelectEmail(u.email)}
                        className="w-full bg-slate-950/80 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/20 p-2.5 rounded-xl flex items-center justify-between text-left transition group"
                      >
                        <div>
                          <p className="text-[10px] font-bold text-slate-200 group-hover:text-indigo-400 transition truncate max-w-[200px]">
                            {u.name}
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">{u.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block text-[7px] font-black bg-slate-900 text-slate-400 uppercase tracking-widest px-1.5 py-0.5 rounded border border-slate-800/60">
                            {u.role}
                          </span>
                          <p className="text-[8px] text-slate-500 font-mono mt-1">Sandi: {defaultPw}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PIN LOGIN */}
        {activeTab === 'PIN' && (
          <div className="w-full">
            {!selectedUser ? (
              // USER SELECTION GRID
              <div className="w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-150">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Ketuk Akun Anda</h2>
                  <p className="text-xs text-slate-400">Pilih profil karyawan Anda untuk masuk menggunakan PIN cepat</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {staff.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setEnteredPin('');
                        setErrorMsg('');
                      }}
                      className="bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/30 p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-205 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 group shadow-lg"
                    >
                      <div className="h-11 w-11 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all uppercase mb-2.5">
                        {u.name.slice(0, 2)}
                      </div>
                      <h3 className="text-xs font-bold text-slate-200 group-hover:text-white truncate max-w-full">
                        {u.name}
                      </h3>
                      <span className={`inline-block text-[7px] font-extrabold uppercase tracking-widest border px-1.5 py-0.5 rounded-full mt-2 ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // NUMPAD FOR ACTIVE SELECTED USER
              <div className="w-full max-w-sm mx-auto bg-slate-900/40 border border-slate-850 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in-95 duration-150">
                
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setErrorMsg('');
                  }}
                  className="absolute left-6 top-6 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-wider transition"
                >
                  ← Kembali
                </button>

                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-md shadow-md shadow-indigo-600/20 uppercase mt-4 mb-3">
                  {selectedUser.name.slice(0, 2)}
                </div>

                <h3 className="text-sm font-extrabold text-white mb-0.5">{selectedUser.name}</h3>
                <span className={`inline-block text-[8px] font-extrabold uppercase tracking-widest border px-2 py-0.5 rounded-full mb-6 ${getRoleBadgeColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Masukkan PIN Karyawan</p>

                {/* PIN Dot Indicators */}
                <div className="flex justify-center gap-3.5 mb-5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4.5 w-4.5 rounded-full border-2 transition-all duration-150 ${
                        enteredPin.length > i
                          ? 'bg-indigo-500 border-indigo-500 shadow-md shadow-indigo-500/20 scale-105'
                          : 'bg-transparent border-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {errorMsg ? (
                  <p className="text-[10px] text-rose-400 font-extrabold mb-5 animate-pulse uppercase tracking-wider">
                    ⚠️ {errorMsg}
                  </p>
                ) : (
                  <p className="text-[8px] text-slate-500 font-medium italic mb-5">
                    Demo PIN untuk Kak {selectedUser.name.split(' ')[0]} adalah {selectedUser.pin}
                  </p>
                )}

                {/* Touch-Friendly Numpad Grid */}
                <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumClick(num)}
                      className="h-12 w-12 rounded-full bg-slate-800/80 hover:bg-slate-700 active:bg-indigo-600 border border-slate-700/40 text-slate-200 hover:text-white active:text-white font-bold text-sm transition-all shadow-md active:scale-90"
                    >
                      {num}
                    </button>
                  ))}
                  
                  {/* Reset/Clear button */}
                  <button
                    type="button"
                    onClick={() => setEnteredPin('')}
                    className="h-12 w-12 rounded-full bg-slate-800/30 hover:bg-slate-800/60 active:bg-slate-800 text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-wider transition active:scale-90"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNumClick(0)}
                    className="h-12 w-12 rounded-full bg-slate-800/80 hover:bg-slate-700 active:bg-indigo-600 border border-slate-700/40 text-slate-200 hover:text-white active:text-white font-bold text-sm transition-all shadow-md active:scale-90"
                  >
                    0
                  </button>

                  {/* Backspace/Delete Button */}
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="h-12 w-12 rounded-full bg-slate-800/30 hover:bg-slate-800/60 active:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase tracking-wider transition active:scale-90 flex items-center justify-center"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* FOOTER METADATA BAR */}
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between border-t border-slate-900 pt-4 pb-2 text-slate-500 text-[9px] font-bold uppercase tracking-widest gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
          <span>Sistem Otorisasi Multi-User Karyawan Aman (RBAC)</span>
        </div>
        <div className="flex items-center gap-1">
          <HelpCircle className="h-3 w-3 text-slate-600" />
          <span>Bantuan: Hubungi Owner / Admin jika lupa kata sandi</span>
        </div>
      </div>
    </div>
  );
}
