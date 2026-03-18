import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Loader2, Plus, ArrowLeft, Mail, Phone, Factory, CreditCard, MapPin, ShieldCheck
} from 'lucide-react';
import { Customer } from '../types';
import { dbService } from '../services/db_service';

interface CustomerFormProps {
  editId?: number;
  onBack: () => void;
  onSuccess: (id: number) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ onBack, onSuccess, editId }) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    type: 'Dealer',
    gst_number: '',
    industry_type: 'Power',
    branches: [{ name: 'Head Office', location: '', manager: '' }],
    contacts: [{ name: '', email: '', phone1: '', phone2: '' }],
    addresses: [
      { address_type: 'billing', line1: '', line2: '', state: '', country: 'India', pincode: '' },
      { address_type: 'shipping', line1: '', line2: '', state: '', country: 'India', pincode: '' }
    ]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      fetchCustomerData();
    }
  }, [editId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const data = await dbService.getCustomer(editId!);
      if (data) {
        setFormData(data);
        console.log(`[ClientDB] Form populated for: ${data.name}`);
      }
    } catch (error) {
      console.error('Failed to load customer data for editing', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        await dbService.updateCustomer(editId, formData);
        console.log(`[Edgeflex] Customer ${editId} updated.`);
        onSuccess(editId);
      } else {
        const newCustomer = await dbService.addCustomer(formData);
        console.log(`[Edgeflex] New customer added with ID: ${newCustomer.id}`);
        onSuccess(newCustomer.id);
      }
    } catch (error) {
      console.error('Submission failed', error);
      alert('Error saving customer data.');
    } finally {
      setLoading(false);
    }
  };

  const copyBillingToShipping = () => {
    const billing = formData.addresses?.find((a: any) => a.address_type === 'billing');
    if (billing) {
      setFormData({
        ...formData,
        addresses: [
          billing,
          { ...billing, address_type: 'shipping' }
        ]
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Add New Customer</h2>
          <p className="text-[#666666] text-sm mt-1">Register a new industrial partner in the Edgeflex ecosystem</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
            <Building2 className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Company Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="industrial-label">Customer Name</label>
              <input 
                required
                type="text" 
                className="industrial-input" 
                placeholder="e.g. ABC Industries Pvt Ltd"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">GST Number</label>
              <input 
                type="text" 
                className="industrial-input font-mono" 
                placeholder="15-digit GSTIN"
                value={formData.gst_number}
                onChange={(e) => setFormData({...formData, gst_number: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Customer Type</label>
              <select 
                className="industrial-input"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              >
                <option>Dealer</option>
                <option>OEM</option>
                <option>End User</option>
                <option>EPC</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Industry Type</label>
              <select 
                className="industrial-input"
                value={formData.industry_type}
                onChange={(e) => setFormData({...formData, industry_type: e.target.value as any})}
              >
                <option>Power</option>
                <option>Cement</option>
                <option>Fertiliser</option>
                <option>Steel</option>
                <option>Petro Chemicals</option>
                <option>Others</option>
              </select>
            </div>
          </div>
        </div>

        {/* Branch Details */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
            <Factory className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Branch Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="industrial-label">Branch Name</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder="e.g. Head Office"
                value={formData.branches?.[0].name}
                onChange={(e) => {
                  const branches = [...(formData.branches || [])];
                  branches[0].name = e.target.value;
                  setFormData({...formData, branches});
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Location</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder="e.g. Chennai"
                value={formData.branches?.[0].location}
                onChange={(e) => {
                  const branches = [...(formData.branches || [])];
                  branches[0].location = e.target.value;
                  setFormData({...formData, branches});
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Branch Manager</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder="Optional"
                value={formData.branches?.[0].manager}
                onChange={(e) => {
                  const branches = [...(formData.branches || [])];
                  branches[0].manager = e.target.value;
                  setFormData({...formData, branches});
                }}
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3 mb-6">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1A1A1A]" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Contact Module</h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    contacts: [...formData.contacts, { name: '', email: '', phone1: '', phone2: '' }]
                  });
                }}
                className="text-[10px] font-bold text-black/40 hover:text-black uppercase tracking-widest transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Contact
              </button>
            </div>
            <div className="space-y-8">
              {formData.contacts?.map((contact: any, idx: number) => (
                <div key={idx} className="relative space-y-4 pt-4 first:pt-0">
                  {idx > 0 && (
                    <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-[#F0F0F0]" />
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-[#999999] uppercase">Contact Person {idx + 1}</span>
                    {idx > 0 && (
                      <button 
                        type="button"
                        onClick={() => {
                          const newContacts = [...formData.contacts];
                          newContacts.splice(idx, 1);
                          setFormData({ ...formData, contacts: newContacts });
                        }}
                        className="text-[10px] font-bold text-red-500/60 hover:text-red-600 uppercase"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="industrial-label">Contact Person Name</label>
                      <input 
                        type="text" 
                        className="industrial-input" 
                        placeholder="Owner / Manager Name"
                        value={contact.name || ''}
                        onChange={(e) => {
                          const contacts = [...(formData.contacts || [])];
                          contacts[idx] = { ...contacts[idx], name: e.target.value };
                          setFormData({...formData, contacts});
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="industrial-label">Email ID</label>
                      <input 
                        type="email" 
                        className="industrial-input" 
                        placeholder="sales@company.com"
                        value={contact.email || ''}
                        onChange={(e) => {
                          const contacts = [...(formData.contacts || [])];
                          contacts[idx] = { ...contacts[idx], email: e.target.value };
                          setFormData({...formData, contacts});
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="industrial-label">Mobile Number 1</label>
                      <input 
                        type="tel" 
                        className="industrial-input" 
                        placeholder="+91..."
                        value={contact.phone1 || ''}
                        onChange={(e) => {
                          const contacts = [...(formData.contacts || [])];
                          contacts[idx] = { ...contacts[idx], phone1: e.target.value };
                          setFormData({...formData, contacts});
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="industrial-label">Mobile Number 2</label>
                      <input 
                        type="tel" 
                        className="industrial-input" 
                        placeholder="Optional"
                        value={contact.phone2 || ''}
                        onChange={(e) => {
                          const contacts = [...(formData.contacts || [])];
                          contacts[idx] = { ...contacts[idx], phone2: e.target.value };
                          setFormData({...formData, contacts});
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Address Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Address */}
          <div className="industrial-card p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-6">
              <CreditCard className="w-4 h-4 text-[#1A1A1A]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Billing Address</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="industrial-label">Address Line 1</label>
                <input 
                  type="text" 
                  className="industrial-input" 
                  placeholder="Street, Suite, Unit"
                  value={formData.addresses?.find((a: any) => a.address_type === 'billing')?.line1 || ''}
                  onChange={(e) => {
                    const addresses = [...(formData.addresses || [])];
                    const idx = addresses.findIndex(a => a.address_type === 'billing');
                    if (idx !== -1) addresses[idx].line1 = e.target.value;
                    setFormData({...formData, addresses});
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="industrial-label">State</label>
                  <input 
                    type="text" 
                    className="industrial-input" 
                    value={formData.addresses?.find((a: any) => a.address_type === 'billing')?.state || ''}
                    onChange={(e) => {
                      const addresses = [...(formData.addresses || [])];
                      const idx = addresses.findIndex(a => a.address_type === 'billing');
                      if (idx !== -1) addresses[idx].state = e.target.value;
                      setFormData({...formData, addresses});
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="industrial-label">Pin Code</label>
                  <input 
                    type="text" 
                    className="industrial-input" 
                    value={formData.addresses?.find((a: any) => a.address_type === 'billing')?.pincode || ''}
                    onChange={(e) => {
                      const addresses = [...(formData.addresses || [])];
                      const idx = addresses.findIndex(a => a.address_type === 'billing');
                      if (idx !== -1) addresses[idx].pincode = e.target.value;
                      setFormData({...formData, addresses});
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="industrial-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1A1A1A]" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Shipping Address</h3>
              </div>
              <button 
                type="button"
                onClick={copyBillingToShipping}
                className="text-[10px] font-bold text-black/40 hover:text-black uppercase tracking-widest transition-colors"
              >
                Same as Billing
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="industrial-label">Address Line 1</label>
                <input 
                  type="text" 
                  className="industrial-input" 
                  placeholder="Street, Suite, Unit"
                  value={formData.addresses?.find((a: any) => a.address_type === 'shipping')?.line1 || ''}
                  onChange={(e) => {
                    const addresses = [...(formData.addresses || [])];
                    const idx = addresses.findIndex(a => a.address_type === 'shipping');
                    if (idx !== -1) addresses[idx].line1 = e.target.value;
                    setFormData({...formData, addresses});
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="industrial-label">State</label>
                  <input 
                    type="text" 
                    className="industrial-input" 
                    value={formData.addresses?.find((a: any) => a.address_type === 'shipping')?.state || ''}
                    onChange={(e) => {
                      const addresses = [...(formData.addresses || [])];
                      const idx = addresses.findIndex(a => a.address_type === 'shipping');
                      if (idx !== -1) addresses[idx].state = e.target.value;
                      setFormData({...formData, addresses});
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="industrial-label">Pin Code</label>
                  <input 
                    type="text" 
                    className="industrial-input" 
                    value={formData.addresses?.find((a: any) => a.address_type === 'shipping')?.pincode || ''}
                    onChange={(e) => {
                      const addresses = [...(formData.addresses || [])];
                      const idx = addresses.findIndex(a => a.address_type === 'shipping');
                      if (idx !== -1) addresses[idx].pincode = e.target.value;
                      setFormData({...formData, addresses});
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <button 
            type="button"
            onClick={onBack}
            className="industrial-btn-secondary px-8 py-3"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="industrial-btn-primary px-10 py-3 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {editId ? 'Update Customer' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};
