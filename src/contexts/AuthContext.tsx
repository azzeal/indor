
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface User {
  email: string;
  id: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
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

// Simple password hashing function (for demo purposes - in production use proper bcrypt)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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
    try {
      // Hash the password
      const passwordHash = await hashPassword(password);
      
      // Insert new user into our users table
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash: passwordHash,
            full_name: fullName,
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('User with this email already exists');
          return { error: { message: 'User with this email already exists' } };
        }
        toast.error('Registration failed: ' + error.message);
        return { error };
      }

      toast.success('Registration successful! Please sign in.');
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Registration failed');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Hash the password to compare
      const passwordHash = await hashPassword(password);
      
      // Check if user exists with matching email and password
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !userData) {
        const errorMessage = 'Invalid email or password';
        toast.error(errorMessage);
        return { error: { message: errorMessage } };
      }

      const user = { 
        email: userData.email, 
        id: userData.id,
        full_name: userData.full_name 
      };
      
      setUser(user);
      localStorage.setItem('authUser', JSON.stringify(user));
      toast.success(`Welcome back${userData.full_name ? ', ' + userData.full_name : ''}!`);
      return { error: null };
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
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
