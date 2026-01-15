// ==================== Core Types ====================

export type UserRole = 'Owner' | 'Manager' | 'Staff';

export type OrderStatus = 'Pending' | 'Fulfilled' | 'Cancelled' | 'Partial';

export type PurchaseOrderStatus = 'Draft' | 'Sent' | 'Confirmed' | 'Received' | 'Cancelled';

export type StockMovementType = 'purchase' | 'sale' | 'return' | 'adjustment';

export type AlertType = 'low_stock' | 'price_variance' | 'pending_po';

export type AlertSeverity = 'info' | 'warning' | 'critical';

// ==================== Entity Interfaces ====================

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logo?: string;
  createdAt: Date;
  settings: {
    currency: string;
    timezone: string;
    lowStockThreshold: number;
  };
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: string;
  brand?: string;
  basePrice: number;
  hasVariants: boolean;
  variantOptions?: VariantOption[];
  supplierId?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantOption {
  name: string; // e.g., "Size", "Color"
  values: string[]; // e.g., ["S", "M", "L"], ["Red", "Blue", "Green"]
}

export interface SKU {
  id: string;
  tenantId: string;
  productId: string;
  sku: string; // Unique SKU code
  variantCombination?: Record<string, string>; // e.g., { size: "M", color: "Red" }
  stock: number;
  price: number;
  cost?: number; // Cost price from supplier
  lowStockThreshold: number;
  reorderPoint?: number;
  version: number; // For optimistic locking
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  skuId: string;
  productId: string;
  type: StockMovementType;
  quantity: number; // Positive for additions, negative for reductions
  balanceBefore: number;
  balanceAfter: number;
  reference?: string; // Order ID, PO ID, or manual reference
  referenceType?: 'order' | 'purchase_order' | 'adjustment';
  note?: string;
  timestamp: Date;
  userId: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  code: string; // Unique supplier code
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentTerms?: string;
  taxId?: string;
  rating?: number; // 1-5 rating
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string; // Unique PO number
  supplierId: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  totalAmount: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  sentAt?: Date;
  confirmedAt?: Date;
  expectedDeliveryDate?: Date;
  receivedAt?: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  skuId: string;
  productName: string;
  sku: string;
  variantInfo?: string; // Display text for variant
  orderedQuantity: number;
  receivedQuantity: number;
  orderedPrice: number; // Price per unit when ordered
  receivedPrice?: number; // Actual price per unit received (if different)
  priceVariance?: number; // Difference from ordered price
  lineTotal: number;
}

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string; // Unique order number
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  fulfilledAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  skuId: string;
  productName: string;
  sku: string;
  variantInfo?: string;
  quantity: number;
  fulfilledQuantity: number;
  price: number; // Price per unit
  lineTotal: number;
}

export interface Alert {
  id: string;
  tenantId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data?: any; // Additional data related to the alert
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
}

// ==================== Dashboard & Analytics ====================

export interface DashboardStats {
  totalProducts: number;
  totalSKUs: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingOrders: number;
  pendingPurchaseOrders: number;
  totalInventoryValue: number;
  totalInventoryCost: number;
}

export interface TopSeller {
  productId: string;
  productName: string;
  image?: string;
  totalQuantitySold: number;
  totalRevenue: number;
  category: string;
}

export interface StockMovementData {
  date: string;
  purchases: number;
  sales: number;
  adjustments: number;
  returns: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  value: number;
  percentage: number;
}

export interface LowStockItem {
  skuId: string;
  productId: string;
  productName: string;
  sku: string;
  variantInfo?: string;
  currentStock: number;
  threshold: number;
  pendingPOQuantity: number; // Quantity in pending purchase orders
  needsAttention: boolean; // True if pending PO won't cover threshold
  image?: string;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// ==================== Form Types ====================

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  brand?: string;
  basePrice: number;
  hasVariants: boolean;
  variantOptions?: VariantOption[];
  supplierId?: string;
  image?: string;
}

export interface SKUFormData {
  productId: string;
  sku: string;
  variantCombination?: Record<string, string>;
  stock: number;
  price: number;
  cost?: number;
  lowStockThreshold: number;
}

export interface SupplierFormData {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentTerms?: string;
  taxId?: string;
}

export interface StockAdjustmentFormData {
  skuId: string;
  quantity: number;
  type: 'add' | 'remove';
  note: string;
}

// ==================== Filter & Search Types ====================

export interface ProductFilters {
  search?: string;
  category?: string;
  supplierId?: string;
  stockLevel?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  hasVariants?: boolean;
  isActive?: boolean;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
}

export interface PurchaseOrderFilters {
  search?: string;
  status?: PurchaseOrderStatus;
  supplierId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface StockMovementFilters {
  skuId?: string;
  productId?: string;
  type?: StockMovementType;
  dateFrom?: Date;
  dateTo?: Date;
}

// ==================== Context Types ====================

export interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

export interface RegisterData {
  tenantName: string;
  subdomain: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// ==================== Table Types ====================

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// ==================== Notification Types ====================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

