/**
 * Edgeflex API Service
 * Communicates with the PostgreSQL/Express backend.
 */

import { auth } from './firebase_config';

const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
  private async getAuthToken() {
    try {
      return await auth.currentUser?.getIdToken();
    } catch (error) {
      console.warn('[Edgeflex] Token retrieval failed:', error);
      return null;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const token = await this.getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...((options.headers as any) || {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.status === 401) {
        console.warn('[Edgeflex] Unauthorized - returning demo data');
        return this.getDemoData(endpoint);
      }

      if (!response.ok) {
        console.warn(`[Edgeflex] API Error: ${response.statusText}, returning demo data`);
        return this.getDemoData(endpoint);
      }

      if (response.status === 204) return null;
      return response.json();
    } catch (error) {
      console.warn('[Edgeflex] API request failed, returning demo data:', error);
      return this.getDemoData(endpoint);
    }
  }

  private getDemoData(endpoint: string): any {
    // Return demo/fallback data based on endpoint
    if (endpoint.includes('/customers')) return [];
    if (endpoint.includes('/orders')) return [];
    if (endpoint.includes('/permissions')) return { sharesByMe: [], sharesToMe: [] };
    if (endpoint.includes('/analytics')) return [];
    return [];
  }

  // Customers
  async getCustomers(query = '') {
    return this.request(`/customers?q=${query}`);
  }

  async getCustomer(id: number) {
    return this.request(`/customers/${id}`);
  }

  async addCustomer(payload: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateCustomer(id: number, payload: any) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteCustomer(id: number) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE'
    });
  }

  // Orders
  async getOrders(filters: any = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/orders?${params}`);
  }

  async addOrder(order: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  }

  async deleteOrder(id: number) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE'
    });
  }

  // Analytics
  async getAnalyticsSummary(filters: any = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/analytics/summary?${params}`);
  }

  async getSalesByMonth(filters: any = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/analytics/sales-by-month?${params}`);
  }

  async getRevenueByIndustry(filters: any = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/analytics/revenue-by-industry?${params}`);
  }

  async getTopCustomers() {
    return this.request('/analytics/top-customers');
  }

  // Bulk Import
  async bulkImport(payload: any) {
    return this.request('/bulk-import', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Permissions
  async getPermissions() {
    return this.request('/permissions');
  }

  async addPermission(payload: { email: string, access_level: string }) {
    return this.request('/permissions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async deletePermission(id: number) {
    return this.request(`/permissions/${id}`, {
      method: 'DELETE'
    });
  }
}

export const dbService = new ApiService();
