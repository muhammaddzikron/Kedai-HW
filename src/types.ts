/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Regular", "Large", "Red", "Blue"
  sku: string;
  priceDifference: number; // added to base price
  stock: number;
}

export interface ProductModifier {
  id: string;
  name: string; // e.g. "Less Sugar", "Extra Shot Espresso", "Whip Cream"
  price: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  stock: number;
  minStock: number;
  image?: string;
  variants: ProductVariant[];
  modifiers: ProductModifier[];
  batchNo?: string;
  expiredDate?: string;
  isOnline: boolean;
  isSynced: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string; // Unique instance ID in cart
  product: Product;
  selectedVariant?: ProductVariant;
  selectedModifiers: ProductModifier[];
  quantity: number;
  discountPercentage: number;
  discountAmount: number;
  notes?: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'CARD' | 'E-WALLET' | 'TRANSFER' | 'SPLIT';

export interface Order {
  id: string;
  orderNo: string;
  date: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: {
    productId: string;
    productName: string;
    variantName?: string;
    modifiers: string[];
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  shippingFee?: number;
  discount: number;
  total: number;
  amountPaid: number;
  change: number;
  paymentMethod: PaymentMethod;
  paymentDetail?: string; // QRIS code / Bank Name / e-Wallet Transaction ID
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL' | 'REFUNDED';
  cashierId: string;
  cashierName: string;
  branchId: string;
  branchName: string;
  shiftId: string;
  isHold: boolean;
  holdName?: string;
  tableNo?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  group: 'RETAIL' | 'VIP' | 'WHOLESALE' | 'MEMBER';
  membershipPoints: number;
  tier: 'SILVER' | 'GOLD' | 'PLATINUM';
  cashbackBalance: number;
  birthDate?: string;
  address?: string;
  customId?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  totalPurchase: number;
  unpaidDebt: number;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNo: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseOrderItem[];
  total: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'DEBT';
  createdAt: string;
}

export interface AccountCode {
  id: string;
  code: string; // e.g. "11100"
  name: string; // e.g. "Kas Utama"
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  balance: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  debits: { accountId: string; accountName: string; amount: number }[];
  credits: { accountId: string; accountName: string; amount: number }[];
  createdAt: string;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  expectedCash?: number;
  actualCash?: number;
  cashDifference?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  module: string;
  description: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'CASHIER' | 'WAREHOUSE' | 'MANAGER' | 'SUPERVISOR' | 'ACCOUNTANT' | 'CUSTOMER SERVICE';
  phone: string;
  email: string;
  commissionRate: number; // percentage
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'OFF';
  currentShiftId?: string;
  basicSalary?: number;
  pin?: string; // security code for login
  password?: string; // password for standard email login
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'VOUCHER' | 'HAPPY_HOUR' | 'BUY_X_GET_Y' | 'DISCOUNT_PERCENT';
  value: number; // Percent or absolute discount
  buyQty?: number;
  getQty?: number;
  targetProductId?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface OnlineOrder {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  date: string;
  items: { productName: string; quantity: number; price: number; subtotal: number }[];
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  shippingCourier: string;
  paymentGateway: 'MIDTRANS' | 'WHATSAPP_COD';
}

export interface PpobTransaction {
  id: string;
  transactionNo: string;
  date: string;
  type: 'PULSA' | 'DATA' | 'PLN' | 'PDAM' | 'BPJS' | 'GAME';
  provider: string; // e.g. Telkomsel, PLN Pasca, etc.
  targetNumber: string;
  nominal: number;
  sellingPrice: number;
  costPrice: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  date: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  qty: number;
  referenceNo: string; // e.g. PO-001, ADJ-002
  warehouseName: string;
  notes: string;
}

export interface KonveksiOrder {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  itemName: string; // e.g. "Seragam Batik SD Lengan Pendek"
  quantity: number;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'CUSTOM';
  measurements?: {
    shoulderWidth?: number; // cm
    chestCircumference?: number; // cm
    sleeveLength?: number; // cm
    shirtLength?: number; // cm
  };
  dueDate: string;
  status: 'QUEUED' | 'CUTTING' | 'SEWING' | 'FINISHING' | 'READY' | 'DELIVERED';
  notes?: string;
  totalPrice: number;
  depositPaid: number;
  remainingPayment: number;
  assignedStaff?: string; // Tailor/Operator name
}

