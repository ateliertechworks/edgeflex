import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, ShoppingCart, TrendingUp, AlertCircle, 
  ArrowRight, Activity, ShieldCheck, Database
} from 'lucide-react';
import { dbService } from '../services/db_service';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    revenue: '₹0.00',
    activePermissions: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [customers, orders, permissions] = await Promise.all([
          dbService.getCustomers(),
          dbService.getOrders(),
          dbService.getPermissions()
        ]);
        
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.final_amount || 0), 0);
        
        setStats({
          totalCustomers: customers.length,
          totalOrders: orders.length,
          revenue: totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
          activePermissions: permissions.sharesByMe.length + permissions.sharesToMe.length
        });
        
        // Sort orders by date for activity stream
        const sortedOrders = [...orders].sort((a, b) => 
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
        );
        setRecentActivity(sortedOrders.slice(0, 5));
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const cards = [
    { 
      label: 'Customer Base', 
      value: stats.totalCustomers, 
      icon: Users, 
      color: 'bg-black',
      change: stats.totalCustomers > 0 ? 'ACTIVE' : 'EMPTY',
      id: 'customers'
    },
    { 
      label: 'Order Stream', 
      value: stats.totalOrders, 
      icon: ShoppingCart, 
      color: 'bg-black',
      change: stats.totalOrders > 0 ? 'SYNCED' : 'AWAITING',
      id: 'orders'
    },
    { 
      label: 'Revenue Yield', 
      value: stats.revenue, 
      icon: TrendingUp, 
      color: 'bg-black',
      change: 'LIVE',
      id: 'analytics'
    },
    { 
      label: 'Security Mesh', 
      value: stats.activePermissions, 
      icon: ShieldCheck, 
      color: 'bg-black',
      change: stats.activePermissions > 0 ? 'PROTECTED' : 'MANUAL',
      id: 'security'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-black tracking-[0.2em] uppercase">Control Center</h2>
            <span className="px-3 py-1 bg-[#66B366] text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Live Pulse
            </span>
          </div>
          <p className="text-black/40 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
            Welcome back, <span className="text-black">{user?.email?.split('@')[0]}</span>. CRM Mesh is <span className="text-[#66B366]">Operational</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-black text-black/20 uppercase tracking-widest">Protocol Version</p>
            <p className="text-[10px] font-bold text-black uppercase tracking-wider">v5.1.0-industrial</p>
          </div>
          <button 
            onClick={() => onNavigate('import')}
            className="industrial-btn-secondary flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Inject New Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onNavigate(card.id)}
            className="industrial-card p-8 bg-white border-black/5 hover:border-black/20 transition-all cursor-pointer group hover:shadow-xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-black/5 rounded flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-500">
                <card.icon className="w-6 h-6" />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                card.change === 'LIVE' || card.change === 'PROTECTED' || card.change === 'ACTIVE' || card.change === 'SYNCED'
                ? 'bg-[#66B366]/10 text-[#66B366]' 
                : 'bg-black/5 text-black/40'
              }`}>
                {card.change}
              </span>
            </div>
            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mb-1">{card.label}</p>
            <h3 className="text-2xl font-black text-black tracking-tight">
              {loading ? <span className="animate-pulse">...</span> : card.value}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / System Logs */}
        <div className="lg:col-span-2 industrial-card bg-white p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Operation Stream</h3>
            <button 
              onClick={() => onNavigate('orders')}
              className="text-[9px] font-black text-black/30 uppercase tracking-widest hover:text-black transition-colors"
            >
              Access Complete Log
            </button>
          </div>
          
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-2 h-2 bg-black rounded-full animate-ping" />
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((o, i) => (
                <div 
                  key={i} 
                  onClick={() => onNavigate('orders')}
                  className="flex items-start gap-4 p-4 rounded hover:bg-black/[0.02] transition-colors border border-transparent hover:border-black/5 cursor-pointer group"
                >
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-[#66B366] shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-bold text-black uppercase tracking-widest group-hover:text-[#0047FF] transition-colors">
                        Order #{o.order_number}
                      </p>
                      <span className="text-[9px] font-medium text-black/20 uppercase tracking-tighter">{new Date(o.order_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] text-black/40 uppercase font-medium tracking-tight leading-relaxed">
                      Handled transaction for <span className="text-black font-bold">{o.customer?.name}</span>. 
                      Payload: <span className="text-black">{o.product_type} ({o.size})</span>. 
                      Revenue: <span className="text-[#66B366] font-bold">₹{o.final_amount?.toLocaleString()}</span>.
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-black/10 rounded">
                <p className="text-[10px] font-black uppercase text-black/20 tracking-widest">Awaiting System Activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access / Admin Controls */}
        <div className="space-y-8">
          <div className="industrial-card bg-black p-8 text-white shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6">Security Module</h3>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-relaxed mb-8">
              Configure cross-account mesh protocols and define administrative access levels.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => onNavigate('security')}
                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#66B366]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Mesh Protocol Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => onNavigate('customers')}
                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#0047FF]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Expand Customer Mesh</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('analytics')}
            className="industrial-card bg-white p-8 border-dashed border-2 border-black/10 flex flex-col items-center text-center justify-center min-h-[200px] hover:border-[#0047FF] hover:bg-[#0047FF]/[0.01] transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-[#0047FF]/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-[#0047FF]" />
            </div>
            <h4 className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Open Intelligence Center</h4>
            <p className="text-[9px] text-black/30 mt-2 uppercase font-bold tracking-widest">Analyze Market Penetration</p>
          </div>
        </div>
      </div>
    </div>
  );
};
