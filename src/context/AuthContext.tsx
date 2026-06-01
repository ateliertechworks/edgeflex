import React, { createContext, useContext, useEffect, useState } from 'react';

interface SimpleUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials for demo purposes
const VALID_CREDENTIALS = {
  email: 'admin@edgeflex.io',
  password: 'Admin@123'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('edgeflex_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('[Edgeflex] Failed to restore session:', error);
        localStorage.removeItem('edgeflex_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      const newUser: SimpleUser = {
        id: 'user-' + Date.now(),
        email,
        displayName: 'Edgeflex Admin'
      };
      setUser(newUser);
      localStorage.setItem('edgeflex_user', JSON.stringify(newUser));
      console.log('[Edgeflex] User logged in:', email);
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edgeflex_user');
    console.log('[Edgeflex] User logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, login }}>
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
