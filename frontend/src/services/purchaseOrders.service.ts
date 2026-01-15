import { apiClient } from './api';
import type { PurchaseOrder, ApiResponse } from '../types';

class PurchaseOrdersService {
  async getPurchaseOrders(params?: {
    status?: string;
    supplierId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PurchaseOrder[]> {
    const response = await apiClient.get<ApiResponse<PurchaseOrder[]>>('/api/inventory/purchase-orders', params);
    return response.data || [];
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.get<ApiResponse<PurchaseOrder>>(`/api/inventory/purchase-orders/${id}`);
    if (!response.data) throw new Error('Purchase order not found');
    return response.data;
  }

  async createPurchaseOrder(data: {
    supplierId: string;
    items: Array<{
      skuId: string;
      orderedQuantity: number;
      orderedPrice: number;
    }>;
    tax?: number;
    shippingCost?: number;
    notes?: string;
    expectedDeliveryDate?: string;
  }): Promise<PurchaseOrder> {
    const response = await apiClient.post<ApiResponse<PurchaseOrder>>('/api/inventory/purchase-orders', data);
    if (!response.data) throw new Error('Failed to create purchase order');
    return response.data;
  }

  async updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await apiClient.put<ApiResponse<PurchaseOrder>>(`/api/inventory/purchase-orders/${id}`, data);
    if (!response.data) throw new Error('Failed to update purchase order');
    return response.data;
  }

  async updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder> {
    const response = await apiClient.patch<ApiResponse<PurchaseOrder>>(`/api/inventory/purchase-orders/${id}/status`, { status });
    if (!response.data) throw new Error('Failed to update status');
    return response.data;
  }

  async receivePurchaseOrder(
    id: string,
    data: {
      items: Array<{
        itemId: string;
        receivedQuantity: number;
        receivedPrice?: number;
      }>;
    }
  ): Promise<PurchaseOrder> {
    const response = await apiClient.post<ApiResponse<PurchaseOrder>>(`/api/inventory/purchase-orders/${id}/receive`, data);
    if (!response.data) throw new Error('Failed to receive purchase order');
    return response.data;
  }

  async cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.post<ApiResponse<PurchaseOrder>>(`/api/inventory/purchase-orders/${id}/cancel`);
    if (!response.data) throw new Error('Failed to cancel purchase order');
    return response.data;
  }
}

export const purchaseOrdersService = new PurchaseOrdersService();

