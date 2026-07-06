'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { updatePassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setMessage('');
    setError('');

    const res = await updatePassword(password);
    if (res.success) {
      setMessage('Password updated successfully!');
      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    } else {
      setError(res.error || 'Failed to update password.');
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
          Set New Password
        </h2>
        <p className="text-center text-slate-500 mb-8 text-sm">
          Please enter your new password below.
        </p>

        {message && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100 text-center">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
              placeholder="Enter new password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </main>
  );
}
