'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('hanib_user_v2');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('hanib_user_v2', JSON.stringify(data));
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (username, password, role) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username, password, role })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('hanib_user_v2', JSON.stringify(data));
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const updateProfile = async (address, phone) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, address, phone })
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        localStorage.setItem('hanib_user_v2', JSON.stringify(updated));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hanib_user_v2');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
