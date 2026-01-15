import { apiClient } from './api';
import type { StockMovement, ApiResponse } from '../types';

class StockMovementsService {
  async getStockMovements(params?: {
    skuId?: string;
    productId?: string;
    type?: 'purchase' | 'sale' | 'return' | 'adjustment';
    startDate?: string;
    endDate?: string;
    referenceType?: 'order' | 'purchase_order' | 'adjustment';
    limit?: number;
    page?: number;
  }): Promise<{ movements: StockMovement[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ movements: StockMovement[]; pagination: any }>>(
      '/api/inventory/stock-movements',
      params
    );
    return response.data || { movements: [], pagination: {} };
  }

  async getStockMovementById(id: string): Promise<StockMovement> {
    const response = await apiClient.get<ApiResponse<StockMovement>>(`/api/inventory/stock-movements/${id}`);
    if (!response.data) throw new Error('Stock movement not found');
    return response.data;
  }

  async getStockMovementsBySKU(skuId: string, limit = 50): Promise<StockMovement[]> {
    const response = await apiClient.get<ApiResponse<StockMovement[]>>(`/api/inventory/stock-movements/sku/${skuId}`, { limit });
    return response.data || [];
  }

  async getStockMovementsByProduct(productId: string, limit = 50): Promise<StockMovement[]> {
    const response = await apiClient.get<ApiResponse<StockMovement[]>>(`/api/inventory/stock-movements/product/${productId}`, { limit });
    return response.data || [];
  }
}

export const stockMovementsService = new StockMovementsService();

