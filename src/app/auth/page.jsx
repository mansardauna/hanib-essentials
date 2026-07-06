'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, verifyMFALogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (showMFA) {
      // Handle MFA Code Verification
      const res = await verifyMFALogin(mfaCode);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Invalid 2FA code.');
        setIsLoading(false);
      }
      return;
    }

    if (isLogin) {
      const res = await login(username, password);
      if (res.success) {
        if (res.mfaRequired) {
          setShowMFA(true);
          setIsLoading(false);
        } else {
          router.push('/');
        }
      } else {
        setError(res.error);
        setIsLoading(false);
      }
    } else {
      const res = await register(username, password, role);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error);
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-brand-100">
        
        <div className="flex justify-center mb-8">
          <Image src="/images/logo.png" alt="Hanib Logo" width={80} height={80} className="object-cover rounded-full shadow-sm border border-brand-50" />
        </div>

        <h2 className="text-2xl font-semibold text-center text-slate-800 mb-8 uppercase tracking-widest">
          {showMFA ? 'Two-Factor Authentication' : isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-xl mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {showMFA ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 text-center mb-4">
                Enter the 6-digit code from your Authenticator app.
              </p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Authenticator Code</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all font-medium text-slate-800 tracking-widest text-center text-lg"
                  placeholder="123456" 
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  maxLength={6}
                  required 
                />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username / Email</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all font-medium text-slate-800"
                  placeholder="johndoe" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required 
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  {isLogin && (
                    <Link href="/forgot-password" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all font-medium text-slate-800"
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Role</label>
                  <div className="relative">
                    <select 
                      value={role} 
                      onChange={e => setRole(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all font-medium text-slate-800 appearance-none"
                    >
                      <option value="customer">Shopper / Customer</option>
                      <option value="owner">Store Owner</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 mt-4 bg-brand-500 text-white font-bold rounded-xl shadow-sm hover:bg-brand-600 transition-all disabled:opacity-70"
          >
            {isLoading ? 'Processing...' : (showMFA ? 'Verify Code' : (isLogin ? 'Login' : 'Register'))}
          </button>
        </form>
        
        {!showMFA && (
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="text-brand-600 font-bold hover:text-brand-500 hover:underline transition-all"
            >
              {isLogin ? 'Register now' : 'Login instead'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
