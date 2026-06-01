import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingCart, Package, CreditCard, Truck, FileText, Loader2
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
    po_number: '',
    project: '',
    state: '',
    pincode: '',
    contact_person: '',
    mobile: '',
    delivery_terms: '',
    payment_terms: '',
    credit_delivery_date: '',
    payment_duration_days: 0,
    branch_code: '',
    year: new Date().getFullYear(),
    status: 'Pending',
    customer_id: 0,
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
      const firstContact = data?.contacts?.[0];
      setFormData((prev: any) => ({ 
        ...prev, 
        customer_id: customerId,
        state: data?.state || '',
        pincode: data?.pincode || '',
        contact_person: firstContact?.name || '',
        mobile: firstContact?.phone1 || '',
        branch_code: data?.branch_code || '',
        delivery_terms: 'Ex Works',
        payment_terms: 'Advance'
      }));
    } catch (error) {
      console.error('Failed to load customer details', error);
    }
  };

  // Generate a default order number in the format YYNNN (e.g. 26001)
  useEffect(() => {
    const generateDefaultOrderNumber = async () => {
      try {
        const orders = await dbService.getOrders();
        const year = new Date().getFullYear().toString().slice(-2);
        let maxSeq = 0;

        orders.forEach((o: any) => {
          if (!o?.order_number) return;
          // try to find sequence after the year (e.g., '26' followed by digits)
          const match = o.order_number.match(new RegExp(`${year}(\\d{3,})`));
          if (match) {
            const seq = parseInt(match[1], 10);
            if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
            return;
          }
          // fallback: take trailing 3+ digits
          const trailing = o.order_number.match(/(\\d{3,})$/);
          if (trailing) {
            const seq = parseInt(trailing[1], 10);
            if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
          }
        });

        const next = maxSeq + 1;
        const generated = `${year}${String(next).padStart(3, '0')}`;

        // Only overwrite if current value looks like a placeholder/random id
        setFormData((prev: any) => {
          const cur = String(prev.order_number || '');
          if (cur.startsWith('ORD-') || cur.trim() === '') {
            return { ...prev, order_number: generated };
          }
          return prev;
        });
      } catch (err) {
        console.warn('Failed to auto-generate order number', err);
      }
    };

    generateDefaultOrderNumber();
  }, []);

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

    setFormData((prev: any) => ({
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
      console.log(`[Edgeflex] Order created: ${formData.order_number}`);
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
        {/* 1. Order & Customer Information (Combined) */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
            <ShoppingCart className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Order & Customer Details</h3>
          </div>
          
          {/* Top Row: Order Reference & Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="industrial-label">Order Number (Our Ref)</label>
              <input 
                type="text" 
                className="industrial-input font-bold"
                value={formData.order_number}
                onChange={(e) => setFormData({...formData, order_number: e.target.value})}
              />
              <div className="text-[10px] text-[#999999] mt-1">Default: YY + sequence (e.g. 26001). Editable.</div>
            </div>
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
          </div>

          {/* Second Row: PO Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="industrial-label">PO Number</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder="Enter PO Number"
                value={formData.po_number || ''}
                onChange={(e) => setFormData({...formData, po_number: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">PO Date</label>
              <input 
                type="date" 
                className="industrial-input" 
                value={formData.order_date}
                onChange={(e) => setFormData({...formData, order_date: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Project</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder="Project name"
                value={formData.project || ''}
                onChange={(e) => setFormData({...formData, project: e.target.value})}
              />
            </div>
          </div>

          {/* Third Row: Location & Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="industrial-label">State</label>
              <input 
                type="text" 
                className="industrial-input" 
                value={formData.state || ''}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Pincode</label>
              <input 
                type="text" 
                className="industrial-input" 
                value={formData.pincode || ''}
                onChange={(e) => setFormData({...formData, pincode: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Contact Person</label>
              <input 
                type="text" 
                className="industrial-input" 
                value={formData.contact_person || ''}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Mobile</label>
              <input 
                type="text" 
                className="industrial-input" 
                value={formData.mobile || ''}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              />
            </div>
          </div>

          {/* Fourth Row: Delivery & Payment Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="industrial-label">Delivery Terms</label>
              <select 
                className="industrial-input"
                value={formData.delivery_terms || ''}
                onChange={(e) => setFormData({...formData, delivery_terms: e.target.value})}
              >
                <option value="">Select Delivery Terms</option>
                <option value="Ex Works">Ex Works</option>
                <option value="FOB">FOB (Free on Board)</option>
                <option value="CIF">CIF (Cost, Insurance and Freight)</option>
                <option value="DDP">DDP (Delivered Duty Paid)</option>
                <option value="DAP">DAP (Delivered at Place)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Payment Terms</label>
              <select 
                required
                className="industrial-input"
                value={formData.payment_terms || ''}
                onChange={(e) => setFormData({...formData, payment_terms: e.target.value, credit_due_date: '', payment_duration_days: 0})}
              >
                <option value="">Select Payment Terms</option>
                <option value="Advance">Advance</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
          </div>

          {/* Conditional Row: Credit Payment Details */}
          {formData.payment_terms === 'Credit' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded border border-blue-200">
              <div className="space-y-1">
                <label className="industrial-label">Delivery Date</label>
                <input 
                  type="date" 
                  className="industrial-input" 
                  value={formData.credit_delivery_date || ''}
                  onChange={(e) => setFormData({...formData, credit_delivery_date: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="industrial-label">Payment Duration (Days)</label>
                <input 
                  type="number" 
                  className="industrial-input" 
                  placeholder="e.g., 30, 60, 90"
                  value={formData.payment_duration_days || ''}
                  onChange={(e) => setFormData({...formData, payment_duration_days: Number(e.target.value)})}
                />
              </div>
            </div>
          )}

          {/* Fifth Row: Branch Code & Industry Type (Auto-populate) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#F0F0F0]">
            <div className="space-y-1">
              <label className="industrial-label">Branch Code (Auto)</label>
              <input readOnly type="text" className="industrial-input bg-gray-50 font-bold" value={formData.branch_code || '-'} />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Industry Type (Auto)</label>
              <input readOnly type="text" className="industrial-input bg-gray-50" value={selectedCustomer?.industry_type || '-'} />
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
