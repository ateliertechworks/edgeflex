import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.BACKEND_PORT || 5001;

app.use(cors());
app.use(express.json());

interface AuthenticatedRequest extends express.Request {
  user: {
    uid: string;
    email?: string;
    readUids: string[];
    writeUids: string[];
  } & admin.auth.DecodedIdToken;
}

// --- Middleware: Firebase Auth Verify ---
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find all UIDs that have shared access with this user's email
    const shares = await prisma.permission.findMany({
      where: { shared_with_email: decodedToken.email }
    });
    
    const readUids = [decodedToken.uid, ...shares.filter(s => s.access_level === 'READ' || s.access_level === 'BOTH').map(s => s.owner_id)];
    const writeUids = [decodedToken.uid, ...shares.filter(s => s.access_level === 'WRITE' || s.access_level === 'BOTH').map(s => s.owner_id)];
    
    (req as AuthenticatedRequest).user = {
      ...decodedToken,
      readUids,
      writeUids
    };
    next();
  } catch (error) {
    console.error('[Edgeflex] Auth Error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// --- Customers API ---

app.get('/api/customers', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    const readUids = (req as AuthenticatedRequest).user.readUids;
    const customers = await prisma.customer.findMany({
      where: {
        AND: [
          { user_id: { in: readUids } },
          q ? {
            OR: [
              { name: { contains: q as string, mode: 'insensitive' } },
              { gst_number: { contains: q as string, mode: 'insensitive' } }
            ]
          } : {}
        ]
      },
      include: {
        branches: true,
        contacts: true,
        addresses: true
      }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/api/customers/:id', authenticate, async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { 
        id: parseInt(req.params.id),
        user_id: { in: (req as AuthenticatedRequest).user.readUids }
      },
      include: {
        branches: true,
        contacts: true,
        addresses: true
      }
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found or access denied' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

app.post('/api/customers', authenticate, async (req, res) => {
  const { name, type, gst_number, industry_type, branches, contacts, addresses } = req.body;
  const userId = (req as AuthenticatedRequest).user.uid;
  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        type,
        gst_number,
        industry_type,
        user_id: userId,
        branches: {
          create: branches || []
        },
        contacts: {
          create: (contacts || []).map((c: any) => ({
            name: c.name,
            email: c.email,
            phone1: c.phone1,
            phone2: c.phone2
          }))
        },
        addresses: {
          create: addresses || []
        }
      }
    });
    res.status(201).json(customer);
  } catch (error) {
    console.error('[Edgeflex] Customer Create Error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

app.put('/api/customers/:id', authenticate, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const writeUids = (req as AuthenticatedRequest).user.writeUids;
    const { name, type, gst_number, industry_type, branches, contacts, addresses } = req.body;
    
    // Verify ownership or write access
    const existingCustomer = await prisma.customer.findFirst({
      where: { id: customerId, user_id: { in: writeUids } }
    });
    if (!existingCustomer) return res.status(403).json({ error: 'Forbidden: You do not own this record' });

    const customer = await prisma.$transaction(async (tx) => {
      await tx.branch.deleteMany({ where: { customer_id: customerId } });
      await tx.contact.deleteMany({ where: { customer_id: customerId } });
      await tx.address.deleteMany({ where: { customer_id: customerId } });

      return await tx.customer.update({
        where: { id: customerId },
        data: {
          name,
          type,
          gst_number,
          industry_type,
          branches: {
            create: (branches || []).map((b: any) => ({
              name: b.name || 'Branch',
              location: b.location,
              manager: b.manager
            }))
          },
          contacts: {
            create: (contacts || []).map((c: any) => ({
              name: c.name,
              email: c.email,
              phone1: c.phone1,
              phone2: c.phone2
            }))
          },
          addresses: {
            create: (addresses || []).map((a: any) => ({
              address_type: a.address_type,
              line1: a.line1,
              line2: a.line2,
              state: a.state,
              country: a.country || 'India',
              pincode: a.pincode
            }))
          }
        }
      });
    });
    res.json(customer);
  } catch (error) {
    console.error('[Edgeflex] Customer Update Error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

app.delete('/api/customers/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const writeUids = (req as AuthenticatedRequest).user.writeUids;

    const existingCustomer = await prisma.customer.findFirst({
      where: { id, user_id: { in: writeUids } }
    });
    if (!existingCustomer) return res.status(403).json({ error: 'Forbidden: No Write Access' });

    await prisma.customer.delete({
      where: { id }
    });
    console.log(`[Edgeflex] Deleted customer: ${id}`);
    res.status(204).send();
  } catch (error) {
    console.error('[Edgeflex] Customer Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// --- Orders API ---

app.get('/api/orders', authenticate, async (req, res) => {
  try {
    const readUids = (req as AuthenticatedRequest).user.readUids;
    const orders = await prisma.order.findMany({
      where: { user_id: { in: readUids } },
      include: {
        customer: { select: { name: true } }
      },
      orderBy: { order_date: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.uid;
    const writeUids = (req as AuthenticatedRequest).user.writeUids;
    const { customer_id, ...orderData } = req.body;

    // Verify the user has write access to this customer
    const customer = await prisma.customer.findFirst({
      where: { id: customer_id, user_id: { in: writeUids } }
    });

    if (!customer) {
      return res.status(403).json({ error: 'Forbidden: Cannot create order for this customer' });
    }

    const order = await prisma.order.create({
      data: {
        ...orderData,
        customer_id: customer_id,
        user_id: customer.user_id, // Inherit the owner's user_id, not necessarily the creator's
        order_number: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }
    });
    res.status(201).json(order);
  } catch (error) {
    console.error('[Edgeflex] Order Create Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.delete('/api/orders/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const writeUids = (req as AuthenticatedRequest).user.writeUids;

    const existingOrder = await prisma.order.findFirst({
      where: { id, user_id: { in: writeUids } }
    });
    if (!existingOrder) return res.status(403).json({ error: 'Forbidden: No Write Access' });

    await prisma.order.delete({
      where: { id }
    });
    console.log(`[Edgeflex] Deleted order: ${id}`);
    res.status(204).send();
  } catch (error) {
    console.error('[Edgeflex] Order Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// --- Analytics API ---

app.get('/api/analytics/summary', authenticate, async (req, res) => {
  try {
    const readUids = (req as AuthenticatedRequest).user.readUids;
    const [totalRevenue, totalOrders, totalCustomers, pendingOrders] = await Promise.all([
      prisma.order.aggregate({
        _sum: { final_amount: true },
        where: { user_id: { in: readUids }, status: { not: 'Cancelled' } }
      }),
      prisma.order.count({ where: { user_id: { in: readUids } } }),
      prisma.customer.count({ where: { user_id: { in: readUids } } }),
      prisma.order.count({ where: { user_id: { in: readUids }, status: 'Pending' } })
    ]);

    res.json({
      totalRevenue: totalRevenue._sum.final_amount || 0,
      totalOrders,
      totalCustomers,
      pendingOrders
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/analytics/sales-by-month', authenticate, async (req, res) => {
  try {
    const readUids = (req as AuthenticatedRequest).user.readUids;
    const orders = await prisma.order.findMany({
      where: { user_id: { in: readUids } }
    });

    const monthlyData: Record<string, number> = {};
    orders.forEach(o => {
        const month = o.order_date.toISOString().slice(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + (o.final_amount || 0);
    });

    const result = Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue
    })).sort((a, b) => a.month.localeCompare(b.month));

    res.json(result);
  } catch (error) {
    console.error('[Edgeflex] Monthly Sales Error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly sales' });
  }
});

app.get('/api/analytics/revenue-by-industry', authenticate, async (req, res) => {
  try {
    const readUids = (req as AuthenticatedRequest).user.readUids;
    const orders = await prisma.order.findMany({
      where: { user_id: { in: readUids } },
      include: {
        customer: {
          select: { industry_type: true }
        }
      }
    });

    const industryData: Record<string, number> = {};
    orders.forEach(o => {
        const ind = o.customer.industry_type || 'Others';
        industryData[ind] = (industryData[ind] || 0) + (o.final_amount || 0);
    });

    const result = Object.entries(industryData).map(([name, value]) => ({
        name,
        value
    })).sort((a, b) => b.value - a.value);

    res.json(result);
  } catch (error) {
    console.error('[Edgeflex] Industry Revenue Error:', error);
    res.status(500).json({ error: 'Failed to fetch industry revenue' });
  }
});

app.get('/api/analytics/top-customers', authenticate, async (req, res) => {
  try {
    const readUids = (req as AuthenticatedRequest).user.readUids;
    const customers = await prisma.customer.findMany({
      where: { user_id: { in: readUids } },
      include: {
        orders: true
      }
    });

    const result = customers.map(c => ({
        name: c.name,
        total_spent: c.orders.reduce((sum, o) => sum + (o.final_amount || 0), 0)
    })).sort((a, b) => b.total_spent - a.total_spent).slice(0, 10);

    res.json(result);
  } catch (error) {
    console.error('[Edgeflex] Top Customers Error:', error);
    res.status(500).json({ error: 'Failed to fetch top customers' });
  }
});

app.post('/api/bulk-import', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.uid;
    const { customers } = req.body;
    
    for (const c of customers) {
      const { orders, ...customerData } = c;
      
      // 1. Find or Create Customer
      let customer = await prisma.customer.findFirst({
        where: { 
          name: customerData.name,
          user_id: userId
        }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            ...customerData,
            user_id: userId
          }
        });
      }

      // 2. Upsert Orders
      if (orders && orders.create) {
        for (const o of orders.create) {
          await prisma.order.upsert({
            where: { order_number: o.order_number },
            update: {
              ...o,
              customer_id: customer.id,
              user_id: userId
            },
            create: {
              ...o,
              customer_id: customer.id,
              user_id: userId
            }
          });
        }
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('[Bulk Import Error]:', error);
    res.status(500).json({ error: 'Bulk import failed' });
  }
});

// --- Permissions / Security API ---

app.get('/api/permissions', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.uid;
    // Get permissions I have granted to others
    const myShares = await prisma.permission.findMany({
      where: { owner_id: userId }
    });
    // Get permissions others have granted to me
    const sharesToMe = await prisma.permission.findMany({
      where: { shared_with_email: (req as AuthenticatedRequest).user.email || '' }
    });
    res.json({ myShares, sharesToMe });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

app.post('/api/permissions', authenticate, async (req, res) => {
  try {
    const { email, access_level } = req.body;
    const userId = (req as AuthenticatedRequest).user.uid;
    const userEmail = (req as AuthenticatedRequest).user.email || '';

    const permission = await prisma.permission.create({
      data: {
        owner_id: userId,
        owner_email: userEmail,
        shared_with_email: email,
        access_level: access_level || 'READ'
      }
    });
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create share' });
  }
});

app.delete('/api/permissions/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as AuthenticatedRequest).user.uid;

    const permission = await prisma.permission.findFirst({
      where: { id, owner_id: userId }
    });
    if (!permission) return res.status(403).json({ error: 'Forbidden' });

    await prisma.permission.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke access' });
  }
});

app.listen(PORT, () => {
  console.log(`[Edgeflex] PostgreSQL Backend running on port ${PORT}`);
});
