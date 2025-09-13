export interface Product {
  _id: string;
  _rev?: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  tax: number;
  category: string;
  barcode?: string;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface Customer {
  _id: string;
  _rev?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
  loyaltyPoints: number;
  type: 'retail' | 'wholesale';
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export interface Invoice {
  _id: string;
  _rev?: string;
  number: string;
  customerId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  total: number;
  paid: number;
  change: number;
  paymentMethod: 'cash' | 'card' | 'multiple';
  status: 'paid' | 'partial' | 'void';
  synced: boolean;
  createdAt: string;
  updatedBy: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  tax: number;
  discount?: number;
}

export interface User {
  _id: string;
  _rev?: string;
  username: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'cashier';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface StockAdjustment {
  _id: string;
  _rev?: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  reference?: string;
  createdAt: string;
  createdBy: string;
}

export interface CartState {
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    tax: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}