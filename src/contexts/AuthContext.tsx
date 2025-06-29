
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface User {
  email: string;
  id: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Check hardcoded credentials
      if (email === 'admin' && password === 'password123') {
        const user = { 
          email: 'admin@example.com', 
          id: 'admin-user-id',
          full_name: 'Administrator' 
        };
        
        setUser(user);
        localStorage.setItem('authUser', JSON.stringify(user));
        toast.success('Welcome back, Administrator!');
        return { error: null };
      } else {
        const errorMessage = 'Invalid username or password';
        toast.error(errorMessage);
        return { error: { message: errorMessage } };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Sign in failed');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('authUser');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
