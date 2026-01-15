import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// API Base URL - adjust based on your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * API Client with authentication and error handling
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || 'An error occurred';

          // Handle specific error cases
          if (status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
          } else if (status === 403) {
            toast.error('Access denied');
          } else if (status >= 500) {
            toast.error('Server error. Please try again later.');
          } else {
            toast.error(message);
          }
        } else if (error.request) {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error('An unexpected error occurred');
        }

        return Promise.reject(error);
      }
    );
  }

  // Transform MongoDB _id to id for frontend consistency
  private transformId(data: any): any {
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => this.transformId(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const transformed = { ...data };
      if (transformed._id && !transformed.id) {
        transformed.id = transformed._id.toString();
      }
      // Recursively transform nested objects
      for (const key in transformed) {
        if (typeof transformed[key] === 'object' && transformed[key] !== null) {
          transformed[key] = this.transformId(transformed[key]);
        }
      }
      return transformed;
    }
    
    return data;
  }

  // Generic methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    // Transform response data to convert _id to id
    if (response.data) {
      if (response.data.data) {
        response.data.data = this.transformId(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Handle case where response.data is directly an array
        response.data = this.transformId(response.data);
      } else {
        // Handle case where response.data is an object
        response.data = this.transformId(response.data);
      }
    }
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    // Transform response data to convert _id to id
    if (response.data && response.data.data) {
      response.data.data = this.transformId(response.data.data);
    }
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    // Transform response data to convert _id to id
    if (response.data && response.data.data) {
      response.data.data = this.transformId(response.data.data);
    }
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch(url, data);
    // Transform response data to convert _id to id
    if (response.data && response.data.data) {
      response.data.data = this.transformId(response.data.data);
    }
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    // Transform response data to convert _id to id
    if (response.data && response.data.data) {
      response.data.data = this.transformId(response.data.data);
    }
    return response.data;
  }
}

export const apiClient = new ApiClient();

