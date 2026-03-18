import * as React from 'react';
import {
  Users, ShoppingCart, BarChart3, Settings,
  ChevronLeft, ChevronRight, Building2, Upload, LogOut, LayoutDashboard, ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: 'dashboard' | 'customers' | 'orders' | 'analytics' | 'import' | 'security';
  setActiveTab: (tab: 'dashboard' | 'customers' | 'orders' | 'analytics' | 'import' | 'security') => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, collapsed, setCollapsed
}) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Control Center', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Intelligence', icon: BarChart3 },
    { id: 'import', label: 'Data Injection', icon: Upload },
    { id: 'security', label: 'Security Module', icon: ShieldCheck },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      className="bg-white text-black h-screen sticky top-0 flex flex-col z-40 border-r border-[#E5E5E5]"
    >
      <div className="h-20 flex items-center px-4 border-b border-[#E5E5E5] overflow-hidden whitespace-nowrap">
        <div className="min-w-[32px] w-8 h-8 bg-black/5 rounded flex items-center justify-center shrink-0 border border-black/10">
          <Building2 className="text-black w-5 h-5" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-3 flex flex-col"
          >
            <span className="font-black tracking-[0.2em] text-sm leading-none text-black">EDGEFLEX</span>
            <span className="text-[7px] text-black/40 font-bold tracking-[0.1em] mt-1">CONNECT & EXPAND</span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-300
                ${isActive
                  ? 'bg-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
                  : 'text-black/40 hover:text-black hover:bg-black/5'}
                overflow-hidden whitespace-nowrap group
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {!collapsed && <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-[#E5E5E5]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-300 text-red-500 hover:bg-red-50 overflow-hidden whitespace-nowrap group mb-2"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-black/40 hover:text-black transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
