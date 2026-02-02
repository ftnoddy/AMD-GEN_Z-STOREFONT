import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

/** Store info by subdomain */
export async function getStore(subdomain: string): Promise<Store> {
  const { data } = await api.get<{ success: boolean; data: Store }>(
    `/api/public/store/${encodeURIComponent(subdomain)}`
  );
  if (!data.success || !data.data) throw new Error('Store not found');
  return data.data;
}

/** Products list for store */
export async function getStoreProducts(
  subdomain: string,
  params?: { category?: string; search?: string; page?: number; limit?: number }
): Promise<{ products: Product[]; pagination: Pagination }> {
  const { data } = await api.get<{
    success: boolean;
    data: { products: Product[]; pagination: Pagination };
  }>(`/api/public/store/${encodeURIComponent(subdomain)}/products`, { params });
  if (!data.success || !data.data) throw new Error('Failed to load products');
  return data.data;
}

/** Product detail with SKUs */
export async function getStoreProduct(
  subdomain: string,
  productId: string
): Promise<{ product: Product; skus: StoreSKU[] }> {
  const { data } = await api.get<{
    success: boolean;
    data: { product: Product; skus: StoreSKU[] };
  }>(`/api/public/store/${encodeURIComponent(subdomain)}/products/${encodeURIComponent(productId)}`);
  if (!data.success || !data.data) throw new Error('Product not found');
  return data.data;
}

/** Place order (guest or with customer token) */
export interface PlaceOrderBody {
  items: { skuId: string; quantity: number }[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

export interface PlaceOrderResponse {
  orderNumber: string;
  _id: string;
  totalAmount: number;
  status: string;
  [key: string]: unknown;
}

export async function placeOrder(
  subdomain: string,
  body: PlaceOrderBody,
  token?: string | null
): Promise<PlaceOrderResponse> {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const { data } = await api.post<{ success: boolean; data: PlaceOrderResponse }>(
    `/api/public/store/${encodeURIComponent(subdomain)}/orders`,
    body,
    config
  );
  if (!data.success || !data.data) throw new Error('Failed to place order');
  return data.data;
}

/** Customer register */
export interface CustomerRegisterBody {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface CustomerAuthResponse {
  token: string;
  customer: Customer;
}

export async function customerRegister(
  subdomain: string,
  body: CustomerRegisterBody
): Promise<CustomerAuthResponse> {
  const { data } = await api.post<{ success: boolean; token: string; customer: Customer }>(
    `/api/public/store/${encodeURIComponent(subdomain)}/auth/register`,
    body
  );
  if (!data.success || !data.token || !data.customer) throw new Error('Registration failed');
  return { token: data.token, customer: data.customer };
}

/** Customer login */
export interface CustomerLoginBody {
  email: string;
  password: string;
}

export async function customerLogin(
  subdomain: string,
  body: CustomerLoginBody
): Promise<CustomerAuthResponse> {
  const { data } = await api.post<{ success: boolean; token: string; customer: Customer }>(
    `/api/public/store/${encodeURIComponent(subdomain)}/auth/login`,
    body
  );
  if (!data.success || !data.token || !data.customer) throw new Error('Login failed');
  return { token: data.token, customer: data.customer };
}

/** My Orders (requires customer token) */
export async function getMyOrders(subdomain: string, token: string): Promise<Order[]> {
  const { data } = await api.get<{ success: boolean; data: Order[] }>(
    `/api/public/store/${encodeURIComponent(subdomain)}/orders`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!data.success || !data.data) throw new Error('Failed to load orders');
  return data.data;
}

/** Single order (requires customer token) */
export async function getMyOrderById(
  subdomain: string,
  orderId: string,
  token: string
): Promise<Order> {
  const { data } = await api.get<{ success: boolean; data: Order }>(
    `/api/public/store/${encodeURIComponent(subdomain)}/orders/${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!data.success || !data.data) throw new Error('Order not found');
  return data.data;
}

export interface Store {
  id: string;
  name: string;
  subdomain: string;
  logo?: string;
  currency: string;
}

export interface Product {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  basePrice: number;
  hasVariants?: boolean;
  variantOptions?: { name: string; values: string[] }[];
  image?: string;
}

export interface StoreSKU {
  id: string;
  sku: string;
  variantCombination?: Record<string, string>;
  stock: number;
  price: number;
  inStock: boolean;
  lowStock: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  tenantId: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: string;
  items: {
    productName: string;
    sku: string;
    variantInfo?: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }[];
  subtotal: number;
  tax?: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
