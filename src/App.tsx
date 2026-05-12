import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Loader2, BarChart3
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';

// Components
import { Sidebar } from './components/Sidebar';
import { CustomerPortal } from './components/CustomerPortal';
import { CustomerForm } from './components/CustomerForm';
import { CustomerProfile } from './components/CustomerProfile';
import { OrderPortal } from './components/OrderPortal';
import { OrderForm } from './components/OrderForm';
import { OrderProfile } from './components/OrderProfile';
import { Analytics } from './components/Analytics';
import { ImportData } from './components/ImportData';

import { Dashboard } from './components/Dashboard';

type ViewState = 
  | { type: 'dashboard' }
  | { type: 'customers'; sub: 'list' | 'add' | 'profile' | 'edit'; id?: number }
  | { type: 'orders'; sub: 'list' | 'add' | 'profile'; id?: number }
  | { type: 'analytics' }
  | { type: 'import' }
  | { type: 'security' };

import { SecuritySettings } from './components/SecuritySettings';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      <AppContent />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function AppContent() {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<ViewState>({ type: 'dashboard' });
  const [activeTab, setActiveTab] = useState('Intelligence');

  useEffect(() => {
    console.log("[Edgeflex] Running in Client-Side Prototype Mode (Netlify Ready)");
  }, []);

  const renderContent = () => {
    console.log(`Rendering View: ${view.type}, SubView: ${'sub' in view ? view.sub : 'N/A'}`);
    switch (view.type) {
      case 'dashboard':
        return <Dashboard onNavigate={(viewId) => setView({ type: viewId as any, sub: 'list' })} />;
      case 'customers':
        if (view.sub === 'add') return <CustomerForm onBack={() => setView({ type: 'customers', sub: 'list' })} onSuccess={(id) => setView({ type: 'customers', sub: 'profile', id })} />;
        if (view.sub === 'edit') return <CustomerForm editId={view.id} onBack={() => setView({ type: 'customers', sub: 'profile', id: view.id })} onSuccess={(id) => setView({ type: 'customers', sub: 'profile', id })} />;
        if (view.sub === 'profile') return <CustomerProfile customerId={view.id!} onBack={() => setView({ type: 'customers', sub: 'list' })} onEdit={() => setView({ type: 'customers', sub: 'edit', id: view.id })} />;
        return (
          <CustomerPortal 
            onAddCustomer={() => setView({ type: 'customers', sub: 'add' })} 
            onViewProfile={(id) => setView({ type: 'customers', sub: 'profile', id })}
            onEditCustomer={(id) => setView({ type: 'customers', sub: 'edit', id })}
          />
        );
      
      case 'orders':
        if (view.sub === 'add') return <OrderForm onBack={() => setView({ type: 'orders', sub: 'list' })} onSuccess={(id) => setView({ type: 'orders', sub: 'profile', id })} />;
        if (view.sub === 'profile') return <OrderProfile orderId={view.id!} onBack={() => setView({ type: 'orders', sub: 'list' })} />;
        return <OrderPortal onAddOrder={() => setView({ type: 'orders', sub: 'add' })} onViewOrder={(id) => setView({ type: 'orders', sub: 'profile', id })} />;

      case 'analytics':
        return <Analytics />;

      case 'import':
        return <ImportData />;

      case 'security':
        return <SecuritySettings />;
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-[#111111] font-sans selection:bg-black selection:text-white">
      <Sidebar 
        activeTab={view.type as any} 
        setActiveTab={(tab) => setView({ type: tab as any, sub: 'list' })}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-14 border-b border-[#E5E5E5] bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60">
              Edgeflex Status: <span className="text-black">Operational</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-black">ADMIN_SESSION_01</p>
              <p className="text-[8px] font-bold text-black/40 tracking-widest">v4.0.2-industrial</p>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 flex flex-col relative">
          <main className="flex-1 p-6 sm:p-8 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05] flex items-center justify-center pointer-events-none -z-10">
               <div className="w-[80%] max-w-[800px] h-48 bg-gradient-to-r from-black/20 to-black/20 rounded-lg flex items-center justify-center text-black/20 font-bold text-2xl">
                 Edgeflex Logo
               </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={`${view.type}-${(view as any).sub ?? ''}-${(view as any).id ?? ''}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Footer naturally follows content */}
          <footer className="mt-auto h-12 border-t border-[#E5E5E5] bg-white px-6 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-black/40">
            <p>© 2024 Edgeflex Industries. All rights reserved.</p>
            <div className="flex gap-4">
              <p className="hover:text-black cursor-pointer transition-colors">Privacy Protocol</p>
              <p className="hover:text-black cursor-pointer transition-colors">Terminal Terms</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
