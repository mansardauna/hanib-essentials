'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, DollarSign } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'owner')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-[50vh] flex items-center justify-center font-bold text-slate-400">Loading dashboard...</div>;

  return (
    <div className="py-8">
      {children}
    </div>
  );
}
