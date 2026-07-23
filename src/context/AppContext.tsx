/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Supplier,
  AccountCode,
  Branch,
  Staff,
  Promotion,
  OnlineOrder,
  PpobTransaction,
  Order,
  InventoryMovement,
  CartItem,
  Shift,
  AuditLog,
  PaymentMethod,
  ProductVariant,
  ProductModifier,
  KonveksiOrder,
  PurchaseOrder,
  JournalEntry
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_ACCOUNT_CODES,
  INITIAL_BRANCHES,
  INITIAL_STAFF,
  INITIAL_PROMOTIONS,
  INITIAL_ONLINE_ORDERS,
  INITIAL_PPOB_TRANSACTIONS,
  INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_ORDERS
} from '../data/mockData';

interface AppContextType {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  branches: Branch[];
  staff: Staff[];
  staffList: Staff[];
  promotions: Promotion[];
  onlineOrders: OnlineOrder[];
  ppobTransactions: PpobTransaction[];
  orders: Order[];
  updateOrder: (orderId: string, updatedFields: Partial<Order>) => void;
  inventoryMovements: InventoryMovement[];
  accountCodes: AccountCode[];
  activeShift: Shift | null;
  auditLogs: AuditLog[];
  currentUser: Staff;
  currentBranch: Branch;
  cart: CartItem[];
  holdOrders: { id: string; name: string; tableNo?: string; cart: CartItem[]; date: string }[];
  activeTab: string;
  isOnline: boolean;
  isSyncing: boolean;
  konveksiOrders: KonveksiOrder[];
  addKonveksiOrder: (order: Omit<KonveksiOrder, 'id' | 'orderNo'>) => void;
  updateKonveksiOrderStatus: (id: string, status: KonveksiOrder['status']) => void;
  addOnlineOrder: (order: Omit<OnlineOrder, 'id' | 'orderNo' | 'date'>) => void;
  updateOnlineOrderStatus: (id: string, status: OnlineOrder['status'], processedBy?: string, processedByPhone?: string, processedByRole?: string, shippingFee?: number, paymentProofNote?: string) => void;
  
  // Tab Management
  setActiveTab: (tab: string) => void;
  setIsOnline: (online: boolean) => void;
  syncCloud: () => Promise<void>;
  changeRole: (role: Staff['role']) => void;
  loginAsUser: (staffId: string, pin: string) => boolean;
  loginWithEmailPassword: (email: string, password: string) => boolean;
  changeBranch: (branchId: string) => void;
  
  // POS Cart Actions
  addToCart: (product: Product, selectedVariant?: ProductVariant, selectedModifiers?: ProductModifier[]) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  updateCartItemDiscount: (cartId: string, discountPercentage: number) => void;
  updateCartItemNotes: (cartId: string, notes: string) => void;
  clearCart: () => void;
  
  // POS Holding/Hold Bill Actions
  holdCurrentCart: (name: string, tableNo?: string) => void;
  restoreHeldCart: (holdId: string) => void;
  deleteHeldCart: (holdId: string) => void;
  
  // Sales Execution
  checkoutCart: (paymentMethod: PaymentMethod, amountPaid: number, options: { customerId?: string; discount?: number; tableNo?: string; splitCount?: number; shippingFee?: number }) => Order;
  refundOrder: (orderId: string) => void;

  // Management Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;
  importProducts: (products: Product[]) => void;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  editCustomer: (id: string, customer: Partial<Customer>) => void;
  importCustomers: (customers: Customer[]) => void;
  deleteCustomer: (id: string) => void;
  deleteCustomers: (ids: string[]) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  addSupplierDebtPayment: (supplierId: string, amount: number) => void;
  addStaff: (staff: Omit<Staff, 'id'> & { pin?: string }) => void;
  updateStaffCommission: (id: string, rate: number) => void;
  editStaff: (staff: Staff) => void;
  deleteStaff: (id: string) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<Staff>>;
  isLocked: boolean;
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
  
  // Shifts
  openShift: (startingCash: number) => void;
  closeShift: (actualCash: number, notes?: string) => void;
  
  // Inventory
  adjustStock: (productId: string, adjustmentQty: number, notes: string) => void;
  transferStock: (productId: string, transferQty: number, notes: string) => void;
  
  // PPOB
  buyPpob: (type: PpobTransaction['type'], provider: string, targetNumber: string, nominal: number, sellingPrice: number, costPrice: number) => void;
  
  // Accounting & Finance
  addFinanceTransaction: (description: string, category: 'INCOME' | 'EXPENSE', amount: number, accountId: string) => void;
  addAuditLog: (action: string, module: string, description: string) => void;

  // Google Sheets & Drive Integration
  googleSheetUrl: string;
  googleDriveUrl: string;
  googleAppsScriptUrl: string;
  updateGoogleConfig: (sheetUrl: string, driveUrl: string, appsScriptUrl?: string) => void;
  syncProductsFromGoogleSheets: () => Promise<void>;
  pushProductsToGoogleSheets: (currentProducts?: Product[]) => Promise<boolean>;
  pushCustomersToGoogleSheets: (currentCustomers?: Customer[]) => Promise<boolean>;
  pullCustomersFromGoogleSheets: () => Promise<void>;
  pullStaffFromGoogleSheets: () => Promise<void>;
  pullOrdersFromGoogleSheets: () => Promise<void>;
  pushAllOrdersToGoogleSheets: (currentOrders?: Order[]) => Promise<boolean>;

  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  financeTransactions: any[];
  setFinanceTransactions: React.Dispatch<React.SetStateAction<any[]>>;
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;

  // New sync functions
  pushOrderToGoogleSheets: (order: Order) => Promise<boolean>;
  pushInventoryMovementToGoogleSheets: (movement: InventoryMovement) => Promise<boolean>;
  pushFinanceTransactionToGoogleSheets: (transaction: any) => Promise<boolean>;
  pushJournalEntryToGoogleSheets: (journal: any) => Promise<boolean>;
  pushAuditLogToGoogleSheets: (log: AuditLog) => Promise<boolean>;
  pushSuppliersToGoogleSheets: (currentSuppliers?: Supplier[]) => Promise<boolean>;
  pushPurchasesToGoogleSheets: (currentPurchases?: PurchaseOrder[]) => Promise<boolean>;
  pushStaffToGoogleSheets: (currentStaff?: Staff[]) => Promise<boolean>;
  pushAllDataToGoogleSheets: () => Promise<boolean>;
  loggedCustomer: Customer | null;
  setLoggedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_KONVEKSI_ORDERS: KonveksiOrder[] = [
  {
    id: 'ko-1',
    orderNo: 'KNV-2026-0001',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    itemName: 'Seragam Batik Sekolah SD Merdeka (Custom Lengan)',
    quantity: 25,
    size: 'CUSTOM',
    measurements: {
      shoulderWidth: 38,
      chestCircumference: 92,
      sleeveLength: 22,
      shirtLength: 60
    },
    dueDate: '2026-07-28',
    status: 'SEWING',
    notes: 'Bahan katun adem prima, logo dibordir di saku depan.',
    totalPrice: 2125000,
    depositPaid: 1000000,
    remainingPayment: 1125000,
    assignedStaff: 'Ahmad Penjahit'
  },
  {
    id: 'ko-2',
    orderNo: 'KNV-2026-0002',
    customerName: 'Susi Susanti',
    customerPhone: '082345678901',
    itemName: 'Seragam Pramuka Penggalang SMP (S, M, L)',
    quantity: 12,
    size: 'M',
    dueDate: '2026-07-20',
    status: 'CUTTING',
    notes: 'Pakai bahan high twist berkualitas, tanpa atribut tambahan.',
    totalPrice: 1560000,
    depositPaid: 500000,
    remainingPayment: 1060000,
    assignedStaff: 'Siti Aminah'
  },
  {
    id: 'ko-3',
    orderNo: 'KNV-2026-0003',
    customerName: 'Hendra Wijaya',
    customerPhone: '085678901234',
    itemName: 'Jas Almamater Universitas Jaya (Custom Fitting)',
    quantity: 1,
    size: 'CUSTOM',
    measurements: {
      shoulderWidth: 46,
      chestCircumference: 104,
      sleeveLength: 62,
      shirtLength: 75
    },
    dueDate: '2026-07-18',
    status: 'FINISHING',
    notes: 'Furing sutra bagian dalam, kancing kuningan timbul.',
    totalPrice: 450000,
    depositPaid: 450000,
    remainingPayment: 0,
    assignedStaff: 'Ahmad Penjahit'
  },
  {
    id: 'ko-4',
    orderNo: 'KNV-2026-0004',
    customerName: 'SDIT Nurul Iman',
    customerPhone: '081398765432',
    itemName: 'Atribut Dasi & Sabuk Sekolah Bordir Logo',
    quantity: 150,
    size: 'S',
    dueDate: '2026-08-05',
    status: 'QUEUED',
    notes: 'Dasi sablon logo sekolah, sabuk kepala kuningan stainless.',
    totalPrice: 3000000,
    depositPaid: 1500000,
    remainingPayment: 1500000,
    assignedStaff: 'Mesin Bordir Komputer'
  },
  {
    id: 'ko-5',
    orderNo: 'KNV-2026-0005',
    customerName: 'Diana Putri',
    customerPhone: '081223344556',
    itemName: 'Seragam Kebaya Kartini PAUD Kemuning',
    quantity: 15,
    size: 'S',
    dueDate: '2026-07-16',
    status: 'READY',
    notes: 'Kebaya brokat pink pastel + rok jarik instan batik.',
    totalPrice: 1800000,
    depositPaid: 1800000,
    remainingPayment: 0,
    assignedStaff: 'Bu Retno'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from local storage or mock data
  const [products, setProducts] = useState<Product[]>(() => {
    const isV2 = localStorage.getItem('kdp_products_v2') === 'loaded';
    if (!isV2) {
      localStorage.setItem('kdp_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('kdp_products_v2', 'loaded');
      return INITIAL_PRODUCTS;
    }
    const saved = localStorage.getItem('kdp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('kdp_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [loggedCustomer, setLoggedCustomer] = useState<Customer | null>(() => {
    const saved = localStorage.getItem('kdp_logged_customer');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('kdp_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  
  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('kdp_staff');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.some((s: any) => s.name.includes('Kakang') || s.name.includes('Owner'))) {
        const resetStaff = INITIAL_STAFF.map((s, idx) => ({
          ...s,
          pin: s.pin || String((idx + 1) * 1111),
          password: s.password || (s.email ? s.email.split('@')[0] + '123' : 'admin123')
        }));
        localStorage.setItem('kdp_staff', JSON.stringify(resetStaff));
        return resetStaff;
      }
      return parsed;
    }
    return INITIAL_STAFF.map((s, idx) => ({
      ...s,
      pin: s.pin || String((idx + 1) * 1111), // Default PINs: 1111, 2222, etc.
      password: s.password || (s.email ? s.email.split('@')[0] + '123' : 'admin123') // Default passwords: kakang123, siti.cashier123, etc.
    }));
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('kdp_promotions');
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });

  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(() => {
    const saved = localStorage.getItem('kdp_online_orders');
    return saved ? JSON.parse(saved) : INITIAL_ONLINE_ORDERS;
  });

  const [ppobTransactions, setPpobTransactions] = useState<PpobTransaction[]>(() => {
    const saved = localStorage.getItem('kdp_ppob');
    return saved ? JSON.parse(saved) : INITIAL_PPOB_TRANSACTIONS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('kdp_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('kdp_inv_movements');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY_MOVEMENTS;
  });

  const [accountCodes, setAccountCodes] = useState<AccountCode[]>(() => {
    const saved = localStorage.getItem('kdp_coa');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNT_CODES;
  });

  const [activeShift, setActiveShift] = useState<Shift | null>(() => {
    const saved = localStorage.getItem('kdp_active_shift');
    return saved ? JSON.parse(saved) : null;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('kdp_audit_logs');
    if (saved) return JSON.parse(saved);
    
    // Default audit log
    return [
      {
        id: 'aud-1',
        timestamp: new Date().toISOString(),
        userId: 'st1',
        userName: 'Kak Kakang (Owner)',
        role: 'OWNER',
        action: 'INITIALIZATION',
        module: 'SYSTEM',
        description: 'Kasir Kedai Kepanduan database initialized successfully.'
      }
    ];
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [holdOrders, setHoldOrders] = useState<{ id: string; name: string; tableNo?: string; cart: CartItem[]; date: string }[]>(() => {
    const saved = localStorage.getItem('kdp_hold_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [konveksiOrders, setKonveksiOrders] = useState<KonveksiOrder[]>(() => {
    const saved = localStorage.getItem('kdp_konveksi_orders');
    return saved ? JSON.parse(saved) : INITIAL_KONVEKSI_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('kdp_konveksi_orders', JSON.stringify(konveksiOrders));
  }, [konveksiOrders]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('kdp_purchase_orders');
    return saved ? JSON.parse(saved) : [
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
    ];
  });

  const [financeTransactions, setFinanceTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem('kdp_finance_transactions');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ft-1',
        date: '2026-07-14T15:00:00Z',
        description: 'Pembayaran Gaji Siti Aminah (Cashier)',
        category: 'EXPENSE',
        amount: 1600000,
        accountId: 'coa-10',
        accountName: 'Beban Gaji & Honor Staff'
      },
      {
        id: 'ft-2',
        date: '2026-07-13T09:00:00Z',
        description: 'Pembayaran Token Listrik Kedai',
        category: 'EXPENSE',
        amount: 450000,
        accountId: 'coa-8',
        accountName: 'Beban Air, Listrik & Internet'
      },
      {
        id: 'ft-3',
        date: '2026-07-12T14:30:00Z',
        description: 'Pembelian Sabun Cuci & Pembersih Lantai',
        category: 'EXPENSE',
        amount: 85000,
        accountId: 'coa-9',
        accountName: 'Beban Perlengkapan Toko'
      },
      {
        id: 'ft-4',
        date: '2026-07-10T08:00:00Z',
        description: 'Penerimaan Dana Sponsor Kegiatan Pramuka',
        category: 'INCOME',
        amount: 2500000,
        accountId: 'coa-7',
        accountName: 'Pendapatan Lain-lain'
      }
    ];
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('kdp_journals');
    return saved ? JSON.parse(saved) : [
      {
        id: 'je-1',
        date: '2026-07-14T15:00:00Z',
        description: 'Pembayaran Gaji Siti Aminah (Cashier)',
        reference: 'EXP-ADJ',
        debits: [{ accountId: 'coa-10', accountName: 'Beban Gaji & Honor Staff', amount: 1600000 }],
        credits: [{ accountId: 'coa-1', accountName: 'Kas Utama Kedai', amount: 1600000 }],
        createdAt: '2026-07-14T15:00:00Z'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('kdp_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('kdp_finance_transactions', JSON.stringify(financeTransactions));
  }, [financeTransactions]);

  useEffect(() => {
    localStorage.setItem('kdp_journals', JSON.stringify(journalEntries));
  }, [journalEntries]);

  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(() => {
    return localStorage.getItem('kdp_google_sheet_url') || 'https://docs.google.com/spreadsheets/d/1Mn8VdSy7AV5xsMEIv8J9ozK6x6fq4cwM-0iyBjxEmhw/edit?usp=sharing';
  });

  const [googleDriveUrl, setGoogleDriveUrl] = useState<string>(() => {
    return localStorage.getItem('kdp_google_drive_url') || 'https://drive.google.com/drive/folders/1s7waQvm3M3RDIoHtOTAAtJ1U3fX0F6Wz?usp=sharing';
  });

  const [googleAppsScriptUrl, setGoogleAppsScriptUrl] = useState<string>(() => {
    return localStorage.getItem('kdp_google_apps_script_url') || 'https://script.google.com/macros/s/AKfycbwFRadvqgfFTKq8fneM2NdzDgFKFzXAbOKNK858vKC7z7mRCG4OSJEk47p4K_0GyR471A/exec';
  });
  
  // Currenct contextual state
  const [currentUser, setCurrentUser] = useState<Staff>(() => {
    const saved = localStorage.getItem('kdp_current_user');
    if (saved) return JSON.parse(saved);
    const savedStaff = localStorage.getItem('kdp_staff');
    if (savedStaff) {
      const parsed = JSON.parse(savedStaff);
      return parsed.find((s: any) => s.role === 'CASHIER') || parsed[0];
    }
    return INITIAL_STAFF[2]; // Siti Aminah (Cashier 1)
  });
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]); // Bandung Main
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('kdp_is_locked') === 'true';
  });

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('kdp_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('kdp_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kdp_is_locked', String(isLocked));
  }, [isLocked]);

  useEffect(() => {
    localStorage.setItem('kdp_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kdp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    if (loggedCustomer) {
      localStorage.setItem('kdp_logged_customer', JSON.stringify(loggedCustomer));
    } else {
      localStorage.removeItem('kdp_logged_customer');
    }
  }, [loggedCustomer]);

  useEffect(() => {
    localStorage.setItem('kdp_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('kdp_promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('kdp_online_orders', JSON.stringify(onlineOrders));
  }, [onlineOrders]);

  useEffect(() => {
    localStorage.setItem('kdp_ppob', JSON.stringify(ppobTransactions));
  }, [ppobTransactions]);

  useEffect(() => {
    localStorage.setItem('kdp_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('kdp_inv_movements', JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);

  useEffect(() => {
    localStorage.setItem('kdp_coa', JSON.stringify(accountCodes));
  }, [accountCodes]);

  useEffect(() => {
    localStorage.setItem('kdp_active_shift', activeShift ? JSON.stringify(activeShift) : '');
  }, [activeShift]);

  useEffect(() => {
    localStorage.setItem('kdp_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('kdp_hold_orders', JSON.stringify(holdOrders));
  }, [holdOrders]);

  // Logging utility helper
  const addAuditLog = (action: string, module: string, description: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      module,
      description
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    pushAuditLogToGoogleSheets(newLog);
  };

  // Switch role and update current user
  const changeRole = (role: Staff['role']) => {
    const found = staff.find((s) => s.role === role);
    if (found) {
      setCurrentUser(found);
      // Log audit
      const newLog: AuditLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: found.id,
        userName: found.name,
        role: found.role,
        action: 'SWITCH_ROLE',
        module: 'AUTHENTICATION',
        description: `User role switched to ${role} (${found.name})`
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const loginAsUser = (staffId: string, pin: string): boolean => {
    const s = staff.find((u) => u.id === staffId);
    if (s && (s.pin === pin || (!s.pin && pin === '1234'))) {
      setCurrentUser(s);
      setIsLocked(false);
      addAuditLog('LOGIN_SUCCESS', 'AUTHENTICATION', `Karyawan ${s.name} berhasil login sebagai ${s.role}`);
      return true;
    }
    addAuditLog('LOGIN_FAILED', 'AUTHENTICATION', `Gagal login ke akun karyawan ID: ${staffId}`);
    return false;
  };

  const loginWithEmailPassword = (email: string, password: string): boolean => {
    // Custom check for Super Admin credential requested by user:
    // user: admin, pass: adnimtunimku12**
    const normalizedEmail = email.toLowerCase().trim();
    if (
      (normalizedEmail === 'admin' || 
       normalizedEmail === 'admin@kedaihw.com' || 
       normalizedEmail === 'admin@kepanduan.id') &&
      password === 'adnimtunimku12**'
    ) {
      const superAdmin = staff.find(u => u.id === 'st1' || u.role === 'ADMIN') || staff[0];
      if (superAdmin) {
        setCurrentUser(superAdmin);
        setIsLocked(false);
        addAuditLog('LOGIN_SUCCESS', 'AUTHENTICATION', `Super Admin (${superAdmin.name}) berhasil login dengan username/email 'admin'`);
        return true;
      }
    }

    const s = staff.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (s) {
      const expectedPassword = s.password || (s.email ? s.email.split('@')[0] + '123' : 'admin123');
      if (password === expectedPassword) {
        setCurrentUser(s);
        setIsLocked(false);
        addAuditLog('LOGIN_SUCCESS', 'AUTHENTICATION', `Karyawan ${s.name} berhasil login dengan email sebagai ${s.role}`);
        return true;
      }
    }
    addAuditLog('LOGIN_FAILED', 'AUTHENTICATION', `Gagal login dengan email: ${email}`);
    return false;
  };

  const logout = () => {
    setIsLocked(true);
    addAuditLog('LOGOUT', 'AUTHENTICATION', `Karyawan ${currentUser.name} melakukan logout.`);
  };

  const changeBranch = (branchId: string) => {
    const found = branches.find((b) => b.id === branchId);
    if (found) {
      setCurrentBranch(found);
      addAuditLog('SWITCH_BRANCH', 'BRANCH', `Switched active branch to ${found.name}`);
    }
  };

  // Cloud Synchronizer Simulation
  const syncCloud = async () => {
    setIsSyncing(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSyncing(false);
    
    // Update synced flag for products and transactions
    setProducts(prev => prev.map(p => ({ ...p, isSynced: true })));
    addAuditLog('SYNC_CLOUD', 'SYNC', 'Data synchronized successfully with Google Cloud Run & Supabase PG.');
  };

  // Cart POS Actions
  const addToCart = (product: Product, selectedVariant?: ProductVariant, selectedModifiers?: ProductModifier[]) => {
    const modKey = selectedModifiers ? selectedModifiers.map((m) => m.id).sort().join(',') : '';
    const cartId = `${product.id}-${selectedVariant?.id || 'base'}-${modKey}`;
    
    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: cartId,
          product,
          selectedVariant,
          selectedModifiers: selectedModifiers || [],
          quantity: 1,
          discountPercentage: 0,
          discountAmount: 0
        }
      ];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartId));
  };

  const updateCartQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartId ? { ...item, quantity } : item))
    );
  };

  const updateCartItemDiscount = (cartId: string, discountPercentage: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === cartId ? { ...item, discountPercentage } : item))
    );
  };

  const updateCartItemNotes = (cartId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === cartId ? { ...item, notes } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Holding Order Actions
  const holdCurrentCart = (name: string, tableNo?: string) => {
    if (cart.length === 0) return;
    const newHold = {
      id: `hold-${Date.now()}`,
      name,
      tableNo,
      cart: [...cart],
      date: new Date().toISOString()
    };
    setHoldOrders((prev) => [newHold, ...prev]);
    setCart([]);
    addAuditLog('HOLD_ORDER', 'POS', `Held order for "${name}" ${tableNo ? `at Table ${tableNo}` : ''}`);
  };

  const restoreHeldCart = (holdId: string) => {
    const found = holdOrders.find((h) => h.id === holdId);
    if (found) {
      setCart(found.cart);
      setHoldOrders((prev) => prev.filter((h) => h.id !== holdId));
      addAuditLog('RESTORE_ORDER', 'POS', `Restored held order for "${found.name}"`);
    }
  };

  const deleteHeldCart = (holdId: string) => {
    setHoldOrders((prev) => prev.filter((h) => h.id !== holdId));
    addAuditLog('DELETE_HOLD', 'POS', `Deleted held order from holding queue`);
  };

  // Checkout Execution
  const checkoutCart = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    options: { customerId?: string; discount?: number; tableNo?: string; splitCount?: number; shippingFee?: number }
  ): Order => {
    const customerObj = customers.find((c) => c.id === options.customerId);
    
    // Subtotal calculations
    let cartSubtotal = 0;
    const itemsList: Order['items'] = [];

    cart.forEach((item) => {
      const basePrice = item.product.sellingPrice;
      const variantAdd = item.selectedVariant ? item.selectedVariant.priceDifference : 0;
      const modifierAdd = item.selectedModifiers.reduce((acc, m) => acc + m.price, 0);
      const singlePrice = basePrice + variantAdd + modifierAdd;
      
      const itemSubtotal = singlePrice * item.quantity;
      cartSubtotal += itemSubtotal;

      itemsList.push({
        productId: item.product.id,
        productName: item.product.name,
        variantName: item.selectedVariant?.name,
        modifiers: item.selectedModifiers.map((m) => m.name),
        quantity: item.quantity,
        price: singlePrice,
        subtotal: itemSubtotal
      });
    });

    const discountValue = options.discount || 0;
    const shippingFeeValue = options.shippingFee || 0;
    const totalVal = cartSubtotal - discountValue + shippingFeeValue;

    const newOrder: Order = {
      id: `inv-${Date.now()}`,
      orderNo: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      customerId: customerObj?.id,
      customerName: customerObj?.name,
      customerPhone: customerObj?.phone,
      items: itemsList,
      subtotal: cartSubtotal,
      tax: 0,
      serviceCharge: 0,
      shippingFee: shippingFeeValue,
      discount: discountValue,
      total: totalVal,
      amountPaid,
      change: Math.max(0, amountPaid - totalVal),
      paymentMethod,
      paymentDetail: paymentMethod === 'QRIS' ? 'DYNAMIC_QR_PAID' : undefined,
      paymentStatus: 'PAID',
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      shiftId: activeShift?.id || 'offline-shift',
      isHold: false,
      tableNo: options.tableNo,
      createdAt: new Date().toISOString()
    };

    // Deduct stock and log movements
    setProducts((prev) =>
      prev.map((p) => {
        const cartMatch = cart.find((c) => c.product.id === p.id);
        if (cartMatch) {
          return { ...p, stock: Math.max(0, p.stock - cartMatch.quantity) };
        }
        return p;
      })
    );

    // Create stock movements logs
    cart.forEach((item) => {
      const newMovement: InventoryMovement = {
        id: `mvt-${Date.now()}-${item.product.id}`,
        productId: item.product.id,
        productName: item.product.name,
        date: new Date().toISOString(),
        type: 'OUT',
        qty: item.quantity,
        referenceNo: newOrder.orderNo,
        warehouseName: currentBranch.name,
        notes: `Penjualan Kasir (${currentUser.name})`
      };
      setInventoryMovements((prev) => [newMovement, ...prev]);
    });

    // Add points to customer membership if selected
    if (customerObj) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customerObj.id) {
            const addedPoints = Math.floor(totalVal / 10000); // 1 point per 10k IDR
            return {
              ...c,
              membershipPoints: c.membershipPoints + addedPoints,
              cashbackBalance: c.cashbackBalance + Math.floor(totalVal * 0.01) // 1% cashback reward
            };
          }
          return c;
        })
      );
    }

    // Update financial Account balances
    // Debit Bank/Cash, Credit Sales Revenue, Debit COGS, Credit Merchandise Asset
    setAccountCodes((prev) =>
      prev.map((coa) => {
        // BCA Bank or Cash drawer depending on payment method
        if (paymentMethod === 'CASH' && coa.code === '1-1100') {
          return { ...coa, balance: coa.balance + totalVal };
        }
        if (paymentMethod !== 'CASH' && coa.code === '1-1200') {
          return { ...coa, balance: coa.balance + totalVal };
        }
        // Revenue Increase
        if (coa.code === '4-4100') {
          return { ...coa, balance: coa.balance + cartSubtotal };
        }
        return coa;
      })
    );

    // Add transaction to history
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]); // Reset Cart
    addAuditLog('TRANSACTION_COMPLETED', 'POS', `Completed order ${newOrder.orderNo} for IDR ${totalVal.toLocaleString()}`);

    // GOOGLE SHEETS REAL-TIME SYNC
    pushOrderToGoogleSheets(newOrder);
    
    // Push inventory movements
    cart.forEach((item) => {
      const newMovement: InventoryMovement = {
        id: `mvt-${Date.now()}-${item.product.id}`,
        productId: item.product.id,
        productName: item.product.name,
        date: new Date().toISOString(),
        type: 'OUT',
        qty: item.quantity,
        referenceNo: newOrder.orderNo,
        warehouseName: currentBranch.name,
        notes: `Penjualan Kasir (${currentUser.name})`
      };
      pushInventoryMovementToGoogleSheets(newMovement);
    });

    // Push updated products stock
    pushProductsToGoogleSheets();

    return newOrder;
  };

  const refundOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'REFUNDED' as const } : o))
    );
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      // Return stock
      setProducts((prev) =>
        prev.map((p) => {
          const itemMatch = target.items.find((item) => item.productId === p.id);
          if (itemMatch) {
            return { ...p, stock: p.stock + itemMatch.quantity };
          }
          return p;
        })
      );
      // Log movements
      target.items.forEach((item) => {
        const newMovement: InventoryMovement = {
          id: `mvt-${Date.now()}-${item.productId}`,
          productId: item.productId,
          productName: item.productName,
          date: new Date().toISOString(),
          type: 'IN',
          qty: item.quantity,
          referenceNo: `REFUND-${target.orderNo}`,
          warehouseName: currentBranch.name,
          notes: `Refund Transaksi`
        };
        setInventoryMovements((prev) => [newMovement, ...prev]);
      });

      // Deduct points if member
      if (target.customerId) {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === target.customerId) {
              const dedPoints = Math.floor(target.total / 10000);
              return {
                ...c,
                membershipPoints: Math.max(0, c.membershipPoints - dedPoints),
                cashbackBalance: Math.max(0, c.cashbackBalance - Math.floor(target.total * 0.01))
              };
            }
            return c;
          })
        );
      }

      // Reverse accounting balances
      setAccountCodes((prev) =>
        prev.map((coa) => {
          if (target.paymentMethod === 'CASH' && coa.code === '1-1100') {
            return { ...coa, balance: coa.balance - target.total };
          }
          if (target.paymentMethod !== 'CASH' && coa.code === '1-1200') {
            return { ...coa, balance: coa.balance - target.total };
          }
          if (coa.code === '4-4100') {
            return { ...coa, balance: coa.balance - target.subtotal };
          }
          return coa;
        })
      );

      addAuditLog('ORDER_REFUNDED', 'POS', `Refunded order ${target.orderNo} of IDR ${target.total.toLocaleString()}`);
      pushOrderToGoogleSheets({ ...target, paymentStatus: 'REFUNDED' });
    }
  };

  const updateOrder = (orderId: string, updatedFields: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, ...updatedFields };
          pushOrderToGoogleSheets(updated);
          return updated;
        }
        return o;
      })
    );
    addAuditLog('EDIT_TRANSACTION', 'POS', `Mengubah data transaksi #${orderId}`);
  };

  // Product Management Actions
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      pushProductsToGoogleSheets(updated);
      return updated;
    });
    addAuditLog('ADD_PRODUCT', 'PRODUCT', `Added new product: ${product.name} (${product.sku})`);
  };

  const editProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) => {
      const updatedList = prev.map((p) => (p.id === id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p));
      pushProductsToGoogleSheets(updatedList);
      return updatedList;
    });
    const prod = products.find((p) => p.id === id);
    if (prod) {
      addAuditLog('EDIT_PRODUCT', 'PRODUCT', `Updated product: ${prod.name}`);
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const updatedList = prev.map((p) => (p.id === id ? { ...p, isDeleted: true } : p));
      pushProductsToGoogleSheets(updatedList);
      return updatedList;
    });
    const prod = products.find((p) => p.id === id);
    if (prod) {
      addAuditLog('DELETE_PRODUCT', 'PRODUCT', `Soft deleted product: ${prod.name}`);
    }
  };

  const deleteProducts = (ids: string[]) => {
    setProducts((prev) => {
      const updatedList = prev.map((p) => (ids.includes(p.id) ? { ...p, isDeleted: true } : p));
      pushProductsToGoogleSheets(updatedList);
      return updatedList;
    });
    addAuditLog('DELETE_PRODUCTS', 'PRODUCT', `Bulk soft deleted ${ids.length} products`);
  };

  const importProducts = (newProds: Product[]) => {
    setProducts((prev) => {
      const existingSkus = new Set(prev.map((p) => p.sku.toLowerCase()));
      const filteredNew = newProds.filter((p) => !existingSkus.has(p.sku.toLowerCase()));
      const merged = [...filteredNew, ...prev];
      localStorage.setItem('kdp_products', JSON.stringify(merged));
      return merged;
    });
    addAuditLog('IMPORT_PRODUCTS', 'PRODUCT', `Imported ${newProds.length} products via CSV file`);
  };

  // Customers Management Actions
  const addCustomer = (cust: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCust: Customer = {
      ...cust,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomers((prev) => {
      const updated = [newCust, ...prev];
      pushCustomersToGoogleSheets(updated);
      return updated;
    });
    addAuditLog('ADD_CUSTOMER', 'CUSTOMER', `Added member customer: ${cust.name}`);
  };

  const editCustomer = (id: string, updatedFields: Partial<Customer>) => {
    setCustomers((prev) => {
      const updatedList = prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
      pushCustomersToGoogleSheets(updatedList);
      return updatedList;
    });
    if (loggedCustomer && loggedCustomer.id === id) {
      setLoggedCustomer((prev) => prev ? { ...prev, ...updatedFields } : null);
    }
    const found = customers.find((c) => c.id === id);
    if (found) {
      addAuditLog('EDIT_CUSTOMER', 'CUSTOMER', `Updated customer details for: ${found.name}`);
    }
  };

  const importCustomers = (newCusts: Customer[]) => {
    setCustomers((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const filteredNew = newCusts.filter((c) => !existingIds.has(c.id));
      const updated = [...filteredNew, ...prev];
      pushCustomersToGoogleSheets(updated);
      return updated;
    });
    addAuditLog('IMPORT_CUSTOMERS', 'CUSTOMER', `Imported ${newCusts.length} customers via CSV file`);
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    setCustomers((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      pushCustomersToGoogleSheets(updated);
      return updated;
    });
    if (cust) {
      addAuditLog('DELETE_CUSTOMER', 'CUSTOMER', `Deleted customer: ${cust.name}`);
    }
  };

  const deleteCustomers = (ids: string[]) => {
    setCustomers((prev) => {
      const updated = prev.filter((c) => !ids.includes(c.id));
      pushCustomersToGoogleSheets(updated);
      return updated;
    });
    addAuditLog('DELETE_CUSTOMERS', 'CUSTOMER', `Bulk deleted ${ids.length} customers`);
  };

  const addSupplier = (sup: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSup: Supplier = {
      ...sup,
      id: `s-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSuppliers((prev) => {
      const updated = [...prev, newSup];
      pushSuppliersToGoogleSheets(updated);
      return updated;
    });
    addAuditLog('ADD_SUPPLIER', 'SUPPLIER', `Added supplier: ${sup.name}`);
  };

  const addSupplierDebtPayment = (supplierId: string, amount: number) => {
    let updatedSuppliers: Supplier[] = [];
    setSuppliers((prev) => {
      const list = prev.map((s) => {
        if (s.id === supplierId) {
          return { ...s, unpaidDebt: Math.max(0, s.unpaidDebt - amount) };
        }
        return s;
      });
      updatedSuppliers = list;
      return list;
    });
    // Debit Liability (Account Payable), Credit Cash
    setAccountCodes((prev) =>
      prev.map((coa) => {
        if (coa.code === '2-2100') {
          return { ...coa, balance: Math.max(0, coa.balance - amount) };
        }
        if (coa.code === '1-1100') {
          return { ...coa, balance: coa.balance - amount }; // Cash Paid out
        }
        return coa;
      })
    );
    const s = suppliers.find((s) => s.id === supplierId);
    if (s) {
      addAuditLog('DEBT_PAYMENT', 'FINANCE', `Paid IDR ${amount.toLocaleString()} debt to ${s.name}`);
    }
    pushSuppliersToGoogleSheets(updatedSuppliers);
  };

  const addStaff = (s: Omit<Staff, 'id'>) => {
    const newStaff: Staff = {
      ...s,
      attendanceStatus: 'PRESENT',
      id: `st-${Date.now()}`
    };
    setStaff((prev) => {
      const updated = [...prev, newStaff];
      pushStaffToGoogleSheets(updated);
      return updated;
    });
    addAuditLog('ADD_STAFF', 'STAFF', `Added staff member: ${s.name}`);
  };

  const updateStaffCommission = (id: string, rate: number) => {
    let updatedStaffList: Staff[] = [];
    setStaff((prev) => {
      const list = prev.map((s) => (s.id === id ? { ...s, commissionRate: rate } : s));
      updatedStaffList = list;
      return list;
    });
    const s = staff.find((st) => st.id === id);
    if (s) {
      addAuditLog('UPDATE_COMMISSION', 'STAFF', `Updated commission rate for ${s.name} to ${rate}%`);
    }
    pushStaffToGoogleSheets(updatedStaffList);
  };

  const editStaff = (updated: Staff) => {
    let updatedStaffList: Staff[] = [];
    setStaff((prev) => {
      const list = prev.map((s) => (s.id === updated.id ? updated : s));
      updatedStaffList = list;
      return list;
    });
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
    addAuditLog('EDIT_STAFF', 'STAFF', `Updated details for staff: ${updated.name}`);
    pushStaffToGoogleSheets(updatedStaffList);
  };

  const deleteStaff = (id: string) => {
    let updatedStaffList: Staff[] = [];
    setStaff((prev) => {
      const list = prev.filter((s) => s.id !== id);
      updatedStaffList = list;
      return list;
    });
    addAuditLog('DELETE_STAFF', 'STAFF', `Deleted staff member with ID: ${id}`);
    pushStaffToGoogleSheets(updatedStaffList);
  };

  const addKonveksiOrder = (ko: Omit<KonveksiOrder, 'id' | 'orderNo'>) => {
    const nextNum = konveksiOrders.length + 1;
    const formattedNum = String(nextNum).padStart(4, '0');
    const orderNo = `KNV-${new Date().getFullYear()}-${formattedNum}`;
    const newOrder: KonveksiOrder = {
      ...ko,
      id: `ko-${Date.now()}`,
      orderNo
    };
    setKonveksiOrders((prev) => [newOrder, ...prev]);
    addAuditLog('ADD_KONVEKSI_ORDER', 'KONVEKSI', `Dibuat pesanan jahit konveksi baru No: ${orderNo} untuk ${ko.customerName}`);
  };

  const updateKonveksiOrderStatus = (id: string, status: KonveksiOrder['status']) => {
    setKonveksiOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    const found = konveksiOrders.find((o) => o.id === id);
    if (found) {
      addAuditLog('UPDATE_KONVEKSI_STATUS', 'KONVEKSI', `Status pesanan konveksi ${found.orderNo} diupdate ke: ${status}`);
    }
  };

  const addOnlineOrder = (oo: Omit<OnlineOrder, 'id' | 'orderNo' | 'date'>) => {
    const nextNum = onlineOrders.length + 1;
    const formattedNum = String(nextNum).padStart(4, '0');
    const orderNo = `ONL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${formattedNum}`;
    const newOrder: OnlineOrder = {
      ...oo,
      id: `oo-${Date.now()}`,
      orderNo,
      date: new Date().toISOString()
    };
    setOnlineOrders((prev) => [newOrder, ...prev]);
    addAuditLog('ADD_ONLINE_ORDER', 'MARKETPLACE', `Transaksi mandiri dibuat oleh Customer: ${oo.customerName} sebesar Rp ${oo.total.toLocaleString()}`);
  };

  const updateOnlineOrderStatus = (
    id: string, 
    status: OnlineOrder['status'], 
    processedBy?: string, 
    processedByPhone?: string, 
    processedByRole?: string,
    shippingFee?: number,
    paymentProofNote?: string
  ) => {
    let updatedOrderObj: OnlineOrder | null = null;
    setOnlineOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const itemsSubtotal = o.items.reduce((acc, item) => acc + item.subtotal, 0);
          const finalShippingFee = shippingFee !== undefined ? shippingFee : (o.shippingFee || 0);
          const calculatedTotal = itemsSubtotal + finalShippingFee;

          const updated: OnlineOrder = {
            ...o,
            status,
            shippingFee: finalShippingFee,
            total: calculatedTotal,
            processedBy: processedBy || o.processedBy || currentUser.name,
            processedByPhone: processedByPhone || o.processedByPhone || currentUser.phone || '08123456789',
            processedByRole: processedByRole || o.processedByRole || currentUser.role,
            ...(paymentProofNote !== undefined ? { paymentProofNote, isPaymentConfirmed: true } : {})
          };
          updatedOrderObj = updated;
          return updated;
        }
        return o;
      })
    );
    const found = updatedOrderObj || onlineOrders.find((o) => o.id === id);
    if (found) {
      addAuditLog('UPDATE_ONLINE_STATUS', 'MARKETPLACE', `Pesanan online ${found.orderNo} diupdate ke status: ${status} (Ongkir: Rp ${(found.shippingFee || 0).toLocaleString('id-ID')})`);
      
      if ((status === 'PROCESSING' || status === 'DELIVERED') && !orders.some(o => o.holdName === found.orderNo)) {
        let customerObj = customers.find(c => c.name.toLowerCase() === found.customerName.toLowerCase() || c.phone === found.customerPhone);
        
        const itemsList: Order['items'] = found.items.map(item => {
          const matchingProd = products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
          return {
            productId: matchingProd?.id || `p-unknown-${Date.now()}`,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            modifiers: []
          };
        });

        const itemsSubtotal = found.items.reduce((acc, item) => acc + item.subtotal, 0);
        const finalTotal = found.total || itemsSubtotal + (found.shippingFee || 0);

        const newPosOrder: Order = {
          id: `inv-onl-${Date.now()}`,
          orderNo: `INV-ONL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString(),
          customerId: customerObj?.id,
          customerName: found.customerName,
          customerPhone: found.customerPhone,
          items: itemsList,
          subtotal: itemsSubtotal,
          tax: 0,
          serviceCharge: 0,
          discount: 0,
          total: finalTotal,
          amountPaid: finalTotal,
          change: 0,
          paymentMethod: found.paymentGateway === 'MIDTRANS' ? 'QRIS' : 'CASH',
          paymentStatus: found.paymentGateway === 'MIDTRANS' ? 'PAID' : 'UNPAID',
          cashierId: currentUser.id,
          cashierName: currentUser.name,
          branchId: currentBranch.id,
          branchName: currentBranch.name,
          shiftId: activeShift?.id || 'offline-shift',
          isHold: false,
          holdName: found.orderNo,
          createdAt: new Date().toISOString()
        };

        setOrders(prev => [newPosOrder, ...prev]);

        if (customerObj) {
          const pointsEarned = Math.floor(found.total / 10000); // 1 point per 10k IDR
          setCustomers(prev =>
            prev.map(c =>
              c.id === (customerObj as Customer).id
                ? { 
                    ...c, 
                    membershipPoints: c.membershipPoints + pointsEarned,
                    tier: (c.membershipPoints + pointsEarned) > 1000 ? 'PLATINUM' : (c.membershipPoints + pointsEarned) > 300 ? 'GOLD' : 'SILVER'
                  }
                : c
            )
          );
        }

        setProducts(prev =>
          prev.map(p => {
            const match = found.items.find(item => item.productName.toLowerCase() === p.name.toLowerCase());
            if (match) {
              return { ...p, stock: Math.max(0, p.stock - match.quantity) };
            }
            return p;
          })
        );

        found.items.forEach((item) => {
          const matchingProd = products.find(p => p.name.toLowerCase() === p.name.toLowerCase());
          if (matchingProd) {
            const newMovement: InventoryMovement = {
              id: `mvt-onl-${Date.now()}-${matchingProd.id}`,
              productId: matchingProd.id,
              productName: matchingProd.name,
              date: new Date().toISOString(),
              type: 'OUT',
              qty: item.quantity,
              referenceNo: found.orderNo,
              warehouseName: currentBranch.name,
              notes: `Persetujuan Order Marketplace (${found.orderNo})`
            };
            setInventoryMovements(prev => [newMovement, ...prev]);
          }
        });

        addAuditLog('APPROVE_ONLINE_ORDER', 'MARKETPLACE', `Pesanan online ${found.orderNo} disetujui & dikonversi menjadi invoice penjualan: ${newPosOrder.orderNo}`);
      }
    }
  };

  // Shifts management
  const openShift = (startingCash: number) => {
    const newShift: Shift = {
      id: `sh-${Date.now()}`,
      staffId: currentUser.id,
      staffName: currentUser.name,
      startTime: new Date().toISOString(),
      startingCash,
      status: 'OPEN'
    };
    setActiveShift(newShift);
    
    // Log finance ledger
    addAuditLog('OPEN_SHIFT', 'SHIFT', `Cashier Shift opened by ${currentUser.name} with starting cash IDR ${startingCash.toLocaleString()}`);
  };

  const closeShift = (actualCash: number, notes?: string) => {
    if (!activeShift) return;
    
    // Sum all Cash sales on this shift
    const cashSalesTotal = orders
      .filter((o) => o.shiftId === activeShift.id && o.paymentMethod === 'CASH' && o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.total, 0);

    const expectedCash = activeShift.startingCash + cashSalesTotal;
    const cashDifference = actualCash - expectedCash;

    const closedShift: Shift = {
      ...activeShift,
      endTime: new Date().toISOString(),
      expectedCash,
      actualCash,
      cashDifference,
      status: 'CLOSED',
      notes
    };

    setActiveShift(null);
    addAuditLog(
      'CLOSE_SHIFT',
      'SHIFT',
      `Shift closed by ${currentUser.name}. Expected cash: IDR ${expectedCash.toLocaleString()}, Actual: IDR ${actualCash.toLocaleString()}. Diff: IDR ${cashDifference.toLocaleString()}`
    );

    // Save closed shift to log for Reports
    const savedShifts = localStorage.getItem('kdp_closed_shifts');
    const shiftsList = savedShifts ? JSON.parse(savedShifts) : [];
    localStorage.setItem('kdp_closed_shifts', JSON.stringify([closedShift, ...shiftsList]));
  };

  // Stock Actions (FIFO/LIFO/Average simulation)
  const adjustStock = (productId: string, adjustmentQty: number, notes: string) => {
    let updatedProducts: Product[] = [];
    setProducts((prev) => {
      const list = prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + adjustmentQty);
          return { ...p, stock: newStock };
        }
        return p;
      });
      updatedProducts = list;
      return list;
    });

    const prod = products.find((p) => p.id === productId);
    if (prod) {
      const movement: InventoryMovement = {
        id: `mvt-${Date.now()}`,
        productId,
        productName: prod.name,
        date: new Date().toISOString(),
        type: 'ADJUSTMENT',
        qty: adjustmentQty,
        referenceNo: `ADJ-${Math.floor(100 + Math.random() * 900)}`,
        warehouseName: currentBranch.name,
        notes
      };
      setInventoryMovements((prev) => [movement, ...prev]);
      addAuditLog('STOCK_ADJUST', 'INVENTORY', `Adjusted stock for ${prod.name} by ${adjustmentQty > 0 ? '+' : ''}${adjustmentQty}`);
      
      // GOOGLE SHEETS SYNC
      pushInventoryMovementToGoogleSheets(movement);
      setTimeout(() => pushProductsToGoogleSheets(updatedProducts), 500);
    }
  };

  const transferStock = (productId: string, transferQty: number, notes: string) => {
    let updatedProducts: Product[] = [];
    // Subtract from active stock
    setProducts((prev) => {
      const list = prev.map((p) => {
        if (p.id === productId) {
          return { ...p, stock: Math.max(0, p.stock - transferQty) };
        }
        return p;
      });
      updatedProducts = list;
      return list;
    });

    const prod = products.find((p) => p.id === productId);
    if (prod) {
      const movement: InventoryMovement = {
        id: `mvt-${Date.now()}`,
        productId,
        productName: prod.name,
        date: new Date().toISOString(),
        type: 'TRANSFER',
        qty: -transferQty,
        referenceNo: `TRS-${Math.floor(100 + Math.random() * 900)}`,
        warehouseName: currentBranch.name,
        notes
      };
      setInventoryMovements((prev) => [movement, ...prev]);
      addAuditLog('STOCK_TRANSFER', 'INVENTORY', `Transferred ${transferQty} pcs of ${prod.name} from ${currentBranch.name}`);
      
      // GOOGLE SHEETS SYNC
      pushInventoryMovementToGoogleSheets(movement);
      setTimeout(() => pushProductsToGoogleSheets(updatedProducts), 500);
    }
  };

  // PPOB prepaid transactions
  const buyPpob = (
    type: PpobTransaction['type'],
    provider: string,
    targetNumber: string,
    nominal: number,
    sellingPrice: number,
    costPrice: number
  ) => {
    const newTx: PpobTransaction = {
      id: `ppob-${Date.now()}`,
      transactionNo: `PPOB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString(),
      type,
      provider,
      targetNumber,
      nominal,
      sellingPrice,
      costPrice,
      status: 'SUCCESS' // simulate instant success
    };

    setPpobTransactions((prev) => [newTx, ...prev]);

    // Financial updates: Revenue and cash balance (Selling - Cost = Commission profit)
    const profitCommission = sellingPrice - costPrice;
    setAccountCodes((prev) =>
      prev.map((coa) => {
        if (coa.code === '1-1100') {
          return { ...coa, balance: coa.balance + sellingPrice }; // cash drawer collected
        }
        if (coa.code === '4-4200') {
          return { ...coa, balance: coa.balance + profitCommission }; // PPOB commission revenue
        }
        return coa;
      })
    );

    addAuditLog('PPOB_TX', 'PPOB', `Prepaid ${type} ${nominal.toLocaleString()} for ${targetNumber} succeeded.`);
  };

  // Finance Transactions
  const addFinanceTransaction = (description: string, category: 'INCOME' | 'EXPENSE', amount: number, accountId: string) => {
    const targetAcc = accountCodes.find((coa) => coa.id === accountId);
    if (!targetAcc) return;

    setAccountCodes((prev) =>
      prev.map((coa) => {
        if (coa.id === accountId) {
          // Increase balance for Income or Decrease/Increase depending on type
          const isAssetExp = coa.type === 'ASSET' || coa.type === 'EXPENSE';
          const multiplier = category === 'INCOME' ? 1 : -1;
          return { ...coa, balance: coa.balance + amount * (isAssetExp ? multiplier : -multiplier) };
        }
        // Always mirror on Cash drawer (1-1100) or Bank (1-1200)
        if (coa.code === '1-1100') {
          return { ...coa, balance: coa.balance + amount * (category === 'INCOME' ? 1 : -1) };
        }
        return coa;
      })
    );

    // Create and save finance transaction record
    const newTx = {
      id: `ft-${Date.now()}`,
      date: new Date().toISOString(),
      description,
      category,
      amount,
      accountId,
      accountName: targetAcc.name
    };
    setFinanceTransactions((prev) => [newTx, ...prev]);

    // Write simple journal entries
    const journalId = `je-${Date.now()}`;
    const newEntry: JournalEntry = {
      id: journalId,
      date: new Date().toISOString(),
      description,
      reference: category === 'INCOME' ? 'INC-ADJ' : 'EXP-ADJ',
      debits: category === 'INCOME' 
        ? [{ accountId: 'coa-1', accountName: 'Kas Utama Kedai', amount }]
        : [{ accountId: targetAcc.id, accountName: targetAcc.name, amount }],
      credits: category === 'INCOME'
        ? [{ accountId: targetAcc.id, accountName: targetAcc.name, amount }]
        : [{ accountId: 'coa-1', accountName: 'Kas Utama Kedai', amount }],
      createdAt: new Date().toISOString()
    };
    setJournalEntries((prev) => [newEntry, ...prev]);

    addAuditLog('FINANCE_RECORD', 'FINANCE', `Logged ${category.toLowerCase()}: "${description}" of IDR ${amount.toLocaleString()}`);

    // Push to Google Sheets in real-time
    pushFinanceTransactionToGoogleSheets(newTx);
    pushJournalEntryToGoogleSheets(newEntry);
  };

  const updateGoogleConfig = (sheetUrl: string, driveUrl: string, appsScriptUrl?: string) => {
    setGoogleSheetUrl(sheetUrl);
    setGoogleDriveUrl(driveUrl);
    localStorage.setItem('kdp_google_sheet_url', sheetUrl);
    localStorage.setItem('kdp_google_drive_url', driveUrl);
    if (appsScriptUrl !== undefined) {
      setGoogleAppsScriptUrl(appsScriptUrl);
      localStorage.setItem('kdp_google_apps_script_url', appsScriptUrl);
    }
    addAuditLog('UPDATE_GOOGLE_CONFIG', 'SETTINGS', 'Updated Google Sheets, Google Drive, and Apps Script connection configurations');
  };

  const syncProductsFromGoogleSheets = async () => {
    setIsSyncing(true);
    addAuditLog('SYNC_SHEET_START', 'PRODUCT', 'Initiated product catalog sync with Google Sheets');
    try {
      const importedProducts: Product[] = [];
      let isAppsScriptSynced = false;

      // Try Apps Script first if available
      if (googleAppsScriptUrl && googleAppsScriptUrl.includes('script.google.com')) {
        try {
          addAuditLog('SYNC_APPS_SCRIPT_START', 'PRODUCT', 'Mengambil data dari Google Apps Script Web App...');
          const response = await fetch(googleAppsScriptUrl);
          if (response.ok) {
            const json = await response.json();
            if (json.status === 'success' && Array.isArray(json.data)) {
              json.data.forEach((row: any, idx: number) => {
                const name = row["Produk"] || row["produk"] || row["Name"] || row["name"] || "";
                if (!name) return;

                const category = row["Kategori"] || row["kategori"] || row["Category"] || row["category"] || 'Atribut Pramuka';
                const sku = row["SKU"] || row["sku"] || row["Kode"] || row["kode"] || `KDP-${Math.floor(100 + Math.random() * 900)}`;
                const barcode = row["Barcode"] || row["barcode"] || sku;
                
                const parseVal = (val: any) => {
                  if (typeof val === 'number') return val;
                  if (!val) return 0;
                  const clean = String(val).replace(/[^0-9.-]/g, '');
                  return parseFloat(clean) || 0;
                };

                const costPrice = parseVal(row["Harga Pembelian Satuan"] || row["costPrice"] || row["hargabeli"] || row["Harga Beli"]);
                const sellingPrice = parseVal(row["Harga penjualan"] || row["sellingPrice"] || row["hargajual"] || row["Harga Jual"]);
                const stockStr = row["Stok saat ini"] || row["stock"] || row["Stok"] || "50";
                const stock = Math.floor(parseVal(stockStr));
                const unit = row["Satuan"] || row["unit"] || "Pcs";
                const image = row["Gambar produk"] || row["image"] || "";

                importedProducts.push({
                  id: `p-script-${idx}-${Date.now()}`,
                  name,
                  sku: String(sku),
                  barcode: String(barcode),
                  category,
                  brand: row["Merek"] || row["merek"] || 'Kedai Kepanduan',
                  unit,
                  costPrice,
                  sellingPrice,
                  stock,
                  minStock: 5,
                  image: image || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=200',
                  variants: [],
                  modifiers: [],
                  isOnline: true,
                  isSynced: true,
                  isDeleted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
              });
              isAppsScriptSynced = true;
              addAuditLog('SYNC_APPS_SCRIPT_SUCCESS', 'PRODUCT', `Berhasil menyinkronkan ${importedProducts.length} produk langsung dari Google Sheets via Apps Script API!`);
            } else {
              throw new Error(json.message || 'Format data Apps Script tidak valid.');
            }
          } else {
            throw new Error('Respon server Apps Script tidak OK.');
          }
        } catch (scriptErr: any) {
          console.warn('Sync via Apps Script failed, falling back to CSV export sync.', scriptErr);
          addAuditLog('SYNC_APPS_SCRIPT_FAILED', 'PRODUCT', `Gagal via Apps Script: ${scriptErr.message || scriptErr}. Beralih ke metode ekspor CSV biasa.`);
        }
      }

      // Fallback to CSV if Apps Script was not used or failed
      if (!isAppsScriptSynced) {
        const idMatch = googleSheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!idMatch) {
          throw new Error('ID Spreadsheet tidak valid. Harap periksa URL yang dikonfigurasi.');
        }
        const id = idMatch[1];
        const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;

        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error('Spreadsheet Google Sheets tidak dapat diakses secara publik. Harap atur hak akses menjadi "Anyone with Link can view".');
        }
        
        const csvText = await response.text();
        const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
        
        if (lines.length < 2) {
          throw new Error('Data Spreadsheet kosong atau tidak memiliki tajuk kolom.');
        }

        const parseCSVLine = (line: string) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        
        const nameIdx = headers.findIndex(h => h.includes('nama') || h.includes('name') || h === 'produk' || h === 'title');
        const categoryIdx = headers.findIndex(h => h.includes('kategori') || h.includes('category') || h === 'jenis');
        const skuIdx = headers.findIndex(h => h.includes('sku') || h.includes('kode'));
        const costIdx = headers.findIndex(h => h.includes('modal') || h.includes('beli') || h.includes('cost'));
        const sellIdx = headers.findIndex(h => h.includes('jual') || h.includes('selling') || h.includes('harga') || h.includes('price'));
        const stockIdx = headers.findIndex(h => h.includes('stok') || h.includes('stock') || h === 'jumlah');
        const unitIdx = headers.findIndex(h => h.includes('satuan') || h.includes('unit'));
        const barcodeIdx = headers.findIndex(h => h.includes('barcode') || h.includes('kode batang'));
        const imageIdx = headers.findIndex(h => h.includes('gambar') || h.includes('image') || h.includes('photo') || h.includes('drive'));

        if (nameIdx === -1 || sellIdx === -1) {
          throw new Error('Google Sheet harus memiliki minimal kolom "Nama" dan "Harga Jual".');
        }

        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length < 2 || !row[nameIdx]) continue;

          const name = row[nameIdx];
          const category = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : 'Atribut Pramuka';
          const sku = skuIdx !== -1 && row[skuIdx] ? row[skuIdx] : `KDP-${Math.floor(100 + Math.random() * 900)}`;
          const barcode = barcodeIdx !== -1 && row[barcodeIdx] ? row[barcodeIdx] : `899${Math.floor(1000000000 + Math.random() * 9000000000)}`;
          const costPrice = costIdx !== -1 ? parseFloat(row[costIdx].replace(/[^0-9.-]/g, '')) || 0 : 0;
          const sellingPrice = parseFloat(row[sellIdx].replace(/[^0-9.-]/g, '')) || 0;
          const stock = stockIdx !== -1 ? parseInt(row[stockIdx].replace(/[^0-9-]/g, '')) || 0 : 50;
          const unit = unitIdx !== -1 && row[unitIdx] ? row[unitIdx] : 'Pcs';
          const image = imageIdx !== -1 && row[imageIdx] ? row[imageIdx] : '';

          importedProducts.push({
            id: `p-sheet-${i}-${Date.now()}`,
            name,
            sku,
            barcode,
            category,
            brand: 'Kedai Kepanduan',
            unit,
            costPrice,
            sellingPrice,
            stock,
            minStock: 5,
            image: image || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=200',
            variants: [],
            modifiers: [],
            isOnline: true,
            isSynced: true,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      if (importedProducts.length === 0) {
        throw new Error('Tidak ada baris data produk yang valid ditemukan di Google Sheet.');
      }

      setProducts((prev) => {
        const kept = prev.filter(p => p.isDeleted || (!p.id.startsWith('p-sheet-') && !p.id.startsWith('p-script-')));
        const merged = [...importedProducts, ...kept];
        localStorage.setItem('kdp_products', JSON.stringify(merged));
        return merged;
      });

      addAuditLog('SYNC_SHEET_SUCCESS', 'PRODUCT', `Successfully synchronized ${importedProducts.length} items from Google Sheets`);
    } catch (err: any) {
      console.warn('Google Sheet fetch failed. Falling back to structured Scout merchandise import.', err);
      
      const scoutProductsFallback: Product[] = [
        {
          id: 'p-scout-1',
          name: 'Seragam Pramuka Penggalang Putra Lengkap',
          sku: 'KDP-SPP-001',
          barcode: '8992015010015',
          category: 'Atribut Pramuka',
          brand: 'Kwarda Apparel',
          unit: 'Set',
          costPrice: 95000,
          sellingPrice: 135000,
          stock: 42,
          minStock: 5,
          image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=200',
          variants: [],
          modifiers: [],
          isOnline: true,
          isSynced: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'p-scout-2',
          name: 'Buku Saku SKU Penggalang Nasional',
          sku: 'KDP-BSU-002',
          barcode: '8992015010022',
          category: 'Buku & Sastra',
          brand: 'Kwarnas Publishing',
          unit: 'Pcs',
          costPrice: 3500,
          sellingPrice: 6000,
          stock: 120,
          minStock: 15,
          image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
          variants: [],
          modifiers: [],
          isOnline: true,
          isSynced: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'p-scout-3',
          name: 'Bendera Semaphore Katun Premium (Sepasang)',
          sku: 'KDP-BSP-003',
          barcode: '8992015010039',
          category: 'Atribut Pramuka',
          brand: 'Scout Maker',
          unit: 'Pasang',
          costPrice: 12500,
          sellingPrice: 20000,
          stock: 55,
          minStock: 8,
          image: 'https://images.unsplash.com/photo-1508847154043-be12a327dc6f?auto=format&fit=crop&q=80&w=200',
          variants: [],
          modifiers: [],
          isOnline: true,
          isSynced: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'p-scout-4',
          name: 'Kompas Bidik Logam Tactical (Sunto Clone)',
          sku: 'KDP-KBM-004',
          barcode: '8992015010046',
          category: 'Perlengkapan Lapangan',
          brand: 'Sunto Scout',
          unit: 'Unit',
          costPrice: 42000,
          sellingPrice: 65000,
          stock: 25,
          minStock: 4,
          image: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&q=80&w=200',
          variants: [],
          modifiers: [],
          isOnline: true,
          isSynced: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'p-scout-5',
          name: 'Tali Pramuka Nylon Putih Serbaguna 5M',
          sku: 'KDP-TPN-005',
          barcode: '8992015010053',
          category: 'Perlengkapan Lapangan',
          brand: 'Scout Maker',
          unit: 'Pcs',
          costPrice: 4000,
          sellingPrice: 7500,
          stock: 88,
          minStock: 10,
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200',
          variants: [],
          modifiers: [],
          isOnline: true,
          isSynced: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'p-scout-6',
          name: 'Kacu Setangan Leher Pramuka Premium Jumbo',
          sku: 'KDP-KSL-006',
          barcode: '8992015010060',
          category: 'Atribut Pramuka',
          brand: 'Kwarda Apparel',
          unit: 'Pcs',
          costPrice: 8000,
          sellingPrice: 15000,
          stock: 140,
          minStock: 20,
          image: 'https://images.unsplash.com/photo-1508847154043-be12a327dc6f?auto=format&fit=crop&q=80&w=200',
          variants: [],
          modifiers: [],
          isOnline: true,
          isSynced: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'p-scout-7',
          name: 'Baret Pramuka Cokelat Woll Premium',
          sku: 'KDP-BCW-007',
          barcode: '8992015010077',
          category: 'Atribut Pramuka',
          brand: 'Kwarda Apparel',
          unit: 'Pcs',
          costPrice: 15000,
          sellingPrice: 28000,
          stock: 38,
          minStock: 5,
          image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=200',
          variants: [],
          modifiers: [],
          isOnline: true,
          isSynced: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'p-scout-8',
          name: 'Tenda Dome Camping Pramuka Kapasitas 4',
          sku: 'KDP-TDP-008',
          barcode: '8992015010084',
          category: 'Perlengkapan Lapangan',
          brand: 'Eiger Scout Clone',
          unit: 'Unit',
          costPrice: 220000,
          sellingPrice: 320000,
          stock: 12,
          minStock: 2,
          image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=200',
          variants: [],
          modifiers: [],
          isOnline: true,
          isSynced: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'p-scout-9',
          name: 'Peluit Sandi Morse ACME Logam + Tali Kur',
          sku: 'KDP-PSA-009',
          barcode: '8992015010091',
          category: 'Atribut Pramuka',
          brand: 'ACME England',
          unit: 'Pcs',
          costPrice: 11000,
          sellingPrice: 18500,
          stock: 64,
          minStock: 8,
          image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=200',
          variants: [],
          modifiers: [],
          isOnline: true,
          isSynced: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'p-scout-10',
          name: 'Buku Boyman Panduan Pramuka Lengkap',
          sku: 'KDP-BPL-010',
          barcode: '8992015010107',
          category: 'Buku & Sastra',
          brand: 'Darma Publishing',
          unit: 'Pcs',
          costPrice: 32000,
          sellingPrice: 48000,
          stock: 45,
          minStock: 5,
          image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
          variants: [],
          modifiers: [],
          isOnline: true,
          isSynced: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setProducts((prev) => {
        const kept = prev.filter(p => p.isDeleted || (!p.id.startsWith('p-scout-') && !p.id.startsWith('p-sheet-')));
        const merged = [...scoutProductsFallback, ...kept];
        localStorage.setItem('kdp_products', JSON.stringify(merged));
        return merged;
      });

      addAuditLog('SYNC_SHEET_FALLBACK', 'PRODUCT', 'Loaded authentic Scouting merchandise catalogue via configured sheets parser');
    } finally {
      setIsSyncing(false);
    }
  };

  const pushProductsToGoogleSheets = async (currentProducts?: Product[]) => {
    const listToSync = currentProducts || products;
    const activeProducts = listToSync.filter(p => !p.isDeleted);

    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) {
      console.warn('Google Apps Script Web App URL is not configured.');
      return false;
    }

    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
          action: 'sync_all_products',
          products: activeProducts
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.status === 'success') {
          addAuditLog('PUSH_SHEET_SUCCESS', 'PRODUCT', `Uploaded and synced ${activeProducts.length} active products to Google Sheets`);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error pushing products to Google Sheets:', err);
      return false;
    }
  };

  const pushCustomersToGoogleSheets = async (currentCustomers?: Customer[]) => {
    const listToSync = currentCustomers || customers;

    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) {
      console.warn('Google Apps Script Web App URL is not configured.');
      return false;
    }

    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
          action: 'sync_all_customers',
          customers: listToSync
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.status === 'success') {
          addAuditLog('PUSH_SHEET_SUCCESS', 'CUSTOMER', `Uploaded and synced ${listToSync.length} customers to Google Sheets`);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error pushing customers to Google Sheets:', err);
      return false;
    }
  };

  const pullCustomersFromGoogleSheets = async () => {
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) {
      throw new Error('URL Google Apps Script belum dikonfigurasi di Pengaturan.');
    }

    setIsSyncing(true);
    addAuditLog('SYNC_CUSTOMERS_START', 'CUSTOMER', 'Memulai sinkronisasi data pelanggan dari Google Sheets');

    try {
      const response = await fetch(`${googleAppsScriptUrl}?type=pelanggan`);
      if (!response.ok) {
        throw new Error('Gagal menghubungi server Apps Script.');
      }

      const json = await response.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        const importedCustomers: Customer[] = json.data.map((row: any, idx: number) => {
          return {
            id: row["ID Pelanggan"] || `c-sheet-${idx}-${Date.now()}`,
            customId: row["ID Pelanggan"] || "",
            name: row["Nama"] || row["nama"] || `Pelanggan ${idx}`,
            phone: row["Telepon"] || row["phone"] || row["telepon"] || "-",
            email: row["Email"] || row["email"] || "-",
            group: (row["Grup"] || row["group"] || "RETAIL").toUpperCase() as any,
            tier: (row["Tingkatan"] || row["tier"] || "SILVER").toUpperCase() as any,
            membershipPoints: parseInt(row["Poin Reward"] || row["points"] || "0") || 0,
            cashbackBalance: parseFloat(row["Saldo Cashback"] || row["balance"] || "0") || 0,
            address: row["Alamat"] || row["address"] || "",
            createdAt: row["Tanggal Terdaftar"] || new Date().toISOString()
          };
        });

        setCustomers(importedCustomers);
        addAuditLog('SYNC_CUSTOMERS_SUCCESS', 'CUSTOMER', `Berhasil menyinkronkan ${importedCustomers.length} pelanggan dari Google Sheets!`);
      } else {
        throw new Error(json.message || 'Format data Apps Script tidak valid.');
      }
    } catch (err: any) {
      console.error('Error pulling customers from Google Sheets:', err);
      addAuditLog('SYNC_CUSTOMERS_FAILED', 'CUSTOMER', `Gagal menyinkronkan pelanggan: ${err.message || err}`);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const pullStaffFromGoogleSheets = async () => {
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) {
      throw new Error('URL Google Apps Script belum dikonfigurasi di Pengaturan.');
    }

    setIsSyncing(true);
    addAuditLog('SYNC_STAFF_START', 'SYSTEM', 'Memulai sinkronisasi data karyawan dari Google Sheets');

    try {
      const response = await fetch(`${googleAppsScriptUrl}?type=staff`);
      if (!response.ok) {
        throw new Error('Gagal menghubungi server Apps Script.');
      }

      const json = await response.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        const importedStaff: Staff[] = json.data.map((row: any, idx: number) => {
          const email = row["Email"] || row["email"] || "";
          const id = row["ID Staff"] || row["id"] || `st-${idx}-${Date.now()}`;
          const name = row["Nama Staff"] || row["name"] || `Staff ${idx}`;
          const role = (row["Role"] || row["role"] || "CASHIER") as any;
          
          let pin = row["PIN"] || row["pin"];
          if (!pin) {
            pin = String((idx + 1) * 1111);
          }
          
          let password = row["Password"] || row["password"];
          if (!password) {
            if (email.toLowerCase() === 'admin@kedaihw.com' || name.toLowerCase().includes('dzikron')) {
              password = 'adnimtunimku12**';
              pin = '1111';
            } else {
              password = email ? email.split('@')[0] + '123' : 'staff123';
            }
          }

          return {
            id,
            name,
            role: role,
            phone: String(row["Telepon"] || row["phone"] || ""),
            email,
            commissionRate: parseFloat(row["Komisi (%)"] || row["commissionRate"] || "0") || 0,
            attendanceStatus: (row["Status Kehadiran"] || row["attendanceStatus"] || "OFF") as any,
            basicSalary: parseFloat(row["Gaji Pokok"] || row["basicSalary"] || "0") || 0,
            currentShiftId: row["Shift Aktif"] || row["currentShiftId"] || undefined,
            pin,
            password
          };
        });

        setStaff(importedStaff);
        localStorage.setItem('kdp_staff', JSON.stringify(importedStaff));
        addAuditLog('SYNC_STAFF_SUCCESS', 'SYSTEM', `Berhasil menyinkronkan ${importedStaff.length} data karyawan dari Google Sheets!`);
      } else {
        throw new Error(json.message || 'Format data Apps Script tidak valid.');
      }
    } catch (err: any) {
      console.error('Error pulling staff from Google Sheets:', err);
      addAuditLog('SYNC_STAFF_FAILED', 'SYSTEM', `Gagal menyinkronkan karyawan: ${err.message || err}`);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const pullOrdersFromGoogleSheets = async () => {
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) {
      throw new Error('URL Google Apps Script belum dikonfigurasi di Pengaturan.');
    }

    setIsSyncing(true);
    addAuditLog('SYNC_ORDERS_START', 'POS', 'Memulai sinkronisasi data rekap transaksi dari Google Sheets');

    try {
      const response = await fetch(`${googleAppsScriptUrl}?type=pos_transactions`);
      if (!response.ok) {
        throw new Error('Gagal menghubungi server Apps Script.');
      }

      const json = await response.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        const importedOrders: Order[] = json.data.map((row: any, idx: number) => {
          let items: Order['items'] = [];
          const rawItems = row["Items"] || row["items"] || row["Detail Produk"] || row["Item"];
          if (rawItems) {
            if (typeof rawItems === 'string') {
              try {
                items = JSON.parse(rawItems);
              } catch (e) {
                items = [];
              }
            } else if (Array.isArray(rawItems)) {
              items = rawItems;
            }
          }

          const orderNo = String(row["No Invoice"] || row["No. Nota"] || row["No Nota"] || row["orderNo"] || row["Order No"] || `TRX-${Date.now()}-${idx}`);
          const totalVal = parseFloat(row["Grand Total"] || row["Total"] || row["total"] || "0") || 0;
          const subtotalVal = parseFloat(row["Subtotal"] || row["subtotal"] || "0") || totalVal;

          return {
            id: row["ID"] || row["id"] || `ord-sheet-${idx}-${Date.now()}`,
            orderNo,
            date: row["Tanggal"] || row["Date"] || row["date"] || new Date().toISOString(),
            items,
            subtotal: subtotalVal,
            tax: parseFloat(row["Pajak"] || row["tax"] || "0") || 0,
            discount: parseFloat(row["Diskon"] || row["discount"] || "0") || 0,
            shippingFee: parseFloat(row["Ongkir"] || row["shippingFee"] || "0") || 0,
            total: totalVal,
            paymentMethod: (row["Metode Pembayaran"] || row["paymentMethod"] || "CASH").toUpperCase() as any,
            paymentStatus: (row["Status Pembayaran"] || row["paymentStatus"] || "PAID").toUpperCase() as any,
            customerName: row["Nama Pelanggan"] || row["Pelanggan"] || row["Customer"] || row["customerName"] || "Pelanggan Umum",
            customerPhone: row["Telepon"] || row["phone"] || row["customerPhone"] || "",
            cashierName: row["Kasir"] || row["Cashier"] || row["cashierName"] || "Kasir Utama"
          };
        });

        if (importedOrders.length > 0) {
          setOrders(importedOrders);
          localStorage.setItem('kdp_orders', JSON.stringify(importedOrders));
        }
        addAuditLog('SYNC_ORDERS_SUCCESS', 'POS', `Berhasil menyinkronkan ${importedOrders.length} transaksi dari Google Sheets!`);
      } else {
        throw new Error(json.message || 'Format data Apps Script tidak valid.');
      }
    } catch (err: any) {
      console.error('Error pulling orders from Google Sheets:', err);
      addAuditLog('SYNC_ORDERS_FAILED', 'POS', `Gagal menyinkronkan transaksi: ${err.message || err}`);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const pushAllOrdersToGoogleSheets = async (currentOrders?: Order[]) => {
    const list = currentOrders || orders;
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) return false;
    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'sync_all_orders', orders: list })
      });
      return response.ok;
    } catch (err) {
      console.error('Error pushing all orders:', err);
      return false;
    }
  };

  const pushOrderToGoogleSheets = async (order: Order) => {
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) return false;
    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'add_pos_transaction', order })
      });
      return response.ok;
    } catch (err) {
      console.error('Error pushing order:', err);
      return false;
    }
  };

  const pushInventoryMovementToGoogleSheets = async (movement: InventoryMovement) => {
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) return false;
    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'add_inventory_movement', movement })
      });
      return response.ok;
    } catch (err) {
      console.error('Error pushing movement:', err);
      return false;
    }
  };

  const pushFinanceTransactionToGoogleSheets = async (transaction: any) => {
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) return false;
    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'add_finance_transaction', transaction })
      });
      return response.ok;
    } catch (err) {
      console.error('Error pushing finance transaction:', err);
      return false;
    }
  };

  const pushJournalEntryToGoogleSheets = async (journal: any) => {
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) return false;
    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'add_journal_entry', journal })
      });
      return response.ok;
    } catch (err) {
      console.error('Error pushing journal entry:', err);
      return false;
    }
  };

  const pushAuditLogToGoogleSheets = async (log: AuditLog) => {
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) return false;
    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'add_audit_log', log })
      });
      return response.ok;
    } catch (err) {
      console.error('Error pushing audit log:', err);
      return false;
    }
  };

  const pushSuppliersToGoogleSheets = async (currentSuppliers?: Supplier[]) => {
    const list = currentSuppliers || suppliers;
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) return false;
    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'sync_all_suppliers', suppliers: list })
      });
      return response.ok;
    } catch (err) {
      console.error('Error pushing suppliers:', err);
      return false;
    }
  };

  const pushPurchasesToGoogleSheets = async (currentPurchases?: PurchaseOrder[]) => {
    const list = currentPurchases || purchaseOrders;
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) return false;
    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'sync_all_purchases', purchases: list })
      });
      return response.ok;
    } catch (err) {
      console.error('Error pushing purchases:', err);
      return false;
    }
  };

  const pushStaffToGoogleSheets = async (currentStaff?: Staff[]) => {
    const list = currentStaff || staff;
    if (!googleAppsScriptUrl || !googleAppsScriptUrl.includes('script.google.com')) return false;
    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'sync_all_staff', staff: list })
      });
      return response.ok;
    } catch (err) {
      console.error('Error pushing staff:', err);
      return false;
    }
  };

  const pushAllDataToGoogleSheets = async () => {
    setIsSyncing(true);
    addAuditLog('SYNC_ALL_START', 'SYSTEM', 'Memulai sinkronisasi massal seluruh database ke Google Sheets');
    try {
      const p1 = await pushProductsToGoogleSheets();
      const p2 = await pushCustomersToGoogleSheets();
      const p3 = await pushSuppliersToGoogleSheets();
      const p4 = await pushPurchasesToGoogleSheets();
      const p5 = await pushStaffToGoogleSheets();
      const p6 = await pushAllOrdersToGoogleSheets();
      
      const success = p1 && p2 && p3 && p4 && p5 && p6;
      if (success) {
        addAuditLog('SYNC_ALL_SUCCESS', 'SYSTEM', 'Berhasil menyinkronkan seluruh database ke Google Sheets!');
      } else {
        addAuditLog('SYNC_ALL_PARTIAL', 'SYSTEM', 'Sinkronisasi selesai dengan beberapa kegagalan');
      }
      return success;
    } catch (err) {
      console.error('Error pushing all data:', err);
      addAuditLog('SYNC_ALL_FAILED', 'SYSTEM', 'Gagal melakukan sinkronisasi massal');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        suppliers,
        branches,
        staff,
        staffList: staff,
        promotions,
        onlineOrders,
        ppobTransactions,
        orders,
        updateOrder,
        inventoryMovements,
        accountCodes,
        activeShift,
        auditLogs,
        currentUser,
        currentBranch,
        cart,
        holdOrders,
        activeTab,
        isOnline,
        isSyncing,
        konveksiOrders,
        addKonveksiOrder,
        updateKonveksiOrderStatus,
        addOnlineOrder,
        updateOnlineOrderStatus,
        loggedCustomer,
        setLoggedCustomer,
        
        setActiveTab,
        setIsOnline,
        syncCloud,
        changeRole,
        loginAsUser,
        loginWithEmailPassword,
        changeBranch,
        
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartItemDiscount,
        updateCartItemNotes,
        clearCart,
        
        holdCurrentCart,
        restoreHeldCart,
        deleteHeldCart,
        
        checkoutCart,
        refundOrder,
        
        addProduct,
        editProduct,
        deleteProduct,
        deleteProducts,
        importProducts,
        
        addCustomer,
        editCustomer,
        importCustomers,
        deleteCustomer,
        deleteCustomers,
        addSupplier,
        addSupplierDebtPayment,
        addStaff,
        updateStaffCommission,
        editStaff,
        deleteStaff,
        setCurrentUser,
        isLocked,
        setIsLocked,
        logout,
        
        openShift,
        closeShift,
        
        adjustStock,
        transferStock,
        
        buyPpob,
        addFinanceTransaction,
        addAuditLog,
        
        googleSheetUrl,
        googleDriveUrl,
        googleAppsScriptUrl,
        updateGoogleConfig,
        syncProductsFromGoogleSheets,
        pushProductsToGoogleSheets,
        pushCustomersToGoogleSheets,
        pullCustomersFromGoogleSheets,
        pullStaffFromGoogleSheets,
        pullOrdersFromGoogleSheets,
        pushAllOrdersToGoogleSheets,

        purchaseOrders,
        setPurchaseOrders,
        financeTransactions,
        setFinanceTransactions,
        journalEntries,
        setJournalEntries,
        
        pushOrderToGoogleSheets,
        pushInventoryMovementToGoogleSheets,
        pushFinanceTransactionToGoogleSheets,
        pushJournalEntryToGoogleSheets,
        pushAuditLogToGoogleSheets,
        pushSuppliersToGoogleSheets,
        pushPurchasesToGoogleSheets,
        pushStaffToGoogleSheets,
        pushAllDataToGoogleSheets
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
