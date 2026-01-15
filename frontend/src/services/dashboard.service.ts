import { apiClient } from './api';
import type { DashboardStats, ApiResponse } from '../types';

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/api/inventory/dashboard');
    if (!response.data) {
      // Return empty stats if API fails
      return {
        inventoryValue: 0,
        totalProducts: 0,
        totalSKUs: 0,
        lowStockAlerts: [],
        topSellers: [],
        stockMovementChart: [],
        categoryDistribution: [],
      };
    }
    return response.data;
  }
}

export const dashboardService = new DashboardService();

