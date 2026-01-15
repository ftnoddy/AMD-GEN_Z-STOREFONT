import { apiClient } from './api';
import type { SKU, ApiResponse } from '../types';

class SKUsService {
  async getSKUs(params?: {
    productId?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
  }): Promise<SKU[]> {
    const response = await apiClient.get<ApiResponse<SKU[]>>('/api/inventory/skus', params);
    return response.data || [];
  }

  async getSKUById(id: string): Promise<SKU> {
    const response = await apiClient.get<ApiResponse<SKU>>(`/api/inventory/skus/${id}`);
    if (!response.data) throw new Error('SKU not found');
    return response.data;
  }

  async createSKU(data: Omit<SKU, 'id' | 'createdAt' | 'updatedAt'>): Promise<SKU> {
    const response = await apiClient.post<ApiResponse<SKU>>('/api/inventory/skus', data);
    if (!response.data) throw new Error('Failed to create SKU');
    return response.data;
  }

  async updateSKU(id: string, data: Partial<SKU>): Promise<SKU> {
    const response = await apiClient.put<ApiResponse<SKU>>(`/api/inventory/skus/${id}`, data);
    if (!response.data) throw new Error('Failed to update SKU');
    return response.data;
  }

  async adjustStock(skuId: string, data: {
    quantity: number;
    type: 'add' | 'remove';
    note?: string;
  }): Promise<SKU> {
    const response = await apiClient.post<ApiResponse<SKU>>(`/api/inventory/skus/${skuId}/adjust-stock`, data);
    if (!response.data) throw new Error('Failed to adjust stock');
    return response.data;
  }

  async bulkCreateSKUs(skus: Omit<SKU, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<SKU[]> {
    const response = await apiClient.post<ApiResponse<SKU[]>>('/api/inventory/skus/bulk', { skus });
    if (!response.data) throw new Error('Failed to create SKUs');
    return response.data;
  }
}

export const skusService = new SKUsService();

