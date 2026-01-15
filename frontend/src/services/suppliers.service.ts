import { apiClient } from './api';
import type { Supplier, ApiResponse } from '../types';

class SuppliersService {
  async getSuppliers(params?: {
    search?: string;
    isActive?: boolean;
  }): Promise<Supplier[]> {
    const response = await apiClient.get<ApiResponse<Supplier[]>>('/api/inventory/suppliers', params);
    return response.data || [];
  }

  async getSupplierById(id: string): Promise<Supplier> {
    const response = await apiClient.get<ApiResponse<Supplier>>(`/api/inventory/suppliers/${id}`);
    if (!response.data) throw new Error('Supplier not found');
    return response.data;
  }

  async createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const response = await apiClient.post<ApiResponse<Supplier>>('/api/inventory/suppliers', data);
    if (!response.data) throw new Error('Failed to create supplier');
    return response.data;
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await apiClient.put<ApiResponse<Supplier>>(`/api/inventory/suppliers/${id}`, data);
    if (!response.data) throw new Error('Failed to update supplier');
    return response.data;
  }

  async deleteSupplier(id: string): Promise<void> {
    await apiClient.delete(`/api/inventory/suppliers/${id}`);
  }
}

export const suppliersService = new SuppliersService();

