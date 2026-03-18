/**
 * Edgeflex API Service
 * Communicates with the PostgreSQL/Express backend.
 */

import { auth } from './firebase_config';

const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
  private async getAuthToken() {
    return await auth.currentUser?.getIdToken();
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...((options.headers as any) || {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      throw new Error('Unauthorized Access Detected');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    if (response.status === 204) return null;
    return response.json();
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
