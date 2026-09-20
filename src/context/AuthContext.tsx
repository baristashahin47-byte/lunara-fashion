import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '../types.js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: 'ADMIN' | 'CUSTOMER') => void;
  updateProfile: (data: { name?: string; phone?: string; address?: Address }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lunara_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lunara_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lunara_user');
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const quickDemoLogin = (role: 'ADMIN' | 'CUSTOMER') => {
    if (role === 'ADMIN') {
      setUser({
        id: 'user-admin-1',
        name: 'Lunara Admin',
        email: 'admin@lunarafashion.com',
        phone: '+880 1711-000111',
        role: 'ADMIN',
        createdAt: '2026-01-01T00:00:00Z'
      });
    } else {
      setUser({
        id: 'user-customer-1',
        name: 'Sumaiya Haque',
        email: 'sumaiya@gmail.com',
        phone: '+880 1819-223344',
        role: 'CUSTOMER',
        addresses: [
          {
            id: 'addr-1',
            userId: 'user-customer-1',
            fullName: 'Sumaiya Haque',
            phone: '01819223344',
            division: 'Dhaka',
            district: 'Dhaka',
            upazila: 'Gulshan-1',
            fullAddress: 'Flat 4B, House 12, Road 23, Gulshan-1, Dhaka-1212',
            deliveryZone: 'DHAKA_CITY',
            isDefault: true
          }
        ],
        createdAt: '2026-02-01T10:00:00Z'
      });
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string; address?: Address }) => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
