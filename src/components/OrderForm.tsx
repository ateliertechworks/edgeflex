import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingCart, Building2, Package, CreditCard, Truck, FileText, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { dbService } from '../services/db_service';

interface OrderFormProps {
  onBack: () => void;
  onSuccess: (id: number) => void;
  editId?: number;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    order_number: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    order_date: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear(),
    sales_person: '',
    status: 'Pending',
    customer_id: 0,
    branch_id: 0,
    product_type: 'MEJ',
    product_code: '',
    size: '',
    hsn_code: '',
    quantity: 1,
    currency: 'INR',
    unit_price: 0,
    conversion_rate: 1,
    unit_price_inr: 0,
    total_price: 0,
    delivery_date: '',
    invoice_number: '',
    invoice_date: '',
    tax_percent: 18,
    tax_amount: 0,
    final_amount: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const data = await dbService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load initial form data', error);
    }
  };

  const handleCustomerChange = async (customerId: number) => {
    try {
      const data = await dbService.getCustomer(customerId);
      setSelectedCustomer(data);
      setFormData(prev => ({ 
        ...prev, 
        customer_id: customerId,
        branch_id: data?.branches?.[0]?.id || 0
      }));
    } catch (error) {
      console.error('Failed to load customer details', error);
    }
  };

  // Calculations
  useEffect(() => {
    const unitPrice = Number(formData.unit_price) || 0;
    const convRate = Number(formData.conversion_rate) || 1;
    const qty = Number(formData.quantity) || 0;
    const taxPct = Number(formData.tax_percent) || 0;

    const unitPriceInr = unitPrice * convRate;
    const totalPrice = unitPriceInr * qty;
    const taxAmount = totalPrice * (taxPct / 100);
    const finalAmount = totalPrice + taxAmount;

    setFormData(prev => ({
      ...prev,
      unit_price_inr: unitPriceInr,
      total_price: totalPrice,
      tax_amount: taxAmount,
      final_amount: finalAmount
    }));
  }, [formData.unit_price, formData.conversion_rate, formData.quantity, formData.tax_percent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic for adding/updating order in dbService
      const result = await dbService.addOrder(formData);
      console.log(`[Edgeflex] Order created: ${result.order_number}`);
      onSuccess(result.id);
    } catch (error) {
      console.error('Failed to save order', error);
      alert('Error saving order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Create New Order</h2>
          <p className="text-[#666666] text-sm mt-1">Register a new customer order and pricing details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Order Information */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
            <ShoppingCart className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Order Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="industrial-label">Order Number</label>
              <input readOnly type="text" className="industrial-input bg-gray-50 font-bold" value={formData.order_number} />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Order Date</label>
              <input 
                type="date" 
                className="industrial-input" 
                value={formData.order_date}
                onChange={(e) => setFormData({...formData, order_date: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Financial Year</label>
              <input readOnly type="text" className="industrial-input bg-gray-50" value={formData.year} />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Sales Person</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder="Name"
                value={formData.sales_person}
                onChange={(e) => setFormData({...formData, sales_person: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* 2. Customer Information */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
            <Building2 className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Customer Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="industrial-label">Select Customer</label>
              <select 
                required
                className="industrial-input"
                value={formData.customer_id}
                onChange={(e) => handleCustomerChange(Number(e.target.value))}
              >
                <option value="">Select a customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Select Branch</label>
              <select 
                required
                className="industrial-input"
                value={formData.branch_id}
                onChange={(e) => setFormData({...formData, branch_id: Number(e.target.value)})}
              >
                <option value="">Select a branch...</option>
                {selectedCustomer?.branches?.map(b => <option key={b.id} value={b.id}>{b.name} ({b.location})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Industry (Auto)</label>
              <input readOnly type="text" className="industrial-input bg-gray-50" value={selectedCustomer?.industry_type || ''} />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Location (Auto)</label>
              <input readOnly type="text" className="industrial-input bg-gray-50" value={selectedCustomer?.branches?.find(b => b.id === formData.branch_id)?.location || ''} />
            </div>
          </div>
        </div>

        {/* 3. Product Information */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
            <Package className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Product Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="industrial-label">Product Type</label>
              <select 
                className="industrial-input"
                value={formData.product_type}
                onChange={(e) => setFormData({...formData, product_type: e.target.value})}
              >
                <option>MEJ</option>
                <option>RMEJ</option>
                <option>FEJ</option>
                <option>NMEJ</option>
                <option>Damper</option>
                <option>P&F</option>
                <option>Others</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Product Code</label>
              <input 
                type="text" 
                className="industrial-input" 
                value={formData.product_code}
                onChange={(e) => setFormData({...formData, product_code: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Size</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder='e.g. 10"'
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">HSN Code</label>
              <input 
                type="text" 
                className="industrial-input" 
                value={formData.hsn_code}
                onChange={(e) => setFormData({...formData, hsn_code: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Quantity</label>
              <input 
                type="number" 
                className="industrial-input" 
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>

        {/* 4. Price & Currency */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
            <CreditCard className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Price & Currency</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="industrial-label">Currency</label>
              <select 
                className="industrial-input"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value as any})}
              >
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Unit Price</label>
              <input 
                type="number" 
                className="industrial-input" 
                value={formData.unit_price}
                onChange={(e) => setFormData({...formData, unit_price: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Conversion Rate</label>
              <input 
                type="number" 
                step="0.01"
                className="industrial-input" 
                value={formData.conversion_rate}
                onChange={(e) => setFormData({...formData, conversion_rate: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Unit Price (INR)</label>
              <input readOnly type="text" className="industrial-input bg-gray-50 font-semibold" value={formData.unit_price_inr?.toFixed(2)} />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Total Price (INR)</label>
              <input readOnly type="text" className="industrial-input bg-gray-50 font-bold" value={formData.total_price?.toFixed(2)} />
            </div>
          </div>
        </div>

        {/* 5. Delivery & Invoice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="industrial-card p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
              <Truck className="w-4 h-4 text-[#1A1A1A]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Delivery Details</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="industrial-label">Expected Delivery Date</label>
                <input 
                  type="date" 
                  className="industrial-input" 
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="industrial-label">Order Status</label>
                <select 
                  className="industrial-input"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="industrial-card p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
              <FileText className="w-4 h-4 text-[#1A1A1A]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Invoice Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="industrial-label">Invoice Number</label>
                <input 
                  type="text" 
                  className="industrial-input" 
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="industrial-label">Invoice Date</label>
                <input 
                  type="date" 
                  className="industrial-input" 
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="industrial-label">Tax % (GST)</label>
                <input 
                  type="number" 
                  className="industrial-input" 
                  value={formData.tax_percent}
                  onChange={(e) => setFormData({...formData, tax_percent: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <label className="industrial-label">Tax Amount</label>
                <input readOnly type="text" className="industrial-input bg-gray-50" value={formData.tax_amount?.toFixed(2)} />
              </div>
            </div>
            <div className="pt-4 border-t border-[#F0F0F0]">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase text-[#666666]">Final Amount (INR)</span>
                <span className="text-xl font-black">₹{formData.final_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onBack} className="industrial-btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="industrial-btn-primary px-12 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Order
          </button>
        </div>
      </form>
    </div>
  );
};
