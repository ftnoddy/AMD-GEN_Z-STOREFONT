import { apiClient } from './api';
import type { Order, ApiResponse } from '../types';

class OrdersService {
  async getOrders(params?: {
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<Order[]>>('/api/inventory/orders', params);
    return response.data || [];
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/api/inventory/orders/${id}`);
    if (!response.data) throw new Error('Order not found');
    return response.data;
  }

  async createOrder(data: {
    items: Array<{ skuId: string; quantity: number }>;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    notes?: string;
  }): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>('/api/inventory/orders', data);
    if (!response.data) throw new Error('Failed to create order');
    return response.data;
  }

  async fulfillOrder(id: string): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>(`/api/inventory/orders/${id}/fulfill`);
    if (!response.data) throw new Error('Failed to fulfill order');
    return response.data;
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>(`/api/inventory/orders/${id}/cancel`, { reason });
    if (!response.data) throw new Error('Failed to cancel order');
    return response.data;
  }
}

export const ordersService = new OrdersService();

