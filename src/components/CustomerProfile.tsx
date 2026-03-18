import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Building2, Factory, Mail, Phone, CreditCard, MapPin, Briefcase, Loader2, TrendingUp, Package, Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Customer } from '../types';

interface CustomerProfileProps {
  customerId: number;
  onBack: () => void;
  onEdit: () => void;
}

import { dbService } from '../services/db_service';

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ customerId, onBack, onEdit }) => {
  const [customer, setCustomer] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const data = await dbService.getCustomer(customerId);
      if (data) {
        setCustomer(data);
        // Mock analytics for the profile view using actual orders from backend
        const orders = await dbService.getOrders();
        const customerOrders = orders.filter((o: any) => o.customer_id === customerId);
        const totalValue = customerOrders.reduce((sum: any, o: any) => sum + (o.final_amount || 0), 0);
        setAnalytics({
          summary: {
            total_spent: totalValue,
            total_orders: customerOrders.length,
            pending_orders: customerOrders.filter((o: any) => o.status === 'Pending').length,
            last_order_date: customerOrders.length ? customerOrders[0].order_date : 'N/A'
          },
          productDist: [
            { name: 'MEJ', value: 12 },
            { name: 'FEJ', value: 8 },
            { name: 'NMEJ', value: 15 }
          ],
          monthlySales: [
            { month: '01', revenue: 4000 },
            { month: '02', revenue: 3000 },
            { month: '03', revenue: 2000 }
          ]
        });
        console.log(`[Edgeflex] Loaded profile for: ${data.name}`);
      } else {
        throw new Error('Entity not found');
      }
    } catch (error) {
      console.error('Failed to fetch customer profile', error);
      alert('Entity data missing or corrupted.');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
    </div>
  );

  if (!customer) return <div className="text-center p-12">Customer not found.</div>;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = analytics?.monthlySales.map((item: any) => ({
    ...item,
    name: monthNames[parseInt(item.month) - 1]
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-12"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">{customer.name}</h2>
            <span className="px-2 py-0.5 bg-[#1A1A1A] text-white text-[10px] font-bold rounded uppercase">
              {customer.type}
            </span>
          </div>
          <p className="text-[#666666] text-sm mt-1">Industrial Client Profile & Performance Summary</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onEdit}
            className="industrial-btn-secondary flex items-center gap-2"
          >
            Edit Profile
          </button>
          <button 
            onClick={async () => {
              if (window.confirm(`Permanently delete ${customer.name} and all associated data?`)) {
                try {
                  await dbService.deleteCustomer(customerId);
                  console.log(`[Edgeflex] Customer ${customerId} deleted from profile.`);
                  onBack();
                } catch (error) {
                  alert(`Failed to delete customer: ${error || 'Unknown error'}`);
                }
              }
            }}
            className="industrial-btn-danger"
          >
            Delete Profile
          </button>
        </div>
      </div>

      {/* Customer Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="industrial-card p-4 border-l-4 border-emerald-500">
          <p className="industrial-label">Total Lifetime Value</p>
          <h4 className="text-xl font-black mt-1">{formatCurrency(analytics?.summary.total_spent || 0)}</h4>
        </div>
        <div className="industrial-card p-4 border-l-4 border-[#1A1A1A]">
          <p className="industrial-label">Total Orders</p>
          <h4 className="text-xl font-black mt-1">{analytics?.summary.total_orders || 0}</h4>
        </div>
        <div className="industrial-card p-4 border-l-4 border-amber-500">
          <p className="industrial-label">Pending Orders</p>
          <h4 className="text-xl font-black mt-1">{analytics?.summary.pending_orders || 0}</h4>
        </div>
        <div className="industrial-card p-4 border-l-4 border-blue-500">
          <p className="industrial-label">Last Order Date</p>
          <h4 className="text-xl font-black mt-1">{analytics?.summary.last_order_date || 'N/A'}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="industrial-card p-6">
            <h3 className="industrial-label mb-4">Core Identification</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#666666]">GST Number</span>
                <span className="text-sm font-mono font-bold">{customer.gst_number || 'NOT REGISTERED'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#666666]">Industry Sector</span>
                <span className="text-sm font-semibold">{customer.industry_type}</span>
              </div>
            </div>
          </div>

          <div className="industrial-card p-6">
            <h3 className="industrial-label mb-4">Contact Channels</h3>
            <div className="space-y-6">
              {customer.contacts?.map((contact: any, idx: number) => (
                <div key={idx} className="space-y-3 pt-4 first:pt-0 border-t border-dashed border-[#F0F0F0] first:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-3 h-3 text-[#1A1A1A]" />
                    <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">
                      {contact.name || 'UNNAMED CONTACT'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-[#F0F0F0] flex items-center justify-center">
                        <Mail className="w-3 h-3 text-[#666666]" />
                      </div>
                      <p className="text-xs font-medium truncate">{contact.email || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-[#F0F0F0] flex items-center justify-center">
                        <Phone className="w-3 h-3 text-[#666666]" />
                      </div>
                      <p className="text-xs font-medium">{contact.phone1 || 'N/A'}</p>
                    </div>
                    {contact.phone2 && (
                      <div className="flex items-center gap-3 ml-9">
                        <p className="text-[10px] text-[#999999]">{contact.phone2}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Distribution for this customer */}
          <div className="industrial-card p-6">
            <h3 className="industrial-label mb-6">Product Mix</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.productDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5E5" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    width={80}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#1A1A1A' }}
                  />
                  <Tooltip cursor={{ fill: '#F0F0F0' }} />
                  <Bar dataKey="value" fill="#1A1A1A" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Trend for this customer */}
          <div className="industrial-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Purchase History Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCustomer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999999' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999999' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip formatter={(val: any) => [formatCurrency(val), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorCustomer)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="industrial-card">
            <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-[#1A1A1A]" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Active Branches</h3>
              </div>
              <span className="text-[10px] font-bold text-[#999999] uppercase">
                {customer.branches?.length || 0} Registered
              </span>
            </div>
            <div className="divide-y divide-[#F0F0F0]">
              {customer.branches?.map((b, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{b.name}</p>
                    <p className="text-xs text-[#666666] flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {b.location}
                    </p>
                  </div>
                  {b.manager && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-[#999999]">Manager</p>
                      <p className="text-xs font-medium">{b.manager}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customer.addresses?.map((addr, idx) => (
              <div key={idx} className="industrial-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  {addr.address_type === 'billing' ? <CreditCard className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">
                    {addr.address_type} Address
                  </h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{addr.line1}</p>
                  <p className="text-[#666666]">{addr.state}, {addr.country}</p>
                  <p className="text-[#666666] font-mono text-xs mt-2">PIN: {addr.pincode}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
