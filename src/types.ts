export interface Branch {
  id?: number;
  customer_id?: number;
  name: string;
  location?: string;
  manager?: string;
}

export interface Contact {
  id?: number;
  customer_id?: number;
  name?: string;
  email?: string;
  phone1?: string;
  phone2?: string;
}

export interface Address {
  id?: number;
  customer_id?: number;
  address_type: 'billing' | 'shipping';
  line1?: string;
  line2?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface Customer {
  id?: number;
  name: string;
  type: string;
  gst_number?: string;
  industry_type?: string;
  created_at?: string;
  updated_at?: string;
  branches?: Branch[];
  contacts?: Contact[];
  addresses?: Address[];
  orders?: Order[];
}

export interface Order {
  id?: number;
  order_number: string;
  order_date: string;
  year: number;
  sales_person: string;
  status: 'Pending' | 'Confirmed' | 'Delivered';
  customer_id: number;
  branch_id: number;
  product_type: string;
  product_code: string;
  size: string;
  hsn_code: string;
  quantity: number;
  currency: 'INR' | 'USD' | 'EUR';
  unit_price: number;
  conversion_rate: number;
  unit_price_inr: number;
  total_price: number;
  delivery_date: string;
  invoice_number: string;
  invoice_date: string;
  tax_percent: number;
  tax_amount: number;
  final_amount: number;
  created_at?: string;
  // Join fields
  customer_name?: string;
  branch_name?: string;
  industry_type?: string;
  branch_location?: string;
}
