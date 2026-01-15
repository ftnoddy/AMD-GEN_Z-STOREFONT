import { apiClient } from './api';
import type { Product, SKU, ApiResponse, PaginatedResponse } from '../types';

class ProductsService {
  async getProducts(params?: {
    category?: string;
    supplierId?: string;
    search?: string;
    hasVariants?: boolean;
    isActive?: boolean;
  }): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/api/inventory/products', params);
    const products = response.data || [];
    // Ensure all products have id field (fallback to _id if needed)
    return products.map((p: any) => {
      if (!p.id && p._id) {
        p.id = p._id.toString();
      }
      return p;
    });
  }

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/api/inventory/products/${id}`);
    if (!response.data) throw new Error('Product not found');
    return response.data;
  }

  async getProductWithSKUs(id: string): Promise<{ product: Product; skus: SKU[] }> {
    const response = await apiClient.get<ApiResponse<{ product: Product; skus: SKU[] }>>(
      `/api/inventory/products/${id}/skus`
    );
    if (!response.data) throw new Error('Product not found');
    return response.data;
  }

  async createProduct(data: {
    name: string;
    description?: string;
    category: string;
    brand?: string;
    basePrice: number;
    hasVariants: boolean;
    variantOptions?: Array<{ name: string; values: string[] }>;
    supplierId?: string;
    image?: string;
    skus?: any[];
  }): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/api/inventory/products', data);
    if (!response.data) throw new Error('Failed to create product');
    return response.data;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`/api/inventory/products/${id}`, data);
    if (!response.data) throw new Error('Failed to update product');
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/api/inventory/products/${id}`);
  }
}

export const productsService = new ProductsService();

