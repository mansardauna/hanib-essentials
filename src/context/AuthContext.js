'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({ id: session.user.id, ...session.user.user_metadata });
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({ id: session.user.id, ...session.user.user_metadata });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username, password) => {
    try {
      // In Supabase, login requires email. Since our app used 'username', 
      // we'll append a dummy domain if they just enter a username, 
      // OR expect them to enter an email. Let's assume username is formatted as email
      // to keep it simple, or we format it.
      const email = username.includes('@') ? username : `${username}@hanibessentials.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (username, password, role) => {
    try {
      const email = username.includes('@') ? username : `${username}@hanibessentials.com`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://hanib-essentials.vercel.app/',
          data: {
            username,
            role,
            address: '',
            phone: ''
          }
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const updateProfile = async (address, phone) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { address, phone }
      });
      if (error) throw error;
      setUser({ id: data.user.id, ...data.user.user_metadata });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
