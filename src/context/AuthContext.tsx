import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User,
  signOut,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase_config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });

      // Set a timeout to ensure loading completes even if Firebase fails
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 5000);

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('[Edgeflex] Firebase initialization error:', error);
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  };

  const demoLogin = () => {
    // Create a mock user for demo purposes
    const mockUser = {
      uid: 'demo-user-12345',
      email: 'admin@edgeflex.demo',
      displayName: 'Edgeflex Admin',
      isAnonymous: false,
      emailVerified: true,
      phoneNumber: null,
      photoURL: null,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      },
      providerData: [],
      getIdToken: async () => 'demo-token',
      getIdTokenResult: async () => ({ token: 'demo-token', claims: {}, issuedAtTime: new Date().toISOString(), expirationTime: new Date().toISOString(), signInProvider: null }),
      reload: async () => {},
      getDisplayName: () => 'Edgeflex Admin',
      toJSON: () => ({})
    } as any;
    
    setUser(mockUser);
    localStorage.setItem('edgeflex_demo_mode', 'true');
    console.log('[Edgeflex] Demo mode activated - logged in as:', mockUser.email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle, demoLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
