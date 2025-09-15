// types.ts

export interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  logo?: string; // base64 encoded image
  logoOpacity?: number; // 0 to 1
}

export interface PrintSettings {
    showCostOnPrint: boolean;
    footerText: string;
    fontSize: number;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  cost: number; // Added for profit calculation
  minStock: number;
  imageUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price at the time of sale
  cost: number; // Cost at the time of sale
}

export enum PaymentStatus {
  Paid = 'تم الدفع',
  Partial = 'جزئي',
  Deferred = 'مؤجل',
}

export interface Payment {
  amount: number;
  date: string;
  createdBy: string;
}

export interface BaseRecord {
  id:string;
  recordNumber: number;
  customerName: string;
  customerId?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: SaleItem[];
  total: number;
  totalCost: number; // Added for profit calculation
  profit: number; // Added for profit calculation
  discount: number;
  finalTotal: number;
  date: string;
  createdBy: string; // User who created the record
  paymentStatus: PaymentStatus;
  amountPaid: number;
  amountRemaining: number;
  payments: Payment[];
}

export interface Sale extends BaseRecord {}

export interface Invoice extends BaseRecord {}

export interface SalesReturn extends BaseRecord {}

export interface InvoiceReturn extends BaseRecord {}

export enum FawryPaymentType {
  Card = 'كارت',
  Transfer = 'تحويل',
  Cash = 'نقدي',
  Other = 'أخرى',
}

export interface FawrySale extends BaseRecord {
  paymentType: FawryPaymentType;
}

export type AnyRecord = Sale | Invoice | SalesReturn | InvoiceReturn | FawrySale;

export type RecordType = 'sales' | 'invoices' | 'archivedInvoices' | 'salesReturns' | 'invoiceReturns' | 'fawrySales';
export type DeletedRecordType = 'deletedSales' | 'deletedInvoices' | 'deletedArchivedInvoices' | 'deletedSalesReturns' | 'deletedInvoiceReturns' | 'deletedFawrySales';


export type Page = 'dashboard' | 'inventory' | 'sales' | 'returns' | 'records' | 'reports' | 'customers' | 'settings';

// Stage 3 Additions
export type Role = 'manager' | 'employee' | 'accountant';

export interface User {
    id: string;
    name: string;
    username: string;
    password?: string; // Optional for security reasons when passing user objects around
    role: Role;
}

export interface LogEntry {
    id: string;
    user: string;
    action: string;
    timestamp: string;
}