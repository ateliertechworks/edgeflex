import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingCart, Building2, Package, CreditCard, Truck, FileText, Loader2, Calendar, User, MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import { Order } from '../types';

interface OrderProfileProps {
  orderId: number;
  onBack: () => void;
  onEdit?: () => void;
}

import { dbService } from '../services/db_service';

export const OrderProfile: React.FC<OrderProfileProps> = ({ orderId, onBack, onEdit }) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      // Using getOrders and filtering for prototype since I didn't add getOrder to service yet
      const allOrders = await dbService.getOrders();
      const data = allOrders.find((o: any) => o.id === orderId);
      if (data) {
        setOrder(data);
        console.log(`[ClientDB] Loaded order profile: ${data.order_number}`);
      } else {
        throw new Error('Order not found');
      }
    } catch (error) {
      console.error('Failed to fetch order details', error);
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

  if (!order) return <div className="text-center p-12">Order not found.</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
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
            <h2 className="text-2xl font-bold text-[#1A1A1A]">{order.order_number}</h2>
            <span className={`px-2 py-0.5 border text-[10px] font-bold rounded uppercase ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-[#666666] text-sm mt-1">Order Details & Financial Summary</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              if (window.confirm(`Permanently delete order ${order.order_number}?`)) {
                try {
                  await dbService.deleteOrder(orderId);
                  console.log(`[Edgeflex] Order ${orderId} deleted.`);
                  onBack();
                } catch (error) {
                  alert(`Failed to delete order: ${error || 'Unknown error'}`);
                }
              }
            }}
            className="industrial-btn-danger"
          >
            Delete Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Summary */}
        <div className="space-y-6">
          <div className="industrial-card p-6">
            <h3 className="industrial-label mb-4">Order Metadata</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#666666]">Order Date</span>
                <span className="text-sm font-medium">{order.order_date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#666666]">Financial Year</span>
                <span className="text-sm font-medium">{order.year}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#666666]">Sales Person</span>
                <span className="text-sm font-medium">{order.sales_person || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="industrial-card p-6">
            <h3 className="industrial-label mb-4">Customer Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#F0F0F0] flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#666666]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#999999]">Customer</p>
                  <p className="text-sm font-bold">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#F0F0F0] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#666666]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#999999]">Branch / Location</p>
                  <p className="text-sm font-medium">{order.branch_name} ({order.branch_location})</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="industrial-card">
            <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#1A1A1A]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Product & Quantity</h3>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="industrial-label">Product Type</p>
                <p className="text-sm font-bold">{order.product_type}</p>
              </div>
              <div>
                <p className="industrial-label">Code</p>
                <p className="text-sm font-medium">{order.product_code || 'N/A'}</p>
              </div>
              <div>
                <p className="industrial-label">Size</p>
                <p className="text-sm font-medium">{order.size || 'N/A'}</p>
              </div>
              <div>
                <p className="industrial-label">Quantity</p>
                <p className="text-sm font-bold">{order.quantity} Units</p>
              </div>
            </div>
          </div>

          <div className="industrial-card">
            <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#1A1A1A]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Pricing & Tax</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="industrial-label">Unit Price ({order.currency})</p>
                  <p className="text-sm font-medium">{order.unit_price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="industrial-label">Conv. Rate</p>
                  <p className="text-sm font-medium">{order.conversion_rate}</p>
                </div>
                <div>
                  <p className="industrial-label">Unit Price (INR)</p>
                  <p className="text-sm font-bold">₹{order.unit_price_inr.toLocaleString()}</p>
                </div>
                <div>
                  <p className="industrial-label">Total (INR)</p>
                  <p className="text-sm font-bold">₹{order.total_price.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-[#F0F0F0] flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div className="text-right md:text-left">
                  <p className="industrial-label">Tax ({order.tax_percent}%)</p>
                  <p className="text-sm font-medium">₹{order.tax_amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="industrial-label">Final Amount</p>
                  <p className="text-2xl font-black">₹{order.final_amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="industrial-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-[#1A1A1A]" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">Delivery</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-[#666666]">Expected Date</span>
                  <span className="text-sm font-medium">{order.delivery_date || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="industrial-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-[#1A1A1A]" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">Invoice</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-[#666666]">Invoice No</span>
                  <span className="text-sm font-bold">{order.invoice_number || 'NOT ISSUED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[#666666]">Invoice Date</span>
                  <span className="text-sm font-medium">{order.invoice_date || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
