/**
 * Edgeflex Mock Data Service
 * Stores data in localStorage for client-side demo/testing.
 */

// Mock data structures
interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  industry: string;
  createdAt: string;
}

interface Order {
  id: number;
  customerId: number;
  orderNumber: string;
  amount: number;
  status: string;
  orderDate: string;
  dueDate: string;
}

// Initialize with some demo data
const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'John Anderson',
    email: 'john@techcorp.com',
    company: 'TechCorp Inc',
    phone: '+1-555-0101',
    industry: 'Technology',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@manufacturing.com',
    company: 'Manufacturing Solutions',
    phone: '+1-555-0102',
    industry: 'Manufacturing',
    createdAt: '2024-02-10'
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael@finance.com',
    company: 'Finance Global',
    phone: '+1-555-0103',
    industry: 'Finance',
    createdAt: '2024-03-05'
  }
];

const DEMO_ORDERS: Order[] = [
  {
    id: 1,
    customerId: 1,
    orderNumber: 'ORD-2024-001',
    amount: 15000,
    status: 'Completed',
    orderDate: '2024-01-20',
    dueDate: '2024-02-20'
  },
  {
    id: 2,
    customerId: 1,
    orderNumber: 'ORD-2024-002',
    amount: 22500,
    status: 'In Progress',
    orderDate: '2024-03-01',
    dueDate: '2024-04-01'
  },
  {
    id: 3,
    customerId: 2,
    orderNumber: 'ORD-2024-003',
    amount: 18000,
    status: 'Pending',
    orderDate: '2024-03-10',
    dueDate: '2024-04-10'
  }
];

class MockDataService {
  private storagePrefix = 'edgeflex_';

  private getStorageKey(entity: string) {
    return this.storagePrefix + entity;
  }

  private initializeIfNeeded() {
    if (!localStorage.getItem(this.getStorageKey('customers'))) {
      localStorage.setItem(this.getStorageKey('customers'), JSON.stringify(DEMO_CUSTOMERS));
      localStorage.setItem(this.getStorageKey('customers_id_counter'), '3');
    }
    if (!localStorage.getItem(this.getStorageKey('orders'))) {
      localStorage.setItem(this.getStorageKey('orders'), JSON.stringify(DEMO_ORDERS));
      localStorage.setItem(this.getStorageKey('orders_id_counter'), '3');
    }
  }

  // Customers
  async getCustomers(query = '') {
    this.initializeIfNeeded();
    const customers = JSON.parse(localStorage.getItem(this.getStorageKey('customers')) || '[]');
    if (query) {
      return customers.filter((c: Customer) => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        c.company.toLowerCase().includes(query.toLowerCase())
      );
    }
    return customers;
  }

  async getCustomer(id: number) {
    this.initializeIfNeeded();
    const customers = JSON.parse(localStorage.getItem(this.getStorageKey('customers')) || '[]');
    return customers.find((c: Customer) => c.id === id) || null;
  }

  async addCustomer(payload: any) {
    this.initializeIfNeeded();
    const customers = JSON.parse(localStorage.getItem(this.getStorageKey('customers')) || '[]');
    let counter = parseInt(localStorage.getItem(this.getStorageKey('customers_id_counter')) || '0');
    counter++;

    const newCustomer: Customer = {
      id: counter,
      ...payload,
      createdAt: new Date().toISOString().split('T')[0]
    };

    customers.push(newCustomer);
    localStorage.setItem(this.getStorageKey('customers'), JSON.stringify(customers));
    localStorage.setItem(this.getStorageKey('customers_id_counter'), counter.toString());
    return newCustomer;
  }

  async updateCustomer(id: number, payload: any) {
    this.initializeIfNeeded();
    const customers = JSON.parse(localStorage.getItem(this.getStorageKey('customers')) || '[]');
    const index = customers.findIndex((c: Customer) => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...payload };
      localStorage.setItem(this.getStorageKey('customers'), JSON.stringify(customers));
      return customers[index];
    }
    return null;
  }

  async deleteCustomer(id: number) {
    this.initializeIfNeeded();
    const customers = JSON.parse(localStorage.getItem(this.getStorageKey('customers')) || '[]');
    const filtered = customers.filter((c: Customer) => c.id !== id);
    localStorage.setItem(this.getStorageKey('customers'), JSON.stringify(filtered));
  }

  // Orders
  async getOrders(filters: any = {}) {
    this.initializeIfNeeded();
    let orders = JSON.parse(localStorage.getItem(this.getStorageKey('orders')) || '[]');
    
    if (filters.customerId) {
      orders = orders.filter((o: Order) => o.customerId === filters.customerId);
    }
    if (filters.status) {
      orders = orders.filter((o: Order) => o.status === filters.status);
    }
    
    return orders;
  }

  async addOrder(order: any) {
    this.initializeIfNeeded();
    const orders = JSON.parse(localStorage.getItem(this.getStorageKey('orders')) || '[]');
    let counter = parseInt(localStorage.getItem(this.getStorageKey('orders_id_counter')) || '0');
    counter++;

    const newOrder: Order = {
      id: counter,
      ...order,
      orderDate: order.orderDate || new Date().toISOString().split('T')[0]
    };

    orders.push(newOrder);
    localStorage.setItem(this.getStorageKey('orders'), JSON.stringify(orders));
    localStorage.setItem(this.getStorageKey('orders_id_counter'), counter.toString());
    return newOrder;
  }

  async deleteOrder(id: number) {
    this.initializeIfNeeded();
    const orders = JSON.parse(localStorage.getItem(this.getStorageKey('orders')) || '[]');
    const filtered = orders.filter((o: Order) => o.id !== id);
    localStorage.setItem(this.getStorageKey('orders'), JSON.stringify(filtered));
  }

  // Analytics
  async getAnalyticsSummary(filters: any = {}) {
    this.initializeIfNeeded();
    const orders = await this.getOrders(filters);
    const totalRevenue = orders.reduce((sum: number, o: Order) => sum + o.amount, 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o: Order) => o.status === 'Completed').length;

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  }

  async getSalesByMonth(filters: any = {}) {
    this.initializeIfNeeded();
    const orders = await this.getOrders(filters);
    
    const monthlyData: { [key: string]: number } = {};
    orders.forEach((order: Order) => {
      const month = order.orderDate.substring(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + order.amount;
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      sales: amount
    }));
  }

  async getRevenueByIndustry(filters: any = {}) {
    this.initializeIfNeeded();
    const customers = await this.getCustomers();
    const orders = await this.getOrders(filters);

    const industryRevenue: { [key: string]: number } = {};
    orders.forEach((order: Order) => {
      const customer = customers.find((c: Customer) => c.id === order.customerId);
      if (customer) {
        const industry = customer.industry;
        industryRevenue[industry] = (industryRevenue[industry] || 0) + order.amount;
      }
    });

    return Object.entries(industryRevenue).map(([industry, revenue]) => ({
      industry,
      revenue
    }));
  }

  async getTopCustomers() {
    this.initializeIfNeeded();
    const customers = await this.getCustomers();
    const orders = await this.getOrders();

    const customerRevenue: { [key: number]: number } = {};
    orders.forEach((order: Order) => {
      customerRevenue[order.customerId] = (customerRevenue[order.customerId] || 0) + order.amount;
    });

    return customers
      .map(c => ({
        ...c,
        totalSpent: customerRevenue[c.id] || 0
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }

  // Bulk Import
  async bulkImport(payload: any) {
    this.initializeIfNeeded();
    if (payload.customers) {
      for (const customer of payload.customers) {
        await this.addCustomer(customer);
      }
    }
    return { success: true, message: 'Data imported successfully' };
  }

  // Permissions (mock)
  async getPermissions() {
    return {
      sharesByMe: [],
      sharesToMe: []
    };
  }

  async addPermission(payload: { email: string; access_level: string }) {
    return { success: true };
  }

  async deletePermission(id: number) {
    return { success: true };
  }
}

export const dbService = new MockDataService();
