'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({ id: session.user.id, ...session.user.user_metadata });
      }
      setLoading(false);
    });

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
      const email = username.includes('@') ? username : `${username}@hanibessentials.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Check if MFA is required
      const { data: { nextLevel }, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (mfaError) throw mfaError;
      
      if (nextLevel === 'aal2') {
        return { success: true, mfaRequired: true };
      }
      
      return { success: true, mfaRequired: false };
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
          data: { username, role, address: '', phone: '' }
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

  // --- Password Recovery ---
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://hanib-essentials.vercel.app/reset-password',
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // --- Multi-Factor Authentication (MFA/2FA) ---
  const enrollMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      return { success: true, id: data.id, totp: data.totp };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyMFAEnrollment = async (factorId, code) => {
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { data, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code
      });
      if (verifyError) throw verifyError;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const unenrollMFA = async (factorId) => {
    try {
      const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyMFALogin = async (code) => {
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      
      const totpFactors = factorsData.totp || factorsData.filter(f => f.factor_type === 'totp' && f.status === 'verified');
      if (!totpFactors || totpFactors.length === 0) throw new Error('No verified TOTP factors found.');
      const factorId = totpFactors[0].id;

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      
      const { data, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code
      });
      if (verifyError) throw verifyError;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, updateProfile, logout, loading,
      resetPassword, updatePassword,
      enrollMFA, verifyMFAEnrollment, unenrollMFA, verifyMFALogin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
