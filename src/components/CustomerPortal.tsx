import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Building2, ChevronRight, Loader2, Factory, MapPin, Mail, Phone, CreditCard, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer } from '../types';

interface CustomerPortalProps {
  onAddCustomer: () => void;
  onViewProfile: (id: number) => void;
  onEditCustomer: (id: number) => void;
}

import { dbService } from '../services/db_service';

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onAddCustomer, onViewProfile, onEditCustomer }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async (query = '') => {
    setLoading(true);
    try {
      // Use client-side service instead of fetch
      const data = await dbService.getCustomers(query);
      setCustomers(data);
      console.log(`[ClientDB] Retrieved ${data.length} customers.`);
    } catch (error) {
      console.error('Failed to retrieve customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchQuery);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Customer Portal</h2>
          <p className="text-[#666666] text-sm mt-1">Manage and track your industrial client base</p>
        </div>
        <button 
          onClick={onAddCustomer}
          className="industrial-btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Customer
        </button>
      </div>

      <div className="industrial-card p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input 
              type="text"
              placeholder="Search by customer name..."
              className="industrial-input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="industrial-btn-secondary">Search</button>
        </form>
      </div>

      <div className="industrial-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Customer Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Industry</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">GST Number</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#999999]" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#666666] text-sm italic">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-[#FBFBFB] transition-colors cursor-pointer group"
                    onClick={() => onViewProfile(c.id!)}
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-sm">{c.name}</div>
                      <div className="text-[10px] text-[#999999] uppercase mt-0.5">ID: {c.id?.toString().padStart(4, '0')}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 bg-[#F0F0F0] text-[#666666] text-[10px] font-bold rounded uppercase">
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#444444]">{c.industry_type}</td>
                    <td className="px-4 py-4 font-mono text-xs text-[#666666]">{c.gst_number || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCustomer(c.id!);
                          }}
                          className="px-3 py-1 border border-black/10 text-black/60 text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all rounded"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation(); // Stop propagation to prevent row click
                            if (window.confirm(`Are you sure you want to delete ${c.name}? This will remove all associated branches and contacts.`)) {
                              setLoading(true);
                              try {
                                await dbService.deleteCustomer(c.id);
                                console.log(`[ClientDB] Customer ${c.id} deleted.`);
                                await fetchCustomers(searchQuery);
                              } catch (error: any) { // Explicitly type error as 'any' or 'unknown'
                                alert(`Delete failed: ${error.message || 'Unknown error'}`);
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          className="px-3 py-1 border border-red-500/20 text-red-600 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all ml-3 rounded"
                        >
                          Delete
                        </button>
                        <ChevronRight className="w-4 h-4 text-[#D1D1D1] group-hover:text-[#1A1A1A] transition-colors" />
                      </div>
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
