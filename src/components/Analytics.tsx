import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Package, Activity, Download, Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { dbService } from '../services/db_service';

export const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [industryRevenue, setIndustryRevenue] = useState<any[]>([]);
  const [statusDist, setStatusDist] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [salesRepData, setSalesRepData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [productDist, setProductDist] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    industry: 'All',
    productType: 'All',
    customerId: 'All',
    branchId: 'All'
  });

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    if (filters.customerId !== 'All') {
      fetchBranches(filters.customerId);
    } else {
      setBranches([]);
      setFilters(prev => ({ ...prev, branchId: 'All' }));
    }
  }, [filters.customerId]);

  const fetchFiltersData = async () => {
    try {
      const data = await dbService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch filter options', error);
    }
  };

  const fetchBranches = async (customerId: string) => {
    try {
      const data = await dbService.getCustomer(parseInt(customerId));
      setBranches(data?.branches || []);
    } catch (error) {
      console.error('Failed to fetch branches', error);
      setBranches([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use client-side service for all analytics
      const [sData, mData, iData, tData, allOrders] = await Promise.all([
        dbService.getAnalyticsSummary(filters),
        dbService.getSalesByMonth(filters),
        dbService.getRevenueByIndustry(filters),
        dbService.getTopCustomers(),
        dbService.getOrders()
      ]);
      
      const stData = [
        { name: 'Pending', value: sData.pendingOrders }, 
        { name: 'Completed', value: sData.totalOrders - sData.pendingOrders }
      ];

      // Calculate Product Distribution
      const products: Record<string, number> = {};
      allOrders.forEach((o: any) => {
        products[o.product_type] = (products[o.product_type] || 0) + 1;
      });
      const pData = Object.entries(products).map(([name, value]) => ({ name, value }));

      const srData = [{ name: 'General Executive', value: sData.totalRevenue }]; // Simplified for prototype
      const raData = allOrders.slice(0, 10); // Recent activity

      setSummary(sData);
      setMonthlySales(mData);
      setIndustryRevenue(iData);
      setStatusDist(stData);
      setProductDist(pData);
      setTopCustomers(tData);
      setSalesRepData(srData);
      setRecentActivity(raData);
    } catch (error) {
      console.error('Failed to fetch analytics data', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      { Metric: 'Total Revenue', Value: summary.totalRevenue },
      { Metric: 'Total Orders', Value: summary.totalOrders },
      { Metric: 'Active Customers', Value: summary.totalCustomers },
      { Metric: 'Pending Orders', Value: summary.pendingOrders }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Industry Sheet
    const wsIndustry = XLSX.utils.json_to_sheet(industryRevenue);
    XLSX.utils.book_append_sheet(wb, wsIndustry, "Industry Revenue");

    // Monthly Sheet
    const wsMonthly = XLSX.utils.json_to_sheet(monthlySales);
    XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Sales");

    XLSX.writeFile(wb, `Edgeflex_Analytics_${filters.year}.xlsx`);
  };

  if (loading && !summary) return (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = (monthlySales && Array.isArray(monthlySales) && monthlySales.length > 0) 
    ? monthlySales.map(item => ({
        ...item,
        name: monthNames[parseInt(item.month) - 1] || 'N/A'
      }))
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black tracking-[0.2em] uppercase">Intelligence</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time performance metrics / Industrial analytics</p>
        </div>
        <button 
          onClick={exportAnalytics}
          className="industrial-btn-primary flex items-center gap-2 group"
        >
          <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          Export Intelligence
        </button>
      </div>

      {/* Customizable Filters */}
      <div className="industrial-card p-6 flex flex-wrap items-center gap-8 bg-white/50">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-black/30" />
          <span className="text-[10px] items-center font-black uppercase text-black/40 tracking-widest">Control Center:</span>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black uppercase text-black/30 tracking-[0.2em]">Fiscal Year</label>
          <select 
            className="industrial-input py-1.5 text-xs w-28 !bg-white"
            value={filters.year}
            onChange={(e) => setFilters({...filters, year: e.target.value})}
          >
            <option>2024</option>
            <option>2025</option>
            <option>2026</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black uppercase text-black/30 tracking-[0.2em]">Industry Sector</label>
          <select 
            className="industrial-input py-1.5 text-xs w-36 !bg-white"
            value={filters.industry}
            onChange={(e) => setFilters({...filters, industry: e.target.value})}
          >
            <option>All</option>
            <option>Power</option>
            <option>Cement</option>
            <option>Steel</option>
            <option>Fertiliser</option>
            <option>Petro Chemicals</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black uppercase text-black/30 tracking-[0.2em]">Product Category</label>
          <select 
            className="industrial-input py-1.5 text-xs w-36 !bg-white"
            value={filters.productType}
            onChange={(e) => setFilters({...filters, productType: e.target.value})}
          >
            <option>All</option>
            <option>MEJ</option>
            <option>RMEJ</option>
            <option>FEJ</option>
            <option>NMEJ</option>
            <option>Damper</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black uppercase text-black/30 tracking-[0.2em]">Entity</label>
          <select 
            className="industrial-input py-1.5 text-xs w-48 !bg-white"
            value={filters.customerId}
            onChange={(e) => setFilters({...filters, customerId: e.target.value, branchId: 'All'})}
          >
            <option value="All">Global Entities</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {filters.customerId !== 'All' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black uppercase text-black/30 tracking-[0.2em]">Operational Branch</label>
            <select 
              className="industrial-input py-1.5 text-xs w-36 !bg-white"
              value={filters.branchId}
              onChange={(e) => setFilters({...filters, branchId: e.target.value})}
            >
              <option value="All">All Operations</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: formatCurrency(summary?.totalRevenue || 0), icon: TrendingUp, border: 'border-black' },
          { label: 'Total Orders', value: summary?.totalOrders || 0, icon: Package, border: 'border-black/40' },
          { label: 'Active Entities', value: summary?.totalCustomers || 0, icon: Users, border: 'border-black/20' },
          { label: 'Pipeline Orders', value: summary?.pendingOrders || 0, icon: Activity, border: 'border-[#E5E5E5]' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`industrial-card p-6 border-l-2 ${item.border} bg-white`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="industrial-label !mb-3">{item.label}</p>
                <h3 className="stat-value">{item.value}</h3>
              </div>
              <div className="p-2 bg-black/5 rounded border border-black/10">
                <item.icon className="w-5 h-5 text-black" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="industrial-card p-8 lg:col-span-2 bg-white">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Revenue Trajectory</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full shadow-[0_0_10px_black]"></span>
              <span className="text-[9px] font-black uppercase text-black/40 tracking-widest">Net Revenue (INR)</span>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#666666' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#666666' }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '2px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#000000', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                  labelStyle={{ color: '#999999', fontSize: '9px', fontWeight: '900', marginBottom: '8px', letterSpacing: '0.1em' }}
                  formatter={(val: any) => [formatCurrency(val), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="industrial-card p-8 bg-white">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black mb-10">Sectoral Distribution</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5E5" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  width={100}
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#111111' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5' }}
                  formatter={(val: any) => formatCurrency(val)}
                />
                <Bar dataKey="value" fill="#111111" radius={[0, 2, 2, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 industrial-card p-8 bg-white">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Recent Logistics Activity</h3>
            <button className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] hover:text-black transition-colors">Global History</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="pb-4 text-[9px] font-black text-black/30 uppercase tracking-widest">Serial Info</th>
                  <th className="pb-4 text-[9px] font-black text-black/30 uppercase tracking-widest">Consignee</th>
                  <th className="pb-4 text-[9px] font-black text-black/30 uppercase tracking-widest">Spec</th>
                  <th className="pb-4 text-[9px] font-black text-black/30 uppercase tracking-widest">Valuation</th>
                  <th className="pb-4 text-[9px] font-black text-black/30 uppercase tracking-widest text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((order, i) => (
                  <tr key={i} className="group hover:bg-black/[0.01] transition-colors border-b border-black/5 last:border-0">
                    <td className="py-4 text-[11px] font-black text-black tracking-widest">{order.order_number}</td>
                    <td className="py-4 text-[11px] font-bold text-black/60">{order.customer_name}</td>
                    <td className="py-4 text-[11px] font-bold text-black/60"><span className="px-1.5 py-0.5 bg-black/5 border border-black/10 rounded text-[9px]">{order.product_type}</span></td>
                    <td className="py-4 text-[11px] font-black text-black">{formatCurrency(order.final_amount)}</td>
                    <td className="py-4 text-[10px] font-bold text-black/30 text-right uppercase">{order.order_date.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="industrial-card p-8 bg-white">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black mb-8">Tier 1 Operational Branches</h3>
          <div className="space-y-4">
            {topCustomers.slice(0, 6).map((customer, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-black/5 rounded border border-black/5 hover:border-black/20 transition-all group">
                <div>
                  <p className="text-[11px] font-black text-black tracking-widest group-hover:text-black transition-colors uppercase">{customer.name}</p>
                  <p className="text-[9px] text-black/30 font-black uppercase tracking-widest mt-1">{customer.branch_name || 'PRIMARY HUB'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-black">{formatCurrency(customer.total_spent)}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <div className="w-1 h-1 bg-black rounded-full" />
                    <p className="text-[9px] text-black/40 font-black uppercase tracking-tighter">Rank #{i + 1}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="industrial-card p-8 bg-white">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black mb-10">Executive Sales Quota</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesRepData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#999999' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#999999' }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5' }}
                  formatter={(val: any) => formatCurrency(val)}
                />
                <Bar dataKey="value" fill="#111111" radius={[2, 2, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="industrial-card p-8 bg-white">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black mb-10">Sales by Product</h3>
          <div className="space-y-8">
            {productDist.map((item, idx) => {
              const percentage = (item.value / (summary?.totalOrders || 1)) * 100;
              return (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{item.name}</span>
                    <span className="text-[10px] font-black text-black tracking-widest">{item.value} <span className="text-black/20">ORDERS / {percentage.toFixed(0)}%</span></span>
                  </div>
                  <div className="w-full bg-black/5 h-[3px] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${percentage}%`, opacity: 1 }}
                      transition={{ duration: 1.5, delay: idx * 0.1, ease: "circOut" }}
                      className="h-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
