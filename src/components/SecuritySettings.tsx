import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, UserPlus, Trash2, Mail, Loader2, Share2, Info } from 'lucide-react';
import { dbService } from '../services/db_service';

export const SecuritySettings: React.FC = () => {
  const [permissions, setPermissions] = useState<{ myShares: any[], sharesToMe: any[] }>({
    myShares: [],
    sharesToMe: []
  });
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('READ');
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const data = await dbService.getPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSharing(true);
    try {
      await dbService.addPermission({ email, access_level: accessLevel });
      setEmail('');
      fetchPermissions();
    } catch (error) {
      alert('Failed to share access. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Are you sure you want to revoke this access?')) return;
    try {
      await dbService.deletePermission(id);
      fetchPermissions();
    } catch (error) {
      alert('Failed to revoke access.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Security Module</h1>
        <p className="text-[#666666] text-sm font-medium">Manage cross-account data access and team sharing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Share Access Card */}
        <div className="industrial-card p-6 space-y-6 bg-gradient-to-br from-white to-[#FAFAFA]">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-4">
            <UserPlus className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Share Data Access</h3>
          </div>
          
          <form onSubmit={handleShare} className="space-y-4">
            <div className="space-y-2">
              <label className="industrial-label">Invite User by Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                <input
                  type="email"
                  placeholder="colleague@edgeflex.com"
                  className="industrial-input pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="industrial-label">Access Level</label>
              <select
                className="industrial-input appearance-none bg-white font-bold"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
              >
                <option value="READ">READ ONLY (Viewer)</option>
                <option value="WRITE">WRITE ONLY (Contributor)</option>
                <option value="BOTH">BOTH (Full Access)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={sharing}
              className="w-full industrial-button shadow-sm bg-[#1A1A1A] text-white hover:bg-black py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {sharing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Grant Access'}
            </button>
          </form>

          <div className="bg-[#D1E0FF]/30 border border-[#D1E0FF] p-4 rounded-lg flex gap-3">
            <Info className="w-4 h-4 text-[#0047FF] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed font-medium text-[#0038CC]">
              Users you invite will be able to see all your Customers, Orders, and Analytics in their portal. You can revoke this access at any time.
            </p>
          </div>
        </div>

        {/* Permissions List */}
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1A1A1A]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Active Shares</h3>
            </div>
            <span className="text-[10px] font-bold bg-[#F0F0F0] px-2 py-0.5 rounded text-[#666666]">
              {permissions.myShares.length} GRANTED
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-black/20">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Loading permissions...</span>
            </div>
          ) : permissions.myShares.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Share2 className="w-8 h-8 text-[#E5E5E5] mx-auto" />
              <p className="text-[11px] font-bold text-[#999999] uppercase tracking-wider">No active shares</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {permissions.myShares.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#F0F0F0] bg-white group hover:border-[#1A1A1A]/10 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F8F9FA] flex items-center justify-center group-hover:bg-[#1A1A1A] transition-colors">
                        <Mail className="w-4 h-4 text-[#999999] group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A1A1A]">{p.shared_with_email}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${
                          p.access_level === 'BOTH' ? 'text-[#0047FF]' : 
                          p.access_level === 'WRITE' ? 'text-[#FF9500]' : 'text-[#66B366]'
                        }`}>
                          {p.access_level === 'BOTH' ? 'Full Access' : 
                           p.access_level === 'WRITE' ? 'Write Only' : 'Read Only'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevoke(p.id)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Shared with Me section */}
      {permissions.sharesToMe.length > 0 && (
        <div className="industrial-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3 mb-4">
            <Share2 className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Shared with me</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.sharesToMe.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-[#F0F0F0] bg-[#F8F9FA] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#E5E5E5]">
                  <Mail className="w-4 h-4 text-[#666666]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A1A1A]">{p.owner_email || 'Owner Account'}</p>
                  <p className="text-[10px] font-bold text-[#0047FF] uppercase tracking-widest mt-0.5">READ ONLY</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
