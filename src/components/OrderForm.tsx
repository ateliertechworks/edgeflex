import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingCart, Package, CreditCard, Truck, FileText, Loader2, PlusCircle, Trash2
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
    payment_duration_days: 0,
    branch_code: '',
    year: new Date().getFullYear(),
    status: 'Pending',
    customer_id: 0,
    product_type: 'MEJ',
    product_code: '',
    // product items (multiple products per order)
    items: [
      {
        product_type: 'MEJ',
        product_code: '',
        size_a: '',
        size_b: '',
        quantity: 1,
        hsn_code: '',
        description: '',
        unit_price: 0,
        unit_currency: 'INR',
        currency_conv: 1,
        delivery_date: ''
      }
    ],
    currency: 'INR',
    unit_price: 0,
    conversion_rate: 1,
    unit_price_inr: 0,
    total_price: 0,
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

  // Item helpers: add/remove/update
  const addItem = () => {
    setFormData((prev: any) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_type: 'MEJ',
          product_code: '',
          size_a: '',
          size_b: '',
          quantity: 1,
          hsn_code: '',
          description: '',
          unit_price: 0,
          unit_currency: prev.currency || 'INR',
          currency_conv: prev.conversion_rate || 1,
          delivery_date: ''
        }
      ]
    }));
  };

  const updateItem = (index: number, key: string, value: any) => {
    setFormData((prev: any) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, items };
    });
  };

  const removeItem = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      items: (prev.items || []).filter((_: any, i: number) => i !== index)
    }));
  };

  // Calculations (aggregate over items using item.unit_price and per-item conversion)
  useEffect(() => {
    const taxPct = Number(formData.tax_percent) || 0;

    const totalPrice = (formData.items || []).reduce((sum: number, it: any) => {
      const price = Number(it.unit_price || formData.unit_price || 0);
      const qty = Number(it.quantity || 0);
      const conv = Number(it.currency_conv || formData.conversion_rate || 1);
      const priceInr = price * conv;
      return sum + (priceInr * qty);
    }, 0);

    const firstItemPrice = (formData.items && Number(formData.items[0]?.unit_price)) || Number(formData.unit_price) || 0;
    const firstItemConv = (formData.items && Number(formData.items[0]?.currency_conv)) || Number(formData.conversion_rate) || 1;
    const unitPriceInr = firstItemPrice * firstItemConv;
    const taxAmount = totalPrice * (taxPct / 100);
    const finalAmount = totalPrice + taxAmount;

    setFormData((prev: any) => ({
      ...prev,
      unit_price_inr: unitPriceInr,
      total_price: totalPrice,
      tax_amount: taxAmount,
      final_amount: finalAmount
    }));
  }, [formData.conversion_rate, formData.tax_percent, JSON.stringify(formData.items), formData.unit_price]);

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

  const summaryTotals = (formData.items || []).reduce(
    (acc: any, it: any) => {
      const unit = Number(it.unit_price || 0);
      const qty = Number(it.quantity || 0);
      const conv = Number(it.currency_conv || formData.conversion_rate || 1);
      const totalCurrency = unit * qty;
      const totalInr = unit * conv * qty;
      acc.totalQty += qty;
      acc.totalCurrency += totalCurrency;
      acc.totalInr += totalInr;
      return acc;
    },
    { totalQty: 0, totalCurrency: 0, totalInr: 0 }
  );

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
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 p-4 bg-blue-50 rounded border border-blue-200">
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

        {/* 3. Product Information (multiple items) */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center justify-between gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#1A1A1A]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Product Information</h3>
            </div>
            <div className="flex items-center gap-3">
              <select className="industrial-input w-36" value={formData.currency} onChange={(e) => {
                const cur = e.target.value;
                setFormData((prev: any) => ({
                  ...prev,
                  currency: cur,
                  items: (prev.items || []).map((it: any) => ({ ...it, unit_currency: cur }))
                }));
              }}>
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
              <button type="button" onClick={addItem} className="flex items-center gap-2 text-sm font-black text-indigo-600">
                <PlusCircle className="w-5 h-5" /> Add Product
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(formData.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-4 border rounded bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold">Product {idx + 1} — Item: {formData.order_number}-{idx + 1}</div>
                  <div className="flex items-center gap-2">
                    { (formData.items || []).length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="industrial-label">Item No</label>
                    <input readOnly type="text" className="industrial-input bg-gray-50" value={`${formData.order_number}-${idx + 1}`} />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="industrial-label">Product Type</label>
                    <select className="industrial-input" value={item.product_type} onChange={(e) => updateItem(idx, 'product_type', e.target.value)}>
                      <option>MEJ</option>
                      <option>RMEJ</option>
                      <option>FEJ</option>
                      <option>NMEJ</option>
                      <option>Damper</option>
                      <option>P&F</option>
                      <option>Others</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="industrial-label">Size A</label>
                    <input type="text" className="industrial-input" value={item.size_a} onChange={(e) => updateItem(idx, 'size_a', e.target.value)} placeholder='e.g. 1000' />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="industrial-label">Size B</label>
                    <input type="text" className="industrial-input" value={item.size_b} onChange={(e) => updateItem(idx, 'size_b', e.target.value)} placeholder='e.g. 1000' />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="industrial-label">Quantity</label>
                    <input type="number" className="industrial-input" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="industrial-label">HSN Code</label>
                    <input type="text" className="industrial-input" value={item.hsn_code} onChange={(e) => updateItem(idx, 'hsn_code', e.target.value)} />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="industrial-label">Unit Price</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="industrial-input"
                      value={item.unit_price}
                      onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="industrial-label">Description</label>
                  <textarea className="industrial-input h-20" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Table: Item Prices */}
        <div className="industrial-card p-4">
          <h4 className="text-sm font-bold mb-3">Items Summary</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                        <tr className="text-left text-[10px] text-black/50 uppercase">
                          <th className="p-2">S.No</th>
                          <th className="p-2">Item</th>
                          <th className="p-2">Unit Price ({formData.currency})</th>
                          <th className="p-2">Total Price ({formData.currency})</th>
                          <th className="p-2">Delivery Date</th>
                          <th className="p-2">Currency Conv</th>
                          <th className="p-2">Unit Price (INR)</th>
                          <th className="p-2">Total Price (INR)</th>
                        </tr>
              </thead>
              <tbody>
                {(formData.items || []).map((it: any, i: number) => {
                  const unit = Number(it.unit_price || 0);
                  const qty = Number(it.quantity || 0);
                  const conv = Number(it.currency_conv || formData.conversion_rate || 1);
                  const unitInr = unit * conv;
                  const total = unit * qty;
                  const totalInr = unitInr * qty;
                  return (
                    <tr key={i} className="border-t">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">{formData.order_number}-{i+1}</td>
                      <td className="p-2">{unit.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                      <td className="p-2">{total.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                      <td className="p-2"><input type="date" className="industrial-input" value={it.delivery_date || ''} onChange={(e)=>updateItem(i,'delivery_date', e.target.value)} /></td>
                      <td className="p-2"><input type="text" inputMode="decimal" className="industrial-input w-28" value={it.currency_conv !== undefined ? it.currency_conv : formData.conversion_rate} onChange={(e)=>updateItem(i,'currency_conv', Number(e.target.value))} /></td>
                      <td className="p-2">₹{unitInr.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                      <td className="p-2">₹{totalInr.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                    </tr>
                  )
                })}
                <tr className="border-t font-bold">
                  <td className="p-2">&nbsp;</td>
                  <td className="p-2">Totals</td>
                  <td className="p-2">&nbsp;</td>
                  <td className="p-2">{summaryTotals.totalCurrency.toLocaleString(undefined,{minimumFractionDigits:2})} {formData.currency}</td>
                  <td className="p-2">Total Qty: {summaryTotals.totalQty}</td>
                  <td className="p-2">&nbsp;</td>
                  <td className="p-2">₹{summaryTotals.totalInr.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                  <td className="p-2">₹{summaryTotals.totalInr.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Removed Price & Currency, Delivery Details, and Invoice Details as requested */}

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
