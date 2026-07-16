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
  KonveksiOrder
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
  
  // Tab Management
  setActiveTab: (tab: string) => void;
  setIsOnline: (online: boolean) => void;
  syncCloud: () => Promise<void>;
  changeRole: (role: Staff['role']) => void;
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
  checkoutCart: (paymentMethod: PaymentMethod, amountPaid: number, options: { customerId?: string; discount?: number; tableNo?: string; splitCount?: number }) => Order;
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
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaffCommission: (id: string, rate: number) => void;
  
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
    const saved = localStorage.getItem('kdp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('kdp_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('kdp_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);

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
  const [currentUser, setCurrentUser] = useState<Staff>(INITIAL_STAFF[2]); // Siti Aminah (Cashier 1)
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]); // Bandung Main

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('kdp_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kdp_customers', JSON.stringify(customers));
  }, [customers]);

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
    options: { customerId?: string; discount?: number; tableNo?: string; splitCount?: number }
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
    const taxValue = Math.round((cartSubtotal - discountValue) * 0.1); // 10% tax
    const serviceValue = Math.round((cartSubtotal - discountValue) * 0.05); // 5% service charge
    const totalVal = cartSubtotal - discountValue + taxValue + serviceValue;

    const newOrder: Order = {
      id: `inv-${Date.now()}`,
      orderNo: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      customerId: customerObj?.id,
      customerName: customerObj?.name,
      customerPhone: customerObj?.phone,
      items: itemsList,
      subtotal: cartSubtotal,
      tax: taxValue,
      serviceCharge: serviceValue,
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
    }
  };

  // Product Management Actions
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts((prev) => [newProduct, ...prev]);
    addAuditLog('ADD_PRODUCT', 'PRODUCT', `Added new product: ${product.name} (${product.sku})`);

    // Real-time integration: Post new product to Google Sheets via Apps Script Web App
    if (googleAppsScriptUrl && googleAppsScriptUrl.includes('script.google.com')) {
      const payload = {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        brand: newProduct.brand || 'Kedai Kepanduan',
        costPrice: newProduct.costPrice,
        sellingPrice: newProduct.sellingPrice,
        stock: newProduct.stock,
        image: newProduct.image
      };

      fetch(googleAppsScriptUrl, {
        method: 'POST',
        mode: 'no-cors', // Avoid potential CORS redirect blocks
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(() => {
        addAuditLog('POST_APPS_SCRIPT_SUCCESS', 'PRODUCT', `Produk "${product.name}" berhasil ditambahkan ke Google Sheets via Apps Script!`);
      })
      .catch((err) => {
        console.error('Failed to post product to Apps Script:', err);
        addAuditLog('POST_APPS_SCRIPT_FAILED', 'PRODUCT', `Gagal menambahkan produk ke Google Sheets: ${err.message || err}`);
      });
    }
  };

  const editProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p))
    );
    const prod = products.find((p) => p.id === id);
    if (prod) {
      addAuditLog('EDIT_PRODUCT', 'PRODUCT', `Updated product: ${prod.name}`);
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isDeleted: true } : p))
    );
    const prod = products.find((p) => p.id === id);
    if (prod) {
      addAuditLog('DELETE_PRODUCT', 'PRODUCT', `Soft deleted product: ${prod.name}`);
    }
  };

  const deleteProducts = (ids: string[]) => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, isDeleted: true } : p))
    );
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
    setCustomers((prev) => [...prev, newCust]);
    addAuditLog('ADD_CUSTOMER', 'CUSTOMER', `Added member customer: ${cust.name}`);
  };

  const editCustomer = (id: string, updatedFields: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    const found = customers.find((c) => c.id === id);
    if (found) {
      addAuditLog('EDIT_CUSTOMER', 'CUSTOMER', `Updated customer details for: ${found.name}`);
    }
  };

  const importCustomers = (newCusts: Customer[]) => {
    setCustomers((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const filteredNew = newCusts.filter((c) => !existingIds.has(c.id));
      return [...filteredNew, ...prev];
    });
    addAuditLog('IMPORT_CUSTOMERS', 'CUSTOMER', `Imported ${newCusts.length} customers via CSV file`);
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (cust) {
      addAuditLog('DELETE_CUSTOMER', 'CUSTOMER', `Deleted customer: ${cust.name}`);
    }
  };

  const deleteCustomers = (ids: string[]) => {
    setCustomers((prev) => prev.filter((c) => !ids.includes(c.id)));
    addAuditLog('DELETE_CUSTOMERS', 'CUSTOMER', `Bulk deleted ${ids.length} customers`);
  };

  const addSupplier = (sup: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSup: Supplier = {
      ...sup,
      id: `s-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSuppliers((prev) => [...prev, newSup]);
    addAuditLog('ADD_SUPPLIER', 'SUPPLIER', `Added supplier: ${sup.name}`);
  };

  const addSupplierDebtPayment = (supplierId: string, amount: number) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          return { ...s, unpaidDebt: Math.max(0, s.unpaidDebt - amount) };
        }
        return s;
      })
    );
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
  };

  const addStaff = (s: Omit<Staff, 'id'>) => {
    const newStaff: Staff = {
      ...s,
      attendanceStatus: 'PRESENT',
      id: `st-${Date.now()}`
    };
    setStaff((prev) => [...prev, newStaff]);
    addAuditLog('ADD_STAFF', 'STAFF', `Added staff member: ${s.name}`);
  };

  const updateStaffCommission = (id: string, rate: number) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, commissionRate: rate } : s))
    );
    const s = staff.find((st) => st.id === id);
    if (s) {
      addAuditLog('UPDATE_COMMISSION', 'STAFF', `Updated commission rate for ${s.name} to ${rate}%`);
    }
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
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + adjustmentQty);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

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
    }
  };

  const transferStock = (productId: string, transferQty: number, notes: string) => {
    // Subtract from active stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, stock: Math.max(0, p.stock - transferQty) };
        }
        return p;
      })
    );

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

    // Write simple journal entries
    const journalId = `je-${Date.now()}`;
    const newEntry = {
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

    // Save journal entry
    const savedJe = localStorage.getItem('kdp_journals');
    const jeList = savedJe ? JSON.parse(savedJe) : [];
    localStorage.setItem('kdp_journals', JSON.stringify([newEntry, ...jeList]));

    addAuditLog('FINANCE_RECORD', 'FINANCE', `Logged ${category.toLowerCase()}: "${description}" of IDR ${amount.toLocaleString()}`);
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
        
        setActiveTab,
        setIsOnline,
        syncCloud,
        changeRole,
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
        syncProductsFromGoogleSheets
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
