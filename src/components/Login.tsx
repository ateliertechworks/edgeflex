import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../services/firebase_config';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
        <h1 className="text-[20vw] font-black uppercase tracking-tighter">Edgeflex</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="industrial-card w-full max-w-md p-10 bg-white relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-black/10"
      >
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black tracking-[0.2em] uppercase">Security Protocol</h2>
            <p className="text-[10px] text-black/40 uppercase font-bold tracking-widest mt-2">Authenticated access required for admin portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-black/40 uppercase tracking-widest px-1">Access Identity (Email)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
              <input 
                type="email" 
                required
                className="industrial-input pl-12 h-14 bg-black/[0.02] border-black/10 focus:border-black/30 transition-all font-medium"
                placeholder="admin@edgeflex.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-black/40 uppercase tracking-widest px-1">Security Key (Password)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
              <input 
                type="password" 
                required
                className="industrial-input pl-12 h-14 bg-black/[0.02] border-black/10 focus:border-black/30 transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-500 bg-red-50/50 p-4 rounded border border-red-500/10 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[10px] uppercase font-bold tracking-wider">{error}</p>
              </motion.div>
            )}
            {resetSent && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-black bg-black/5 p-4 rounded border border-black/10 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[10px] uppercase font-bold tracking-wider">Reset sequence initiated. Check your inbox.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading}
            className="industrial-btn-primary w-full h-14 flex items-center justify-center gap-3 text-xs font-black tracking-[0.2em]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'INITIALIZE SESSION' : 'REGISTER ENTITY'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="relative py-4 flex items-center">
            <div className="flex-grow border-t border-black/5"></div>
            <span className="flex-shrink mx-4 text-[8px] font-black text-black/20 uppercase tracking-[0.3em]">Secure Gateway</span>
            <div className="flex-grow border-t border-black/5"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 border border-black/10 rounded hover:bg-black/5 transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] hover:text-black transition-colors"
          >
            {isLogin ? "Transition to Registration" : "Return to Session Initialization"}
          </button>
          
          {isLogin && (
            <button 
              onClick={handleResetPassword}
              className="text-[9px] font-bold text-black/20 uppercase tracking-widest hover:text-black/60 transition-colors"
            >
              Recover Access Credentials?
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
