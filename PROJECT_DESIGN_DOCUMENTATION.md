# EDGEFLEX CRM - Complete Project Design & Architecture Documentation

**Version:** 4.0.2-Industrial  
**Date:** April 19, 2026  
**Status:** Production Ready  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Portal Modules](#portal-modules)
4. [Customer Portal - Complete Details](#customer-portal---complete-details)
5. [Order Portal - Complete Details](#order-portal---complete-details)
6. [Analytics Portal](#analytics-portal)
7. [Database Schema](#database-schema)
8. [API Architecture](#api-architecture)
9. [User Authentication & Security](#user-authentication--security)
10. [User Workflows](#user-workflows)

---

## Project Overview

### Purpose
**Edgeflex CRM** is an industrial-grade Customer Relationship Management system designed to manage:
- Customer Base (Dealers, End Users, Distributors)
- Order Management & Tracking
- Revenue Analytics & Reporting
- Data Import/Export (Excel-based)
- Role-Based Access Control & Permissions

### Key Features
✅ **Multi-user System** - User isolation with role-based permissions  
✅ **Customer Management** - Complete customer lifecycle management  
✅ **Order Processing** - Real-time order creation, tracking, and status management  
✅ **Analytics Dashboard** - Revenue insights, sales trends, customer analytics  
✅ **Bulk Data Import** - Excel/CSV import for customers and orders  
✅ **Security Module** - Permission management and data sharing  
✅ **Responsive UI** - Works on desktop and mobile devices  

### Technology Stack

#### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6.2
- **Styling:** Tailwind CSS 4.1 + Custom Industrial Design System
- **UI Components:** Motion (animations), Lucide React (icons), Recharts (data visualization)
- **State Management:** React Context API
- **Authentication:** Firebase Auth (Google Sign-in + Email/Password)

#### Backend
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma Client 6.19
- **Authentication:** Firebase Admin SDK
- **File Processing:** XLSX (Excel), PapaParse (CSV)

#### DevOps & Deployment
- **Hosting:** Netlify (Frontend)
- **Backend:** Express Server (Cloud Run Compatible)
- **Database:** PostgreSQL (Cloud SQL)
- **Authentication:** Firebase

---

## System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE (React)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Auth UI    │  │   Sidebar    │  │   Content    │       │
│  │   (Login)    │  │  (Navigation)│  │  (Portal)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                      │                                        │
│            ┌─────────▼──────────┐                            │
│            │  AuthContext API   │                            │
│            │  (Firebase Auth)   │                            │
│            └─────────┬──────────┘                            │
│                      │                                        │
│            ┌─────────▼──────────┐                            │
│            │   DB Service       │                            │
│            │  (API Client)      │                            │
│            └─────────┬──────────┘                            │
│                      │ (HTTP Requests)                       │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────┐
│         BACKEND (Express + Prisma)                          │
├──────────────────────┼──────────────────────────────────────┤
│                      │                                        │
│        ┌─────────────▼─────────────┐                        │
│        │  Express API Endpoints    │                        │
│        ├─────────────────────────────┤                       │
│        │ /api/customers/*            │                       │
│        │ /api/orders/*               │                       │
│        │ /api/analytics/*            │                       │
│        │ /api/permissions/*          │                       │
│        │ /api/bulk-import            │                       │
│        └────────────┬────────────────┘                       │
│                     │                                         │
│        ┌────────────▼────────────┐                           │
│        │ Prisma ORM              │                           │
│        │ (Database Models)       │                           │
│        └────────────┬────────────┘                           │
│                     │                                         │
│        ┌────────────▼────────────┐                           │
│        │ PostgreSQL Database     │                           │
│        │ (Data Persistence)      │                           │
│        └─────────────────────────┘                           │
│                                                               │
│   ┌────────────────────────────────────┐                    │
│   │  Middleware & Security             │                    │
│   ├────────────────────────────────────┤                    │
│   │ • Firebase Auth Verification       │                    │
│   │ • User Isolation & Permissions     │                    │
│   │ • CORS & Security Headers          │                    │
│   └────────────────────────────────────┘                    │
│                                                               │
└────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Login** → Firebase Authentication
2. **Get Auth Token** → Firebase ID Token (JWT)
3. **API Request** → Include Token in Authorization Header
4. **Backend Validation** → Verify Token & Check Permissions
5. **Database Query** → Prisma executes query with user isolation
6. **Response** → Return filtered data to client
7. **UI Update** → React re-renders with new data

---

## Portal Modules

### 1. **Dashboard (Control Center)**
**Purpose:** Central hub showing business metrics and recent activity

#### Components:
- **Summary Cards** (4 Main KPIs)
  - Total Customers
  - Total Orders
  - Revenue Yield (Total Revenue)
  - Security Mesh (Active Permissions)

- **Recent Activity Stream**
  - Last 5 orders with status
  - Real-time updates
  - Quick access to order details

- **Action Buttons**
  - Expand Customer Mesh (Add new customer)
  - Create New Order
  - View Analytics
  - Inject New Data (Bulk Import)

#### Data Retrieved:
```
- Total Customers Count
- Total Orders Count
- Total Revenue Sum
- Active Permissions Count
- Recent Orders (Last 5)js
```

---

### 2. **Customer Portal**
**Purpose:** Complete customer lifecycle management

#### Sections:
- **Customer List View**
  - Search by customer name
  - Display all customers
  - Show key information (Name, Type, Industry, GST)
  - Quick actions (View, Edit, Delete)

- **Add New Customer** (Form)
  - Basic Information
  - Branch Management
  - Contact Management
  - Address Management

- **View Customer Profile**
  - Complete customer details
  - Associated branches
  - Contact information
  - Addresses (Billing & Shipping)
  - Customer analytics (Lifetime value, orders, pending orders)
  - Order history for this customer

- **Edit Customer**
  - Update all customer fields
  - Modify branches, contacts, addresses

#### Menu Navigation:
```
Customers Menu
├── List (Portal)
├── Add New Customer
├── Customer Profile [ID]
└── Edit Customer [ID]
```

---

### 3. **Order Portal**
**Purpose:** Order creation, tracking, and management

#### Sections:
- **Order List View**
  - Search by order number or customer name
  - Filter by status (Pending, Confirmed, Delivered)
  - Filter by product type
  - Display: Order#, Customer, Product, Amount, Status
  - Quick actions (View, Delete)
  - Bulk import from Excel

- **Create New Order** (Form)
  - Customer Selection (Dropdown)
  - Branch Selection (Dynamic based on customer)
  - Order Details
    - Order Number (Auto-generated)
    - Order Date
    - Year
    - Sales Person
    - Status
  - Product Information
    - Product Type (MEJ, FEJ, NMEJ, etc.)
    - Product Code
    - Size
    - HSN Code
  - Quantity & Pricing
    - Quantity
    - Currency (INR, USD, EUR)
    - Unit Price
    - Conversion Rate
    - Total Price (Auto-calculated)
  - Tax Information
    - Tax Percentage
    - Tax Amount (Auto-calculated)
    - Final Amount (Auto-calculated)
  - Delivery Information
    - Delivery Date
    - Invoice Number
    - Invoice Date

- **View Order Profile**
  - Complete order details
  - Associated customer information
  - Branch details
  - Product specifications
  - Pricing breakdown
  - Invoice information
  - Delivery status

- **Edit Order**
  - Update order details
  - Modify status
  - Update delivery information

#### Menu Navigation:
```
Orders Menu
├── List (Portal)
├── Add New Order
├── Order Profile [ID]
├── Edit Order [ID]
└── Import Orders (Excel)
```

---

### 4. **Analytics Portal (Intelligence)**
**Purpose:** Business intelligence and reporting

#### Dashboards & Reports:

1. **Summary Statistics**
   - Total Revenue (All-time)
   - Total Orders (Count)
   - Total Customers (Count)
   - Pending Orders (Count)

2. **Revenue by Period**
   - Monthly Sales Chart (Area Chart)
   - Shows revenue trends over time
   - Export capability

3. **Revenue by Industry**
   - Industry-wise breakdown
   - Sector-wise performance

4. **Order Status Distribution**
   - Pie/Doughnut chart
   - Pending vs Completed orders

5. **Product Distribution**
   - Product type wise breakdown (MEJ, FEJ, NMEJ, etc.)
   - Volume by product

6. **Top Customers**
   - Top 6 customers by revenue
   - Customer name with revenue value

7. **Sales Rep Performance**
   - Performance by sales representative
   - Revenue attributed to each rep

8. **Recent Activity**
   - Last 10 orders
   - Order number, customer, product, amount, status
   - Timestamp

#### Filters:
- Date Range Selection
- Customer Filter
- Branch Filter (Dynamic)
- Product Type Filter
- Status Filter

#### Export Features:
- Export as Excel
- Multiple sheets with different data
- Summary, Monthly, Industry, and Status data

---

### 5. **Data Import Portal (Data Injection)**
**Purpose:** Bulk upload customers and orders from Excel

#### Features:

1. **File Upload**
   - Drag & drop interface
   - Support for .xlsx, .xls, .csv files
   - Max file size: 10MB

2. **Data Preview**
   - Show first 5 rows of uploaded data
   - Column names display
   - Data validation

3. **Data Mapping**
   - Map Excel columns to system fields
   - Required fields validation
   - Format validation

4. **Bulk Import Process**
   - Create customers with nested orders
   - Automatic ID generation
   - Relationship creation
   - Transaction handling

5. **Success Reporting**
   - Number of customers imported
   - Number of orders imported
   - Import timestamp

#### Required Excel Columns:
```
Year                 (Integer)
Order_No            (String)
Customer            (String - Customer Name)
Branch              (String - Branch Name)
Industry            (String - Industry Type)
Location            (String - Branch Location)
Product_Type        (String - Product Type: MEJ/FEJ/NMEJ)
Size                (String)
Quantity            (Integer)
Basic_Value         (Float - Price without tax)
Tax                 (Float - Tax amount)
Delivery_Date       (Date - DD-MM-YYYY or ISO format)
Invoice_No          (String)
Invoice_Date        (Date - DD-MM-YYYY or ISO format)
GST                 (String - Customer GST Number)
Type                (String - Customer Type)
```

---

### 6. **Security Settings**
**Purpose:** Manage permissions and data sharing

#### Features:

1. **View Current Permissions**
   - Permissions shared with you
   - Permissions you shared with others

2. **Share Access**
   - Enter email to share with
   - Select access level:
     - READ: View only
     - WRITE: View and edit
     - BOTH: Full access

3. **Manage Existing Shares**
   - Update access levels
   - Revoke access

4. **Permission Model**
   - Owner: Full access to own data
   - Shared access: Via email
   - Access levels control what users can do
   - User isolation in all queries

---

## Customer Portal - Complete Details

### **Add/Create Customer - Full Requirements**

#### Form Structure

```
┌─────────────────────────────────────────┐
│        ADD NEW CUSTOMER FORM            │
├─────────────────────────────────────────┤
│                                         │
│ SECTION 1: BASIC INFORMATION            │
├─────────────────────────────────────────┤
│                                         │
│ [*] Customer Name (Required)            │
│     └─ Text Input                       │
│     └─ Type: String (Max 255 chars)    │
│     └─ Example: "ABC Industries Ltd"   │
│                                         │
│ [*] Customer Type (Required)            │
│     └─ Dropdown Select                  │
│     └─ Options:                         │
│        - Dealer                         │
│        - End User                       │
│        - Distributor                    │
│        - Retailer                       │
│        - Manufacturer                   │
│                                         │
│ [*] Industry Type (Required)            │
│     └─ Dropdown Select                  │
│     └─ Options:                         │
│        - Manufacturing                  │
│        - Service                        │
│        - Retail                         │
│        - Healthcare                     │
│        - Education                      │
│        - Others                         │
│                                         │
│ [ ] GST Registration Number (Optional)  │
│     └─ Text Input                       │
│     └─ Format: 15 chars (e.g., 27AABCT...)
│     └─ Used for invoicing              │
│                                         │
├─────────────────────────────────────────┤
│ SECTION 2: BRANCH MANAGEMENT           │
├─────────────────────────────────────────┤
│                                         │
│ [Add Branch] Button                     │
│ ┌──────────────────────────────────┐  │
│ │ BRANCH 1 (Collapsible)           │  │
│ ├──────────────────────────────────┤  │
│ │ Branch Name: Main Office         │  │
│ │ Location: Delhi                  │  │
│ │ Manager: John Doe                │  │
│ │ [Edit] [Delete]                  │  │
│ └──────────────────────────────────┘  │
│                                         │
│ ┌──────────────────────────────────┐  │
│ │ BRANCH 2 (Collapsible)           │  │
│ ├──────────────────────────────────┤  │
│ │ Branch Name: North Zone          │  │
│ │ Location: Mumbai                 │  │
│ │ Manager: Jane Smith              │  │
│ │ [Edit] [Delete]                  │  │
│ └──────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ SECTION 3: CONTACT MANAGEMENT          │
├─────────────────────────────────────────┤
│                                         │
│ [Add Contact] Button                    │
│ ┌──────────────────────────────────┐  │
│ │ CONTACT 1 (Collapsible)          │  │
│ ├──────────────────────────────────┤  │
│ │ Name: Rajesh Kumar               │  │
│ │ Email: rajesh@abc.com            │  │
│ │ Phone 1: +91-9876543210          │  │
│ │ Phone 2: +91-9123456789          │  │
│ │ [Edit] [Delete]                  │  │
│ └──────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ SECTION 4: ADDRESS MANAGEMENT          │
├─────────────────────────────────────────┤
│                                         │
│ [Add Address] Button                    │
│ ┌──────────────────────────────────┐  │
│ │ BILLING ADDRESS (Collapsible)    │  │
│ ├──────────────────────────────────┤  │
│ │ Address Line 1: 123 Business St  │  │
│ │ Address Line 2: Suite 100        │  │
│ │ State: Delhi                     │  │
│ │ Country: India                   │  │
│ │ Pincode: 110001                  │  │
│ │ [Edit] [Delete]                  │  │
│ └──────────────────────────────────┘  │
│                                         │
│ ┌──────────────────────────────────┐  │
│ │ SHIPPING ADDRESS (Collapsible)   │  │
│ ├──────────────────────────────────┤  │
│ │ Address Line 1: 456 Warehouse Rd │  │
│ │ Address Line 2: Unit 5           │  │
│ │ State: Punjab                    │  │
│ │ Country: India                   │  │
│ │ Pincode: 160001                  │  │
│ │ [Edit] [Delete]                  │  │
│ └──────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ [Cancel]          [Save Customer]       │
└─────────────────────────────────────────┘
```

#### Field Specifications

| Field | Type | Required | Constraints | Usage |
|-------|------|----------|-------------|-------|
| Customer Name | String | Yes | Max 255 chars | Primary identifier |
| Customer Type | Select | Yes | Predefined list | Segmentation |
| Industry Type | Select | Yes | Predefined list | Analytics grouping |
| GST Number | String | No | 15 chars format | Tax invoicing |
| Branch Name | String | Yes (per branch) | Max 255 chars | Order assignment |
| Location | String | No | Max 255 chars | Geographical tracking |
| Manager | String | No | Max 255 chars | Contact information |
| Contact Name | String | No | Max 255 chars | Person identification |
| Email | String | No | Valid email format | Communication |
| Phone 1 | String | No | Phone format | Primary contact |
| Phone 2 | String | No | Phone format | Alternate contact |
| Address Line 1 | String | No | Max 255 chars | Shipping/Billing |
| Address Line 2 | String | No | Max 255 chars | Additional details |
| State | String | No | Max 255 chars | Regional info |
| Country | String | No | Default: India | International tracking |
| Pincode | String | No | Max 10 chars | Location precision |

#### Data Validation

```javascript
Validation Rules:
├── Customer Name
│   ├── Not empty
│   ├── Length between 3-255 characters
│   └── Cannot contain special characters
├── Email (if provided)
│   ├── Valid email format
│   └── Unique check (optional)
├── Phone (if provided)
│   ├── Valid phone format
│   └── At least 10 digits
├── Pincode (if provided)
│   ├── Numeric
│   └── 6-10 digits
└── GST (if provided)
    ├── Format: 15 chars
    └── Pattern: ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
```

#### Submit Process

1. **Client-side Validation**
   - Check all required fields
   - Validate email format
   - Validate GST format
   - Show error messages

2. **API Request**
   - POST `/api/customers`
   - Include auth token
   - Send entire nested structure

3. **Backend Processing**
   - Verify user permissions
   - Create customer record
   - Create branch records (if provided)
   - Create contact records (if provided)
   - Create address records (if provided)
   - All in single transaction

4. **Success Response**
   - Return created customer ID
   - Navigate to customer profile
   - Show success message

#### Edit Customer Process

- Same form structure as Add
- Pre-fill all existing data
- Allow updating any field
- Handle cascading deletes for removed branches/contacts
- Update timestamps

---

## Order Portal - Complete Details

### **Create Order - Full Requirements**

#### Form Structure

```
┌──────────────────────────────────────────┐
│        CREATE NEW ORDER FORM             │
├──────────────────────────────────────────┤
│                                          │
│ SECTION 1: CUSTOMER & BRANCH SELECTION   │
├──────────────────────────────────────────┤
│                                          │
│ [*] Select Customer (Required)           │
│     └─ Dropdown                          │
│     └─ Lists all active customers        │
│     └─ Shows: Customer Name              │
│     └─ onChange: Loads branches          │
│                                          │
│ [*] Select Branch (Required)             │
│     └─ Dropdown (Dependent on Customer)  │
│     └─ Populated after customer select   │
│     └─ Shows: Branch Name (Location)     │
│                                          │
├──────────────────────────────────────────┤
│ SECTION 2: ORDER BASIC INFORMATION      │
├──────────────────────────────────────────┤
│                                          │
│ [*] Order Number (Auto-generated)        │
│     └─ Format: ORD-{RANDOM_9_CHARS}     │
│     └─ Example: ORD-ABC123XYZ           │
│     └─ Read-only / Editable             │
│                                          │
│ [*] Order Date (Required)                │
│     └─ Date Picker                       │
│     └─ Default: Today                    │
│     └─ Format: YYYY-MM-DD               │
│                                          │
│ [*] Year (Required)                      │
│     └─ Number Input                      │
│     └─ Default: Current Year             │
│                                          │
│ [ ] Sales Person (Optional)              │
│     └─ Text Input                        │
│     └─ Name of sales representative      │
│                                          │
│ [*] Status (Required)                    │
│     └─ Select Dropdown                   │
│     └─ Options:                          │
│        - Pending (Default)               │
│        - Confirmed                       │
│        - Delivered                       │
│        - Cancelled                       │
│                                          │
├──────────────────────────────────────────┤
│ SECTION 3: PRODUCT DETAILS              │
├──────────────────────────────────────────┤
│                                          │
│ [*] Product Type (Required)              │
│     └─ Select Dropdown                   │
│     └─ Options:                          │
│        - MEJ (Most Efficient Junction)  │
│        - FEJ (Full Efficient Junction)  │
│        - NMEJ (Non-standard)             │
│        - Custom                          │
│                                          │
│ [*] Product Code (Required)              │
│     └─ Text Input                        │
│     └─ Example: PROD-2024-001            │
│                                          │
│ [ ] Size (Optional)                      │
│     └─ Text Input                        │
│     └─ Example: 10x20cm, 500ml, etc      │
│                                          │
│ [ ] HSN Code (Optional)                  │
│     └─ Text Input                        │
│     └─ Harmonized System Nomenclature    │
│     └─ Format: 8 digits                  │
│                                          │
├──────────────────────────────────────────┤
│ SECTION 4: QUANTITY & PRICING           │
├──────────────────────────────────────────┤
│                                          │
│ [*] Quantity (Required)                  │
│     └─ Number Input                      │
│     └─ Min: 1                            │
│     └─ Unit: Units (system default)      │
│                                          │
│ [*] Currency (Required)                  │
│     └─ Select Dropdown                   │
│     └─ Options:                          │
│        - INR (Indian Rupee - Default)   │
│        - USD (US Dollar)                 │
│        - EUR (Euro)                      │
│                                          │
│ [*] Unit Price (Required)                │
│     └─ Decimal Input                     │
│     └─ Price per unit in selected currency
│                                          │
│ [ ] Conversion Rate (Optional)           │
│     └─ Decimal Input                     │
│     └─ Default: 1.0                      │
│     └─ Used to convert to INR            │
│                                          │
│ [Auto] Unit Price INR (Auto-calculated)  │
│     └─ unitPrice × conversionRate        │
│     └─ Read-only                         │
│                                          │
│ [Auto] Total Price (Auto-calculated)     │
│     └─ unitPriceINR × quantity           │
│     └─ Read-only                         │
│                                          │
├──────────────────────────────────────────┤
│ SECTION 5: TAX INFORMATION              │
├──────────────────────────────────────────┤
│                                          │
│ [ ] Tax Percentage (Optional)            │
│     └─ Decimal Input (0-100)             │
│     └─ Default: 18 (GST standard)        │
│     └─ onChange: Auto-calculate tax      │
│                                          │
│ [Auto] Tax Amount (Auto-calculated)      │
│     └─ totalPrice × (taxPercent / 100)   │
│     └─ Read-only                         │
│                                          │
│ [Auto] Final Amount (Auto-calculated)    │
│     └─ totalPrice + taxAmount            │
│     └─ Read-only                         │
│     └─ Bold, highlighted display         │
│                                          │
│ [ ] Basic Value (Optional)               │
│     └─ Number Input                      │
│     └─ Alternative to totalPrice         │
│                                          │
├──────────────────────────────────────────┤
│ SECTION 6: DELIVERY & INVOICE           │
├──────────────────────────────────────────┤
│                                          │
│ [ ] Delivery Date (Optional)             │
│     └─ Date Picker                       │
│     └─ Must be >= Order Date             │
│     └─ Format: YYYY-MM-DD               │
│                                          │
│ [ ] Invoice Number (Optional)            │
│     └─ Text Input                        │
│     └─ Format: INV-YYYY-XXXXX            │
│     └─ Unique identifier                 │
│                                          │
│ [ ] Invoice Date (Optional)              │
│     └─ Date Picker                       │
│     └─ Format: YYYY-MM-DD               │
│                                          │
├──────────────────────────────────────────┤
│ [Cancel]           [Create Order]        │
└──────────────────────────────────────────┘
```

#### Field Specifications for Order

| Field | Type | Required | Constraints | Logic |
|-------|------|----------|-------------|-------|
| Order Number | String | Yes | Unique, auto-generated | Identifier |
| Order Date | Date | Yes | ISO format | Timeline tracking |
| Year | Integer | Yes | Current/future year | Fiscal period |
| Sales Person | String | No | Max 255 chars | Attribution |
| Status | Select | Yes | Pending/Confirmed/Delivered | State machine |
| Product Type | Select | Yes | Predefined list | Categorization |
| Product Code | String | Yes | Max 100 chars | Product tracking |
| Size | String | No | Max 100 chars | Specification |
| HSN Code | String | No | 8 digits | Tax classification |
| Quantity | Integer | Yes | Min 1 | Order volume |
| Currency | Select | Yes | INR/USD/EUR | Price basis |
| Unit Price | Decimal | Yes | Min 0 | Cost calculation |
| Conversion Rate | Decimal | No | Default 1.0 | Currency conversion |
| Unit Price INR | Decimal | Auto | Read-only | Calculated field |
| Total Price | Decimal | Auto | Read-only | Calculated field |
| Tax Percentage | Decimal | No | 0-100, Default 18 | Tax calculation |
| Tax Amount | Decimal | Auto | Read-only | Calculated field |
| Final Amount | Decimal | Auto | Read-only | Calculated field |
| Basic Value | Decimal | No | Alternative input | Flexibility |
| Delivery Date | Date | No | >= Order Date | Fulfillment tracking |
| Invoice Number | String | No | Unique, Max 50 | Financial reference |
| Invoice Date | Date | No | ISO format | Financial period |

#### Auto-Calculation Logic

```javascript
Calculations:
├── Unit Price INR
│   └─ unitPrice × conversionRate
│
├── Total Price (Method 1 - Primary)
│   └─ unitPriceINR × quantity
│
├── Total Price (Method 2 - Fallback)
│   └─ IF basicValue provided THEN basicValue
│   └─ ELSE unitPriceINR × quantity
│
├── Tax Amount
│   └─ totalPrice × (taxPercent / 100)
│   └─ rounded to 2 decimals
│
└── Final Amount
    └─ totalPrice + taxAmount
    └─ rounded to 2 decimals
    └─ This is the billable amount
```

#### Validation Rules

```javascript
Validations:
├── Basic Validations
│   ├── All required fields must be filled
│   ├── Quantity must be > 0
│   ├── Prices must be >= 0
│   └── Tax % must be between 0-100
│
├── Date Validations
│   ├── Delivery Date >= Order Date
│   ├── Invoice Date >= Order Date (if provided)
│   └── All dates in valid format
│
├── Customer/Branch
│   ├── Customer must exist
│   ├── Branch must belong to selected customer
│   └── Cannot be null
│
└── Unique Checks
    └── Order Number must be unique in system
```

#### Submit Process

1. **Front-end Validation**
   - Check required fields
   - Validate all constraints
   - Calculate final values
   - Show any validation errors

2. **API Request**
   - POST `/api/orders`
   - Include auth token
   - Send complete order object

3. **Backend Processing**
   - Verify user permissions
   - Validate order data
   - Check customer/branch exist
   - Insert order record
   - Update timestamps

4. **Response Handling**
   - Show success message
   - Navigate to order profile
   - Display created order number

---

## Database Schema

### Entity-Relationship Diagram

```
Customer
├── id (PK, Int)
├── name (String)
├── type (String) - Dealer, End User, etc.
├── gst_number (String, Optional)
├── industry_type (String)
├── user_id (String) - For multi-tenancy
├── created_at (DateTime)
├── updated_at (DateTime)
│
├── Branches (1:Many)
│   ├── id (PK)
│   ├── name
│   ├── location
│   └── manager
│
├── Contacts (1:Many)
│   ├── id (PK)
│   ├── name
│   ├── email
│   ├── phone1
│   └── phone2
│
├── Addresses (1:Many)
│   ├── id (PK)
│   ├── address_type (billing/shipping)
│   ├── line1, line2
│   ├── state
│   ├── country
│   └── pincode
│
└── Orders (1:Many)
    ├── id (PK)
    ├── order_number
    ├── order_date
    ├── status
    ├── quantity
    ├── unit_price
    ├── final_amount
    └── ... (see below)

Order
├── id (PK, Int)
├── customer_id (FK)
├── branch_id (FK, Optional)
├── order_number (String, Unique)
├── order_date (DateTime)
├── status (String) - Pending, Confirmed, Delivered
├── year (Int)
├── product_type (String)
├── product_code (String)
├── size (String)
├── hsn_code (String)
├── quantity (Int)
├── unit_price (Float)
├── conversion_rate (Float)
├── unit_price_inr (Float)
├── total_price (Float)
├── tax_amount (Float)
├── final_amount (Float)
├── basic_value (Float)
├── delivery_date (DateTime)
├── invoice_no (String)
├── invoice_date (DateTime)
├── user_id (String) - For multi-tenancy
├── created_at (DateTime)
├── updated_at (DateTime)
└── customer (Relation)
```

### Table Definitions (SQL)

```sql
-- Customers Table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  gst_number VARCHAR(50),
  industry_type VARCHAR(100),
  user_id VARCHAR(255) DEFAULT 'unknown',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id)
);

-- Branches Table
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  manager VARCHAR(255),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Contacts Table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone1 VARCHAR(20),
  phone2 VARCHAR(20),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Addresses Table
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  address_type VARCHAR(50),
  line1 VARCHAR(255),
  line2 VARCHAR(255),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(10),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  branch_id INT,
  order_number VARCHAR(255) UNIQUE NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Pending',
  year INT,
  product_type VARCHAR(100),
  product_code VARCHAR(100),
  size VARCHAR(100),
  hsn_code VARCHAR(20),
  quantity INT,
  unit_price FLOAT,
  conversion_rate FLOAT DEFAULT 1.0,
  unit_price_inr FLOAT,
  total_price FLOAT,
  tax_amount FLOAT,
  final_amount FLOAT,
  basic_value FLOAT,
  delivery_date TIMESTAMP,
  invoice_no VARCHAR(100),
  invoice_date TIMESTAMP,
  user_id VARCHAR(255) DEFAULT 'unknown',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (order_number)
);

-- Permissions Table (for sharing)
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  owner_id VARCHAR(255) NOT NULL,
  shared_with_email VARCHAR(255) NOT NULL,
  access_level VARCHAR(50), -- READ, WRITE, BOTH
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (owner_id, shared_with_email)
);
```

---

## API Architecture

### Base URL
```
Development: http://localhost:5001/api
Production: https://api.edgeflex.com/api
```

### Authentication
All endpoints (except login) require Firebase ID Token:
```
Header: Authorization: Bearer {firebaseIdToken}
```

### API Endpoints

#### Customer Endpoints

```
GET  /api/customers                    → List all customers
GET  /api/customers?q=search          → Search customers by name
GET  /api/customers/{id}              → Get single customer
POST /api/customers                   → Create new customer
PUT  /api/customers/{id}              → Update customer
DELETE /api/customers/{id}            → Delete customer
```

**Example Request - Create Customer:**
```json
POST /api/customers

{
  "name": "ABC Industries Ltd",
  "type": "Dealer",
  "gst_number": "27AABCT1234F1Z5",
  "industry_type": "Manufacturing",
  "branches": [
    {
      "name": "Main Office",
      "location": "Delhi",
      "manager": "John Doe"
    }
  ],
  "contacts": [
    {
      "name": "Rajesh Kumar",
      "email": "rajesh@abc.com",
      "phone1": "+91-9876543210",
      "phone2": "+91-9123456789"
    }
  ],
  "addresses": [
    {
      "address_type": "billing",
      "line1": "123 Business Street",
      "line2": "Suite 100",
      "state": "Delhi",
      "country": "India",
      "pincode": "110001"
    }
  ]
}
```

#### Order Endpoints

```
GET  /api/orders                      → List all orders
GET  /api/orders?status=Pending       → Filter orders by status
GET  /api/orders/{id}                 → Get single order
POST /api/orders                      → Create new order
PUT  /api/orders/{id}                 → Update order
DELETE /api/orders/{id}               → Delete order
```

**Example Request - Create Order:**
```json
POST /api/orders

{
  "customer_id": 1,
  "branch_id": 5,
  "order_number": "ORD-ABC123XYZ",
  "order_date": "2024-04-19",
  "year": 2024,
  "sales_person": "John Smith",
  "status": "Pending",
  "product_type": "MEJ",
  "product_code": "PROD-2024-001",
  "size": "10x20cm",
  "hsn_code": "84431900",
  "quantity": 100,
  "currency": "INR",
  "unit_price": 500,
  "conversion_rate": 1.0,
  "unit_price_inr": 500,
  "total_price": 50000,
  "tax_percentage": 18,
  "tax_amount": 9000,
  "final_amount": 59000,
  "delivery_date": "2024-05-19",
  "invoice_no": "INV-2024-001",
  "invoice_date": "2024-04-19"
}
```

#### Analytics Endpoints

```
GET /api/analytics/summary           → Total revenue, orders, customers
GET /api/analytics/sales-by-month    → Monthly revenue breakdown
GET /api/analytics/revenue-by-industry → Revenue by industry
GET /api/analytics/top-customers     → Top customers by revenue
```

#### Permission Endpoints

```
GET    /api/permissions              → List all permissions for user
POST   /api/permissions              → Create permission (share data)
DELETE /api/permissions/{id}         → Revoke permission
```

**Example - Share Data:**
```json
POST /api/permissions

{
  "email": "colleague@company.com",
  "access_level": "READ"  // or "WRITE" or "BOTH"
}
```

#### Bulk Import Endpoint

```
POST /api/bulk-import

{
  "customers": [
    {
      "name": "Customer 1",
      "type": "Dealer",
      "industry_type": "Manufacturing",
      "orders": {
        "create": [
          {
            "order_number": "ORD-001",
            "year": 2024,
            "quantity": 100,
            ...
          }
        ]
      }
    }
  ]
}
```

---

## User Authentication & Security

### Authentication Flow

```
1. User clicks Login
   ↓
2. Firebase Authentication
   ├─ Email/Password
   ├─ Google Sign-in
   └─ Demo Mode (Development)
   ↓
3. Firebase Issues ID Token (JWT)
   ↓
4. Token stored in localStorage
   ↓
5. Auth Header set on all API calls
   ├─ Authorization: Bearer {token}
   ↓
6. Backend verifies token with Firebase Admin SDK
   ↓
7. Extract user UID and email from token
   ↓
8. Check permissions table for shared access
   ↓
9. Build SQL queries with user_id filter
   ↓
10. Return only accessible data to user
```

### Permission Model

```
User A (Owner)
├── Full access to own data
│
├── Can share with User B
│   ├── Access Level: READ (View only)
│   │
│   ├── Access Level: WRITE (View + Edit)
│   │
│   └─ Access Level: BOTH (Full access)
│
└── Can revoke access anytime

User B (Recipient)
├── Can view/edit shared data based on access level
├── Cannot see other recipients
└── Can access own data + shared data combined
```

### Data Isolation

All queries include WHERE clause:
```sql
WHERE user_id IN (
  '{currentUserId}',
  ... {userIds of users who shared with current user}
)
```

This ensures complete data isolation between users.

---

## User Workflows

### Workflow 1: Adding a New Customer

```
START
  ↓
User clicks "Add Customer" button
  ↓
Navigate to Customer Form Page
  ↓
Fill Customer Basic Info
  ├─ Name (Required)
  ├─ Type (Required)
  ├─ Industry Type (Required)
  └─ GST Number (Optional)
  ↓
Add Branches (Optional)
  ├─ Click "Add Branch"
  ├─ Enter: Name, Location, Manager
  └─ Repeat for multiple branches
  ↓
Add Contacts (Optional)
  ├─ Click "Add Contact"
  ├─ Enter: Name, Email, Phone1, Phone2
  └─ Repeat for multiple contacts
  ↓
Add Addresses (Optional)
  ├─ Click "Add Address"
  ├─ Select: Billing or Shipping
  ├─ Enter: Address details, State, Pincode
  └─ Repeat for multiple addresses
  ↓
Click "Save Customer" Button
  ↓
Validate all data on client-side
  ↓
IF any errors THEN show error message and GOTO [Fill Customer Basic Info]
  ↓
Send POST /api/customers request
  ↓
Server creates customer + branches + contacts + addresses in transaction
  ↓
Return created customer ID
  ↓
Navigate to Customer Profile Page
  ↓
Show success message with customer details
  ↓
END
```

### Workflow 2: Creating an Order

```
START
  ↓
User clicks "Create New Order" button
  ↓
Navigate to Order Form Page
  ↓
Select Customer from Dropdown
  ├─ API loads all active customers
  ├─ User selects one
  └─ Triggers branch loading
  ↓
Select Branch from Dropdown
  ├─ API loads branches for selected customer
  └─ User selects delivery branch
  ↓
Fill Order Basic Information
  ├─ Order Number (auto-generated or editable)
  ├─ Order Date (date picker)
  ├─ Year
  ├─ Sales Person
  └─ Status
  ↓
Fill Product Details
  ├─ Product Type (Select)
  ├─ Product Code
  ├─ Size
  └─ HSN Code
  ↓
Enter Quantity & Pricing
  ├─ Quantity
  ├─ Currency (INR/USD/EUR)
  ├─ Unit Price
  ├─ Conversion Rate
  └─ [Auto-calculate] Final Price INR
  ↓
Enter Tax Information
  ├─ Tax Percentage (default 18%)
  ├─ [Auto-calculate] Tax Amount
  └─ [Auto-calculate] Final Amount
  ↓
Enter Delivery & Invoice Info
  ├─ Delivery Date
  ├─ Invoice Number
  └─ Invoice Date
  ↓
Click "Create Order" Button
  ↓
Validate all data on client-side
  ↓
IF any errors THEN show error message and GOTO [Enter relevant section]
  ↓
Send POST /api/orders request
  ↓
Server creates order record
  ↓
Return created order ID
  ↓
Navigate to Order Profile Page
  ↓
Show success message with order details
  ↓
END
```

### Workflow 3: Viewing Analytics

```
START
  ↓
User clicks "Analytics" in sidebar
  ↓
Navigate to Analytics Page
  ↓
Load summary statistics
  ├─ Total Revenue
  ├─ Total Orders
  ├─ Total Customers
  └─ Pending Orders
  ↓
Load chart data in parallel
  ├─ Monthly Sales Chart
  ├─ Industry Revenue Chart
  ├─ Order Status Distribution
  ├─ Product Distribution
  ├─ Top Customers List
  └─ Recent Activity Table
  ↓
Display loading indicators during fetch
  ↓
Render all charts and tables
  ↓
User can apply filters
  ├─ Date Range
  ├─ Customer
  ├─ Branch
  └─ Product Type
  ↓
Filters trigger data refresh
  ↓
User can export as Excel
  ├─ Click "Download Report"# EDGEFLEX CRM - Complete Project Design & Architecture Documentation

**Version:** 4.0.2-Industrial  
**Date:** April 19, 2026  
**Status:** Production Ready  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Portal Modules](#portal-modules)
4. [Customer Portal - Complete Details](#customer-portal---complete-details)
5. [Order Portal - Complete Details](#order-portal---complete-details)
6. [Analytics Portal](#analytics-portal)
7. [Database Schema](#database-schema)
8. [API Architecture](#api-architecture)
9. [User Authentication & Security](#user-authentication--security)
10. [User Workflows](#user-workflows)

---

## Project Overview

### Purpose
**Edgeflex CRM** is an industrial-grade Customer Relationship Management system designed to manage:
- Customer Base (Dealers, End Users, Distributors)
- Order Management & Tracking
- Revenue Analytics & Reporting
- Data Import/Export (Excel-based)
- Role-Based Access Control & Permissions

### Key Features
✅ **Multi-user System** - User isolation with role-based permissions  
✅ **Customer Management** - Complete customer lifecycle management  
✅ **Order Processing** - Real-time order creation, tracking, and status management  
✅ **Analytics Dashboard** - Revenue insights, sales trends, customer analytics  
✅ **Bulk Data Import** - Excel/CSV import for customers and orders  
✅ **Security Module** - Permission management and data sharing  
✅ **Responsive UI** - Works on desktop and mobile devices  

### Technology Stack

#### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6.2
- **Styling:** Tailwind CSS 4.1 + Custom Industrial Design System
- **UI Components:** Motion (animations), Lucide React (icons), Recharts (data visualization)
- **State Management:** React Context API
- **Authentication:** Firebase Auth (Google Sign-in + Email/Password)

#### Backend
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma Client 6.19
- **Authentication:** Firebase Admin SDK
- **File Processing:** XLSX (Excel), PapaParse (CSV)

#### DevOps & Deployment
- **Hosting:** Netlify (Frontend)
- **Backend:** Express Server (Cloud Run Compatible)
- **Database:** PostgreSQL (Cloud SQL)
- **Authentication:** Firebase

---

## System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE (React)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Auth UI    │  │   Sidebar    │  │   Content    │       │
│  │   (Login)    │  │  (Navigation)│  │  (Portal)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                      │                                        │
│            ┌─────────▼──────────┐                            │
│            │  AuthContext API   │                            │
│            │  (Firebase Auth)   │                            │
│            └─────────┬──────────┘                            │
│                      │                                        │
│            ┌─────────▼──────────┐                            │
│            │   DB Service       │                            │
│            │  (API Client)      │                            │
│            └─────────┬──────────┘                            │
│                      │ (HTTP Requests)                       │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────┐
│         BACKEND (Express + Prisma)                          │
├──────────────────────┼──────────────────────────────────────┤
│                      │                                        │
│        ┌─────────────▼─────────────┐                        │
│        │  Express API Endpoints    │                        │
│        ├─────────────────────────────┤                       │
│        │ /api/customers/*            │                       │
│        │ /api/orders/*               │                       │
│        │ /api/analytics/*            │                       │
│        │ /api/permissions/*          │                       │
│        │ /api/bulk-import            │                       │
│        └────────────┬────────────────┘                       │
│                     │                                         │
│        ┌────────────▼────────────┐                           │
│        │ Prisma ORM              │                           │
│        │ (Database Models)       │                           │
│        └────────────┬────────────┘                           │
│                     │                                         │
│        ┌────────────▼────────────┐                           │
│        │ PostgreSQL Database     │                           │
│        │ (Data Persistence)      │                           │
│        └─────────────────────────┘                           │
│                                                               │
│   ┌────────────────────────────────────┐                    │
│   │  Middleware & Security             │                    │
│   ├────────────────────────────────────┤                    │
│   │ • Firebase Auth Verification       │                    │
│   │ • User Isolation & Permissions     │                    │
│   │ • CORS & Security Headers          │                    │
│   └────────────────────────────────────┘                    │
│                                                               │
└────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Login** → Firebase Authentication
2. **Get Auth Token** → Firebase ID Token (JWT)
3. **API Request** → Include Token in Authorization Header
4. **Backend Validation** → Verify Token & Check Permissions
5. **Database Query** → Prisma executes query with user isolation
6. **Response** → Return filtered data to client
7. **UI Update** → React re-renders with new data

---

## Portal Modules

### 1. **Dashboard (Control Center)**
**Purpose:** Central hub showing business metrics and recent activity

#### Components:
- **Summary Cards** (4 Main KPIs)
  - Total Customers
  - Total Orders
  - Revenue Yield (Total Revenue)
  - Security Mesh (Active Permissions)

- **Recent Activity Stream**
  - Last 5 orders with status
  - Real-time updates
  - Quick access to order details

- **Action Buttons**
  - Expand Customer Mesh (Add new customer)
  - Create New Order
  - View Analytics
  - Inject New Data (Bulk Import)

#### Data Retrieved:
```
- Total Customers Count
- Total Orders Count
- Total Revenue Sum
- Active Permissions Count
- Recent Orders (Last 5)
```

---

### 2. **Customer Portal**
**Purpose:** Complete customer lifecycle management

#### Sections:
- **Customer List View**
  - Search by customer name
  - Display all customers
  - Show key information (Name, Type, Industry, GST)
  - Quick actions (View, Edit, Delete)

- **Add New Customer** (Form)
  - Basic Information
  - Branch Management
  - Contact Management
  - Address Management

- **View Customer Profile**
  - Complete customer details
  - Associated branches
  - Contact information
  - Addresses (Billing & Shipping)
  - Customer analytics (Lifetime value, orders, pending orders)
  - Order history for this customer

- **Edit Customer**
  - Update all customer fields
  - Modify branches, contacts, addresses

#### Menu Navigation:
```
Customers Menu
├── List (Portal)
├── Add New Customer
├── Customer Profile [ID]
└── Edit Customer [ID]
```

---

### 3. **Order Portal**
**Purpose:** Order creation, tracking, and management

#### Sections:
- **Order List View**
  - Search by order number or customer name
  - Filter by status (Pending, Confirmed, Delivered)
  - Filter by product type
  - Display: Order#, Customer, Product, Amount, Status
  - Quick actions (View, Delete)
  - Bulk import from Excel

- **Create New Order** (Form)
  - Customer Selection (Dropdown)
  - Branch Selection (Dynamic based on customer)
  - Order Details
    - Order Number (Auto-generated)
    - Order Date
    - Year
    - Sales Person
    - Status
  - Product Information
    - Product Type (MEJ, FEJ, NMEJ, etc.)
    - Product Code
    - Size
    - HSN Code
  - Quantity & Pricing
    - Quantity
    - Currency (INR, USD, EUR)
    - Unit Price
    - Conversion Rate
    - Total Price (Auto-calculated)
  - Tax Information
    - Tax Percentage
    - Tax Amount (Auto-calculated)
    - Final Amount (Auto-calculated)
  - Delivery Information
    - Delivery Date
    - Invoice Number
    - Invoice Date

- **View Order Profile**
  - Complete order details
  - Associated customer information
  - Branch details
  - Product specifications
  - Pricing breakdown
  - Invoice information
  - Delivery status

- **Edit Order**
  - Update order details
  - Modify status
  - Update delivery information

#### Menu Navigation:
```
Orders Menu
├── List (Portal)
├── Add New Order
├── Order Profile [ID]
├── Edit Order [ID]
└── Import Orders (Excel)
```

---

### 4. **Analytics Portal (Intelligence)**
**Purpose:** Business intelligence and reporting

#### Dashboards & Reports:

1. **Summary Statistics**
   - Total Revenue (All-time)
   - Total Orders (Count)
   - Total Customers (Count)
   - Pending Orders (Count)

2. **Revenue by Period**
   - Monthly Sales Chart (Area Chart)
   - Shows revenue trends over time
   - Export capability

3. **Revenue by Industry**
   - Industry-wise breakdown
   - Sector-wise performance

4. **Order Status Distribution**
   - Pie/Doughnut chart
   - Pending vs Completed orders

5. **Product Distribution**
   - Product type wise breakdown (MEJ, FEJ, NMEJ, etc.)
   - Volume by product

6. **Top Customers**
   - Top 6 customers by revenue
   - Customer name with revenue value

7. **Sales Rep Performance**
   - Performance by sales representative
   - Revenue attributed to each rep

8. **Recent Activity**
   - Last 10 orders
   - Order number, customer, product, amount, status
   - Timestamp

#### Filters:
- Date Range Selection
- Customer Filter
- Branch Filter (Dynamic)
- Product Type Filter
- Status Filter

#### Export Features:
- Export as Excel
- Multiple sheets with different data
- Summary, Monthly, Industry, and Status data

---

### 5. **Data Import Portal (Data Injection)**
**Purpose:** Bulk upload customers and orders from Excel

#### Features:

1. **File Upload**
   - Drag & drop interface
   - Support for .xlsx, .xls, .csv files
   - Max file size: 10MB

2. **Data Preview**
   - Show first 5 rows of uploaded data
   - Column names display
   - Data validation

3. **Data Mapping**
   - Map Excel columns to system fields
   - Required fields validation
   - Format validation

4. **Bulk Import Process**
   - Create customers with nested orders
   - Automatic ID generation
   - Relationship creation
   - Transaction handling

5. **Success Reporting**
   - Number of customers imported
   - Number of orders imported
   - Import timestamp

#### Required Excel Columns:
```
Year                 (Integer)
Order_No            (String)
Customer            (String - Customer Name)
Branch              (String - Branch Name)
Industry            (String - Industry Type)
Location            (String - Branch Location)
Product_Type        (String - Product Type: MEJ/FEJ/NMEJ)
Size                (String)
Quantity            (Integer)
Basic_Value         (Float - Price without tax)
Tax                 (Float - Tax amount)
Delivery_Date       (Date - DD-MM-YYYY or ISO format)
Invoice_No          (String)
Invoice_Date        (Date - DD-MM-YYYY or ISO format)
GST                 (String - Customer GST Number)
Type                (String - Customer Type)
```

---

### 6. **Security Settings**
**Purpose:** Manage permissions and data sharing

#### Features:

1. **View Current Permissions**
   - Permissions shared with you
   - Permissions you shared with others

2. **Share Access**
   - Enter email to share with
   - Select access level:
     - READ: View only
     - WRITE: View and edit
     - BOTH: Full access

3. **Manage Existing Shares**
   - Update access levels
   - Revoke access

4. **Permission Model**
   - Owner: Full access to own data
   - Shared access: Via email
   - Access levels control what users can do
   - User isolation in all queries

---

## Customer Portal - Complete Details

### **Add/Create Customer - Full Requirements**

#### Form Structure

```
┌─────────────────────────────────────────┐
│        ADD NEW CUSTOMER FORM            │
├─────────────────────────────────────────┤
│                                         │
│ SECTION 1: BASIC INFORMATION            │
├─────────────────────────────────────────┤
│                                         │
│ [*] Customer Name (Required)            │
│     └─ Text Input                       │
│     └─ Type: String (Max 255 chars)    │
│     └─ Example: "ABC Industries Ltd"   │
│                                         │
│ [*] Customer Type (Required)            │
│     └─ Dropdown Select                  │
│     └─ Options:                         │
│        - Dealer                         │
│        - End User                       │
│        - Distributor                    │
│        - Retailer                       │
│        - Manufacturer                   │
│                                         │
│ [*] Industry Type (Required)            │
│     └─ Dropdown Select                  │
│     └─ Options:                         │
│        - Manufacturing                  │
│        - Service                        │
│        - Retail                         │
│        - Healthcare                     │
│        - Education                      │
│        - Others                         │
│                                         │
│ [ ] GST Registration Number (Optional)  │
│     └─ Text Input                       │
│     └─ Format: 15 chars (e.g., 27AABCT...)
│     └─ Used for invoicing              │
│                                         │
├─────────────────────────────────────────┤
│ SECTION 2: BRANCH MANAGEMENT           │
├─────────────────────────────────────────┤
│                                         │
│ [Add Branch] Button                     │
│ ┌──────────────────────────────────┐  │
│ │ BRANCH 1 (Collapsible)           │  │
│ ├──────────────────────────────────┤  │
│ │ Branch Name: Main Office         │  │
│ │ Location: Delhi                  │  │
│ │ Manager: John Doe                │  │
│ │ [Edit] [Delete]                  │  │
│ └──────────────────────────────────┘  │
│                                         │
│ ┌──────────────────────────────────┐  │
│ │ BRANCH 2 (Collapsible)           │  │
│ ├──────────────────────────────────┤  │
│ │ Branch Name: North Zone          │  │
│ │ Location: Mumbai                 │  │
│ │ Manager: Jane Smith              │  │
│ │ [Edit] [Delete]                  │  │
│ └──────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ SECTION 3: CONTACT MANAGEMENT          │
├─────────────────────────────────────────┤
│                                         │
│ [Add Contact] Button                    │
│ ┌──────────────────────────────────┐  │
│ │ CONTACT 1 (Collapsible)          │  │
│ ├──────────────────────────────────┤  │
│ │ Name: Rajesh Kumar               │  │
│ │ Email: rajesh@abc.com            │  │
│ │ Phone 1: +91-9876543210          │  │
│ │ Phone 2: +91-9123456789          │  │
│ │ [Edit] [Delete]                  │  │
│ └──────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ SECTION 4: ADDRESS MANAGEMENT          │
├─────────────────────────────────────────┤
│                                         │
│ [Add Address] Button                    │
│ ┌──────────────────────────────────┐  │
│ │ BILLING ADDRESS (Collapsible)    │  │
│ ├──────────────────────────────────┤  │
│ │ Address Line 1: 123 Business St  │  │
│ │ Address Line 2: Suite 100        │  │
│ │ State: Delhi                     │  │
│ │ Country: India                   │  │
│ │ Pincode: 110001                  │  │
│ │ [Edit] [Delete]                  │  │
│ └──────────────────────────────────┘  │
│                                         │
│ ┌──────────────────────────────────┐  │
│ │ SHIPPING ADDRESS (Collapsible)   │  │
│ ├──────────────────────────────────┤  │
│ │ Address Line 1: 456 Warehouse Rd │  │
│ │ Address Line 2: Unit 5           │  │
│ │ State: Punjab                    │  │
│ │ Country: India                   │  │
│ │ Pincode: 160001                  │  │
│ │ [Edit] [Delete]                  │  │
│ └──────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ [Cancel]          [Save Customer]       │
└─────────────────────────────────────────┘
```

#### Field Specifications

| Field | Type | Required | Constraints | Usage |
|-------|------|----------|-------------|-------|
| Customer Name | String | Yes | Max 255 chars | Primary identifier |
| Customer Type | Select | Yes | Predefined list | Segmentation |
| Industry Type | Select | Yes | Predefined list | Analytics grouping |
| GST Number | String | No | 15 chars format | Tax invoicing |
| Branch Name | String | Yes (per branch) | Max 255 chars | Order assignment |
| Location | String | No | Max 255 chars | Geographical tracking |
| Manager | String | No | Max 255 chars | Contact information |
| Contact Name | String | No | Max 255 chars | Person identification |
| Email | String | No | Valid email format | Communication |
| Phone 1 | String | No | Phone format | Primary contact |
| Phone 2 | String | No | Phone format | Alternate contact |
| Address Line 1 | String | No | Max 255 chars | Shipping/Billing |
| Address Line 2 | String | No | Max 255 chars | Additional details |
| State | String | No | Max 255 chars | Regional info |
| Country | String | No | Default: India | International tracking |
| Pincode | String | No | Max 10 chars | Location precision |

#### Data Validation

```javascript
Validation Rules:
├── Customer Name
│   ├── Not empty
│   ├── Length between 3-255 characters
│   └── Cannot contain special characters
├── Email (if provided)
│   ├── Valid email format
│   └── Unique check (optional)
├── Phone (if provided)
│   ├── Valid phone format
│   └── At least 10 digits
├── Pincode (if provided)
│   ├── Numeric
│   └── 6-10 digits
└── GST (if provided)
    ├── Format: 15 chars
    └── Pattern: ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
```

#### Submit Process

1. **Client-side Validation**
   - Check all required fields
   - Validate email format
   - Validate GST format
   - Show error messages

2. **API Request**
   - POST `/api/customers`
   - Include auth token
   - Send entire nested structure

3. **Backend Processing**
   - Verify user permissions
   - Create customer record
   - Create branch records (if provided)
   - Create contact records (if provided)
   - Create address records (if provided)
   - All in single transaction

4. **Success Response**
   - Return created customer ID
   - Navigate to customer profile
   - Show success message

#### Edit Customer Process

- Same form structure as Add
- Pre-fill all existing data
- Allow updating any field
- Handle cascading deletes for removed branches/contacts
- Update timestamps

---

## Order Portal - Complete Details

### **Create Order - Full Requirements**

#### Form Structure

```
┌──────────────────────────────────────────┐
│        CREATE NEW ORDER FORM             │
├──────────────────────────────────────────┤
│                                          │
│ SECTION 1: CUSTOMER & BRANCH SELECTION   │
├──────────────────────────────────────────┤
│                                          │
│ [*] Select Customer (Required)           │
│     └─ Dropdown                          │
│     └─ Lists all active customers        │
│     └─ Shows: Customer Name              │
│     └─ onChange: Loads branches          │
│                                          │
│ [*] Select Branch (Required)             │
│     └─ Dropdown (Dependent on Customer)  │
│     └─ Populated after customer select   │
│     └─ Shows: Branch Name (Location)     │
│                                          │
├──────────────────────────────────────────┤
│ SECTION 2: ORDER BASIC INFORMATION      │
├──────────────────────────────────────────┤
│                                          │
│ [*] Order Number (Auto-generated)        │
│     └─ Format: ORD-{RANDOM_9_CHARS}     │
│     └─ Example: ORD-ABC123XYZ           │
│     └─ Read-only / Editable             │
│                                          │
│ [*] Order Date (Required)                │
│     └─ Date Picker                       │
│     └─ Default: Today                    │
│     └─ Format: YYYY-MM-DD               │
│                                          │
│ [*] Year (Required)                      │
│     └─ Number Input                      │
│     └─ Default: Current Year             │
│                                          │
│ [ ] Sales Person (Optional)              │
│     └─ Text Input                        │
│     └─ Name of sales representative      │
│                                          │
│ [*] Status (Required)                    │
│     └─ Select Dropdown                   │
│     └─ Options:                          │
│        - Pending (Default)               │
│        - Confirmed                       │
│        - Delivered                       │
│        - Cancelled                       │
│                                          │
├──────────────────────────────────────────┤
│ SECTION 3: PRODUCT DETAILS              │
├──────────────────────────────────────────┤
│                                          │
│ [*] Product Type (Required)              │
│     └─ Select Dropdown                   │
│     └─ Options:                          │
│        - MEJ (Most Efficient Junction)  │
│        - FEJ (Full Efficient Junction)  │
│        - NMEJ (Non-standard)             │
│        - Custom                          │
│                                          │
│ [*] Product Code (Required)              │
│     └─ Text Input                        │
│     └─ Example: PROD-2024-001            │
│                                          │
│ [ ] Size (Optional)                      │
│     └─ Text Input                        │
│     └─ Example: 10x20cm, 500ml, etc      │
│                                          │
│ [ ] HSN Code (Optional)                  │
│     └─ Text Input                        │
│     └─ Harmonized System Nomenclature    │
│     └─ Format: 8 digits                  │
│                                          │
├──────────────────────────────────────────┤
│ SECTION 4: QUANTITY & PRICING           │
├──────────────────────────────────────────┤
│                                          │
│ [*] Quantity (Required)                  │
│     └─ Number Input                      │
│     └─ Min: 1                            │
│     └─ Unit: Units (system default)      │
│                                          │
│ [*] Currency (Required)                  │
│     └─ Select Dropdown                   │
│     └─ Options:                          │
│        - INR (Indian Rupee - Default)   │
│        - USD (US Dollar)                 │
│        - EUR (Euro)                      │
│                                          │
│ [*] Unit Price (Required)                │
│     └─ Decimal Input                     │
│     └─ Price per unit in selected currency
│                                          │
│ [ ] Conversion Rate (Optional)           │
│     └─ Decimal Input                     │
│     └─ Default: 1.0                      │
│     └─ Used to convert to INR            │
│                                          │
│ [Auto] Unit Price INR (Auto-calculated)  │
│     └─ unitPrice × conversionRate        │
│     └─ Read-only                         │
│                                          │
│ [Auto] Total Price (Auto-calculated)     │
│     └─ unitPriceINR × quantity           │
│     └─ Read-only                         │
│                                          │
├──────────────────────────────────────────┤
│ SECTION 5: TAX INFORMATION              │
├──────────────────────────────────────────┤
│                                          │
│ [ ] Tax Percentage (Optional)            │
│     └─ Decimal Input (0-100)             │
│     └─ Default: 18 (GST standard)        │
│     └─ onChange: Auto-calculate tax      │
│                                          │
│ [Auto] Tax Amount (Auto-calculated)      │
│     └─ totalPrice × (taxPercent / 100)   │
│     └─ Read-only                         │
│                                          │
│ [Auto] Final Amount (Auto-calculated)    │
│     └─ totalPrice + taxAmount            │
│     └─ Read-only                         │
│     └─ Bold, highlighted display         │
│                                          │
│ [ ] Basic Value (Optional)               │
│     └─ Number Input                      │
│     └─ Alternative to totalPrice         │
│                                          │
├──────────────────────────────────────────┤
│ SECTION 6: DELIVERY & INVOICE           │
├──────────────────────────────────────────┤
│                                          │
│ [ ] Delivery Date (Optional)             │
│     └─ Date Picker                       │
│     └─ Must be >= Order Date             │
│     └─ Format: YYYY-MM-DD               │
│                                          │
│ [ ] Invoice Number (Optional)            │
│     └─ Text Input                        │
│     └─ Format: INV-YYYY-XXXXX            │
│     └─ Unique identifier                 │
│                                          │
│ [ ] Invoice Date (Optional)              │
│     └─ Date Picker                       │
│     └─ Format: YYYY-MM-DD               │
│                                          │
├──────────────────────────────────────────┤
│ [Cancel]           [Create Order]        │
└──────────────────────────────────────────┘
```

#### Field Specifications for Order

| Field | Type | Required | Constraints | Logic |
|-------|------|----------|-------------|-------|
| Order Number | String | Yes | Unique, auto-generated | Identifier |
| Order Date | Date | Yes | ISO format | Timeline tracking |
| Year | Integer | Yes | Current/future year | Fiscal period |
| Sales Person | String | No | Max 255 chars | Attribution |
| Status | Select | Yes | Pending/Confirmed/Delivered | State machine |
| Product Type | Select | Yes | Predefined list | Categorization |
| Product Code | String | Yes | Max 100 chars | Product tracking |
| Size | String | No | Max 100 chars | Specification |
| HSN Code | String | No | 8 digits | Tax classification |
| Quantity | Integer | Yes | Min 1 | Order volume |
| Currency | Select | Yes | INR/USD/EUR | Price basis |
| Unit Price | Decimal | Yes | Min 0 | Cost calculation |
| Conversion Rate | Decimal | No | Default 1.0 | Currency conversion |
| Unit Price INR | Decimal | Auto | Read-only | Calculated field |
| Total Price | Decimal | Auto | Read-only | Calculated field |
| Tax Percentage | Decimal | No | 0-100, Default 18 | Tax calculation |
| Tax Amount | Decimal | Auto | Read-only | Calculated field |
| Final Amount | Decimal | Auto | Read-only | Calculated field |
| Basic Value | Decimal | No | Alternative input | Flexibility |
| Delivery Date | Date | No | >= Order Date | Fulfillment tracking |
| Invoice Number | String | No | Unique, Max 50 | Financial reference |
| Invoice Date | Date | No | ISO format | Financial period |

#### Auto-Calculation Logic

```javascript
Calculations:
├── Unit Price INR
│   └─ unitPrice × conversionRate
│
├── Total Price (Method 1 - Primary)
│   └─ unitPriceINR × quantity
│
├── Total Price (Method 2 - Fallback)
│   └─ IF basicValue provided THEN basicValue
│   └─ ELSE unitPriceINR × quantity
│
├── Tax Amount
│   └─ totalPrice × (taxPercent / 100)
│   └─ rounded to 2 decimals
│
└── Final Amount
    └─ totalPrice + taxAmount
    └─ rounded to 2 decimals
    └─ This is the billable amount
```

#### Validation Rules

```javascript
Validations:
├── Basic Validations
│   ├── All required fields must be filled
│   ├── Quantity must be > 0
│   ├── Prices must be >= 0
│   └── Tax % must be between 0-100
│
├── Date Validations
│   ├── Delivery Date >= Order Date
│   ├── Invoice Date >= Order Date (if provided)
│   └── All dates in valid format
│
├── Customer/Branch
│   ├── Customer must exist
│   ├── Branch must belong to selected customer
│   └── Cannot be null
│
└── Unique Checks
    └── Order Number must be unique in system
```

#### Submit Process

1. **Front-end Validation**
   - Check required fields
   - Validate all constraints
   - Calculate final values
   - Show any validation errors

2. **API Request**
   - POST `/api/orders`
   - Include auth token
   - Send complete order object

3. **Backend Processing**
   - Verify user permissions
   - Validate order data
   - Check customer/branch exist
   - Insert order record
   - Update timestamps

4. **Response Handling**
   - Show success message
   - Navigate to order profile
   - Display created order number

---

## Database Schema

### Entity-Relationship Diagram

```
Customer
├── id (PK, Int)
├── name (String)
├── type (String) - Dealer, End User, etc.
├── gst_number (String, Optional)
├── industry_type (String)
├── user_id (String) - For multi-tenancy
├── created_at (DateTime)
├── updated_at (DateTime)
│
├── Branches (1:Many)
│   ├── id (PK)
│   ├── name
│   ├── location
│   └── manager
│
├── Contacts (1:Many)
│   ├── id (PK)
│   ├── name
│   ├── email
│   ├── phone1
│   └── phone2
│
├── Addresses (1:Many)
│   ├── id (PK)
│   ├── address_type (billing/shipping)
│   ├── line1, line2
│   ├── state
│   ├── country
│   └── pincode
│
└── Orders (1:Many)
    ├── id (PK)
    ├── order_number
    ├── order_date
    ├── status
    ├── quantity
    ├── unit_price
    ├── final_amount
    └── ... (see below)

Order
├── id (PK, Int)
├── customer_id (FK)
├── branch_id (FK, Optional)
├── order_number (String, Unique)
├── order_date (DateTime)
├── status (String) - Pending, Confirmed, Delivered
├── year (Int)
├── product_type (String)
├── product_code (String)
├── size (String)
├── hsn_code (String)
├── quantity (Int)
├── unit_price (Float)
├── conversion_rate (Float)
├── unit_price_inr (Float)
├── total_price (Float)
├── tax_amount (Float)
├── final_amount (Float)
├── basic_value (Float)
├── delivery_date (DateTime)
├── invoice_no (String)
├── invoice_date (DateTime)
├── user_id (String) - For multi-tenancy
├── created_at (DateTime)
├── updated_at (DateTime)
└── customer (Relation)
```

### Table Definitions (SQL)

```sql
-- Customers Table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  gst_number VARCHAR(50),
  industry_type VARCHAR(100),
  user_id VARCHAR(255) DEFAULT 'unknown',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id)
);

-- Branches Table
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  manager VARCHAR(255),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Contacts Table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone1 VARCHAR(20),
  phone2 VARCHAR(20),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Addresses Table
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  address_type VARCHAR(50),
  line1 VARCHAR(255),
  line2 VARCHAR(255),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(10),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  branch_id INT,
  order_number VARCHAR(255) UNIQUE NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Pending',
  year INT,
  product_type VARCHAR(100),
  product_code VARCHAR(100),
  size VARCHAR(100),
  hsn_code VARCHAR(20),
  quantity INT,
  unit_price FLOAT,
  conversion_rate FLOAT DEFAULT 1.0,
  unit_price_inr FLOAT,
  total_price FLOAT,
  tax_amount FLOAT,
  final_amount FLOAT,
  basic_value FLOAT,
  delivery_date TIMESTAMP,
  invoice_no VARCHAR(100),
  invoice_date TIMESTAMP,
  user_id VARCHAR(255) DEFAULT 'unknown',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (order_number)
);

-- Permissions Table (for sharing)
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  owner_id VARCHAR(255) NOT NULL,
  shared_with_email VARCHAR(255) NOT NULL,
  access_level VARCHAR(50), -- READ, WRITE, BOTH
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (owner_id, shared_with_email)
);
```

---

## API Architecture

### Base URL
```
Development: http://localhost:5001/api
Production: https://api.edgeflex.com/api
```

### Authentication
All endpoints (except login) require Firebase ID Token:
```
Header: Authorization: Bearer {firebaseIdToken}
```

### API Endpoints

#### Customer Endpoints

```
GET  /api/customers                    → List all customers
GET  /api/customers?q=search          → Search customers by name
GET  /api/customers/{id}              → Get single customer
POST /api/customers                   → Create new customer
PUT  /api/customers/{id}              → Update customer
DELETE /api/customers/{id}            → Delete customer
```

**Example Request - Create Customer:**
```json
POST /api/customers

{
  "name": "ABC Industries Ltd",
  "type": "Dealer",
  "gst_number": "27AABCT1234F1Z5",
  "industry_type": "Manufacturing",
  "branches": [
    {
      "name": "Main Office",
      "location": "Delhi",
      "manager": "John Doe"
    }
  ],
  "contacts": [
    {
      "name": "Rajesh Kumar",
      "email": "rajesh@abc.com",
      "phone1": "+91-9876543210",
      "phone2": "+91-9123456789"
    }
  ],
  "addresses": [
    {
      "address_type": "billing",
      "line1": "123 Business Street",
      "line2": "Suite 100",
      "state": "Delhi",
      "country": "India",
      "pincode": "110001"
    }
  ]
}
```

#### Order Endpoints

```
GET  /api/orders                      → List all orders
GET  /api/orders?status=Pending       → Filter orders by status
GET  /api/orders/{id}                 → Get single order
POST /api/orders                      → Create new order
PUT  /api/orders/{id}                 → Update order
DELETE /api/orders/{id}               → Delete order
```

**Example Request - Create Order:**
```json
POST /api/orders

{
  "customer_id": 1,
  "branch_id": 5,
  "order_number": "ORD-ABC123XYZ",
  "order_date": "2024-04-19",
  "year": 2024,
  "sales_person": "John Smith",
  "status": "Pending",
  "product_type": "MEJ",
  "product_code": "PROD-2024-001",
  "size": "10x20cm",
  "hsn_code": "84431900",
  "quantity": 100,
  "currency": "INR",
  "unit_price": 500,
  "conversion_rate": 1.0,
  "unit_price_inr": 500,
  "total_price": 50000,
  "tax_percentage": 18,
  "tax_amount": 9000,
  "final_amount": 59000,
  "delivery_date": "2024-05-19",
  "invoice_no": "INV-2024-001",
  "invoice_date": "2024-04-19"
}
```

#### Analytics Endpoints

```
GET /api/analytics/summary           → Total revenue, orders, customers
GET /api/analytics/sales-by-month    → Monthly revenue breakdown
GET /api/analytics/revenue-by-industry → Revenue by industry
GET /api/analytics/top-customers     → Top customers by revenue
```

#### Permission Endpoints

```
GET    /api/permissions              → List all permissions for user
POST   /api/permissions              → Create permission (share data)
DELETE /api/permissions/{id}         → Revoke permission
```

**Example - Share Data:**
```json
POST /api/permissions

{
  "email": "colleague@company.com",
  "access_level": "READ"  // or "WRITE" or "BOTH"
}
```

#### Bulk Import Endpoint

```
POST /api/bulk-import

{
  "customers": [
    {
      "name": "Customer 1",
      "type": "Dealer",
      "industry_type": "Manufacturing",
      "orders": {
        "create": [
          {
            "order_number": "ORD-001",
            "year": 2024,
            "quantity": 100,
            ...
          }
        ]
      }
    }
  ]
}
```

---

## User Authentication & Security

### Authentication Flow

```
1. User clicks Login
   ↓
2. Firebase Authentication
   ├─ Email/Password
   ├─ Google Sign-in
   └─ Demo Mode (Development)
   ↓
3. Firebase Issues ID Token (JWT)
   ↓
4. Token stored in localStorage
   ↓
5. Auth Header set on all API calls
   ├─ Authorization: Bearer {token}
   ↓
6. Backend verifies token with Firebase Admin SDK
   ↓
7. Extract user UID and email from token
   ↓
8. Check permissions table for shared access
   ↓
9. Build SQL queries with user_id filter
   ↓
10. Return only accessible data to user
```

### Permission Model

```
User A (Owner)
├── Full access to own data
│
├── Can share with User B
│   ├── Access Level: READ (View only)
│   │
│   ├── Access Level: WRITE (View + Edit)
│   │
│   └─ Access Level: BOTH (Full access)
│
└── Can revoke access anytime

User B (Recipient)
├── Can view/edit shared data based on access level
├── Cannot see other recipients
└── Can access own data + shared data combined
```

### Data Isolation

All queries include WHERE clause:
```sql
WHERE user_id IN (
  '{currentUserId}',
  ... {userIds of users who shared with current user}
)
```

This ensures complete data isolation between users.

---

## User Workflows

### Workflow 1: Adding a New Customer

```
START
  ↓
User clicks "Add Customer" button
  ↓
Navigate to Customer Form Page
  ↓
Fill Customer Basic Info
  ├─ Name (Required)
  ├─ Type (Required)
  ├─ Industry Type (Required)
  └─ GST Number (Optional)
  ↓
Add Branches (Optional)
  ├─ Click "Add Branch"
  ├─ Enter: Name, Location, Manager
  └─ Repeat for multiple branches
  ↓
Add Contacts (Optional)
  ├─ Click "Add Contact"
  ├─ Enter: Name, Email, Phone1, Phone2
  └─ Repeat for multiple contacts
  ↓
Add Addresses (Optional)
  ├─ Click "Add Address"
  ├─ Select: Billing or Shipping
  ├─ Enter: Address details, State, Pincode
  └─ Repeat for multiple addresses
  ↓
Click "Save Customer" Button
  ↓
Validate all data on client-side
  ↓
IF any errors THEN show error message and GOTO [Fill Customer Basic Info]
  ↓
Send POST /api/customers request
  ↓
Server creates customer + branches + contacts + addresses in transaction
  ↓
Return created customer ID
  ↓
Navigate to Customer Profile Page
  ↓
Show success message with customer details
  ↓
END
```

### Workflow 2: Creating an Order

```
START
  ↓
User clicks "Create New Order" button
  ↓
Navigate to Order Form Page
  ↓
Select Customer from Dropdown
  ├─ API loads all active customers
  ├─ User selects one
  └─ Triggers branch loading
  ↓
Select Branch from Dropdown
  ├─ API loads branches for selected customer
  └─ User selects delivery branch
  ↓
Fill Order Basic Information
  ├─ Order Number (auto-generated or editable)
  ├─ Order Date (date picker)
  ├─ Year
  ├─ Sales Person
  └─ Status
  ↓
Fill Product Details
  ├─ Product Type (Select)
  ├─ Product Code
  ├─ Size
  └─ HSN Code
  ↓
Enter Quantity & Pricing
  ├─ Quantity
  ├─ Currency (INR/USD/EUR)
  ├─ Unit Price
  ├─ Conversion Rate
  └─ [Auto-calculate] Final Price INR
  ↓
Enter Tax Information
  ├─ Tax Percentage (default 18%)
  ├─ [Auto-calculate] Tax Amount
  └─ [Auto-calculate] Final Amount
  ↓
Enter Delivery & Invoice Info
  ├─ Delivery Date
  ├─ Invoice Number
  └─ Invoice Date
  ↓
Click "Create Order" Button
  ↓
Validate all data on client-side
  ↓
IF any errors THEN show error message and GOTO [Enter relevant section]
  ↓
Send POST /api/orders request
  ↓
Server creates order record
  ↓
Return created order ID
  ↓
Navigate to Order Profile Page
  ↓
Show success message with order details
  ↓
END
```

### Workflow 3: Viewing Analytics

```
START
  ↓
User clicks "Analytics" in sidebar
  ↓
Navigate to Analytics Page
  ↓
Load summary statistics
  ├─ Total Revenue
  ├─ Total Orders
  ├─ Total Customers
  └─ Pending Orders
  ↓
Load chart data in parallel
  ├─ Monthly Sales Chart
  ├─ Industry Revenue Chart
  ├─ Order Status Distribution
  ├─ Product Distribution
  ├─ Top Customers List
  └─ Recent Activity Table
  ↓
Display loading indicators during fetch
  ↓
Render all charts and tables
  ↓
User can apply filters
  ├─ Date Range
  ├─ Customer
  ├─ Branch
  └─ Product Type
  ↓
Filters trigger data refresh
  ↓
User can export as Excel
  ├─ Click "Download Report"
  ├─ Select sheets to include
  └─ Generate and download XLSX file
  ↓
END
```

### Workflow 4: Bulk Import Orders

```
START
  ↓
User clicks "Data Injection" in sidebar
  ↓
Navigate to Import Data Page
  ↓
Drag & drop or select Excel file
  ├─ Accepted formats: .xlsx, .xls, .csv
  └─ Max size: 10MB
  ↓
File parsing begins
  ├─ Read Excel/CSV
  ├─ Extract columns
  └─ Validate format
  ↓
Show data preview
  ├─ Display first 5 rows
  ├─ Show column names
  ├─ Highlight detected fields
  └─ Show row count
  ↓
IF data valid THEN
  ├─ Show confirmation dialog
  └─ Display number of records to import
  ↓
ELSE show error message with required fields
  ↓
User reviews and clicks "Execute Import"
  ↓
Send POST /api/bulk-import request with full data
  ↓
Server processes:
  ├─ Create customers (if not exist)
  ├─ Create branches
  ├─ Link orders to customers
  └─ Validate all data
  ↓
Return success/error report
  ├─ Number of customers created
  ├─ Number of orders created
  └─ Any validation errors
  ↓
Show success message
  ├─ Display import statistics
  └─ Option to navigate to orders/customers
  ↓
END
```

---

## Form Data Models (TypeScript)

```typescript
// Customer Model
interface Customer {
  id?: number;
  name: string;
  type: string; // Dealer, End User, Distributor, etc.
  gst_number?: string;
  industry_type?: string;
  created_at?: string;
  updated_at?: string;
  branches?: Branch[];
  contacts?: Contact[];
  addresses?: Address[];
  orders?: Order[];
}

interface Branch {
  id?: number;
  customer_id?: number;
  name: string;
  location?: string;
  manager?: string;
}

interface Contact {
  id?: number;
  customer_id?: number;
  name?: string;
  email?: string;
  phone1?: string;
  phone2?: string;
}

interface Address {
  id?: number;
  customer_id?: number;
  address_type: 'billing' | 'shipping';
  line1?: string;
  line2?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

// Order Model
interface Order {
  id?: number;
  order_number: string;
  order_date: string;
  year: number;
  sales_person: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  customer_id: number;
  branch_id?: number;
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
  tax_amount: number;
  final_amount: number;
  delivery_date?: string;
  invoice_number: string;
  invoice_date?: string;
  created_at?: string;
  customer_name?: string;
  branch_name?: string;
}
```

---

## Key Design Principles

### 1. **User Isolation (Multi-tenancy)**
- Every customer and order record has `user_id` field
- All queries filtered by user permissions
- Complete data privacy between users

### 2. **Auto-Calculation**
- Complex pricing calculations are automatic
- Reduces user error
- Real-time updates as values change

### 3. **Nested CRUD Operations**
- Create customer with branches/contacts/addresses in one request
- All or nothing transaction model
- Data integrity maintained

### 4. **Responsive Design**
- Works on mobile, tablet, and desktop
- Touch-friendly forms
- Adaptive layouts

### 5. **Real-time Feedback**
- Loading indicators
- Error messages with context
- Success notifications
- Form validation messages

### 6. **Data Persistence**
- All changes immediately saved
- No manual "Save" required after operations
- Timestamps track all changes

---

## Development Roadmap

### Phase 1 (Current)
✅ Authentication & Authorization  
✅ Customer Portal (CRUD)  
✅ Order Portal (CRUD)  
✅ Basic Analytics  
✅ Bulk Import  

### Phase 2 (Planned)
- [ ] Advanced Reporting
- [ ] Custom Dashboards
- [ ] Workflow Automation
- [ ] Email Notifications
- [ ] Mobile App

### Phase 3 (Future)
- [ ] AI-powered forecasting
- [ ] Inventory Management
- [ ] Payment Integration
- [ ] Multi-currency Support
- [ ] Advanced Scheduling

---

## Conclusion

**Edgeflex CRM** is a comprehensive, enterprise-grade solution for managing customer relationships and orders. With its intuitive interface, powerful analytics, and secure multi-user architecture, it provides businesses with the tools needed to scale operations effectively.

For questions or support, refer to the API documentation or contact the development team.

---

**Document Version:** 1.0  
**Last Updated:** April 19, 2026  
**Status:** Active

  ├─ Select sheets to include
  └─ Generate and download XLSX file
  ↓
END
```

### Workflow 4: Bulk Import Orders

```
START
  ↓
User clicks "Data Injection" in sidebar
  ↓
Navigate to Import Data Page
  ↓
Drag & drop or select Excel file
  ├─ Accepted formats: .xlsx, .xls, .csv
  └─ Max size: 10MB
  ↓
File parsing begins
  ├─ Read Excel/CSV
  ├─ Extract columns
  └─ Validate format
  ↓
Show data preview
  ├─ Display first 5 rows
  ├─ Show column names
  ├─ Highlight detected fields
  └─ Show row count
  ↓
IF data valid THEN
  ├─ Show confirmation dialog
  └─ Display number of records to import
  ↓
ELSE show error message with required fields
  ↓
User reviews and clicks "Execute Import"
  ↓
Send POST /api/bulk-import request with full data
  ↓
Server processes:
  ├─ Create customers (if not exist)
  ├─ Create branches
  ├─ Link orders to customers
  └─ Validate all data
  ↓
Return success/error report
  ├─ Number of customers created
  ├─ Number of orders created
  └─ Any validation errors
  ↓
Show success message
  ├─ Display import statistics
  └─ Option to navigate to orders/customers
  ↓
END
```

---

## Form Data Models (TypeScript)

```typescript
// Customer Model
interface Customer {
  id?: number;
  name: string;
  type: string; // Dealer, End User, Distributor, etc.
  gst_number?: string;
  industry_type?: string;
  created_at?: string;
  updated_at?: string;
  branches?: Branch[];
  contacts?: Contact[];
  addresses?: Address[];
  orders?: Order[];
}

interface Branch {
  id?: number;
  customer_id?: number;
  name: string;
  location?: string;
  manager?: string;
}

interface Contact {
  id?: number;
  customer_id?: number;
  name?: string;
  email?: string;
  phone1?: string;
  phone2?: string;
}

interface Address {
  id?: number;
  customer_id?: number;
  address_type: 'billing' | 'shipping';
  line1?: string;
  line2?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

// Order Model
interface Order {
  id?: number;
  order_number: string;
  order_date: string;
  year: number;
  sales_person: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  customer_id: number;
  branch_id?: number;
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
  tax_amount: number;
  final_amount: number;
  delivery_date?: string;
  invoice_number: string;
  invoice_date?: string;
  created_at?: string;
  customer_name?: string;
  branch_name?: string;
}
```

---

## Key Design Principles

### 1. **User Isolation (Multi-tenancy)**
- Every customer and order record has `user_id` field
- All queries filtered by user permissions
- Complete data privacy between users

### 2. **Auto-Calculation**
- Complex pricing calculations are automatic
- Reduces user error
- Real-time updates as values change

### 3. **Nested CRUD Operations**
- Create customer with branches/contacts/addresses in one request
- All or nothing transaction model
- Data integrity maintained

### 4. **Responsive Design**
- Works on mobile, tablet, and desktop
- Touch-friendly forms
- Adaptive layouts

### 5. **Real-time Feedback**
- Loading indicators
- Error messages with context
- Success notifications
- Form validation messages

### 6. **Data Persistence**
- All changes immediately saved
- No manual "Save" required after operations
- Timestamps track all changes

---

## Development Roadmap

### Phase 1 (Current)
✅ Authentication & Authorization  
✅ Customer Portal (CRUD)  
✅ Order Portal (CRUD)  
✅ Basic Analytics  
✅ Bulk Import  

### Phase 2 (Planned)
- [ ] Advanced Reporting
- [ ] Custom Dashboards
- [ ] Workflow Automation
- [ ] Email Notifications
- [ ] Mobile App

### Phase 3 (Future)
- [ ] AI-powered forecasting
- [ ] Inventory Management
- [ ] Payment Integration
- [ ] Multi-currency Support
- [ ] Advanced Scheduling

---

## Conclusion

**Edgeflex CRM** is a comprehensive, enterprise-grade solution for managing customer relationships and orders. With its intuitive interface, powerful analytics, and secure multi-user architecture, it provides businesses with the tools needed to scale operations effectively.

For questions or support, refer to the API documentation or contact the development team.

---

**Document Version:** 1.0  
**Last Updated:** April 19, 2026  
**Status:** Active
