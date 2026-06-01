import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, ShoppingCart, ChevronRight, Loader2, Calendar, User, Tag, CreditCard, FileUp
} from 'lucide-react';
import { Order } from '../types';
import * as XLSX from 'xlsx';

interface OrderPortalProps {
  onAddOrder: () => void;
  onViewOrder: (id: number) => void;
}

import { dbService } from '../services/db_service';

export const OrderPortal: React.FC<OrderPortalProps> = ({ onAddOrder, onViewOrder }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    search: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await dbService.getOrders({ ...filters, search: searchQuery, status: statusFilter });
      setOrders(data);
      console.log(`[ClientDB] Retrieved ${data.length} orders.`);
    } catch (error) {
      console.error('Failed to retrieve orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters, searchQuery, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Simulated bulk import for prototype
        console.log("[ClientDB] Simulated bulk import success with data:", data);
        alert('Bulk data synchronized in prototype mode.');
        fetchOrders();
      } catch (error) {
        console.error('Import error', error);
        alert('Failed to parse Excel file. Please ensure it matches the required structure.');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Order Management</h2>
          <p className="text-[#666666] text-sm mt-1">Record and track customer orders and invoices</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".xlsx, .xls, .csv"
          />
          <button 
            onClick={handleImportClick}
            disabled={importing}
            className="industrial-btn-secondary flex items-center justify-center gap-2"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
            Import Excel
          </button>
          <button 
            onClick={onAddOrder}
            className="industrial-btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Order
          </button>
        </div>
      </div>

      <div className="industrial-card p-4 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input 
              type="text"
              placeholder="Search by order number or customer..."
              className="industrial-input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="industrial-btn-secondary">Search</button>
        </form>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold uppercase text-[#999999] whitespace-nowrap">Status Filter</label>
          <select 
            className="industrial-input py-2 text-xs w-32"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      <div className="industrial-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Order Details</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Branch Code</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#999999]" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#666666] text-sm italic">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr 
                    key={o.id} 
                    className="hover:bg-[#FBFBFB] transition-colors cursor-pointer group"
                    onClick={() => onViewOrder(o.id!)}
                  >
                    <td className="px-4 py-4">
                      <div className="font-bold text-sm">{o.order_number}</div>
                      <div className="text-[10px] text-[#999999] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {new Date(o.order_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">{o.customer?.name}</div>
                      <div className="text-[10px] text-[#999999] uppercase">{o.invoice_no || 'No Invoice'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-bold text-[#0047FF]">{o.branch_code || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">{o.product_type}</div>
                      <div className="text-[10px] text-[#999999]">{o.size}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-bold">₹{o.final_amount.toLocaleString()}</div>
                      <div className="text-[10px] text-[#999999]">{o.quantity} Units</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold rounded uppercase ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight className="w-4 h-4 text-[#D1D1D1] group-hover:text-[#1A1A1A] transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
