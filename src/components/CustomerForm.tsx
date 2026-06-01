import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Loader2, Plus, ArrowLeft, Mail, Phone, Factory, MapPin, ShieldCheck
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
    branch_code: '',
    alias: '',
    type: 'Dealer',
    gst_number: '',
    industry_type: 'Power',
    branches: [{ name: 'Head Office', location: '', manager: '' }],
    contacts: [{ name: '', email: '', phone1: '', phone2: '' }],
    address_lines: [''],
    state: '',
    country: 'India',
    pincode: ''
  });

  const generateAlias = (name: string, branchCode: string) => {
    return branchCode ? `${name} (${branchCode})` : name;
  };

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
              <label className="industrial-label">Customer Name (Formal Name)</label>
              <input 
                required
                type="text" 
                className="industrial-input" 
                placeholder="e.g. The Ramco Cements Limited"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Branch Code</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder="e.g. JPM"
                value={formData.branch_code}
                onChange={(e) => setFormData({...formData, branch_code: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Alias (Formal Name)</label>
              <div className="space-y-2">
                <input 
                  type="text" 
                  className="industrial-input bg-[#F9F9F9]" 
                  placeholder="Auto-generated from Name and Branch Code"
                  value={formData.alias}
                  onChange={(e) => setFormData({...formData, alias: e.target.value})}
                />
                <div className="text-[10px] text-[#999999]">
                  Preview: {generateAlias(formData.name, formData.branch_code) || 'Enter name and branch code'}
                </div>
              </div>
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
              <div className="flex gap-2">
                <select 
                  className="industrial-input flex-1"
                  value={formData.industry_type === 'Power' || formData.industry_type === 'Cement' || formData.industry_type === 'Fertiliser' || formData.industry_type === 'Steel' || formData.industry_type === 'Petro Chemicals' ? formData.industry_type : 'Others'}
                  onChange={(e) => {
                    if (e.target.value === 'Others') {
                      setFormData({...formData, industry_type: '' as any});
                    } else {
                      setFormData({...formData, industry_type: e.target.value as any});
                    }
                  }}
                >
                  <option value="">Select or enter custom</option>
                  <option>Power</option>
                  <option>Cement</option>
                  <option>Fertiliser</option>
                  <option>Steel</option>
                  <option>Petro Chemicals</option>
                  <option value="Others">Others (Custom)</option>
                </select>
                <input
                  type="text"
                  className="industrial-input flex-1"
                  placeholder="Type custom industry"
                  value={formData.industry_type && !['Power', 'Cement', 'Fertiliser', 'Steel', 'Petro Chemicals'].includes(formData.industry_type) ? formData.industry_type : ''}
                  onChange={(e) => setFormData({...formData, industry_type: e.target.value as any})}
                />
              </div>
            </div>
          </div>
        </div>

{/* Contact Details */}
<div className="industrial-card p-6 space-y-6">
  <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3 mb-6">
    <div className="flex items-center gap-2">
      <Mail className="w-4 h-4 text-[#1A1A1A]" />
      <h3 className="text-sm font-bold uppercase tracking-wider">
        Contact Module
      </h3>
    </div>

    <button
      type="button"
      onClick={() => {
        setFormData({
          ...formData,
          contacts: [
            ...(formData.contacts || []),
            {
              name: "",
              designation: "",
              email: "",
              phoneNumbers: [""],
            },
          ],
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
          <span className="text-[10px] font-bold text-[#999999] uppercase">
            Contact Person {idx + 1}
          </span>

          {idx > 0 && (
            <button
              type="button"
              onClick={() => {
                const newContacts = [...formData.contacts];
                newContacts.splice(idx, 1);

                setFormData({
                  ...formData,
                  contacts: newContacts,
                });
              }}
              className="text-[10px] font-bold text-red-500/60 hover:text-red-600 uppercase"
            >
              Remove
            </button>
          )}
        </div>

        {/* Name + Designation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="industrial-label">
              Contact Person Name
            </label>

            <input
              type="text"
              className="industrial-input"
              placeholder="Owner / Manager Name"
              value={contact.name || ""}
              onChange={(e) => {
                const contacts = [...formData.contacts];

                contacts[idx] = {
                  ...contacts[idx],
                  name: e.target.value,
                };

                setFormData({
                  ...formData,
                  contacts,
                });
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="industrial-label">
              Designation
            </label>

            <input
              type="text"
              className="industrial-input"
              placeholder="Manager / Sales Head"
              value={contact.designation || ""}
              onChange={(e) => {
                const contacts = [...formData.contacts];

                contacts[idx] = {
                  ...contacts[idx],
                  designation: e.target.value,
                };

                setFormData({
                  ...formData,
                  contacts,
                });
              }}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="industrial-label">Email ID</label>

          <input
            type="email"
            className="industrial-input"
            placeholder="sales@company.com"
            value={contact.email || ""}
            onChange={(e) => {
              const contacts = [...formData.contacts];

              contacts[idx] = {
                ...contacts[idx],
                email: e.target.value,
              };

              setFormData({
                ...formData,
                contacts,
              });
            }}
          />
        </div>

        {/* Dynamic Mobile Numbers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="industrial-label">
              Mobile Numbers
            </label>

            <button
              type="button"
              onClick={() => {
                const contacts = [...formData.contacts];

                contacts[idx].phoneNumbers = [
                  ...(contacts[idx].phoneNumbers || []),
                  "",
                ];

                setFormData({
                  ...formData,
                  contacts,
                });
              }}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-black/50 hover:text-black"
            >
              <Plus className="w-3 h-3" />
              Add Number
            </button>
          </div>

          {(contact.phoneNumbers || []).map(
            (phone: string, phoneIdx: number) => (
              <div
                key={phoneIdx}
                className="flex gap-3 items-center"
              >
                <input
                  type="tel"
                  className="industrial-input flex-1"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => {
                    const contacts = [...formData.contacts];

                    contacts[idx].phoneNumbers[phoneIdx] =
                      e.target.value;

                    setFormData({
                      ...formData,
                      contacts,
                    });
                  }}
                />

                {phoneIdx > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const contacts = [...formData.contacts];

                      contacts[idx].phoneNumbers.splice(
                        phoneIdx,
                        1
                      );

                      setFormData({
                        ...formData,
                        contacts,
                      });
                    }}
                    className="text-red-500 text-xs font-bold uppercase"
                  >
                    Remove
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    ))}
  </div>
</div>

        {/* Address Details */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1A1A1A]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Address</h3>
            </div>
            <button 
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  address_lines: [...(formData.address_lines || []), '']
                });
              }}
              className="text-[10px] font-bold text-black/40 hover:text-black uppercase tracking-widest transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Address Line
            </button>
          </div>
          <div className="space-y-4">
            {formData.address_lines?.map((line: any, idx: number) => (
              <div key={idx} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <label className="industrial-label">{idx === 0 ? 'Address Line' : `Address Line ${idx + 1}`}</label>
                  <input 
                    type="text" 
                    className="industrial-input" 
                    placeholder="Street, Suite, Unit"
                    value={line || ''}
                    onChange={(e) => {
                      const address_lines = [...(formData.address_lines || [])];
                      address_lines[idx] = e.target.value;
                      setFormData({...formData, address_lines});
                    }}
                  />
                </div>
                {idx > 0 && (
                  <button 
                    type="button"
                    onClick={() => {
                      const newAddressLines = [...formData.address_lines];
                      newAddressLines.splice(idx, 1);
                      setFormData({ ...formData, address_lines: newAddressLines });
                    }}
                    className="text-[10px] font-bold text-red-500/60 hover:text-red-600 uppercase mb-1"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#F0F0F0]">
            <div className="space-y-1">
              <label className="industrial-label">State</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder="State name"
                value={formData.state || ''}
                onChange={(e) => {
                  setFormData({...formData, state: e.target.value});
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Country</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder="Country name"
                value={formData.country || ''}
                onChange={(e) => {
                  setFormData({...formData, country: e.target.value});
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="industrial-label">Pin Code</label>
              <input 
                type="text" 
                className="industrial-input" 
                placeholder="Pin code"
                value={formData.pincode || ''}
                onChange={(e) => {
                  setFormData({...formData, pincode: e.target.value});
                }}
              />
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
