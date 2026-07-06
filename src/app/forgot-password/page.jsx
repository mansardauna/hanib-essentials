'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage('');
    setError('');

    const res = await resetPassword(email);
    if (res.success) {
      setMessage('A password reset link has been sent to your email.');
    } else {
      setError(res.error || 'Failed to send reset link.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-brand-100">
        <div className="flex justify-center mb-8">
          <Image src="/images/logo.png" alt="Hanib Logo" width={80} height={80} className="object-cover rounded-full shadow-sm border border-brand-50" />
        </div>
        
        <h2 className="text-2xl font-semibold text-center text-slate-800 mb-2 uppercase tracking-widest">
          Reset Password
        </h2>
        <p className="text-center text-slate-500 mb-8 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100 text-center">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
              placeholder="Enter your email"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Remembered your password?{' '}
            <Link href="/auth" className="text-brand-600 font-semibold hover:text-brand-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
