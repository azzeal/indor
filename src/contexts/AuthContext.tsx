
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface User {
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
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

  const signUp = async (email: string, password: string, fullName: string) => {
    // For this hardcoded version, we'll just show a message
    toast.error('Registration is not available. Please contact administrator.');
    return { error: { message: 'Registration not available' } };
  };

  const signIn = async (username: string, password: string) => {
    try {
      if (username === 'admin' && password === 'password123') {
        const user = { email: 'admin@indor.com', id: 'admin-1' };
        setUser(user);
        localStorage.setItem('authUser', JSON.stringify(user));
        toast.success('Welcome back, Admin!');
        return { error: null };
      } else {
        const error = { message: 'Invalid username or password' };
        toast.error(error.message);
        return { error };
      }
    } catch (error) {
      console.error('Sign in error:', error);
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
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
